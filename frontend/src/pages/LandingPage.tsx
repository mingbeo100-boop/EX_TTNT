import React, { useState } from 'react';
import { PageType } from '../types';
import { studySyncService } from '../services/studySyncService';
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Brain,
  Compass,
  BookOpen,
  Zap,
  GraduationCap,
  Star,
  Flame,
  Cpu,
  Layers,
  Send,
  Activity,
  Orbit,
  Atom,
  ChevronRight,
  TrendingUp,
  Search,
  Check,
  Award,
  Clock,
  Sparkle,
  Users,
  ShieldCheck,
  Scale,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  LucideIcon
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: PageType, initialPrompt?: string) => void;
}

interface DemoSubject {
  id: string;
  name: string;
  icon: React.ReactNode;
  tag: string;
  question: string;
  socraticHint: string;
  solutionFormula: string;
  keyTakeaway: string;
  category: string;
}

const DEMO_SUBJECTS: DemoSubject[] = [
  {
    id: 'math',
    name: 'Toán Học & Giải Tích',
    icon: <Atom className="w-4 h-4 text-blue-500" />,
    tag: 'Chuyên Sư Phạm 2025 • Điểm 9+',
    category: 'Đại số & Tích phân',
    question: 'Cho hàm ẩn f(x) + 2f(1-x) = 3x² - x. Em bấm Casio ra kết quả nhưng không hiểu bản chất để làm câu tương tự dưới 2 phút?',
    socraticHint: 'Thay vì đạo hàm phức tạp, hãy quan sát tính đối xứng của biến x và (1 - x). Khi ta hoán vị thế x = 1 - x vào đề bài, điều gì kỳ diệu sẽ xảy ra giữa 2 phương trình?',
    solutionFormula: 'Thế x ↔ (1-x): f(1-x) + 2f(x) = 3(1-x)² - (1-x) ⇒ Khử f(1-x) được: f(x) = x² - x + 2/3 ⇒ Tích phân I = 5/12',
    keyTakeaway: '💡 Bí kíp Socratic: 90% bài toán hàm ẩn đối xứng giải quyết bằng phương pháp thiết lập hệ 2 phương trình triệt tiêu!'
  },
  {
    id: 'physics',
    name: 'Vật Lý Lượng Tử & Từ',
    icon: <Zap className="w-4 h-4 text-amber-500" />,
    tag: 'Chuyên KHTN • Trọng tâm Quốc Gia',
    category: 'Quang điện & Từ trường',
    question: 'Electron quang điện bay vào từ trường đều B vuông góc đường sức. Tại sao bán kính quỹ đạo cực đại R_max lại phụ thuộc vào bước sóng ánh sáng chiếu tới?',
    socraticHint: 'Hãy xâu chuỗi 2 định luật: Năng lượng photon kích thích electron bứt ra với động năng cực đại theo Anh-xtanh, sau đó lực Lorentz đóng vai trò lực gì để electron uốn cong thành đường tròn?',
    solutionFormula: 'hf = A + ½mv₀²max ⇒ v₀max = √[2(hf - A)/m]. Lực Lorentz = Lực hướng tâm: R_max = (m·v₀max) / (|e|·B)',
    keyTakeaway: '⚡ Bí kíp Socratic: Khi kết hợp 2 chương khác nhau, tìm mắt xích chung duy nhất là đại lượng Vận tốc cực đại (v₀max)!'
  },
  {
    id: 'ielts',
    name: 'Tiếng Anh Academic',
    icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
    tag: 'IELTS Academic 8.0+ Writing',
    category: 'Paraphrasing & C2 Lexical',
    question: 'Làm sao để paraphrase cụm "economic development causes environmental pollution" đạt chuẩn C1/C2 mà không bị sáo rỗng?',
    socraticHint: 'Thử chuyển từ cấu trúc Nguyên nhân - Kết quả (cause) sang cấu trúc Đánh đổi / Hệ lụy tất yếu (at the expense of, precipitated by).',
    solutionFormula: '"Unbridled industrial proliferation often comes at the expense of ecological equilibrium, precipitating severe environmental degradation."',
    keyTakeaway: '🌍 Bí kíp Socratic: Nâng tầm từ vựng không phải dùng từ lạ mà là kết hợp cụm Collocation mang tính học thuật cao!'
  },
  {
    id: 'dgnl',
    name: 'ĐGNL ĐHQG Logic',
    icon: <Compass className="w-4 h-4 text-purple-500" />,
    tag: 'ĐGNL ĐHQG Hà Nội & TP.HCM',
    category: 'Tư duy logic & Ma trận',
    question: 'Dạng bài suy luận 5 người A, B, C, D, E ngồi bàn tròn với 3 mệnh đề phủ định nhau. Có cách nào giải dưới 90 giây không?',
    socraticHint: 'Với bài toán bàn tròn, ta có quyền cố định vị trí của 1 người có nhiều liên kết nhất (Anchor point) để triệt tiêu tính xoay vòng.',
    solutionFormula: 'Cố định A tại vị trí 12h ⇒ Xét 2 nhánh giả thiết phủ định của B ⇒ Suy ra vị trí duy nhất của D và E mà không cần thử hết 24 hoán vị.',
    keyTakeaway: '🏛️ Bí kíp Socratic: Phương pháp điểm neo (Anchor Method) tiết kiệm 70% thời gian xử lý các bài toán logic phân bố!'
  }
];

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    q: 'EduAdvisor AI có giải hộ bài tập để học sinh chép nộp không?',
    a: 'Không. Triết lý của EduAdvisor AI là phương pháp Socratic – dẫn dắt từng bước để người học tự tìm ra lời giải. Hệ thống giải thích bản chất vật lý, công thức toán học và mẹo tư duy giúp bạn nhớ lâu, không tạo thói quen thụ động.'
  },
  {
    q: 'Hệ thống có nhận diện được đề thi chụp từ điện thoại hoặc viết tay không?',
    a: 'Có. Công cụ Math-OCR thế hệ mới xử lý ảnh chụp trong vòng 1 giây, nhận dạng chính xác công thức toán học phức tạp, hình vẽ không gian, ma trận và các phương trình hóa học hữu cơ.'
  },
  {
    q: 'Lộ trình Neural Adaptive Roadmap hoạt động như thế nào?',
    a: 'Khi bạn luyện đề hoặc trao đổi bài tập, thuật toán liên tục phân tích và xây dựng bản đồ nhiệt (Heatmap) về các vùng kiến thức yếu. Nếu bạn sai câu hàm ẩn, AI tự động thêm các bài tập nền tảng liên quan vào kế hoạch 48 giờ tới.'
  },
  {
    q: 'EduAdvisor AI có bám sát chương trình Giáo dục Phổ thông 2018 và ĐGNL không?',
    a: 'Hệ thống được cập nhật 100% theo định hướng đề minh họa mới nhất của Bộ GD&ĐT và cấu trúc đề Đánh Giá Năng Lực của ĐHQG Hà Nội và ĐHQG TP.HCM, với ngân hàng hơn 10,000 đề thi chọn lọc.'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [activeSubject, setActiveSubject] = useState<DemoSubject>(DEMO_SUBJECTS[0]);
  const [customInput, setCustomInput] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleStartChatWithPrompt = (promptText: string) => {
    studySyncService.setNavigationIntent({
      initialPrompt: promptText,
      tab: 'practice'
    });
    onNavigate('chat', promptText);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      handleStartChatWithPrompt(customInput.trim());
    } else {
      studySyncService.setNavigationIntent({
        tab: 'practice'
      });
      onNavigate('chat');
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="w-full flex-1 bg-gradient-to-b from-[#f8faff] via-white to-[#f4f7ff] relative overflow-x-hidden">

      {/* ============================================================== */}
      {/* 1. ETHEREAL AMBIENT AURORA BACKGROUND & FLOATING MATH NODES   */}
      {/* ============================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[12%] left-[10%] w-[580px] h-[580px] rounded-full bg-gradient-to-tr from-blue-400/20 via-indigo-300/15 to-purple-400/20 blur-[120px] animate-float-slow" />
        <div className="absolute top-[28%] -right-[12%] w-[620px] h-[620px] rounded-full bg-gradient-to-bl from-cyan-300/20 via-sky-400/15 to-blue-500/15 blur-[130px] animate-float-reverse" />
        <div className="absolute top-[60%] left-[3%] w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-violet-400/15 via-fuchsia-300/10 to-indigo-400/15 blur-[110px] animate-pulse-glow" />
        <div className="absolute -bottom-[8%] right-[12%] w-[680px] h-[680px] rounded-full bg-gradient-to-tl from-emerald-300/15 via-teal-400/15 to-blue-400/15 blur-[140px] animate-float-slow" />

        {/* Academic Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_0.75px,transparent_0.75px)] [background-size:26px_26px] opacity-[0.12]" />

        {/* Floating Academic Micro Badges */}
        <div className="hidden lg:block absolute top-[16%] left-[4%] glass-pill px-3.5 py-1.5 rounded-full text-[11px] font-mono font-semibold text-blue-700 shadow-xs animate-float-slow">
          ∫₀¹ f(x)dx = 5/12 • Q.E.D
        </div>
        <div className="hidden lg:block absolute top-[38%] left-[2%] glass-pill px-3.5 py-1.5 rounded-full text-[11px] font-mono font-semibold text-indigo-700 shadow-xs animate-float-reverse">
          lim (x→∞) [1 + 1/x]ˣ = e
        </div>
        <div className="hidden lg:block absolute top-[22%] right-[3%] glass-pill px-3.5 py-1.5 rounded-full text-[11px] font-mono font-semibold text-emerald-700 shadow-xs animate-float-fast">
          E = mc² • Socratic AI Core
        </div>
        <div className="hidden lg:block absolute top-[48%] right-[4%] glass-pill px-3.5 py-1.5 rounded-full text-[11px] font-mono font-semibold text-purple-700 shadow-xs animate-float-slow">
          IELTS Academic 8.5 Band • C2
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. HERO SECTION: ACADEMIC POWER, SCHOLARLY BADGE & DUAL CTA   */}
      {/* ============================================================== */}
      <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-16 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top Scholarly Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-floating border border-blue-200 text-blue-900 text-xs font-semibold shadow-sm hover:scale-[1.02] transition-transform">
              <span className="text-amber-500 text-sm">🌟</span>
              <span className="font-bold tracking-wide uppercase text-[10px] sm:text-xs bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                NỀN TẢNG CỐ VẤN HỌC THUẬT AI SỐ 1 DÀNH CHO SĨ TỬ &amp; SINH VIÊN
              </span>
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            </div>
          </div>

          {/* Main Catchphrase & Narrative */}
          <div className="text-center max-w-4xl mx-auto mb-10 space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
              Người Bạn Đồng Hành AI Thông Minh Cho{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent px-1.5 inline-block">
                Mọi Kỳ Thi
              </span>{' '}
              <br className="hidden sm:inline" />
              &amp; Mục Tiêu Học Tập Bứt Phá
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
              Cố vấn học thuật AI cá nhân hóa 24/7 giúp học sinh, sinh viên và người tự học nắm chắc phương pháp giải bài, bứt phá GPA và tự tin chinh phục các trường đại học top đầu bằng phương pháp gợi mở tư duy <strong className="text-blue-700 font-semibold">Socratic</strong>.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <div className="flex flex-col items-center w-full sm:w-auto">
                <button
                  onClick={() => onNavigate('chat')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Trải nghiệm Cố vấn AI ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-[12px] text-slate-400 mt-2 font-medium">
                  Không cần thẻ tín dụng • Miễn phí trải nghiệm 14 ngày
                </span>
              </div>

              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm sm:text-base border border-slate-200/90 shadow-sm transition-all active:scale-[0.98]"
              >
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 fill-blue-600" />
                </div>
                <span>Xem Demo Bảng Điều Khiển</span>
              </button>
            </div>

            {/* Interactive Instant Ask Search Bar */}
            <form onSubmit={handleCustomSubmit} className="relative max-w-xl mx-auto pt-4">
              <div className="glass-floating rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 border border-blue-200 shadow-md shadow-blue-500/5 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                <div className="pl-3 text-blue-600">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Gõ bài tập hoặc dạng đề: Tích phân, Dao động cơ, Writing..."
                  className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 font-medium"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <span>Hỏi AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Floating Quick Prompt Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
                {[
                  '✨ Tích phân hàm ẩn Chuyên Sư Phạm',
                  '⚡ Lực Lorentz & Bán kính quỹ đạo',
                  '📖 Paraphrase IELTS Writing C1',
                  '🏛️ Mẹo logic bàn tròn ĐGNL'
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleStartChatWithPrompt(chip)}
                    className="glass-pill px-3 py-1 rounded-full text-[11px] font-medium text-slate-600 hover:text-blue-700 hover:border-blue-300 hover:bg-white transition-all shadow-xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </form>

          </div>

          {/* Trust Badges Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl glass-floating border border-slate-200/80 shadow-sm max-w-5xl mx-auto mb-16">

            <div className="flex items-center gap-3.5 px-3 py-2 border-r border-slate-200/60 last:border-r-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif">98.4%</div>
                <div className="text-xs text-slate-500 font-medium">Cải thiện điểm sau 30 ngày</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-3 py-2 border-r border-slate-200/60 last:border-r-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif">50,000+</div>
                <div className="text-xs text-slate-500 font-medium">Sĩ tử &amp; sinh viên tin dùng</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-3 py-2 border-r border-slate-200/60 last:border-r-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif">100% Khối thi</div>
                <div className="text-xs text-slate-500 font-medium">Toán - Lý - Hóa &amp; ĐGNL</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-3 py-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif">Bảo trợ học thuật</div>
                <div className="text-xs text-slate-500 font-medium">Thủ khoa &amp; Giảng viên ĐHQG</div>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* 3. HERO VISUAL MOCKUP: CHAT + MATH CANVAS + 5-AXIS RADAR       */}
          {/* ============================================================== */}
          <div className="relative max-w-5xl mx-auto rounded-3xl glass-floating border border-white shadow-2xl overflow-hidden animate-float-slow">

            {/* Mockup OS Window Bar */}
            <div className="bg-slate-100/90 px-5 py-3 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="ml-3 text-xs text-slate-600 font-mono font-medium hidden sm:inline">
                  Phiên Cố Vấn Tương Tác • Phòng Nghiên Cứu Minerva AI #3819
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-blue-700 font-semibold font-mono">
                  AI Socratic Đang Trực Tuyến
                </span>
              </div>
            </div>

            {/* Inner Content Grid: Socratic Chat (7 cols) + Radar (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">

              {/* Left Column: Socratic Advisor Chat Stream */}
              <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-slate-200/70 flex flex-col justify-between space-y-4 bg-white/70">
                <div className="space-y-4">

                  {/* Student Query */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                      HN
                    </div>
                    <div className="bg-slate-100/90 p-3.5 rounded-2xl rounded-tl-xs border border-slate-200/80 max-w-lg">
                      <p className="text-[11px] text-blue-700 font-bold mb-1">
                        Hoàng Nam (Khối A00 - Mục tiêu 29+)
                      </p>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans">
                        "Thưa Tiến sĩ Minerva, câu vận dụng cao tích phân hàm ẩn <code className="bg-blue-50 px-1 py-0.5 rounded text-blue-800 font-mono text-xs font-semibold">∫[0..1] f(x)dx = 3</code> này em đã đổi biến số nhưng vẫn bị tắc ở bước vi phân kép, hướng giải tối ưu là gì ạ?"
                      </p>
                    </div>
                  </div>

                  {/* AI Advisor Socratic Breakdown */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div className="bg-blue-50/70 p-4 rounded-2xl rounded-tl-xs border border-blue-200/60 space-y-3 max-w-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-blue-900 font-bold">Cố Vấn AI Socratic</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        {/* Audio Waveform Thinking Bars */}
                        <div className="flex items-end gap-1 px-2 py-1 rounded bg-white border border-blue-200">
                          <div className="w-0.5 bg-blue-500 rounded-full voice-wave-bar" style={{ animationDelay: '0s' }} />
                          <div className="w-0.5 bg-indigo-500 rounded-full voice-wave-bar" style={{ animationDelay: '0.2s' }} />
                          <div className="w-0.5 bg-cyan-500 rounded-full voice-wave-bar" style={{ animationDelay: '0.4s' }} />
                          <span className="text-[9px] font-mono text-blue-700 ml-1">0.4s</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        Chào Nam! Rất sắc bén khi em nhận ra phương pháp đổi biến số. Tuy nhiên hãy quan sát mối quan hệ giữa hàm <strong className="text-blue-800">f(x)</strong> và đại lượng liên hợp <strong className="text-blue-800">f(1-x)</strong>:
                      </p>

                      {/* Math LaTeX Block Component */}
                      <div className="p-3 bg-white rounded-xl border border-blue-200 text-xs font-mono space-y-1 shadow-xs">
                        <div className="text-slate-400 text-[10px]">// Phép biến đổi đối xứng qua tâm x = 1/2</div>
                        <div className="text-blue-700 font-semibold">Đặt: t = 1 - x  ⇒  dt = -dx</div>
                        <div className="text-emerald-700 font-bold">⇒ ∫[0..1] f(x)dx = ∫[0..1] f(1-t)dt = 1/2 ∫[0..1] [f(x) + f(1-x)]dx</div>
                      </div>

                      <p className="text-[11px] text-slate-500 italic">
                        💡 Câu hỏi gợi mở: "Khi cộng hai vế tích phân lại, biểu thức trong ngoặc có triệt tiêu được hệ số chứa sin(πx) không?"
                      </p>
                    </div>
                  </div>

                </div>

                {/* Interactive AI Chat Input Bar */}
                <div className="pt-3 border-t border-slate-200/70 flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 rounded-xl px-3.5 py-2.5 flex items-center gap-2 border border-slate-200 focus-within:border-blue-500">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <input
                      className="w-full bg-transparent border-none text-xs focus:ring-0 text-slate-800 placeholder-slate-400 p-0 focus:outline-none"
                      placeholder="Nhập câu hỏi hoặc tải ảnh đề bài (Toán, Lý, Hóa, ĐGNL)..."
                      type="text"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleStartChatWithPrompt((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleStartChatWithPrompt('Tích phân hàm ẩn đối xứng f(x) + f(1-x)')}
                    className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 hover:bg-blue-700 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Cognitive Radar & Academic Competency Tree */}
              <div className="lg:col-span-5 p-6 bg-slate-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <Activity className="w-4 h-4 text-blue-600" />
                      Radar Năng Lực 5 Trục (AI Diagnostic)
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Top 1% Toàn quốc
                    </span>
                  </div>

                  {/* 5-Axis Radar Matrix Visual */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 relative mb-4 shadow-xs">
                    <div className="flex justify-center items-center py-2">
                      <svg className="w-44 h-40" viewBox="0 0 200 180">
                        {/* Web Concentric Rings */}
                        <polygon fill="none" points="100,20 176,57 147,137 53,137 24,57" stroke="#e2e7ff" strokeWidth="1"></polygon>
                        <polygon fill="none" points="100,45 151,70 131,123 69,123 49,70" stroke="#e2e7ff" strokeWidth="1"></polygon>
                        <polygon fill="none" points="100,70 126,82 116,108 84,108 74,82" stroke="#dae2fd" strokeWidth="1"></polygon>
                        {/* Axis Rays */}
                        <line stroke="#dae2fd" strokeDasharray="2,2" strokeWidth="1" x1="100" x2="100" y1="90" y2="20"></line>
                        <line stroke="#dae2fd" strokeDasharray="2,2" strokeWidth="1" x1="100" x2="176" y1="90" y2="57"></line>
                        <line stroke="#dae2fd" strokeDasharray="2,2" strokeWidth="1" x1="100" x2="147" y1="90" y2="137"></line>
                        <line stroke="#dae2fd" strokeDasharray="2,2" strokeWidth="1" x1="100" x2="53" y1="90" y2="137"></line>
                        <line stroke="#dae2fd" strokeDasharray="2,2" strokeWidth="1" x1="100" x2="24" y1="90" y2="57"></line>
                        {/* User Strength Polygon Shape */}
                        <polygon fill="rgba(37, 99, 235, 0.2)" points="100,24 165,63 138,130 65,120 32,60" stroke="#2563eb" strokeWidth="2"></polygon>
                        {/* Vertex Points */}
                        <circle cx="100" cy="24" fill="#004ac6" r="3"></circle>
                        <circle cx="165" cy="63" fill="#004ac6" r="3"></circle>
                        <circle cx="138" cy="130" fill="#004ac6" r="3"></circle>
                        <circle cx="65" cy="120" fill="#004ac6" r="3"></circle>
                        <circle cx="32" cy="60" fill="#004ac6" r="3"></circle>
                      </svg>
                    </div>

                    {/* Dimension Badges */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Tư duy Đại số cao cấp:</span>
                        <span className="font-bold text-blue-600">96%</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Tốc độ giải trắc nghiệm:</span>
                        <span className="font-bold text-blue-600">92%</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Trực quan hình không gian:</span>
                        <span className="font-bold text-blue-600">88%</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Độ chính xác bài toán thực tế:</span>
                        <span className="font-bold text-blue-600">94%</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Card */}
                  <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/70 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-slate-700 leading-snug">
                      <strong className="text-slate-900 font-semibold">Khuyến nghị lộ trình 48h tới:</strong> Ôn tập 12 bài tập trọng điểm về Mặt Cầu Ngoại Tiếp &amp; Cực Trị Số Phức để chạm ngưỡng 9.8+ điểm môn Toán.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Đồng bộ dữ liệu Bộ GD&amp;ĐT 2025</span>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="text-[11px] text-blue-600 font-bold hover:underline inline-flex items-center"
                  >
                    Xem toàn bộ hồ sơ năng lực →
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. INTERACTIVE SOCRATIC PLAYGROUND ("THIÊN HÀ TRI THỨC")       */}
      {/* ============================================================== */}
      <section className="py-16 sm:py-24 relative bg-white/60 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Orbit className="w-3.5 h-3.5 text-blue-600" />
              <span>Phòng Thử Nghiệm Tri Thức Tương Tác</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trải Nghiệm Trực Quan Khả Năng Cố Vấn Từng Môn
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Bấm chọn từng môn học để thấy cách EduAdvisor AI mổ xẻ bài toán hóc búa và thắp sáng tư duy độc lập:
            </p>

            {/* Subject Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              {DEMO_SUBJECTS.map((sub) => {
                const isActive = activeSubject.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubject(sub)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                      : 'glass-floating text-slate-700 hover:bg-white hover:text-blue-600'
                      }`}
                  >
                    {sub.icon}
                    <span>{sub.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Subject Showcase Card */}
          <div className="max-w-4xl mx-auto">
            <div className="glass-floating rounded-3xl p-6 sm:p-8 border border-white shadow-xl relative overflow-hidden transition-all">

              {/* Top Meta info */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    {activeSubject.icon}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {activeSubject.name}
                    </h3>
                    <div className="text-xs text-blue-600 font-medium">
                      {activeSubject.tag}
                    </div>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {activeSubject.category}
                </div>
              </div>

              {/* Problem Statement */}
              <div className="py-4 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Vấn đề người học đặt ra:
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl text-slate-800 text-sm font-medium leading-relaxed">
                  "{activeSubject.question}"
                </div>
              </div>

              {/* Socratic Hint & Solution Grid */}
              <div className="grid md:grid-cols-2 gap-4 pt-2">

                {/* Socratic Questioning */}
                <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-100 space-y-2.5">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wide">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span>Cách AI Gợi Mở Tư Duy:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    {activeSubject.socraticHint}
                  </p>
                </div>

                {/* Mathematical / Technical Solution */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-2.5 font-mono">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>Mô Hình Hóa Giải Thuật:</span>
                  </div>
                  <div className="text-[12px] text-emerald-200 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/10 overflow-x-auto">
                    {activeSubject.solutionFormula}
                  </div>
                </div>

              </div>

              {/* Key Takeaway Banner */}
              <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium flex items-center justify-between flex-wrap gap-3">
                <span className="leading-relaxed">{activeSubject.keyTakeaway}</span>
                <button
                  onClick={() => handleStartChatWithPrompt(activeSubject.question)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 ml-auto"
                >
                  <span>Hỏi sâu hơn trong Chat AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. 3 CORE PILLARS (BA TRỤ CỘT ĐỘT PHÁ)                         */}
      {/* ============================================================== */}
      <section className="py-20 bg-slate-50/70 border-t border-slate-200" id="tinh-nang">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200">
              TRỤ CỘT CÔNG NGHỆ &amp; SƯ PHẠM
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Ba Nền Tảng Cốt Lõi Tạo Nên Sự Khác Biệt Của EduAdvisor AI
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Không đơn thuần là công cụ cung cấp đáp án có sẵn, hệ thống kết hợp trí tuệ nhân tạo thế hệ mới cùng phương pháp sư phạm gợi mở đỉnh cao.
            </p>
          </div>

          {/* Bento Grid Layout for 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Pillar 1: Socratic AI Advisor */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7" />
                </div>
                <div className="text-xs font-bold text-blue-600 mb-2">TRỤ CỘT 01</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Cố Vấn AI Socratic 24/7
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Không đưa đáp án rập khuôn khiến người học thụ động. AI đặt câu hỏi dẫn dắt từng bước, giải thích bản chất hình học và công thức đại số, rèn luyện tư duy độc lập giải quyết bài khó.
                </p>
                <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs font-medium text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Phân tích sâu bản chất mọi công thức</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tư vấn học thuật theo phong cách Socratic</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sẵn sàng giải đáp tức thì vào lúc 12h đêm</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4">
                <button
                  onClick={() => onNavigate('chat')}
                  className="text-xs font-bold text-blue-600 group-hover:translate-x-1 inline-flex items-center gap-1 transition-transform"
                >
                  <span>Tìm hiểu thuật toán sư phạm →</span>
                </button>
              </div>
            </div>

            {/* Pillar 2: Neural Adaptive Roadmap */}
            <div className="bg-white p-8 rounded-3xl border-2 border-blue-500/40 relative shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-sm">
                Thuật toán độc quyền
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md shadow-blue-500/20">
                  <Compass className="w-7 h-7" />
                </div>
                <div className="text-xs font-bold text-blue-600 mb-2">TRỤ CỘT 02</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Lộ Trình Tự Động Thích Ứng
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Thuật toán Neural Matrix liên tục quét qua các đề luyện để phát hiện chính xác lỗ hổng kiến thức tiềm ẩn, sau đó tự động tái cơ cấu thời khóa biểu, tối ưu 60 ngày nước rút đạt hiệu suất gấp 3 lần.
                </p>
                <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs font-medium text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bản đồ nhiệt lỗ hổng kiến thức từng chuyên đề</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Phân bổ thời gian học thông minh theo nhịp độ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mô phỏng xác suất trúng tuyển theo điểm chuẩn</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4">
                <button
                  onClick={() => onNavigate('roadmap')}
                  className="text-xs font-bold text-blue-600 group-hover:translate-x-1 inline-flex items-center gap-1 transition-transform"
                >
                  <span>Khám phá ma trận thích ứng →</span>
                </button>
              </div>
            </div>

            {/* Pillar 3: Standardized Exam & 1s OCR Engine */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="text-xs font-bold text-blue-600 mb-2">TRỤ CỘT 03</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Kho Tri Thức &amp; Đề Thi Chuẩn Hóa
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Hơn 10,000+ đề thi thử trường chuyên có giải chi tiết bám sát ma trận cấu trúc Bộ GD&amp;ĐT. Tích hợp công nghệ Math-OCR nhận diện đề thi viết tay từ ảnh chụp điện thoại chỉ trong 1 giây.
                </p>
                <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs font-medium text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>10,000+ Đề thi thử chọn lọc từ 63 tỉnh thành</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Quét OCR công thức toán phức tạp trong 1 giây</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thư viện phương pháp bấm máy Casio &amp; giải nhanh</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="text-xs font-bold text-blue-600 group-hover:translate-x-1 inline-flex items-center gap-1 transition-transform"
                >
                  <span>Tra cứu ngân hàng đề 2025 →</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. COMPARISON MATRIX (BẢNG SO SÁNH THỰC TIỄN CHI TIẾT)         */}
      {/* ============================================================== */}
      <section className="py-20 bg-white border-t border-slate-200" id="so-sanh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200">
              BẢNG PHÂN TÍCH THỰC TIỄN
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tại Sao Học Sinh Bứt Phá Điểm Nhanh Hơn Cùng EduAdvisor AI?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              So sánh trực quan giữa phương pháp học truyền thống phụ thuộc gia sư và mô hình Cố vấn Socratic thích ứng liên tục.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[760px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-5 text-xs font-bold text-slate-700 uppercase w-1/4">Tiêu Chí Đánh Giá</th>
                    <th className="p-5 text-xs font-bold text-blue-700 bg-blue-50/70 w-5/12 border-x border-blue-200">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>Nền Tảng EduAdvisor AI</span>
                      </div>
                    </th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase w-1/3">
                      Gia Sư &amp; Lớp Học Thêm Truyền Thống
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">

                  {/* Row 1: Response Time */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Thời gian phản hồi</span>
                    </td>
                    <td className="p-5 bg-blue-50/30 font-semibold text-blue-900 border-x border-blue-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Tức thì 24/7 (Dưới 0.5s), không gián đoạn bất kể ngày đêm</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-500">
                      Phải đợi đến lịch hẹn cố định (1-2 buổi/tuần); câu hỏi đêm muộn thường phải chờ đến hôm sau.
                    </td>
                  </tr>

                  {/* Row 2: Pedagogical Method */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 font-bold text-slate-900 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Phương pháp sư phạm</span>
                    </td>
                    <td className="p-5 bg-blue-50/30 font-semibold text-blue-900 border-x border-blue-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Gợi mở Socratic giúp hiểu sâu nguồn gốc, tự suy luận công thức</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-500">
                      Thường đọc chép giải sẵn hoặc học mẹo làm bài, học sinh dễ quên khi gặp đề biến đổi lạ.
                    </td>
                  </tr>

                  {/* Row 3: Investment Cost */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Chi phí đầu tư</span>
                    </td>
                    <td className="p-5 bg-blue-50/30 font-semibold text-emerald-700 border-x border-blue-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Tiết kiệm hơn 85% chi phí (Gói toàn diện chỉ tương đương vài buổi học thêm)</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-500">
                      Tốn kém 2,000,000đ – 5,000,000đ/tháng cho mỗi môn học kèm riêng.
                    </td>
                  </tr>

                  {/* Row 4: Personalization */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 font-bold text-slate-900 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Cá nhân hóa lộ trình</span>
                    </td>
                    <td className="p-5 bg-blue-50/30 font-semibold text-blue-900 border-x border-blue-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Thuật toán Neural Matrix cập nhật hồ sơ sau từng câu làm sai</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-500">
                      Dùng chung giáo trình đại trà cho cả lớp, giáo viên khó theo sát từng điểm yếu chi tiết.
                    </td>
                  </tr>

                  {/* Row 5: Exam Resource */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Ngân hàng tài liệu</span>
                    </td>
                    <td className="p-5 bg-blue-50/30 font-semibold text-blue-900 border-x border-blue-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>10,000+ đề thi chuẩn hóa cập nhật liên tục kèm ma trận phân tích</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-500">
                      Tài liệu in ấn hạn chế, tự photo tài liệu cũ nhiều sai sót hoặc chưa cập nhật dạng bài mới.
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. TESTIMONIALS (MINH CHỨNG THÀNH CÔNG TỪ THỦ KHOA)             */}
      {/* ============================================================== */}
      <section className="py-20 bg-slate-50/60 border-t border-slate-200" id="thanh-cong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200">
              MINH CHỨNG THÀNH CÔNG
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Từ Mông Lung Đến Điểm Số Dẫn Đầu Cùng Cố Vấn Học Thuật
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Lắng nghe chia sẻ thực tế từ các thủ khoa, sinh viên đại học danh tiếng đã đồng hành cùng EduAdvisor AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Testimonial 1 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    HN
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Nguyễn Hoàng Nam</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                        Thủ khoa Khối A00 (29.25đ)
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">Cựu học sinh Chuyên KHTN</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border-l-4 border-blue-600">
                  "Nhờ Tiến sĩ Minerva AI giải đáp lúc 11h đêm các câu vận dụng cao tích phân và sóng dừng, em tự tin tối ưu tốc độ làm đề trắc nghiệm mà không cần phụ thuộc bất kỳ lớp học thêm nào."
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                <span className="text-slate-500 font-medium">Tăng điểm sau 60 ngày:</span>
                <span className="font-bold text-blue-600 text-sm">+2.75 Điểm</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    MT
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Lê Minh Trang</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">
                        Sinh viên CNTT K68 - ĐHBK Hà Nội
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">Học bổng Xuất Sắc Kỳ 1</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border-l-4 border-indigo-600">
                  "Hệ thống radar đánh giá năng lực chỉ rõ phần đại số tuyến tính mình bị hổng, giúp mình lấy lại A+ môn Toán cao cấp trong sự ngỡ ngàng của bạn bè cùng khóa."
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                <span className="text-slate-500 font-medium">GPA Toán Đại cương:</span>
                <span className="font-bold text-indigo-600 text-sm">3.9 / 4.0 (A+)</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    BL
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Trần Bảo Long</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        Kỳ thi ĐGNL ĐHQG (1020/1200)
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">Trúng tuyển Nguyện Vọng 1</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border-l-4 border-emerald-600">
                  "Lộ trình nước rút tự động điều chỉnh bài tập theo điểm mạnh điểm yếu thực sự giúp tiết kiệm hàng trăm giờ mò mẫm. Phần tư duy định lượng tăng vọt 80 điểm chỉ sau 3 tuần."
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                <span className="text-slate-500 font-medium">Điểm ĐGNL đạt được:</span>
                <span className="font-bold text-emerald-600 text-sm">1020 / 1200</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. FAQ ACCORDION SECTION (CÂU HỎI THƯỜNG GẶP)                   */}
      {/* ============================================================== */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200">
              GIẢI ĐÁP THẮC MẮC
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Những Câu Hỏi Thường Gặp Về EduAdvisor AI
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_LIST.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/90 overflow-hidden transition-all bg-slate-50/50 hover:bg-slate-50"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. FINAL BANNER CTA & COMPREHENSIVE ACADEMIC FOOTER            */}
      {/* ============================================================== */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white relative overflow-hidden" id="dang-ky">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Khởi Động Ngay Hôm Nay</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto">
            Sẵn Sàng Bứt Phá Điểm Số Cùng EduAdvisor AI?
          </h2>

          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Tham gia cùng hơn 50,000+ sĩ tử và sinh viên đang nâng tầm phương pháp tự học. Đăng ký ngay để nhận trọn bộ đề thi thử chọn lọc kèm phân tích ma trận độc quyền.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('chat')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-sm sm:text-base shadow-xl hover:bg-slate-100 transition-transform active:scale-95 inline-flex items-center justify-center gap-2"
            >
              <span>Kích hoạt dùng thử 14 ngày miễn phí</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-transparent border border-white/40 hover:bg-white/10 text-white font-semibold text-sm sm:text-base transition-all"
            >
              Khám Phá Bảng Điều Khiển
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Bảo mật thông tin 100%
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Hủy đăng ký bất cứ lúc nào
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Hỗ trợ học vụ 24/7
            </span>
          </div>

        </div>
      </section>

      {/* Comprehensive Academic Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">

            {/* Column 1: Brand & Mission */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight font-serif">
                  EduAdvisor <span className="text-blue-500 font-sans font-extrabold">AI</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
                Hệ sinh thái cố vấn học thuật ứng dụng trí tuệ nhân tạo Socratic hàng đầu Việt Nam. Nâng đỡ tri thức, đồng hành cùng thế hệ tương lai chạm đến ngưỡng cửa đại học mơ ước.
              </p>
              <div className="text-xs text-slate-400 space-y-1 pt-2">
                <p>Hotline Hỗ Trợ Học Vụ: <strong className="text-white">0796727753 (24/7)</strong></p>
                <p>Email Học Thuật: <strong className="text-white">mingbeo100@Gmail.com</strong></p>
              </div>
            </div>

            {/* Column 2: Academics */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white tracking-wider uppercase">Học Thuật &amp; Khối Thi</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">Ma trận đề Tốt nghiệp THPT</button></li>
                <li><button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">Luyện đề ĐGNL ĐHQG</button></li>
                <li><button onClick={() => onNavigate('chat')} className="hover:text-white transition-colors">Toán cao cấp &amp; Đại số tuyến tính</button></li>
                <li><button onClick={() => onNavigate('roadmap')} className="hover:text-white transition-colors">Khoá bứt phá Vận dụng cao 9+</button></li>
                <li><button onClick={() => onNavigate('chat')} className="hover:text-white transition-colors">Thư viện công thức LaTeX</button></li>
              </ul>
            </div>

            {/* Column 3: AI Tools */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white tracking-wider uppercase">Công Cụ Trợ Lực AI</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => onNavigate('chat')} className="hover:text-white transition-colors">Cố vấn giải đề Socratic 24/7</button></li>
                <li><button onClick={() => onNavigate('chat')} className="hover:text-white transition-colors">Quét ảnh đề bài Math OCR 1s</button></li>
                <li><button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">Mô phỏng phân phối điểm thi</button></li>
                <li><button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">Tính điểm xét tuyển đại học</button></li>
                <li><button onClick={() => onNavigate('roadmap')} className="hover:text-white transition-colors">Lập kế hoạch ôn tập cá nhân</button></li>
              </ul>
            </div>

            {/* Column 4: Standards & Ethics */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white tracking-wider uppercase">Tiêu Chuẩn Học Thuật</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><span className="hover:text-white transition-colors cursor-pointer">Quy tắc liêm chính học thuật</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Chính sách bảo mật dữ liệu</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Cam kết không gian lận thi cử</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Điều khoản dịch vụ hội viên</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Hội đồng cố vấn giảng viên</span></li>
              </ul>
            </div>

          </div>

          {/* Bottom Legal Notice */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>
              © 2025 EduAdvisor AI Systems Inc. Tất cả quyền được bảo lưu. Thiết kế tuân thủ tiêu chuẩn giáo dục số chuẩn quốc gia.
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-300 transition-colors cursor-pointer">Điều khoản</span>
              <span className="hover:text-slate-300 transition-colors cursor-pointer">Bảo mật</span>
              <span className="hover:text-slate-300 transition-colors cursor-pointer">Học bổng Sĩ tử</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
