from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, chat, roadmap, tasks, documents, admin, arcade
from app.database.session import init_db, SessionLocal
from app.database.models import AccessLog
from datetime import datetime

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API cho Nền tảng Cố vấn Học thuật AI EduAdvisor với tính năng Streaming LLM, RAG và Lộ trình học tập."
)

@app.on_event("startup")
def on_startup():
    init_db()

# Middleware ghi nhận lưu lượng truy cập
@app.middleware("http")
async def log_access_middleware(request: Request, call_next):
    # Bỏ qua các endpoint tĩnh hoặc docs
    path = request.url.path
    if not any(path.startswith(prefix) for prefix in ["/docs", "/openapi.json", "/favicon.ico"]):
        try:
            client_ip = request.client.host if request.client else "127.0.0.1"
            forwarded = request.headers.get("x-forwarded-for")
            if forwarded:
                client_ip = forwarded.split(",")[0].strip()

            ua = request.headers.get("user-agent", "Unknown")[:255]
            
            # Ghi nhận vào DB
            db = SessionLocal()
            try:
                log_entry = AccessLog(
                    ip_address=client_ip,
                    path=path,
                    method=request.method,
                    user_agent=ua,
                    created_at=datetime.utcnow()
                )
                db.add(log_entry)
                db.commit()
            finally:
                db.close()
        except Exception:
            pass

    response = await call_next(request)
    return response

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(roadmap.router, prefix=settings.API_V1_STR)
app.include_router(tasks.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(arcade.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "message": "EduAdvisor AI Backend API is running successfully."
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "ai_engine": "Gemini Streaming & Academic Socratic Inference",
        "rag_status": "active"
    }
