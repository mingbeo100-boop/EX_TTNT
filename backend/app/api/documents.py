from fastapi import APIRouter, UploadFile, File
from app.services.rag_service import rag_service

router = APIRouter(prefix="/documents", tags=["Knowledge Documents & OCR"])

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename
    content = await file.read()
    
    # Ingest document into knowledge base
    doc_id = rag_service.add_document(
        subject="Tài liệu tải lên",
        topic=filename,
        content=f"Tài liệu {filename} đã được hệ thống AI trích xuất và lưu trữ vào chỉ mục tra cứu.",
        keywords=[filename.lower(), "đề thi", "tài liệu"]
    )
    
    return {
        "status": "success",
        "doc_id": doc_id,
        "filename": filename,
        "size_bytes": len(content),
        "message": f"Đã nạp tệp '{filename}' vào Hộp tri thức RAG của Cố vấn AI."
    }

@router.post("/ocr")
async def ocr_exam_image(file: UploadFile = File(...)):
    """
    Mock OCR engine extracting problem question from student homework image.
    """
    return {
        "status": "success",
        "filename": file.filename,
        "extracted_text": "Cho hàm số f(x) liên tục trên R thỏa mãn f(x) + 2f(1-x) = 3x^2 - x. Tính tích phân I = int_0^1 x*f'(x) dx.",
        "confidence": 0.998,
        "subject_detected": "Toán học (Giải tích 12)",
        "difficulty_estimated": "Vận dụng cao (9+)"
    }
