import os
import sys
import time
import re
import socket
import signal
import atexit
import queue
import threading
import subprocess
import webbrowser
import functools
import urllib.request

# UTF-8 and auto-flush
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
print = functools.partial(print, flush=True)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CLOUDFLARED_EXE = os.path.join(CURRENT_DIR, "cloudflared.exe")
LINK_FILE = os.path.join(CURRENT_DIR, "LINK_DANG_DUNG.txt")

subprocesses = []

def cleanup():
    """Dọn dẹp tất cả các tiến trình con khi dừng."""
    print("\n🛑 Đang dừng các dịch vụ...")
    for p in subprocesses:
        try:
            if sys.platform == "win32":
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(p.pid)], capture_output=True)
            else:
                p.terminate()
        except Exception:
            pass
    print("✅ Đã dừng toàn bộ dịch vụ an toàn.\n")

atexit.register(cleanup)

def signal_handler(sig, frame):
    cleanup()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def kill_dangling_processes():
    """Đảm bảo không còn tiến trình cloudflared cũ nào bị treo."""
    if sys.platform == "win32":
        try:
            subprocess.run(["taskkill", "/F", "/IM", "cloudflared.exe"], capture_output=True)
        except Exception:
            pass

def free_port_if_stuck(port: int):
    """Giải phóng cổng nếu bị tiến trình cũ chiếm dụng mà không phản hồi."""
    if sys.platform != "win32":
        return
    try:
        res = subprocess.run(f"netstat -ano | findstr :{port}", shell=True, capture_output=True, text=True)
        for line in res.stdout.strip().splitlines():
            parts = line.strip().split()
            if len(parts) >= 5 and f":{port}" in parts[1] and parts[3] == "LISTENING":
                pid = parts[-1]
                if pid and pid != "0":
                    subprocess.run(["taskkill", "/F", "/PID", pid], capture_output=True)
    except Exception:
        pass

def get_lan_ip():
    """Lấy địa chỉ IP nội bộ Wi-Fi/LAN."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()

def copy_to_clipboard(text: str):
    """Sao chép đường dẫn vào clipboard Windows."""
    try:
        subprocess.run("clip", input=text, text=True, check=True)
        return True
    except Exception:
        return False

def stream_reader(pipe, q):
    """Đọc dữ liệu từ pipe dòng theo luồng riêng để tránh block."""
    try:
        for line in iter(pipe.readline, ''):
            if not line:
                break
            q.put(line)
    except Exception:
        pass
    finally:
        try:
            pipe.close()
        except Exception:
            pass

def wait_for_internet(timeout=20):
    """Kiểm tra kết nối Internet."""
    print("  [Mạng] Đang kiểm tra kết nối Internet...")
    start = time.time()
    while time.time() - start < timeout:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(2.0)
            s.connect(('8.8.8.8', 53))
            s.close()
            print("  [Mạng] Kết nối Internet đã sẵn sàng! ✅")
            return True
        except Exception:
            time.sleep(1.0)
    print("  [Mạng] Cảnh báo: Chưa thể kết nối Internet sau 20 giây.")
    return False

def is_url_ready(url, timeout=1.5):
    """Kiểm tra dịch vụ đã phản hồi chưa."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status in (200, 302, 307)
    except Exception:
        return False

def start_backend():
    """Đảm bảo Backend FastAPI (Port 8002) đang chạy bản mới nhất."""
    free_port_if_stuck(8002)
    free_port_if_stuck(8000)
    time.sleep(0.3)

    print("  [Backend]  Đang khởi động Backend FastAPI (Port 8002)...")
    backend_dir = os.path.join(CURRENT_DIR, "backend")
    run_file = os.path.join(backend_dir, "run.py")
    
    creation_flags = 0
    if sys.platform == "win32":
        creation_flags = getattr(subprocess, "CREATE_NO_WINDOW", 0x08000000)

    env = os.environ.copy()
    env["PYTHONPATH"] = backend_dir

    p = subprocess.Popen(
        [sys.executable, run_file],
        cwd=backend_dir,
        env=env,
        creationflags=creation_flags
    )
    subprocesses.append(p)

    for _ in range(25):
        time.sleep(0.5)
        if is_url_ready("http://127.0.0.1:8002/api/health"):
            print("  [Backend]  Khởi động thành công! ✅")
            return p
            
    print("  [Backend]  Đang chạy ngầm.")
    return p

