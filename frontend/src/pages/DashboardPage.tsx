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

  // Speed Quiz 60s State
  const [quizTimer, setQuizTimer] = useState(60);
  const [quizActive, setQuizActive] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Memory Match State
  const [memoryCards, setMemoryCards] = useState<Array<{ id: number; text: string; matchId: number; flipped: boolean; matched: boolean }>>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryWon, setMemoryWon] = useState(false);

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

  // --- Speed Blitz Quiz 60s Handlers ---
  const SPEED_QUIZ_QUESTIONS = [
    {
      q: 'Nguyên hàm của hàm số f(x) = 1/x trên khoảng (0, +∞) là gì?',
      options: ['ln(x) + C', '-1/x² + C', 'e^x + C', '1/x² + C'],
      correct: 0,
      subject: 'Toán học'
    },
    {
      q: 'Công thức tính chu kỳ dao động điều hòa của con lắc lò xo là:',
      options: ['T = 2π√(k/m)', 'T = 2π√(m/k)', 'T = 1/(2π)√(m/k)', 'T = 2π√(l/g)'],
      correct: 1,
      subject: 'Vật lý 12'
    },
    {
      q: 'Công thức phân tử tổng quát của Este no, đơn chức, mạch hở là:',
      options: ['CnH2nO2 (n ≥ 2)', 'CnH2n-2O2 (n ≥ 3)', 'CnH2n+2O (n ≥ 1)', 'CnH2nO (n ≥ 1)'],
      correct: 0,
      subject: 'Hóa học 12'
    },
    {
      q: 'Thể tích của khối chóp có diện tích đáy B và chiều cao h là:',
      options: ['V = B.h', 'V = 1/3 B.h', 'V = 1/2 B.h', 'V = 4/3 B.h'],
      correct: 1,
      subject: 'Toán học'
    },
    {
      q: 'Hiện tượng cộng hưởng điện trong mạch RLC nối tiếp xảy ra khi:',
      options: ['ωL = 1/(ωC)', 'ωL = ωC', 'R = ωL', 'R = 1/(ωC)'],
      correct: 0,
      subject: 'Vật lý 12'
    }
  ];

  const startSpeedQuiz = () => {
    setQuizTimer(60);
    setQuizScore(0);
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
      setQuizScore(s => s + 1);
    }

    setTimeout(() => {
      if (quizIndex + 1 < SPEED_QUIZ_QUESTIONS.length) {
        setQuizIndex(i => i + 1);
        setSelectedAnswer(null);
      } else {
        setQuizFinished(true);
        setQuizActive(false);

        // Thưởng điểm và bài tập đã giải vào profile
        const u = api.getUser();
        if (u && u.profile) {
          u.profile.solved_problems = (u.profile.solved_problems !== undefined ? u.profile.solved_problems : 342) + 1;
          api.setUser(u);
          setProfile({ ...u.profile });
        }
      }
    }, 800);
  };

  // --- Formula Memory Match Handlers ---
  const FORMULA_PAIRS = [
    { text: '∫ (1/x) dx', pairId: 1 },
    { text: 'ln|x| + C', pairId: 1 },
    { text: '(sin x)\'', pairId: 2 },
    { text: 'cos x', pairId: 2 },
    { text: 'P = U.I.cosφ', pairId: 3 },
    { text: 'Công suất RLC', pairId: 3 },
    { text: 'R-COO-R\'', pairId: 4 },
    { text: 'Este Đơn Chức', pairId: 4 }
  ];

  const startMemoryMatch = () => {
    const shuffled = [...FORMULA_PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({
        id: idx,
        text: item.text,
        matchId: item.pairId,
        flipped: false,
        matched: false
      }));
    setMemoryCards(shuffled);
    setFlippedIndices([]);
    setMemoryWon(false);
    setIsMemoryMatchOpen(true);
  };

  const handleFlipCard = (index: number) => {
    if (flippedIndices.length >= 2) return;
    if (memoryCards[index].flipped || memoryCards[index].matched) return;

    const newCards = [...memoryCards];
    newCards[index].flipped = true;
    setMemoryCards(newCards);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      const [firstIdx, secondIdx] = nextFlipped;
      if (newCards[firstIdx].matchId === newCards[secondIdx].matchId) {
        // Matched!
        setTimeout(() => {
          newCards[firstIdx].matched = true;
          newCards[secondIdx].matched = true;
          setMemoryCards([...newCards]);
          setFlippedIndices([]);

          // Check win condition
          if (newCards.every(c => c.matched)) {
            setMemoryWon(true);
            const u = api.getUser();
            if (u && u.profile) {
              u.profile.solved_problems = (u.profile.solved_problems !== undefined ? u.profile.solved_problems : 342) + 1;
              api.setUser(u);
              setProfile({ ...u.profile });
            }
          }
        }, 500);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          newCards[firstIdx].flipped = false;
          newCards[secondIdx].flipped = false;
          setMemoryCards([...newCards]);
          setFlippedIndices([]);
        }, 900);
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

              {/* 3 Quick Mini-Game Suggestions Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Game 1: Speed Duel 60s */}
                <div className="rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white p-4 space-y-3 hover:border-amber-300 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-amber-600" />
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">
                      ⚡ Đấu Trường 60s (Speed Blitz)
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Phản xạ nhanh 5 câu trắc nghiệm công thức cốt lõi trong 60 giây. Thắng nhận +30 XP!
                    </p>
                  </div>
                  <button
                    onClick={startSpeedQuiz}
                    className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Thử Thách 60s</span>
                  </button>
                </div>

                {/* Game 2: Formula Memory Match */}
                <div className="rounded-xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/50 to-white p-4 space-y-3 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Puzzle className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">
                      🧩 Ghép Đôi Công Thức
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Lật thẻ tìm cặp đôi công thức Toán - Lý - Hóa tương đương. Rèn luyện trí nhớ trực quan.
                    </p>
                  </div>
                  <button
                    onClick={startMemoryMatch}
                    className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Chơi Ghép Thẻ</span>
                  </button>
                </div>

                {/* Game 3: Trap Hunter AI */}
                <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white p-4 space-y-3 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">
                      🛡️ Vượt Ải Cạm Bẫy Đề Thi
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      AI đưa ra lời giải sai có bẫy tinh vi từ đề Chuyên 2025. Nhiệm vụ của bạn là chỉ ra điểm bẫy!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      studySyncService.setNavigationIntent({
                        exerciseType: 'trap_detect',
                        tab: 'practice',
                        initialPrompt: 'Cô Minerva ơi, hãy đố em một câu hỏi có cạm bẫy phòng thi hay gặp nhất trong đề thi thử THPT Quốc Gia năm 2025!'
                      });
                      onNavigate('chat', 'Cô Minerva ơi, hãy đố em một câu hỏi có cạm bẫy phòng thi hay gặp nhất trong đề thi thử THPT Quốc Gia năm 2025!');
                    }}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Săn Bẫy Với AI</span>
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
      {/* 1. SPEED BLITZ QUIZ MODAL (60 GIÂY THỬ THÁCH) */}
      {/* ========================================================================= */}
      {isSpeedQuizOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 relative">
            <button 
              onClick={() => setIsSpeedQuizOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">Đấu Trường Phản Xạ 60s</h3>
                  <p className="text-[11px] text-slate-500">Trả lời nhanh 5 công thức cốt lõi</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs">
                <Timer className="w-3.5 h-3.5" />
                <span>{quizTimer}s</span>
              </div>
            </div>

            {!quizFinished ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Câu hỏi {quizIndex + 1}/{SPEED_QUIZ_QUESTIONS.length} ({SPEED_QUIZ_QUESTIONS[quizIndex].subject})</span>
                  <span className="font-bold text-emerald-600">Điểm: {quizScore}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800">
                  {SPEED_QUIZ_QUESTIONS[quizIndex].q}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SPEED_QUIZ_QUESTIONS[quizIndex].options.map((opt, idx) => {
                    let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/40';
                    if (selectedAnswer !== null) {
                      if (idx === SPEED_QUIZ_QUESTIONS[quizIndex].correct) {
                        btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                      } else if (idx === selectedAnswer) {
                        btnStyle = 'bg-rose-50 border-rose-300 text-rose-700 line-through';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectQuizAnswer(idx)}
                        disabled={selectedAnswer !== null}
                        className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${btnStyle}`}
                      >
                        <span className="font-bold mr-1.5">{String.fromCharCode(65 + idx)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 font-serif">Hoàn Thành Thử Thách!</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Bạn đã trả lời đúng <strong className="text-emerald-600 font-bold">{quizScore}/{SPEED_QUIZ_QUESTIONS.length}</strong> câu trong thời gian quy định!
                  </p>
                  <p className="text-xs text-amber-700 font-semibold mt-2">
                    🎉 +30 XP và +1 Bài tập đã giải đã được cộng vào hồ sơ cá nhân của bạn!
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={startSpeedQuiz}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Chơi Lại</span>
                  </button>
                  <button
                    onClick={() => setIsSpeedQuizOpen(false)}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
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
      {/* 2. FORMULA MEMORY MATCH MODAL (GHÉP CẶP CÔNG THỨC) */}
      {/* ========================================================================= */}
      {isMemoryMatchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 relative">
            <button 
              onClick={() => setIsMemoryMatchOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Puzzle className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">Ghép Đôi Thẻ Tri Thức</h3>
                <p className="text-[11px] text-slate-500">Lật 2 thẻ bài có công thức và định nghĩa tương đương</p>
              </div>
            </div>

            {!memoryWon ? (
              <div className="grid grid-cols-4 gap-2.5 py-2">
                {memoryCards.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => handleFlipCard(idx)}
                    className={`h-24 p-2 rounded-2xl border text-center text-xs font-semibold transition-all flex items-center justify-center ${
                      card.matched 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-70' 
                        : card.flipped 
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs' 
                          : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-400 hover:border-indigo-300 cursor-pointer'
                    }`}
                  >
                    {card.flipped || card.matched ? (
                      <span className="font-mono text-xs">{card.text}</span>
                    ) : (
                      <HelpCircle className="w-5 h-5 opacity-40" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 font-serif">Tuyệt Vời! Trí Nhớ Đỉnh Cao!</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Bạn đã ghép thành công tất cả 4 cặp công thức thi THPT Quốc Gia!
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold mt-2">
                    🎉 +30 XP và +1 Bài tập đã giải đã được cộng vào hồ sơ cá nhân!
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={startMemoryMatch}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Chơi Lại</span>
                  </button>
                  <button
                    onClick={() => setIsMemoryMatchOpen(false)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
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
