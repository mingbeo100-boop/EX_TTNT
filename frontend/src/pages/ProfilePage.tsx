import React, { useState, useEffect } from 'react';
import { PageType, UserProfile, RoadmapData } from '../types';
import { api } from '../services/api';
import { studySyncService, ActiveStudyContext, StudyNavigationIntent } from '../services/studySyncService';
import { generateRoadmap, GOALS, VARIANTS, LEVELS, TARGET_BANDS } from '../services/roadmapEngine';
import {
  LearningNode,
  PRESET_CATALOG,
  ROADMAP_THPT_A00
} from '../services/roadmapCatalog';
import { FormattedMessage } from '../components/FormattedMessage';
import { RoadmapArcadeModal } from '../components/RoadmapArcadeModal';
import { 
  User as UserIcon, 
  School, 
  Target, 
  Award, 
  Flame, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  Edit3, 
  LogOut, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Lightbulb, 
  X, 
  Camera, 
  Upload,
  Zap,
  TrendingUp,
  Trophy,
  Layers,
  Lock,
  Unlock,
  Check,
  Activity,
  Gamepad2,
  RotateCcw,
  AlertTriangle,
  Play
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: PageType, initialPrompt?: string) => void;
  onLogout?: () => void;
}

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

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, onLogout }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time Synced Roadmap State from RoadmapPage
  const [syncedRoadmap, setSyncedRoadmap] = useState<RoadmapData | null>(null);
  const [studyContext, setStudyContext] = useState<ActiveStudyContext>(studySyncService.getActiveContext());
  const [roadmapNodes, setRoadmapNodes] = useState<LearningNode[]>([]);
  const [activePresetKey, setActivePresetKey] = useState<string>('thpt_a00');
  const [customRoadmapMeta, setCustomRoadmapMeta] = useState<{
    name: string;
    description: string;
    score: string;
    days: number;
    dailyHours: number;
    coachAdvice: string;
  } | null>(null);

  // Unlocked Badges State (đồng bộ localStorage)
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    try {
      const u = api.getUser();
      const saved = localStorage.getItem(`eduadvisor_${u?.id || 'guest'}_unlocked_badges_v1`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Arcade Mini-Game 2D State (Đấu trường vượt bẫy & mở khóa huy hiệu thật)
  const [isArcadeModalOpen, setIsArcadeModalOpen] = useState(false);
  const [arcadeFocusBadgeId, setArcadeFocusBadgeId] = useState<string | null>(null);

  // Edit Name & Avatar Modal
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);

  const openIdentityModal = () => {
    setEditName(profile?.full_name || 'Học viên');
    setEditAvatar(profile?.avatar_url || PRESET_AVATARS[0].url);
    setIsIdentityModalOpen(true);
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !editName.trim()) return;
    setIsSavingIdentity(true);

    const updated = await api.updateUserIdentity({
      user_id: profile.id,
      full_name: editName.trim(),
      avatar_url: editAvatar
    });

    if (updated) {
      setProfile(prev => prev ? ({ ...prev, full_name: updated.full_name, avatar_url: updated.avatar_url }) : null);
    }
    setIsSavingIdentity(false);
    setIsIdentityModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setEditAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const loadRoadmapFromStorage = () => {
    try {
      const u = api.getUser();
      const userId = u?.id || 'guest';
      const saved = api.getUserRoadmap(u?.id);
      if (saved) {
        setSyncedRoadmap(saved);
      }

      const nodesSaved = localStorage.getItem(`eduadvisor_${userId}_interactive_roadmap_nodes_v5`);
      if (nodesSaved) {
        setRoadmapNodes(JSON.parse(nodesSaved));
      } else {
        setRoadmapNodes(ROADMAP_THPT_A00);
      }

      const presetSaved = localStorage.getItem(`eduadvisor_${userId}_active_preset_key_v5`);
      if (presetSaved && PRESET_CATALOG[presetSaved]) {
        setActivePresetKey(presetSaved);
      }

      const metaSaved = localStorage.getItem(`eduadvisor_${userId}_custom_roadmap_meta_v5`);
      if (metaSaved) {
        setCustomRoadmapMeta(JSON.parse(metaSaved));
      }

      const badgesSaved = localStorage.getItem(`eduadvisor_${userId}_unlocked_badges_v1`);
      if (badgesSaved) {
        setUnlockedBadges(JSON.parse(badgesSaved));
      }
    } catch {}
  };

  useEffect(() => {
    loadProfile();
    loadRoadmapFromStorage();

    const unsub = studySyncService.subscribe(() => {
      setStudyContext(studySyncService.getActiveContext());
      loadRoadmapFromStorage();
      const u = api.getUser();
      if (u?.profile) {
        setProfile({ ...u.profile });
      }
    });

    const handleRoadmapChange = () => {
      loadRoadmapFromStorage();
    };

    window.addEventListener('eduadvisor_roadmap_updated', handleRoadmapChange);

    return () => {
      unsub();
      window.removeEventListener('eduadvisor_roadmap_updated', handleRoadmapChange);
    };
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    const u = api.getUser();
    if (!u) {
      onNavigate('login');
      return;
    }

    const data = await api.getProfile(u.id);
    const activeProf = data || u.profile;

    if (activeProf) {
      setProfile(activeProf);
    } else {
      const initialProf: UserProfile = {
        id: u.id,
        email: u.email,
        full_name: u.full_name || 'Học viên',
        avatar_url: u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${u.email}`,
        school: 'Chưa cập nhật',
        target_exam: 'THPT_QG',
        target_score: '28.5+',
        current_level: 'Khá (6.5 - 8.0đ)',
        focus_subjects: ['Toán học', 'Vật lý'],
        learning_needs: ['Gợi mở phương pháp giải Socratic'],
        streak_days: 14,
        avg_score: 8.8,
        study_hours: 28.5,
        solved_problems: 342
      };
      setProfile(initialProf);
    }
    setIsLoading(false);
  };

  // Arcade Mini-Game Handlers (Đấu trường chinh phục mục tiêu lộ trình)
  const openArcadeGame = (badgeId?: string) => {
    setArcadeFocusBadgeId(badgeId || null);
    setIsArcadeModalOpen(true);
  };

  const handleUnlockBadgeFromGame = (badgeId: string) => {
    const u = api.getUser();
    const userId = u?.id || 'guest';
    const key = `eduadvisor_${userId}_unlocked_badges_v1`;
    let currentUnlocked: string[] = [];
    try {
      const saved = localStorage.getItem(key);
      if (saved) currentUnlocked = JSON.parse(saved);
    } catch {}
    if (!currentUnlocked.includes(badgeId)) {
      currentUnlocked.push(badgeId);
      localStorage.setItem(key, JSON.stringify(currentUnlocked));
      setUnlockedBadges(currentUnlocked);
    }

    // Cập nhật số bài tập hoàn thành trong profile
    if (u) {
      if (!u.profile) {
        u.profile = {
          id: u.id,
          email: u.email,
          full_name: u.full_name || 'Học viên',
          school: 'THPT',
          target_exam: 'THPT_QG',
          target_score: '28.5+',
          current_level: 'Khá',
          focus_subjects: ['Toán học', 'Vật lý'],
          learning_needs: [],
          streak_days: 1,
          avg_score: 8.5,
          study_hours: 1.0,
          solved_problems: 1
        };
      }
      u.profile.solved_problems = (u.profile.solved_problems || 0) + 1;
      api.setUser(u);
      setProfile({ ...u.profile });
    }
  };

  const handleLogoutClick = () => {
    api.clearUser();
    if (onLogout) onLogout();
    onNavigate('login');
  };

  // 5-Axis Real-Time Competency Calculation based on Study Sync Service
  const completedIds = studyContext.completedExercises || [];
  const completedCount = completedIds.length;
  const streak = studyContext.streakDays || 1;

  const hasVdc = completedIds.includes('ex_math_vdc_1');
  const hasTrap = completedIds.includes('ex_math_trap_1');
  const hasMatch = completedIds.includes('ex_math_match_1');
  const hasOrder = completedIds.includes('ex_math_order_1') || completedIds.includes('ex_dsa_order_1');

  // Metrics Lộ Trình Học Tập Đồng Bộ Trực Tiếp từ RoadmapPage & roadmapNodes
  const totalStations = roadmapNodes.length;
  const completedStationsCount = roadmapNodes.filter(n => n.status === 'completed').length;
  const roadmapProgressPercent = totalStations > 0 
    ? Math.round((completedStationsCount / totalStations) * 100) 
    : (syncedRoadmap?.totalProgress || 0);

  const activeNode = roadmapNodes.find(n => n.status === 'active') 
    || roadmapNodes.find(n => n.status !== 'completed') 
    || roadmapNodes[0] 
    || null;

  const currentPreset = PRESET_CATALOG[activePresetKey];
  const roadmapTitle = customRoadmapMeta?.name 
    || currentPreset?.name 
    || syncedRoadmap?.title 
    || 'Lộ Trình Ôn Thi THPT Quốc Gia Khối A00';

  const roadmapScore = customRoadmapMeta?.score 
    || currentPreset?.score 
    || syncedRoadmap?.targetScore 
    || profile?.target_score 
    || '28.5+ Điểm (Top 1%)';

  const roadmapSchool = (profile?.school && profile?.school !== 'Chưa cập nhật') 
    ? profile.school 
    : (roadmapTitle.includes('Bách Khoa') 
        ? 'ĐH Bách Khoa Hà Nội' 
        : roadmapTitle.includes('IELTS') 
          ? 'IELTS Academic Top 1' 
          : 'ĐH Top 1 / Nguyện Vọng 1');

  const roadmapDays = customRoadmapMeta?.days 
    || currentPreset?.days 
    || syncedRoadmap?.daysLeft 
    || 88;

  const roadmapDailyHours = customRoadmapMeta?.dailyHours 
    || currentPreset?.dailyHours 
    || 2.5;

  const roadmapSubject = customRoadmapMeta?.name?.includes('Toán') 
    ? 'Toán Học Chuyên Sâu' 
    : (activeNode?.subject || studyContext.subject || 'Toán Học & KHTN');

  const radarAxes: Array<{
    id: string;
    label: string;
    value: number;
    fullMark: number;
    level: string;
    color: string;
    prompt: string;
    intent: StudyNavigationIntent;
  }> = [
    {
      id: 'vdc',
      label: 'Toán Hàm Ẩn & VDC',
      value: Math.min(98, 65 + (hasVdc ? 20 : 0) + completedCount * 4),
      fullMark: 100,
      level: hasVdc ? 'Thành thạo (9.2+)' : 'Đang bứt phá',
      color: 'from-blue-600 to-indigo-600',
      prompt: 'Chào Cố vấn AI! Em muốn luyện thêm các bài toán Tích phân hàm ẩn mức 9+ VDC.',
      intent: {
        difficulty: 'Vận dụng cao 9+',
        tab: 'practice',
        initialPrompt: 'Chào Cố vấn AI! Em muốn luyện thêm các bài toán Tích phân hàm ẩn mức 9+ VDC.'
      }
    },
    {
      id: 'algo',
      label: 'Tư Duy Thứ Tự & Thuật Toán',
      value: Math.min(96, 55 + (hasOrder ? 25 : 0) + completedCount * 5),
      fullMark: 100,
      level: hasOrder ? 'Xuất sắc' : 'Cần rèn luyện',
      color: 'from-indigo-600 to-purple-600',
      prompt: 'Em muốn luyện tập dạng bài sắp xếp thứ tự các bước tư duy và thuật toán giải toán.',
      intent: {
        exerciseType: 'ordering_steps',
        tab: 'practice',
        initialPrompt: 'Em muốn luyện tập dạng bài sắp xếp thứ tự các bước tư duy và thuật toán giải toán.'
      }
    },
    {
      id: 'trap',
      label: 'Bắt Bẫy Đề Thi & Cận Đạo Hàm',
      value: Math.min(95, 50 + (hasTrap ? 30 : 0) + completedCount * 4),
      fullMark: 100,
      level: hasTrap ? 'Nhạy bén' : 'Dễ dính bẫy',
      color: 'from-emerald-500 to-teal-600',
      prompt: 'Em muốn làm bài tập Bẫy Đề Thi về điều kiện hàm ẩn và liên tục.',
      intent: {
        exerciseType: 'trap_detect',
        tab: 'practice',
        initialPrompt: 'Em muốn làm bài tập Bẫy Đề Thi về điều kiện hàm ẩn và liên tục.'
      }
    },
    {
      id: 'match',
      label: 'Kỹ Thuật Đối Xứng & Ghép Đôi',
      value: Math.min(96, 52 + (hasMatch ? 28 : 0) + completedCount * 4),
      fullMark: 100,
      level: hasMatch ? 'Bậc thầy công thức' : 'Cơ bản',
      color: 'from-amber-500 to-orange-600',
      prompt: 'Em muốn làm bài tập Ghép Đôi Công Thức và bổ đề tích phân đối xứng.',
      intent: {
        exerciseType: 'matching_pairs',
        tab: 'practice',
        initialPrompt: 'Em muốn làm bài tập Ghép Đôi Công Thức và bổ đề tích phân đối xứng.'
      }
    },
    {
      id: 'streak',
      label: 'Kỷ Luật Học Tập & Chuỗi Lửa',
      value: Math.min(100, Math.max(40, streak * 20 + completedCount * 8)),
      fullMark: 100,
      level: streak >= 3 ? 'Bền bỉ xuất sắc' : 'Đang duy trì',
      color: 'from-rose-500 to-pink-600',
      prompt: 'Đánh giá thói quen học tập và kế hoạch hoàn thành mục tiêu tuần này của em.',
      intent: {
        tab: 'pomodoro',
        initialPrompt: 'Đánh giá thói quen học tập và kế hoạch hoàn thành mục tiêu tuần này của em.'
      }
    }
  ];

  // Helper for Polygon coordinates: Center (160, 160), R = 110
  const getRadarPoint = (index: number, total: number, ratio: number, center = 160, maxR = 110) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
    const r = maxR * Math.max(0.18, Math.min(1, ratio));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const radarPolygonPoints = radarAxes
    .map((axis, i) => {
      const pt = getRadarPoint(i, radarAxes.length, axis.value / 100);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  // Tủ Huy Hiệu Tích Hợp Lộ Trình Học Tập & Mini-Game Trò Chơi Câu Hỏi
  interface RoadmapBadgeItem {
    id: string;
    title: string;
    desc: string;
    icon: any;
    unlocked: boolean;
    category: string;
    progress: number;
    progressText: string;
    gradient: string;
    stationTitle?: string;
    prompt: string;
    intent: StudyNavigationIntent;
    quizQuestion: {
      question: string;
      options: string[];
      correctAnswer: number;
      hint: string;
      explanation: string;
    };
  }

  const BADGES: RoadmapBadgeItem[] = [
    {
      id: 'b_station_starter',
      title: 'Khởi Đầu Lộ Trình',
      desc: 'Chinh phục trạm học tập đầu tiên trên lộ trình hoặc vượt qua câu hỏi trắc nghiệm nền tảng.',
      icon: Compass,
      unlocked: unlockedBadges.includes('b_station_starter') || completedStationsCount >= 1 || completedCount >= 1,
      category: 'Lộ trình trạm',
      progress: (completedStationsCount >= 1 || unlockedBadges.includes('b_station_starter')) ? 100 : Math.min(100, completedCount * 50),
      progressText: (completedStationsCount >= 1 || unlockedBadges.includes('b_station_starter')) ? 'Đã hoàn thành trạm' : `${completedStationsCount}/1 trạm hoàn thành`,
      gradient: 'from-blue-600 to-indigo-600',
      stationTitle: roadmapNodes[0]?.title || 'Trạm 1: Nền tảng trọng tâm',
      prompt: 'Chào Cố vấn AI! Em muốn học trạm đầu tiên trên sơ đồ lộ trình học tập.',
      intent: {
        exerciseType: 'multiple_choice',
        tab: 'practice',
        initialPrompt: 'Chào Cố vấn AI! Em muốn học trạm đầu tiên trên sơ đồ lộ trình học tập.'
      },
      quizQuestion: {
        question: 'Trong lộ trình học tập cá nhân hóa, phương pháp học tập hiệu quả nhất để xây dựng tư duy toán học vững chắc là gì?',
        options: [
          'Học vẹt thuộc lòng tất cả các dạng bài mà không cần hiểu bản chất định lý',
          'Nắm vững bản chất định lý cốt lõi, phản biện Socratic và phân tích sai lầm cùng AI',
          'Chỉ làm bài tập mức độ dễ để tích lũy số lượng và lấy điểm giả tạo',
          'Bỏ qua toàn bộ lý thuyết và phụ thuộc 100% vào bấm máy tính Casio'
        ],
        correctAnswer: 1,
        hint: 'Cố vấn Dr. Minerva AI đề cao phương pháp vấn đáp Socratic để hiểu sâu bản chất kiến thức.',
        explanation: 'Chính xác! Nắm vững bản chất định lý và thảo luận phản biện Socratic giúp bộ não ghi nhớ sâu sắc, tạo tiền đề bứt phá điểm số ở các câu vận dụng cao.'
      }
    },
    {
      id: 'b_trap_detect',
      title: 'Thám Tử Bắt Bẫy',
      desc: 'Nhận diện đúng cạm bẫy toán học, điều kiện xác định và biến đổi giả thiết trong trạm chuyên đề.',
      icon: ShieldCheck,
      unlocked: unlockedBadges.includes('b_trap_detect') || hasTrap,
      category: 'Độ chính xác',
      progress: (hasTrap || unlockedBadges.includes('b_trap_detect')) ? 100 : 0,
      progressText: (hasTrap || unlockedBadges.includes('b_trap_detect')) ? 'Đã bắt bẫy thành công' : '0/1 bẫy đề thi',
      gradient: 'from-emerald-500 to-teal-600',
      stationTitle: 'Trạm chuyên đề Bẫy Đề Thi',
      prompt: 'Em muốn thử thách bài tập Bẫy Đề Thi phân loại trong lộ trình.',
      intent: {
        exerciseType: 'trap_detect',
        tab: 'practice',
        initialPrompt: 'Em muốn thử thách bài tập Bẫy Đề Thi phân loại trong lộ trình.'
      },
      quizQuestion: {
        question: 'Khi tính tích phân I = ∫(-1 đến 1) 1/x² dx, sai lầm nghiêm trọng mà học sinh hay mắc phải là gì?',
        options: [
          'Dùng công thức Newton-Leibniz cơ bản [-1/x] từ -1 đến 1 ra -2 mà quên hàm số bị gián đoạn tại x = 0',
          'Quên nhân thêm hằng số C của nguyên hàm',
          'Áp dụng quy tắc tích phân từng phần không phù hợp',
          'Đổi biến số nhưng không đổi cận tích phân'
        ],
        correctAnswer: 0,
        hint: 'Hàm số f(x) = 1/x² không xác định tại điểm x = 0 nằm trong khoảng lấy tích phân [-1, 1].',
        explanation: 'Xuất sắc! Hàm số 1/x² không liên tục tại điểm x = 0 nên đây là tích phân suy rộng và thực chất nó phân kỳ (+∞). Không thể áp dụng trực tiếp công thức Newton-Leibniz!'
      }
    },
    {
      id: 'b_matching_master',
      title: 'Bậc Thầy Ghép Đôi',
      desc: 'Khớp chính xác bổ đề đối xứng và công thức trong các trạm bài tập thực chiến của lộ trình.',
      icon: Sparkles,
      unlocked: unlockedBadges.includes('b_matching_master') || hasMatch,
      category: 'Phương pháp',
      progress: (hasMatch || unlockedBadges.includes('b_matching_master')) ? 100 : 0,
      progressText: (hasMatch || unlockedBadges.includes('b_matching_master')) ? 'Đã ghép đôi chính xác' : '0/1 bài tập',
      gradient: 'from-blue-500 to-indigo-600',
      stationTitle: 'Trạm Ghép Đôi Công Thức',
      prompt: 'Em muốn làm bài tập Ghép Đôi Công Thức và bổ đề đối xứng theo lộ trình.',
      intent: {
        exerciseType: 'matching_pairs',
        tab: 'practice',
        initialPrompt: 'Em muốn làm bài tập Ghép Đôi Công Thức và bổ đề đối xứng theo lộ trình.'
      },
      quizQuestion: {
        question: 'Trong đại số ma trận, điều kiện cần và đủ để ma trận vuông A cấp n khả nghịch (có ma trận nghịch đảo A⁻¹) là gì?',
        options: [
          'Tổng các phần tử trên đường chéo chính bằng 0 (tr(A) = 0)',
          'Định thức của ma trận A khác không: det(A) ≠ 0 (hoặc rank(A) = n)',
          'Tất cả các phần tử của ma trận đều là số dương',
          'Ma trận A phải là ma trận đường chéo'
        ],
        correctAnswer: 1,
        hint: 'Công thức ma trận nghịch đảo: A⁻¹ = (1 / det(A)) * P_A. Mẫu số det(A) phải khác 0.',
        explanation: 'Chính xác! Ma trận vuông A khả nghịch khi và chỉ khi det(A) ≠ 0. Khi đó hệ phương trình tuyến tính thuần nhất AX = 0 chỉ có nghiệm tầm thường.'
      }
    },
    {
      id: 'b_logic_architect',
      title: 'Kiến Trúc Sư Logic',
      desc: 'Hoàn thành từ 2 trạm kiến thức trở lên hoặc sắp xếp đúng trình tự các bước thuật toán giải đề.',
      icon: Layers,
      unlocked: unlockedBadges.includes('b_logic_architect') || completedStationsCount >= 2 || hasOrder,
      category: 'Thuật toán & Trạm',
      progress: unlockedBadges.includes('b_logic_architect') ? 100 : Math.min(100, Math.max(hasOrder ? 100 : 0, (completedStationsCount / 2) * 100)),
      progressText: unlockedBadges.includes('b_logic_architect') ? 'Đã đạt logic chuẩn' : `${Math.min(2, completedStationsCount)}/2 trạm kiến thức`,
      gradient: 'from-purple-500 to-violet-600',
      stationTitle: 'Trạm Thuật Toán & Tư Duy Phản Biện',
      prompt: 'Em muốn làm bài tập Sắp Xếp Thứ Tự các bước giải toán trong lộ trình.',
      intent: {
        exerciseType: 'ordering_steps',
        tab: 'practice',
        initialPrompt: 'Em muốn làm bài tập Sắp Xếp Thứ Tự các bước giải toán trong lộ trình.'
      },
      quizQuestion: {
        question: 'Khi giải một bài toán hàm số vận dụng cao chứa tham số m, trình tự các bước suy luận chuẩn mực nhất là:',
        options: [
          'Thử từng đáp án trắc nghiệm -> Vẽ hình phỏng đoán -> Kết luận',
          'Tìm tập xác định -> Tính đạo hàm y\' -> Khảo sát dấu đạo hàm / Cô lập m -> Lập bảng biến thiên và biện luận',
          'Bấm máy tính Casio Table -> Lấy giá trị lớn nhất -> Kết luận ngay',
          'Cô lập tham số m ngay từ đầu mà không cần xét điều kiện của biến số x'
        ],
        correctAnswer: 1,
        hint: 'Tập xác định và đạo hàm luôn là 2 bước nền tảng sống còn trước khi cô lập tham số.',
        explanation: 'Tuyệt vời! Bắt đầu từ tập xác định, tính đạo hàm, sau đó cô lập m và lập bảng biến thiên là quy trình giải thuật logic chặt chẽ nhất giúp tránh mọi bẫy đề thi.'
      }
    },
    {
      id: 'b_streak_hero',
      title: 'Chuỗi Lửa Kỷ Luật',
      desc: `Duy trì kỷ luật học tập đều đặn hàng ngày (${streak} ngày) hoặc giải mã câu đố kỷ luật thời gian.`,
      icon: Flame,
      unlocked: unlockedBadges.includes('b_streak_hero') || streak >= 3,
      category: 'Kỷ luật học tập',
      progress: unlockedBadges.includes('b_streak_hero') ? 100 : Math.min(100, (streak / 3) * 100),
      progressText: unlockedBadges.includes('b_streak_hero') ? 'Đã đạt kỷ luật' : `${streak}/3 ngày liên tục`,
      gradient: 'from-rose-500 to-red-600',
      stationTitle: 'Trạm Kỷ Luật & Pomodoro',
      prompt: 'Cố vấn kiểm tra chuỗi streak học tập và checklist hôm nay của em.',
      intent: {
        tab: 'pomodoro',
        initialPrompt: 'Cố vấn kiểm tra chuỗi streak học tập và checklist hôm nay của em.'
      },
      quizQuestion: {
        question: 'Kỹ thuật Pomodoro tiêu chuẩn khuyên học sinh nên phân bổ thời gian học tập như thế nào để não bộ tập trung cao độ nhất?',
        options: [
          'Học liên tục 4 tiếng không nghỉ rồi đi ngủ bù',
          'Học tập trung cao độ 25 phút, nghỉ ngắn 5 phút và lặp lại 4 chu kỳ trước khi nghỉ dài 15-30 phút',
          'Vừa học vừa lướt mạng xã hội để giảm bớt căng thẳng',
          'Chỉ học vào ban đêm từ 1h đến 5h sáng để không bị ai làm phiền'
        ],
        correctAnswer: 1,
        hint: 'Chu kỳ 25 phút tập trung sâu + 5 phút hồi phục năng lượng.',
        explanation: 'Chính xác! Phương pháp Pomodoro (25/5) giúp duy trì sự tập trung tối đa, ngăn ngừa mệt mỏi tinh thần và giúp kiến thức được củng cố vào bộ nhớ dài hạn.'
      }
    },
    {
      id: 'b_mastery_summit',
      title: 'Thủ Khoa Đích Thực 9+',
      desc: 'Chinh phục toàn diện các trạm trên lộ trình hoặc vượt qua bài toán vận dụng cao phân loại 9+.',
      icon: Trophy,
      unlocked: unlockedBadges.includes('b_mastery_summit') || (completedStationsCount >= 4 && totalStations > 0) || completedCount >= 4,
      category: 'Đỉnh cao lộ trình',
      progress: unlockedBadges.includes('b_mastery_summit') ? 100 : Math.min(100, (completedStationsCount / Math.max(1, totalStations)) * 100),
      progressText: unlockedBadges.includes('b_mastery_summit') ? 'Đã đạt đỉnh cao 9+' : `${completedStationsCount}/${Math.max(1, totalStations)} trạm lộ trình`,
      gradient: 'from-yellow-400 to-amber-600',
      stationTitle: 'Trạm Vận Dụng Cao 9+ Tích Phân & Hàm Ẩn',
      prompt: 'Em muốn làm bài toán phân loại VDC 9.6 điểm bám sát đề thi mới nhất.',
      intent: {
        difficulty: 'Vận dụng cao 9+',
        tab: 'practice',
        initialPrompt: 'Em muốn làm bài toán phân loại VDC 9.6 điểm bám sát đề thi mới nhất.'
      },
      quizQuestion: {
        question: 'Cho hàm số f(x) liên tục trên R thỏa mãn: f(x) + f(-x) = cos(x). Giá trị của tích phân I = ∫(-π/2 đến π/2) f(x) dx bằng:',
        options: [
          'I = 0',
          'I = 1',
          'I = 2',
          'I = π/2'
        ],
        correctAnswer: 1,
        hint: 'Đổi biến số t = -x trong tích phân, sau đó cộng hai biểu thức 2I = ∫[f(x) + f(-x)]dx.',
        explanation: 'Tuyệt đỉnh! Đổi biến t = -x ⇒ dx = -dt, cận từ π/2 về -π/2, ta có I = ∫(-π/2 đến π/2) f(-x) dx. Cộng hai vế: 2I = ∫(-π/2 đến π/2) [f(x) + f(-x)] dx = ∫(-π/2 đến π/2) cos(x) dx = [sin(x)](-π/2 đến π/2) = 1 - (-1) = 2. Suy ra I = 1!'
      }
    }
  ];

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 1. Header Banner & Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Cover gradient */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 relative">
            <div className="absolute right-6 top-6 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Tài khoản Học viên Xác thực
              </span>
            </div>
          </div>

          {/* User info row */}
          <div className="px-6 pb-6 pt-0 relative sm:flex sm:items-end sm:justify-between -mt-16 sm:-mt-12">
            <div className="sm:flex sm:items-end gap-5">
              {/* Avatar with click to edit */}
              <div 
                onClick={openIdentityModal}
                className="relative inline-block group cursor-pointer"
                title="Bấm để đổi tên & ảnh đại diện"
              >
                <img
                  src={profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                  alt="Avatar"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-md object-cover bg-white group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1">
                  <Camera className="w-4 h-4" />
                  <span>Đổi ảnh</span>
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Trực tuyến" />
              </div>

              {/* Title and details */}
              <div className="mt-3 sm:mt-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                    {profile?.full_name || 'Học viên'}
                  </h1>
                  <button 
                    onClick={openIdentityModal}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Đổi tên & Avatar"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-blue-600" />
                    {profile?.school || 'Chưa cập nhật'}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-400">ID: {profile?.id || 'EDU-2025'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-2.5">
              <button
                onClick={openIdentityModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>Đổi Tên &amp; Avatar</span>
              </button>
              <button
                onClick={() => onNavigate('roadmap')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                title="Xem và học theo sơ đồ lộ trình"
              >
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Xem Lộ Trình Học Tập</span>
              </button>
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Key Stats Grid Starting From 0 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{profile?.streak_days !== undefined ? profile.streak_days : 14} Ngày</div>
              <div className="text-[11px] text-slate-500">Chuỗi học tập liên tục</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{profile?.avg_score ? `${profile.avg_score}/10` : '8.8/10'}</div>
              <div className="text-[11px] text-slate-500">Điểm kiểm tra trung bình</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{profile?.study_hours !== undefined ? profile.study_hours : 28.5} Giờ</div>
              <div className="text-[11px] text-slate-500">Thời gian cùng Cố vấn AI</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{profile?.solved_problems !== undefined ? profile.solved_problems : 342} Bài</div>
              <div className="text-[11px] text-slate-500">Bài tập đã hoàn thành</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. LỘ TRÌNH HỌC TẬP & MỤC TIÊU HIỆN TẠI (ĐỒNG BỘ TRỰC TIẾP TỪ ROADMAP) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    Lộ Trình Học Tập &amp; Mục Tiêu Hiện Tại
                  </h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đồng bộ từ Sơ đồ lộ trình
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Dữ liệu mục tiêu, tiến độ từng trạm và thời khóa biểu tự động đồng bộ thời gian thực từ trang Lộ trình học tập
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('roadmap')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Xem Chi Tiết Lộ Trình</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Roadmap Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-slate-400 font-medium text-[11px] flex items-center justify-between">
                <span>Kỳ thi &amp; Lộ trình</span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="font-bold text-slate-900 line-clamp-1" title={roadmapTitle}>
                {roadmapTitle}
              </div>
              <div className="text-[10px] text-blue-600 font-medium">{roadmapSubject}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-slate-400 font-medium text-[11px] flex items-center justify-between">
                <span>Mục tiêu điểm số</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>
              <div className="font-bold text-blue-700">
                {roadmapScore}
              </div>
              <div className="text-[10px] text-slate-500">Mục tiêu bứt phá VDC 9+</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-slate-400 font-medium text-[11px] flex items-center justify-between">
                <span>Thời gian ôn thi</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="font-bold text-amber-700">
                Còn {roadmapDays} Ngày
              </div>
              <div className="text-[10px] text-slate-500">Mục tiêu {roadmapDailyHours}h / ngày</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-slate-400 font-medium text-[11px] flex items-center justify-between">
                <span>Tiến độ tổng thể</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="font-bold text-emerald-700">
                {roadmapProgressPercent}% Hoàn thành
              </div>
              <div className="text-[10px] text-slate-500">{completedStationsCount}/{totalStations || 6} trạm kiến thức</div>
            </div>
          </div>

          {/* Active Milestone Highlight Card */}
          <div className="p-4.5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border border-blue-200/90 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Cột mốc đang học
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Chuyên môn: <strong className="text-slate-700">{activeNode?.subject || roadmapSubject}</strong>
                </span>
                {activeNode && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    Trạm {activeNode.stationNumber}: {activeNode.status === 'completed' ? 'Đã hoàn thành' : 'Đang chinh phục'}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-base text-slate-900 leading-snug">
                {activeNode?.title || studyContext.topicTitle}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-1">
                {activeNode?.summary || 'Luyện tập chuyên sâu và củng cố kiến thức cùng Cố vấn Dr. Minerva AI'}
              </p>
              <div className="text-xs text-slate-600 flex items-center gap-2 pt-1">
                <span>Tiến độ bài tập trạm này:</span>
                <strong className="text-emerald-700 font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  {activeNode?.status === 'completed' 
                    ? (activeNode.practiceQuestions?.length || 4) 
                    : Math.min(studyContext.completedExercisesCount || 0, activeNode?.practiceQuestions?.length || 4)
                  }/{activeNode?.practiceQuestions?.length || 4} bài đã giải
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('roadmap')}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Vào Sơ Đồ Trạm</span>
              </button>
              <button
                onClick={() => {
                  const topic = activeNode?.title || studyContext.topicTitle;
                  studySyncService.setNavigationIntent({
                    topicTitle: topic,
                    subject: activeNode?.subject || roadmapSubject,
                    milestoneId: activeNode?.id || studyContext.milestoneId,
                    tab: 'practice',
                    initialPrompt: `Chào Cố vấn AI! Em muốn học và luyện tập chuyên đề: ${topic} (${roadmapSubject}). Hãy bắt đầu bằng tóm tắt lý thuyết và một bài toán trắc nghiệm phân loại!`
                  });
                  onNavigate('chat', `Chào Cố vấn AI! Em muốn học và luyện tập chuyên đề: ${topic} (${roadmapSubject}). Hãy bắt đầu bằng tóm tắt lý thuyết và một bài toán trắc nghiệm phân loại!`);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>Tiếp tục học cùng AI →</span>
              </button>
            </div>
          </div>

          {/* Ghi chú hỗ trợ Cố vấn AI */}
          <div className="pt-1">
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Định hướng Cố vấn Dr. Minerva AI hỗ trợ theo lộ trình:
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                'Phân bổ thời khóa biểu & bám sát từng trạm',
                'Giải thích Socratic từng bước (không spoil đáp án)',
                'Rèn luyện bộ câu hỏi trắc nghiệm & bẫy đề thi',
                'Mở khóa huy hiệu thực chiến qua bài tập & mini-game'
              ].map((need, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200/70 text-xs font-medium flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  {need}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3.1. Radar Năng Lực 5 Chiều Thực Chiến */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Radar Năng Lực 5 Chiều Thực Chiến
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đồng bộ Live cùng AI
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Chỉ số tự động điều chỉnh theo thời gian thực dựa trên độ khó bài tập bạn giải quyết trong Cố vấn AI.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                Đã giải: <span className="font-bold text-blue-600">{completedCount} bài tập</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{streak} ngày</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left: SVG Radar Graphic */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-slate-50/70 to-blue-50/30 border border-slate-200/80">
              <div className="relative w-[300px] h-[300px] max-w-full flex items-center justify-center">
                <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-xs overflow-visible">
                  {/* Background concentric reference polygons */}
                  {[0.25, 0.5, 0.75, 1].map((scale, sIdx) => {
                    const polyPoints = radarAxes
                      .map((_, i) => {
                        const pt = getRadarPoint(i, radarAxes.length, scale, 160, 110);
                        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
                      })
                      .join(' ');
                    return (
                      <polygon
                        key={sIdx}
                        points={polyPoints}
                        fill={scale === 1 ? 'rgba(241, 245, 249, 0.5)' : 'none'}
                        stroke="#cbd5e1"
                        strokeWidth={scale === 1 ? '1.5' : '1'}
                        strokeDasharray={scale === 1 ? 'none' : '3,3'}
                      />
                    );
                  })}

                  {/* Radial Axis Lines */}
                  {radarAxes.map((_, i) => {
                    const outerPt = getRadarPoint(i, radarAxes.length, 1, 160, 110);
                    return (
                      <line
                        key={i}
                        x1={160}
                        y1={160}
                        x2={outerPt.x}
                        y2={outerPt.y}
                        stroke="#e2e8f0"
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  {/* Real-time Dynamic Polygon */}
                  <polygon
                    points={radarPolygonPoints}
                    fill="url(#radarGradient)"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    className="transition-all duration-700 ease-out"
                  />

                  {/* Vertices Points with glowing circles */}
                  {radarAxes.map((axis, i) => {
                    const pt = getRadarPoint(i, radarAxes.length, axis.value / 100, 160, 110);
                    return (
                      <g key={axis.id} className="transition-all duration-700">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="6"
                          fill="#ffffff"
                          stroke="#2563eb"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="2.5"
                          fill="#3b82f6"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="mt-2 text-center">
                <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                  Biểu đồ 5 trục năng lực cốt lõi
                </span>
              </div>
            </div>

            {/* Right: Dimension Detail Bars & Action */}
            <div className="lg:col-span-7 space-y-3.5">
              {radarAxes.map((axis) => (
                <div
                  key={axis.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">
                        {axis.label}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                        {axis.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-blue-700">
                        {axis.value}%
                      </span>
                      <button
                        onClick={() => {
                          studySyncService.setNavigationIntent(axis.intent);
                          onNavigate('chat', axis.prompt);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                        title="Bấm để Cố vấn AI hướng dẫn luyện nâng cao trục này"
                      >
                        <span>Luyện ngay</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${axis.color} transition-all duration-700`}
                      style={{ width: `${axis.value}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    Chỉ số này đồng bộ trực tiếp với thanh trắc nghiệm và bài tập trong <strong>Cố vấn AI</strong>.
                  </span>
                </div>
                <button
                  onClick={() => {
                    studySyncService.setNavigationIntent({
                      tab: 'practice',
                      initialPrompt: 'Chào Cố vấn AI! Em muốn kiểm tra tổng thể và luyện chuyên đề cần bứt phá điểm số.'
                    });
                    onNavigate('chat', 'Chào Cố vấn AI! Em muốn kiểm tra tổng thể và luyện chuyên đề cần bứt phá điểm số.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 flex-shrink-0 ml-2 cursor-pointer"
                >
                  <span>Mở Chat AI</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3.2. Tủ Huy Hiệu Thành Tích & Danh Hiệu Sĩ Tử (Achievement Badges Showcase) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Tủ Huy Hiệu Thành Tích & Thực Chiến
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Các mốc thành tích mở khóa tự động khi bạn vượt qua các dạng bài tập phân loại cùng Cố vấn AI.
              </p>
            </div>

            <div className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Đã mở: <span className="text-amber-600 font-bold">{BADGES.filter(b => b.unlocked).length}</span> / {BADGES.length} huy hiệu
            </div>
          </div>

          {/* Banner Đấu Trường Trò Chơi Chinh Phục Mục Tiêu Lộ Trình */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white border border-indigo-800/60 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Đấu Trường Arcade 2D Tri Thức
                </span>
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  🎯 Mục tiêu: {roadmapSchool} • {roadmapScore}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-indigo-400" />
                Vượt Cạm Bẫy Đề Thi &amp; Mở Khóa Huy Hiệu Real-Time
              </h4>
              <p className="text-xs text-indigo-200/90 max-w-xl leading-relaxed">
                Trò chơi kỹ năng phản xạ thực thụ: Bắn hạ các <strong>Cạm Bẫy Đề Thi</strong> (Bẫy Quên ĐKXĐ, Bẫy Đổi Dấu...), thu thập <strong>Ngọc Tri Thức Lộ Trình</strong> để trực tiếp mở khóa danh hiệu thay vì trả lời câu hỏi trắc nghiệm!
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                onClick={() => openArcadeGame()}
                className="w-full md:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-xs shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>VÀO ĐẤU TRƯỜNG CHƠI NGAY →</span>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BADGES.map((badge) => {
              const IconComp = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-white via-white to-amber-50/30 border-amber-200/90 shadow-xs hover:shadow-md hover:border-amber-300'
                      : 'bg-slate-50/70 border-slate-200/80 opacity-75 hover:opacity-90'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs ${
                          badge.unlocked
                            ? `bg-gradient-to-tr ${badge.gradient} text-white ring-2 ring-amber-100`
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>

                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          badge.unlocked
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-200/80 text-slate-600'
                        }`}
                      >
                        {badge.unlocked ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            Đã Đạt
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-slate-500" />
                            Chưa mở
                          </>
                        )}
                      </span>
                    </div>

                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      {badge.category}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">
                      {badge.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      {badge.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    {badge.stationTitle && (
                      <div className="text-[10px] text-blue-600 font-medium flex items-center gap-1 bg-blue-50/70 px-2 py-0.5 rounded-md w-fit">
                        <Compass className="w-3 h-3 text-blue-500" />
                        <span className="truncate max-w-[180px]">{badge.stationTitle}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-medium">
                      <span>Tiến trình mở khóa</span>
                      <span className="font-semibold text-slate-700">{badge.progressText}</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          badge.unlocked ? `bg-gradient-to-r ${badge.gradient}` : 'bg-slate-400'
                        }`}
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>

                    <div className="pt-1 flex flex-col gap-1.5">
                      <button
                        onClick={() => openArcadeGame(badge.id)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                          badge.unlocked
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/20 active:scale-95'
                        }`}
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span>{badge.unlocked ? '🎮 Chơi Lại Đấu Trường' : '🚀 Chơi Game Vượt Trạm Mở Khóa'}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (badge.stationTitle) {
                            onNavigate('roadmap');
                          } else {
                            studySyncService.setNavigationIntent(badge.intent);
                            onNavigate('chat', badge.prompt);
                          }
                        }}
                        className="w-full py-1.5 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Luyện tập trên Lộ Trình</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Navigation Shortcuts */}
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Bảng Điều Khiển &amp; Nhiệm Vụ Hôm Nay</h4>
            <p className="text-xs text-slate-500 mt-1">Đếm ngược kỳ thi, hoàn thành checklist bài tập và kiểm tra radar năng lực</p>
          </button>

          <button
            onClick={() => onNavigate('chat')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Sparkles className="w-5 h-5" />
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Phòng Chat Cố Vấn Dr. Minerva AI</h4>
            <p className="text-xs text-slate-500 mt-1">Hỏi bài tập 24/7 với giải pháp Socratic, công thức LaTeX và code Sympy kiểm chứng</p>
          </button>
        </div>

      </div>

      {/* 5. Arcade Mini-Game 2D Chinh Phục Mục Tiêu Lộ Trình (Thay thế hoàn toàn câu hỏi trắc nghiệm) */}
      <RoadmapArcadeModal
        isOpen={isArcadeModalOpen}
        onClose={() => setIsArcadeModalOpen(false)}
        targetSchool={roadmapSchool}
        targetScore={roadmapScore}
        targetSubject={roadmapSubject}
        focusBadgeId={arcadeFocusBadgeId}
        unlockedBadges={unlockedBadges}
        onUnlockBadge={handleUnlockBadgeFromGame}
        onBonusExerciseSolved={() => {
          const u = api.getUser();
          if (u && u.profile) {
            u.profile.solved_problems = (u.profile.solved_problems || 0) + 1;
            api.setUser(u);
            setProfile({ ...u.profile });
          }
        }}
      />
              {/* Edit Name & Avatar Modal */}
      {isIdentityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-floating border border-white shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setIsIdentityModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

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

              {/* Upload Custom Avatar */}
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

              {/* 12 Presets Grid */}
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
    </div>
  );
};
