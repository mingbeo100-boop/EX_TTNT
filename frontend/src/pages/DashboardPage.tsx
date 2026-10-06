import React, { useState, useEffect } from 'react';
import { PageType, TaskItem, UserProfile } from '../types';
import { api } from '../services/api';
import { studySyncService } from '../services/studySyncService';
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
  X
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: PageType, initialPrompt?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  // New task modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Toán học');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState('Trung bình');
  const [newTaskDuration, setNewTaskDuration] = useState('30 phút');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = api.getUser();
    const prof = await api.getProfile(user?.id);
    if (prof) setProfile(prof);

    const taskList = await api.getTasks(user?.id);
    if (taskList && taskList.length > 0) {
      setTasks(taskList);
    } else {
      // Default initial tasks starting from pending
      setTasks([
        { id: '1', title: 'Luyện lại câu 48 Chuyên Sư Phạm: Tích phân hàm ẩn', subject: 'Toán học', difficulty: 'Khó', duration: '30 phút', status: 'pending', score: '+35 XP' },
        { id: '2', title: 'Làm 5 bài tập tương tự: Hàm ẩn đề Chuyên Lam Sơn 2024', subject: 'Toán học', difficulty: 'Vận dụng cao', duration: '45 phút', status: 'pending', score: '+40 XP' },
        { id: '3', title: 'Chuyên đề Giao thoa Ánh sáng trắng & bài toán vân trùng', subject: 'Vật lý 12', difficulty: 'Trung bình', duration: '40 phút', status: 'pending', score: '+25 XP' },
        { id: '4', title: 'Đề thi thử Mock Test Chuẩn hóa Đợt 2 Khối A00', subject: 'Tổng hợp', difficulty: 'Khó', duration: '90 phút', status: 'pending', score: '+50 XP' }
      ]);
    }
  };

  const toggleTask = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const nextStatus = target.status === 'completed' ? 'pending' : 'completed';

    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));

    // Call API
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

    setTasks(prev => [created, ...prev]);
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'pending') return t.status === 'pending';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="flex-1 bg-slate-50 py-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome & Target Countdown Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl text-white p-6 sm:p-8 shadow-lg shadow-blue-500/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-blue-100">
                <span>⏳ Còn 88 ngày đến kỳ thi mục tiêu</span>
                <span>•</span>
                <span>Mục tiêu: {profile?.target_score || '27.5+'} ({profile?.school || 'Chưa cập nhật'})</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                Chào {profile?.full_name || 'Học viên'}! Hôm nay bạn có {tasks.length - completedCount} bài tập cần hoàn thành.
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
                Kế hoạch học tập được AI tối ưu hóa theo trình độ {profile?.current_level || 'Chuẩn bị thi'}. Hoàn thành các nhiệm vụ hôm nay để duy trì chuỗi Streak!
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

        {/* 4 KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Thời gian tuần này</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                {profile?.study_hours ?? 0.0}
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

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Điểm TB Mock Test</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                {profile?.avg_score ? profile.avg_score : '--'}
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

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Bài tập đã giải</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                {profile?.solved_problems ?? 0}
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

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Kỷ luật học tập</span>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                {profile?.streak_days ?? 1}
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

        {/* Main Split Grid (65% / 35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (65% -> 8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Daily Action Tasks */}
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
                </div>

                <div className="flex items-center gap-2">
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

                  {/* Add Task Button */}
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
                                initialPrompt: `Chào Cố vấn AI! Em muốn được hướng dẫn và luyện tập nhiệm vụ: ${task.title} (${task.subject}). Hãy bắt đầu bằng tóm tắt phương pháp và câu hỏi mẫu!`
                              });
                              onNavigate('chat', `Chào Cố vấn AI! Em muốn được hướng dẫn và luyện tập nhiệm vụ: ${task.title} (${task.subject}). Hãy bắt đầu bằng tóm tắt phương pháp và câu hỏi mẫu!`);
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
