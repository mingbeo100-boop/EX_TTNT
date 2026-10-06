# 🎓 EduAdvisor AI - Nền Tảng Cố Vấn Học Thuật & Luyện Thi Thông Minh

Dự án được khởi tạo và thiết kế tự động bằng hệ sinh thái **Google Stitch MCP** và bộ công cụ **Skills-Stitch** kết hợp với **React 18 + Vite + TypeScript + Tailwind CSS** và **FastAPI Backend (Python)**.

---

## 🌟 5 Màn Hình Giao Diện Đã Hoàn Thiện

1. **Trang Đăng Nhập Đa Kênh (Login & Register Screen)**:
   - Đăng nhập 1-click tiện lợi qua **Google** hoặc **Facebook**.
   - Hỗ trợ đăng nhập & đăng ký bằng Email và Mật khẩu (có ẩn/hiện mật khẩu).
   - Chọn mục tiêu học tập (THPT Quốc Gia, Đánh Giá Năng Lực, Sinh viên Đại học, Tự học).
   - Cột truyền cảm hứng bên trái với trích dẫn từ Cố vấn AI và chứng thực thủ khoa.
   - Lối tắt "Dùng thử nhanh không cần mật khẩu" dành cho khách.

2. **Trang Chủ Giới Thiệu (Landing Page)**:
   - Hero Section với Dual-CTA và số liệu chứng thực (98.4% tăng điểm, 50,000+ học viên).
   - 3 Trụ cột cốt lõi: Cố vấn Socratic 24/7, Lộ trình thích ứng, Kho tri thức chuẩn hóa.
   - Bảng so sánh trực quan đối kháng với hình thức học thêm truyền thống.

3. **Bảng Điều Khiển Học Sinh (Dashboard Overview)**:
   - Banner đếm ngược 88 ngày đến kỳ thi THPT QG 2025 & mục tiêu ĐH Bách Khoa (27.5+).
   - 4 thẻ KPI học tập: Thời gian tuần (28.5h), Điểm TB (8.8/10), Bài đã giải (342), Streak (14 ngày).
   - Checklist bài tập hôm nay có tương tác đánh dấu hoàn thành và lọc trạng thái.
   - Biểu đồ thanh đo lường mức độ nắm vững từng môn học (Toán 88%, Lý 76%, Hóa 82%, Tin học 92%).
   - Biểu đồ Radar 5 trục năng lực tư duy đối chiếu với chuẩn đầu vào đại học.
   - Cảnh báo điểm yếu môn Vật lý và lối tắt hỏi bài nhanh.

4. **Phòng Chat Cố Vấn Học Thuật AI (Dr. Minerva AI)**:
   - Khung hội thoại hiển thị công thức Toán học chuẩn mực dạng LaTeX / KaTeX.
   - Thẻ trích xuất đề thi từ ảnh chụp (OCR Scan độ chính xác 99.8%).
   - Lời giải phân tích 3 bước theo phương pháp gợi mở tư duy Socratic.
   - Hộp kiểm tra thuật toán bằng mã Python Sympy có nút sao chép nhanh.
   - Dock nhập câu hỏi với bộ gợi ý nhanh (Quick Prompts), đính kèm tệp và ghi âm giọng nói.
   - Sổ tay công thức liên quan bên phải và checklist nhiệm vụ rèn luyện.

5. **Lộ Trình Học Tập Cá Nhân Hóa (Personalized Roadmap)**:
   - Cấu trúc 4 giai đoạn chiến lược 90 ngày nước rút.
   - Dòng thời gian mốc mục tiêu (Milestones Timeline) với trạng thái Đã xong, Đang học và Checkpoint đề thi thử.
   - Thời khóa biểu học tập tuần cá nhân hóa.
   - Khuyến nghị thông minh từ AI phát hiện điểm yếu để tự động bù giờ học.

---

## ⚡ Hệ Thống Backend FastAPI & AI Engine (Port 8000)

- **Kiến trúc**: FastAPI bất đồng bộ (async), module hóa theo chuẩn RESTful API.
- **AI Streaming**: Hỗ trợ Server-Sent Events (SSE) `/api/chat/stream` phản hồi gõ từng chữ mượt mà.
- **Dual AI Engine**:
  - Hỗ trợ kết nối **Google Gemini API** (`gemini-1.5-flash`).
  - Tích hợp sẵn **Academic Socratic Inference Engine** cục bộ, tự động xử lý công thức LaTeX và bài toán đối xứng ngay cả khi chạy offline.
- **RAG Knowledge Base**: Tra cứu tài liệu đề thi chuyên sâu và bổ đề tích phân.
- **API Documentation**: Tích hợp sẵn Swagger UI tại `http://127.0.0.1:8000/docs`.

---

## 🚀 Hướng Dẫn Khởi Chạy (1-Click - Chuẩn như ChatML)

Chỉ cần nhấp đúp vào duy nhất 1 file:
🌟 **`CHAY_CHAT_ONLINE.bat`** (hoặc biểu tượng **`AI_EX_Online`** ngoài Desktop)

- Tự động kiểm tra & giải phóng cổng kết nối nếu bị treo.
- Tự động bật máy chủ Backend FastAPI (Port 8000).
- Tự động bật giao diện Frontend React + Vite (Port 3000) có tích hợp Reverse Proxy `/api`.
- Tự động tạo Cloudflare Tunnel công khai (`https://*.trycloudflare.com`), tự copy vào clipboard và mở trình duyệt web.
- Tự động fallback về `http://localhost:3000` và `http://<IP_LAN>:3000` nếu offline.

---

## 📁 Cấu Trúc Toàn Bộ Dự Án `AI_EX`

```
AI_EX/
├── .stitch/                          # Thiết kế gốc từ Stitch MCP
│   ├── SITE.md                       # Bản hiến chương kiến trúc
│   ├── DESIGN.md                     # Token thiết kế, bảng màu, font
│   └── designs/                      # 4 Màn hình HTML trích xuất từ Stitch
│
├── frontend/                         # Ứng dụng React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── components/Navbar.tsx     # Thanh điều hướng & avatar người dùng
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx         # Trang Đăng nhập (Google, FB, Email)
│   │   │   ├── LandingPage.tsx       # Trang Landing Page
│   │   │   ├── DashboardPage.tsx     # Trang Dashboard
│   │   │   ├── ChatPage.tsx          # Trang Chat Cố vấn AI
│   │   │   └── RoadmapPage.tsx       # Trang Lộ trình học tập
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                          # Máy chủ FastAPI + AI Engine
│   ├── app/
│   │   ├── api/                      # auth, chat, roadmap, tasks, documents
│   │   ├── core/config.py            # Cấu hình CORS, JWT, Gemini Key
│   │   ├── services/                 # llm_service, rag_service, advisor_prompts
│   │   ├── models/schemas.py         # Pydantic schemas
│   │   └── main.py                   # FastAPI Application
│   ├── run.py                        # Script khởi chạy uvicorn
│   └── requirements.txt
│
├── CHAY_WEB_FRONTEND.bat             # Khởi chạy nhanh Frontend (Port 3000)
├── CHAY_BACKEND.bat                  # Khởi chạy nhanh Backend (Port 8000)
└── README.md
```
