from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import jwt
from datetime import datetime, timedelta
import os
import time

from app.core.config import settings
from app.database.session import get_db, DB_PATH
from app.database.models import User, UserProfile, Task, Roadmap, EmailVerification, AccessLog

router = APIRouter(prefix="/admin", tags=["Admin Management"])

# Chống dò mật khẩu (Brute-force protection)
FAILED_ATTEMPTS: Dict[str, Dict[str, Any]] = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_SECONDS = 900  # 15 phút

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    status: str
    token: str
    message: str
    admin_name: str
    expires_in_hours: int

class VisitLogRequest(BaseModel):
    path: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None

def create_admin_jwt(username: str) -> str:
    """Tạo JWT Token có hạn 2 giờ cho phiên Quản trị viên."""
    expire = datetime.utcnow() + timedelta(hours=2)
    payload = {
        "sub": username,
        "role": "admin",
        "exp": expire
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def verify_admin_auth(authorization: Optional[str] = Header(None)):
    """Kiểm tra và giải mã JWT Token của Quản trị viên."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Yêu cầu đăng nhập Quản trị viên (Admin)")
    
    token = authorization.replace("Bearer ", "").strip()
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Tài khoản không có đặc quyền Quản trị.")
        return True
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Phiên đăng nhập quản trị đã hết hạn (2 giờ). Vui lòng đăng nhập lại.")
    except Exception:
        raise HTTPException(status_code=403, detail="Phiên đăng nhập quản trị không hợp lệ.")

@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(req: AdminLoginRequest, request: Request, db: Session = Depends(get_db)):
    """Xác thực đăng nhập Quản trị viên với cơ chế chống tấn công Brute-force."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()

    now = time.time()
    # Kiểm tra IP có đang bị khóa do nhập sai nhiều lần không
    attempt_info = FAILED_ATTEMPTS.get(client_ip)
    if attempt_info:
        if attempt_info["count"] >= MAX_FAILED_ATTEMPTS:
            remaining = int(attempt_info["lock_until"] - now)
            if remaining > 0:
                raise HTTPException(
                    status_code=429, 
                    detail=f"Phát hiện đăng nhập sai quá {MAX_FAILED_ATTEMPTS} lần! Địa chỉ IP {client_ip} bị tạm khóa {remaining // 60 + 1} phút để bảo vệ hệ thống."
                )
            else:
                # Đã hết thời gian khóa -> reset
                FAILED_ATTEMPTS.pop(client_ip, None)

    u = req.username.strip()
    p = req.password.strip()
    
    # Tự động nạp lại .env mới nhất nếu có cập nhật cấu hình
    try:
        from dotenv import load_dotenv
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
        load_dotenv(env_file, override=True)
    except Exception:
        pass

    # Kiểm tra với thông tin trong cấu hình .env
    expected_u = settings.ADMIN_USERNAME.strip()
    expected_p = settings.ADMIN_PASSWORD.strip()

    if u == expected_u and p == expected_p:
        # Xóa lịch sử sai nếu đăng nhập thành công
        FAILED_ATTEMPTS.pop(client_ip, None)
        token = create_admin_jwt(u)
        
        # Ghi log đăng nhập thành công
        log = AccessLog(
            ip_address=client_ip,
            path="/api/admin/login",
            method="ADMIN_LOGIN_SUCCESS",
            user_id="admin",
            user_email=f"admin_{u}",
            user_agent=request.headers.get("user-agent", "Unknown")[:255],
            created_at=datetime.utcnow()
        )
        db.add(log)
        db.commit()

        return AdminLoginResponse(
            status="success",
            token=token,
            message="Đăng nhập Quản trị viên thành công!",
            admin_name="Quản Trị Viên Hệ Thống",
            expires_in_hours=2
        )

    # Đăng nhập sai -> Tăng số lần vi phạm
    if not attempt_info:
        FAILED_ATTEMPTS[client_ip] = {"count": 1, "lock_until": 0}
    else:
        attempt_info["count"] += 1
        if attempt_info["count"] >= MAX_FAILED_ATTEMPTS:
            attempt_info["lock_until"] = now + LOCKOUT_SECONDS

    # Ghi log cảnh báo vào DB
    failed_log = AccessLog(
        ip_address=client_ip,
        path="/api/admin/login",
        method="ADMIN_LOGIN_FAILED",
        user_agent=request.headers.get("user-agent", "Unknown")[:255],
        created_at=datetime.utcnow()
    )
    db.add(failed_log)
    db.commit()

    remaining_attempts = max(0, MAX_FAILED_ATTEMPTS - FAILED_ATTEMPTS[client_ip]["count"])
    if remaining_attempts == 0:
        raise HTTPException(
            status_code=429,
            detail=f"Nhập sai mật khẩu 5 lần! IP {client_ip} đã bị khóa trong 15 phút."
        )
    raise HTTPException(
        status_code=401, 
        detail=f"Tài khoản hoặc mật khẩu Quản trị không chính xác! (Còn {remaining_attempts} lần thử)"
    )

@router.get("/check-permission")
async def check_admin_permission(authorization: Optional[str] = Header(None)):
    """Kiểm tra quyền quản trị viên nhanh cho frontend."""
    if not authorization or not authorization.startswith("Bearer "):
        return {"is_admin": False}
    token = authorization.replace("Bearer ", "").strip()
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("role") == "admin":
            return {"is_admin": True}
        # Hoặc nếu là email trong danh sách ADMIN_EMAILS
        email = (payload.get("sub") or "").lower().strip()
        if email and email in settings.ADMIN_EMAILS:
            return {"is_admin": True}
    except Exception:
        pass
    return {"is_admin": False}

@router.post("/log-visit")
async def log_page_visit(req: VisitLogRequest, request: Request, db: Session = Depends(get_db)):
    """Ghi nhận lượt truy cập trang từ người dùng vào Database."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    # Lấy IP từ forwarded header nếu chạy qua Cloudflare tunnel
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()

    ua = request.headers.get("user-agent", "Unknown")[:255]

    log_entry = AccessLog(
        ip_address=client_ip,
        path=req.path,
        method="PAGE_VIEW",
        user_id=req.user_id,
        user_email=req.user_email,
        user_agent=ua,
        created_at=datetime.utcnow()
    )
    db.add(log_entry)
    db.commit()
    return {"status": "ok"}

@router.get("/stats")
async def get_admin_stats(db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin_auth)):
    """Xem tổng quan dữ liệu toàn hệ thống & vị trí Database."""
    db_file_path = os.path.abspath(DB_PATH)
    db_size_bytes = os.path.getsize(db_file_path) if os.path.exists(db_file_path) else 0

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_profiles = db.query(func.count(UserProfile.id)).scalar() or 0
    total_tasks_completed = db.query(func.count(Task.id)).filter(Task.status == "completed").scalar() or 0
    total_tasks = db.query(func.count(Task.id)).scalar() or 0
    total_hours = db.query(func.sum(UserProfile.study_hours)).scalar() or 0.0
    total_visits = db.query(func.count(AccessLog.id)).scalar() or 0
    total_otps = db.query(func.count(EmailVerification.id)).scalar() or 0

    return {
        "status": "success",
        "database": {
            "location": db_file_path,
            "size_kb": round(db_size_bytes / 1024, 2),
            "tables": ["users", "user_profiles", "roadmaps", "tasks", "email_verifications", "access_logs"]
        },
        "metrics": {
            "total_users": total_users,
            "total_profiles": total_profiles,
            "total_tasks": total_tasks,
            "total_tasks_completed": total_tasks_completed,
            "total_study_hours": round(total_hours, 1),
            "total_visits": total_visits,
            "total_otps": total_otps
        }
    }

@router.get("/users")
async def get_all_users_for_admin(db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin_auth)):
    """Lấy danh sách tất cả tài khoản học viên và hồ sơ trong Database."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        p = u.profile
        result.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "auth_provider": u.auth_provider,
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M:%S") if u.created_at else None,
            "school": p.school if p else "Chưa có",
            "target_exam": p.target_exam if p else "Chưa có",
            "target_score": p.target_score if p else "Chưa có",
            "current_level": p.current_level if p else "Chưa có",
            "study_hours": p.study_hours if p else 0.0,
            "solved_problems": p.solved_problems if p else 0,
            "streak_days": p.streak_days if p else 0
        })
    return result

@router.get("/access-logs")
async def get_access_logs(limit: int = 150, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin_auth)):
    """Xem danh sách các lượt truy cập trang web (IP, URL, Thời gian, Thiết bị)."""
    logs = db.query(AccessLog).order_by(AccessLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "ip_address": l.ip_address,
            "path": l.path,
            "method": l.method,
            "user_id": l.user_id,
            "user_email": l.user_email,
            "user_agent": l.user_agent,
            "created_at": l.created_at.strftime("%Y-%m-%d %H:%M:%S") if l.created_at else None
        }
        for l in logs
    ]

@router.get("/otps")
async def get_otp_history(limit: int = 100, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin_auth)):
    """Xem lịch sử phát sinh mã OTP xác thực email."""
    records = db.query(EmailVerification).order_by(EmailVerification.created_at.desc()).limit(limit).all()
    return [
        {
            "id": r.id,
            "email": r.email,
            "otp_code": r.otp_code,
            "is_used": bool(r.is_used),
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else None,
            "expires_at": r.expires_at.strftime("%Y-%m-%d %H:%M:%S") if r.expires_at else None
        }
        for r in records
    ]
