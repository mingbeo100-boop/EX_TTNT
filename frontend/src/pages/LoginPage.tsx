import React, { useState, useEffect } from 'react';
import { PageType, User } from '../types';
import { api } from '../services/api';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  User as UserIcon, 
  School,
  Target,
  Compass,
  Lightbulb,
  Award,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Check,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: PageType) => void;
  onLoginSuccess?: (user: User) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement | null, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  // Steps: 'login' | 'verify_otp' | 'onboarding'
  const [authStep, setAuthStep] = useState<'login' | 'verify_otp' | 'onboarding'>('login');
  
  // Real Google User Info after login
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  // Form states for login (Email học sinh đăng nhập, máy chủ gửi OTP là mingbeo100@gmail.com)
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const [googleClientId, setGoogleClientId] = useState(() => {
    return localStorage.getItem('eduadvisor_google_client_id') || (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  });
  const [showConfigClientId, setShowConfigClientId] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Roadmap Initialization Form (Only after logging in & verifying email)
  const [school, setSchool] = useState('THPT Chuyên Chu Văn An');
  const [targetExam, setTargetExam] = useState('THPT_QG');
  const [currentLevel, setCurrentLevel] = useState('Khá (7 - 8.5 điểm)');
  const [targetScore, setTargetScore] = useState('27.5+');
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([
    'Gợi mở phương pháp giải Socratic (không spoil đáp án)',
    'Luyện đề thi thử các trường Chuyên và chuẩn hóa phản xạ',
    'Thủ thuật bấm máy tính Casio giải nhanh'
  ]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Initialize Google Identity Services (GSI)
  useEffect(() => {
    initGoogleGSI();
  }, [googleClientId]);

  const initGoogleGSI = () => {
    if (!window.google?.accounts?.id) return;
    const effectiveClientId = googleClientId.trim();
    if (!effectiveClientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: effectiveClientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const btnContainer = document.getElementById('gsi-official-button');
      if (btnContainer) {
        btnContainer.innerHTML = '';
        window.google.accounts.id.renderButton(btnContainer, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'left',
          width: 320
        });
      }
    } catch (e) {
      console.warn('Google GSI notice:', e);
    }
  };

  // Google GSI OAuth credential response
  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      let email = '';
      let name = '';
      let picture = '';

      try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        email = payload.email || '';
        name = payload.name || '';
        picture = payload.picture || '';
      } catch (err) {
        console.warn('Client JWT decode notice:', err);
      }

      const res = await api.googleAuth({
        id_token: response.credential,
        email: email || undefined,
        full_name: name || undefined,
        avatar_url: picture || undefined
      });

      handlePostLogin(res);
    } catch {
      setIsLoading(false);
      setAuthError('Đăng nhập Google thất bại. Vui lòng thử lại hoặc sử dụng xác thực qua mã OTP Gmail.');
    }
  };

  // Đăng nhập trực tiếp với tài khoản mặc định mingbeo100@gmail.com
  const handleDirectLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase() || 'mingbeo100@gmail.com';
    const cleanName = googleName.trim() || 'Minh Béo';

    const defaultUser: User = {
      id: cleanEmail === 'mingbeo100@gmail.com' ? 'user_mingbeo100' : 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'),
      email: cleanEmail,
      full_name: cleanName,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail.split('@')[0]}`,
      access_token: 'mingbeo_token_' + Date.now(),
      needs_onboarding: false,
      profile: {
        id: cleanEmail === 'mingbeo100@gmail.com' ? 'user_mingbeo100' : 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'),
        email: cleanEmail,
        full_name: cleanName,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail.split('@')[0]}`,
        school: 'THPT Chu Văn An',
        target_exam: 'THPT_QG',
        target_score: '28.0 Điểm (Khối A00)',
        current_level: 'Khá Giỏi (8.0+)',
        focus_subjects: ['Toán học', 'Vật lý', 'Hóa học'],
        learning_needs: ['Chinh phục câu Vận dụng cao 9+', 'Luyện đề thi thử chuẩn cấu trúc 2025'],
        streak_days: 14,
        avg_score: 8.8,
        study_hours: 28.5,
        solved_problems: 342
      }
    };

    api.setUser(defaultUser);
    if (onLoginSuccess) {
      onLoginSuccess(defaultUser);
    }
    onNavigate('dashboard');
  };

  // Step 1: Send OTP to Gmail qua máy chủ hệ thống (mingbeo100@gmail.com)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await api.sendOtp(cleanEmail);
      setIsLoading(false);
      if (res && res.status === 'error') {
        setAuthError(res.message || 'Không thể gửi email lúc này do máy chủ gửi mail quá tải. Vui lòng thử lại sau hoặc dùng tài khoản Demo.');
        return;
      }
      setAuthStep('verify_otp');
      setResendCountdown(60);
    } catch {
      setIsLoading(false);
      setAuthError('Không thể kết nối đến máy chủ gửi email. Vui lòng kiểm tra lại kết nối mạng.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setAuthError('Vui lòng nhập đủ mã xác thực 6 chữ số.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    const cleanEmail = googleEmail.trim().toLowerCase();
    const cleanName = googleName.trim() || cleanEmail.split('@')[0];

    try {
      const { ok, data } = await api.verifyOtp({
        email: cleanEmail,
        otp_code: otpCode.trim(),
        full_name: cleanName
      });

      setIsLoading(false);

      if (ok && data.user_id) {
        handlePostLogin(data);
      } else {
        setAuthError(data.detail || 'Mã xác thực không chính xác hoặc đã hết hạn.');
      }
    } catch {
      setIsLoading(false);
      setAuthError('Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.');
    }
  };

  // Process login result
  const handlePostLogin = (res: any) => {
    setIsLoading(false);
    setLoggedInUser(res);

    if (onLoginSuccess) {
      onLoginSuccess(res);
    }

    // Kiểm tra nếu tài khoản đã có lộ trình hoặc hồ sơ thì KHÔNG cần tạo lại nữa
    const hasExistingRoadmap = !res.needs_onboarding || (res.profile && res.profile.school && res.profile.school !== 'Chưa có');
    if (!hasExistingRoadmap) {
      setAuthStep('onboarding');
      if (res.full_name) {
        setGoogleName(res.full_name);
      }
    } else {
      onNavigate('dashboard');
    }
  };

  // Step 3: Initialize Roadmap
  const handleInitializeRoadmap = async () => {
    if (!loggedInUser) return;
    setIsLoading(true);

    try {
      const res = await api.submitOnboarding({
        user_id: loggedInUser.id,
        full_name: loggedInUser.full_name || googleName || 'Học viên Google',
        school: school.trim() || 'THPT Chuyên',
        target_exam: targetExam,
        target_score: targetScore,
        current_level: currentLevel,
        focus_subjects: getSubjectsForExam(targetExam),
        learning_needs: selectedNeeds
      });

      setIsLoading(false);
      if (onLoginSuccess && res.user) {
        onLoginSuccess(res.user);
      }
      onNavigate('roadmap');
    } catch {
      setIsLoading(false);
      onNavigate('roadmap');
    }
  };

  const getSubjectsForExam = (exam: string) => {
    if (exam === 'THPT_QG') return ['Toán học', 'Vật lý', 'Hóa học'];
    if (exam === 'DGNL_DHQG') return ['Tư duy Logic', 'Xử lý số liệu', 'Khoa học Tự nhiên'];
    if (exam === 'DAI_HOC_GPA') return ['Giải tích 1', 'Đại số tuyến tính', 'Cấu trúc dữ liệu & Thuật toán'];
    return ['Toán nền tảng', 'Vật lý cơ bản', 'Hóa học tổng quát'];
  };

  const toggleNeed = (need: string) => {
    setSelectedNeeds(prev => 
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
  };

  // ==========================================
  // RENDER BƯỚC 3: KHỞI TẠO LỘ TRÌNH (Sau khi đã đăng nhập & xác thực mail)
  // ==========================================
  if (authStep === 'onboarding' && loggedInUser) {
    return (
      <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
        <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Header với Huy hiệu Tài khoản Gmail đã xác thực */}
          <div className="border-b border-slate-100 pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={loggedInUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${loggedInUser.email}`} 
                    alt={loggedInUser.full_name} 
                    className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover shadow-xs"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white">
                    ✓
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{loggedInUser.full_name}</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Gmail Đã Xác Thực
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{loggedInUser.email}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Bước 2: Khởi tạo Lộ trình
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-500" />
                Thiết Lập Lộ Trình Học Tập Cá Nhân Hóa
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Tài khoản Gmail của bạn đã được kết nối an toàn. Hãy cho Cố vấn AI biết mục tiêu học tập để khởi tạo lộ trình tối ưu nhất.
              </p>
            </div>
          </div>

          {/* Form lựa chọn mục tiêu học tập */}
          <div className="space-y-6">
            
            {/* 1. Trường học */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-blue-600" />
                Trường THPT / Đại Học Bạn Đang Học
              </label>
              <input 
                type="text" 
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Ví dụ: THPT Chuyên Chu Văn An, THPT Amsterdam, ĐH Bách Khoa..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              />
            </div>

            {/* 2. Mục tiêu kỳ thi */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                Kỳ Thi Trọng Tâm Bạn Muốn Chinh Phục
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'THPT_QG', title: 'Thi Tốt Nghiệp THPT Quốc Gia', desc: 'Khối A00 (Toán - Lý - Hóa) & A01 (Toán - Lý - Anh)', icon: '🎯' },
                  { id: 'DGNL_DHQG', title: 'Đánh Giá Năng Lực ĐHQG', desc: 'Tư duy logic, giải quyết vấn đề và phân tích số liệu', icon: '🧠' },
                  { id: 'DAI_HOC_GPA', title: 'Nâng Cao GPA Đại Học', desc: 'Toán cao cấp (Giải tích, Đại số), Cấu trúc dữ liệu', icon: '🎓' },
                  { id: 'LAY_GOC', title: 'Lấy Lại Gốc Cấp Tốc (30 Ngày)', desc: 'Lấy lại nền tảng kiến thức bị hổng từ con số 0', icon: '🚀' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTargetExam(item.id);
                      if (item.id === 'DGNL_DHQG') setTargetScore('900+ ĐGNL');
                      else if (item.id === 'DAI_HOC_GPA') setTargetScore('A / A+ (GPA 3.6+)');
                      else if (item.id === 'LAY_GOC') setTargetScore('7.0+ Điểm');
                      else setTargetScore('27.5+');
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      targetExam === item.id 
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                      <span>{item.icon}</span>
                      <span>{item.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 pl-6">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Trình độ hiện tại & Điểm số mục tiêu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  Trình Độ Năng Lực Hiện Tại
                </label>
                <select 
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white"
                >
                  <option value="Mất gốc (Dưới 5.0 điểm)">Mất gốc (Dưới 5.0 điểm) - Cần bù đắp căn bản</option>
                  <option value="Trung bình (5.0 - 7.0 điểm)">Trung bình (5.0 - 7.0 điểm) - Vững kiến thức cơ bản</option>
                  <option value="Khá (7 - 8.5 điểm)">Khá (7.0 - 8.5 điểm) - Cần bứt phá dạng khó</option>
                  <option value="Vận dụng cao (8.5 - 10 điểm)">Vận dụng cao (8.5 - 10 điểm) - Mục tiêu thủ khoa</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  Điểm Số Kỳ Vọng Chinh Phục
                </label>
                <input 
                  type="text" 
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  placeholder="Ví dụ: 28.5+, 950+ ĐGNL, GPA 3.8..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
            </div>

            {/* 4. Nhu cầu hỗ trợ từ AI */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Phương Pháp Bạn Muốn Cố Vấn AI Đồng Hành
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'Gợi mở phương pháp giải Socratic (không spoil đáp án)',
                  'Sửa lỗi sai chuyên sâu và phân tích bẫy đề thi',
                  'Luyện đề thi thử các trường Chuyên và chuẩn hóa phản xạ',
                  'Thủ thuật bấm máy tính Casio giải nhanh',
                  'Tái phân bổ thời khóa biểu tự động khi có bài tập yếu'
                ].map(need => {
                  const isChecked = selectedNeeds.includes(need);
                  return (
                    <button
                      key={need}
                      type="button"
                      onClick={() => toggleNeed(need)}
                      className={`p-2.5 rounded-xl border text-left text-xs flex items-center gap-2.5 transition-colors ${
                        isChecked 
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                        isChecked ? 'bg-blue-600 border-blue-600 text-white text-[10px]' : 'border-slate-300'
                      }`}>
                        {isChecked && '✓'}
                      </span>
                      <span>{need}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Để sau, vào thẳng Dashboard →
            </button>

            <button
              type="button"
              onClick={handleInitializeRoadmap}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>AI Đang Khởi Tạo Lộ Trình...</span>
                </>
              ) : (
                <>
                  <span>Khởi Tạo Lộ Trình Của Tôi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER BƯỚC 2: XÁC THỰC MÃ OTP GỬI VỀ GMAIL
  // ==========================================
  if (authStep === 'verify_otp') {
    return (
      <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              Xác Nhận Tài Khoản Gmail
            </h2>
            <p className="text-xs text-slate-500">
              Mã xác thực 6 số đã được gửi đến: <strong className="text-blue-700">{googleEmail}</strong>
            </p>
          </div>

          {/* Thông báo gửi mã từ máy chủ mingbeo100@gmail.com */}
          <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200/80 text-blue-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-800">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Kiểm tra hòm thư Gmail của bạn</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Mã xác thực 6 số đã được gửi tự động tới địa chỉ <strong className="text-blue-900">{googleEmail}</strong>.
            </p>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              ⚠️ <strong>Lưu ý quan trọng:</strong> Nếu không thấy ở Hộp thư chính (Primary), vui lòng kiểm tra thư mục <strong>Thư rác (Spam / Junk)</strong> hoặc tab <strong>Quảng cáo / Cập nhật (Promotions)</strong>.
            </div>
            <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDirectLogin}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                Hoặc vào nhanh bằng tài khoản Demo
              </button>
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold transition-colors shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Mở Gmail ↗</span>
              </a>
            </div>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nhập mã xác thực 6 chữ số</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-sm shadow-md shadow-blue-500/10 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Đang kiểm tra mã...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Xác Nhận &amp; Tiếp Tục</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthStep('login');
                setOtpCode('');
                setAuthError(null);
              }}
              className="text-slate-500 hover:text-slate-800 font-medium"
            >
              ← Đổi email khác
            </button>

            <button
              type="button"
              onClick={() => handleSendOtp()}
              disabled={resendCountdown > 0 || isLoading}
              className="text-blue-600 hover:text-blue-800 disabled:text-slate-400 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resendCountdown > 0 ? `Gửi lại sau ${resendCountdown}s` : 'Gửi lại mã'}</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER BƯỚC 1: ĐĂNG NHẬP GMAIL / GOOGLE
  // ==========================================
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid lg:grid-cols-12">
        
        {/* Left Inspirational Banner */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-10 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

          {/* Brand header */}
          <div className="space-y-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-serif text-2xl font-bold tracking-tight">EduAdvisor AI</div>
              <p className="text-xs text-blue-100 font-medium">Nền tảng Cố vấn Học thuật Thông minh</p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="space-y-4 relative z-10 my-8">
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3">
              <div className="flex items-center gap-1 text-amber-300">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs sm:text-sm text-blue-50 leading-relaxed italic">
                "Xác thực tài khoản Gmail thật nhanh chóng, sau đó AI tự động thiết kế lộ trình 90 ngày bám sát ma trận đề thi trường chuyên!"
              </p>
              <div className="flex items-center gap-2.5 pt-1">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  TH
                </div>
                <div>
                  <div className="text-xs font-bold">Trần Thu Hà</div>
                  <div className="text-[10px] text-blue-200">ĐH Ngoại Thương Hà Nội</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-blue-100 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Kết nối tài khoản Gmail thật &amp; xác nhận qua mã bảo mật</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Khởi tạo lộ trình cá nhân hóa sau khi đăng nhập</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Cố vấn Socratic AI giải toán và lý chuyên sâu</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-blue-200/80 relative z-10">
            © 2026 EduAdvisor AI Platform. Dữ liệu học sinh được bảo mật trên SQLite.
          </div>
        </div>

        {/* Right Form: Đăng nhập Gmail thật & Xác nhận */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-8">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đăng Nhập Tài Khoản Thật</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Kết Nối Tài Khoản Gmail
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Nhập email Gmail thật của bạn để nhận mã xác nhận và bắt đầu khởi tạo lộ trình học tập cá nhân hóa.
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <p>{authError}</p>
            </div>
          )}

          {/* Main Form: Kết nối Gmail & Xác nhận Mail */}
          <div className="space-y-5">
            
            {/* 1. Official Google Identity Services Button Container (If client ID is active) */}
            <div id="gsi-official-button" className="flex justify-center"></div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  Địa Chỉ Email Của Bạn
                </label>
                <div className="relative">
                  <input 
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="ví dụ: hocsinh@gmail.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    required
                  />
                  <div className="absolute right-3 top-3 text-[11px] font-bold text-slate-400 pointer-events-none">
                    @gmail.com
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                  Họ Và Tên Học Sinh
                </label>
                <input 
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Hoàng Nam"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-white" />
                <span>{isLoading ? 'Đang gửi mã OTP...' : `Nhận Mã Xác Nhận OTP Qua Email`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-blue-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Tài khoản gửi OTP hệ thống: mingbeo100@gmail.com</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Hệ thống EduAdvisor AI sử dụng máy chủ gửi bảo mật <strong>mingbeo100@gmail.com</strong> để tự động chuyển phát mã OTP xác thực 6 số đến hòm thư của bạn.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
