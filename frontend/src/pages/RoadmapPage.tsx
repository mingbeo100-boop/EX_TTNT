import React, { useState, useEffect } from 'react';
import { PageType } from '../types';
import { api } from '../services/api';
import { studySyncService } from '../services/studySyncService';
import { FormattedMessage } from '../components/FormattedMessage';
import {
  LearningNode,
  PRESET_CATALOG,
  ROADMAP_THPT_A00,
  generateAdaptiveRoadmap,
  PresetRoadmap
} from '../services/roadmapCatalog';
import {
  getAlternateQuestionsForStation,
  generateLiveStationQuestionsWithAi,
  distributeOptionsAndAnswers
} from '../services/stationQuestionBank';
import {
  Sparkles,
  Copy,
  CheckCircle2,
  Clock,
  Lock,
  Target,
  BookOpen,
  Check,
  Award,
  Zap,
  GraduationCap,
  X,
  ChevronRight,
  ArrowRight,
  Flame,
  Layers,
  HelpCircle,
  Trophy,
  Play,
  RotateCw,
  Atom,
  Languages,
  MapPin,
  Compass,
  CheckCheck,
  AlertTriangle,
  Lightbulb,
  FileText,
  ListChecks,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  PlusCircle
} from 'lucide-react';

interface RoadmapPageProps {
  onNavigate: (page: PageType, initialPrompt?: string) => void;
}

type StationTab = 'objectives' | 'theory' | 'examples' | 'practice' | 'mastery';

