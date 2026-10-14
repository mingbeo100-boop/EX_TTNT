from fastapi import APIRouter, HTTPException, Depends, status, Header
from typing import Optional
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, UserProfile, Roadmap, Task, EmailVerification
from app.models.schemas import (
    UserLogin, UserRegister, GoogleAuthRequest, OnboardingRequest, 
    TokenResponse, UserProfileResponse, SendOtpRequest, VerifyOtpRequest, OtpResponse,
    SmtpConfigRequest, UpdateUserIdentityRequest
)
from app.services.roadmap_engine import roadmap_engine
import jwt
import json
import uuid
import httpx
import random
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication & Profiles"])

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

def profile_to_response(user: User, profile: UserProfile) -> UserProfileResponse:
    return UserProfileResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        school=profile.school if profile else "Chưa cập nhật",
        target_exam=profile.target_exam if profile else "THPT_QG",
        target_score=profile.target_score if profile else "27.5+",
        current_level=profile.current_level if profile else "Khá (7 - 8.5 điểm)",
        focus_subjects=json.loads(profile.focus_subjects) if profile and profile.focus_subjects else ["Toán học", "Vật lý", "Hóa học"],
        learning_needs=json.loads(profile.learning_needs) if profile and profile.learning_needs else ["Gợi mở phương pháp giải Socratic"],
        streak_days=profile.streak_days if profile else 1,
        avg_score=profile.avg_score if profile else 0.0,
        study_hours=profile.study_hours if profile else 0.0,
        solved_problems=profile.solved_problems if profile else 0
    )

