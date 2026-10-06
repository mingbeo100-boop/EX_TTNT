from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatResponse, StepItem, CodeSnippet
from app.services.llm_service import llm_service
from datetime import datetime

router = APIRouter(prefix="/chat", tags=["AI Academic Chat"])

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """
    Server-Sent Events (SSE) streaming endpoint for AI Counselor.
    """
    return StreamingResponse(
        llm_service.stream_chat(message=request.message, subject=request.subject or "Toán học"),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/ask", response_model=ChatResponse)
async def chat_ask(request: ChatRequest):
    """
    Standard JSON endpoint returning full structured response with steps and LaTeX formulas.
    """
    now_str = datetime.now().strftime("%I:%M %p")
    
    # Example rich structured response
    return ChatResponse(
        id=str(int(datetime.now().timestamp())),
        sender="ai",
        time=now_str,
        text=f"Chào Hoàng Nam! Cố vấn Minerva đã phân tích câu hỏi '{request.message}'. Dưới đây là phương pháp giải quyết tối ưu:",
        steps=[
          StepItem(
              stepNum=1,
              title="Phân tích bản chất và nhận diện dạng bài",
              detail="Xác định công thức gốc và điều kiện biên của bài toán.",
              formula="f(x) + 2f(1-x) = 3x^2 - x"
          ),
          StepItem(
              stepNum=2,
              title="Khử biến bằng hệ đối xứng",
              detail="Nhân đôi phương trình liên hợp rồi trừ phương trình ban đầu.",
              formula="f(x) = x^2 - 3x + 4/3"
          ),
          StepItem(
              stepNum=3,
              title="Tích phân từng phần và thế cận",
              detail="Áp dụng công thức tích phân từng phần: I = uv - int v du.",
              formula="I = [x * f(x)]_0^1 - int_0^1 f(x)dx = -5/6"
          )
        ],
        codeSnippet=CodeSnippet(
            language="python",
            code="from sympy import symbols, integrate\nx = symbols('x')\nf = x**2 - 3*x + 4/3\nI = integrate(x * f.diff(x), (x, 0, 1))\nprint('I =', I) # -5/6"
        ),
        socraticPrompt="💡 Câu hỏi mở rộng: Nếu cận thay đổi từ 0 đến pi/2 với hàm lượng giác, em sẽ dùng phương pháp nào?"
    )
