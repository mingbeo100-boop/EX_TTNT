import React, { useState, useEffect, useRef } from 'react';
import { PageType, User } from '../types';
import { 
  GraduationCap, 
  Clock, 
  Search, 
  Bell, 
  LayoutDashboard, 
  MessageSquareText, 
  Milestone, 
  Home, 
  Sparkles, 
  User as UserIcon, 
  ShieldCheck,
  X,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Check,
  Upload,
  Camera,
  Image,
  ExternalLink,
  ChevronDown,
  LogOut,
  Flame,
  BookOpen,
  Atom,
  Zap,
  Compass,
  Brain
} from 'lucide-react';
import { api } from '../services/api';
import { studySyncService } from '../services/studySyncService';

interface NavbarProps {
  currentPage: PageType;
  onPageChange: (page: PageType, initialPrompt?: string) => void;
  currentUser?: string;
  isLoggedIn?: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'academic' | 'streak' | 'exam' | 'system';
  actionPage?: PageType;
  actionPrompt?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Lộ trình bứt phá Toán 9+',
    desc: 'Minerva AI vừa cập nhật 5 bài tập Vận dụng cao Tích phân hàm ẩn bám sát đề Chuyên Sư Phạm 2025.',
    time: '15 phút trước',
    read: false,
    type: 'academic',
    actionPage: 'chat',
    actionPrompt: 'Hướng dẫn giải chi tiết 5 bài tập vận dụng cao tích phân hàm ẩn'
  },
  {
    id: 'n2',
    title: 'Duy trì chuỗi học tập 7 ngày! 🔥',
    desc: 'Bạn đã đạt mốc 7 ngày liên tục. Thưởng 1 huy hiệu "Sĩ tử Kiên trì" vào hồ sơ năng lực.',
    time: '2 giờ trước',
    read: false,
    type: 'streak',
    actionPage: 'profile'
  },
  {
    id: 'n3',
    title: 'Đề thi thử ĐGNL ĐHQG Mới',
    desc: 'Đã có phân tích ma trận tư duy logic và ma trận đề thi mẫu ĐGNL mới nhất 2025.',
    time: 'Hôm qua',
    read: false,
    type: 'exam',
    actionPage: 'dashboard'
  },
  {
    id: 'n4',
    title: 'Kích hoạt Cố vấn Socratic 24/7',
    desc: 'Chào mừng bạn đến với EduAdvisor AI! Tất cả tính năng OCR và công thức LaTeX đã sẵn sàng.',
    time: '3 ngày trước',
    read: true,
    type: 'system',
    actionPage: 'landing'
  }
];