@router.post("/google", response_model=TokenResponse)
async def google_auth(auth_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Xử lý Đăng nhập Google thật sự.
    Hỗ trợ id_token thật từ Google Identity Services hoặc thông tin tài khoản Google.
    """
    email = auth_data.email
    full_name = auth_data.full_name
    avatar_url = auth_data.avatar_url

    # Nếu có id_token từ Google -> Xác thực trực tiếp với máy chủ Google
    if auth_data.id_token:
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={auth_data.id_token}")
                if res.status_code == 200:
                    google_info = res.json()
                    email = google_info.get("email", email)
                    full_name = google_info.get("name", full_name)
                    avatar_url = google_info.get("picture", avatar_url)
        except Exception as e:
            print("Google token verification exception:", e)

    if not email:
        raise HTTPException(status_code=400, detail="Không thể xác thực tài khoản Google (thiếu email hợp lệ)")

    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Tạo người dùng mới từ tài khoản Google
        user_id = "user_" + str(uuid.uuid4())[:8]
        user = User(
            id=user_id,
            email=email,
            full_name=full_name or email.split("@")[0],
            avatar_url=avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={email}",
            auth_provider="google"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token({"sub": user.email, "id": user.id, "name": user.full_name})
        return TokenResponse(
            access_token=token,
            user_id=user.id,
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            avatar_url=user.avatar_url,
            needs_onboarding=True,
            profile=None
        )

    # Đã có tài khoản
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    roadmap = db.query(Roadmap).filter(Roadmap.user_id == user.id).first()
    has_roadmap = (roadmap is not None) or (profile is not None and bool(profile.school) and profile.school != "Chưa có")
    needs_onboarding = not has_roadmap
    
    # Cập nhật thông tin mới nhất từ Google nếu có
    if full_name and user.full_name != full_name:
        user.full_name = full_name
    if avatar_url and user.avatar_url != avatar_url:
        user.avatar_url = avatar_url
    db.commit()
    
    token = create_access_token({"sub": user.email, "id": user.id, "name": user.full_name})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        avatar_url=user.avatar_url,
        needs_onboarding=needs_onboarding,
        profile=profile_to_response(user, profile) if profile else None
    )

def send_real_email_otp(to_email: str, otp_code: str) -> bool:
    """Gửi email thật qua SMTP nếu có cấu hình trong môi trường hoặc .env."""
    backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    env_file = os.path.join(backend_root, ".env")

    smtp_host = os.getenv("SMTP_HOST") or "smtp.gmail.com"
    smtp_port = int(os.getenv("SMTP_PORT", "465"))
    smtp_user = os.getenv("SMTP_USER") or "mingbeo100@gmail.com"
    smtp_password = os.getenv("SMTP_PASSWORD") or "iyemugjdkfgnitvc"

    # Đọc thêm từ .env nếu biến môi trường chưa nạp
    if os.path.exists(env_file):
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("SMTP_USER=") and line.split("=", 1)[1].strip():
                        smtp_user = line.split("=", 1)[1].strip()
                    elif line.startswith("SMTP_PASSWORD=") and line.split("=", 1)[1].strip():
                        smtp_password = line.split("=", 1)[1].strip()
                    elif line.startswith("SMTP_HOST=") and line.split("=", 1)[1].strip():
                        smtp_host = line.split("=", 1)[1].strip()
                    elif line.startswith("SMTP_PORT=") and line.split("=", 1)[1].strip():
                        try:
                            smtp_port = int(line.split("=", 1)[1].strip())
                        except:
                            pass
        except Exception as e:
            print("Error reading .env:", e)

    if not (smtp_user and smtp_password):
        smtp_user = "mingbeo100@gmail.com"
        smtp_password = "iyemugjdkfgnitvc"

    try:
        from email.utils import formatdate, make_msgid

        msg = MIMEMultipart("alternative")
        msg["From"] = f"EduAdvisor AI Platform <{smtp_user}>"
        msg["To"] = to_email
        msg["Reply-To"] = smtp_user
        msg["Subject"] = f"[{otp_code}] Mã xác thực tài khoản EduAdvisor AI"
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="gmail.com")

        # 1. Plain text version (Bắt buộc để bộ lọc Spam không đánh dấu rác)
        plain_text = f"""Xin chào,

Bạn đang thực hiện đăng nhập vào hệ sinh thái EduAdvisor AI Platform.
Mã xác thực OTP của bạn là: {otp_code}

Mã này có hiệu lực trong vòng 10 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.

© 2026 EduAdvisor AI Platform.
"""
        msg.attach(MIMEText(plain_text, "plain", "utf-8"))

        # 2. HTML version đẹp mắt
        body = f"""
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px 24px; border-radius: 16px; text-align: center; color: #ffffff; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                <div style="display: inline-block; font-size: 28px; margin-bottom: 8px;">🎓</div>
                <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">EduAdvisor AI Platform</h1>
                <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Hệ thống Cố vấn Học thuật Cá nhân hóa Toàn diện</p>
            </div>
            
            <div style="padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; margin-top: 16px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                <p style="font-size: 15px; margin-top: 0; color: #334155;">Xin chào,</p>
                <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                    Bạn đang thực hiện đăng nhập hoặc xác nhận tài khoản trên hệ thống <strong>EduAdvisor AI</strong>. Dưới đây là mã bảo mật OTP 6 chữ số của bạn:
                </p>
                
                <div style="text-align: center; margin: 28px 0;">
                    <span style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 14px 32px; border-radius: 12px; border: 2px dashed #60a5fa; font-family: 'Courier New', Courier, monospace;">
                        {otp_code}
                    </span>
                </div>
                
                <p style="font-size: 13px; color: #64748b; background: #f1f5f9; padding: 12px 16px; border-radius: 10px; margin-bottom: 0;">
                    ⏱️ Mã xác thực này có hiệu lực trong vòng <strong>10 phút</strong>. Để bảo mật tài khoản, vui lòng không chia sẻ mã này với bất kỳ ai.
                </p>
            </div>

            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
                <p style="margin: 0;">Email này được gửi tự động từ máy chủ EduAdvisor AI Platform.</p>
                <p style="margin: 4px 0 0;">© 2026 EduAdvisor AI • All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(body, "html", "utf-8"))

        # Ưu tiên kết nối SSL cổng 465 để tránh bị chặn bởi ISP/Tường lửa
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=12)
        else:
            try:
                server = smtplib.SMTP(smtp_host, smtp_port, timeout=8)
                server.starttls()
            except Exception:
                # Fallback sang cổng SSL 465 nếu cổng 587 bị ISP chặn
                server = smtplib.SMTP_SSL(smtp_host, 465, timeout=12)

        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        print(f"[SMTP SUCCESS] Đã gửi thành công OTP tới {to_email} qua {smtp_user}!")
        return True
    except Exception as e:
        print("[SMTP ERROR] Không thể gửi email qua SMTP:", e)
        # Thử lại 1 lần nữa qua SMTP_SSL cổng 465
        try:
            server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=12)
            server.login("mingbeo100@gmail.com", "iyemugjdkfgnitvc")
            server.send_message(msg)
            server.quit()
            print(f"[SMTP RETRY SUCCESS] Đã gửi thành công OTP tới {to_email}!")
            return True
        except Exception as retry_err:
            print("[SMTP RETRY ERROR]:", retry_err)
            return False

