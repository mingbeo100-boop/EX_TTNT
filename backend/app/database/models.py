from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    auth_provider = Column(String, default="google")
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    school = Column(String, default="Chưa cập nhật")
    target_exam = Column(String, default="THPT_QG")
    target_score = Column(String, default="27.5+")
    current_level = Column(String, default="Khá (7 - 8.5 điểm)")
    focus_subjects = Column(Text, default=json.dumps(["Toán học", "Vật lý", "Hóa học"]))
    learning_needs = Column(Text, default=json.dumps(["Gợi mở phương pháp giải Socratic", "Luyện đề thi thử trường chuyên"]))
    
    # KPIs - Default cleanly starting from 0
    streak_days = Column(Integer, default=1)
    avg_score = Column(Float, default=0.0)
    study_hours = Column(Float, default=0.0)
    solved_problems = Column(Integer, default=0)

    user = relationship("User", back_populates="profile")

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    target_exam = Column(String, nullable=False)
    current_level = Column(String, nullable=False)
    
    stages_json = Column(Text, nullable=False)
    milestones_json = Column(Text, nullable=False)
    schedule_json = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="roadmaps")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    difficulty = Column(String, default="Trung bình")
    duration = Column(String, default="30 phút")
    status = Column(String, default="pending")  # 'pending' or 'completed'
    score = Column(String, default="+25 XP")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tasks")

class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, index=True, nullable=False)
    otp_code = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Integer, default=0)

class AccessLog(Base):
    __tablename__ = "access_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ip_address = Column(String, nullable=True)
    path = Column(String, nullable=False)
    method = Column(String, default="GET")
    user_id = Column(String, nullable=True)
    user_email = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