// 12 Curated Avatars
const PRESET_AVATARS = [
  { id: 'av1', label: 'Thủ khoa Bách Khoa', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { id: 'av2', label: 'Bác sĩ Tương Lai', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria' },
  { id: 'av3', label: 'Sĩ tử Chuyên KHTN', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper' },
  { id: 'av4', label: 'Chuyên gia Kinh Tế', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe' },
  { id: 'av5', label: 'Phi hành gia AI', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Minerva' },
  { id: 'av6', label: 'Học giả Trẻ', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Alex' },
  { id: 'av7', label: 'Thủ khoa IELTS 8.5', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Sarah' },
  { id: 'av8', label: 'Nhà Toán Học', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Jack' },
  { id: 'av9', label: 'Lập trình viên CNTT', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Luna' },
  { id: 'av10', label: 'Thám tử Logic ĐGNL', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sam' },
  { id: 'av11', label: 'Nữ sinh Năng Động', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya' },
  { id: 'av12', label: 'Chú Cáo Tri Thức', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Spark' }
];

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPage, 
  onPageChange, 
  currentUser: initialUserName = 'Học viên',
  isLoggedIn = true 
}) => {
  const [user, setUser] = useState<User | null>(api.getUser());
  const [userName, setUserName] = useState<string>(user?.full_name || initialUserName);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(user?.avatar_url);

  const adminToken = api.getAdminToken();
  const adminEmails = ['longtn.24itb@vku.udn.vn', 'mingbeo100@gmail.com'];
  const isAuthorizedAdmin = !!adminToken || (!!user?.email && adminEmails.includes(user.email.toLowerCase()));

  // Navbar Scroll Visibility
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Modals & Popovers States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);

  // Identity Form State
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sync user updates in real-time across the app
  useEffect(() => {
    const handleUserUpdate = (e: any) => {
      const updated = e.detail || api.getUser();
      if (updated) {
        setUser(updated);
        setUserName(updated.full_name || 'Học viên');
        setUserAvatar(updated.avatar_url);
      }
    };

    window.addEventListener('eduadvisor_user_updated', handleUserUpdate);
    return () => window.removeEventListener('eduadvisor_user_updated', handleUserUpdate);
  }, []);

  // Real-time synchronization with AI Chat exercises & streak progress
  useEffect(() => {
    let lastCompletedCount = studySyncService.getActiveContext().completedExercises.length;
    let lastStreak = studySyncService.getActiveContext().streakDays;

    const unsubscribe = studySyncService.subscribe((ctx) => {
      // 1. Check if new exercises completed
      if (ctx.completedExercises.length > lastCompletedCount) {
        const newlyAdded = ctx.completedExercises.length - lastCompletedCount;
        lastCompletedCount = ctx.completedExercises.length;
        
        const latestId = ctx.completedExercises[ctx.completedExercises.length - 1];
        const exName = latestId.includes('match') ? 'Ghép Đôi Công Thức Đối Xứng'
          : latestId.includes('order') ? 'Sắp Xếp Bước Khử Ẩn'
          : latestId.includes('trap') ? 'Vượt Bẫy Đề Thi'
          : latestId.includes('vdc') ? 'Tích Phân Hàm Ẩn VDC'
          : 'Bài tập Chuyên Sâu';

        const newNotif: NotificationItem = {
          id: 'sync_ex_' + Date.now(),
          title: `🎯 Hoàn thành ${newlyAdded > 1 ? `${newlyAdded} bài tập` : exName}!`,
          desc: `Bạn vừa giải quyết thành công bài tập cùng Cố vấn AI. Radar năng lực đã tăng điểm & cập nhật vào hồ sơ!`,
          time: 'Vừa xong',
          read: false,
          type: 'academic',
          actionPage: 'profile'
        };

        setNotifications(prev => [newNotif, ...prev]);
      }

      // 2. Check if streak increased
      if (ctx.streakDays > lastStreak) {
        lastStreak = ctx.streakDays;
        const newNotif: NotificationItem = {
          id: 'sync_streak_' + Date.now(),
          title: `🔥 Chuỗi học tập bứt phá: ${ctx.streakDays} ngày!`,
          desc: `Bạn đã tích lũy điểm kỷ luật học tập. Tiếp tục giữ vững phong độ cùng Cố vấn AI nhé!`,
          time: 'Vừa xong',
          read: false,
          type: 'streak',
          actionPage: 'profile'
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    });

    return unsubscribe;
  }, []);

  // Listen to Global Shortcut (Ctrl + K) for Spotlight Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
        setIsUserMenuOpen(false);
        setIsIdentityModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto focus search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Click outside to close notifications & user menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      if (currentPage === 'chat') {
        setIsVisible(true);
        return;
      }
      const currentScrollY = window.scrollY;
      if (currentScrollY > 80 && currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, currentPage]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    setIsNotificationsOpen(false);
    if (item.actionPage) {
      onPageChange(item.actionPage, item.actionPrompt);
    }
  };

  const openIdentityModal = () => {
    const current = api.getUser();
    setEditName(current?.full_name || userName);
    setEditAvatar(current?.avatar_url || userAvatar || PRESET_AVATARS[0].url);
    setIsUserMenuOpen(false);
    setIsIdentityModalOpen(true);
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setIsSavingIdentity(true);
    const current = api.getUser();
    const userId = current?.id || 'user_' + Date.now();

    const updated = await api.updateUserIdentity({
      user_id: userId,
      full_name: editName.trim(),
      avatar_url: editAvatar
    });

    if (updated) {
      setUser(updated);
      setUserName(updated.full_name);
      setUserAvatar(updated.avatar_url);
    }

    setIsSavingIdentity(false);
    setIsIdentityModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert image to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setEditAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Search Results Filter
  const SEARCH_ITEMS = [
    { type: 'page', title: 'Trang chủ (Landing Page)', desc: 'Tổng quan công nghệ Socratic và các tính năng', page: 'landing' as PageType },
    { type: 'page', title: 'Bảng Điều Khiển (Dashboard)', desc: 'Theo dõi tiến độ, Radar 5 trục và bài tập ngày', page: 'dashboard' as PageType },
    { type: 'page', title: 'Chat Cố Vấn AI Minerva', desc: 'Hỏi đáp bài tập, OCR ảnh chụp và công thức LaTeX', page: 'chat' as PageType },
    { type: 'page', title: 'Lộ Trình Học Tập Cá Nhân Hóa', desc: 'Ma trận Neural Roadmap 4 giai đoạn bứt phá', page: 'roadmap' as PageType },
    { type: 'page', title: 'Hồ Sơ Cá Nhân Học Viên', desc: 'Quản lý thông tin, mục tiêu điểm số và trường thi', page: 'profile' as PageType },
    ...(isAuthorizedAdmin ? [{ type: 'page', title: 'Trang Quản Trị Hệ Thống (Admin DB)', desc: 'Xem database, logs truy cập và OTP', page: 'admin' as PageType }] : []),
    { type: 'prompt', title: 'Tích phân hàm ẩn đối xứng f(x) + 2f(1-x)', desc: 'Toán học • Dạng bài 9+ Chuyên Sư Phạm', prompt: 'Cho hàm ẩn f(x) + 2f(1-x) = 3x^2 - x. Hướng dẫn cách giải nhanh đối xứng dưới 2 phút' },
    { type: 'prompt', title: 'Lực Lorentz & Bán kính quỹ đạo cực đại', desc: 'Vật lý 12 • Hiện tượng quang điện & Từ trường', prompt: 'Giải thích mối quan hệ giữa quang điện ngoài Anh-xtanh và bán kính quỹ đạo electron trong từ trường đều' },
    { type: 'prompt', title: 'Paraphrase C1/C2 IELTS Writing Task 2', desc: 'Tiếng Anh Academic • Cụm từ vựng nâng band 8.0+', prompt: 'Paraphrase các cụm từ phổ biến trong IELTS Writing Task 2 chủ đề Environment sang chuẩn C1/C2' },
    { type: 'prompt', title: 'Mẹo suy luận bàn tròn tư duy logic ĐGNL', desc: 'Kỳ thi ĐGNL ĐHQG • Phương pháp điểm neo Anchor', prompt: 'Phương pháp giải nhanh bài toán phân bố vị trí bàn tròn ĐGNL ĐHQG' },
    { type: 'prompt', title: 'Khảo sát cực trị hàm số bậc 4 trùng phương', desc: 'Toán giải tích • Ứng dụng đạo hàm', prompt: 'Điều kiện để hàm số bậc 4 trùng phương có 3 điểm cực trị tạo thành tam giác vuông cân' }
  ];

  const filteredSearch = SEARCH_ITEMS.filter(item => 
    !searchQuery.trim() || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* ============================================================== */}
      {/* MAIN NAVBAR CONTAINER                                          */}
      {/* ============================================================== */}
      <header className={`sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo */}
          <div 
            onClick={() => onPageChange('landing')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                  EduAdvisor <span className="text-blue-600 font-sans font-extrabold">AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider">
                  v2.4
                </span>
              </div>
              <p className="hidden xl:block text-[10px] text-slate-400 font-medium mt-1 leading-none whitespace-nowrap">
                Cố vấn Học thuật Thông minh Socratic
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70 shrink-0">
            <button
              onClick={() => onPageChange('landing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                currentPage === 'landing'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Home className="w-3.5 h-3.5 shrink-0" />
              <span>Trang chủ</span>
            </button>
            
            <button
              onClick={() => onPageChange('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                currentPage === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onPageChange('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                currentPage === 'chat'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5 shrink-0" />
              <span>Chat Cố vấn AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </button>

            <button
              onClick={() => onPageChange('roadmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                currentPage === 'roadmap'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Milestone className="w-3.5 h-3.5 shrink-0" />
              <span>Lộ trình học tập</span>
            </button>

            <button
              onClick={() => onPageChange('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                currentPage === 'profile'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Hồ sơ cá nhân</span>
            </button>

            {isAuthorizedAdmin && (
              <button
                onClick={() => onPageChange('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  currentPage === 'admin'
                    ? 'bg-slate-900 text-amber-400 shadow-xs'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
                title="Quản trị Database & Nhật ký truy cập"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Admin DB</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* 1. Interactive Spotlight Search Trigger */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 text-slate-600 px-3 py-2 rounded-xl text-xs transition-all border border-slate-200/80 shadow-xs hover:border-blue-300"
              title="Tìm kiếm thông minh (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline text-xs font-medium">Tìm kiếm...</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-mono bg-white shadow-xs border border-slate-200">
                Ctrl K
              </kbd>
            </button>

            {/* 2. Interactive Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                className={`relative p-2.5 rounded-xl transition-all ${
                  isNotificationsOpen 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Thông báo học tập"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-floating border border-white shadow-2xl p-4 z-50 animate-float-fast">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">Thông báo học tập</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                          {unreadCount} mới
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Đã đọc tất cả</span>
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        Không có thông báo nào.
                      </div>
                    ) : (
                      notifications.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`p-3 rounded-xl transition-all cursor-pointer flex gap-3 items-start my-1 ${
                            item.read ? 'hover:bg-slate-50 opacity-80' : 'bg-blue-50/50 hover:bg-blue-50 border-l-2 border-blue-600'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5">
                            {item.type === 'academic' && <Brain className="w-4 h-4 text-blue-600" />}
                            {item.type === 'streak' && <Flame className="w-4 h-4 text-amber-500" />}
                            {item.type === 'exam' && <BookOpen className="w-4 h-4 text-indigo-600" />}
                            {item.type === 'system' && <Sparkles className="w-4 h-4 text-emerald-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-600 leading-snug mt-0.5 line-clamp-2">
                              {item.desc}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 font-mono">
                              {item.time}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/70 flex justify-between items-center text-[11px]">
                      <button 
                        onClick={handleClearNotifications}
                        className="text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa tất cả</span>
                      </button>
                      <button 
                        onClick={() => { setIsNotificationsOpen(false); onPageChange('dashboard'); }}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Xem trên Dashboard →
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* 3. User Profile Card & Quick Dropdown */}
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <div 
                  onClick={() => setIsUserMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                  title="Tài khoản học viên (Bấm để xem menu)"
                >
                  {/* Avatar thumbnail */}
                  <div className="relative">
                    {userAvatar ? (
                      <img 
                        src={userAvatar} 
                        alt="Avatar" 
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs bg-white"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {userName ? userName.slice(0, 2).toUpperCase() : 'HV'}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  <div className="hidden sm:block text-left leading-tight max-w-[120px]">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {userName}
                    </div>
                    <div className="text-[10px] font-medium text-emerald-600 flex items-center gap-0.5">
                      <span>Đang học</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* User Quick Menu Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-floating border border-white shadow-2xl p-3 z-50 space-y-2">
                    
                    {/* Header info */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
                      {userAvatar ? (
                        <img src={userAvatar} alt="Avatar" className="w-10 h-10 rounded-xl object-cover bg-white" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {userName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">{userName}</div>
                        <div className="text-[10px] text-slate-500 truncate">{user?.email || 'student@eduadvisor.ai'}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-1 text-xs font-semibold">
                      <button 
                        onClick={openIdentityModal}
                        className="w-full text-left px-3 py-2 rounded-xl text-blue-700 bg-blue-50/70 hover:bg-blue-100 flex items-center gap-2 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-blue-600" />
                        <span>Đổi Tên &amp; Ảnh Đại Diện</span>
                      </button>

                      <button 
                        onClick={() => { setIsUserMenuOpen(false); onPageChange('profile'); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        <span>Hồ sơ học tập &amp; Mục tiêu</span>
                      </button>

                      <button 
                        onClick={() => { setIsUserMenuOpen(false); onPageChange('roadmap'); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
                      >
                        <Milestone className="w-4 h-4 text-slate-500" />
                        <span>Lộ trình cá nhân hóa</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70">
                      <button 
                        onClick={() => {
                          api.clearUser();
                          setIsUserMenuOpen(false);
                          onPageChange('login');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors text-xs font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onPageChange('login')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors shrink-0 whitespace-nowrap"
              >
                Đăng nhập
              </button>
            )}

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-around border-t border-slate-200 bg-white/95 py-2 px-1">
          <button
            onClick={() => onPageChange('landing')}
            className={`flex flex-col items-center text-[10px] font-semibold gap-0.5 py-1 px-2 rounded-lg ${
              currentPage === 'landing' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Trang chủ</span>
          </button>
          <button
            onClick={() => onPageChange('dashboard')}
            className={`flex flex-col items-center text-[10px] font-semibold gap-0.5 py-1 px-2 rounded-lg ${
              currentPage === 'dashboard' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => onPageChange('chat')}
            className={`flex flex-col items-center text-[10px] font-semibold gap-0.5 py-1 px-2 rounded-lg ${
              currentPage === 'chat' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500'
            }`}
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Chat AI</span>
          </button>
          <button
            onClick={() => onPageChange('roadmap')}
            className={`flex flex-col items-center text-[10px] font-semibold gap-0.5 py-1 px-2 rounded-lg ${
              currentPage === 'roadmap' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500'
            }`}
          >
            <Milestone className="w-4 h-4" />
            <span>Lộ trình</span>
          </button>
          <button
            onClick={() => onPageChange('profile')}
            className={`flex flex-col items-center text-[10px] font-semibold gap-0.5 py-1 px-2 rounded-lg ${
              currentPage === 'profile' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Hồ sơ</span>
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 4. SPOTLIGHT SEARCH MODAL (Command + K)                         */}
      {/* ============================================================== */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl glass-floating border border-white shadow-2xl overflow-hidden">
            
            {/* Input Header */}
            <div className="p-4 border-b border-slate-200/80 flex items-center gap-3 bg-white/80">
              <Search className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm trang, dạng bài tập (Tích phân, Lực Lorentz, IELTS, ĐGNL)..."
                className="flex-1 bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500 border border-slate-200">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-1">
              {filteredSearch.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Không tìm thấy kết quả nào phù hợp với "{searchQuery}".
                </div>
              ) : (
                filteredSearch.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setIsSearchOpen(false);
                      if (item.type === 'page' && item.page) {
                        onPageChange(item.page);
                      } else if (item.type === 'prompt' && item.prompt) {
                        onPageChange('chat', item.prompt);
                      }
                    }}
                    className="p-3 rounded-2xl hover:bg-blue-50/70 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                        {item.type === 'page' ? (
                          <ExternalLink className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50/80 border-t border-slate-200/80 text-[11px] text-slate-500 flex justify-between items-center">
              <span>Mẹo: Gõ dạng bài để mở ngay câu trả lời trong Chat AI</span>
              <span className="font-mono">EduAdvisor Search Core</span>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. USER IDENTITY (NAME & AVATAR) MODAL                          */}
      {/* ============================================================== */}
      {isIdentityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-floating border border-white shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsIdentityModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Cập Nhật Họ Tên &amp; Ảnh Đại Diện
                </h3>
                <p className="text-xs text-slate-500">
                  Tùy chỉnh thông tin hiển thị trên bảng xếp hạng và giao diện học tập
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveIdentity} className="space-y-5">
              
              {/* Live Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
                <img 
                  src={editAvatar} 
                  alt="Preview" 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0" 
                />
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Xem trước hồ sơ</div>
                  <div className="text-base font-bold text-slate-900">{editName || 'Học viên'}</div>
                  <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Học viên chính thức • EduAdvisor AI</span>
                  </div>
                </div>
              </div>

              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Họ và tên hiển thị <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nhập họ và tên của bạn..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Upload Custom Avatar or Paste URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Tải ảnh lên hoặc dán link ảnh tùy thích</span>
                  <span className="text-[10px] text-slate-400 font-normal">Hỗ trợ PNG, JPG, GIF</span>
                </label>
                
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Tải ảnh từ máy tính</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <input
                  type="url"
                  value={editAvatar.startsWith('data:') ? '' : editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="Hoặc dán URL ảnh trực tuyến (https://...)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 12 Curated Preset Avatars Grid */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  Hoặc chọn nhanh từ kho 12 Avatar Học Thuật:
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                  {PRESET_AVATARS.map(item => {
                    const isSelected = editAvatar === item.url;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setEditAvatar(item.url)}
                        title={item.label}
                        className={`p-1.5 rounded-2xl border transition-all flex flex-col items-center gap-1 ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-400/40 scale-105' 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <img src={item.url} alt={item.label} className="w-10 h-10 rounded-xl object-cover bg-white" />
                        <span className="text-[9px] font-medium text-slate-600 truncate w-full text-center">
                          {item.label.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsIdentityModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSavingIdentity}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isSavingIdentity ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </>
  );
};
