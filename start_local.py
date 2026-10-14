import os
import sys
import time
import socket
import signal
import atexit
import subprocess
import webbrowser
import functools
import urllib.request

# UTF-8 and auto-flush
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
print = functools.partial(print, flush=True)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
subprocesses = []

def disable_quickedit():
    """Tắt chế độ QuickEdit của Windows Console để chống nhấp chuột làm treo tiến trình."""
    if sys.platform == "win32":
        try:
            import ctypes
            kernel32 = ctypes.windll.kernel32
            hStdin = kernel32.GetStdHandle(-10) # STD_INPUT_HANDLE
            mode = ctypes.c_ulong()
            if kernel32.GetConsoleMode(hStdin, ctypes.byref(mode)):
                new_mode = (mode.value & ~0x0040) | 0x0080
                kernel32.SetConsoleMode(hStdin, new_mode)
        except Exception:
            pass

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

def free_port_if_stuck(port: int):
    """Giải phóng cổng nếu bị tiến trình cũ chiếm dụng."""
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

def is_url_ready(url, timeout=1.5):
    """Kiểm tra dịch vụ đã phản hồi chưa."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status in (200, 302, 307)
    except Exception:
        return False

def ensure_dependencies():
    """Tự động kiểm tra và cài đặt thư viện thiếu khi vừa clone từ GitHub về."""
    try:
        import fastapi
        import uvicorn
        import pydantic
    except ImportError:
        print("  [Backend] Phát hiện thiếu thư viện Python. Đang tự động cài đặt từ requirements.txt...")
        req_path = os.path.join(CURRENT_DIR, "backend", "requirements.txt")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", req_path])
        print("  [Backend] Cài đặt thư viện Python hoàn tất! ✅\n")

def start_backend():
    """Khởi động Backend FastAPI (Port 8002)."""
    free_port_if_stuck(8002)
    free_port_if_stuck(8000)
    time.sleep(0.3)

    print("  [1/2] Đang khởi động Backend FastAPI (Port 8002)...")
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
            print("  [Backend] Khởi động thành công! ✅")
            return p
            
    print("  [Backend] Đang chạy ngầm.")
    return p

def start_frontend():
    """Khởi động Frontend React Vite (Port 3000)."""
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

    print("  [2/2] Đang khởi động React Vite Frontend (Port 3000)...")
    
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

def main():
    disable_quickedit()

    print("=" * 70)
    print("  🎓 EDUADVISOR AI - HỆ THỐNG CỐ VẤN HỌC THUẬT & LUYỆN THI (AI_EX)")
    print("  🏫 Trường: ĐH CNTT & Truyền thông Việt - Hàn (VKU) - ĐH Đà Nẵng")
    print("  📌 Chế độ: KHỞI CHẠY CỤC BỘ (LOCALHOST) CHO GIẢNG VIÊN CHẤM THI")
    print("=" * 70)
    print()

    # 1. Kiểm tra gói phụ thuộc
    ensure_dependencies()

    # 2. Khởi động Backend
    start_backend()

    # 3. Khởi động Frontend
    start_frontend()

    lan_ip = get_lan_ip()

    # 4. Hiển thị thông tin và TỰ ĐỘNG MỞ TRÌNH DUYỆT LOCALHOST
    print("\n" + "=" * 70)
    print("  🎉 HỆ THỐNG ĐÃ SẴN SÀNG VÀ ĐANG MỞ TRÊN TRÌNH DUYỆT WEB:")
    print(f"  👉 [Giao diện Web]     http://localhost:3000")
    print(f"  👉 [Tài liệu API Docs] http://127.0.0.1:8002/docs")
    print(f"  👉 [Truy cập LAN Wi-Fi] http://{lan_ip}:3000")
    print("=" * 70)

    print("\n  🌐 Đang tự động mở trình duyệt: http://localhost:3000 ...")
    webbrowser.open("http://localhost:3000")

    print("\n💡 Hướng dẫn trải nghiệm nhanh cho Hội đồng chấm thi:")
    print("  1. Trên màn hình Đăng nhập, bấm nút: 'Dùng thử nhanh không cần mật khẩu'")
    print("  2. Trải nghiệm 5 màn hình: Landing, Dashboard, Chat Socratic, Roadmap, Space Arcade.")
    print("\n💡 Giữ cửa sổ này mở trong suốt buổi chấm thi. Nhấn Ctrl+C để dừng.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
