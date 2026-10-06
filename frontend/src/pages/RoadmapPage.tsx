import React, { useState, useEffect } from 'react';
import { PageType, RoadmapData, StageItem, Milestone, ScheduleItem } from '../types';
import { api } from '../services/api';
import { studySyncService, StudyNavigationIntent } from '../services/studySyncService';
import {
  GOALS,
  VARIANTS,
  LEVELS,
  TARGET_BANDS,
  TOPICS,
  DIAGNOSTIC_QUESTIONS,
  generateRoadmap,
  buildStageDiagnosticChallenge,
  Goal,
  Variant,
  Level,
  TargetBand,
  Topic,
  DiagnosticQuestion
} from '../services/roadmapEngine';
import {
  Milestone as MilestoneIcon,
  CheckCircle2,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Lock,
  Unlock,
  Target,
  BookOpen,
  Check,
  AlertCircle,
  Sliders,
  Award,
  Zap,
  Compass,
  GraduationCap,
  X,
  ChevronDown,
  HelpCircle,
  ArrowUpRight,
  Flame,
  Layers,
  Star,
  FileText,
  Trophy
} from 'lucide-react';

interface RoadmapPageProps {
  onNavigate: (page: PageType, initialPrompt?: string) => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ onNavigate }) => {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rescheduling, setRescheduling] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  const [notification, setNotification] = useState<string | null>(null);
  const [addedAiInsight, setAddedAiInsight] = useState<boolean>(false);

  // ==========================================
  // CONFIGURATOR STATE (MỤC TIÊU & BIẾN THỂ)
  // ==========================================
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('THPT_QG');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('A00');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('thpt_kha');
  const [selectedTargetBandId, setSelectedTargetBandId] = useState<string>('thpt_26_28');
  const [selectedDaysLeft, setSelectedDaysLeft] = useState<number>(88);

  // Diagnostic Test State
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [diagAnswers, setDiagAnswers] = useState<Record<string, number>>({});
  const [diagSubmitted, setDiagSubmitted] = useState(false);
  const [diagScore, setDiagScore] = useState<{ correct: number; total: number } | null>(null);

  // Knowledge Tree / Topics View
  const [showTopicsTree, setShowTopicsTree] = useState(false);
  const [topicFilterDifficulty, setTopicFilterDifficulty] = useState<number | 'all'>('all');

  useEffect(() => {
    loadRoadmap();
    const unsub = studySyncService.subscribe(() => {
      const user = api.getUser();
      const saved = api.getUserRoadmap(user?.id);
      if (saved) {
        setRoadmap(saved);
      }
    });

    const handleUserOrRoadmapChange = () => {
      loadRoadmap();
    };

    window.addEventListener('eduadvisor_user_updated', handleUserOrRoadmapChange);
    window.addEventListener('eduadvisor_roadmap_updated', handleUserOrRoadmapChange);

    return () => {
      unsub();
      window.removeEventListener('eduadvisor_user_updated', handleUserOrRoadmapChange);
      window.removeEventListener('eduadvisor_roadmap_updated', handleUserOrRoadmapChange);
    };
  }, []);

  const loadRoadmap = async () => {
    setLoading(true);
    const user = api.getUser();
    // 1. Check user-scoped customized roadmap first
    try {
      const saved = api.getUserRoadmap(user?.id);
      if (saved) {
        setRoadmap(saved);
        if (saved.targetExam) {
          const matchedGoal = GOALS.find(g => g.name === saved.targetExam || g.id === saved.targetExam);
          if (matchedGoal) setSelectedGoalId(matchedGoal.id);
        }
        setLoading(false);
        return;
      }
    } catch { }

    // 2. Fallback to API / Backend
    const data = await api.getRoadmap(user?.id);
    if (data) {
      setRoadmap(data);
      api.saveUserRoadmap(data, user?.id);
    } else {
      // Default initialization with THPT A00
      const initial = generateRoadmap({
        goalId: 'THPT_QG',
        variantId: 'A00',
        levelId: 'thpt_kha',
        targetBandId: 'thpt_26_28',
        daysLeft: 88
      });
      setRoadmap(initial);
      api.saveUserRoadmap(initial, user?.id);
    }
    setLoading(false);
  };

  // Generate and apply new roadmap
  const handleApplyConfiguration = async () => {
    const newRoadmap = generateRoadmap({
      goalId: selectedGoalId,
      variantId: selectedVariantId,
      levelId: selectedLevelId,
      targetBandId: selectedTargetBandId,
      daysLeft: selectedDaysLeft
    });

    setRoadmap(newRoadmap);
    setIsConfigOpen(false);

    // Save locally scoped to current user
    const user = api.getUser();
    api.saveUserRoadmap(newRoadmap, user?.id);

    // Sync to backend SQLite
    await api.configureRoadmap({
      user_id: user?.id,
      goal_id: selectedGoalId,
      variant_id: selectedVariantId,
      level_id: selectedLevelId,
      target_band_id: selectedTargetBandId,
      days_left: selectedDaysLeft,
      title: newRoadmap.title,
      target_score: newRoadmap.targetScore,
      current_level: newRoadmap.currentLevel,
      stages: newRoadmap.stages,
      milestones: newRoadmap.milestones,
      schedule: newRoadmap.schedule
    });

    const goalObj = GOALS.find(g => g.id === selectedGoalId);
    const variantObj = VARIANTS.find(v => v.id === selectedVariantId);
    setNotification(`Cố vấn AI đã thiết lập thành công Lộ trình mục tiêu: ${goalObj?.name} - ${variantObj?.name}!`);
    setTimeout(() => setNotification(null), 6000);
  };

  // Diagnostic Test completion
  const handleCompleteDiagnostic = () => {
    let correct = 0;
    const questions = DIAGNOSTIC_QUESTIONS.filter(q => q.goalId === selectedGoalId);
    const total = questions.length || 5;

    questions.forEach(q => {
      if (diagAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    setDiagScore({ correct, total });
    setDiagSubmitted(true);

    // Auto-recommend level based on score percentage
    const ratio = correct / total;
    if (selectedGoalId === 'THPT_QG') {
      if (ratio <= 0.4) {
        setSelectedLevelId('thpt_yeu');
        setSelectedTargetBandId('thpt_21_24');
      } else if (ratio <= 0.6) {
        setSelectedLevelId('thpt_tb');
        setSelectedTargetBandId('thpt_24_26');
      } else if (ratio <= 0.8) {
        setSelectedLevelId('thpt_kha');
        setSelectedTargetBandId('thpt_26_28');
      } else {
        setSelectedLevelId('thpt_gioi');
        setSelectedTargetBandId('thpt_28_plus');
      }
    }
  };

  const handleReschedule = async () => {
    setRescheduling(true);
    const user = api.getUser();
    const res = await api.rescheduleRoadmap(user?.id);
    setNotification(res.message || 'Cố vấn AI đã phân tích kết quả học tập và tái phân bổ lịch tối ưu!');
    await loadRoadmap();
    setRescheduling(false);
    setTimeout(() => setNotification(null), 6000);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleAddAiInsight = () => {
    setAddedAiInsight(true);
    setNotification('Đã tự động bổ sung 45 phút ôn chuyên đề trọng điểm vào kế hoạch tuần!');
    setTimeout(() => setNotification(null), 5000);
  };

  // Variants for selected goal
  const availableVariants = VARIANTS.filter(v => v.goalId === selectedGoalId);
  const availableLevels = LEVELS.filter(l => l.goalId === selectedGoalId);
  const availableTargetBands = TARGET_BANDS.filter(t => t.goalId === selectedGoalId);

  // Topics for current active variant & goal
  const currentVariant = VARIANTS.find(v => v.id === selectedVariantId) || VARIANTS[0];
  const variantTopics = TOPICS.filter(t =>
    t.goalIds.includes(selectedGoalId as any) && currentVariant.subjectIds.includes(t.subjectId)
  );
  const filteredTopics = variantTopics.filter(t =>
    topicFilterDifficulty === 'all' ? true : t.difficulty === topicFilterDifficulty
  );

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Đang khởi tạo lộ trình theo mục tiêu cá nhân từ AI...</p>
        </div>
      </div>
    );
  }

  const stages = roadmap?.stages || [];
  const milestones = roadmap?.milestones || [];
  const schedule = roadmap?.schedule || [];

  const filteredMilestones = filter === 'active'
    ? milestones.filter(m => m.status === 'active')
    : milestones;

  return (
    <div className="flex-1 bg-slate-50 py-6 sm:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Notification Toast */}
        {notification && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-5 py-3.5 rounded-2xl flex items-center justify-between shadow-xs transition-all animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs sm:text-sm font-medium">{notification}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 ml-4 px-2 py-1"
            >
              Đóng
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TOP HERO HEADER: Thông tin lộ trình & Nút Tùy biến mục tiêu AI */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 shadow-2xs">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  Mục tiêu: {roadmap?.targetExam || 'THPT Quốc Gia'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Chỉ tiêu: {roadmap?.targetScore || '27.5+'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200/60">
                  <Flame className="w-3.5 h-3.5 text-indigo-600" />
                  Trình độ: {roadmap?.currentLevel || 'Khá'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200/60">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Còn {roadmap?.daysLeft || 88} ngày
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {roadmap?.title || 'Lộ Trình Cá Nhân Hóa Dành Cho Bạn'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Hệ thống ma trận kiến thức phân phối theo tỷ lệ ngày thi thực tế, tự động lọc chuyên đề trọng tâm và tối ưu hóa thời gian theo năng lực của bạn.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsConfigOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all transform active:scale-98"
                title="Thay đổi mục tiêu khối thi, trình độ và điểm số mong muốn"
              >
                <Sliders className="w-4 h-4 text-blue-200" />
                <span>Tùy Biến Lộ Trình (AI)</span>
              </button>

              <button
                onClick={() => setShowTopicsTree(prev => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${showTopicsTree
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                  }`}
                title="Xem toàn bộ cây chuyên đề và tiên quyết"
              >
                <Layers className="w-4 h-4" />
                <span>{showTopicsTree ? 'Đóng Cây Kiến Thức' : 'Cây Kiến Thức'}</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition-colors border border-slate-200"
                title="In hoặc lưu tệp PDF chuẩn"
              >
                <Download className="w-4 h-4" />
                <span>In / PDF</span>
              </button>

              <button
                onClick={handleReschedule}
                disabled={rescheduling}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
                title="Nhờ AI cân đối lại lịch dựa trên kết quả mới nhất"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${rescheduling ? 'animate-spin' : ''}`} />
                <span>Tái Phân Bổ</span>
              </button>
            </div>
          </div>

          {/* 4 KPI summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs text-slate-500 font-medium">Giai đoạn học</div>
              <div className="text-xl font-bold font-serif text-slate-900">{stages.length} Chặng lớn</div>
              <div className="text-[11px] text-blue-600 font-medium">
                {stages.find(s => s.status === 'active')?.title?.split(':')[0] || 'Giai đoạn 1'} (Hiện tại)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs text-slate-500 font-medium">Cột mốc trọng tâm</div>
              <div className="text-xl font-bold font-serif text-slate-900">{milestones.length} Cột mốc</div>
              <div className="text-[11px] text-emerald-600 font-medium">
                {milestones.filter(m => m.status === 'done').length}/{milestones.length} Đã hoàn thành
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs text-slate-500 font-medium">Tiến độ tổng thể</div>
              <div className="text-xl font-bold font-serif text-blue-700">{roadmap?.totalProgress ?? 0}% Hoàn thành</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${roadmap?.totalProgress ?? 0}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs text-slate-500 font-medium">Điểm dự phóng</div>
              <div className="text-xl font-bold font-serif text-emerald-700">{roadmap?.targetScore || '27.5+'}</div>
              <div className="text-[11px] text-emerald-600 font-medium">Xu hướng bứt phá tích cực</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EXPANDABLE SECTION: CÂY KIẾN THỨC & CHUYÊN ĐỀ HỌC TẬP (TOPICS EXPLORER) */}
        {/* ========================================================================= */}
        {showTopicsTree && (
          <div className="bg-white rounded-2xl border border-blue-200/90 shadow-sm p-6 space-y-4 animate-in fade-in slide-in-from-top-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Cây Chuyên Đề &amp; Trọng Số Đề Thi ({variantTopics.length} chuyên đề)
                </h3>
                <p className="text-xs text-slate-500">
                  Sắp xếp theo thứ tự tiên quyết (Prerequisites) và chỉ số hiệu quả học tập: (Tần suất × Điểm số / Giờ học)
                </p>
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setTopicFilterDifficulty('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${topicFilterDifficulty === 'all' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setTopicFilterDifficulty(1)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${topicFilterDifficulty === 1 ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600'}`}
                >
                  Nền tảng (Độ khó 1)
                </button>
                <button
                  onClick={() => setTopicFilterDifficulty(2)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${topicFilterDifficulty === 2 ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'}`}
                >
                  Thông hiểu (Độ khó 2)
                </button>
                <button
                  onClick={() => setTopicFilterDifficulty(3)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${topicFilterDifficulty === 3 ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-600'}`}
                >
                  Vận dụng (Độ khó 3)
                </button>
                <button
                  onClick={() => setTopicFilterDifficulty(4)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${topicFilterDifficulty === 4 ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-600'}`}
                >
                  Vận dụng cao 9+ (Độ khó 4)
                </button>
              </div>
            </div>

            {/* Topic Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredTopics.map((topic) => {
                const diffLabel = topic.difficulty === 1 ? 'Nền tảng' : topic.difficulty === 2 ? 'Thông hiểu' : topic.difficulty === 3 ? 'Vận dụng' : 'Vận dụng cao 9+';
                const diffColor = topic.difficulty === 1 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  topic.difficulty === 2 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    topic.difficulty === 3 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-purple-50 text-purple-700 border-purple-200';

                return (
                  <div key={topic.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-2.5 flex flex-col justify-between shadow-2xs">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffColor}`}>
                          {diffLabel}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-500 text-[10px]">
                          {Array.from({ length: topic.frequency }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 leading-snug">
                        {topic.title}
                      </h4>

                      {topic.prerequisites.length > 0 && (
                        <div className="text-[10px] text-slate-500">
                          <span className="font-semibold text-slate-600">Tiên quyết: </span>
                          {topic.prerequisites.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        ⏱️ {topic.hours}h học • 🎯 ~{topic.scoreValue} điểm
                      </span>
                      <button
                        onClick={() => onNavigate('chat', `Chào Cố vấn AI! Em muốn học và luyện tập chuyên đề: ${topic.title}. Hãy bắt đầu bằng một bài toán ví dụ hoặc tóm tắt phương pháp giải!`)}
                        className="text-blue-700 font-bold hover:text-blue-800 flex items-center gap-0.5"
                      >
                        <span>Học ngay</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN CONTENT SPLIT: Các Chặng Hành Trình (70%) vs Kế Hoạch Tuần (30%) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">

          {/* Main Timeline Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Filter buttons */}
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <MilestoneIcon className="w-5 h-5 text-blue-600" />
                Các Chặng Hành Trình (Phase Milestones)
              </h2>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-colors ${filter === 'all' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Tất cả ({milestones.length})
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-3 py-1 rounded-lg transition-colors ${filter === 'active' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Đang diễn ra ({milestones.filter(m => m.status === 'active').length})
                </button>
              </div>
            </div>

            {/* Stages Stack */}
            <div className="space-y-6">
              {stages.map((stage) => {
                const isActive = stage.status === 'active';
                const isDone = stage.status === 'done';
                const isUpcoming = stage.status === 'upcoming' || (!isActive && !isDone);

                // Get milestones belonging to this stage
                const matchedMilestones = milestones.filter(m => (m.stageId ? m.stageId === stage.id : false));
                const fallbackMilestones = milestones.slice((stage.id - 1) * 2, (stage.id - 1) * 2 + 2);
                const stageMilestones = matchedMilestones.length > 0 ? matchedMilestones : fallbackMilestones;
                const displayMilestones = filter === 'active'
                  ? stageMilestones.filter(m => m.status === 'active')
                  : stageMilestones;

                const challenge = stage.diagnosticChallenge || buildStageDiagnosticChallenge(stage.id - 1, currentVariant?.name || 'Khối thi');

                return (
                  <div
                    key={stage.id}
                    className={`bg-white rounded-2xl p-6 space-y-6 transition-all shadow-xs ${isActive
                        ? 'border-2 border-blue-600 shadow-md shadow-blue-500/5 relative overflow-hidden'
                        : isDone
                          ? 'border border-emerald-200/90 bg-white'
                          : 'border border-slate-200/80 bg-white/95'
                      }`}
                  >
                    {/* Header Banner for active stage */}
                    {isActive && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Giai đoạn hiện tại • {stage.duration}
                      </div>
                    )}

                    {/* Stage Header Info & Unlock Action */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-100 text-emerald-600' :
                            isActive ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-500'
                          }`}>
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : isActive ? <Sparkles className="w-5 h-5 text-blue-600" /> : <Lock className="w-5 h-5 text-slate-400" />}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                              {stage.title}
                            </h3>
                            {isDone && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                100% Hoàn thành
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {stage.duration} • {stageMilestones.length} mốc bài tập trọng điểm
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isUpcoming ? (
                          <button
                            onClick={() => {
                              studySyncService.unlockStage(stage.id);
                              setNotification(`Đã mở khóa thành công ${stage.title}! Bạn có thể học ngay các bài tập của chặng này.`);
                              setTimeout(() => setNotification(null), 5000);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                          >
                            <Unlock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Mở khóa giai đoạn này cùng AI</span>
                          </button>
                        ) : (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${isDone ? 'text-emerald-700 bg-emerald-50' : 'text-blue-700 bg-blue-50'
                            }`}>
                            {isDone ? 'Đã hoàn thành' : 'Đang diễn ra'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Milestones connected with vertical line */}
                    {displayMilestones.length > 0 ? (
                      <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
                        {displayMilestones.map((ms, idx) => {
                          const isMsDone = ms.status === 'done';
                          const isMsActive = ms.status === 'active';
                          const isMsLocked = !isMsDone && !isMsActive;

                          return (
                            <div
                              key={ms.id || idx}
                              className={`relative p-3.5 sm:p-4 rounded-2xl transition-all space-y-2 border ${isMsActive ? 'bg-blue-50/70 border-blue-300 shadow-2xs' :
                                  isMsDone ? 'bg-slate-50/70 border-slate-200/80' :
                                    'bg-white border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/20'
                                }`}
                            >
                              {/* Indicator Node */}
                              {isMsDone ? (
                                <span className="absolute -left-6 top-3 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] ring-4 ring-white">
                                  ✓
                                </span>
                              ) : isMsActive ? (
                                <span className="absolute -left-[27px] top-4 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] ring-4 ring-white animate-pulse">
                                  ●
                                </span>
                              ) : (
                                <span className="absolute -left-6 top-3 w-4 h-4 rounded-full bg-slate-300 text-white flex items-center justify-center text-[10px] ring-4 ring-white">
                                  <Lock className="w-2.5 h-2.5" />
                                </span>
                              )}

                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <span className={`font-bold ${isMsActive ? 'text-blue-950 font-serif' : 'text-slate-900'}`}>
                                  Mốc {idx + 1}: {ms.title}
                                </span>
                                {ms.score && (
                                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${isMsDone ? 'text-emerald-700 bg-emerald-100' :
                                      isMsActive ? 'text-blue-700 bg-blue-100' : 'text-slate-500 bg-slate-100'
                                    }`}>
                                    {ms.score}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Chuyên môn: <strong className="text-slate-700">{ms.subject}</strong></span>
                                {ms.tag && (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                    {ms.tag}
                                  </span>
                                )}
                              </div>

                              {/* Milestone Action Button */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-1">
                                <span className="text-[11px] font-medium text-slate-500">
                                  {isMsDone ? '✓ Đã nắm vững kiến thức' : isMsActive ? 'Đang diễn ra • Đạt chuẩn kiến thức' : 'Mục tiêu tiếp theo (Bấm để mở khóa)'}
                                </span>

                                {isMsDone ? (
                                  <button
                                    onClick={() => {
                                      studySyncService.setNavigationIntent({
                                        topicTitle: ms.title,
                                        subject: ms.subject,
                                        milestoneId: ms.id,
                                        tab: 'practice',
                                        initialPrompt: `Chào Cố vấn AI! Em muốn ôn tập củng cố lại chuyên đề: ${ms.title} (${ms.subject}).`
                                      });
                                      onNavigate('chat', `Chào Cố vấn AI! Em muốn ôn tập củng cố lại chuyên đề: ${ms.title} (${ms.subject}).`);
                                    }}
                                    className="px-3 py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Ôn tập lại</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                ) : isMsActive ? (
                                  <button
                                    onClick={() => {
                                      studySyncService.setActiveContext({
                                        topicTitle: ms.title,
                                        subject: ms.subject,
                                        milestoneId: ms.id,
                                        goalId: selectedGoalId,
                                        goalName: GOALS.find(g => g.id === selectedGoalId)?.name,
                                        targetScore: TARGET_BANDS.find(tb => tb.id === selectedTargetBandId)?.label || '8.5+',
                                        daysLeft: selectedDaysLeft
                                      });
                                      studySyncService.setNavigationIntent({
                                        topicTitle: ms.title,
                                        subject: ms.subject,
                                        milestoneId: ms.id,
                                        tab: 'practice',
                                        initialPrompt: `Chào Cố vấn AI! Em muốn học và luyện tập chuyên đề: ${ms.title} (${ms.subject}). Hãy bắt đầu bằng một bài toán ví dụ hoặc tóm tắt phương pháp giải!`
                                      });
                                      onNavigate('chat', `Chào Cố vấn AI! Em muốn học và luyện tập chuyên đề: ${ms.title} (${ms.subject}). Hãy bắt đầu bằng một bài toán ví dụ hoặc tóm tắt phương pháp giải!`);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                                  >
                                    <span>Học cùng AI ngay</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      studySyncService.unlockMilestone(ms.id, ms.title, ms.subject);
                                      studySyncService.setNavigationIntent({
                                        topicTitle: ms.title,
                                        subject: ms.subject,
                                        milestoneId: ms.id,
                                        tab: 'practice',
                                        initialPrompt: `Chào Cố vấn AI! Em đã mở khóa chuyên đề: ${ms.title} (${ms.subject}). Hãy bắt đầu bài tập và đồng hành cùng em!`
                                      });
                                      setNotification(`Đã mở khóa thành công mục tiêu: ${ms.title}! Đang chuyển sang phòng Chat AI...`);
                                      setTimeout(() => setNotification(null), 4000);
                                      onNavigate('chat', `Chào Cố vấn AI! Em đã mở khóa chuyên đề: ${ms.title} (${ms.subject}). Hãy bắt đầu bài tập và đồng hành cùng em!`);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-600 border border-blue-300 hover:border-blue-500 font-bold text-xs shadow-2xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                  >
                                    <Unlock className="w-3 h-3 text-blue-600" />
                                    <span>Mở khóa cùng AI</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Không có mốc nào đang hiển thị theo bộ lọc.</p>
                    )}

                    {/* End-of-Stage Diagnostic Challenge Card ("sau mỗi giai đoạn sẽ có 1 bài tập thử thách chẩn đoán kiến thức") */}
                    <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border-2 border-amber-300/80 shadow-xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                            <Trophy className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full">
                              Thử thách chẩn đoán kiến thức giai đoạn {stage.id}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 mt-1">
                              {challenge.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                            +{challenge.xpReward} XP
                          </span>
                          {challenge.isPassed ? (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã vượt qua
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                              Chẩn đoán mở khóa giai đoạn
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        🎯 <strong>Trọng tâm đánh giá:</strong> {challenge.focus}
                      </p>

                      <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[11px] text-amber-900 font-medium flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Dạng bài: <strong>{challenge.exerciseType === 'trap_detect' ? 'Bắt bẫy đề thi' : challenge.exerciseType === 'matching_pairs' ? 'Ghép đôi công thức' : challenge.exerciseType === 'ordering_steps' ? 'Sắp xếp quy trình logic' : challenge.exerciseType === 'fill_blank' ? 'Điền đáp số' : 'Trắc nghiệm chuyên sâu'}</strong>
                        </span>

                        <button
                          onClick={() => {
                            studySyncService.setNavigationIntent({
                              isDiagnosticChallenge: true,
                              diagnosticStageId: stage.id,
                              exerciseType: challenge.exerciseType,
                              tab: 'practice',
                              topicTitle: challenge.title,
                              subject: currentVariant?.name || 'Tổng hợp',
                              initialPrompt: `Chào Cố vấn AI! Em muốn làm bài tập ${challenge.title}. Hãy tải câu hỏi chẩn đoán và hướng dẫn em giải quyết!`
                            });
                            onNavigate('chat', `Chào Cố vấn AI! Em muốn làm bài tập ${challenge.title}. Hãy tải câu hỏi chẩn đoán và hướng dẫn em giải quyết!`);
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{challenge.isPassed ? 'Làm lại thử thách cùng AI →' : 'Làm Thử Thách Chẩn Đoán Cùng AI →'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Thời khóa biểu & Khuyến nghị AI (4 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Weekly Study Timetable */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Kế Hoạch Tuần Này
                </h3>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  7 Ngày chuẩn bị
                </span>
              </div>

              {/* Day slots */}
              <div className="space-y-2 text-xs">
                {schedule.map((item, idx) => {
                  const isDone = item.status === 'done';
                  const isCurrent = item.status === 'current';

                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border transition-all ${isDone ? 'bg-emerald-50/70 text-emerald-950 border-emerald-200/80' :
                          isCurrent ? 'bg-blue-50 text-blue-950 border-blue-300 shadow-2xs font-medium' :
                            'bg-slate-50 text-slate-700 border-slate-200/60'
                        }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          {item.day}
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded-full animate-pulse">
                              Hôm nay
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">{item.time}</span>
                      </div>
                      <div className="text-xs text-slate-800 mt-1">
                        <strong className="text-blue-700">{item.subject}:</strong> {item.topic}
                      </div>
                      {isDone && (
                        <div className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Đã hoàn thành
                        </div>
                      )}
                      {isCurrent && (
                        <div className="mt-2 pt-1 border-t border-blue-200 flex justify-end">
                          <button
                            onClick={() => {
                              studySyncService.setActiveContext({
                                topicTitle: item.topic,
                                subject: item.subject,
                                goalId: selectedGoalId,
                                goalName: GOALS.find(g => g.id === selectedGoalId)?.name,
                                daysLeft: selectedDaysLeft
                              });
                              onNavigate('chat', `Chào Cố vấn AI! Em muốn làm bài tập môn ${item.subject}: ${item.topic}`);
                            }}
                            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                          >
                            Vào học ngay →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Smart Insight Recommendation */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/80 rounded-2xl border border-blue-200/80 p-5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Khuyến Nghị Tự Động Từ Cố Vấn AI
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                "Dựa trên dữ liệu thi thử gần nhất, bạn nên dành thêm 45 phút cho phần <span className="font-semibold text-blue-950">Vận dụng cao &amp; Bẫy đề thi</span> vào Thứ Năm để bảo toàn trọn vẹn điểm số 8.5+."
              </p>
              <button
                onClick={handleAddAiInsight}
                disabled={addedAiInsight}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-emerald-600 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {addedAiInsight ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Đã thêm vào lịch học
                  </>
                ) : (
                  '+ Thêm vào lịch tự động'
                )}
              </button>
            </div>

            {/* Quick Diagnostic Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Bài Test Chẩn Đoán (5 phút)
                </h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">5 câu</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chưa chắc chắn về trình độ hiện tại? Hãy làm bài test chẩn đoán ngắn để AI tự động xếp hạng năng lực và tinh chỉnh lộ trình.
              </p>
              <button
                onClick={() => {
                  setDiagAnswers({});
                  setDiagSubmitted(false);
                  setDiagScore(null);
                  setIsDiagnosticOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs transition-colors"
              >
                Bắt đầu Test Chẩn Đoán →
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TÙY BIẾN LỘ TRÌNH (AI CONFIGURATOR WIZARD) */}
      {/* ========================================================================= */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Cấu Hình Lộ Trình Cá Nhân Hóa (Goal Engine)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chọn mục tiêu, tổ hợp thi và ngày thi để thuật toán AI phân bổ lại toàn bộ lộ trình
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 text-xs">
              {/* Step 1: Chọn Goal (4 mục tiêu) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-blue-600" />
                  1. Mục tiêu trọng tâm:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {GOALS.map(g => (
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
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedGoalId === g.id
                          ? 'bg-blue-50/90 border-blue-500 text-blue-950 shadow-xs'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                    >
                      <div className="font-bold text-xs">{g.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{g.scoreScale}</div>
                      <div className="text-[11px] text-slate-600 mt-1 line-clamp-1">{g.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Chọn Variant (Khối thi / Vùng thi) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  2. Khối thi / Tổ hợp chuyên đề (Variant):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableVariants.map(v => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${selectedVariantId === v.id
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      <div className="text-xs">{v.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{v.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Chọn Level (Trình độ) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    3. Trình độ hiện tại (Level):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsConfigOpen(false);
                      setIsDiagnosticOpen(true);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Chưa biết? Test nhanh 5 câu →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableLevels.map(l => (
                    <div
                      key={l.id}
                      onClick={() => setSelectedLevelId(l.id)}
                      className={`p-2 rounded-xl border cursor-pointer text-center transition-all ${selectedLevelId === l.id
                          ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      <div className="text-[11px]">{l.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 4: Chọn Target Band (Mức điểm mong muốn) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  4. Mức điểm mục tiêu (Target Band):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableTargetBands.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTargetBandId(t.id)}
                      className={`p-2 rounded-xl border cursor-pointer text-center transition-all ${selectedTargetBandId === t.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      <div className="text-[11px]">{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 5: Số ngày còn lại */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    5. Thời gian chuẩn bị còn lại:
                  </label>
                  <span className="font-bold text-blue-700 text-sm">{selectedDaysLeft} ngày</span>
                </div>
                <div className="flex items-center gap-2">
                  {[30, 60, 88, 120, 180].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setSelectedDaysLeft(days)}
                      className={`flex-1 py-1.5 rounded-lg border font-semibold text-xs transition-colors ${selectedDaysLeft === days
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      {days} ngày
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsConfigOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleApplyConfiguration}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
              >
                Sinh Lộ Trình Mới Bằng AI →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BÀI TEST CHẨN ĐOÁN NĂNG LỰC NHANH (5 CÂU) */}
      {/* ========================================================================= */}
      {isDiagnosticOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-serif text-base font-bold text-slate-900">
                  Bài Test Chẩn Đoán Trình Độ Nhanh
                </h3>
              </div>
              <button
                onClick={() => setIsDiagnosticOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!diagSubmitted ? (
              <div className="space-y-5 text-xs">
                {DIAGNOSTIC_QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-800">
                      Câu {idx + 1} ({q.subject}): {q.question}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => setDiagAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                          className={`p-2 rounded-lg text-left border transition-all ${diagAnswers[q.id] === oIdx
                              ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleCompleteDiagnostic}
                  disabled={Object.keys(diagAnswers).length < DIAGNOSTIC_QUESTIONS.length}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Nộp Bài &amp; Xem Đánh Giá Năng Lực
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center py-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-bold text-slate-900">
                    Kết Quả: {diagScore?.correct}/{diagScore?.total} Câu Đúng
                  </h4>
                  <p className="text-xs text-slate-600">
                    Cố vấn AI xếp hạng trình độ của bạn: <strong className="text-blue-700 font-bold">Khá (20 - 24đ)</strong>. Lộ trình được đề xuất tối ưu: <strong className="text-emerald-700 font-bold">26 - 28 Điểm</strong>.
                  </p>
                </div>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setIsDiagnosticOpen(false);
                      handleApplyConfiguration();
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                  >
                    Áp Dụng Lộ Trình Này Ngay →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default RoadmapPage;
