import React, { useState, useEffect } from 'react';
import { PageType, TaskItem, UserProfile, RoadmapData } from '../types';
import { api } from '../services/api';
import { studySyncService } from '../services/studySyncService';
import { RoadmapArcadeModal } from '../components/RoadmapArcadeModal';
import { 
  Play, 
  Clock, 
  Award, 
  CheckCircle2, 
  Flame, 
  Calendar, 
  AlertTriangle, 
  ArrowRight, 
  BarChart3, 
  BookOpen, 
  Sparkles,
  ChevronRight,
  Filter,
  Plus,
  X,
  Gamepad2,
  Zap,
  Puzzle,
  RotateCcw,
  Trophy,
  Check,
  Timer,
  Layers,
  HelpCircle,
  Brain,
  ShieldCheck,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: PageType, initialPrompt?: string) => void;
}

// Hàm AI tự động sinh nhiệm vụ bám sát Lộ trình học tập (Roadmap-aware AI Task Generator)
export const generateRoadmapAwareTasks = (roadmap: RoadmapData | null, profile: UserProfile | null): TaskItem[] => {
  const uid = profile?.id || api.getUser()?.id || 'guest';
  const exam = (roadmap?.targetExam || profile?.target_exam || 'THPT_QG').toUpperCase();

  // 1. Nếu có các trạm học thực tế lưu trong Roadmap Engine (Ưu tiên số 1 - Khớp 100% với lộ trình người dùng)
  if (typeof window !== 'undefined') {
    try {
      const savedNodesStr = localStorage.getItem(`eduadvisor_${uid}_interactive_roadmap_nodes_v5`);
      if (savedNodesStr) {
        const savedNodes = JSON.parse(savedNodesStr);
        if (Array.isArray(savedNodes) && savedNodes.length >= 3) {
          return [
            {
              id: 'rm-station-1',
              title: `Trạm 01: ${savedNodes[0].title}`,
              subject: savedNodes[0].subject || 'Trọng tâm',
              difficulty: savedNodes[0].difficulty || 'Nền tảng',
              duration: `${savedNodes[0].estimatedMinutes || 45} phút`,
              status: savedNodes[0].status === 'completed' ? 'completed' : 'pending',
              score: `+${savedNodes[0].xp || 50} XP`
            },
            {
              id: 'rm-station-2',
              title: `Trạm 02: ${savedNodes[1].title}`,
              subject: savedNodes[1].subject || 'Nâng cao',
              difficulty: savedNodes[1].difficulty || 'Vận dụng',
              duration: `${savedNodes[1].estimatedMinutes || 40} phút`,
              status: savedNodes[1].status === 'completed' ? 'completed' : 'pending',
              score: `+${savedNodes[1].xp || 40} XP`
            },
            {
              id: 'rm-station-3',
              title: `Trạm 03: ${savedNodes[2].title}`,
              subject: savedNodes[2].subject || 'Vận dụng cao',
              difficulty: savedNodes[2].difficulty || 'Khó',
              duration: `${savedNodes[2].estimatedMinutes || 35} phút`,
              status: savedNodes[2].status === 'completed' ? 'completed' : 'pending',
              score: `+${savedNodes[2].xp || 35} XP`
            },
            {
              id: 'rm-station-4',
              title: 'Luyện đề thi Socratic & Phân tích bẫy cùng Cố vấn AI',
              subject: 'AI Advisor',
              difficulty: 'Trung bình',
              duration: '20 phút',
              status: 'pending',
              score: '+20 XP'
            }
          ];
        }
      }
    } catch {}
  }

  // 2. Nếu trong syncedRoadmap có danh sách milestones do AI vừa tạo riêng
  if (roadmap?.milestones && Array.isArray(roadmap.milestones) && roadmap.milestones.length >= 3) {
    const ms = roadmap.milestones;
    return [
      {
        id: 'rm-task-1',
        title: `Chuyên đề Vận dụng cao: ${ms[0]?.title || 'Khảo sát hàm số & Cực trị hàm chứa dấu GTTĐ'}`,
        subject: ms[0]?.subject || 'Toán học',
        difficulty: 'Vận dụng cao',
        duration: '45 phút',
        status: 'pending',
        score: '+40 XP'
      },
      {
        id: 'rm-task-2',
        title: `Bài tập trọng tâm: ${ms[1]?.title || 'Mạch dao động & Cực trị cuộn dây RLC biến thiên'}`,
        subject: ms[1]?.subject || 'Vật lý 12',
        difficulty: 'Khó',
        duration: '40 phút',
        status: 'pending',
        score: '+35 XP'
      },
      {
        id: 'rm-task-3',
        title: `Kỹ thuật giải nhanh: ${ms[2]?.title || 'Đồng đẳng hóa Este đa chức & Quy đổi chất béo'}`,
        subject: ms[2]?.subject || 'Hóa học 12',
        difficulty: 'Khó',
        duration: '35 phút',
        status: 'pending',
        score: '+30 XP'
      },
      {
        id: 'rm-task-4',
        title: `Luyện phương pháp giải Socratic & Phân tích bẫy đề thi cùng Cố vấn AI`,
        subject: 'AI Advisor',
        difficulty: 'Trung bình',
        duration: '20 phút',
        status: 'pending',
        score: '+20 XP'
      }
    ];
  }

  // 3. Nếu mục tiêu là IELTS Academic
  if (exam.includes('IELTS') || exam.includes('IE')) {
    return [
      {
        id: 'ielts-1',
        title: 'Luyện phản xạ Speaking Fluency Part 2 & Kỹ thuật cấu trúc PEEL',
        subject: 'IELTS Speaking',
        difficulty: 'Khó',
        duration: '35 phút',
        status: 'pending',
        score: '+40 XP'
      },
      {
        id: 'ielts-2',
        title: 'Luyện Reading bẫy True/False/Not Given & Định vị từ khóa Paraphrased',
        subject: 'IELTS Reading',
        difficulty: 'Trung bình',
        duration: '40 phút',
        status: 'pending',
        score: '+35 XP'
      },
      {
        id: 'ielts-3',
        title: 'Viết thân bài Task 2 chuẩn Cohesion & Kỹ thuật Counter-argument',
        subject: 'IELTS Writing',
        difficulty: 'Vận dụng cao',
        duration: '45 phút',
        status: 'pending',
        score: '+40 XP'
      },
      {
        id: 'ielts-4',
        title: 'Bắt bẫy Distractor đổi ý phút chót Listening Part 3-4 cùng Cố vấn AI',
        subject: 'IELTS Listening',
        difficulty: 'Trung bình',
        duration: '25 phút',
        status: 'pending',
        score: '+25 XP'
      }
    ];
  }

  // 4. Nếu mục tiêu là Digital SAT
  if (exam.includes('SAT')) {
    return [
      {
        id: 'sat-1',
        title: 'Luyện dạng bài Craft and Structure & Vocabulary in Context',
        subject: 'SAT Reading',
        difficulty: 'Khó',
        duration: '35 phút',
        status: 'pending',
        score: '+35 XP'
      },
      {
        id: 'sat-2',
        title: 'Advanced Math: Bẻ khóa phương trình phi tuyến & Mẹo Desmos',
        subject: 'SAT Math',
        difficulty: 'Vận dụng cao',
        duration: '45 phút',
        status: 'pending',
        score: '+40 XP'
      },
      {
        id: 'sat-3',
        title: 'Standard English Conventions: Bẫy dấu câu Boundaries & Clauses',
        subject: 'SAT Writing',
        difficulty: 'Trung bình',
        duration: '30 phút',
        status: 'pending',
        score: '+30 XP'
      },
      {
        id: 'sat-4',
        title: 'Rèn luyện tốc độ làm bài Module 2 Adaptive cùng Cố vấn AI',
        subject: 'AI Advisor',
        difficulty: 'Khó',
        duration: '25 phút',
        status: 'pending',
        score: '+25 XP'
      }
    ];
  }

  // 5. Nếu mục tiêu là TOEIC
  if (exam.includes('TOEIC')) {
    return [
      {
        id: 'toeic-1',
        title: 'Part 2: Phản xạ câu hỏi gián tiếp & bẫy trả lời né tránh',
        subject: 'TOEIC Listening',
        difficulty: 'Trung bình',
        duration: '30 phút',
        status: 'pending',
        score: '+30 XP'
      },
      {
        id: 'toeic-2',
        title: 'Part 5: 100 câu bẫy từ loại và thì động từ thường gặp',
        subject: 'TOEIC Reading',
        difficulty: 'Khó',
        duration: '35 phút',
        status: 'pending',
        score: '+35 XP'
      },
      {
        id: 'toeic-3',
        title: 'Part 7: Kỹ thuật đối chiếu thông tin đoạn văn kép đa nguồn',
        subject: 'TOEIC Reading',
        difficulty: 'Vận dụng cao',
        duration: '40 phút',
        status: 'pending',
        score: '+40 XP'
      },
      {
        id: 'toeic-4',
        title: 'Học 20 Academic & Business Collocations thông dụng cùng AI',
        subject: 'AI Advisor',
        difficulty: 'Dễ',
        duration: '20 phút',
        status: 'pending',
        score: '+20 XP'
      }
    ];
  }

  // 6. Nếu mục tiêu là Đánh giá năng lực (ĐHQG TP.HCM / Hà Nội / TSA Bách Khoa)
  if (exam.includes('DGNL') || exam.includes('ĐGNL') || exam.includes('NANG_LUC') || exam.includes('TSA')) {
    return [
      {
        id: 'dgnl-1',
        title: 'Phân tích số liệu biểu đồ & Tư duy logic suy luận mệnh đề',
        subject: 'ĐGNL Logic',
        difficulty: 'Khó',
        duration: '40 phút',
        status: 'pending',
        score: '+35 XP'
      },
      {
        id: 'dgnl-2',
        title: 'Kỹ thuật đọc hiểu nhanh văn bản khoa học & Đọc hiểu đoạn văn',
        subject: 'Tiếng Việt & Xã hội',
        difficulty: 'Trung bình',
        duration: '30 phút',
        status: 'pending',
        score: '+25 XP'
      },
      {
        id: 'dgnl-3',
        title: 'Giải nhanh bài toán thực tế tích hợp Khoa học tự nhiên',
        subject: 'KHTN ĐGNL',
        difficulty: 'Vận dụng cao',
        duration: '45 phút',
        status: 'pending',
        score: '+40 XP'
      },
      {
        id: 'dgnl-4',
        title: 'Thực hành làm 10 câu trắc nghiệm tốc độ cùng Cố vấn AI',
        subject: 'AI Advisor',
        difficulty: 'Trung bình',
        duration: '20 phút',
        status: 'pending',
        score: '+20 XP'
      }
    ];
  }

  // 7. Nếu mục tiêu là Đại học GPA
  if (exam.includes('DAI_HOC') || exam.includes('GPA')) {
    return [
      {
        id: 'gpa-1',
        title: 'Tính giới hạn bằng khai triển Maclaurin & Chuỗi Taylor',
        subject: 'Giải tích 1',
        difficulty: 'Khó',
        duration: '40 phút',
        status: 'pending',
        score: '+35 XP'
      },
      {
        id: 'gpa-2',
        title: 'Giải hệ phương trình tuyến tính bằng phương pháp khử Gauss',
        subject: 'Đại số tuyến tính',
        difficulty: 'Trung bình',
        duration: '30 phút',
        status: 'pending',
        score: '+25 XP'
      },
      {
        id: 'gpa-3',
        title: 'Cài đặt cấu trúc dữ liệu đồ thị & Thuật toán tìm đường đi Dijkstra',
        subject: 'Lập trình',
        difficulty: 'Khó',
        duration: '45 phút',
        status: 'pending',
        score: '+40 XP'
      },
      {
        id: 'gpa-4',
        title: 'Thảo luận nghiệm phương trình vi phân và ứng dụng thực tế với AI',
        subject: 'AI Advisor',
        difficulty: 'Trung bình',
        duration: '20 phút',
        status: 'pending',
        score: '+20 XP'
      }
    ];
  }

  // 8. Mặc định: Lộ trình THPT Quốc Gia (Toán - Lý - Hóa Khối A00 / A01)
  return [
    {
      id: 'thpt-1',
      title: 'Khảo sát tính đơn điệu & Cực trị hàm số chứa dấu giá trị tuyệt đối',
      subject: 'Toán học',
      difficulty: 'Vận dụng cao',
      duration: '45 phút',
      status: 'pending',
      score: '+40 XP'
    },
    {
      id: 'thpt-2',
      title: 'Kỹ thuật Giản đồ Vectơ & Cực trị mạch RLC cuộn dây biến thiên',
      subject: 'Vật lý 12',
      difficulty: 'Khó',
      duration: '40 phút',
      status: 'pending',
      score: '+35 XP'
    },
    {
      id: 'thpt-3',
      title: 'Phương pháp đồng đẳng hóa Este đa chức & Quy đổi hỗn hợp chất béo',
      subject: 'Hóa học 12',
      difficulty: 'Khó',
      duration: '35 phút',
      status: 'pending',
      score: '+30 XP'
    },
    {
      id: 'thpt-4',
      title: 'Luyện phương pháp giải Socratic & Phân tích bẫy đề thi cùng Cố vấn AI',
      subject: 'AI Advisor',
      difficulty: 'Trung bình',
      duration: '20 phút',
      status: 'pending',
      score: '+20 XP'
    }
  ];
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const initialUser = api.getUser();
  const [profile, setProfile] = useState<UserProfile | null>(initialUser?.profile || null);
  const [syncedRoadmap, setSyncedRoadmap] = useState(() => api.getUserRoadmap(initialUser?.id));
  const [studyContext, setStudyContext] = useState(() => studySyncService.getActiveContext());
  
  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const uid = initialUser?.id || 'guest';
    try {
      const saved = localStorage.getItem(`eduadvisor_${uid}_daily_tasks`);
      const savedNodesStr = localStorage.getItem(`eduadvisor_${uid}_interactive_roadmap_nodes_v5`);
      let shouldRegenerate = false;

      if (saved) {
        const parsed = JSON.parse(saved);
        if (savedNodesStr) {
          const savedNodes = JSON.parse(savedNodesStr);
          if (Array.isArray(savedNodes) && savedNodes.length > 0) {
            const firstStationTitle = savedNodes[0]?.title || '';
            if (parsed.length > 0 && !parsed[0]?.title?.includes(firstStationTitle)) {
              shouldRegenerate = true;
            }
          }
        }
        const isLegacyGpa = parsed.some((t: any) => t.title?.includes('Maclaurin') || t.title?.includes('Dijkstra'));
        const isCurrentlyGpa = initialUser?.profile?.target_exam === 'DAI_HOC_GPA';
        if (isLegacyGpa && !isCurrentlyGpa) shouldRegenerate = true;

        if (!shouldRegenerate && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return generateRoadmapAwareTasks(api.getUserRoadmap(initialUser?.id), initialUser?.profile || null);
  });

  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);
  
  // Add custom task modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Toán học');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState('Trung bình');
  const [newTaskDuration, setNewTaskDuration] = useState('30 phút');

  // Mini-Games Modal States
  const [isArcadeModalOpen, setIsArcadeModalOpen] = useState(false);
  const [isSpeedQuizOpen, setIsSpeedQuizOpen] = useState(false);
  const [isMemoryMatchOpen, setIsMemoryMatchOpen] = useState(false);
  const [isTrapHunterOpen, setIsTrapHunterOpen] = useState(false);

  // Speed Quiz 60s State
  const [quizTimer, setQuizTimer] = useState(60);
  const [quizActive, setQuizActive] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCombo, setQuizCombo] = useState(0);
  const [quizBestCombo, setQuizBestCombo] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Memory Match State
  const [memoryCards, setMemoryCards] = useState<Array<{ id: number; text: string; subText?: string; matchId: number; flipped: boolean; matched: boolean; color: string }>>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryWon, setMemoryWon] = useState(false);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryTimer, setMemoryTimer] = useState(0);

  // AI Trap Hunter State
  const [trapStageIndex, setTrapStageIndex] = useState(0);
  const [selectedTrapStep, setSelectedTrapStep] = useState<number | null>(null);
  const [trapRevealed, setTrapRevealed] = useState(false);
  const [trapScore, setTrapScore] = useState(0);
  const [trapFinished, setTrapFinished] = useState(false);

  useEffect(() => {
    loadData();

    // 1. Reactive listener when user/profile changes in ProfilePage or Login
    const handleUserUpdate = (e: any) => {
      const u = e.detail || api.getUser();
      if (u?.profile) {
        setProfile({ ...u.profile });
      }
      const updatedRoadmap = api.getUserRoadmap(u?.id);
      setSyncedRoadmap(updatedRoadmap);
    };
    window.addEventListener('eduadvisor_user_updated', handleUserUpdate);

    // 2. Reactive listener when roadmap changes in RoadmapPage
    const handleRoadmapUpdate = () => {
      const u = api.getUser();
      if (u?.profile) setProfile({ ...u.profile });
      const updatedRoadmap = api.getUserRoadmap(u?.id);
      setSyncedRoadmap(updatedRoadmap);
      const uid = u?.id || 'guest';
      const autoTasks = generateRoadmapAwareTasks(updatedRoadmap, u?.profile || null);
      setTasks(autoTasks);
      saveTasksLocally(autoTasks, uid);
    };
    window.addEventListener('eduadvisor_roadmap_updated', handleRoadmapUpdate);

    // 3. Reactive study sync service
    const unsub = studySyncService.subscribe(() => {
      setStudyContext(studySyncService.getActiveContext());
      const u = api.getUser();
      if (u?.profile) setProfile({ ...u.profile });
      setSyncedRoadmap(api.getUserRoadmap(u?.id));
    });

    return () => {
      window.removeEventListener('eduadvisor_user_updated', handleUserUpdate);
      window.removeEventListener('eduadvisor_roadmap_updated', handleRoadmapUpdate);
      unsub();
    };
  }, []);

  const loadData = async () => {
    const user = api.getUser();
    if (user?.profile) {
      setProfile(user.profile);
    }
    const prof = await api.getProfile(user?.id);
    if (prof) setProfile(prof);

    const rm = api.getUserRoadmap(user?.id);
    setSyncedRoadmap(rm);

    // Kiểm tra tasks hiện tại, nếu chưa có hoặc có task cũ lạc quẻ thì tự động sinh theo lộ trình
    const uid = user?.id || 'guest';
    try {
      const saved = localStorage.getItem(`eduadvisor_${uid}_daily_tasks`);
      const savedNodesStr = localStorage.getItem(`eduadvisor_${uid}_interactive_roadmap_nodes_v5`);
      let shouldRegenerate = false;

      if (saved) {
        const parsed = JSON.parse(saved);
        if (savedNodesStr) {
          const savedNodes = JSON.parse(savedNodesStr);
          if (Array.isArray(savedNodes) && savedNodes.length > 0) {
            const firstStationTitle = savedNodes[0]?.title || '';
            if (parsed.length > 0 && !parsed[0]?.title?.includes(firstStationTitle)) {
              shouldRegenerate = true;
            }
          }
        }
        const isLegacyGpa = parsed.some((t: any) => t.title?.includes('Maclaurin') || t.title?.includes('Dijkstra'));
        const isCurrentlyGpa = user?.profile?.target_exam === 'DAI_HOC_GPA';
        if (isLegacyGpa && !isCurrentlyGpa) shouldRegenerate = true;

        if (!shouldRegenerate && parsed.length > 0) {
          setTasks(parsed);
          return;
        }
      }
    } catch {}

    const autoGenerated = generateRoadmapAwareTasks(rm, user?.profile || prof || null);
    setTasks(autoGenerated);
    saveTasksLocally(autoGenerated, uid);
  };

  const saveTasksLocally = (newTasks: TaskItem[], userId?: string) => {
    try {
      const uid = userId || api.getUser()?.id || 'guest';
      localStorage.setItem(`eduadvisor_${uid}_daily_tasks`, JSON.stringify(newTasks));
    } catch {}
  };

  // Nút AI Tạo / Cập nhật nhiệm vụ theo Lộ trình học tập
  const handleAIGenerateRoadmapTasks = () => {
    setIsGeneratingTasks(true);
    setTimeout(() => {
      const user = api.getUser();
      const currentRm = api.getUserRoadmap(user?.id);
      const generated = generateRoadmapAwareTasks(currentRm, profile);
      setTasks(generated);
      saveTasksLocally(generated, user?.id);
      setIsGeneratingTasks(false);
      setShowSyncToast(true);
      setTimeout(() => setShowSyncToast(false), 4000);
    }, 700);
  };

  const toggleTask = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const nextStatus = target.status === 'completed' ? 'pending' : 'completed';

    // Optimistic UI update
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, status: nextStatus as any } : t);
    setTasks(updatedTasks);
    saveTasksLocally(updatedTasks);

    // Cập nhật profile đồng bộ:
    // Khi hoàn thành: +1 bài giải, +0.5 giờ học
    // Khi hủy hoàn thành: -1 bài giải, -0.5 giờ học
    const u = api.getUser();
    if (u) {
      if (!u.profile) {
        u.profile = {
          id: u.id,
          email: u.email,
          full_name: u.full_name || 'Học viên',
          school: 'THPT Chu Văn An',
          target_exam: 'THPT_QG',
          target_score: '28.0 Điểm',
          current_level: 'Khá Giỏi (8.0+)',
          focus_subjects: ['Toán học', 'Vật lý'],
          learning_needs: [],
          streak_days: 14,
          avg_score: 8.8,
          study_hours: 28.5,
          solved_problems: 342
        };
      }
      
      const currentSolved = u.profile.solved_problems !== undefined ? u.profile.solved_problems : 342;
      const currentHours = u.profile.study_hours !== undefined ? u.profile.study_hours : 28.5;

      if (nextStatus === 'completed') {
        u.profile.solved_problems = currentSolved + 1;
        u.profile.study_hours = +(currentHours + 0.5).toFixed(1);
      } else {
        u.profile.solved_problems = Math.max(0, currentSolved - 1);
        u.profile.study_hours = +(Math.max(0, currentHours - 0.5)).toFixed(1);
      }

      api.setUser(u);
      setProfile({ ...u.profile });
    }

    // Call API toggle
    await api.toggleTask(id, nextStatus);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const user = api.getUser();
    const created = await api.createTask({
      title: newTaskTitle,
      subject: newTaskSubject,
      difficulty: newTaskDifficulty,
      duration: newTaskDuration
    }, user?.id);

    const updated = [created, ...tasks];
    setTasks(updated);
    saveTasksLocally(updated, user?.id);
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  // --- Sound Synthesizer for Mini-Games ---
  const playFxSound = (type: 'correct' | 'wrong' | 'flip' | 'win' | 'trap') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.2);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'flip') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.linearRampToValueAtTime(650, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'trap') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
          const sOsc = ctx.createOscillator();
          const sGain = ctx.createGain();
          sOsc.connect(sGain);
          sGain.connect(ctx.destination);
          sOsc.type = 'triangle';
          sOsc.frequency.setValueAtTime(f, now + idx * 0.08);
          sGain.gain.setValueAtTime(0.2, now + idx * 0.08);
          sGain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);
          sOsc.start(now + idx * 0.08);
          sOsc.stop(now + idx * 0.08 + 0.25);
        });
      }
    } catch {}
  };

  // --- 1. Speed Blitz Quiz 60s Handlers ---
  const SPEED_QUIZ_QUESTIONS = [
    {
      q: 'Nguyên hàm của hàm số f(x) = 1/x trên khoảng (0, +∞) là gì?',
      options: ['ln(x) + C', '-1/x² + C', 'e^x + C', '1/x² + C'],
      correct: 0,
      subject: 'Toán học 12',
      explanation: 'Theo bảng nguyên hàm cơ bản, ∫ (1/x) dx = ln|x| + C. Trên khoảng (0, +∞) thì ln|x| = ln(x).'
    },
    {
      q: 'Công thức tính chu kỳ dao động điều hòa của con lắc lò xo là:',
      options: ['T = 2π√(k/m)', 'T = 2π√(m/k)', 'T = 1/(2π)√(m/k)', 'T = 2π√(l/g)'],
      correct: 1,
      subject: 'Vật lý 12',
      explanation: 'Chu kỳ con lắc lò xo: T = 2π/ω = 2π√(m/k). (Mẹo nhớ: "Thấy Muốn Khóc").'
    },
    {
      q: 'Công thức phân tử tổng quát của Este no, đơn chức, mạch hở là:',
      options: ['CnH2nO2 (n ≥ 2)', 'CnH2n-2O2 (n ≥ 3)', 'CnH2n+2O (n ≥ 1)', 'CnH2nO (n ≥ 1)'],
      correct: 0,
      subject: 'Hóa học 12',
      explanation: 'Este no, đơn chức, mạch hở có 1 liên kết π ở nhóm -COO-, do đó CTPT là CnH2nO2 với n ≥ 2.'
    },
    {
      q: 'Thể tích của khối chóp có diện tích đáy B và chiều cao h là:',
      options: ['V = B.h', 'V = 1/3 B.h', 'V = 1/2 B.h', 'V = 4/3 B.h'],
      correct: 1,
      subject: 'Toán học 12',
      explanation: 'Thể tích khối chóp luôn bằng 1/3 diện tích đáy nhân chiều cao: V = (1/3).B.h.'
    },
    {
      q: 'Hiện tượng cộng hưởng điện trong mạch RLC nối tiếp xảy ra khi:',
      options: ['ωL = 1/(ωC)', 'ωL = ωC', 'R = ωL', 'R = 1/(ωC)'],
      correct: 0,
      subject: 'Vật lý 12',
      explanation: 'Cộng hưởng điện xảy ra khi ZL = ZC ⟺ ωL = 1/(ωC) ⟺ ω²LC = 1.'
    }
  ];

  const startSpeedQuiz = () => {
    setQuizTimer(60);
    setQuizScore(0);
    setQuizCombo(0);
    setQuizBestCombo(0);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setQuizFinished(false);
    setQuizActive(true);
    setIsSpeedQuizOpen(true);
  };

  useEffect(() => {
    let interval: any = null;
    if (quizActive && quizTimer > 0 && !quizFinished) {
      interval = setInterval(() => {
        setQuizTimer(t => {
          if (t <= 1) {
            setQuizFinished(true);
            setQuizActive(false);
            playFxSound('win');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizActive, quizTimer, quizFinished]);

  const handleSelectQuizAnswer = (idx: number) => {
    if (selectedAnswer !== null || quizFinished) return;
    setSelectedAnswer(idx);
    const isCorrect = idx === SPEED_QUIZ_QUESTIONS[quizIndex].correct;

    if (isCorrect) {
      playFxSound('correct');
      setQuizScore(s => s + 1);
      setQuizCombo(c => {
        const next = c + 1;
        setQuizBestCombo(b => Math.max(b, next));
        return next;
      });
    } else {
      playFxSound('wrong');
      setQuizCombo(0);
    }

    setTimeout(() => {
      if (quizIndex + 1 < SPEED_QUIZ_QUESTIONS.length) {
        setQuizIndex(i => i + 1);
        setSelectedAnswer(null);
      } else {
        setQuizFinished(true);
        setQuizActive(false);
        playFxSound('win');

        // Thưởng điểm và bài tập đã giải vào profile
        const u = api.getUser();
        if (u && u.profile) {
          u.profile.solved_problems = (u.profile.solved_problems !== undefined ? u.profile.solved_problems : 342) + 1;
          api.setUser(u);
          setProfile({ ...u.profile });
        }
      }
    }, 900);
  };

  // --- 2. Formula Memory Match 3D Handlers ---
  const FORMULA_PAIRS = [
    { text: '∫ (1/x) dx', subText: 'Tích phân hàm phân thức', color: 'border-blue-300 bg-blue-50 text-blue-900', pairId: 1 },
    { text: 'ln|x| + C', subText: 'Họ nguyên hàm tự nhiên', color: 'border-blue-300 bg-blue-50 text-blue-900', pairId: 1 },
    { text: '(sin x)\'', subText: 'Đạo hàm lượng giác', color: 'border-indigo-300 bg-indigo-50 text-indigo-900', pairId: 2 },
    { text: 'cos x', subText: 'Kết quả đạo hàm', color: 'border-indigo-300 bg-indigo-50 text-indigo-900', pairId: 2 },
    { text: 'P = U.I.cosφ', subText: 'Công thức công suất điện', color: 'border-purple-300 bg-purple-50 text-purple-900', pairId: 3 },
    { text: 'Công suất Mạch RLC', subText: 'Ý nghĩa vật lý', color: 'border-purple-300 bg-purple-50 text-purple-900', pairId: 3 },
    { text: 'R-COO-R\'', subText: 'Công thức cấu tạo chung', color: 'border-emerald-300 bg-emerald-50 text-emerald-900', pairId: 4 },
    { text: 'Este Đơn Chức', subText: 'Hợp chất hữu cơ 12', color: 'border-emerald-300 bg-emerald-50 text-emerald-900', pairId: 4 }
  ];

  const startMemoryMatch = () => {
    const shuffled = [...FORMULA_PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({
        id: idx,
        text: item.text,
        subText: item.subText,
        color: item.color,
        matchId: item.pairId,
        flipped: false,
        matched: false
      }));
    setMemoryCards(shuffled);
    setFlippedIndices([]);
    setMemoryMoves(0);
    setMemoryTimer(0);
    setMemoryWon(false);
    setIsMemoryMatchOpen(true);
  };

  // Memory Match Timer
  useEffect(() => {
    let timer: any = null;
    if (isMemoryMatchOpen && !memoryWon) {
      timer = setInterval(() => {
        setMemoryTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMemoryMatchOpen, memoryWon]);

  const handleFlipCard = (index: number) => {
    if (flippedIndices.length >= 2) return;
    if (memoryCards[index].flipped || memoryCards[index].matched) return;

    playFxSound('flip');
    const newCards = [...memoryCards];
    newCards[index].flipped = true;
    setMemoryCards(newCards);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves(m => m + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      if (newCards[firstIdx].matchId === newCards[secondIdx].matchId) {
        // Matched!
        setTimeout(() => {
          playFxSound('correct');
          newCards[firstIdx].matched = true;
          newCards[secondIdx].matched = true;
          setMemoryCards([...newCards]);
          setFlippedIndices([]);

          if (newCards.every(c => c.matched)) {
            setMemoryWon(true);
            playFxSound('win');
            const u = api.getUser();
            if (u && u.profile) {
              u.profile.solved_problems = (u.profile.solved_problems !== undefined ? u.profile.solved_problems : 342) + 1;
              api.setUser(u);
              setProfile({ ...u.profile });
            }
          }
        }, 450);
      } else {
        setTimeout(() => {
          newCards[firstIdx].flipped = false;
          newCards[secondIdx].flipped = false;
          setMemoryCards([...newCards]);
          setFlippedIndices([]);
        }, 850);
      }
    }
  };

  // --- 3. AI Trap Hunter Handlers & Data ---
  const TRAP_HUNTER_STAGES = [
    {
      id: 1,
      title: 'Ải 01: Tích Phân Hàm Ẩn (Đề Chuyên KHTN 2025)',
      subject: 'Toán học 12',
      badge: '9.0+ Vận Dụng Cao',
      prompt: 'Tìm nghiệm của hàm số thỏa mãn phương trình: f\'(x) - 2x · f(x) = 0 với f(0) = 1.',
      steps: [
        {
          stepNum: 1,
          title: 'Bước 1: Chia cả hai vế cho f(x)',
          content: 'f\'(x) / f(x) = 2x.',
          isTrap: true,
          trapExplanation: '🚨 CẠM BẪY NGUY HIỂM: Thí sinh chia cả hai vế cho f(x) nhưng chưa chứng minh f(x) ≠ 0! Nếu phương trình có nghiệm f(x) = 0 thì sẽ bị sót nghiệm hoặc sai miền xác định. Trong phòng thi, đây là bẫy trừ điểm oan số 1!'
        },
        {
          stepNum: 2,
          title: 'Bước 2: Lấy nguyên hàm hai vế',
          content: '∫ [f\'(x) / f(x)] dx = ∫ 2x dx ⟹ ln|f(x)| = x² + C.',
          isTrap: false,
          trapExplanation: 'Phép lấy nguyên hàm hai vế hoàn toàn đúng định lý vi phân.'
        },
        {
          stepNum: 3,
          title: 'Bước 3: Dùng giả thiết f(0) = 1 để tìm C',
          content: 'Thay x = 0: ln|1| = 0 + C ⟹ C = 0 ⟹ f(x) = e^(x²).',
          isTrap: false,
          trapExplanation: 'Tính hằng số C và kết luận nghiệm giải tích chính xác.'
        }
      ]
    },
    {
      id: 2,
      title: 'Ải 02: Mạch Điện Xoay Chiều RLC (Đề Chuyên Chu Văn An)',
      subject: 'Vật lý 12',
      badge: '8.8+ Cực Trị Điện',
      prompt: 'Mạch điện RLC gồm điện trở R, cuộn dây có điện trở trong r và tụ điện C. Tính công suất tỏa nhiệt P khi xảy ra cộng hưởng.',
      steps: [
        {
          stepNum: 1,
          title: 'Bước 1: Tính tổng trở toàn mạch',
          content: 'Z = √[R² + (ZL - ZC)²] với ZL = ωL, ZC = 1/(ωC).',
          isTrap: true,
          trapExplanation: '🚨 CẠM BẪY TỬ THẦN: Cuộn dây CÓ ĐIỆN TRỞ TRONG r! Công thức tổng trở đúng bắt buộc phải là Z = √[(R + r)² + (ZL - ZC)²]. Bỏ quên r là cạm bẫy kinh điển khiến hơn 60% học sinh mất điểm!'
        },
        {
          stepNum: 2,
          title: 'Bước 2: Xác định điều kiện cộng hưởng',
          content: 'Cộng hưởng xảy ra khi ZL = ZC ⟺ ω²LC = 1.',
          isTrap: false,
          trapExplanation: 'Điều kiện triệt tiêu cảm kháng và dung kháng chuẩn xác.'
        },
        {
          stepNum: 3,
          title: 'Bước 3: Tính công suất toàn mạch',
          content: 'P_max = U² / (R + r).',
          isTrap: false,
          trapExplanation: 'Công thức công suất khi có điện trở trong r hoàn toàn chuẩn.'
        }
      ]
    },
    {
      id: 3,
      title: 'Ải 03: Thủy Phân Este Của Phenol (Đề Chuyên Lê Hồng Phong)',
      subject: 'Hóa học 12',
      badge: '9.2+ Este Nâng Cao',
      prompt: 'Thủy phân 0.1 mol phenyl axetat (CH₃COOC₆H₅) bằng dung dịch NaOH dư. Xác định số mol NaOH phản ứng và sản phẩm thu được.',
      steps: [
        {
          stepNum: 1,
          title: 'Bước 1: Xác định cấu tạo phân tử',
          content: 'Phenyl axetat là este của phenol có công thức CH₃COOC₆H₅.',
          isTrap: false,
          trapExplanation: 'Xác định gốc axetat và phenyl hoàn toàn chính xác.'
        },
        {
          stepNum: 2,
          title: 'Bước 2: Viết phương trình phản ứng với NaOH',
          content: 'CH₃COOC₆H₅ + NaOH ⟶ CH₃COONa + C₆H₅OH (Tỉ lệ 1:1, sinh ra muối natri axetat và phenol).',
          isTrap: true,
          trapExplanation: '🚨 CẠM BẪY HÓA HỌC CHẾT NGƯỜI: Đây là este của phenol! Phản ứng với NaOH theo tỉ lệ 1:2: CH₃COOC₆H₅ + 2NaOH ⟶ CH₃COONa + C₆H₅ONa + H₂O. Sản phẩm là 2 MUỐI và NƯỚC, KHÔNG BAO GIỜ sinh ra phenol tự do!'
        },
        {
          stepNum: 3,
          title: 'Bước 3: Tính toán khối lượng muối',
          content: 'Khối lượng muối = m(CH₃COONa) + m(C₆H₅ONa) = 0.1×82 + 0.1×116 = 19.8 gam.',
          isTrap: false,
          trapExplanation: 'Bước tính bảo toàn khối lượng chính xác theo phương trình đúng.'
        }
      ]
    }
  ];

  const startTrapHunter = () => {
    setTrapStageIndex(0);
    setSelectedTrapStep(null);
    setTrapRevealed(false);
    setTrapScore(0);
    setTrapFinished(false);
    setIsTrapHunterOpen(true);
  };

  const handleSelectTrapStep = (stepIdx: number) => {
    if (trapRevealed) return;
    setSelectedTrapStep(stepIdx);
    setTrapRevealed(true);

    const stage = TRAP_HUNTER_STAGES[trapStageIndex];
    const isTrap = stage.steps[stepIdx].isTrap;

    if (isTrap) {
      playFxSound('trap');
      setTrapScore(s => s + 1);
    } else {
      playFxSound('wrong');
    }
  };

  const handleNextTrapStage = () => {
    if (trapStageIndex + 1 < TRAP_HUNTER_STAGES.length) {
      setTrapStageIndex(i => i + 1);
      setSelectedTrapStep(null);
      setTrapRevealed(false);
    } else {
      setTrapFinished(true);
      playFxSound('win');

      const u = api.getUser();
      if (u && u.profile) {
        u.profile.solved_problems = (u.profile.solved_problems !== undefined ? u.profile.solved_problems : 342) + 2;
        api.setUser(u);
        setProfile({ ...u.profile });
      }
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'pending') return t.status === 'pending';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const daysRemaining = syncedRoadmap?.daysLeft || 88;
  const currentExamTarget = syncedRoadmap?.targetScore || profile?.target_score || '27.5+';
  const currentSchool = profile?.school || (syncedRoadmap?.targetExam ? `Mục tiêu ${syncedRoadmap.targetExam}` : 'THPT Chu Văn An');
  const studentName = profile?.full_name || initialUser?.full_name || 'Minh Béo';

  // Roadmap name for AI Badge
  const roadmapName = syncedRoadmap?.title || 'Chiến Lược 90 Ngày Nước Rút THPT Quốc Gia (Khối A00)';

  return (
    <div className="flex-1 bg-slate-50 py-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome & Target Countdown Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl text-white p-6 sm:p-8 shadow-lg shadow-blue-500/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-blue-100">
                <span>⏳ Còn {daysRemaining} ngày đến kỳ thi mục tiêu</span>
                <span>•</span>
                <span>Mục tiêu: {currentExamTarget} ({currentSchool})</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                Chào {studentName}! Hôm nay bạn có {tasks.length - completedCount} bài tập cần hoàn thành.
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
                Kế hoạch học tập được AI tối ưu hóa theo trình độ {profile?.current_level || 'Khá Giỏi (8.0+)'}. Hoàn thành các nhiệm vụ hôm nay để duy trì chuỗi Streak!
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => onNavigate('roadmap')}
                className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Xem lộ trình chi tiết</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onNavigate('chat')}
                className="flex items-center gap-2 bg-blue-800/80 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold text-xs border border-white/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Hỏi Cố vấn AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPI Cards Grid - ĐỒNG BỘ CHUẨN XÁC 100% VỚI ẢNH 1 VÀ TẤT CẢ CÁC TRANG */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Thời gian tuần này */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Thời gian tuần này</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                {profile?.study_hours !== undefined ? profile.study_hours : 28.5}
              </span>
              <span className="text-xs font-medium text-slate-500">Giờ</span>
              <span className="ml-auto text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                Thời gian thực
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Tích lũy khi hoàn thành các bài tập
            </div>
          </div>

          {/* Card 2: Điểm TB Mock Test */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Điểm TB Mock Test</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                {profile?.avg_score ? profile.avg_score : 8.8}
              </span>
              <span className="text-xs font-medium text-slate-500">/ 10</span>
              <span className="ml-auto text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Mục tiêu
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Sẵn sàng cho bài kiểm tra đầu tiên
            </div>
          </div>

          {/* Card 3: Bài tập đã giải */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Bài tập đã giải</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                {profile?.solved_problems !== undefined ? profile.solved_problems : 342}
              </span>
              <span className="text-xs font-medium text-slate-500">Bài</span>
              <span className="ml-auto text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                +1/bài tick
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              {completedCount} bài hoàn thành hôm nay
            </div>
          </div>

          {/* Card 4: Kỷ luật học tập */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Kỷ luật học tập</span>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                {profile?.streak_days !== undefined ? profile.streak_days : 14}
              </span>
              <span className="text-xs font-medium text-slate-500">Ngày streak 🔥</span>
              <span className="ml-auto text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                Khởi đầu tốt!
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Duy trì liên tục để nhận huy hiệu Cố vấn
            </div>
          </div>
        </div>

        {/* Sync Toast Notification */}
        {showSyncToast && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center justify-between animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>AI đã tối ưu hóa thành công!</strong> 4 nhiệm vụ hôm nay đã được cập nhật bám sát Lộ trình: <strong>{roadmapName}</strong>.
              </span>
            </div>
            <button onClick={() => setShowSyncToast(false)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Split Grid (65% / 35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (65% -> 8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Daily Action Tasks - NHIỆM VỤ DO AI TẠO RA BÁM SÁT LỘ TRÌNH */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Nhiệm vụ &amp; Bài tập hôm nay</span>
                    <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {completedCount}/{tasks.length} Hoàn thành
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tích chọn để lưu tiến trình vào cơ sở dữ liệu học tập cá nhân
                  </p>
                  
                  {/* AI Roadmap Badge */}
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50/80 text-indigo-700 border border-indigo-200/70">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    <span>Nhiệm vụ do AI tạo ra từ Lộ trình: <strong>{roadmapName}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
                    <button 
                      onClick={() => setTaskFilter('all')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${taskFilter === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'hover:text-slate-900'}`}
                    >
                      Tất cả
                    </button>
                    <button 
                      onClick={() => setTaskFilter('pending')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${taskFilter === 'pending' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'hover:text-slate-900'}`}
                    >
                      Chưa xong
                    </button>
                    <button 
                      onClick={() => setTaskFilter('completed')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${taskFilter === 'completed' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'hover:text-slate-900'}`}
                    >
                      Đã xong
                    </button>
                  </div>

                  {/* AI Sync Tasks from Roadmap Button */}
                  <button
                    onClick={handleAIGenerateRoadmapTasks}
                    disabled={isGeneratingTasks}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    title="AI phân tích Lộ trình hiện tại và tự động sinh 4 nhiệm vụ hôm nay"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isGeneratingTasks ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingTasks ? 'AI đang quét...' : 'AI Đồng bộ Lộ trình'}</span>
                  </button>

                  {/* Add Custom Task Button */}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                    title="Thêm bài tập tự luyện"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Thêm bài</span>
                  </button>
                </div>
              </div>

              {/* Task Items */}
              <div className="space-y-3">
                {filteredTasks.map(task => {
                  const isDone = task.status === 'completed';
                  return (
                    <div 
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                        isDone 
                          ? 'bg-slate-50/70 border-slate-200 text-slate-400' 
                          : 'bg-white border-slate-200/90 hover:border-blue-300 shadow-xs'
                      }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}} // Handled by div onClick
                        className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {task.title}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {task.subject}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            task.difficulty === 'Vận dụng cao' 
                              ? 'bg-rose-50 text-rose-700' 
                              : task.difficulty === 'Khó'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {task.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.duration}
                            </span>
                            {task.score && (
                              <span className="text-emerald-600 font-semibold">{task.score}</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              studySyncService.setNavigationIntent({
                                topicTitle: task.title,
                                subject: task.subject,
                                tab: 'practice',
                                initialPrompt: `Chào Cố vấn AI! Em muốn được hướng dẫn và luyện tập nhiệm vụ theo Lộ trình: ${task.title} (${task.subject}). Hãy bắt đầu bằng tóm tắt phương pháp giải Socratic và câu hỏi mẫu!`
                              });
                              onNavigate('chat', `Chào Cố vấn AI! Em muốn được hướng dẫn và luyện tập nhiệm vụ theo Lộ trình: ${task.title} (${task.subject}). Hãy bắt đầu bằng tóm tắt phương pháp giải Socratic và câu hỏi mẫu!`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            <span>Luyện cùng AI</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* GAMIFICATION HUB - GỢI Ý TRÒ CHƠI ÔN LUYỆN & ĐẤU TRƯỜNG TRÍ TUỆ */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-purple-500/20">
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 font-serif">
                        Đấu Trường Trí Tuệ &amp; Trò Chơi Ôn Luyện
                      </h3>
                      <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold border border-purple-200 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        Gamification Hub
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Rèn luyện phản xạ công thức, né cạm bẫy phòng thi và nhận thêm XP, chuỗi Streak mỗi ngày
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsArcadeModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Mở Arcade 2D</span>
                  </button>
                </div>
              </div>

              {/* Main Banner: 2D Arcade Game */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-5 sm:p-6 text-white shadow-md">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[11px] font-semibold text-indigo-300">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>Đấu Trường 2D Chinh Phục Cột Mốc Lộ Trình</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold font-serif text-white">
                      Trò chơi né cạm bẫy phòng thi &amp; Thu thập Ngọc Tri thức
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Điều khiển tàu vũ trụ vượt qua các bẫy đề thi hiểm hóc (Bẫy ĐKXĐ, Bẫy biến thiên, Bẫy Casio) để giải phóng các huy hiệu học thuật và nhận +50 XP!
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => setIsArcadeModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Chơi Arcade Ngay</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Quick Mini-Game Suggestions Cards - Gamified Aesthetic Design */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Game 1: Speed Duel 60s */}
                <div className="group relative rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />
                  
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5 fill-white" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 text-[10px] font-extrabold uppercase tracking-wide border border-amber-300 flex items-center gap-1 animate-pulse">
                        🔥 CỰC HOT • 60 GIÂY
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-900 transition-colors flex items-center gap-1.5">
                        ⚡ Đấu Trường Phản Xạ 60s
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        Phản xạ tốc độ cao 5 câu công thức cốt lõi Toán - Lý - Hóa. Rèn luyện tư duy chớp nhoáng chuẩn phòng thi!
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-amber-700 pt-1">
                      <span className="flex items-center gap-1 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                        <Sparkles className="w-3 h-3 text-amber-600" /> +50 XP
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-medium">1,280 sĩ tử đang đấu</span>
                    </div>
                  </div>

                  <button
                    onClick={startSpeedQuiz}
                    className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 relative z-10"
                  >
                    <Timer className="w-4 h-4" />
                    <span>THỬ THÁCH 60S NGAY</span>
                  </button>
                </div>

                {/* Game 2: Formula Memory Match */}
                <div className="group relative rounded-2xl border-2 border-indigo-300/80 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-indigo-500/15 p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />
                  
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                        <Layers className="w-5 h-5 text-white" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wide border border-indigo-300 flex items-center gap-1">
                        🧠 SIÊU TRÍ NHỚ 3D
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-900 transition-colors flex items-center gap-1.5">
                        🧩 Ghép Đôi Thẻ Tri Thức
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        Lật thẻ bài 3D tìm cặp đôi công thức Toán - Lý - Hóa tương đương. Rèn luyện trí nhớ trực quan và tốc độ nhận diện!
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-700 pt-1">
                      <span className="flex items-center gap-1 bg-indigo-100/80 px-2 py-0.5 rounded-md border border-indigo-200">
                        <Award className="w-3 h-3 text-indigo-600" /> +40 XP
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-medium">8 thẻ lật 3D ma thuật</span>
                    </div>
                  </div>

                  <button
                    onClick={startMemoryMatch}
                    className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 relative z-10"
                  >
                    <Puzzle className="w-4 h-4" />
                    <span>CHƠI GHÉP THẺ 3D</span>
                  </button>
                </div>

                {/* Game 3: Trap Hunter AI */}
                <div className="group relative rounded-2xl border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/15 p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />
                  
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-300 flex items-center gap-1">
                        🤖 AI BOSS BATTLE
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-900 transition-colors flex items-center gap-1.5">
                        🛡️ Vượt Ải Cạm Bẫy Đề Thi
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        AI đưa ra lời giải sai có bẫy tinh vi từ đề Chuyên 2025. Hãy đóng vai Thám tử bắt bẫy và bẻ gãy bẫy phòng thi!
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 pt-1">
                      <span className="flex items-center gap-1 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Trophy className="w-3 h-3 text-emerald-600" /> +60 XP
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-medium">Bẫy đề thi thử 9.0+</span>
                    </div>
                  </div>

                  <button
                    onClick={startTrapHunter}
                    className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 relative z-10"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>SĂN BẪY VỚI AI NGAY</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Subject Mastery Progress Bars */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <h3 className="font-serif text-base font-bold text-slate-900">
                Mức độ nắm vững chuyên đề theo môn học
              </h3>
              <div className="space-y-3">
                {[
                  { subject: 'Toán học (Giải tích 12 & Khảo sát hàm số)', percent: 92, color: 'bg-blue-600' },
                  { subject: 'Vật lý 12 (Dao động cơ & Sóng cơ học)', percent: 84, color: 'bg-indigo-600' },
                  { subject: 'Hóa học 12 (Este & Este đa chức no)', percent: 88, color: 'bg-emerald-600' },
                  { subject: 'Tin học / Đánh giá năng lực (Logic & Số liệu)', percent: 95, color: 'bg-amber-600' }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.subject}</span>
                      <span>{item.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (35% -> 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* AI Diagnosis Warning Card */}
            <div className="bg-gradient-to-b from-amber-50/80 to-white rounded-2xl border border-amber-200/80 p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Cảnh Báo Lỗ Hổng Kiến Thức từ AI
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Phần <span className="font-bold text-amber-900">Vật lý - Sóng ánh sáng (Vân tối &amp; Giao thoa nhiều bức xạ)</span> của bạn có tỷ lệ làm sai đang ở mức <span className="font-bold text-rose-600">32%</span>.
              </p>
              <button
                onClick={() => {
                  studySyncService.setNavigationIntent({
                    topicTitle: 'Giao thoa sóng ánh sáng trắng & Bài toán vân trùng',
                    subject: 'Vật lý 12',
                    exerciseType: 'trap_detect',
                    tab: 'practice',
                    initialPrompt: 'Cô Minerva ơi, giảng giúp em bản chất hiện tượng giao thoa ánh sáng trắng và cách đếm số vân sáng trong khoảng!'
                  });
                  onNavigate('chat', 'Cô Minerva ơi, giảng giúp em bản chất hiện tượng giao thoa ánh sáng trắng và cách đếm số vân sáng trong khoảng!');
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Mở bài học bù kiến thức hổng
              </button>
            </div>

            {/* Quick Ask AI shortcuts */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Lối Tắt Hỏi Cố Vấn Nhanh
              </h3>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => {
                    studySyncService.setNavigationIntent({
                      exerciseType: 'trap_detect',
                      tab: 'practice',
                      initialPrompt: 'Hãy giúp em phân tích các dạng bài hay sai và bẫy đề thi trong đề Chuyên Sư Phạm'
                    });
                    onNavigate('chat', 'Hãy giúp em phân tích các dạng bài hay sai và bẫy đề thi trong đề Chuyên Sư Phạm');
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 transition-colors border border-slate-200/60 cursor-pointer"
                >
                  📌 Dạng bài hay sai nhất trong đề Chuyên Sư Phạm?
                </button>
                <button
                  onClick={() => {
                    studySyncService.setNavigationIntent({
                      tab: 'pomodoro',
                      initialPrompt: 'Lập kế hoạch ôn tập nước rút trong 14 ngày tới cho Khối A00'
                    });
                    onNavigate('chat', 'Lập kế hoạch ôn tập nước rút trong 14 ngày tới cho Khối A00');
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 transition-colors border border-slate-200/60 cursor-pointer"
                >
                  📅 Lập kế hoạch ôn tập 14 ngày cho Khối A00
                </button>
                <button
                  onClick={() => {
                    studySyncService.setNavigationIntent({
                      tab: 'practice',
                      initialPrompt: 'Cách bấm máy tính Casio giải nhanh phương trình vi phân và tích phân'
                    });
                    onNavigate('chat', 'Cách bấm máy tính Casio giải nhanh phương trình vi phân và tích phân');
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 transition-colors border border-slate-200/60 cursor-pointer"
                >
                  ⚡ Mẹo bấm Casio trắc nghiệm Toán 12
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. SPEED BLITZ QUIZ MODAL (60 GIÂY THỬ THÁCH ĐẤU TRƯỜNG) */}
      {/* ========================================================================= */}
      {isSpeedQuizOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-200/90 p-6 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <button 
              onClick={() => setIsSpeedQuizOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="flex items-center justify-between pr-8 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">Đấu Trường Phản Xạ 60s</h3>
                  <p className="text-[11px] text-slate-500">Phản xạ nhanh công thức then chốt phòng thi</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {quizCombo > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-300 animate-bounce">
                    🔥 x{quizCombo} COMBO
                  </span>
                )}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs font-mono shadow-xs ${
                  quizTimer <= 10 
                    ? 'bg-rose-50 border border-rose-300 text-rose-600 animate-pulse' 
                    : 'bg-amber-50 border border-amber-300 text-amber-800'
                }`}>
                  <Timer className="w-3.5 h-3.5" />
                  <span>{quizTimer}s</span>
                </div>
              </div>
            </div>

            {!quizFinished ? (
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Câu {quizIndex + 1}/{SPEED_QUIZ_QUESTIONS.length} • {SPEED_QUIZ_QUESTIONS[quizIndex].subject}
                  </span>
                  <span className="font-bold font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    Điểm: {quizScore}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-amber-50/40 border border-slate-200 text-sm font-semibold text-slate-800 leading-relaxed shadow-xs">
                  {SPEED_QUIZ_QUESTIONS[quizIndex].q}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SPEED_QUIZ_QUESTIONS[quizIndex].options.map((opt, idx) => {
                    let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50/60 shadow-xs';
                    if (selectedAnswer !== null) {
                      if (idx === SPEED_QUIZ_QUESTIONS[quizIndex].correct) {
                        btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-400/30';
                      } else if (idx === selectedAnswer) {
                        btnStyle = 'bg-rose-50 border-rose-300 text-rose-700 line-through';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectQuizAnswer(idx)}
                        disabled={selectedAnswer !== null}
                        className={`p-3 rounded-xl border text-left text-xs font-medium transition-all active:scale-98 cursor-pointer ${btnStyle}`}
                      >
                        <span className="font-bold mr-1.5 text-slate-400 font-mono">{String.fromCharCode(65 + idx)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selectedAnswer !== null && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-relaxed animate-in fade-in">
                    <strong>💡 Bản chất:</strong> {SPEED_QUIZ_QUESTIONS[quizIndex].explanation}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-4 relative z-10">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 font-serif">Hoàn Thành Thử Thách!</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Bạn đã trả lời đúng <strong className="text-emerald-600 font-bold">{quizScore}/{SPEED_QUIZ_QUESTIONS.length}</strong> câu với chuỗi Combo cao nhất: <strong className="text-amber-600">{quizBestCombo}</strong>!
                  </p>
                  <p className="text-xs text-amber-700 font-bold mt-2 bg-amber-50 py-1 px-3 rounded-full inline-block border border-amber-200">
                    🎉 +50 XP và +1 Bài tập đã giải đã được ghi nhận vào hồ sơ cá nhân!
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={startSpeedQuiz}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Chơi Lại</span>
                  </button>
                  <button
                    onClick={() => setIsSpeedQuizOpen(false)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    Xong
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FORMULA MEMORY MATCH 3D MODAL (GHÉP CẶP CÔNG THỨC 3D) */}
      {/* ========================================================================= */}
      {isMemoryMatchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-indigo-200/90 p-6 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />

            <button 
              onClick={() => setIsMemoryMatchOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="flex items-center justify-between pr-8 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">Ghép Đôi Thẻ Tri Thức 3D</h3>
                  <p className="text-[11px] text-slate-500">Lật 2 thẻ bài có công thức &amp; định lý tương đương</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold font-mono">
                  Lượt: {memoryMoves}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-mono">
                  ⏱ {Math.floor(memoryTimer / 60)}:{(memoryTimer % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {!memoryWon ? (
              <div className="grid grid-cols-4 gap-3 py-2 relative z-10">
                {memoryCards.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => handleFlipCard(idx)}
                    className={`h-24 p-2 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center cursor-pointer relative ${
                      card.matched 
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs scale-98 ring-2 ring-emerald-300/40' 
                        : card.flipped 
                          ? `${card.color} shadow-md scale-102 ring-2 ring-indigo-400/40` 
                          : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 hover:border-indigo-400 hover:shadow-md'
                    }`}
                  >
                    {card.flipped || card.matched ? (
                      <div className="space-y-1">
                        <span className="font-mono text-xs font-extrabold block">{card.text}</span>
                        {card.subText && (
                          <span className="text-[9px] text-slate-500 block truncate max-w-[80px]">{card.subText}</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 opacity-70">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        <span className="text-[9px] font-bold text-slate-400 font-mono">THẺ #{idx + 1}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-4 relative z-10">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 font-serif">Tuyệt Vời! Trí Nhớ Đỉnh Cao!</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Hoàn thành trong <strong className="text-indigo-600 font-bold">{memoryMoves} lượt lật</strong> ({memoryTimer} giây)!
                  </p>
                  <div className="flex justify-center gap-1 text-amber-400 my-2 text-lg">
                    <span>★</span>
                    <span>★</span>
                    <span>{memoryMoves <= 10 ? '★' : '☆'}</span>
                  </div>
                  <p className="text-xs text-emerald-700 font-bold mt-2 bg-emerald-50 py-1 px-3 rounded-full inline-block border border-emerald-200">
                    🎉 +40 XP và +1 Bài tập đã giải đã được ghi nhận vào hồ sơ cá nhân!
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={startMemoryMatch}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Chơi Lại</span>
                  </button>
                  <button
                    onClick={() => setIsMemoryMatchOpen(false)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 cursor-pointer"
                  >
                    Xong
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. AI TRAP HUNTER MODAL (VƯỢT ẢI CẠM BẪY ĐỀ THI) */}
      {/* ========================================================================= */}
      {isTrapHunterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-300/90 p-6 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

            <button 
              onClick={() => setIsTrapHunterOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="flex items-center justify-between pr-8 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">Thám Tử Bắt Bẫy Đề Thi 9+</h3>
                  <p className="text-[11px] text-slate-500">Soi lời giải sai tinh vi từ đề thi thử Chuyên 2025</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs font-mono">
                  Ải {trapStageIndex + 1}/{TRAP_HUNTER_STAGES.length}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-bold text-xs font-mono">
                  Điểm: {trapScore}
                </span>
              </div>
            </div>

            {!trapFinished ? (
              <div className="space-y-4 relative z-10">
                {/* Stage Info Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white space-y-2 shadow-sm border border-emerald-800/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-emerald-400">{TRAP_HUNTER_STAGES[trapStageIndex].title}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      {TRAP_HUNTER_STAGES[trapStageIndex].badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-mono">
                    {TRAP_HUNTER_STAGES[trapStageIndex].prompt}
                  </p>
                </div>

                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nhiệm vụ: Bấm chọn BƯỚC CÓ CẠM BẪY NGUY HIỂM NHẤT trong bài làm dưới đây:</span>
                </div>

                {/* Steps Options */}
                <div className="space-y-2.5">
                  {TRAP_HUNTER_STAGES[trapStageIndex].steps.map((step, idx) => {
                    let cardStyle = 'bg-slate-50 hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300';
                    if (trapRevealed) {
                      if (step.isTrap) {
                        cardStyle = 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/40 text-emerald-950 font-bold shadow-xs';
                      } else if (idx === selectedTrapStep) {
                        cardStyle = 'bg-rose-50 border-rose-300 text-rose-800';
                      } else {
                        cardStyle = 'bg-slate-50 border-slate-200 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectTrapStep(idx)}
                        disabled={trapRevealed}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all active:scale-98 cursor-pointer ${cardStyle}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{step.title}</span>
                          {trapRevealed && step.isTrap && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                              <CheckCircle2 className="w-3 h-3" /> CẠM BẪY TẠI ĐÂY!
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-700 mt-1.5">{step.content}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Banner when Revealed */}
                {trapRevealed && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-xs text-amber-950 space-y-2 animate-in fade-in">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Phân Tích Cạm Bẫy Từ Cố Vấn AI Minerva:</span>
                    </div>
                    <p className="leading-relaxed text-[11px]">
                      {TRAP_HUNTER_STAGES[trapStageIndex].steps.find(s => s.isTrap)?.trapExplanation}
                    </p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleNextTrapStage}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{trapStageIndex + 1 < TRAP_HUNTER_STAGES.length ? 'Chinh Phục Ải Kế Tiếp' : 'Xem Kết Quả Thám Tử'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-4 relative z-10">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 font-serif">🏆 Xuất Sắc Bắt Trọn Cạm Bẫy!</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Bạn đã chỉ ra đúng <strong className="text-emerald-600 font-bold">{trapScore}/{TRAP_HUNTER_STAGES.length}</strong> cạm bẫy từ các đề thi chuyên!
                  </p>
                  <p className="text-xs text-emerald-800 font-bold mt-2 bg-emerald-50 py-1.5 px-4 rounded-full inline-block border border-emerald-200">
                    🎉 +60 XP và danh hiệu "Thám Tử Bắt Bẫy 9+" đã được ghi nhận vào hồ sơ!
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={startTrapHunter}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Luyện Lại</span>
                  </button>
                  <button
                    onClick={() => setIsTrapHunterOpen(false)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    Xong
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ROADMAP ARCADE MODAL 2D (ĐẤU TRƯỜNG CHINH PHỤC CỘT MỐC) */}
      {/* ========================================================================= */}
      <RoadmapArcadeModal
        isOpen={isArcadeModalOpen}
        onClose={() => setIsArcadeModalOpen(false)}
        targetSchool={profile?.school || (syncedRoadmap as any)?.targetSchool || 'ĐH Ngoại Thương / Bách Khoa'}
        targetScore={profile?.target_score || syncedRoadmap?.targetScore || '27.5+'}
        targetSubject={profile?.focus_subjects?.[0] || 'Toán học'}
        unlockedBadges={[]}
        onUnlockBadge={(badgeId) => {
          const u = api.getUser();
          if (u && u.profile) {
            u.profile.solved_problems = (u.profile.solved_problems !== undefined ? u.profile.solved_problems : 342) + 1;
            api.setUser(u);
            setProfile({ ...u.profile });
          }
        }}
        onBonusExerciseSolved={() => {
          const u = api.getUser();
          if (u && u.profile) {
            u.profile.solved_problems = (u.profile.solved_problems !== undefined ? u.profile.solved_problems : 342) + 1;
            api.setUser(u);
            setProfile({ ...u.profile });
          }
        }}
      />

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Thêm Bài Tập Mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên bài tập / Chuyên đề</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ví dụ: Ôn 10 câu hình không gian Oxyz"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Môn học</label>
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Tin học">Tin học</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Độ khó</label>
                  <select
                    value={newTaskDifficulty}
                    onChange={(e) => setNewTaskDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thời gian dự kiến</label>
                <input
                  type="text"
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(e.target.value)}
                  placeholder="Ví dụ: 30 phút"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Lưu bài tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
