import React from 'react';
import { PageType } from '../types';
import { 
  Milestone, 
  LayoutDashboard, 
  MessageSquareText, 
  User as UserIcon, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Lock,
  Compass,
  GraduationCap
} from 'lucide-react';

interface AuthGateModalProps {
  isOpen: boolean;
  targetPage: PageType;
  onClose: () => void;
  onGoToLogin: () => void;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  targetPage,
  onClose,
  onGoToLogin
}) => {
  if (!isOpen) return null;

  // Cấu hình nội dung hướng dẫn ràng buộc tương ứng theo từng trang
  const getPageConfig = (page: PageType) => {
    switch (page) {
      case 'roadmap':
        return {
          icon: Milestone,
          badge: 'Yêu cầu tài khoản học viên',
          title: 'Hãy đăng nhập để tạo Lộ trình học tập cá nhân hóa',
          subtitle: 'Thiết kế riêng theo mục tiêu điểm số và trường đại học của bạn',
          description: 'Hệ thống EduAdvisor AI cần biết mục tiêu thi cử (THPT Quốc Gia 2025, ĐGNL ĐHQG...), tổ hợp môn thi và học lực hiện tại để kiến tạo ma trận Neural Roadmap 4 giai đoạn độc quyền.',
          benefits: [
            'Lộ trình 4 giai đoạn chia nhỏ mục tiêu từng tuần bám sát đề thi chuẩn',
            'Trạm thử thách Station Gamification với ngân hàng 100+ dạng bài 9+',
            'Tự động ghi nhớ tiến độ học tập và đồng bộ số giờ học mỗi ngày'
          ],
          ctaText: 'Đăng nhập để tạo Lộ trình ngay'
        };
      case 'dashboard':
        return {
          icon: LayoutDashboard,
          badge: 'Khu vực quản lý học tập',
          title: 'Hãy đăng nhập để xem Bảng Điều Khiển Tiến Độ',
          subtitle: 'Theo dõi chỉ số thực chiến và Radar 5 trục năng lực',
          description: 'Vui lòng đăng nhập tài khoản học viên để xem biểu đồ Radar năng lực, lịch học thi thử trong tuần và chuỗi ngày học liên tục (Streak).',
          benefits: [
            'Radar 5 trục năng lực đánh giá chính xác điểm mạnh và lỗ hổng kiến thức',
            'Danh sách bài tập trọng tâm hàng ngày được AI chọn lọc thông minh',
            'Chuỗi ngày học tập Streak tiếp thêm động lực mỗi ngày'
          ],
          ctaText: 'Đăng nhập vào Dashboard'
        };
      case 'chat':
        return {
          icon: MessageSquareText,
          badge: 'Cố vấn Trí tuệ Nhân tạo',
          title: 'Đăng nhập để trò chuyện với Cố vấn Học thuật AI',
          subtitle: 'Hỏi đáp bài tập, OCR đề thi và lưu trữ lịch sử học tập',
          description: 'Đăng nhập giúp EduAdvisor AI ghi nhớ các dạng toán bạn đã hỏi, phân tích điểm yếu và giải thích bài tập theo phương pháp Gợi mở Socratic.',
          benefits: [
            'Hỏi đáp không giới hạn với EduAdvisor AI (kết nối trực tiếp Google Gemini)',
            'Trình bày công thức Toán - Lý - Hóa KaTeX chuẩn mực và mẹo Casio 15s',
            'Lưu trữ toàn bộ lịch sử các cuộc trò chuyện để ôn lại bất cứ lúc nào'
          ],
          ctaText: 'Đăng nhập để Chat cùng AI'
        };
      case 'profile':
        return {
          icon: UserIcon,
          badge: 'Hồ sơ thí sinh',
          title: 'Đăng nhập để quản lý Hồ Sơ & Mục Tiêu Học Viên',
          subtitle: 'Thông tin trường thi, danh hiệu và thiết lập bảo mật',
          description: 'Vui lòng đăng nhập để cập nhật thông tin cá nhân, trường THPT đang theo học, điểm số nguyện vọng 1 và kiểm tra các danh hiệu huy hiệu.',
          benefits: [
            'Cá nhân hóa tên hiển thị, ảnh đại diện và trường THPT',
            'Bảng vàng danh hiệu và huy hiệu bứt phá thành tích học tập',
            'Bảo mật thông tin đăng nhập và đồng bộ dữ liệu đa thiết bị'
          ],
          ctaText: 'Đăng nhập vào Hồ sơ'
        };
      case 'admin':
        return {
          icon: ShieldCheck,
          badge: 'Cổng Quản Trị Hệ Thống',
          title: 'Yêu cầu quyền Quản Trị Viên (Admin)',
          subtitle: 'Khu vực dành riêng cho quản trị cơ sở dữ liệu và người quản lý',
          description: 'Bạn cần đăng nhập bằng tài khoản quản trị để xem bảng cơ sở dữ liệu, nhật ký truy cập và danh sách mã xác thực OTP.',
          benefits: [
            'Quản trị người dùng và dữ liệu học tập',
            'Xem logs hệ thống thời gian thực',
            'Cấu hình kết nối API & Cloudflare'
          ],
          ctaText: 'Đăng nhập Quản Trị Viên'
        };
      default:
        return {
          icon: GraduationCap,
          badge: 'Tham gia cùng EduAdvisor AI',
          title: 'Hãy đăng nhập để trải nghiệm đầy đủ tính năng',
          subtitle: 'Nền tảng Cố vấn Học thuật Thông minh dành cho sĩ tử Việt Nam',
          description: 'Đăng nhập tài khoản hoàn toàn miễn phí để mở khóa Lộ trình, Cố vấn AI, Dashboard và kho bài tập chuẩn hóa.',
          benefits: [
            'Truy cập đầy đủ toàn bộ tính năng học tập',
            'Tự động đồng bộ trên mọi thiết bị',
            'Miễn phí 100% dành cho học sinh'
          ],
          ctaText: 'Đăng nhập / Đăng ký ngay'
        };
    }
  };

  const config = getPageConfig(targetPage);
  const IconComp = config.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Modal Box */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 relative space-y-6 text-center animate-in zoom-in-95 duration-200">
        
        {/* Nút đóng (X) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Đóng thông báo"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon lớn */}
        <div className="relative inline-flex mx-auto mt-1">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-sm">
            <IconComp className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-amber-400 border-2 border-white flex items-center justify-center shadow-xs">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Header Titles */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{config.badge}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {config.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {config.description}
          </p>
        </div>

        {/* Benefits Checklist Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Quyền lợi khi đăng nhập tài khoản:
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            {config.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={onGoToLogin}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>{config.ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Khám phá Trang chủ trước
          </button>
        </div>

      </div>

    </div>
  );
};
