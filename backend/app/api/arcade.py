from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

from app.database.session import get_db
from app.database.models import ArcadeScore

router = APIRouter(prefix="/arcade", tags=["Arcade Mini-Game"])

# Các cao thủ trường chuyên chuẩn mực ban đầu
BENCHMARK_LEADERBOARD = [
    {
        "id": "bm_1",
        "player_name": "Trần Minh Đức",
        "school": "THPT Chuyên KHTN Hà Nội",
        "target_score": "29.25đ",
        "score": 9850,
        "traps_destroyed": 48,
        "time_alive_str": "15:20"
    },
    {
        "id": "bm_2",
        "player_name": "Lê Hoàng Nam",
        "school": "THPT Chuyên Chu Văn An",
        "target_score": "28.80đ",
        "score": 8200,
        "traps_destroyed": 39,
        "time_alive_str": "12:45"
    },
    {
        "id": "bm_3",
        "player_name": "Nguyễn Mai Anh",
        "school": "THPT Chuyên Lê Hồng Phong TP.HCM",
        "target_score": "28.50đ",
        "score": 7350,
        "traps_destroyed": 34,
        "time_alive_str": "10:30"
    },
    {
        "id": "bm_4",
        "player_name": "Phạm Quốc Bảo",
        "school": "THPT Chuyên Quốc Học Huế",
        "target_score": "28.25đ",
        "score": 6100,
        "traps_destroyed": 29,
        "time_alive_str": "08:15"
    },
    {
        "id": "bm_5",
        "player_name": "Đỗ Thu Trang",
        "school": "THPT Chuyên Trần Phú Hải Phòng",
        "target_score": "28.00đ",
        "score": 5450,
        "traps_destroyed": 25,
        "time_alive_str": "06:50"
    },
    {
        "id": "bm_6",
        "player_name": "Vũ Hoàng Quân",
        "school": "THPT Chuyên Lam Sơn Thanh Hóa",
        "target_score": "27.75đ",
        "score": 4800,
        "traps_destroyed": 21,
        "time_alive_str": "05:30"
    }
]

def ensure_seeded(db: Session):
    """Tự động khởi tạo dữ liệu chuẩn mực nếu bảng xếp hạng chưa có dữ liệu."""
    count = db.query(ArcadeScore).count()
    if count == 0:
        for item in BENCHMARK_LEADERBOARD:
            rec = ArcadeScore(
                id=item["id"],
                user_id=None,
                player_name=item["player_name"],
                school=item["school"],
                target_score=item["target_score"],
                score=item["score"],
                traps_destroyed=item["traps_destroyed"],
                time_alive_str=item["time_alive_str"],
                created_at=datetime.utcnow()
            )
            db.add(rec)
        db.commit()

class ArcadeScoreSubmit(BaseModel):
    user_id: Optional[str] = None
    player_name: str
    school: Optional[str] = None
    target_score: Optional[str] = None
    score: int
    traps_destroyed: int = 0
    time_alive_str: str = "00:00"

def format_leaderboard(records, current_user_id: Optional[str] = None, current_player_name: Optional[str] = None):
    results = []
    clean_user_name = current_player_name.strip().lower() if current_player_name else None
    clean_user_id = current_user_id.strip() if current_user_id else None

    for idx, r in enumerate(records):
        is_current = False
        if clean_user_id and r.user_id and r.user_id.strip() == clean_user_id:
            is_current = True
        elif clean_user_name and r.player_name and r.player_name.strip().lower() == clean_user_name:
            is_current = True

        results.append({
            "rank": idx + 1,
            "id": r.id,
            "name": r.player_name,
            "school": r.school or "Thí sinh tự do",
            "targetScore": r.target_score or "28.0+",
            "score": r.score,
            "trapsDestroyed": r.traps_destroyed,
            "timeAliveStr": r.time_alive_str,
            "isCurrentUser": is_current,
            "createdAt": r.created_at.isoformat() if r.created_at else None
        })
    return results

@router.get("/leaderboard")
async def get_leaderboard(
    current_user_id: Optional[str] = Query(None),
    current_player_name: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lấy danh sách Bảng Xếp Hạng toàn hệ thống (Top điểm số thực tế từ DB của tất cả người chơi)."""
    ensure_seeded(db)
    records = db.query(ArcadeScore).order_by(ArcadeScore.score.desc()).limit(limit).all()
    leaderboard = format_leaderboard(records, current_user_id, current_player_name)
    return {
        "status": "success",
        "total": len(leaderboard),
        "leaderboard": leaderboard
    }

@router.post("/score")
async def submit_score(
    payload: ArcadeScoreSubmit,
    db: Session = Depends(get_db)
):
    """Lưu và đồng bộ điểm số thực tế của người chơi vào cơ sở dữ liệu hệ thống."""
    ensure_seeded(db)
    
    clean_name = payload.player_name.strip() if payload.player_name else "Sĩ tử ẩn danh"
    clean_uid = payload.user_id.strip() if payload.user_id else None

    # Tìm bản ghi người chơi đã từng chơi trước đó (theo user_id hoặc theo tên)
    existing = None
    if clean_uid:
        existing = db.query(ArcadeScore).filter(ArcadeScore.user_id == clean_uid).first()
    
    if not existing and clean_name:
        existing = db.query(ArcadeScore).filter(ArcadeScore.player_name == clean_name).first()

    if existing:
        # Giữ điểm kỷ lục cao nhất của người chơi
        if payload.score >= existing.score:
            existing.score = payload.score
            existing.traps_destroyed = payload.traps_destroyed
            existing.time_alive_str = payload.time_alive_str
            if payload.school:
                existing.school = payload.school
            if payload.target_score:
                existing.target_score = payload.target_score
            existing.updated_at = datetime.utcnow()
        if clean_uid and not existing.user_id:
            existing.user_id = clean_uid
    else:
        new_record = ArcadeScore(
            id=f"arcade_{uuid.uuid4().hex[:12]}",
            user_id=clean_uid,
            player_name=clean_name,
            school=payload.school or "Thí sinh tự do",
            target_score=payload.target_score or "28.0+",
            score=max(0, payload.score),
            traps_destroyed=payload.traps_destroyed,
            time_alive_str=payload.time_alive_str,
            created_at=datetime.utcnow()
        )
        db.add(new_record)

    db.commit()

    # Trả về bảng xếp hạng mới nhất cập nhật ngay lập tức
    records = db.query(ArcadeScore).order_by(ArcadeScore.score.desc()).limit(50).all()
    leaderboard = format_leaderboard(records, clean_uid, clean_name)

    return {
        "status": "success",
        "message": "Đã lưu thành tích lên Bảng Xếp Hạng toàn hệ thống!",
        "leaderboard": leaderboard
    }
