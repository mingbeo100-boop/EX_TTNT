"""
RAG (Retrieval-Augmented Generation) Service for Academic Knowledge & Syllabus.
"""
from typing import List, Dict

# Preloaded Academic Knowledge Base (Đề thi thử trường chuyên & Sổ tay công thức)
ACADEMIC_KNOWLEDGE_BASE: List[Dict[str, str]] = [
    {
        "id": "kb_math_01",
        "subject": "Toán học",
        "topic": "Tích phân hàm ẩn & Phương pháp biến đổi đối xứng",
        "keywords": ["tích phân", "hàm ẩn", "đối xứng", "chuyên sư phạm", "đạo hàm", "từng phần"],
        "content": (
            "Dạng toán f(x) + k*f(a+b-x) = g(x). "
            "Chiến thuật: Thế x = a+b-x để tạo hệ 2 phương trình 2 ẩn f(x) và f(a+b-x). "
            "Khử biến đối xứng để tìm tường minh f(x). Sau đó áp dụng tích phân từng phần: int u dv = uv - int v du."
        )
    },
    {
        "id": "kb_physics_01",
        "subject": "Vật lý",
        "topic": "Giao thoa ánh sáng trắng & Bài toán vân trùng",
        "keywords": ["giao thoa", "sóng ánh sáng", "vân trùng", "bước sóng", "quang phổ"],
        "content": (
            "Vị trí vân sáng: x = k * lambda * D / a. "
            "Điều kiện vân trùng: k1 * lambda1 = k2 * lambda2 = ... = k_n * lambda_n. "
            "Đối với ánh sáng trắng (0.38 um <= lambda <= 0.76 um), lập bất đẳng thức k để tìm số lượng bức xạ cho vân sáng tại tọa độ x."
        )
    },
    {
        "id": "kb_chem_01",
        "subject": "Hóa học",
        "topic": "Phương pháp quy đổi Este đa chức & Đồng đẳng hóa",
        "keywords": ["quy đổi", "este", "peptid", "hóa hữu cơ", "đồng đẳng hóa"],
        "content": (
            "Quy đổi hỗn hợp Este phức tạp về: HCOOCH3, các nhóm CH2 và -H2 (nếu không no). "
            "Thiết lập hệ phương trình bảo toàn nguyên tố C, H, O và bảo toàn khối lượng khi đốt cháy hoặc thủy phân qua dung dịch NaOH."
        )
    },
    {
        "id": "kb_cs_01",
        "subject": "Tin học",
        "topic": "Thuật toán Quy hoạch động (Dynamic Programming)",
        "keywords": ["quy hoạch động", "dp", "memoization", "bài toán cái túi", "dãy con tăng"],
        "content": (
            "Nguyên lý tối ưu Bellman: Bài toán con gối nhau và cấu trúc con tối ưu. "
            "Xác định mảng trạng thái dp[i], tìm hệ thức truy hồi cơ sở, khởi tạo giá trị ban đầu và xác định hướng duyệt (bottom-up hoặc top-down memoization)."
        )
    }
]

class RAGService:
    def __init__(self):
        self.documents = ACADEMIC_KNOWLEDGE_BASE

    def search(self, query: str, subject: str = None, top_k: int = 2) -> str:
        query_lower = query.lower()
        matched_docs = []
        
        for doc in self.documents:
            score = 0
            if subject and subject.lower() in doc["subject"].lower():
                score += 2
            for kw in doc["keywords"]:
                if kw in query_lower:
                    score += 1
            if score > 0:
                matched_docs.append((score, doc))

        matched_docs.sort(key=lambda x: x[0], reverse=True)
        results = [doc["content"] for _, doc in matched_docs[:top_k]]
        return "\n\n".join(results) if results else "Chưa có tài liệu cụ thể trong kho tri thức cho chuyên đề này."

    def add_document(self, subject: str, topic: str, content: str, keywords: List[str]) -> str:
        doc_id = f"kb_custom_{len(self.documents) + 1}"
        self.documents.append({
            "id": doc_id,
            "subject": subject,
            "topic": topic,
            "keywords": keywords,
            "content": content
        })
        return doc_id

rag_service = RAGService()
