import React, { useState, useEffect } from 'react';
import { PageType, UserProfile, RoadmapData } from '../types';
import { api } from '../services/api';
import { studySyncService, ActiveStudyContext, StudyNavigationIntent } from '../services/studySyncService';
import { generateRoadmap, GOALS, VARIANTS, LEVELS, TARGET_BANDS } from '../services/roadmapEngine';
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
  Activity
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

  // Synced Roadmap State
  const [syncedRoadmap, setSyncedRoadmap] = useState<RoadmapData | null>(null);
  const [studyContext, setStudyContext] = useState<ActiveStudyContext>(studySyncService.getActiveContext());

  // Edit Goal & Roadmap Modal State (matching 4-Goal Architecture)
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('THPT_QG');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('A00');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('thpt_kha');
  const [selectedTargetBandId, setSelectedTargetBandId] = useState<string>('thpt_26_28');
  const [selectedDaysLeft, setSelectedDaysLeft] = useState<number>(88);
  const [editSchool, setEditSchool] = useState('');
  const [editNeeds, setEditNeeds] = useState<string[]>([]);
  const [isSavingGoal, setIsSavingGoal] = useState(false);

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
      const saved = api.getUserRoadmap(u?.id);
      if (saved) {
        setSyncedRoadmap(saved);
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
      setEditSchool(activeProf.school || '');
      setEditNeeds(activeProf.learning_needs || ['Gợi mở phương pháp giải Socratic']);
    } else {
      // Clean initial profile matching the real user starting from 0
      const initialProf: UserProfile = {
        id: u.id,
        email: u.email,
        full_name: u.full_name || 'Học viên',
        avatar_url: u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${u.email}`,
        school: 'Chưa cập nhật',
        target_exam: 'THPT_QG',
        target_score: '26 - 28 Điểm',
        current_level: 'Khá (6.5 - 8.0đ)',
        focus_subjects: ['Toán học', 'Vật lý', 'Hóa học'],
        learning_needs: ['Gợi mở phương pháp giải Socratic'],
        streak_days: 1,
        avg_score: 8.0,
        study_hours: 0.0,
        solved_problems: 0
      };
      setProfile(initialProf);
      setEditSchool(initialProf.school);
      setEditNeeds(initialProf.learning_needs);
    }
    setIsLoading(false);
  };

  const openEditGoalModal = () => {
    const currentGoal = GOALS.find(g => 
      syncedRoadmap?.targetExam?.includes(g.name) ||
      syncedRoadmap?.title?.includes(g.name) ||
      g.id === studyContext.goalId ||
      g.id === profile?.target_exam ||
      g.name === profile?.target_exam
    ) || GOALS[0];

    const currentVariant = VARIANTS.find(v => 
      syncedRoadmap?.title?.includes(v.name) ||
      syncedRoadmap?.title?.includes(v.id) ||
      studyContext.goalName?.includes(v.name) ||
      studyContext.goalName?.includes(v.id)
    ) || VARIANTS.find(v => v.goalId === currentGoal.id) || VARIANTS[0];

    const currentLevel = LEVELS.find(l => 
      l.goalId === currentGoal.id && (
        syncedRoadmap?.currentLevel?.includes(l.label) ||
        profile?.current_level?.includes(l.label) ||
        l.id === profile?.current_level
      )
    ) || LEVELS.find(l => l.goalId === currentGoal.id) || LEVELS[0];

    const currentBand = TARGET_BANDS.find(tb => 
      tb.goalId === currentGoal.id && (
        syncedRoadmap?.targetScore?.includes(tb.label) ||
        profile?.target_score?.includes(tb.label) ||
        tb.id === profile?.target_score
      )
    ) || TARGET_BANDS.find(tb => tb.goalId === currentGoal.id) || TARGET_BANDS[0];

    setSelectedGoalId(currentGoal.id);
    setSelectedVariantId(currentVariant.id);
    setSelectedLevelId(currentLevel.id);
    setSelectedTargetBandId(currentBand.id);
    setSelectedDaysLeft(syncedRoadmap?.daysLeft || 88);
    setEditSchool(profile?.school || '');
    setEditNeeds(profile?.learning_needs || ['Gợi mở phương pháp giải Socratic']);
    setIsEditingGoal(true);
  };

  const handleSaveGoalConfiguration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile) return;
    setIsSavingGoal(true);

    try {
      const goalObj = GOALS.find(g => g.id === selectedGoalId) || GOALS[0];
      const variantObj = VARIANTS.find(v => v.id === selectedVariantId) || VARIANTS[0];
      const levelObj = LEVELS.find(l => l.id === selectedLevelId) || LEVELS[0];
      const targetBandObj = TARGET_BANDS.find(tb => tb.id === selectedTargetBandId) || TARGET_BANDS[0];

      // 1. Generate updated roadmap with all 5 parameters
      const newRoadmap = generateRoadmap({
        goalId: goalObj.id,
        variantId: variantObj.id,
        levelId: levelObj.id,
        targetBandId: targetBandObj.id,
        daysLeft: selectedDaysLeft
      });

      // 2. Save roadmap locally
      const u = api.getUser();
      api.saveUserRoadmap(newRoadmap, u?.id);
      setSyncedRoadmap(newRoadmap);

      // 3. Update active study context
      studySyncService.setActiveContext({
        goalId: goalObj.id,
        goalName: `${goalObj.name} • ${variantObj.name}`,
        targetScore: targetBandObj.label,
        currentLevel: levelObj.label,
        daysLeft: selectedDaysLeft,
        topicTitle: newRoadmap.milestones?.[0]?.title || 'Kiến thức trọng tâm',
        subject: newRoadmap.milestones?.[0]?.subject || 'Toán học',
        completedExercisesCount: 0,
        totalExercisesCount: 4
      });

      // 4. Save to backend database
      await api.submitOnboarding({
        user_id: profile.id,
        full_name: profile.full_name,
        school: editSchool || profile.school,
        target_exam: goalObj.id,
        target_score: targetBandObj.label,
        current_level: levelObj.label,
        focus_subjects: variantObj.subjectIds,
        learning_needs: editNeeds
      });

      await api.configureRoadmap({
        user_id: profile.id,
        goal_id: goalObj.id,
        variant_id: variantObj.id,
        level_id: levelObj.id,
        target_band_id: targetBandObj.id,
        days_left: selectedDaysLeft,
        title: newRoadmap.title,
        target_score: newRoadmap.targetScore,
        current_level: newRoadmap.currentLevel,
        stages: newRoadmap.stages,
        milestones: newRoadmap.milestones,
        schedule: newRoadmap.schedule
      });

      // Update local profile state
      setProfile(prev => prev ? ({
        ...prev,
        school: editSchool || prev.school,
        target_exam: goalObj.id,
        target_score: targetBandObj.label,
        current_level: levelObj.label,
        learning_needs: editNeeds
      }) : null);

      setIsEditingGoal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleLogoutClick = () => {
    api.clearUser();
    if (onLogout) onLogout();
    onNavigate('login');
  };

  const toggleNeed = (need: string) => {
    setEditNeeds(prev => 
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
  };

  // 5-Axis Real-Time Competency Calculation based on Study Sync Service
  const completedIds = studyContext.completedExercises || [];
  const completedCount = completedIds.length;
  const streak = studyContext.streakDays || 1;

  const hasVdc = completedIds.includes('ex_math_vdc_1');
  const hasTrap = completedIds.includes('ex_math_trap_1');
  const hasMatch = completedIds.includes('ex_math_match_1');
  const hasOrder = completedIds.includes('ex_math_order_1') || completedIds.includes('ex_dsa_order_1');

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

  const BADGES: Array<{
    id: string;
    title: string;
    desc: string;
    icon: any;
    unlocked: boolean;
    category: string;
    progress: number;
    progressText: string;
    gradient: string;
    prompt: string;
    intent: StudyNavigationIntent;
  }> = [
    {
      id: 'b1',
      title: 'Chiến Binh Socratic',
      desc: 'Tương tác & giải quyết thành công bài tập cùng Cố vấn AI',
      icon: Award,
      unlocked: completedCount >= 1,
      category: 'Tương tác AI',
      progress: Math.min(1, completedCount) * 100,
      progressText: `${Math.min(1, completedCount)}/1 bài`,
      gradient: 'from-amber-500 to-orange-500',
      prompt: 'Chào Cố vấn AI! Em muốn học và luyện tập trắc nghiệm chuyên sâu.',
      intent: {
        exerciseType: 'multiple_choice',
        tab: 'practice',
        initialPrompt: 'Chào Cố vấn AI! Em muốn học và luyện tập trắc nghiệm chuyên sâu.'
      }
    },
    {
      id: 'b2',
      title: 'Thám Tử Bắt Bẫy',
      desc: 'Nhận diện đúng bẫy biến đổi giả thiết và điều kiện liên tục',
      icon: ShieldCheck,
      unlocked: hasTrap,
      category: 'Độ chính xác',
      progress: hasTrap ? 100 : 0,
      progressText: hasTrap ? 'Đã bắt bẫy' : '0/1 bài',
      gradient: 'from-emerald-500 to-teal-600',
      prompt: 'Em muốn thử thách bài tập Bẫy Đề Thi phân loại.',
      intent: {
        exerciseType: 'trap_detect',
        tab: 'practice',
        initialPrompt: 'Em muốn thử thách bài tập Bẫy Đề Thi phân loại.'
      }
    },
    {
      id: 'b3',
      title: 'Bậc Thầy Ghép Đôi',
      desc: 'Khớp chính xác bổ đề đối xứng với công thức tích phân',
      icon: Sparkles,
      unlocked: hasMatch,
      category: 'Phương pháp',
      progress: hasMatch ? 100 : 0,
      progressText: hasMatch ? 'Đã ghép đôi' : '0/1 bài',
      gradient: 'from-blue-500 to-indigo-600',
      prompt: 'Em muốn làm bài tập Ghép Đôi Công Thức và bổ đề đối xứng.',
      intent: {
        exerciseType: 'matching_pairs',
        tab: 'practice',
        initialPrompt: 'Em muốn làm bài tập Ghép Đôi Công Thức và bổ đề đối xứng.'
      }
    },
    {
      id: 'b4',
      title: 'Kiến Trúc Sư Logic',
      desc: 'Sắp xếp đúng trình tự các bước khử ẩn và giải thuật',
      icon: Layers,
      unlocked: hasOrder,
      category: 'Thuật toán',
      progress: hasOrder ? 100 : 0,
      progressText: hasOrder ? 'Đã sắp xếp' : '0/1 bài',
      gradient: 'from-purple-500 to-violet-600',
      prompt: 'Em muốn làm bài tập Sắp Xếp Thứ Tự các bước giải toán.',
      intent: {
        exerciseType: 'ordering_steps',
        tab: 'practice',
        initialPrompt: 'Em muốn làm bài tập Sắp Xếp Thứ Tự các bước giải toán.'
      }
    },
    {
      id: 'b5',
      title: 'Chuỗi Lửa Bất Diệt',
      desc: `Duy trì kỷ luật học tập đều đặn hàng ngày (${streak} ngày)`,
      icon: Flame,
      unlocked: streak >= 1,
      category: 'Kỷ luật',
      progress: Math.min(100, (streak / 7) * 100),
      progressText: `${streak}/7 ngày`,
      gradient: 'from-rose-500 to-red-600',
      prompt: 'Cố vấn kiểm tra chuỗi streak học tập và checklist hôm nay của em.',
      intent: {
        tab: 'pomodoro',
        initialPrompt: 'Cố vấn kiểm tra chuỗi streak học tập và checklist hôm nay của em.'
      }
    },
    {
      id: 'b6',
      title: 'Thủ Khoa Đích Thực 9+',
      desc: 'Chinh phục toàn diện từ 4 định dạng bài tập chuyên sâu trở lên',
      icon: Trophy,
      unlocked: completedCount >= 4,
      category: 'Đỉnh cao',
      progress: Math.min(100, (completedCount / 4) * 100),
      progressText: `${Math.min(4, completedCount)}/4 định dạng`,
      gradient: 'from-yellow-400 to-amber-600',
      prompt: 'Em muốn làm bài toán phân loại VDC 9.6 điểm bám sát đề thi mới nhất.',
      intent: {
        difficulty: 'Vận dụng cao 9+',
        tab: 'practice',
        initialPrompt: 'Em muốn làm bài toán phân loại VDC 9.6 điểm bám sát đề thi mới nhất.'
      }
    }
  ];

  // Active Goal & Variant Resolution (Prioritizing Synced Roadmap & Study Context)
  const activeGoal = GOALS.find(g => 
    syncedRoadmap?.targetExam?.includes(g.name) ||
    syncedRoadmap?.title?.includes(g.name) ||
    g.id === studyContext.goalId ||
    g.id === profile?.target_exam ||
    g.name === profile?.target_exam
  ) || GOALS[0];

  const activeVariant = VARIANTS.find(v => 
    syncedRoadmap?.title?.includes(v.name) ||
    syncedRoadmap?.title?.includes(v.id) ||
    studyContext.goalName?.includes(v.name) ||
    studyContext.goalName?.includes(v.id)
  ) || VARIANTS.find(v => v.goalId === activeGoal.id) || VARIANTS[0];

  const displayTargetScore = syncedRoadmap?.targetScore || profile?.target_score || '26 - 28 Điểm';
  const displayLevel = syncedRoadmap?.currentLevel || profile?.current_level || 'Khá';
  const availableVariants = VARIANTS.filter(v => v.goalId === selectedGoalId);
  const availableLevels = LEVELS.filter(l => l.goalId === selectedGoalId);
  const availableTargetBands = TARGET_BANDS.filter(t => t.goalId === selectedGoalId);

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
                onClick={openEditGoalModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Đổi mục tiêu &amp; Lộ trình</span>
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
              <div className="text-xl font-bold text-slate-900">{profile?.streak_days ?? 1} Ngày</div>
              <div className="text-[11px] text-slate-500">Chuỗi học tập liên tục</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{profile?.avg_score ? `${profile.avg_score}/10` : '--/10'}</div>
              <div className="text-[11px] text-slate-500">Điểm kiểm tra trung bình</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{profile?.study_hours ?? 0.0} Giờ</div>
              <div className="text-[11px] text-slate-500">Thời gian cùng Cố vấn AI</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{profile?.solved_problems ?? 0} Bài</div>
              <div className="text-[11px] text-slate-500">Bài tập đã hoàn thành</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2.5 LỘ TRÌNH HỌC TẬP ĐỒNG BỘ TRỰC TUYẾN (ACTIVE ROADMAP SYNC CARD) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    Lộ Trình Học Tập Cá Nhân Hóa (Đồng Bộ Trực Tuyến)
                  </h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đang đồng bộ
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Dữ liệu đồng bộ trực tiếp hai chiều với Sơ Đồ Lộ Trình, Phòng Chat AI &amp; Bài Tập Rèn Luyện
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('roadmap')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Xem Chi Tiết Lộ Trình</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={openEditGoalModal}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
              >
                <span>Đổi Mục Tiêu</span>
              </button>
            </div>
          </div>

          {/* Roadmap Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-slate-400 font-medium text-[11px]">Kỳ thi mục tiêu</div>
              <div className="font-bold text-slate-900 truncate">
                {activeGoal.name}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-slate-400 font-medium text-[11px]">Mục tiêu điểm số</div>
              <div className="font-bold text-blue-700">
                {syncedRoadmap?.targetScore || profile?.target_score || '27.5+'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-slate-400 font-medium text-[11px]">Thời gian ôn thi</div>
              <div className="font-bold text-indigo-700">
                Còn {syncedRoadmap?.daysLeft || 88} Ngày
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-slate-400 font-medium text-[11px]">Tiến độ tổng thể</div>
              <div className="font-bold text-emerald-700">
                {syncedRoadmap?.totalProgress || 0}% Hoàn thành
              </div>
            </div>
          </div>

          {/* Active Milestone Highlight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border border-blue-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  Cột mốc đang học
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Chuyên môn: <strong className="text-slate-700">{studyContext.subject}</strong>
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 leading-snug truncate">
                {studyContext.topicTitle}
              </h4>
              <div className="text-xs text-slate-600 flex items-center gap-2 pt-0.5">
                <span>Tiến độ bài tập:</span>
                <strong className="text-emerald-700 font-mono">
                  {studyContext.completedExercisesCount}/{studyContext.totalExercisesCount} bài đã hoàn thành
                </strong>
              </div>
            </div>

            <button
              onClick={() => {
                studySyncService.setNavigationIntent({
                  topicTitle: studyContext.topicTitle,
                  subject: studyContext.subject,
                  milestoneId: studyContext.milestoneId,
                  tab: 'practice',
                  initialPrompt: `Chào Cố vấn AI! Em muốn học và luyện tập chuyên đề: ${studyContext.topicTitle} (${studyContext.subject}). Hãy bắt đầu bằng một bài toán ví dụ hoặc tóm tắt phương pháp giải!`
                });
                onNavigate('chat', `Chào Cố vấn AI! Em muốn học và luyện tập chuyên đề: ${studyContext.topicTitle} (${studyContext.subject}). Hãy bắt đầu bằng một bài toán ví dụ hoặc tóm tắt phương pháp giải!`);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Tiếp tục học cùng AI →</span>
            </button>
          </div>
        </div>

        {/* 3. Current Learning Goal Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Mục Tiêu &amp; Lộ Trình Hiện Tại</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                    Cá nhân hóa AI
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Dữ liệu trọng tâm làm cơ sở để Cố vấn AI phân bổ thời khóa biểu, độ khó và đề thi thử
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openEditGoalModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200/80 transition-all hover:scale-102 active:scale-95 shadow-2xs cursor-pointer"
                title="Bấm để thay đổi mục tiêu, khối thi và trình độ"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Đổi mục tiêu &amp; Khối thi</span>
              </button>
              <button
                onClick={() => onNavigate('roadmap')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <span>Xem lộ trình chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors">
              <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
                <span>Kỳ thi &amp; Khối / Tổ hợp</span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="font-bold text-sm text-slate-900">
                {activeGoal.name}
              </div>
              <div className="text-xs font-medium text-blue-700 mt-1 line-clamp-1">
                {activeVariant.name}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors">
              <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
                <span>Mục tiêu điểm số</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>
              <div className="font-bold text-sm text-indigo-700">
                {displayTargetScore}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Thang điểm: {activeGoal.scoreScale}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors">
              <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
                <span>Trình độ đánh giá</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="font-bold text-sm text-emerald-700">
                {displayLevel}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                AI phân bổ độ khó theo năng lực
              </div>
            </div>
          </div>

          {/* Active Phase & Days countdown row */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-slate-50 border border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <div className="text-xs">
                <span className="text-slate-500 font-medium">Giai đoạn đang học: </span>
                <strong className="text-slate-900 font-semibold">
                  {syncedRoadmap?.stages?.[0]?.title || 'Chặng 1: Nền Tảng Trọng Tâm & Bứt Phá VDC'}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                ⏳ Còn <span className="text-blue-700 font-bold">{syncedRoadmap?.daysLeft || 88} ngày</span> ôn luyện
              </span>
              <button
                onClick={() => onNavigate('roadmap')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Chỉnh thời gian</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Learning needs badges */}
          <div className="pt-1">
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Các mảng học sinh yêu cầu Cố vấn AI tập trung hỗ trợ:
            </div>
            <div className="flex flex-wrap gap-2">
              {profile?.learning_needs && profile.learning_needs.length > 0 ? (
                profile.learning_needs.map((need, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200/70 text-xs font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    {need}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Chưa có ghi chú đặc biệt</span>
              )}
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

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
                      <span>Tiến trình</span>
                      <span className="font-semibold text-slate-700">{badge.progressText}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          badge.unlocked ? `bg-gradient-to-r ${badge.gradient}` : 'bg-slate-400'
                        }`}
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>

                    <button
                      onClick={() => {
                        studySyncService.setNavigationIntent(badge.intent);
                        onNavigate('chat', badge.prompt);
                      }}
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        badge.unlocked
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/70'
                          : 'bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <span>{badge.unlocked ? 'Luyện tập nâng cao' : 'Mở khóa cùng AI'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
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
            <h4 className="font-bold text-sm text-slate-900">Bảng Điều Khiển & Nhiệm Vụ Hôm Nay</h4>
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

      {/* 4-Step Comprehensive Goal & Roadmap Modal */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white relative shrink-0">
              <button
                onClick={() => setIsEditingGoal(false)}
                className="absolute top-5 right-5 text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold">Tùy Chỉnh Mục Tiêu &amp; Lộ Trình Học Tập</h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Chọn đúng kỳ thi, khối thi và mục tiêu điểm để Cố vấn AI tự động tái tạo thời khóa biểu và phân bổ độ khó
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveGoalConfiguration} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* Step 1: Chọn Goal (4 mục tiêu) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Target className="w-4 h-4 text-blue-600" />
                  1. Chọn Kỳ thi trọng tâm:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {GOALS.map(g => {
                    const isSelected = selectedGoalId === g.id;
                    return (
                      <div
                        key={g.id}
                        onClick={() => {
                          setSelectedGoalId(g.id);
                          const v = VARIANTS.find(v => v.goalId === g.id);
                          if (v) setSelectedVariantId(v.id);
                          const l = LEVELS.find(l => l.goalId === g.id);
                          if (l) setSelectedLevelId(l.id);
                          const t = TARGET_BANDS.find(t => t.goalId === g.id);
                          if (t) setSelectedTargetBandId(t.id);
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-600 text-blue-950 shadow-xs ring-2 ring-blue-500/20'
                            : 'bg-slate-50/70 border-slate-200/90 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-xs">{g.name}</div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="text-[10px] text-blue-700 font-semibold mt-0.5">{g.scoreScale}</div>
                        <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{g.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Chọn Variant (Khối thi / Vùng thi) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  2. Khối thi / Tổ hợp chuyên đề (Variant):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableVariants.map(v => {
                    const isSelected = selectedVariantId === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold shadow-2xs ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs">{v.name}</div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">{v.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Chọn Level (Trình độ) & Step 4: Target Band */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Level */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Flame className="w-4 h-4 text-amber-500" />
                    3. Trình độ đánh giá hiện tại:
                  </label>
                  <div className="space-y-1.5">
                    {availableLevels.map(l => {
                      const isSelected = selectedLevelId === l.id;
                      return (
                        <div
                          key={l.id}
                          onClick={() => setSelectedLevelId(l.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all text-xs ${
                            isSelected
                              ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{l.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">{l.profile}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Target Band */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Target className="w-4 h-4 text-emerald-600" />
                    4. Mức điểm mục tiêu mong muốn:
                  </label>
                  <div className="space-y-1.5">
                    {availableTargetBands.map(t => {
                      const isSelected = selectedTargetBandId === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTargetBandId(t.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all text-xs ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{t.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Days left */}
                  <div className="pt-2">
                    <label className="font-bold text-slate-800 block text-xs mb-1">
                      Số ngày đếm ngược đến kỳ thi:
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={365}
                      value={selectedDaysLeft}
                      onChange={(e) => setSelectedDaysLeft(Number(e.target.value) || 88)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Needs */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Mảng cần Cố vấn AI ưu tiên hỗ trợ:</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    'Gợi mở phương pháp giải Socratic (không spoil đáp án)',
                    'Mẹo bấm máy tính Casio & công thức giải nhanh',
                    'Luyện đề thi thử các trường Chuyên (Sư Phạm, KHTN)',
                    'Phân bổ thời khóa biểu & nhắc nhở kỷ luật học tập'
                  ].map(need => {
                    const isChecked = editNeeds.includes(need);
                    return (
                      <button
                        key={need}
                        type="button"
                        onClick={() => toggleNeed(need)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                          isChecked ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="line-clamp-1">{need}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSavingGoal}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>{isSavingGoal ? 'Đang tái tạo lộ trình...' : 'Lưu & Tái Tạo Lộ Trình AI'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

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
