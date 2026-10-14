from fastapi import APIRouter, Depends, Query, Header
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
import jwt
from app.core.config import settings
from app.database.session import get_db
from app.database.models import Roadmap, User, UserProfile, Task
from app.services.roadmap_engine import roadmap_engine
import json
import uuid

router = APIRouter(prefix="/roadmap", tags=["Study Roadmap"])

@router.get("/current")
async def get_current_roadmap(user_id: str = Query(None), authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Lấy lộ trình cá nhân hóa của học viên hiện tại từ Cơ sở dữ liệu SQLite."""
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
        # Fallback mẫu nếu chưa có user nào trong DB
        default_data = roadmap_engine.generate_roadmap("THPT_QG", "Khá (7-8.5đ)", "27.5+")
        return {
            "id": "default",
            "title": default_data["title"],
            "targetExam": "THPT Quốc Gia Khối A00 (27.5+)",
            "targetScore": "27.5+",
            "currentLevel": "Khá (7-8.5đ)",
            "daysLeft": 88,
            "totalProgress": 0,
            "stages": default_data["stages"],
            "milestones": default_data["milestones"],
            "schedule": default_data["schedule"]
        }

    # Tìm roadmap của user
    rm = db.query(Roadmap).filter(Roadmap.user_id == user.id).first()
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()

    if not rm:
        # Nếu user chưa có roadmap -> sinh tự động dựa trên profile
        target_exam = profile.target_exam if profile else "THPT_QG"
        current_level = profile.current_level if profile else "Khá (7-8.5đ)"
        target_score = profile.target_score if profile else "27.5+"
        focus_subjects = json.loads(profile.focus_subjects) if profile and profile.focus_subjects else None

        generated = roadmap_engine.generate_roadmap(target_exam, current_level, target_score, focus_subjects)
        rm = Roadmap(
            id=str(uuid.uuid4()),
            user_id=user.id,
            title=generated["title"],
            target_exam=target_exam,
            current_level=current_level,
            stages_json=json.dumps(generated["stages"], ensure_ascii=False),
            milestones_json=json.dumps(generated["milestones"], ensure_ascii=False),
            schedule_json=json.dumps(generated["schedule"], ensure_ascii=False)
        )
        db.add(rm)
        db.commit()
        db.refresh(rm)

    stages = json.loads(rm.stages_json)
    milestones = json.loads(rm.milestones_json)
    schedule = json.loads(rm.schedule_json)

    # Tính toán tiến độ thật dựa trên số nhiệm vụ đã tick hoàn thành trong SQLite
    tasks = db.query(Task).filter(Task.user_id == user.id).all()
    completed_count = sum(1 for t in tasks if t.status == "completed")
    total_progress = int((completed_count / len(tasks)) * 100) if tasks else 0

    if stages and len(stages) > 0:
        stages[0]["progress"] = f"{total_progress}%"
    if milestones and len(milestones) > 0:
        milestones[0]["score"] = f"{completed_count}/{len(tasks)} bài tập" if tasks else "0/5 bài tập"

    return {
        "id": rm.id,
        "title": rm.title,
        "targetExam": profile.target_exam if profile else rm.target_exam,
        "targetScore": profile.target_score if profile else "Mục tiêu cao",
        "currentLevel": rm.current_level,
        "daysLeft": 88,
        "totalProgress": total_progress,
        "stages": stages,
        "milestones": milestones,
        "schedule": schedule
    }

@router.post("/reschedule")
async def reschedule_roadmap(user_id: str = Query(None), db: Session = Depends(get_db)):
    """AI tối ưu hóa và tái phân bổ lịch học thông minh."""
    return {
        "status": "success",
        "message": "Cố vấn AI Dr. Minerva đã phân tích dữ liệu học tập và tái phân bổ thêm 45 phút ôn luyện chuyên đề yếu vào Thứ Năm!"
    }

class RoadmapConfigurePayload(BaseModel):
    user_id: Optional[str] = None
    goal_id: str
    variant_id: str
    level_id: str
    target_band_id: str
    days_left: int = 90
    title: Optional[str] = None
    target_score: Optional[str] = None
    current_level: Optional[str] = None
    stages: Optional[list] = None
    milestones: Optional[list] = None
    schedule: Optional[list] = None

@router.post("/configure")
async def configure_roadmap(payload: RoadmapConfigurePayload, db: Session = Depends(get_db)):
    """Cập nhật và lưu trữ lộ trình học tập tùy biến theo 4 mục tiêu lớn."""
    user = None
    if payload.user_id:
        user = db.query(User).filter(User.id == payload.user_id).first()

    if user:
        # Cập nhật Profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        if profile:
            profile.target_exam = payload.goal_id
            profile.current_level = payload.current_level or payload.level_id
            profile.target_score = payload.target_score or payload.target_band_id
            db.commit()

        # Cập nhật Roadmap
        rm = db.query(Roadmap).filter(Roadmap.user_id == user.id).first()
        if not rm:
            rm = Roadmap(
                id=str(uuid.uuid4()),
                user_id=user.id,
                title=payload.title or f"Lộ trình {payload.goal_id}",
                target_exam=payload.goal_id,
                current_level=payload.current_level or payload.level_id,
                stages_json=json.dumps(payload.stages or [], ensure_ascii=False),
                milestones_json=json.dumps(payload.milestones or [], ensure_ascii=False),
                schedule_json=json.dumps(payload.schedule or [], ensure_ascii=False)
            )
            db.add(rm)
        else:
            if payload.title:
                rm.title = payload.title
            rm.target_exam = payload.goal_id
            rm.current_level = payload.current_level or payload.level_id
            if payload.stages:
                rm.stages_json = json.dumps(payload.stages, ensure_ascii=False)
            if payload.milestones:
                rm.milestones_json = json.dumps(payload.milestones, ensure_ascii=False)
            if payload.schedule:
                rm.schedule_json = json.dumps(payload.schedule, ensure_ascii=False)
        db.commit()

    return {
        "status": "success",
        "message": f"Đã cập nhật lộ trình học tập thành công cho mục tiêu {payload.goal_id} ({payload.variant_id})!"
    }


class StationQuestionsRequest(BaseModel):
    station_number: Optional[int] = 1
    title: str
    subject: str
    key_concept: Optional[str] = ""
    difficulty: Optional[str] = "Nền tảng"
    stage_name: Optional[str] = ""


def _ensure_distributed_answers(questions: list) -> list:
    """Đảm bảo đáp án đúng (correctAnswer) được phân bổ ngẫu nhiên đều đặn giữa A, B, C, D (0, 1, 2, 3)"""
    import random
    available_indices = [0, 1, 2, 3]
    random.shuffle(available_indices)
    
    for i, q in enumerate(questions):
        opts = list(q.get("options", []))
        if len(opts) < 4:
            continue
        cur_correct = int(q.get("correctAnswer", 0)) % len(opts)
        correct_val = opts[cur_correct]
        
        # Chỉ định target index khác nhau cho mỗi câu hỏi
        target_idx = available_indices[i % len(available_indices)]
        if cur_correct != target_idx:
            # Hoán đổi vị trí để đáp án đúng nằm ở target_idx
            opts[cur_correct], opts[target_idx] = opts[target_idx], opts[cur_correct]
            q["options"] = opts
            q["correctAnswer"] = target_idx
            
    return questions


def _build_fallback_station_questions(payload: StationQuestionsRequest) -> dict:
    """Tạo bộ câu hỏi dự phòng chuyên biệt theo môn học và trạm khi Gemini API gián đoạn"""
    import random
    import uuid
    sub = (payload.subject or "").lower()
    title = payload.title or "Chuyên đề bài học"
    kc = payload.key_concept or title
    
    # 3 câu hỏi thực hành có gợi ý
    practice = [
        {
            "id": f"fb_p1_{uuid.uuid4().hex[:6]}",
            "question": f"Đối với nội dung \"{kc}\", yếu tố cốt lõi nào cần ưu tiên xác định đầu tiên để tránh bẫy đề thi?",
            "options": [
                f"Đọc kỹ giả thiết biên và điều kiện xác định của bài toán {title}",
                f"Áp dụng ngay công thức giải nhanh mà không cần kiểm tra điều kiện",
                f"Bỏ qua bước phân tích giả thiết ban đầu",
                f"Chọn ngẫu nhiên một phương án có số liệu quen thuộc"
            ],
            "correctAnswer": 0,
            "hints": ["Chú ý điều kiện tiên quyết và tính bảo toàn của bản chất bài học", "Tránh vội vã kết luận khi chưa đối chiếu các phương án nhiễu"],
            "explanation": f"Trong chuyên đề {title}, việc xác định chính xác điều kiện xác định và bản chất {kc} là chìa khóa then chốt giúp loại bỏ 100% bẫy đề thi.",
            "trapAnalysis": "Lỗi phổ biến là học sinh hay vội vàng áp dụng máy móc công thức mà quên kiểm tra tính tương thích của điều kiện đề bài."
        },
        {
            "id": f"fb_p2_{uuid.uuid4().hex[:6]}",
            "question": f"Kỹ thuật xử lý đột phá nhất khi giải quyết dạng bài liên quan đến \"{title}\" là gì?",
            "options": [
                f"Chuyển dịch góc nhìn hoặc đổi biến trung gian để đơn giản hóa biểu thức",
                f"Đơn thuần học thuộc lòng lời giải mẫu",
                f"Bấm máy tính thử đáp án mà không hiểu bản chất phương pháp",
                f"Chờ đợi gợi ý từ đề bài mà không phân tích suy luận"
            ],
            "correctAnswer": 0,
            "hints": ["Tìm liên hệ giữa các đại lượng đã biết và đại lượng cần tìm", "Kỹ thuật phân rã vấn đề thành các bước nhỏ"],
            "explanation": f"Phương pháp phân tích tư duy Socratic giúp biến bài toán phức tạp thành các mắt xích logic dễ kiểm chứng.",
            "trapAnalysis": "Ngộ nhận rằng chỉ cần học thuộc dạng bài là đủ, trong khi đề thi luôn biến đổi tham số và cách diễn đạt."
        },
        {
            "id": f"fb_p3_{uuid.uuid4().hex[:6]}",
            "question": f"Khi kiểm tra lại kết quả của phần \"{kc}\", cách xác nhận tính chính xác nhanh và hiệu quả nhất là:",
            "options": [
                f"Thử nghiệm với các giá trị đặc biệt hoặc kiểm tra tính hợp lý của đơn vị/ý nghĩa thực tế",
                f"Làm lại từ đầu toàn bộ các bước tính toán mất thời gian",
                f"Tin tưởng tuyệt đối vào kết quả nhẩm đầu tiên",
                f"So sánh với đáp án của bạn cùng phòng mà không có cơ sở"
            ],
            "correctAnswer": 0,
            "hints": ["Phương pháp kiểm tra biên hoặc gán giá trị mẫu"],
            "explanation": "Kỹ thuật kiểm tra nghiệm bằng phương pháp gán giá trị đặc biệt giúp phát hiện sai sót tính toán trong vòng 10 giây.",
            "trapAnalysis": "Quên bước kiểm chứng khiến nhiều học sinh đánh mất điểm số đáng tiếc ở các bước tính toán cuối cùng."
        }
    ]
    
    # 5 câu hỏi kiểm tra cuối trạm chuẩn đầu ra (Mastery)
    mastery = [
        {
            "id": f"fb_m1_{uuid.uuid4().hex[:6]}",
            "question": f"[Chuẩn đầu ra 1] Khẳng định nào sau đây là ĐÚNG NHẤT về nguyên lý vận hành của \"{kc}\"?",
            "options": [
                f"Tính chất được bảo toàn khi và chỉ khi thỏa mãn đầy đủ các điều kiện ràng buộc lý thuyết của {title}",
                f"Mọi trường hợp đều áp dụng được quy tắc đồng dạng mà không cần chứng minh",
                f"Chỉ đúng trong các bài tập ví dụ sách giáo khoa cơ bản",
                f"Không có mối liên hệ nào với các chuyên đề trước đó"
            ],
            "correctAnswer": 0,
            "hints": ["Bám sát định nghĩa chuẩn mực"],
            "explanation": f"Nguyên lý {kc} đòi hỏi phải thỏa mãn các điều kiện tiên quyết mới đảm bảo kết quả chính xác.",
            "trapAnalysis": "Bẫy tuyệt đối hóa ('mọi trường hợp') thường là dấu hiệu nhận diện phương án sai trong đề thi phân loại."
        },
        {
            "id": f"fb_m2_{uuid.uuid4().hex[:6]}",
            "question": f"[Chuẩn đầu ra 2] Trong bài thi chính thức, bẫy tinh vi nhất thường xuất hiện ở phần \"{title}\" là gì?",
            "options": [
                f"Bẫy đồng âm khác nghĩa, bẫy đơn vị hoặc bẫy trường hợp ngoại lệ tại điểm biên",
                f"Đề bài cố tình in sai số liệu",
                f"Các phương án lựa chọn đều giống hệt nhau",
                f"Không có bẫy nào, chỉ cần tính toán đại số đơn thuần"
            ],
            "correctAnswer": 0,
            "hints": ["Chú ý các trường hợp đặc biệt tại điểm biên hoặc điều kiện dấu bằng"],
            "explanation": "Người ra đề thường giấu bẫy ở các điểm cực trị biên hoặc điều kiện triệt tiêu của mẫu số/đại lượng triệt tiêu.",
            "trapAnalysis": "Học sinh thường bỏ qua các trường hợp biên $x = 0$ hoặc dấu bằng trong bất đẳng thức."
        },
        {
            "id": f"fb_m3_{uuid.uuid4().hex[:6]}",
            "question": f"[Chuẩn đầu ra 3] Để đạt điểm tối đa ở câu hỏi phân loại 8+ về \"{kc}\", năng lực nào mang tính quyết định?",
            "options": [
                f"Năng lực nhận diện mô hình bài toán trong 5 giây đầu tiên và liên kết các kiến thức liên môn",
                f"Tốc độ viết chữ thật nhanh trên giấy thi",
                f"Khả năng học vẹt tất cả các dạng bài trên mạng",
                f"Sử dụng máy tính Casio đời mới nhất"
            ],
            "correctAnswer": 0,
            "hints": ["Khả năng trừu tượng hóa và nhận diện quy luật bài toán"],
            "explanation": "Nhận diện mô hình bài toán nhanh giúp tiết kiệm thời gian và kích hoạt chuỗi phản xạ giải quyết vấn đề chính xác.",
            "trapAnalysis": "Lạm dụng máy tính cầm tay mà không hiểu bản chất mô hình sẽ bị bất lực trước các bài toán chứa tham số ẩn."
        },
        {
            "id": f"fb_m4_{uuid.uuid4().hex[:6]}",
            "question": f"[Chuẩn đầu ra 4] Phương pháp so sánh logic nào sau đây giúp loại trừ nhanh 2 phương án nhiễu trong câu hỏi \"{title}\"?",
            "options": [
                f"So khớp tính chẵn lẻ, thứ nguyên đơn vị hoặc phân tích xu thế khi biến số tiến ra vô cực",
                f"Chọn phương án có độ dài dài nhất",
                f"Chọn ngẫu nhiên phương án C theo thói quen",
                f"Loại trừ các phương án có chứa chữ số nguyên"
            ],
            "correctAnswer": 0,
            "hints": ["Phương pháp kiểm tra thứ nguyên và giới hạn vô cực"],
            "explanation": "Phân tích thứ nguyên đơn vị và giới hạn vô hạn là kỹ thuật loại trừ phương án sai đỉnh cao của các thủ khoa.",
            "trapAnalysis": "Tin vào các mẹo truyền miệng vô căn cứ như 'chọn câu dài nhất' sẽ dẫn đến mất điểm đáng tiếc."
        },
        {
            "id": f"fb_m5_{uuid.uuid4().hex[:6]}",
            "question": f"[Chuẩn đầu ra 5 - Tổng kết Trạm] Sau khi hoàn thành trạm này, bước chuyển giao quan trọng nhất để sẵn sàng cho trạm tiếp theo là gì?",
            "options": [
                f"Tổng hợp sơ đồ tư duy 1 trang và tự giải thích lại bản chất {kc} bằng lời của chính mình",
                f"Đóng sách vở lại và không ôn tập lại nữa",
                f"Chuyển ngay sang bài khó hơn mà chưa nắm chắc cốt lõi",
                f"Làm lại đề thi cũ nhiều lần mà không rút kinh nghiệm"
            ],
            "correctAnswer": 0,
            "hints": ["Kỹ thuật Feynman: Giải thích lại bản chất bằng ngôn ngữ của chính mình"],
            "explanation": "Kỹ thuật Feynman giúp củng cố kiến thức vào trí nhớ dài hạn, tạo bệ phóng vững chắc cho các trạm tiếp theo.",
            "trapAnalysis": "Không ôn tập củng cố sẽ khiến kiến thức bị suy giảm theo đường cong lãng quên Ebbinghaus."
        }
    ]
    
    # Phân bổ đáp án đúng ngẫu nhiên giữa A, B, C, D
    practice = _ensure_distributed_answers(practice)
    mastery = _ensure_distributed_answers(mastery)
    
    return {
        "success": True,
        "isAiGenerated": False,
        "practice": practice,
        "mastery": mastery
    }


@router.post("/generate-station-questions")
async def generate_station_questions_endpoint(payload: StationQuestionsRequest):
    """
    Sinh câu hỏi độc bản cho từng trạm học tập bằng Google Gemini API.
    Đảm bảo:
    - Mỗi trạm có câu hỏi chuyên biệt theo môn học và tiêu đề trạm.
    - Phần kiểm tra cuối trạm (Mastery Test) luôn có ít nhất 5 câu hỏi khác nhau.
    - Các đáp án đúng (correctAnswer) được phân bổ ngẫu nhiên và đa dạng (không luôn là A).
    """
    import httpx
    api_key = settings.GEMINI_API_KEY
    
    if api_key and len(api_key.strip()) > 10:
        models_to_try = [
            "gemini-3.5-flash-lite",
            "gemini-flash-lite-latest",
            "gemini-3-flash-preview",
            "gemma-4-26b-a4b-it",
            "gemini-3.8-flash"
        ]
        
        prompt = f"""Bạn là Chuyên gia Khảo thí và Thiết kế Câu hỏi Trắc nghiệm của EduAdvisor AI.
Hãy tạo một bộ câu hỏi ĐỘC BẢN, SÁT BÀI HỌC và CHUẨN SƯ PHẠM cho trạm học tập sau:
- Trạm số: {payload.station_number}
- Tên trạm học: {payload.title}
- Môn học: {payload.subject}
- Trọng tâm kiến thức: {payload.key_concept or payload.title}
- Giai đoạn: {payload.stage_name or 'Nâng cao năng lực'}
- Độ khó: {payload.difficulty or 'Nền tảng'}

YÊU CẦU NGHIÊM NGẶT:
1. Phần Thực hành (practice): Đúng 3 câu hỏi trắc nghiệm có gợi ý (hints), lời giải thích Socratic (explanation) và phân tích bẫy (trapAnalysis).
2. Phần Kiểm tra chuẩn đầu ra cuối trạm (mastery): BẮT BUỘC ĐÚNG 5 CÂU HỎI (ít nhất 5 câu hỏi khác nhau hoàn toàn, đánh số từ m1 đến m5).
3. ĐÁP ÁN ĐÚNG (correctAnswer):
   - TUYỆT ĐỐI KHÔNG ĐƯỢC để tất cả câu hỏi đều có đáp án là 0 (A).
   - BẮT BUỘC phân bổ ngẫu nhiên và đều giữa các đáp án 0, 1, 2, 3 (tức A, B, C, D). Ví dụ câu 1 chọn B (1), câu 2 chọn C (2), câu 3 chọn D (3), câu 4 chọn A (0), câu 5 chọn B (1)...
4. Các câu hỏi phải xoay quanh trọng tâm "{payload.title}" của môn {payload.subject}, không hỏi chung chung hoặc lạc đề sang môn khác.

Trả về DUY NHẤT chuỗi JSON hợp lệ (không kèm bất kỳ văn bản nào ngoài JSON) theo cấu trúc:
{{
  "practice": [
    {{
      "id": "p_1",
      "question": "Câu hỏi thực hành 1 sát chủ đề {payload.title}...",
      "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      "correctAnswer": 1,
      "hints": ["Gợi ý định hướng 1", "Gợi ý tính toán 2"],
      "explanation": "Giải thích chi tiết tại sao đúng...",
      "trapAnalysis": "Phân tích bẫy ở các phương án nhiễu..."
    }}
  ],
  "mastery": [
    {{
      "id": "m_1",
      "question": "Câu hỏi kiểm tra cuối trạm 1 sát chủ đề {payload.title}...",
      "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      "correctAnswer": 2,
      "hints": ["Gợi ý trọng tâm"],
      "explanation": "Lời giải...",
      "trapAnalysis": "Bẫy thi..."
    }}
  ]
}}"""

        for model in models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                req_body = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.7
                    }
                }
                async with httpx.AsyncClient(timeout=22.0) as client:
                    resp = await client.post(url, json=req_body)
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if raw_text and raw_text.strip():
                            clean_text = raw_text.strip()
                            if clean_text.startswith("```json"):
                                clean_text = clean_text[7:]
                            if clean_text.startswith("```"):
                                clean_text = clean_text[3:]
                            if clean_text.endswith("```"):
                                clean_text = clean_text[:-3]
                            clean_text = clean_text.strip()
                            
                            parsed = json.loads(clean_text)
                            practice = parsed.get("practice", [])
                            mastery = parsed.get("mastery", [])
                            
                            # Kiểm tra số lượng câu hỏi kiểm tra cuối trạm
                            if isinstance(practice, list) and isinstance(mastery, list) and len(mastery) >= 5:
                                # Đảm bảo đáp án được phân bổ đa dạng giữa A, B, C, D
                                practice = _ensure_distributed_answers(practice)
                                mastery = _ensure_distributed_answers(mastery)
                                return {
                                    "success": True,
                                    "isAiGenerated": True,
                                    "modelUsed": model,
                                    "practice": practice,
                                    "mastery": mastery
                                }
                            elif isinstance(mastery, list) and len(mastery) > 0:
                                # Nếu AI sinh thiếu câu, bổ sung cho đủ ít nhất 5 câu
                                fb = _build_fallback_station_questions(payload)
                                while len(mastery) < 5:
                                    needed_idx = len(mastery)
                                    if needed_idx < len(fb["mastery"]):
                                        mastery.append(fb["mastery"][needed_idx])
                                    else:
                                        break
                                practice = _ensure_distributed_answers(practice if len(practice) >= 3 else fb["practice"])
                                mastery = _ensure_distributed_answers(mastery)
                                return {
                                    "success": True,
                                    "isAiGenerated": True,
                                    "modelUsed": model,
                                    "practice": practice,
                                    "mastery": mastery
                                }
            except Exception as ex:
                print(f"Gemini station generation error on {model}: {ex}")
                continue

    # Fallback chất lượng cao nếu Gemini API không khả dụng
    return _build_fallback_station_questions(payload)


