import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "EduAdvisor AI Backend API"
    VERSION: str = "2.4.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "eduadvisor-super-secret-key-academic-2025")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Admin Credentials & Allowed Emails
    @property
    def ADMIN_USERNAME(self) -> str:
        return os.getenv("ADMIN_USERNAME", "admin")

    @property
    def ADMIN_PASSWORD(self) -> str:
        return os.getenv("ADMIN_PASSWORD", "admin123@")

    @property
    def ADMIN_EMAILS(self) -> List[str]:
        return [
            e.strip().lower() for e in os.getenv("ADMIN_EMAILS", "longtn.24itb@vku.udn.vn,mingbeo100@gmail.com").split(",") if e.strip()
        ]
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    # AI Engine (Google Gemini or Local Academic Advisor Engine)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "gemini-3.1-flash-lite")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./eduadvisor.db")

settings = Settings()