export const WEAKNESS_PRESETS_BY_GOAL: Record<string, { placeholder: string; weaknesses: string[] }> = {
  IELTS: {
    placeholder: 'Ví dụ: Speaking Fluency & PEEL, Writing Task 2 Cohesion, True/False/Not Given...',
    weaknesses: [
      'Speaking Fluency & Kỹ thuật PEEL',
      'Writing Task 2 Cohesion & Paraphrasing',
      'Bẫy True/False/Not Given & Yes/No/Not Given',
      'Listening Distractors Part 3-4',
      'Academic Collocations C1/C2',
      'Matching Headings Passage 2-3',
      'Writing Task 1 Phân tích Biểu đồ',
      'Pronunciation & Ngữ điệu tự nhiên',
      'Ngữ pháp Band 8.0+ Mệnh đề Phức'
    ]
  },
  SAT: {
    placeholder: 'Ví dụ: Craft & Structure, Advanced Math, Desmos Tricks...',
    weaknesses: [
      'Craft & Structure (Từ vựng Ngữ cảnh)',
      'Information & Ideas (Command of Evidence)',
      'Standard English Conventions (Ngữ pháp)',
      'Expression of Ideas (Rhetorical Synthesis)',
      'Advanced Math (Phương trình Phi tuyến)',
      'Desmos Calculator Hacks & Dò nghiệm',
      'Geometry & Trigonometry SAT'
    ]
  },
  TOEIC: {
    placeholder: 'Ví dụ: Part 2 Bẫy Gián tiếp, Part 5 Bẫy Từ loại, Part 7 Đoạn kép...',
    weaknesses: [
      'Part 2 Bẫy Gián tiếp & Trả lời né',
      'Part 3-4 Bẫy Distractor đổi ý',
      'Part 5 Bẫy Từ loại & Thì động từ',
      'Part 6 Điền đoạn văn & Liên từ',
      'Part 7 Đọc hiểu Đoạn văn kép đa nguồn',
      'Từ vựng Kinh tế & Hợp đồng Thương mại'
    ]
  },
  DGNL_DHQG: {
    placeholder: 'Ví dụ: Tư duy Định lượng, Đọc hiểu Khoa học, Phân tích biểu đồ...',
    weaknesses: [
      'Tư duy Định lượng & Bài toán thực tế',
      'Đọc hiểu Ngôn ngữ & Văn bản phức tạp',
      'Phân tích Số liệu & Biểu đồ Khoa học',
      'Logic Suy luận & Điền khuyết dữ liệu',
      'Tư duy KHTN & Xã hội liên môn'
    ]
  },
  TSA_HUST: {
    placeholder: 'Ví dụ: Tư duy Toán học TSA, Đọc hiểu Khoa học, Logic hình thức...',
    weaknesses: [
      'Tư duy Toán học TSA & Mô hình hóa',
      'Tư duy Đọc hiểu Văn bản Khoa học - Kỹ thuật',
      'Tư duy Khoa học / Giải quyết vấn đề',
      'Bài toán Logic hình thức & Suy luận',
      'Phân tích Dữ liệu Thực nghiệm Đa biến'
    ]
  },
  THPT_QG: {
    placeholder: 'Ví dụ: Tích phân hàm ẩn, Sóng ánh sáng, Mạch RLC cực trị...',
    weaknesses: [
      'Tích phân hàm ẩn & Vi phân đổi biến',
      'Sóng ánh sáng & Giao thoa đa sắc',
      'Mạch RLC cực trị & Đồ thị dao động',
      'Este - Lipit & Peptit bẫy vận dụng cao',
      'Di truyền phả hệ & Quần thể tiến hóa',
      'Hình học không gian & Tọa độ Oxyz 9+',
      'Bẫy Đúng/Sai 4 ý format 2025',
      'Casio Table Menu 8 dò nghiệm nguyên'
    ]
  },
  CHUYEN_HSG: {
    placeholder: 'Ví dụ: Bất đẳng thức Cauchy-Schwarz, Tổ hợp rời rạc, Số học...',
    weaknesses: [
      'Bất đẳng thức đại số Cauchy-Schwarz',
      'Tổ hợp rời rạc & Nguyên lý Dirichlet',
      'Số học & Phương trình nghiệm nguyên',
      'Hình học phẳng Định lý Menelaus & Ceva'
    ]
  },
  DAI_HOC_GPA: {
    placeholder: 'Ví dụ: DSA nâng cao, Kiến trúc Hệ thống, Tối ưu Database...',
    weaknesses: [
      'Cấu trúc Dữ liệu & Giải thuật nâng cao',
      'Kiến trúc Hệ thống & Microservices',
      'Tối ưu hóa Database Query & Indexing',
      'Lập trình Bất đồng bộ Async & Concurrency',
      'Xây dựng RESTful API chuẩn chuẩn hóa',
      'Clean Architecture & Design Patterns'
    ]
  },
  LAY_GOC: {
    placeholder: 'Ví dụ: Công thức SGK cốt lõi, Casio cơ bản, 35 câu đầu...',
    weaknesses: [
      'Lấy lại gốc Khái niệm & Công thức SGK',
      'Phương pháp bấm máy Casio cơ bản',
      'Nhận diện 35 câu dễ đầu tiên',
      'Kỹ năng vẽ hình và tóm tắt đề toán',
      'Tránh bẫy điều kiện xác định & Nghiệm'
    ]
  }
};

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ onNavigate }) => {
  const user = api.getUser();
  const storageKey = `eduadvisor_${user?.id || 'guest'}_interactive_roadmap_nodes_v5`;
  const presetStorageKey = `eduadvisor_${user?.id || 'guest'}_active_preset_key_v5`;
  const customMetaKey = `eduadvisor_${user?.id || 'guest'}_custom_roadmap_meta_v5`;

  const [selectedPresetKey, setSelectedPresetKey] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(presetStorageKey);
      if (saved && PRESET_CATALOG[saved]) return saved;
    } catch {}
    return 'thpt_a00';
  });

  // Metadata của Lộ trình được AI sinh riêng
  const [customMeta, setCustomMeta] = useState<{
    name: string;
    description: string;
    score: string;
    days: number;
    dailyHours: number;
    coachAdvice: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem(customMetaKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [nodes, setNodes] = useState<LearningNode[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ROADMAP_THPT_A00;
  });

  // Modal State
  const [activeNode, setActiveNode] = useState<LearningNode | null>(null);
  const [activeTab, setActiveTab] = useState<StationTab>('objectives');

  // Interactive Practice State (Nhiều câu hỏi, nhớ lịch sử từng câu)
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<(number | null)[]>([]);
  const [practiceChecked, setPracticeChecked] = useState<boolean[]>([]);
  const [revealedHintsCount, setRevealedHintsCount] = useState(0);

  // Mastery Test State (Nhiều câu hỏi, nhớ lịch sử từng câu)
  const [masteryIndex, setMasteryIndex] = useState(0);
  const [masteryAnswers, setMasteryAnswers] = useState<(number | null)[]>([]);
  const [masteryChecked, setMasteryChecked] = useState<boolean[]>([]);
  const [masteryCorrectCount, setMasteryCorrectCount] = useState(0);
  const [masteryFinished, setMasteryFinished] = useState(false);

  // Dynamic Question Swapping & Visual Polish State
  const [questionSetIndex, setQuestionSetIndex] = useState(0);
  const [isSwappingQuestions, setIsSwappingQuestions] = useState(false);
  const [copiedFormulaIdx, setCopiedFormulaIdx] = useState<number | null>(null);
  const [currentQuestionSetName, setCurrentQuestionSetName] = useState('Bộ Đề Chuẩn Hóa 01');

  // Generator & UI State
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'path' | 'stages'>('path');

  // Generator Form Inputs (Chi tiết chuyên sâu theo yêu cầu Sư phạm)
  const [genGoal, setGenGoal] = useState('THPT_QG');
  const [genTargetSchool, setGenTargetSchool] = useState('ĐH Bách Khoa (CNTT - Khoa học Máy tính)');
  const [genSubject, setGenSubject] = useState('Khối A00 (Toán - Lý - Hóa)');
  const [genTargetScore, setGenTargetScore] = useState('28.5+');
  const [genCurrentLevel, setGenCurrentLevel] = useState('Khá (6.5 - 8.0đ)');
  const [genDays, setGenDays] = useState(88);
  const [genDailyHours, setGenDailyHours] = useState(2.5);
  const [genWeaknesses, setGenWeaknesses] = useState('Tích phân hàm ẩn, Sóng ánh sáng');
  const [genStrategy, setGenStrategy] = useState('Thực chiến luyện đề & Săn bẫy điểm cao');
  const [genStationCount, setGenStationCount] = useState<number>(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStepText, setGenStepText] = useState('');
  const [feasibilityAlert, setFeasibilityAlert] = useState<string | null>(null);

  // Active Preset Object & Dữ liệu Lộ trình thực tế
  const currentPreset: PresetRoadmap = PRESET_CATALOG[selectedPresetKey] || PRESET_CATALOG.thpt_a00;
  const activeRoadmapTitle = customMeta?.name || currentPreset.name;
  const activeRoadmapDescription = customMeta?.description || currentPreset.description;
  const activeRoadmapScore = customMeta?.score || currentPreset.score;
  const activeRoadmapDays = customMeta?.days ?? currentPreset.days;
  const activeRoadmapDailyHours = customMeta?.dailyHours ?? currentPreset.dailyHours;
  const activeRoadmapCoachAdvice = customMeta?.coachAdvice || currentPreset.coachAdvice;

  // Lưu nodes vào localStorage
  const saveNodes = (updatedNodes: LearningNode[]) => {
    setNodes(updatedNodes);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedNodes));
    } catch {}
    window.dispatchEvent(new CustomEvent('eduadvisor_roadmap_updated'));
  };

  const completedCount = nodes.filter(n => n.status === 'completed').length;
  const progressPercent = Math.round((completedCount / nodes.length) * 100);
  const totalXp = nodes.filter(n => n.status === 'completed').reduce((sum, n) => sum + n.xp, 0);

  // Tính Target Readiness Score
  const readinessScore = Math.min(
    100,
    Math.round(currentPreset.readinessInitial + (completedCount / nodes.length) * (100 - currentPreset.readinessInitial))
  );

  // Tìm trạm đang học hiện tại
  const currentActiveNode = nodes.find(n => n.status === 'active') || nodes[0];

  // Chuyển đổi Preset
  const handleSelectPreset = (presetKey: string) => {
    setSelectedPresetKey(presetKey);
    try {
      localStorage.setItem(presetStorageKey, presetKey);
    } catch {}
    const targetPreset = PRESET_CATALOG[presetKey] || PRESET_CATALOG.thpt_a00;
    const freshNodes = targetPreset.nodes.map((n, idx) => ({
      ...n,
      status: idx === 0 ? ('active' as const) : ('locked' as const)
    }));
    saveNodes(freshNodes);
    showToast(`🎯 Đã chuyển sang lộ trình: "${targetPreset.name}"`);
  };

  // Mở trạm học
  const handleOpenNode = (node: LearningNode) => {
    if (node.status === 'locked') {
      showToast('🔒 Hãy hoàn thành các trạm trước để mở khóa trạm này!');
      return;
    }

    // Đảm bảo trạm mở ra luôn có ít nhất 3 câu thực hành và ít nhất 5 câu kiểm tra cuối trạm (Mastery Test)
    let safeNode = { ...node };
    if (!safeNode.masteryTest || safeNode.masteryTest.length < 5 || !safeNode.practiceQuestions || safeNode.practiceQuestions.length < 3) {
      const alt = getAlternateQuestionsForStation(safeNode, 0);
      if (!safeNode.practiceQuestions || safeNode.practiceQuestions.length < 3) {
        safeNode.practiceQuestions = alt.practiceQuestions;
      }
      if (!safeNode.masteryTest || safeNode.masteryTest.length < 5) {
        safeNode.masteryTest = alt.masteryTest;
      }
    }
    safeNode.practiceQuestions = distributeOptionsAndAnswers(safeNode.practiceQuestions);
    safeNode.masteryTest = distributeOptionsAndAnswers(safeNode.masteryTest);

    setActiveNode(safeNode);
    setActiveTab('objectives');
    setQuestionSetIndex(0);
    setCurrentQuestionSetName('Bộ Đề Chuẩn Hóa 01');
    setIsSwappingQuestions(false);
    setCopiedFormulaIdx(null);

    // Reset practice
    setPracticeIndex(0);
    setPracticeAnswers(new Array(safeNode.practiceQuestions.length).fill(null));
    setPracticeChecked(new Array(safeNode.practiceQuestions.length).fill(false));
    setRevealedHintsCount(0);

    // Reset mastery
    setMasteryIndex(0);
    setMasteryAnswers(new Array(safeNode.masteryTest.length).fill(null));
    setMasteryChecked(new Array(safeNode.masteryTest.length).fill(false));
    setMasteryCorrectCount(0);
    setMasteryFinished(false);
  };

  // Xử lý chọn & kiểm tra bài thực hành
  const handleSelectPracticeOption = (idx: number) => {
    if (practiceChecked[practiceIndex]) return;
    const updated = [...practiceAnswers];
    updated[practiceIndex] = idx;
    setPracticeAnswers(updated);
  };

  const handleCheckPractice = () => {
    if (!activeNode || practiceAnswers[practiceIndex] === null) return;
    const updated = [...practiceChecked];
    updated[practiceIndex] = true;
    setPracticeChecked(updated);
  };

  const handleNextPractice = () => {
    if (!activeNode) return;
    if (practiceIndex < activeNode.practiceQuestions.length - 1) {
      setPracticeIndex(prev => prev + 1);
      setRevealedHintsCount(0);
    } else {
      // Chuyển sang Tab Kiểm tra trạm
      setActiveTab('mastery');
    }
  };

  const handleJumpToPracticeQuestion = (idx: number) => {
    setPracticeIndex(idx);
    setRevealedHintsCount(0);
  };

  // Xử lý chọn & kiểm tra bài Mastery Test
  const handleSelectMasteryOption = (idx: number) => {
    if (masteryChecked[masteryIndex]) return;
    const updated = [...masteryAnswers];
    updated[masteryIndex] = idx;
    setMasteryAnswers(updated);
  };

  const handleCheckMastery = () => {
    if (!activeNode || masteryAnswers[masteryIndex] === null) return;
    const curQ = activeNode.masteryTest[masteryIndex];
    const isCorrect = masteryAnswers[masteryIndex] === curQ.correctAnswer;
    
    const updated = [...masteryChecked];
    updated[masteryIndex] = true;
    setMasteryChecked(updated);

    if (isCorrect) {
      setMasteryCorrectCount(prev => prev + 1);
    }
  };

  const handleNextMastery = () => {
    if (!activeNode) return;
    if (masteryIndex < activeNode.masteryTest.length - 1) {
      setMasteryIndex(prev => prev + 1);
    } else {
      // Kết thúc bài kiểm tra trạm
      setMasteryFinished(true);
      const totalTest = activeNode.masteryTest.length;
      const correctCount = activeNode.masteryTest.reduce((cnt, q, idx) => {
        return cnt + (masteryAnswers[idx] === q.correctAnswer ? 1 : 0);
      }, 0);
      setMasteryCorrectCount(correctCount);

      const finalScorePercent = Math.round((correctCount / totalTest) * 100);

      // Điều kiện hoàn thành trạm: Đạt >= 50%
      if (finalScorePercent >= 50) {
        const updated = nodes.map((n, idx) => {
          if (n.id === activeNode.id) {
            return { ...n, status: 'completed' as const };
          }
          if (idx > 0 && nodes[idx - 1].id === activeNode.id && n.status === 'locked') {
            return { ...n, status: 'active' as const };
          }
          return n;
        });
        saveNodes(updated);
        showToast(`🎉 Xuất sắc! Bạn đã vượt qua Trạm 0${activeNode.stationNumber} (+${activeNode.xp} XP)`);

        // Cập nhật profile người dùng
        const u = api.getUser();
        if (u) {
          if (!u.profile) {
            u.profile = {
              id: u.id,
              email: u.email,
              full_name: u.full_name || 'Học viên',
              school: 'THPT',
              target_exam: 'THPT_QG',
              target_score: currentPreset.score,
              current_level: 'Khá',
              focus_subjects: ['Toán học', 'Vật lý'],
              learning_needs: [],
              streak_days: 1,
              avg_score: 8.5,
              study_hours: 1.0,
              solved_problems: 1
            };
          }
          u.profile.solved_problems = (u.profile.solved_problems || 0) + totalTest;
          u.profile.study_hours = +(Number(u.profile.study_hours || 0) + 0.5).toFixed(1);
          api.setUser(u);
        }
      }
    }
  };

  const handleJumpToMasteryQuestion = (idx: number) => {
    setMasteryIndex(idx);
  };

  // AI tự thay đổi nhiều câu hỏi khác nhau (Thực hành + Kiểm tra)
  const handleSwapQuestions = async () => {
    if (!activeNode || isSwappingQuestions) return;
    setIsSwappingQuestions(true);
    showToast(`✨ Gemini AI đang phân tích bài học & thiết kế bộ 5+ câu hỏi độc bản cho Trạm 0${activeNode.stationNumber}...`);
    try {
      const nextSetIndex = questionSetIndex + 1;
      let newQuestions = await generateLiveStationQuestionsWithAi(activeNode, activeNode.difficulty);
      let isAiGenerated = true;
      if (!newQuestions || newQuestions.masteryTest.length < 5) {
        newQuestions = getAlternateQuestionsForStation(activeNode, nextSetIndex);
        isAiGenerated = false;
      }

      // Đảm bảo đáp án đúng luôn được phân bổ đa dạng (A, B, C, D)
      const distributedPractice = distributeOptionsAndAnswers(newQuestions.practiceQuestions);
      const distributedMastery = distributeOptionsAndAnswers(newQuestions.masteryTest);

      const updatedNode: LearningNode = {
        ...activeNode,
        practiceQuestions: distributedPractice,
        masteryTest: distributedMastery
      };

      setActiveNode(updatedNode);
      setQuestionSetIndex(nextSetIndex);
      setCurrentQuestionSetName(isAiGenerated ? `Bộ Đề Gemini Live #${nextSetIndex + 1}` : `Bộ Đề Thích Ứng #${nextSetIndex + 1}`);

      // Đồng bộ vào danh sách nodes & lưu trữ để không bị mất câu hỏi mới sinh
      const updatedNodes = nodes.map(n => n.id === updatedNode.id ? updatedNode : n);
      saveNodes(updatedNodes);

      // Reset practice
      setPracticeIndex(0);
      setPracticeAnswers(new Array(distributedPractice.length).fill(null));
      setPracticeChecked(new Array(distributedPractice.length).fill(false));
      setRevealedHintsCount(0);

      // Reset mastery
      setMasteryIndex(0);
      setMasteryAnswers(new Array(distributedMastery.length).fill(null));
      setMasteryChecked(new Array(distributedMastery.length).fill(false));
      setMasteryCorrectCount(0);
      setMasteryFinished(false);

      showToast(`🎯 Gemini đã sinh thành công ${distributedPractice.length} câu thực hành & ${distributedMastery.length} câu kiểm tra chuẩn đầu ra!`);
    } catch (err) {
      console.error(err);
      showToast('Đã có lỗi khi đổi bộ câu hỏi.');
    } finally {
      setIsSwappingQuestions(false);
    }
  };

  // Sao chép công thức nhanh
  const handleCopyFormula = (formula: string, idx: number) => {
    try {
      navigator.clipboard.writeText(formula);
      setCopiedFormulaIdx(idx);
      setTimeout(() => setCopiedFormulaIdx(null), 2200);
      showToast('📋 Đã sao chép công thức vào clipboard!');
    } catch {
      showToast('Không thể sao chép công thức.');
    }
  };

  // Thêm trạm củng cố bổ trợ khi làm bài yếu
  const handleAddRemedialStation = () => {
    if (!activeNode) return;
    const boosterNode: LearningNode = {
      id: `booster_${Date.now()}`,
      stationNumber: activeNode.stationNumber,
      stageId: activeNode.stageId,
      stageName: activeNode.stageName,
      stageFocus: 'Trạm Củng Cố Bổ Trợ Đặc Biệt',
      title: `Củng Cố Cốt Lõi: ${activeNode.title}`,
      subject: activeNode.subject,
      difficulty: 'Nền tảng',
      summary: `Trạm bổ trợ chuyên sâu giúp bạn vá dứt điểm lỗ hổng về ${activeNode.outcomes.keyConcept} trước khi bước tiếp.`,
      keyFormula: activeNode.keyFormula,
      status: 'active',
      xp: 30,
      estimatedMinutes: 10,
      scoreContribution: '+0.3 Điểm Củng Cố',
      isRemedial: true,
      outcomes: {
        ...activeNode.outcomes,
        whyThisStation: 'Được AI tự động đề xuất dựa trên kết quả kiểm tra chưa đạt của bạn ở trạm trước.'
      },
      theory: activeNode.theory,
      workedExamples: activeNode.workedExamples,
      practiceQuestions: activeNode.practiceQuestions,
      masteryTest: activeNode.masteryTest
    };

    const nodeIdx = nodes.findIndex(n => n.id === activeNode.id);
    const newNodes = [...nodes];
    newNodes.splice(nodeIdx + 1, 0, boosterNode);
    // Renumber
    const renumbered = newNodes.map((n, idx) => ({ ...n, stationNumber: idx + 1 }));
    saveNodes(renumbered);
    setActiveNode(null);
    showToast('✨ Đã chèn thêm Trạm Củng Cố Bổ Trợ vào lộ trình của bạn!');
  };

  // Nhờ EduAdvisor AI giải thích sâu thêm về trạm
  const handleAskEduAdvisorAboutStation = (node: LearningNode, specificQuestion?: string) => {
    const prompt = specificQuestion || 
      `Chào EduAdvisor AI! Mình đang học Trạm ${node.stationNumber}: "${node.title}" môn ${node.subject} trong lộ trình "${currentPreset.name}".
Trọng tâm bài: ${node.outcomes.keyConcept}.
EduAdvisor AI giúp mình giải thích bản chất sâu hơn, phân tích các bẫy thường gặp và đưa ra mẹo giải nhanh câu hỏi này nhé!`;

    studySyncService.setNavigationIntent({
      topicTitle: node.title,
      subject: node.subject,
      initialPrompt: prompt
    });
    onNavigate('chat', prompt);
  };

  // Chọn nhanh mẫu lộ trình phổ biến (1-Click Fill giúp tăng tốc độ thiết kế)
  // Chọn nhanh mẫu lộ trình phổ biến (1-Click Fill giúp tăng tốc độ thiết kế)
  const applyQuickPreset = (type: string) => {
    if (type === 'HUST_A00') {
      setGenGoal('THPT_QG');
      setGenSubject('Khối A00 (Toán - Lý - Hóa)');
      setGenTargetSchool('ĐH Bách Khoa (CNTT - Khoa học Máy tính)');
      setGenCurrentLevel('Khá (6.5 - 8.0đ)');
      setGenTargetScore('28.5+');
      setGenDays(88);
      setGenDailyHours(2.5);
      setGenWeaknesses('Tích phân hàm ẩn, Sóng ánh sáng');
      setGenStrategy('Nước rút cấp tốc & Tối ưu thời gian làm bài');
      setGenStationCount(7);
    } else if (type === 'FTU_A01') {
      setGenGoal('THPT_QG');
      setGenSubject('Khối A01 (Toán - Lý - Anh)');
      setGenTargetSchool('ĐH Ngoại Thương (Kinh tế Đối ngoại)');
      setGenCurrentLevel('Khá giỏi (7.5 - 8.5đ)');
      setGenTargetScore('28.0+');
      setGenDays(75);
      setGenDailyHours(2.5);
      setGenWeaknesses('Tích phân hàm ẩn, Reading Passage 3 phân loại');
      setGenStrategy('Nước rút cấp tốc & Tối ưu thời gian làm bài');
      setGenStationCount(7);
    } else if (type === 'NEU_D01') {
      setGenGoal('THPT_QG');
      setGenSubject('Khối D01 (Toán - Văn - Anh)');
      setGenTargetSchool('ĐH Kinh Tế Quốc Dân (Tài chính - Marketing)');
      setGenCurrentLevel('Khá (6.5 - 8.0đ)');
      setGenTargetScore('27.5+');
      setGenDays(80);
      setGenDailyHours(2.5);
      setGenWeaknesses('Hình học không gian Oxyz, Đoạn văn nghị luận xã hội');
      setGenStrategy('Thực chiến luyện đề & Săn bẫy điểm cao');
      setGenStationCount(7);
    } else if (type === 'DGNL_TOP') {
      setGenGoal('DGNL_DHQG');
      setGenSubject('ĐGNL ĐHQG (Định lượng + Ngôn ngữ + Khoa học)');
      setGenTargetSchool('ĐH Quốc Gia TP.HCM / Hà Nội');
      setGenCurrentLevel('Khá (6.5 - 8.0đ)');
      setGenTargetScore('950+ / 1200');
      setGenDays(60);
      setGenDailyHours(2.0);
      setGenWeaknesses('Tư duy Định lượng, Đọc hiểu khoa học & Phân tích biểu đồ');
      setGenStrategy('Thực chiến luyện đề & Săn bẫy điểm cao');
      setGenStationCount(7);
    } else if (type === 'IELTS_75') {
      setGenGoal('IELTS');
      setGenSubject('IELTS Academic (Speaking, Writing, Reading, Listening)');
      setGenTargetSchool('Du học / Xét tuyển Đại học Top 1');
      setGenCurrentLevel('Khá (6.5 - 8.0đ)');
      setGenTargetScore('Band 7.5+');
      setGenDays(45);
      setGenDailyHours(2.0);
      setGenWeaknesses('Speaking Fluency & Kỹ thuật PEEL, Writing Task 2 Cohesion');
      setGenStrategy('Đột phá Vận dụng cao 9+ & Câu phân loại điểm 10');
      setGenStationCount(7);
    } else if (type === 'Y_DUOC_B00') {
      setGenGoal('THPT_QG');
      setGenSubject('Khối B00 (Toán - Hóa - Sinh)');
      setGenTargetSchool('ĐH Y Hà Nội / ĐH Y Dược TP.HCM');
      setGenCurrentLevel('Giỏi (8.0 - 9.0đ)');
      setGenTargetScore('28.0+');
      setGenDays(90);
      setGenDailyHours(3.0);
      setGenWeaknesses('Di truyền học quần thể, Hóa hữu cơ Este');
      setGenStrategy('Đột phá Vận dụng cao 9+ & Câu phân loại điểm 10');
      setGenStationCount(7);
    } else if (type === 'CHUYEN_TIN') {
      setGenGoal('CHUYEN_HSG');
      setGenSubject('Chuyên Tin & Thuật Toán C++/Python');
      setGenTargetSchool('Trường Chuyên KHTN / ĐH Sư Phạm');
      setGenCurrentLevel('Giỏi (8.0 - 9.0đ)');
      setGenTargetScore('Giải Nhất Tỉnh / VNOI 1800+');
      setGenDays(90);
      setGenDailyHours(3.5);
      setGenWeaknesses('Quy hoạch động trên cây, Đồ thị luồng cực đại');
      setGenStrategy('Đột phá Vận dụng cao 9+ & Câu phân loại điểm 10');
      setGenStationCount(10);
    } else if (type === 'SAT_1500') {
      setGenGoal('SAT');
      setGenSubject('Digital SAT (Math & Reading-Writing)');
      setGenTargetSchool('Học bổng Du học Mỹ / RMIT Top Tier');
      setGenCurrentLevel('Khá giỏi (7.5 - 8.5đ)');
      setGenTargetScore('1500+ / 1600');
      setGenDays(60);
      setGenDailyHours(2.5);
      setGenWeaknesses('Advanced Math Functions, Rhetorical Synthesis & Vocabulary in Context');
      setGenStrategy('Thực chiến luyện đề & Săn bẫy điểm cao');
      setGenStationCount(7);
    } else if (type === 'TOEIC_850') {
      setGenGoal('TOEIC');
      setGenSubject('TOEIC 4 Kỹ Năng (Listening, Reading, Speaking, Writing)');
      setGenTargetSchool('Chuẩn đầu ra Quốc tế & Doanh nghiệp Đa Quốc Gia');
      setGenCurrentLevel('Khá (6.5 - 8.0đ)');
      setGenTargetScore('850+ / 990');
      setGenDays(40);
      setGenDailyHours(2.0);
      setGenWeaknesses('Listening Part 3 & 4 Bẫy Distractor, Reading Part 7 Đoạn kép');
      setGenStrategy('Nước rút cấp tốc & Tối ưu thời gian làm bài');
      setGenStationCount(5);
    } else if (type === 'LAY_GOC_30') {
      setGenGoal('LAY_GOC');
      setGenSubject('Khôi Phục Nền Tảng Cốt Lõi Cấp Tốc');
      setGenTargetSchool('Đại Học Công Lập');
      setGenCurrentLevel('Trung bình (5.0 - 6.5đ)');
      setGenTargetScore('8.0+');
      setGenDays(30);
      setGenDailyHours(3.0);
      setGenWeaknesses('Công thức SGK cơ bản & Kỹ thuật bấm máy Casio');
      setGenStrategy('Chắc lý thuyết từ gốc & Trị dứt điểm ngộ nhận');
      setGenStationCount(5);
    }
    showToast('⚡ Đã nạp mẫu thiết kế nhanh! Sẵn sàng khởi tạo lộ trình siêu tốc.');
  };

  // AI Vẽ Lộ Trình Mới Siêu Tốc (AI Turbo Design Pipeline)
  const handleGenerateCustomRoadmap = async () => {
    setIsGenerating(true);
    setGenProgress(25);
    setGenStepText(`⚡ Bước 1: Quét ma trận kiến thức & mã hóa 2 lỗ hổng "${genWeaknesses || 'Trọng tâm'}"...`);
    setFeasibilityAlert(null);

    try {
      // Khởi tạo tiến trình tính toán song song
      const genPromise = generateAdaptiveRoadmap({
        goal: genGoal,
        targetExamName: 
          genGoal === 'THPT_QG' ? 'THPT Quốc Gia 2025' :
          genGoal === 'DGNL_DHQG' ? 'ĐGNL ĐHQG (HSA & VNUHCM)' :
          genGoal === 'TSA_HUST' ? 'Đánh Giá Tư Duy ĐH Bách Khoa (TSA)' :
          genGoal === 'IELTS' ? 'IELTS Academic 4 Kỹ Năng' :
          genGoal === 'SAT' ? 'Digital SAT (Math & Reading-Writing)' :
          genGoal === 'TOEIC' ? 'TOEIC 4 Kỹ Năng' :
          genGoal === 'DAI_HOC_GPA' ? 'Đại Học GPA A & CNTT' :
          genGoal === 'CHUYEN_HSG' ? 'Bồi Dưỡng Học Sinh Giỏi & Thi Chuyên' :
          'Lấy Gốc Cấp Tốc Bứt Phá',
        targetSchool: genTargetSchool,
        subjectCombo: genSubject,
        targetScore: genTargetScore,
        currentLevel: genCurrentLevel,
        daysLeft: genDays,
        dailyHours: genDailyHours,
        weakTopics: genWeaknesses,
        learningStrategy: genStrategy,
        numStations: genStationCount
      });

      // Hiệu ứng tăng tốc bước 2
      await new Promise(r => setTimeout(r, 220));
      setGenProgress(70);
      setGenStepText(`🎯 Bước 2: Phân bổ ${genStationCount} trạm học thích ứng theo mục tiêu ${genTargetScore} ${genTargetSchool ? '• ' + genTargetSchool : ''}...`);

      const result = await genPromise;

      // Hiệu ứng hoàn tất bước 3
      await new Promise(r => setTimeout(r, 200));
      setGenProgress(100);
      setGenStepText(`✨ Bước 3: Tối ưu bộ câu hỏi Socratic & hoàn tất lộ trình!`);

      await new Promise(r => setTimeout(r, 220));

      const newMeta = {
        name: result.roadmapName,
        description: result.roadmapDescription,
        score: result.score,
        days: result.days,
        dailyHours: result.dailyHours,
        coachAdvice: result.coachAdvice
      };

      setCustomMeta(newMeta);
      try {
        localStorage.setItem(customMetaKey, JSON.stringify(newMeta));
      } catch {}

      saveNodes(result.nodes);

      // Cập nhật profile người dùng đồng bộ
      const u = api.getUser();
      if (u) {
        if (!u.profile) {
          u.profile = {
            id: u.id,
            email: u.email,
            full_name: u.full_name || 'Học viên',
            school: genTargetSchool || 'THPT',
            target_exam: genGoal,
            target_score: genTargetScore,
            current_level: genCurrentLevel,
            focus_subjects: [genSubject],
            learning_needs: [genWeaknesses, genStrategy],
            streak_days: 14,
            avg_score: 8.8,
            study_hours: 28.5,
            solved_problems: 342
          };
        } else {
          u.profile.target_score = genTargetScore;
          u.profile.current_level = genCurrentLevel;
          if (genTargetSchool) u.profile.school = genTargetSchool;
          u.profile.focus_subjects = [genSubject];
        }
        api.setUser(u);
      }

      if (result.feasibilityWarning) {
        setFeasibilityAlert(result.feasibilityWarning);
      }
      setIsGenerating(false);
      setShowGeneratorModal(false);
      showToast(`⚡ SIÊU TỐC: EduAdvisor AI đã tạo xong lộ trình "${result.roadmapName}" với ${result.nodes.length} trạm học thích ứng!`);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      setShowGeneratorModal(false);
      showToast('Đã có lỗi khi thiết kế lộ trình.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="flex-1 bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-4 duration-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* 1. HERO BANNER: THIẾT KẾ ĐỘNG LỰC & CHẤT LƯỢNG SƯ PHẠM       */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/15 relative overflow-hidden border border-blue-800/40">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-3.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Hệ Thống Lộ Trình Sư Phạm Thích Ứng • EduAdvisor AI</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
                {activeRoadmapTitle}
              </h1>

              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                {activeRoadmapDescription}
              </p>

              {/* Thước Đo Độ Sẵn Sàng Mục Tiêu (Target Readiness) & XP */}
              <div className="pt-2 space-y-2.5 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex flex-wrap items-center justify-between text-xs font-bold gap-2">
                  <span className="flex items-center gap-1.5 text-blue-200">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>Độ sẵn sàng đạt mục tiêu: <span className="text-white font-extrabold text-sm">{readinessScore}%</span> ({completedCount}/{nodes.length} Trạm)</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>Dự báo: {activeRoadmapScore}</span>
                    </span>
                    <span className="text-amber-400 font-extrabold">+{totalXp} XP</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Các nút hành động chính */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => setShowGeneratorModal(true)}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-white"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Thiết Kế Lộ Trình Mới</span>
              </button>

              <button
                onClick={() => handleOpenNode(currentActiveNode)}
                className="px-5 py-2.5 rounded-2xl bg-blue-600/90 hover:bg-blue-600 text-white font-semibold text-xs border border-blue-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Vào Trạm Tiếp Theo (Trạm 0{currentActiveNode.stationNumber})</span>
              </button>
            </div>

          </div>
        </div>


        {/* Toggle View Mode */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Lộ trình học tập cá nhân hóa chuẩn sư phạm</span>
          </div>

          <div className="inline-flex rounded-xl bg-slate-200/70 p-1 shrink-0 text-xs font-bold">
            <button
              onClick={() => setViewMode('path')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'path'
                  ? 'bg-white text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bản Đồ Hành Trình
            </button>
            <button
              onClick={() => setViewMode('stages')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'stages'
                  ? 'bg-white text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Theo Chặng (5 Giai đoạn)
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. VISUAL JOURNEY TIMELINE: BẢN ĐỒ HÀNH TRÌNH TỪNG TRẠM       */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative">
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <span>Hành Trình Từng Trạm Học Tập</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mỗi trạm tích hợp đầy đủ Mục tiêu, Lý thuyết chuyên sâu, Ví dụ giải mẫu và Bài kiểm tra trạm đạt chuẩn.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Đã đạt</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span>Đang học</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Chưa mở</span>
              </span>
            </div>
          </div>

          {/* Timeline Container */}
          <div className="relative pl-6 sm:pl-10 space-y-8">
            
            {/* Visual Spine Trail */}
            <div className="absolute left-[23px] sm:left-[39px] top-6 bottom-6 w-1 bg-gradient-to-b from-emerald-400 via-blue-500 to-slate-200 rounded-full" />

            {nodes.map((node, index) => {
              const isCompleted = node.status === 'completed';
              const isActive = node.status === 'active';
              const isLocked = node.status === 'locked';

              return (
                <div key={node.id} className="relative flex items-start gap-4 sm:gap-6 group">
                  
                  {/* Trạm Tròn Đánh Số & Trạng Thái */}
                  <div 
                    onClick={() => handleOpenNode(node)}
                    className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-extrabold text-xs sm:text-sm shrink-0 transition-all cursor-pointer shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20 ring-4 ring-emerald-50'
                        : isActive
                        ? 'bg-blue-600 text-white shadow-blue-600/30 ring-4 ring-blue-100 scale-105'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 group-hover:bg-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : isActive ? (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>

                  {/* Thẻ Nội Dung Trạm Học */}
                  <div 
                    onClick={() => handleOpenNode(node)}
                    className={`flex-1 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50/40 border-blue-300 shadow-md ring-1 ring-blue-200/50'
                        : isCompleted
                        ? 'bg-white border-emerald-200/80 hover:border-emerald-300 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs opacity-90'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          TRẠM 0{node.stationNumber}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700">
                          {node.subject}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          node.difficulty === 'Vận dụng cao 9+' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : node.difficulty === 'Vận dụng' 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {node.difficulty}
                        </span>
                        {node.isRemedial && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 flex items-center gap-1">
                            <PlusCircle className="w-3 h-3" />
                            <span>Trạm Bổ Trợ</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{node.estimatedMinutes} phút</span>
                        </span>
                        <span className="text-amber-500 font-bold">+{node.xp} XP</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          {node.scoreContribution}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5">
                      {node.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {node.summary}
                    </p>

                    {/* Phân đoạn chặng & nút vào học */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">
                        {node.stageName}
                      </span>

                      <span className={`font-bold flex items-center gap-1 ${
                        isCompleted 
                          ? 'text-emerald-600' 
                          : isActive 
                          ? 'text-blue-600' 
                          : 'text-slate-400'
                      }`}>
                        <span>{isCompleted ? 'Xem lại bài học' : isActive ? 'Bắt đầu học ngay' : 'Đang khóa'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>

                  </div>

                </div>
              );
            })}

            {/* Cờ Đích Kết Thúc Lộ Trình */}
            <div className="relative flex items-center gap-4 sm:gap-6 pt-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center font-extrabold shadow-lg shadow-amber-500/20 shrink-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                  Đích Đến: Đạt Mức Điểm Mục Tiêu ({activeRoadmapScore})
                </h4>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Hoàn thành toàn bộ các trạm học tập để nắm vững 100% kiến thức và tự tin bứt phá trong kỳ thi chính thức.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* 5. MODAL HỌC TẬP TỪNG TRẠM TOÀN DIỆN (5 TABS SƯ PHẠM)         */}
      {/* ============================================================ */}
      {activeNode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-blue-600 text-white">
                    TRẠM 0{activeNode.stationNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {activeNode.subject} • {activeNode.difficulty}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {activeNode.scoreContribution}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {activeNode.title}
                </h2>
              </div>

              <button 
                onClick={() => setActiveNode(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Đóng bài học"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5 Tab Navigation Bar */}
            <div className="px-5 border-b border-slate-200 bg-white flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0 text-xs font-bold">
              <button
                onClick={() => setActiveTab('objectives')}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'objectives'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>1. Mục Tiêu</span>
              </button>

              <button
                onClick={() => setActiveTab('theory')}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'theory'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>2. Lý Thuyết & Bẫy</span>
              </button>

              <button
                onClick={() => setActiveTab('examples')}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'examples'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>3. Ví Dụ Chi Tiết</span>
              </button>

              <button
                onClick={() => setActiveTab('practice')}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'practice'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>4. Thực Hành Có Gợi Ý</span>
              </button>

              <button
                onClick={() => setActiveTab('mastery')}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'mastery'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>5. Kiểm Tra Cuối Trạm</span>
              </button>
            </div>

            {/* Modal Body Content (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              
              {/* TAB 1: MỤC TIÊU BÀI HỌC */}
              {activeTab === 'objectives' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                    <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-blue-600" />
                      <span>LÝ DO TRẠM NÀY XUẤT HIỆN TRONG LỘ TRÌNH</span>
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {activeNode.outcomes.whyThisStation}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                      <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Bạn Sẽ Hiểu Được Gì?</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {activeNode.outcomes.understand.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                      <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>Bạn Sẽ Tự Làm Được Gì?</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {activeNode.outcomes.canDo.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-700">Trọng tâm then chốt nhất:</span>
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Bắt buộc nắm vững</span>
                    </div>
                    <p className="text-slate-800 font-medium">
                      {activeNode.outcomes.keyConcept}
                    </p>
                    <div className="pt-2 text-slate-500 border-t border-slate-200/60 flex items-center justify-between">
                      <span>Kiến thức tiên quyết: {activeNode.outcomes.prerequisites}</span>
                      <span className="text-emerald-700 font-semibold">{activeNode.outcomes.scoreImpact}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LÝ THUYẾT & BẪY ĐỀ THI (THIẾT KẾ HIỆN ĐẠI, ANIMATION & SAO CHÉP CÔNG THỨC) */}
              {activeTab === 'theory' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Quy trình học 4 chặng trực quan */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                      <span className="truncate">Nắm Bản Chất</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                      <span className="truncate">Công Thức Vàng</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                      <span className="truncate">Cảnh Báo Bẫy</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                      <span className="truncate">Cheat Sheet</span>
                    </div>
                  </div>

                  {/* 1. Bản chất khái niệm & cơ sở khoa học */}
                  <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 hover:border-blue-300 transition-all">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>Bản Chất Khái Niệm & Cơ Sở Khoa Học</span>
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-800">
                        Nền tảng cốt lõi
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                      {activeNode.theory.overview}
                    </p>
                  </div>

                  {/* 2. Phân tích sư phạm chuyên sâu */}
                  <div className="p-4.5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white border border-blue-200/80 space-y-2.5 shadow-2xs hover:shadow-xs transition-all">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                        <span>Phân Tích Sư Phạm Socratic (Học Bản Chất, Không Học Vẹt)</span>
                      </h4>
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-md">
                        AI Pedagogical Engine
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed space-y-1.5 bg-white/70 p-3 rounded-xl border border-blue-100">
                      <FormattedMessage content={activeNode.theory.deepExplanation} />
                    </div>
                  </div>

                  {/* 3. Bảng công thức vàng & nút sao chép có animation */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Atom className="w-4 h-4 text-indigo-600" />
                        <span>Hệ Thống Công Thức Vàng & Điều Kiện Áp Dụng</span>
                      </h4>
                      <span className="text-[11px] text-slate-500 italic">Nhấn nút để sao chép nhanh</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {activeNode.theory.keyFormulas.map((form, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all duration-200 group"
                        >
                          <div className="space-y-1 sm:max-w-[40%]">
                            <span className="font-bold text-slate-900 block">{form.name}</span>
                            <span className="text-slate-500 text-[11px] block">{form.note}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 justify-between sm:justify-end flex-1">
                            <span className="font-mono text-indigo-900 font-bold bg-indigo-50/80 px-3 py-1.5 rounded-xl border border-indigo-200/70 text-xs tracking-wide shadow-inner">
                              {form.formula}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyFormula(form.formula, fIdx)}
                              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                copiedFormulaIdx === fIdx
                                  ? 'bg-emerald-500 text-white border-emerald-500 scale-105 shadow-xs'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                              }`}
                              title="Sao chép công thức"
                            >
                              {copiedFormulaIdx === fIdx ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Đã chép!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Chép</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Bảng bẫy đề thi & lỗi ngộ nhận (2 Cột So Sánh) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        <span>Cảnh Báo: Bẫy Đề Thi Điểm 8+ & Tuyệt Chiêu Hóa Giải</span>
                      </h4>
                      <span className="text-[11px] text-rose-600 font-medium">Bảo vệ 100% điểm số</span>
                    </div>
                    
                    <div className="space-y-2.5">
                      {activeNode.theory.commonTraps.map((trapItem, tIdx) => (
                        <div
                          key={tIdx}
                          className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs transition-all duration-200"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                            {/* Cột Bẫy */}
                            <div className="p-3.5 bg-rose-50/50 text-xs space-y-1">
                              <div className="font-bold text-rose-900 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>Bẫy Thường Gặp #{tIdx + 1}:</span>
                              </div>
                              <p className="text-rose-950/80 leading-relaxed pl-5">
                                {trapItem.trap}
                              </p>
                            </div>

                            {/* Cột Cách Né Bẫy */}
                            <div className="p-3.5 bg-emerald-50/50 text-xs space-y-1">
                              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Tuyệt Chiêu Hóa Giải:</span>
                              </div>
                              <p className="text-emerald-950/80 leading-relaxed pl-5 font-medium">
                                {trapItem.howToAvoid}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. Thẻ ghi nhớ 1 phút (Cheat Sheet) */}
                  <div className="p-4.5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 border border-amber-200/90 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Thẻ Tóm Tắt Ghi Nhớ 60 Giây (Cheat Sheet Tinh Gọn)</span>
                      </h4>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        Ôn tập siêu tốc
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
                      {activeNode.theory.summaryTakeaways.map((takeaway, tkIdx) => (
                        <li key={tkIdx} className="flex items-start gap-2 bg-white/70 p-2 rounded-xl border border-amber-100">
                          <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: VÍ DỤ GIẢI CHI TIẾT */}
              {activeTab === 'examples' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {activeNode.workedExamples.map((ex, exIdx) => (
                    <div key={exIdx} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-blue-900">
                          {ex.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          {ex.level}
                        </span>
                      </div>

                      {/* Đề bài */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed">
                        <FormattedMessage content={ex.problem} />
                      </div>

                      {/* Dấu hiệu nhận diện dạng bài */}
                      <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <span className="font-bold text-indigo-900">Dấu hiệu nhận diện 5s: </span>
                          <span className="text-indigo-800">{ex.patternRecognition}</span>
                        </div>
                      </div>

                      {/* Từng bước giải chi tiết kèm lý do */}
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-slate-700">Quy trình giải từng bước:</h4>
                        {ex.steps.map((st) => (
                          <div key={st.stepNum} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                {st.stepNum}
                              </span>
                              <span>{st.action}</span>
                            </div>
                            <p className="text-slate-600 pl-6 leading-relaxed">
                              {st.explanation}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Đáp số & Mẹo kiểm tra kết quả */}
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                        <div className="font-bold text-emerald-900">
                          🎯 Đáp số chính xác: {ex.finalAnswer}
                        </div>
                        <div className="text-emerald-800">
                          💡 Mẹo kiểm tra lại: {ex.verificationTrick}
                        </div>
                      </div>

                      {ex.alternativeMethod && (
                        <div className="text-xs text-slate-500 italic pl-1">
                          Cách giải khác: {ex.alternativeMethod}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: THỰC HÀNH CÓ GỢI Ý (ĐA DẠNG CÂU HỎI & AI TỰ ĐỔI ĐỀ) */}
              {activeTab === 'practice' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* Top Header: Thông tin câu hỏi & Bộ đề hiện tại */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-900 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>CÂU HỎI THỰC HÀNH ({practiceIndex + 1}/{activeNode.practiceQuestions.length})</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-semibold text-[11px]">
                        {currentQuestionSetName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px] font-medium">
                        💡 Gợi ý đã mở: {revealedHintsCount}/{activeNode.practiceQuestions[practiceIndex].hints.length}
                      </span>
                    </div>
                  </div>

                  {/* Thanh chọn nhanh câu hỏi (Question Navigation Strip) & Nút AI Sinh Đề Mới */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                      <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap mr-1">Các câu:</span>
                      {activeNode.practiceQuestions.map((_, qIdx) => {
                        const isCurrent = practiceIndex === qIdx;
                        const isChecked = practiceChecked[qIdx];
                        const userAns = practiceAnswers[qIdx];
                        const isCorrect = userAns === activeNode.practiceQuestions[qIdx].correctAnswer;
                        
                        let chipStyle = 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200';
                        if (isCurrent) {
                          chipStyle = 'bg-blue-600 text-white font-bold ring-2 ring-blue-300 shadow-xs border-blue-600 scale-105';
                        } else if (isChecked) {
                          if (isCorrect) {
                            chipStyle = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold';
                          } else {
                            chipStyle = 'bg-rose-100 text-rose-900 border-rose-400 font-bold';
                          }
                        } else if (userAns !== null) {
                          chipStyle = 'bg-blue-50 text-blue-800 border-blue-300 font-semibold';
                        }

                        return (
                          <button
                            key={qIdx}
                            type="button"
                            onClick={() => handleJumpToPracticeQuestion(qIdx)}
                            className={`px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer whitespace-nowrap ${chipStyle}`}
                          >
                            Câu {qIdx + 1}
                          </button>
                        );
                      })}
                    </div>

                    {/* Nút AI Sinh Bộ Câu Hỏi Mới Khác */}
                    <button
                      type="button"
                      disabled={isSwappingQuestions}
                      onClick={handleSwapQuestions}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer shrink-0 self-start sm:self-auto"
                      title="AI sinh ngân hàng câu hỏi mới khác cho trạm này"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isSwappingQuestions ? 'animate-spin' : ''}`} />
                      <span>{isSwappingQuestions ? 'AI Đang Sinh Đề...' : '✨ AI Sinh Bộ Câu Hỏi Mới Khác'}</span>
                    </button>
                  </div>

                  {/* Khung đề bài & Các lựa chọn */}
                  <div className="p-5 rounded-2xl border border-slate-200/90 bg-white space-y-4 shadow-2xs hover:border-slate-300 transition-all">
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                      <FormattedMessage content={activeNode.practiceQuestions[practiceIndex].question} />
                    </p>

                    {/* Hệ thống gợi ý từng bước (Hints) */}
                    <div className="space-y-2">
                      {revealedHintsCount > 0 && (
                        <div className="space-y-1.5">
                          {activeNode.practiceQuestions[practiceIndex].hints.slice(0, revealedHintsCount).map((hintText, hIdx) => (
                            <div key={hIdx} className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Gợi ý {hIdx + 1}: </span>
                                <span>{hintText}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {revealedHintsCount < activeNode.practiceQuestions[practiceIndex].hints.length && !practiceChecked[practiceIndex] && (
                        <button
                          type="button"
                          onClick={() => setRevealedHintsCount(prev => prev + 1)}
                          className="px-3 py-1.5 rounded-xl bg-amber-100/70 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Xem gợi ý bước {revealedHintsCount + 1}</span>
                        </button>
                      )}
                    </div>

                    {/* 4 Lựa chọn trắc nghiệm với huy hiệu A, B, C, D bo tròn */}
                    <div className="space-y-2.5 pt-2">
                      {activeNode.practiceQuestions[practiceIndex].options.map((opt, idx) => {
                        const optLetter = String.fromCharCode(65 + idx); // A, B, C, D
                        const isSelected = practiceAnswers[practiceIndex] === idx;
                        const isChecked = practiceChecked[practiceIndex];
                        const isCorrect = idx === activeNode.practiceQuestions[practiceIndex].correctAnswer;

                        let btnStyle = 'border-slate-200 hover:border-blue-400 bg-white text-slate-800 shadow-2xs hover:bg-blue-50/20';
                        let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

                        if (isSelected) {
                          btnStyle = 'border-blue-600 bg-blue-50/80 text-blue-950 font-semibold ring-2 ring-blue-500/20 shadow-xs';
                          badgeStyle = 'bg-blue-600 text-white border-blue-600';
                        }
                        if (isChecked) {
                          if (isCorrect) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                            badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'border-rose-400 bg-rose-50 text-rose-950 line-through opacity-85';
                            badgeStyle = 'bg-rose-600 text-white border-rose-600';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={isChecked}
                            onClick={() => handleSelectPracticeOption(idx)}
                            className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 transition-all ${badgeStyle}`}>
                                {optLetter}
                              </span>
                              <span className="leading-relaxed">{opt}</span>
                            </div>
                            {isChecked && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Lời giải chi tiết & Phân tích bẫy */}
                    {practiceChecked[practiceIndex] && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="font-bold flex items-center gap-1.5">
                          {practiceAnswers[practiceIndex] === activeNode.practiceQuestions[practiceIndex].correctAnswer ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Chính xác tuyệt đối!
                            </span>
                          ) : (
                            <span className="text-rose-700 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                              Chưa chính xác. Đọc phân tích bẫy bên dưới:
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {activeNode.practiceQuestions[practiceIndex].explanation}
                        </p>
                        <div className="pt-2 border-t border-slate-200 text-rose-800 font-medium">
                          ⚠️ Phân tích bẫy sai: {activeNode.practiceQuestions[practiceIndex].trapAnalysis}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Practice Navigation Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => handleAskEduAdvisorAboutStation(activeNode, activeNode.practiceQuestions[practiceIndex].question)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Hỏi EduAdvisor AI về câu này</span>
                    </button>

                    <div>
                      {!practiceChecked[practiceIndex] ? (
                        <button
                          type="button"
                          disabled={practiceAnswers[practiceIndex] === null}
                          onClick={handleCheckPractice}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Kiểm Tra Đáp Án
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNextPractice}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{practiceIndex < activeNode.practiceQuestions.length - 1 ? 'Câu Tiếp Theo' : 'Chuyển Sang Bài Kiểm Tra'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: KIỂM TRA CUỐI TRẠM & ĐÁNH GIÁ THÀNH THẠO (NHIỀU CÂU & ĐỔI ĐỀ AI) */}
              {activeTab === 'mastery' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  
                  {!masteryFinished ? (
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 text-xs font-bold">
                        <span className="text-emerald-900 flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span>BÀI KIỂM TRA CHUẨN ĐẦU RA ({masteryIndex + 1}/{activeNode.masteryTest.length})</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-semibold text-[11px]">
                            Điều kiện mở khóa trạm: Đạt ≥ 50%
                          </span>
                        </div>
                      </div>

                      {/* Thanh chọn nhanh câu hỏi & Nút Đổi Đề Kiểm Tra */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap mr-1">Các câu kiểm tra:</span>
                          {activeNode.masteryTest.map((_, mIdx) => {
                            const isCurrent = masteryIndex === mIdx;
                            const isChecked = masteryChecked[mIdx];
                            const userAns = masteryAnswers[mIdx];
                            const isCorrect = userAns === activeNode.masteryTest[mIdx].correctAnswer;

                            let chipStyle = 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200';
                            if (isCurrent) {
                              chipStyle = 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300 shadow-xs border-emerald-600 scale-105';
                            } else if (isChecked) {
                              if (isCorrect) {
                                chipStyle = 'bg-emerald-200 text-emerald-950 border-emerald-400 font-bold';
                              } else {
                                chipStyle = 'bg-rose-100 text-rose-900 border-rose-400 font-bold';
                              }
                            } else if (userAns !== null) {
                              chipStyle = 'bg-blue-50 text-blue-800 border-blue-300 font-semibold';
                            }

                            return (
                              <button
                                key={mIdx}
                                type="button"
                                onClick={() => handleJumpToMasteryQuestion(mIdx)}
                                className={`px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer whitespace-nowrap ${chipStyle}`}
                              >
                                Câu {mIdx + 1}
                              </button>
                            );
                          })}
                        </div>

                        {/* Nút đổi bộ đề kiểm tra mới */}
                        <button
                          type="button"
                          disabled={isSwappingQuestions}
                          onClick={handleSwapQuestions}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer shrink-0 self-start sm:self-auto"
                          title="AI sinh ngân hàng câu hỏi test mới cho trạm này"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${isSwappingQuestions ? 'animate-spin' : ''}`} />
                          <span>{isSwappingQuestions ? 'Đang Đổi Đề...' : '✨ AI Đổi Đề Test Mới'}</span>
                        </button>
                      </div>

                      {/* Đề bài & Lựa chọn */}
                      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white space-y-4 shadow-2xs hover:border-slate-300 transition-all">
                        <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                          <FormattedMessage content={activeNode.masteryTest[masteryIndex].question} />
                        </p>

                        <div className="space-y-2.5">
                          {activeNode.masteryTest[masteryIndex].options.map((opt, idx) => {
                            const optLetter = String.fromCharCode(65 + idx);
                            const isSelected = masteryAnswers[masteryIndex] === idx;
                            const isChecked = masteryChecked[masteryIndex];
                            const isCorrect = idx === activeNode.masteryTest[masteryIndex].correctAnswer;

                            let btnStyle = 'border-slate-200 hover:border-blue-400 bg-white text-slate-800 shadow-2xs hover:bg-blue-50/20';
                            let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

                            if (isSelected) {
                              btnStyle = 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-semibold ring-2 ring-emerald-500/20 shadow-xs';
                              badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                            }
                            if (isChecked) {
                              if (isCorrect) {
                                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                                badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                              } else if (isSelected && !isCorrect) {
                                btnStyle = 'border-rose-400 bg-rose-50 text-rose-950 line-through opacity-85';
                                badgeStyle = 'bg-rose-600 text-white border-rose-600';
                              }
                            }

                            return (
                              <button
                                key={idx}
                                disabled={isChecked}
                                onClick={() => handleSelectMasteryOption(idx)}
                                className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 transition-all ${badgeStyle}`}>
                                    {optLetter}
                                  </span>
                                  <span className="leading-relaxed">{opt}</span>
                                </div>
                                {isChecked && isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {masteryChecked[masteryIndex] && (
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 animate-in fade-in duration-200">
                            <p className="text-slate-700 leading-relaxed">
                              {activeNode.masteryTest[masteryIndex].explanation}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end pt-2">
                        {!masteryChecked[masteryIndex] ? (
                          <button
                            type="button"
                            disabled={masteryAnswers[masteryIndex] === null}
                            onClick={handleCheckMastery}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            Xác Nhận Đáp Án
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleNextMastery}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>{masteryIndex < activeNode.masteryTest.length - 1 ? 'Câu Tiếp Theo' : 'Xem Kết Quả Trạm'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Kết quả sau khi làm bài kiểm tra trạm */
                    <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                      <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl ${
                        masteryCorrectCount >= 1 ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'
                      }`}>
                        {masteryCorrectCount >= 1 ? <Trophy className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                      </div>

                      <div className="space-y-1 max-w-md mx-auto">
                        <h3 className="text-lg font-bold text-slate-900">
                          {masteryCorrectCount >= 1 
                            ? `🎉 Chúc mừng! Bạn đã chinh phục Trạm 0${activeNode.stationNumber}!` 
                            : 'Cần củng cố thêm kiến thức trạm này'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Bạn đã trả lời đúng {masteryCorrectCount}/{activeNode.masteryTest.length} câu kiểm tra ({Math.round((masteryCorrectCount / activeNode.masteryTest.length) * 100)}%).
                        </p>
                      </div>

                      {/* Phân tích sư phạm AI Coach */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left max-w-lg mx-auto space-y-2">
                        <span className="font-bold text-blue-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>AI Study Coach Đánh Giá:</span>
                        </span>
                        <p className="text-slate-700 leading-relaxed">
                          {masteryCorrectCount >= 1
                            ? `Bạn đã nắm vững ${activeNode.outcomes.keyConcept}. Trạm tiếp theo đã sẵn sàng để bạn chinh phục mức điểm cao hơn!`
                            : `Bạn đang gặp lúng túng ở phần ${activeNode.outcomes.keyConcept}. Bạn có thể làm lại bài kiểm tra hoặc đổi sang bộ đề mới để rèn phản xạ vững chắc.`}
                        </p>
                      </div>

                      {/* Nút hành động */}
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          disabled={isSwappingQuestions}
                          onClick={handleSwapQuestions}
                          className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${isSwappingQuestions ? 'animate-spin' : ''}`} />
                          <span>✨ AI Đổi Đề Khác Thử Sức Lại</span>
                        </button>

                        {masteryCorrectCount < 1 && (
                          <button
                            type="button"
                            onClick={handleAddRemedialStation}
                            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>Thêm Trạm Bổ Trợ Củng Cố</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setActiveNode(null)}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                        >
                          Hoàn Tất & Đóng
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => handleAskEduAdvisorAboutStation(activeNode)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Hỏi Cố vấn EduAdvisor AI về Trạm Này</span>
              </button>

              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                {activeNode.stageName}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL AI THIẾT KẾ LỘ TRÌNH MỚI BẰNG EDUADVISOR AI         */}
      {/* ============================================================ */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    AI Thiết Kế Lộ Trình Thích Ứng
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      ⚡ Turbo 0.7s
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Tối ưu hóa học tập cá nhân hóa đa tầng bám sát đề thi</p>
                </div>
              </div>
              <button 
                type="button"
                disabled={isGenerating}
                onClick={() => setShowGeneratorModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thanh Mẫu Điền Nhanh Siêu Tốc (1-Click AI Presets) */}
            <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-blue-50/90 p-3 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Mẫu Điền Nhanh 1-Chạm (Tăng tốc thiết kế đa mục tiêu):
                </span>
                <span className="text-[10px] font-semibold text-blue-600 bg-white/90 px-2 py-0.5 rounded-full border border-blue-200/60 shadow-xs">
                  ⚡ 0.01s Tự Điền
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => applyQuickPreset('HUST_A00')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-[11px] font-semibold text-slate-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  🚀 Bách Khoa A00 (28.5+)
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => applyQuickPreset('FTU_A01')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-[11px] font-semibold text-slate-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  ⚖️ Ngoại Thương A01 (28.0+)
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => applyQuickPreset('NEU_D01')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-[11px] font-semibold text-slate-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  📚 Kinh Tế Quốc Dân D01 (27.5+)
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => applyQuickPreset('DGNL_TOP')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-[11px] font-semibold text-slate-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  🎯 ĐGNL ĐHQG (950+)
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => applyQuickPreset('IELTS_75')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-[11px] font-semibold text-slate-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  🇬🇧 IELTS Bứt Tốc (7.5+)
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => applyQuickPreset('Y_DUOC_B00')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-[11px] font-semibold text-slate-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  🩺 Y Hà Nội / Y Dược B00 (28.0+)
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => applyQuickPreset('CHUYEN_TIN')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-[11px] font-semibold text-slate-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  🏆 Chuyên Tin &amp; HSG
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => applyQuickPreset('SAT_1500')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-[11px] font-semibold text-slate-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  🌐 Digital SAT (1500+)
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => applyQuickPreset('LAY_GOC_30')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-[11px] font-semibold text-slate-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  ⚡ Lấy Gốc Cấp Tốc (8.0+)
                </button>
              </div>
            </div>

            {feasibilityAlert && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>{feasibilityAlert}</p>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">1. Mục tiêu học tập / Kỳ thi chính</label>
                <select
                  value={genGoal}
                  onChange={(e) => {
                    const g = e.target.value;
                    setGenGoal(g);
                    if (g === 'THPT_QG') {
                      setGenSubject('Khối A00 (Toán - Lý - Hóa)');
                      setGenTargetScore('28.5+');
                      setGenTargetSchool('ĐH Bách Khoa (CNTT - Khoa học Máy tính)');
                      setGenWeaknesses('Tích phân hàm ẩn & Vi phân đổi biến, Sóng ánh sáng & Giao thoa');
                    } else if (g === 'DGNL_DHQG') {
                      setGenSubject('ĐGNL ĐHQG (Định lượng + Ngôn ngữ + Khoa học)');
                      setGenTargetScore('900+ / 1200');
                      setGenTargetSchool('ĐH Quốc Gia TP.HCM / Hà Nội');
                      setGenWeaknesses('Tư duy Định lượng & Bài toán thực tế, Đọc hiểu Khoa học');
                    } else if (g === 'TSA_HUST') {
                      setGenSubject('Tư duy Toán học + Tư duy Đọc hiểu + Tư duy Khoa học');
                      setGenTargetScore('80+ / 100');
                      setGenTargetSchool('Đại Học Bách Khoa Hà Nội');
                      setGenWeaknesses('Tư duy Toán học TSA & Mô hình hóa, Đọc hiểu Khoa học - Kỹ thuật');
                    } else if (g === 'IELTS') {
                      setGenSubject('IELTS Academic (Speaking, Writing, Reading, Listening)');
                      setGenTargetScore('Band 7.5 - 8.0');
                      setGenTargetSchool('Du học / Xét tuyển Đại học Top 1');
                      setGenWeaknesses('Speaking Fluency & Kỹ thuật PEEL, Writing Task 2 Cohesion & Paraphrasing');
                    } else if (g === 'SAT') {
                      setGenSubject('Digital SAT (Math & Reading-Writing)');
                      setGenTargetScore('1500+ / 1600');
                      setGenTargetSchool('Học bổng Du học Mỹ / RMIT Top Tier');
                      setGenWeaknesses('Craft & Structure (Từ vựng Ngữ cảnh), Advanced Math (Phương trình Phi tuyến)');
                    } else if (g === 'TOEIC') {
                      setGenSubject('TOEIC 4 Kỹ Năng (Listening, Reading, Speaking, Writing)');
                      setGenTargetScore('850+ / 990');
                      setGenTargetSchool('Doanh nghiệp Đa Quốc Gia & Chuẩn Đầu Ra');
                      setGenWeaknesses('Part 2 Bẫy Gián tiếp & Trả lời né, Part 5 Bẫy Từ loại & Thì động từ');
                    } else if (g === 'LAY_GOC') {
                      setGenSubject('Khôi Phục Nền Tảng Cốt Lõi Cấp Tốc');
                      setGenTargetScore('7.5+');
                      setGenDays(30);
                      setGenWeaknesses('Lấy lại gốc Khái niệm & Công thức SGK, Phương pháp bấm máy Casio cơ bản');
                    } else if (g === 'CHUYEN_HSG') {
                      setGenSubject('Toán Chuyên & Vật Lý Chuyên');
                      setGenTargetScore('Giải Nhất / Nhì Tỉnh');
                      setGenWeaknesses('Bất đẳng thức đại số Cauchy-Schwarz, Tổ hợp rời rạc');
                    } else {
                      setGenSubject('Lập Trình Web Full-Stack & DSA');
                      setGenTargetScore('GPA A/A+ (3.8+)');
                      setGenTargetSchool('Khoa Công Nghệ Thông Tin');
                      setGenWeaknesses('Cấu trúc Dữ liệu & Giải thuật nâng cao, Tối ưu hóa Database Query');
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="THPT_QG">THPT Quốc Gia 2025 (Tốt nghiệp &amp; Xét tuyển Đại học)</option>
                  <option value="DGNL_DHQG">Đánh Giá Năng Lực ĐHQG TP.HCM / Hà Nội (HSA, VNUHCM)</option>
                  <option value="TSA_HUST">Đánh Giá Tư Duy ĐH Bách Khoa Hà Nội (TSA)</option>
                  <option value="IELTS">IELTS Academic (Band 6.5 - 8.5+)</option>
                  <option value="SAT">Digital SAT (Mục tiêu 1400 - 1550+ / 1600)</option>
                  <option value="TOEIC">TOEIC 4 Kỹ Năng (Mục tiêu 750 - 900+)</option>
                  <option value="DAI_HOC_GPA">Đại Học GPA A &amp; Lập Trình Web Full-Stack</option>
                  <option value="CHUYEN_HSG">Bồi Dưỡng Học Sinh Giỏi &amp; Thi Vào Lớp 10 Chuyên</option>
                  <option value="LAY_GOC">Lấy Gốc Mất Gốc Cấp Tốc (30 Ngày Bứt Phá)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">2. Trường Đại học &amp; Ngành học kỳ vọng</label>
                <input
                  type="text"
                  value={genTargetSchool}
                  onChange={(e) => setGenTargetSchool(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: ĐH Bách Khoa (CNTT - Khoa học Máy tính), ĐH Ngoại Thương, ĐH Y Dược..."
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 self-center">Chọn nhanh:</span>
                  {[
                    'ĐH Bách Khoa (CNTT)',
                    'ĐH Ngoại Thương',
                    'ĐH Kinh Tế Quốc Dân',
                    'ĐH Y Hà Nội',
                    'ĐH Y Dược TP.HCM',
                    'ĐHQG Hà Nội',
                    'ĐHQG TP.HCM',
                    'ĐH FPT',
                    'RMIT University',
                    'Du Học Quốc Tế'
                  ].map((school) => (
                    <button
                      key={school}
                      type="button"
                      onClick={() => setGenTargetSchool(school)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 transition-colors cursor-pointer"
                    >
                      {school}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">3. Tổ hợp môn &amp; Chuyên đề trọng tâm</label>
                <input
                  type="text"
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Khối A00 (Toán - Lý - Hóa) hoặc Khối D01 (Toán - Văn - Anh)"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 self-center">Khối thi:</span>
                  {[
                    'Khối A00 (Toán - Lý - Hóa)',
                    'Khối A01 (Toán - Lý - Anh)',
                    'Khối B00 (Toán - Hóa - Sinh)',
                    'Khối C00 (Văn - Sử - Địa)',
                    'Khối D01 (Toán - Văn - Anh)',
                    'Khối D07 (Toán - Hóa - Anh)',
                    'Tư Duy TSA Bách Khoa',
                    'ĐGNL HSA ĐHQG',
                    'IELTS 4 Kỹ Năng',
                    'Digital SAT Math & Reading'
                  ].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setGenSubject(sub)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 transition-colors cursor-pointer"
                    >
                      {sub.split(' ')[0] + (sub.includes('(') ? ' ' + sub.split(' ')[1] : '')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">4. Trình độ hiện tại (Baseline)</label>
                  <select
                    value={genCurrentLevel}
                    onChange={(e) => setGenCurrentLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Mất gốc (< 5.0đ)">Mất gốc (&lt; 5.0đ)</option>
                    <option value="Trung bình (5.0 - 6.5đ)">Trung bình (5.0 - 6.5đ)</option>
                    <option value="Khá (6.5 - 7.5đ)">Khá (6.5 - 7.5đ)</option>
                    <option value="Khá giỏi (7.5 - 8.5đ)">Khá giỏi (7.5 - 8.5đ)</option>
                    <option value="Giỏi (8.5 - 9.0đ)">Giỏi (8.5 - 9.0đ)</option>
                    <option value="Xuất sắc (9.0+ đ / Thủ khoa)">Xuất sắc (9.0+ đ / Thủ khoa)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">5. Mục tiêu điểm số</label>
                  <input
                    type="text"
                    value={genTargetScore}
                    onChange={(e) => setGenTargetScore(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                    placeholder="28.5+ hoặc Band 8.0"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['24.0+', '26.5+', '27.5+', '28.5+', '29.5+ Thủ khoa', '950+ HSA', '85+ TSA', 'Band 7.5', 'Band 8.0+', '1500+ SAT'].map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => setGenTargetScore(sc)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 text-slate-600 transition-colors cursor-pointer"
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">6. Thời gian còn lại (Ngày)</label>
                  <input
                    type="number"
                    value={genDays}
                    onChange={(e) => setGenDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">7. Thời lượng học (Giờ/ngày)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={genDailyHours}
                    onChange={(e) => setGenDailyHours(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">8. Lỗ hổng kiến thức cần vá cấp tốc</label>
                <input
                  type="text"
                  value={genWeaknesses}
                  onChange={(e) => setGenWeaknesses(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={(WEAKNESS_PRESETS_BY_GOAL[genGoal] || WEAKNESS_PRESETS_BY_GOAL['THPT_QG']).placeholder}
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 self-center">
                    Gợi ý ({genGoal === 'IELTS' ? 'Kỹ năng IELTS' : genGoal === 'SAT' ? 'Digital SAT' : genGoal === 'TOEIC' ? 'TOEIC' : genGoal === 'DGNL_DHQG' || genGoal === 'TSA_HUST' ? 'Tư duy ĐGNL/TSA' : genGoal === 'DAI_HOC_GPA' ? 'CNTT & GPA' : 'Trọng tâm'}):
                  </span>
                  {(WEAKNESS_PRESETS_BY_GOAL[genGoal] || WEAKNESS_PRESETS_BY_GOAL['THPT_QG']).weaknesses.map((weak) => (
                    <button
                      key={weak}
                      type="button"
                      onClick={() => {
                        const current = genWeaknesses.trim();
                        if (!current) {
                          setGenWeaknesses(weak);
                        } else if (!current.includes(weak)) {
                          setGenWeaknesses(`${current}, ${weak}`);
                        }
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/70 transition-colors cursor-pointer"
                    >
                      + {weak}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 AI sẽ tự động ưu tiên thiết kế các Trạm học đầu tiên trực tiếp nhắm vào các lỗ hổng này trước khi nâng cao.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">9. Chiến lược học tập ưu tiên</label>
                  <select
                    value={genStrategy}
                    onChange={(e) => setGenStrategy(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Thực chiến luyện đề & Săn bẫy điểm cao">Thực chiến luyện đề &amp; Săn bẫy điểm cao</option>
                    <option value="Chắc lý thuyết từ gốc & Trị dứt điểm ngộ nhận">Chắc lý thuyết từ gốc &amp; Trị dứt điểm ngộ nhận</option>
                    <option value="Nước rút cấp tốc & Tối ưu thời gian làm bài">Nước rút cấp tốc &amp; Tối ưu thời gian làm bài</option>
                    <option value="Đột phá Vận dụng cao 9+ & Câu phân loại điểm 10">Đột phá Vận dụng cao 9+ &amp; Câu phân loại điểm 10</option>
                    <option value="Bấm máy Casio thực chiến & Mẹo loại trừ">Bấm máy Casio thực chiến &amp; Mẹo loại trừ</option>
                    <option value="Hiểu sâu bản chất Socratic & Tư duy liên môn">Hiểu sâu bản chất Socratic &amp; Tư duy liên môn</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">10. Quy mô lộ trình (Số lượng Trạm)</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { count: 5, label: '5 Trạm', sub: 'Cấp tốc' },
                      { count: 7, label: '7 Trạm', sub: 'Chuẩn thi' },
                      { count: 10, label: '10 Trạm', sub: 'Chuyên sâu' }
                    ].map((item) => (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => setGenStationCount(item.count)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                          genStationCount === item.count
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold ring-1 ring-blue-400'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs">{item.label}</div>
                        <div className="text-[9px] text-slate-400 font-normal">{item.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>


            {/* Live Animated AI Generation Progress Tracker */}
            {isGenerating && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl space-y-2.5 animate-in fade-in duration-200 border border-blue-500/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-2 text-blue-200">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    <span className="truncate">{genStepText || 'EduAdvisor AI đang thiết kế siêu tốc...'}</span>
                  </span>
                  <span className="font-extrabold text-amber-400 font-mono text-sm shrink-0">
                    {genProgress}%
                  </span>
                </div>
                
                {/* Progress Bar with Glow */}
                <div className="w-full bg-slate-800/80 rounded-full h-2.5 p-0.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-400 via-amber-300 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                    style={{ width: `${genProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-blue-300/80 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                    Chế độ AI Turbo (Phản hồi tức thì ~0.7s)
                  </span>
                  <span>{genStationCount} Trạm thích ứng &amp; Đề thi Socratic</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                  <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                  AI Turbo: Bật (Tốc độ tối đa)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setShowGeneratorModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerateCustomRoadmap}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-70 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      <span>EduAdvisor AI Đang Xử Lý ({genProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>Khởi Tạo Lộ Trình Siêu Tốc (0.7s)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