@router.post("/send-otp", response_model=OtpResponse)
async def send_otp(req: SendOtpRequest, db: Session = Depends(get_db)):
    """Gửi mã OTP 6 số xác thực về hòm thư Gmail."""
    email = req.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Địa chỉ email không hợp lệ")

    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Đánh dấu các mã cũ là đã dùng
    db.query(EmailVerification).filter(EmailVerification.email == email).update({"is_used": 1})

    record = EmailVerification(
        email=email,
        otp_code=otp_code,
        expires_at=expires_at,
        is_used=0
    )
    db.add(record)
    db.commit()

    email_sent = send_real_email_otp(email, otp_code)

    if email_sent:
        msg = f"Mã xác thực 6 số đã được gửi trực tiếp đến hộp thư {email}! Vui lòng mở email (hoặc mục Thư rác/Spam) để lấy mã."
    else:
        msg = f"Đã phát sinh sự cố khi gửi email tới {email}. Vui lòng thử lại sau giây lát."

    # XÓA HOÀN TOÀN dev_otp: Người dùng nhận mã qua email đàng hoàng
    return OtpResponse(
        status="success" if email_sent else "error",
        message=msg,
        dev_otp=None
    )

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    """Xác thực mã OTP 6 số gửi về Gmail và hoàn tất đăng nhập."""
    email = req.email.strip().lower()
    otp_code = req.otp_code.strip()

    record = db.query(EmailVerification).filter(
        EmailVerification.email == email,
        EmailVerification.otp_code == otp_code,
        EmailVerification.is_used == 0,
        EmailVerification.expires_at > datetime.utcnow()
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Mã xác thực không chính xác hoặc đã hết hạn (10 phút).")

    record.is_used = 1
    db.commit()

    # Tìm hoặc tạo người dùng
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user_id = "user_" + str(uuid.uuid4())[:8]
        user = User(
            id=user_id,
            email=email,
            full_name=req.full_name or email.split("@")[0].title(),
            avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={email}",
            auth_provider="gmail"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token({"sub": user.email, "id": user.id, "name": user.full_name})
        return TokenResponse(
            access_token=token,
            user_id=user.id,
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            avatar_url=user.avatar_url,
            needs_onboarding=True,
            profile=None
        )

    # Đã có tài khoản
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    roadmap = db.query(Roadmap).filter(Roadmap.user_id == user.id).first()
    has_roadmap = (roadmap is not None) or (profile is not None and bool(profile.school) and profile.school != "Chưa có")
    needs_onboarding = not has_roadmap

    if req.full_name and user.full_name != req.full_name:
        user.full_name = req.full_name
        db.commit()

    token = create_access_token({"sub": user.email, "id": user.id, "name": user.full_name})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        avatar_url=user.avatar_url,
        needs_onboarding=needs_onboarding,
        profile=profile_to_response(user, profile) if profile else None
    )

@router.post("/config-smtp")
async def config_smtp(req: SmtpConfigRequest):
    """Cấu hình tài khoản gửi Gmail SMTP và kiểm tra kết nối."""
    host = req.smtp_host or "smtp.gmail.com"
    port = req.smtp_port or 587
    user = req.smtp_user.strip()
    pwd = req.smtp_password.strip().replace(" ", "")

    os.environ["SMTP_HOST"] = host
    os.environ["SMTP_PORT"] = str(port)
    os.environ["SMTP_USER"] = user
    os.environ["SMTP_PASSWORD"] = pwd

    # Lưu vào file .env
    backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    env_file = os.path.join(backend_root, ".env")
    lines = []
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            lines = [l for l in f.readlines() if not any(l.startswith(k) for k in ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"])]
    lines.append(f"SMTP_HOST={host}\n")
    lines.append(f"SMTP_PORT={port}\n")
    lines.append(f"SMTP_USER={user}\n")
    lines.append(f"SMTP_PASSWORD={pwd}\n")
    with open(env_file, "w", encoding="utf-8") as f:
        f.writelines(lines)

    # Thử đăng nhập Gmail SMTP
    try:
        server = smtplib.SMTP(host, port, timeout=7)
        server.starttls()
        server.login(user, pwd)
        server.quit()
        return {"status": "success", "message": f"Đã kết nối thành công Gmail SMTP ({user})! Email thật sẽ được gửi từ hòm thư này."}
    except Exception as e:
        return {"status": "error", "message": f"Không thể đăng nhập Gmail SMTP: {str(e)}. Hãy đảm bảo bạn đã bật Xác minh 2 bước và dùng Mật khẩu ứng dụng (App Password 16 số)."}

@router.post("/onboarding", response_model=TokenResponse)
async def submit_onboarding(data: OnboardingRequest, db: Session = Depends(get_db)):
    """
    Khởi tạo Hồ sơ người dùng và tự động sinh Lộ trình học tập & Bài tập cá nhân hóa vào Database.
    """
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        # Nếu chưa có user -> tạo nhanh
        user = User(
            id=data.user_id,
            email=f"{data.user_id}@student.edu.vn",
            full_name=data.full_name,
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            auth_provider="google"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    if data.full_name:
        user.full_name = data.full_name
        db.commit()

    focus_subs = data.focus_subjects or ["Toán học", "Vật lý", "Hóa học"]
    learn_needs = data.learning_needs or ["Gợi mở phương pháp giải Socratic"]
    user_school = data.school or "Chưa cập nhật"
    user_target_exam = data.target_exam or "THPT_QG"
    user_target_score = data.target_score or "27.5+"
    user_current_level = data.current_level or "Khá (7 - 8.5 điểm)"

    # 1. Lưu hoặc cập nhật UserProfile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        profile = UserProfile(
            user_id=user.id,
            school=user_school,
            target_exam=user_target_exam,
            target_score=user_target_score,
            current_level=user_current_level,
            focus_subjects=json.dumps(focus_subs, ensure_ascii=False),
            learning_needs=json.dumps(learn_needs, ensure_ascii=False),
            streak_days=1,
            avg_score=0.0,
            study_hours=0.0,
            solved_problems=0
        )
        db.add(profile)
    else:
        profile.school = user_school
        profile.target_exam = user_target_exam
        profile.target_score = user_target_score
        profile.current_level = user_current_level
        profile.focus_subjects = json.dumps(focus_subs, ensure_ascii=False)
        profile.learning_needs = json.dumps(learn_needs, ensure_ascii=False)

    db.commit()
    db.refresh(profile)

    # 2. Sinh Lộ trình học tập cá nhân hóa & Bài tập hàng ngày tương ứng
    generated = roadmap_engine.generate_roadmap(
        target_exam=user_target_exam,
        current_level=user_current_level,
        target_score=user_target_score,
        focus_subjects=focus_subs
    )

    # Xóa roadmap và tasks cũ của user nếu có
    db.query(Roadmap).filter(Roadmap.user_id == user.id).delete()
    db.query(Task).filter(Task.user_id == user.id).delete()

    # Lưu Roadmap mới
    new_roadmap = Roadmap(
        id=str(uuid.uuid4()),
        user_id=user.id,
        title=generated["title"],
        target_exam=data.target_exam,
        current_level=data.current_level,
        stages_json=json.dumps(generated["stages"], ensure_ascii=False),
        milestones_json=json.dumps(generated["milestones"], ensure_ascii=False),
        schedule_json=json.dumps(generated["schedule"], ensure_ascii=False)
    )
    db.add(new_roadmap)

    # Lưu các bài tập ban đầu
    for t in generated["tasks"]:
        new_task = Task(
            id=t["id"],
            user_id=user.id,
            title=t["title"],
            subject=t["subject"],
            difficulty=t["difficulty"],
            duration=t["duration"],
            status=t["status"],
            score=t["score"]
        )
        db.add(new_task)

    db.commit()

    token = create_access_token({"sub": user.email, "id": user.id, "name": user.full_name})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        avatar_url=user.avatar_url,
        needs_onboarding=False,
        profile=profile_to_response(user, profile)
    )

@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(user_id: str = None, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Lấy thông tin hồ sơ của học viên hiện tại chuẩn xác 100% theo user_id hoặc token."""
    user = None
    if user_id and user_id.strip():
        user = db.query(User).filter(User.id == user_id.strip()).first()

    if not user and authorization and "Bearer " in authorization:
        token = authorization.replace("Bearer ", "").strip()
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            uid = payload.get("id")
            email = payload.get("sub")
            if uid:
                user = db.query(User).filter(User.id == uid).first()
            if not user and email:
                user = db.query(User).filter(User.email == email).first()
        except Exception:
            pass

    if not user:
        raise HTTPException(status_code=401, detail="Không tìm thấy tài khoản người dùng hợp lệ.")

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    return profile_to_response(user, profile)

@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(data: OnboardingRequest, db: Session = Depends(get_db)):
    """Cập nhật mục tiêu và tái tạo lộ trình học tập."""
    return await submit_onboarding(data, db)

@router.post("/update-identity", response_model=TokenResponse)
async def update_user_identity(req: UpdateUserIdentityRequest, db: Session = Depends(get_db)):
    """Cập nhật họ tên và ảnh đại diện của học viên."""
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
    if req.full_name and req.full_name.strip():
        user.full_name = req.full_name.strip()
    if req.avatar_url is not None:
        user.avatar_url = req.avatar_url.strip()
    db.commit()
    db.refresh(user)

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    token = create_access_token({"sub": user.email, "id": user.id, "name": user.full_name})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        avatar_url=user.avatar_url,
        needs_onboarding=False,
        profile=profile_to_response(user, profile) if profile else None
    )