def start_frontend():
    """Khởi động Frontend Vite (Port 3000)."""
    free_port_if_stuck(3000)
    time.sleep(0.3)

    frontend_dir = os.path.join(CURRENT_DIR, "frontend")
    node_modules_dir = os.path.join(frontend_dir, "node_modules")

    # Tự động chạy npm install nếu chưa có node_modules khi tải từ GitHub về
    if not os.path.exists(node_modules_dir):
        print("  [Frontend] Chưa có thư mục node_modules. Đang tự động cài đặt gói npm...")
        cmd_install = "npm.cmd install" if sys.platform == "win32" else "npm install"
        subprocess.run(cmd_install, shell=True, cwd=frontend_dir)
        print("  [Frontend] Cài đặt gói npm hoàn tất! ✅")

    print("  [Frontend] Đang khởi động React Vite (Port 3000)...")
    
    creation_flags = 0
    if sys.platform == "win32":
        creation_flags = getattr(subprocess, "CREATE_NO_WINDOW", 0x08000000)

    cmd = "npm.cmd run dev" if sys.platform == "win32" else "npm run dev"
    p = subprocess.Popen(
        cmd,
        shell=True,
        cwd=frontend_dir,
        creationflags=creation_flags
    )
    subprocesses.append(p)

    for _ in range(30):
        time.sleep(0.5)
        if is_url_ready("http://127.0.0.1:3000"):
            print("  [Frontend] Khởi động thành công! ✅")
            return p
            
    print("  [Frontend] Đang chạy ngầm.")
    return p

def disable_quickedit():
    """Tắt chế độ QuickEdit của Windows Console để chống việc nhấp chuột làm treo tiến trình (Select Mode)."""
    if sys.platform == "win32":
        try:
            import ctypes
            kernel32 = ctypes.windll.kernel32
            hStdin = kernel32.GetStdHandle(-10) # STD_INPUT_HANDLE
            mode = ctypes.c_ulong()
            if kernel32.GetConsoleMode(hStdin, ctypes.byref(mode)):
                # ENABLE_QUICK_EDIT_MODE = 0x0040, ENABLE_EXTENDED_FLAGS = 0x0080
                new_mode = (mode.value & ~0x0040) | 0x0080
                kernel32.SetConsoleMode(hStdin, new_mode)
        except Exception:
            pass

