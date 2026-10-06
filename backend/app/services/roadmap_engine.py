import json
import uuid
from typing import Dict, Any, List

class RoadmapEngine:
    @staticmethod
    def generate_roadmap(target_exam: str, current_level: str, target_score: str, focus_subjects: List[str] = None) -> Dict[str, Any]:
        if not focus_subjects:
            focus_subjects = ["Toán học", "Vật lý", "Hóa học"]

        # 1. Customization based on target_exam & current_level
        if "Mất gốc" in current_level or target_exam == "LAY_GOC":
            title = f"Lộ Trình Lấy Lại Gốc Cấp Tốc & Bứt Phá {target_score}"
            stages = [
                {"id": 1, "title": "Giai đoạn 1: Bù đắp lỗ hổng kiến thức 5-6 điểm", "status": "active", "duration": "Tuần 1 - 4", "progress": "0%"},
                {"id": 2, "title": "Giai đoạn 2: Củng cố dạng bài trung bình & Mẹo Casio", "status": "upcoming", "duration": "Tuần 5 - 8", "progress": "0%"},
                {"id": 3, "title": "Giai đoạn 3: Thực chiến đề chuẩn cấu trúc Bộ GD&ĐT", "status": "upcoming", "duration": "Tuần 9 - 11", "progress": "0%"},
                {"id": 4, "title": "Giai đoạn 4: Tổng ôn chốt mục tiêu và phòng tránh bẫy", "status": "upcoming", "duration": "Tuần 12", "progress": "0%"}
            ]
            milestones = [
                {"id": "m1", "title": "Nắm vững 100% công thức đạo hàm và bảng nguyên hàm", "subject": "Toán học", "status": "active", "tag": "Cốt lõi", "score": "0/5 bài tập"},
                {"id": "m2", "title": "Xử lý thành thạo mạch RLC nối tiếp và con lắc lò xo", "subject": "Vật lý", "status": "locked", "tag": "Nền tảng", "score": "6.5 Mục tiêu"},
                {"id": "m3", "title": "Bài toán Este đơn chức và phản ứng xà phòng hóa", "subject": "Hóa học", "status": "locked", "tag": "Chuyên đề", "score": "6.5 Mục tiêu"},
                {"id": "m4", "title": "Đề kiểm tra đánh giá tiến độ giai đoạn 1 (Score > 6.0)", "subject": "Tổng hợp", "status": "locked", "tag": "Checkpoint", "score": "6.0+"}
            ]
            schedule = [
                {"day": "Thứ 2", "subject": "Toán học", "time": "19:30 - 21:00", "topic": "Ôn lại bảng nguyên hàm cơ bản & 20 bài tập mẫu", "status": "current"},
                {"day": "Thứ 3", "subject": "Vật lý", "time": "19:30 - 21:00", "topic": "Đại cương dao động điều hòa & vòng tròn lượng giác", "status": "upcoming"},
                {"day": "Thứ 4", "subject": "Hóa học", "time": "19:30 - 21:00", "topic": "Phân loại đồng phân Este & bài toán thủy phân", "status": "upcoming"},
                {"day": "Thứ 5", "subject": "Toán học", "time": "19:30 - 21:00", "topic": "Phương pháp đổi biến số tích phân dạng 1", "status": "upcoming"},
                {"day": "Thứ 6", "subject": "Tự luyện", "time": "20:00 - 21:30", "topic": "Hỏi bài cùng Cố vấn AI Dr. Minerva & sửa bài sai", "status": "upcoming"},
                {"day": "Thứ 7", "subject": "Đề thi thử", "time": "14:00 - 15:30", "topic": "Làm đề thi thử kiểm tra kiến thức tuần (40 câu)", "status": "upcoming"},
                {"day": "Chủ Nhật", "subject": "Nghỉ ngơi", "time": "Cả ngày", "topic": "Xem lại sổ tay công thức & nạp năng lượng tuần mới", "status": "upcoming"}
            ]
            tasks = [
                {"id": str(uuid.uuid4()), "title": "Học thuộc 15 công thức nguyên hàm cơ bản", "subject": "Toán học", "difficulty": "Dễ", "duration": "25 phút", "score": "+15 XP", "status": "pending"},
                {"id": str(uuid.uuid4()), "title": "Giải 10 câu tìm chu kỳ và tần số dao động điều hòa", "subject": "Vật lý", "difficulty": "Dễ", "duration": "30 phút", "score": "+20 XP", "status": "pending"},
                {"id": str(uuid.uuid4()), "title": "Viết đồng phân Este đơn chức no C4H8O2", "subject": "Hóa học", "difficulty": "Trung bình", "duration": "25 phút", "score": "+20 XP", "status": "pending"},
                {"id": str(uuid.uuid4()), "title": "Hỏi Dr. Minerva AI bài tập chưa hiểu hôm nay", "subject": "AI Advisor", "difficulty": "Dễ", "duration": "15 phút", "score": "+10 XP", "status": "pending"}
            ]

        elif target_exam == "DGNL_DHQG":
            title = f"Chiến Lược Chinh Phục Đánh Giá Năng Lực ĐHQG ({target_score})"
            stages = [
                {"id": 1, "title": "Giai đoạn 1: Làm chủ Tư duy logic & Phân tích số liệu", "status": "active", "duration": "Tuần 1 - 3", "progress": "0%"},
                {"id": 2, "title": "Giai đoạn 2: Tối ưu phần Tiếng Việt & Khoa học Tự nhiên", "status": "upcoming", "duration": "Tuần 4 - 7", "progress": "0%"},
                {"id": 3, "title": "Giai đoạn 3: Luyện đề ĐGNL bấm giờ thực tế 150 phút", "status": "upcoming", "duration": "Tuần 8 - 10", "progress": "0%"},
                {"id": 4, "title": "Giai đoạn 4: Chiến thuật phân bổ thời gian & bứt phá 900+", "status": "upcoming", "duration": "Tuần 11 - 12", "progress": "0%"}
            ]
            milestones = [
                {"id": "m1", "title": "Hoàn thành 120 câu hỏi suy luận logic dạng suy diễn và giả định", "subject": "Tư duy Logic", "status": "active", "tag": "Logic", "score": "0/5 bài tập"},
                {"id": "m2", "title": "Kỹ thuật đọc hiểu bảng biểu biểu đồ số liệu thống kê nhanh", "subject": "Xử lý số liệu", "status": "locked", "tag": "Kỹ năng", "score": "Mở sau chặng 1"},
                {"id": "m3", "title": "Chuyên đề tích hợp Lý - Hóa - Sinh định hướng ứng dụng", "subject": "Khoa học", "status": "locked", "tag": "Tích hợp", "score": "Mở sau 5 ngày"},
                {"id": "m4", "title": "Thi thử ĐGNL ĐHQG đợt 1 (Mục tiêu 850+)", "subject": "Mock Exam", "status": "locked", "tag": "Checkpoint", "score": "850+"}
            ]
            schedule = [
                {"day": "Thứ 2", "subject": "Logic & Số liệu", "time": "20:00 - 21:30", "topic": "Phân tích biểu đồ hình quạt và biểu đồ cột kết hợp", "status": "current"},
                {"day": "Thứ 3", "subject": "Tiếng Việt", "time": "20:00 - 21:30", "topic": "Nhận diện phong cách ngôn ngữ và biện pháp tu từ nâng cao", "status": "upcoming"},
                {"day": "Thứ 4", "subject": "KHTN (Lý - Hóa)", "time": "20:00 - 21:30", "topic": "Bài toán thực tế quang học và hiệu ứng nhà kính", "status": "upcoming"},
                {"day": "Thứ 5", "subject": "Toán ĐGNL", "time": "20:00 - 21:30", "topic": "Tổ hợp xác suất và bài toán đếm suy luận nhanh", "status": "upcoming"},
                {"day": "Thứ 6", "subject": "Sửa đề cùng AI", "time": "20:00 - 21:30", "topic": "Phân tích 10 câu sai nhiều nhất trong đề thi thử ĐHQG", "status": "upcoming"},
                {"day": "Thứ 7", "subject": "Mock Test", "time": "14:00 - 16:30", "topic": "Thi thử full 120 câu ĐGNL bấm giờ 150 phút", "status": "upcoming"},
                {"day": "Chủ Nhật", "subject": "Chiến thuật", "time": "Cả ngày", "topic": "Xem báo cáo điểm mạnh điểm yếu từ Dr. Minerva AI", "status": "upcoming"}
            ]
            tasks = [
                {"id": str(uuid.uuid4()), "title": "Giải 15 câu bài toán tư duy suy luận logic ĐHQG", "subject": "Tư duy Logic", "difficulty": "Trung bình", "duration": "35 phút", "score": "+30 XP", "status": "pending"},
                {"id": str(uuid.uuid4()), "title": "Đọc và xử lý biểu đồ số liệu tăng trưởng GDP", "subject": "Số liệu", "difficulty": "Khó", "duration": "30 phút", "score": "+25 XP", "status": "pending"},
                {"id": str(uuid.uuid4()), "title": "Ôn tập 20 câu thành ngữ và điển cố văn học", "subject": "Tiếng Việt", "difficulty": "Dễ", "duration": "20 phút", "score": "+15 XP", "status": "pending"},
                {"id": str(uuid.uuid4()), "title": "Thực hành hỏi bài tích phân ứng dụng cùng AI", "subject": "AI Advisor", "difficulty": "Trung bình", "duration": "20 phút", "score": "+20 XP", "status": "pending"}
            ]

        elif target_exam == "DAI_HOC_GPA":
            title = f"Lộ Trình Cải Thiện GPA Đại Học (Toán Cao Cấp & Lập Trình) {target_score}"
            stages = [
                {"id": 1, "title": "Giai đoạn 1: Giải tích 1 & Đại số tuyến tính chuẩn mực", "status": "active", "duration": "Tuần 1 - 4", "progress": "0%"},
                {"id": 2, "title": "Giai đoạn 2: Cấu trúc dữ liệu & Giải thuật nâng cao", "status": "upcoming", "duration": "Tuần 5 - 8", "progress": "0%"},
                {"id": 3, "title": "Giai đoạn 3: Xử lý bài tập lớn & Đề thi kết thúc học phần", "status": "upcoming", "duration": "Tuần 9 - 12", "progress": "0%"},
                {"id": 4, "title": "Giai đoạn 4: Chốt điểm A/A+ và hoàn thiện đồ án", "status": "upcoming", "duration": "Tuần 13 - 15", "progress": "0%"}
            ]
            milestones = [
                {"id": "m1", "title": "Tính định thức ma trận bậc n và tìm ma trận nghịch đảo", "subject": "Đại số tuyến tính", "status": "active", "tag": "Đại cương", "score": "0/5 bài tập"},
                {"id": "m2", "title": "Khai triển Taylor/Maclaurin và ứng dụng tính giới hạn", "subject": "Giải tích 1", "status": "locked", "tag": "Nâng cao", "score": "Mở sau chặng 1"},
                {"id": "m3", "title": "Cài đặt thuật toán Quy hoạch động và Đồ thị DFS/BFS", "subject": "Tin học Đại cương", "status": "locked", "tag": "Thuật toán", "score": "Mở tuần sau"},
                {"id": "m4", "title": "Đề thi thử cuối kỳ Toán cao cấp (Mục tiêu A+)", "subject": "Final Exam", "status": "locked", "tag": "Checkpoint", "score": "9.5+"}
            ]
            schedule = [
                {"day": "Thứ 2", "subject": "Đại số tuyến tính", "time": "19:00 - 21:00", "topic": "Không gian véc tơ con và tìm cơ sở số chiều", "status": "current"},
                {"day": "Thứ 3", "subject": "Giải tích 1", "time": "19:00 - 21:00", "topic": "Tích phân suy rộng loại 1 và tiêu chuẩn so sánh", "status": "upcoming"},
                {"day": "Thứ 4", "subject": "Lập trình", "time": "19:00 - 21:30", "topic": "Thực hành con trỏ và danh sách liên kết đơn trong C++", "status": "upcoming"},
                {"day": "Thứ 5", "subject": "Giải tích 1", "time": "19:00 - 21:00", "topic": "Phương trình vi phân cấp 1 tuyến tính hệ số hằng", "status": "upcoming"},
                {"day": "Thứ 6", "subject": "Kiểm tra code AI", "time": "20:00 - 21:30", "topic": "Kiểm chứng nghiệm tích phân bằng thư viện Python Sympy", "status": "upcoming"},
                {"day": "Thứ 7", "subject": "Đề thi thử", "time": "14:00 - 16:00", "topic": "Làm đề thi thử Giữa kỳ Bách Khoa / KHTN", "status": "upcoming"},
                {"day": "Chủ Nhật", "subject": "Nghỉ ngơi", "time": "Cả ngày", "topic": "Review bài tập lớn & chuẩn bị kế hoạch tuần mới", "status": "upcoming"}
            ]
            tasks = [
                {"id": str(uuid.uuid4()), "title": "Tính giới hạn bằng khai triển Maclaurin đến bậc 4", "subject": "Giải tích", "difficulty": "Khó", "duration": "40 phút", "score": "+35 XP", "status": "pending"},
                {"id": str(uuid.uuid4()), "title": "Viết chương trình tìm đường đi ngắn nhất Dijkstra", "subject": "Lập trình", "difficulty": "Khó", "duration": "45 phút", "score": "+40 XP", "status": "pending"},
                {"id": str(uuid.uuid4()), "title": "Giải hệ phương trình tuyến tính bằng phương pháp Gauss", "subject": "Đại số", "difficulty": "Trung bình", "duration": "30 phút", "score": "+25 XP", "status": "pending"},
                {"id": str(uuid.uuid4()), "title": "Thảo luận nghiệm phương trình vi phân với AI", "subject": "AI Advisor", "difficulty": "Trung bình", "duration": "20 phút", "score": "+20 XP", "status": "pending"}
            ]

        else: # Standard THPT_QG High-tier (e.g. 27.5+ Target)
            title = f"Chiến Lược 90 Ngày Nước Rút THPT Quốc Gia ({target_score})"
            stages = [
                {"id": 1, "title": "Giai đoạn 1: Làm chủ chuyên đề Vận dụng cao (8.5 - 9.5đ)", "status": "active", "duration": "Tuần 1 - 4", "progress": "0%"},
                {"id": 2, "title": "Giai đoạn 2: Tối ưu hóa tốc độ trắc nghiệm 35 câu đầu (18 phút)", "status": "upcoming", "duration": "Tuần 5 - 8", "progress": "0%"},
                {"id": 3, "title": "Giai đoạn 3: Luyện đề thực chiến 30 đề trường Chuyên Sư Phạm & KHTN", "status": "upcoming", "duration": "Tuần 9 - 11", "progress": "0%"},
                {"id": 4, "title": "Giai đoạn 4: Đỉnh cao điểm số & Kiểm soát tâm lý phòng thi", "status": "upcoming", "duration": "Tuần 12", "progress": "0%"}
            ]
            milestones = [
                {"id": "m1", "title": "Tích phân hàm ẩn và kỹ thuật đổi biến số đối xứng", "subject": "Toán học", "status": "active", "tag": "Chuyên đề 9+", "score": "0/5 bài tập"},
                {"id": "m2", "title": "Bài toán cực trị giao thoa sóng và sóng dừng nâng cao", "subject": "Vật lý", "status": "locked", "tag": "Trọng tâm", "score": "Mở sau chặng 1"},
                {"id": "m3", "title": "Phương pháp đồng đẳng hóa Este đa chức và Peptit", "subject": "Hóa học", "status": "locked", "tag": "Vận dụng cao", "score": "Mở sau 3 ngày"},
                {"id": "m4", "title": "Đề thi thử THPTQG Chuyên Hà Nội - Amsterdam (Mục tiêu 9.0+)", "subject": "Toán - Lý - Hóa", "status": "locked", "tag": "Checkpoint", "score": "27.5+"}
            ]
            schedule = [
                {"day": "Thứ 2", "subject": "Toán học", "time": "19:30 - 21:00", "topic": "Cực trị hàm số chứa dấu giá trị tuyệt đối và tham số m", "status": "current"},
                {"day": "Thứ 3", "subject": "Vật lý", "time": "19:30 - 21:00", "topic": "Mạch RLC có tần số omega thay đổi & đồ thị điện xoay chiều", "status": "upcoming"},
                {"day": "Thứ 4", "subject": "Hóa học", "time": "19:30 - 21:00", "topic": "Quy đổi hỗn hợp chất béo và Este đa chức no", "status": "upcoming"},
                {"day": "Thứ 5", "subject": "Toán học", "time": "19:30 - 21:00", "topic": "Tích phân hàm ẩn kết hợp phương trình vi phân cấp 1", "status": "upcoming"},
                {"day": "Thứ 6", "subject": "Cố vấn AI", "time": "20:00 - 21:30", "topic": "Luyện phương pháp giải Socratic cùng Dr. Minerva AI", "status": "upcoming"},
                {"day": "Thứ 7", "subject": "Luyện đề", "time": "14:00 - 17:00", "topic": "Làm đề thi thử tổng hợp Chuyên ĐH Sư Phạm (bấm giờ)", "status": "upcoming"},
                {"day": "Chủ Nhật", "subject": "Tổng kết", "time": "Cả ngày", "topic": "Phân tích lỗi sai và điều chỉnh lộ trình cùng AI", "status": "upcoming"}
            ]
            tasks = [
                {"id": str(uuid.uuid4()), "title": "Giải 5 bài toán tích phân hàm ẩn Chuyên Sư Phạm", "subject": "Toán học", "difficulty": "Vận dụng cao", "duration": "45 phút", "score": "+35 XP", "status": "pending"},
                {"id": str(uuid.uuid4()), "title": "Luyện 10 câu cực trị giao thoa sóng cơ học", "subject": "Vật lý", "difficulty": "Khó", "duration": "35 phút", "score": "+25 XP", "status": "pending"},
                {"id": str(uuid.uuid4()), "title": "Phương pháp đồng đẳng hóa hỗn hợp Este", "subject": "Hóa học", "difficulty": "Khó", "duration": "30 phút", "score": "+25 XP", "status": "pending"},
                {"id": str(uuid.uuid4()), "title": "Thực hành hỏi bài Dr. Minerva AI với đề bài tự chụp", "subject": "AI Advisor", "difficulty": "Trung bình", "duration": "20 phút", "score": "+20 XP", "status": "pending"}
            ]

        return {
            "title": title,
            "stages": stages,
            "milestones": milestones,
            "schedule": schedule,
            "tasks": tasks
        }

roadmap_engine = RoadmapEngine()
