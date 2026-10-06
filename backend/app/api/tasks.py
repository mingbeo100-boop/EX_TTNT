from fastapi import APIRouter, Depends, Query, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import jwt
from app.core.config import settings
from app.database.session import get_db
from app.database.models import Task, User, UserProfile
from app.models.schemas import TaskItemSchema, TaskToggleRequest, TaskCreateRequest
import uuid

router = APIRouter(prefix="/tasks", tags=["Daily Tasks & Evaluation"])

@router.get("", response_model=List[TaskItemSchema])
async def get_tasks(user_id: str = Query(None), authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Lấy danh sách bài tập hàng ngày từ Database."""
    user = None
    if user_id and user_id.strip():
        user = db.query(User).filter(User.id == user_id.strip()).first()

    if not user and authorization and "Bearer " in authorization:
        token = authorization.replace("Bearer ", "").strip()
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            uid = payload.get("id")
            email = payload.get("sub")
            if uid:
                user = db.query(User).filter(User.id == uid).first()
            if not user and email:
                user = db.query(User).filter(User.email == email).first()
        except Exception:
            pass

    if not user:
        return []

    tasks = db.query(Task).filter(Task.user_id == user.id).all()
    if not tasks:
        # Tạo bài tập mẫu nếu chưa có
        default_tasks = [
            {"title": "Luyện lại câu 48 Chuyên Sư Phạm: Tích phân hàm ẩn", "subject": "Toán học", "difficulty": "Khó", "duration": "30 phút", "status": "completed", "score": "+35 XP"},
            {"title": "Làm 5 bài tập tương tự: Hàm ẩn đề Chuyên Lam Sơn 2024", "subject": "Toán học", "difficulty": "Vận dụng cao", "duration": "45 phút", "status": "pending", "score": "+40 XP"},
            {"title": "Chuyên đề Giao thoa Ánh sáng trắng & bài toán vân trùng", "subject": "Vật lý 12", "difficulty": "Trung bình", "duration": "40 phút", "status": "pending", "score": "+25 XP"},
            {"title": "Thực hành hỏi bài cùng Cố vấn AI Dr. Minerva", "subject": "AI Advisor", "difficulty": "Dễ", "duration": "15 phút", "status": "pending", "score": "+15 XP"}
        ]
        for t in default_tasks:
            new_t = Task(
                id=str(uuid.uuid4()),
                user_id=user.id,
                title=t["title"],
                subject=t["subject"],
                difficulty=t["difficulty"],
                duration=t["duration"],
                status=t["status"],
                score=t["score"]
            )
            db.add(new_t)
        db.commit()
        tasks = db.query(Task).filter(Task.user_id == user.id).all()

    return [
        TaskItemSchema(
            id=t.id,
            title=t.title,
            subject=t.subject,
            difficulty=t.difficulty,
            duration=t.duration,
            status=t.status,
            score=t.score
        )
        for t in tasks
    ]

@router.post("/toggle")
async def toggle_task(req: TaskToggleRequest, db: Session = Depends(get_db)):
    """Lưu trạng thái hoàn thành bài tập vào Database."""
    task = db.query(Task).filter(Task.id == req.task_id).first()
    if task:
        task.status = req.status
        # Cập nhật số bài đã giải và giờ học trong UserProfile
        profile = db.query(UserProfile).filter(UserProfile.user_id == task.user_id).first()
        if profile:
            if req.status == "completed":
                profile.solved_problems = (profile.solved_problems or 0) + 1
                profile.study_hours = round((profile.study_hours or 0.0) + 0.5, 1)
            else:
                profile.solved_problems = max(0, (profile.solved_problems or 0) - 1)
                profile.study_hours = max(0.0, round((profile.study_hours or 0.0) - 0.5, 1))
        db.commit()
        db.refresh(task)
        return {
            "status": "success",
            "task": {
                "id": task.id,
                "title": task.title,
                "status": task.status
            }
        }
    return {"status": "not_found"}

@router.post("/create", response_model=TaskItemSchema)
async def create_task(
    req: TaskCreateRequest, 
    user_id: str = Query(None), 
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Thêm một bài tập mới do người dùng tự đặt ra."""
    user = None
    if user_id and user_id.strip():
        user = db.query(User).filter(User.id == user_id.strip()).first()
    if not user and authorization and "Bearer " in authorization:
        token = authorization.replace("Bearer ", "").strip()
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            uid = payload.get("id")
            email = payload.get("sub")
            if uid:
                user = db.query(User).filter(User.id == uid).first()
            if not user and email:
                user = db.query(User).filter(User.email == email).first()
        except Exception:
            pass

    new_task = Task(
        id=str(uuid.uuid4()),
        user_id=user.id if user else "user_default",
        title=req.title,
        subject=req.subject,
        difficulty=req.difficulty,
        duration=req.duration,
        status="pending",
        score="+20 XP"
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return TaskItemSchema(
        id=new_task.id,
        title=new_task.title,
        subject=new_task.subject,
        difficulty=new_task.difficulty,
        duration=new_task.duration,
        status=new_task.status,
        score=new_task.score
    )

@router.get("/radar")
async def get_cognitive_radar(
    user_id: str = Query(None), 
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Biểu đồ radar năng lực cá nhân."""
    user = None
    if user_id and user_id.strip():
        user = db.query(User).filter(User.id == user_id.strip()).first()
    if not user and authorization and "Bearer " in authorization:
        token = authorization.replace("Bearer ", "").strip()
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            uid = payload.get("id")
            email = payload.get("sub")
            if uid:
                user = db.query(User).filter(User.id == uid).first()
            if not user and email:
                user = db.query(User).filter(User.email == email).first()
        except Exception:
            pass

    name = user.full_name if user else "Học viên"
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first() if user else None
    benchmark = profile.target_score if profile else "8.5+"

    return {
        "student": name,
        "targetBenchmark": f"Chuẩn đầu vào {benchmark}",
        "axes": [
            {"name": "Tư duy Logic", "score": 92, "benchmark": 85},
            {"name": "Giải quyết vấn đề", "score": 86, "benchmark": 80},
            {"name": "Tốc độ làm bài", "score": 78, "benchmark": 78},
            {"name": "Độ chính xác", "score": 90, "benchmark": 82},
            {"name": "Kiến thức nền tảng", "score": 95, "benchmark": 90}
        ]
    }