def start_cloudflare_tunnel(port=3000):
    """Chạy cloudflared tunnel để đưa web ra Internet."""
    if not os.path.exists(CLOUDFLARED_EXE):
        print(f"  [Online] Không tìm thấy file {CLOUDFLARED_EXE}. Bỏ qua tunnel.")
        return None, None

    print(f"\n🚀 Đang tạo Cloudflare Tunnel (chia sẻ Online)", end="", flush=True)
    kill_dangling_processes()

    creation_flags = 0
    if sys.platform == "win32":
        creation_flags = getattr(subprocess, "CREATE_NO_WINDOW", 0x08000000)

    cmd = [CLOUDFLARED_EXE, "tunnel", "--url", f"http://127.0.0.1:{port}", "--no-autoupdate"]
    
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        creationflags=creation_flags
    )
    subprocesses.append(proc)

    q = queue.Queue()
    t_out = threading.Thread(target=stream_reader, args=(proc.stdout, q), daemon=True)
    t_err = threading.Thread(target=stream_reader, args=(proc.stderr, q), daemon=True)
    t_out.start()
    t_err.start()

    tunnel_url = None
    start_time = time.time()
    last_dot = time.time()
    url_pattern = re.compile(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com')

    while time.time() - start_time < 25:
        if proc.poll() is not None:
            print(" ❌")
            break

        if time.time() - last_dot >= 1.0:
            print(".", end="", flush=True)
            last_dot = time.time()

        try:
            line = q.get(timeout=0.2)
            match = url_pattern.search(line)
            if match:
                tunnel_url = match.group(0)
                print(" ✅")
                break
        except queue.Empty:
            continue

    if not tunnel_url:
        print(" (chưa nhận được link)")

    return proc, tunnel_url

def ensure_dependencies():
    """Kiểm tra và tự động cài đặt thư viện thiếu nếu mới clone từ GitHub về."""
    try:
        import fastapi
        import uvicorn
        import pydantic
    except ImportError:
        print("  [Backend] Phát hiện thiếu thư viện Python. Đang tự động cài đặt từ requirements.txt...")
        req_path = os.path.join(CURRENT_DIR, "backend", "requirements.txt")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", req_path])
        print("  [Backend] Cài đặt thư viện Python hoàn tất! ✅\n")

def main():
    # Vô hiệu hóa QuickEdit mode để nhấp chuột không làm đứng cửa sổ cmd
    disable_quickedit()

    print("=" * 68)
    print("  🎓 EduAdvisor AI - TỰ ĐỘNG KHỞI CHẠY HỆ THỐNG (CLOUDFLARE ONLINE)")
    print("=" * 68)

    # 0. Tự động kiểm tra gói thư viện
    ensure_dependencies()

    # 1. Dọn dẹp tiến trình cũ
    kill_dangling_processes()

    # 2. Khởi động Backend
    start_backend()

    # 3. Khởi động Frontend
    start_frontend()

    lan_ip = get_lan_ip()

    # 4. Khởi tạo Cloudflare Tunnel
    proc, tunnel_url = start_cloudflare_tunnel(port=3000)

    if tunnel_url:
        print("\n" + "=" * 68)
        print("  🎉 WEBSITE ĐÃ ĐƯỢC MỞ TRÊN TRÌNH DUYỆT VỚI LINK CLOUDFLARE:")
        print(f"  👉 [Online Link]  {tunnel_url}")
        print(f"  👉 [Localhost]   http://localhost:3000")
        print(f"  👉 [Wi-Fi/LAN]    http://{lan_ip}:3000")
        print(f"  👉 [Swagger API] http://127.0.0.1:8002/docs")
        print("=" * 68)
        
        # Lưu vào file LINK_DANG_DUNG.txt
        with open(LINK_FILE, "w", encoding="utf-8") as f:
            f.write(f"Link EduAdvisor AI Online: {tunnel_url}\n")
            f.write(f"Thời gian tạo: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Link Localhost: http://localhost:3000\n")
            f.write(f"Link Wi-Fi / LAN: http://{lan_ip}:3000\n")
            f.write(f"Link API Docs: http://127.0.0.1:8002/docs\n")

        # Copy vào clipboard
        if copy_to_clipboard(tunnel_url):
            print("  📋 Đã tự động sao chép link Cloudflare vào bộ nhớ tạm (Clipboard)!")

        # Mở TRÌNH DUYỆT BẰNG LINK CLOUDFLARE
        print(f"  🌐 Đang tự động mở link Cloudflare trên trình duyệt...")
        webbrowser.open(tunnel_url)
    else:
        print("\n⚠️ Không lấy được link Cloudflare. Đang mở qua Localhost:")
        print(f"  👉 Localhost: http://localhost:3000")
        webbrowser.open("http://localhost:3000")

    print("\n💡 Giữ cửa sổ này mở để duy trì ứng dụng hoạt động. Nhấn Ctrl+C để dừng.")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
