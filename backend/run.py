import uvicorn
import os
import sys

# Ensure UTF-8 output encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure backend root is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
os.environ["PYTHONPATH"] = current_dir

if __name__ == "__main__":
    print("=" * 60)
    print("  EduAdvisor AI - Backend FastAPI Server (Port 8002)")
    print("  API Docs (Swagger UI): http://127.0.0.1:8002/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8002, reload=False)
