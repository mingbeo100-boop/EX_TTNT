from typing import Optional, List, Dict, Any
from pydantic import BaseModel

# Auth & User Schemas
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    target_exam: Optional[str] = "thpt"

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    id_token: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class SendOtpRequest(BaseModel):
    email: str

class VerifyOtpRequest(BaseModel):
    email: str
    otp_code: str
    full_name: Optional[str] = None

class OtpResponse(BaseModel):
    status: str
    message: str
    dev_otp: Optional[str] = None

class SmtpConfigRequest(BaseModel):
    smtp_user: str
    smtp_password: str
    smtp_host: Optional[str] = "smtp.gmail.com"
    smtp_port: Optional[int] = 587

class OnboardingRequest(BaseModel):
    user_id: str
    full_name: Optional[str] = "Học viên"
    school: Optional[str] = "Chưa cập nhật"
    target_exam: Optional[str] = "THPT_QG"
    target_score: Optional[str] = "27.5+"
    current_level: Optional[str] = "Khá (7 - 8.5 điểm)"
    focus_subjects: Optional[List[str]] = None
    learning_needs: Optional[List[str]] = None

class UpdateUserIdentityRequest(BaseModel):
    user_id: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    school: Optional[str] = "Chưa cập nhật"
    target_exam: Optional[str] = "THPT_QG"
    target_score: Optional[str] = "27.5+"
    current_level: Optional[str] = "Khá (7 - 8.5 điểm)"
    focus_subjects: List[str] = []
    learning_needs: List[str] = []
    streak_days: int = 1
    avg_score: float = 0.0
    study_hours: float = 0.0
    solved_problems: int = 0

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    id: Optional[str] = None
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    needs_onboarding: bool = False
    profile: Optional[UserProfileResponse] = None

# Chat Schemas
class StepItem(BaseModel):
    stepNum: int
    title: str
    detail: str
    formula: Optional[str] = None

class CodeSnippet(BaseModel):
    language: str
    code: str

class HomeworkAttachment(BaseModel):
    title: str
    ocrText: str
    confidence: str

class ChatRequest(BaseModel):
    message: str
    subject: Optional[str] = "Toán học"
    session_id: Optional[str] = "default"
    attachment_data: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    sender: str = "ai"
    time: str
    text: str
    steps: Optional[List[StepItem]] = None
    codeSnippet: Optional[CodeSnippet] = None
    socraticPrompt: Optional[str] = None
    homeworkAttachment: Optional[HomeworkAttachment] = None

# Task Schemas
class TaskItemSchema(BaseModel):
    id: str
    title: str
    subject: str
    difficulty: str
    duration: str
    status: str
    score: Optional[str] = None

class TaskToggleRequest(BaseModel):
    task_id: str
    status: str

class TaskCreateRequest(BaseModel):
    title: str
    subject: str
    difficulty: Optional[str] = "Trung bình"
    duration: Optional[str] = "30 phút"

# Roadmap Schemas
class MilestoneItem(BaseModel):
    id: str
    title: str
    subject: str
    status: str
    tag: str
    score: Optional[str] = None
    unlockDate: Optional[str] = None

class ScheduleItem(BaseModel):
    day: str
    subject: str
    time: str
    topic: str
    status: str

class StageItem(BaseModel):
    id: int
    title: str
    status: str
    duration: str
    progress: str

class DynamicRoadmapResponse(BaseModel):
    id: str
    title: str
    target_exam: str
    target_score: str
    current_level: str
    stages: List[StageItem]
    milestones: List[MilestoneItem]
    schedule: List[ScheduleItem]
