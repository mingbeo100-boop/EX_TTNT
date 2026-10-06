import React, { useState, useEffect } from 'react';
import { PageType, AdminStats, AdminUserItem, AdminAccessLogItem, AdminOtpItem } from '../types';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Database, 
  Users, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Key, 
  Lock, 
  LogOut, 
  RefreshCw, 
  Search, 
  Copy, 
  Check, 
  ArrowLeft,
  FileText,
  Server,
  Layers,
  Sparkles,
  Eye,
  AlertCircle
} from 'lucide-react';

interface AdminPageProps {
  onNavigate: (page: PageType) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  // Auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Dashboard state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [logs, setLogs] = useState<AdminAccessLogItem[]>([]);
  const [otps, setOtps] = useState<AdminOtpItem[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'otps' | 'schema'>('users');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedDbPath, setCopiedDbPath] = useState<boolean>(false);

  useEffect(() => {
    const token = api.getAdminToken();
    if (token) {
      setIsAdminAuthenticated(true);
      fetchAdminData();
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await api.adminLogin(password, username);
      if (res.ok) {
        setIsAdminAuthenticated(true);
        fetchAdminData();
      } else {
        setLoginError(res.message);
      }
    } catch {
      setLoginError('Lỗi kết nối máy chủ quản trị.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    api.clearAdminToken();
    setIsAdminAuthenticated(false);
    setStats(null);
    setUsers([]);
    setLogs([]);
    setOtps([]);
  };

  const fetchAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [statsData, usersData, logsData, otpsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminLogs(150),
        api.getAdminOtps(100)
      ]);
      setStats(statsData);
      setUsers(usersData);
      setLogs(logsData);
      setOtps(otpsData);
    } catch (err) {
      console.error('Lỗi tải dữ liệu quản trị:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const copyDbPath = () => {
    if (stats?.database.location) {
      navigator.clipboard.writeText(stats.database.location);
      setCopiedDbPath(true);
      setTimeout(() => setCopiedDbPath(false), 2500);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.school?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    l.path?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.ip_address?.includes(searchQuery) ||
    (l.user_email && l.user_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ==========================================
  // VIEW 1: ADMIN LOGIN SCREEN
  // ==========================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-900 text-slate-100">
        <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle glowing background orb */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Hệ Thống Quản Trị</h1>
            <p className="text-sm text-slate-400 mt-1">Đăng nhập tài khoản Admin để truy cập Database & Lượt truy cập</p>
          </div>

          {/* Error Banner */}
          {loginError && (
            <div className="mb-6 p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 relative">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tài khoản Quản trị
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="admin"
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Mật khẩu Quản trị
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="admin123@eduadvisor"
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-slate-950/60 border border-slate-700/60 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
              <div>
                <p className="font-semibold text-slate-300">Khu vực bảo mật cấp cao:</p>
                <p className="mt-0.5 text-slate-400">
                  Dành riêng cho Quản trị viên hệ thống. Mọi hành vi nhập sai mật khẩu quá 5 lần sẽ bị hệ thống tự động khóa IP trong 15 phút.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Mở Trang Quản Trị</span>
                </>
              )}
            </button>
          </form>

          {/* Back to App */}
          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay về Ứng dụng EduAdvisor</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Top Admin Navigation Bar */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/80 sticky top-16 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-base leading-none">Trung Tâm Quản Trị Hệ Thống</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Trực tuyến
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-none">
                Giám sát Cơ sở dữ liệu SQLite & Lượt truy cập toàn hệ thống
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              disabled={isLoadingData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              title="Làm mới toàn bộ dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem ứng dụng</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất Admin</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        {/* 1. DATABASE FILE LOCATION CARD (User requirement: "cho tôi biết bảng database nằm ở đâu") */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-800/90 to-blue-950/40 border border-blue-500/30 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>Vị trí tệp lưu trữ Cơ sở dữ liệu SQLite cục bộ</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm sm:text-base font-bold text-amber-300 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-700 break-all select-all">
                  {stats?.database.location || 'c:\\Skills-Stitch\\AI_EX\\backend\\app\\eduadvisor.db'}
                </span>
                <button
                  onClick={copyDbPath}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  {copiedDbPath ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Đã chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép đường dẫn</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 shrink-0">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Dung lượng tệp</p>
                <p className="text-lg font-bold text-emerald-400 font-mono">
                  {stats?.database.size_kb ? `${stats.database.size_kb} KB` : 'Đang tính...'}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Tổng số bảng</p>
                <p className="text-lg font-bold text-blue-400 font-mono">
                  {stats?.database.tables?.length || 6} bảng
                </p>
              </div>
            </div>
          </div>

          {/* Table tags */}
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-medium">Các bảng đang hoạt động:</span>
            {stats?.database.tables.map(tbl => (
              <span key={tbl} className="px-2 py-0.5 rounded-md bg-slate-700/70 text-slate-200 font-mono text-[11px] border border-slate-600">
                {tbl}
              </span>
            ))}
          </div>
        </div>

        {/* 2. STATISTIC METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Tổng tài khoản</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {stats?.metrics.total_users ?? users.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Đã lưu trong bảng `users`</p>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Lượt truy cập hệ thống</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {stats?.metrics.total_visits ?? logs.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Đã lưu trong bảng `access_logs`</p>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Bài tập hoàn thành</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {stats?.metrics.total_tasks_completed ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Trên tổng số {stats?.metrics.total_tasks ?? 0} bài tập</p>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Tổng giờ học tích lũy</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {stats?.metrics.total_study_hours ?? 0}h
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Từ các hồ sơ `user_profiles`</p>
          </div>
        </div>

        {/* 3. TABS CONTROLLER & SEARCH */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Tài khoản ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Nhật ký truy cập ({logs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('otps')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'otps'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Mã OTP ({otps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('schema')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'schema'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cấu trúc bảng DB</span>
            </button>
          </div>

          {/* Search bar */}
          {activeTab !== 'schema' && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tài khoản / email / IP..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* 4. TAB CONTENTS */}

        {/* TAB 1: USERS TABLE */}
        {activeTab === 'users' && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-700/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Danh Sách Học Viên Đăng Ký Trong SQLite</h3>
                <p className="text-xs text-slate-400">Dữ liệu từ bảng `users` kết hợp `user_profiles`</p>
              </div>
              <span className="text-xs font-semibold text-slate-300">
                Hiển thị {filteredUsers.length} tài khoản
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="py-3 px-4">Học Viên</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Trường Học</th>
                    <th className="py-3 px-4">Kỳ Thi & Mục Tiêu</th>
                    <th className="py-3 px-4">Trình Độ</th>
                    <th className="py-3 px-4">Giờ Học / Bài Tập</th>
                    <th className="py-3 px-4">Thời Gian Tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Không tìm thấy tài khoản nào khớp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {u.full_name ? u.full_name.slice(0, 2).toUpperCase() : 'HV'}
                            </div>
                            <div>
                              <div className="font-bold text-white">{u.full_name || 'Học viên'}</div>
                              <div className="font-mono text-[10px] text-slate-400">{u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-slate-200">{u.email}</span>
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {u.auth_provider === 'google' ? 'Google' : 'OTP'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          {u.school || 'Chưa cập nhật'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{u.target_exam || 'THPT Quốc Gia'}</div>
                          <div className="text-[11px] text-amber-400 font-bold">Mục tiêu: {u.target_score || '8.5+'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {u.current_level || 'Trung bình khá'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          <span>{u.study_hours}h</span> / <span className="text-emerald-400">{u.solved_problems} bài</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                          {u.created_at || 'Mới đây'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ACCESS LOGS TABLE */}
        {activeTab === 'logs' && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-700/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Lượt Truy Cập & Tương Tác Web (Traffic Logs)</h3>
                <p className="text-xs text-slate-400">Ghi nhận tự động từ middleware & hành động chuyển trang vào bảng `access_logs`</p>
              </div>
              <span className="text-xs font-semibold text-slate-300">
                {filteredLogs.length} bản ghi gần nhất
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="py-3 px-4">Thời Gian</th>
                    <th className="py-3 px-4">Địa Chỉ IP</th>
                    <th className="py-3 px-4">Phương Thức</th>
                    <th className="py-3 px-4">Đường Dẫn (Path)</th>
                    <th className="py-3 px-4">Email Người Dùng</th>
                    <th className="py-3 px-4">Thiết Bị / User Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Chưa có bản ghi truy cập nào.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {l.created_at}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-amber-300 whitespace-nowrap">
                          {l.ip_address}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            l.method === 'PAGE_VIEW' 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : l.method === 'POST'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {l.method}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-white max-w-[200px] truncate">
                          {l.path}
                        </td>
                        <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                          {l.user_email ? (
                            <span className="text-emerald-400 font-mono">{l.user_email}</span>
                          ) : (
                            <span className="text-slate-500 italic">Khách vãng lai</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px] max-w-[260px] truncate" title={l.user_agent || ''}>
                          {l.user_agent || 'Không xác định'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: OTP LOGS */}
        {activeTab === 'otps' && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-700/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Lịch Sử Phát Sinh Mã Xác Thực Email (OTP)</h3>
                <p className="text-xs text-slate-400">Dữ liệu từ bảng `email_verifications`</p>
              </div>
              <span className="text-xs font-semibold text-slate-300">
                {otps.length} mã đã tạo
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="py-3 px-4">Email Nhận Mã</th>
                    <th className="py-3 px-4">Mã OTP (6 Chữ Số)</th>
                    <th className="py-3 px-4">Trạng Thái Sử Dụng</th>
                    <th className="py-3 px-4">Thời Gian Gửi</th>
                    <th className="py-3 px-4">Hết Hạn Lúc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {otps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Chưa có lịch sử mã OTP nào.
                      </td>
                    </tr>
                  ) : (
                    otps.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-white">
                          {o.email}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-base font-extrabold text-amber-400 tracking-wider bg-slate-950/70 px-2.5 py-1 rounded-md border border-slate-700">
                            {o.otp_code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {o.is_used ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Đã xác thực thành công
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Chưa nhập hoặc đang chờ
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {o.created_at}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {o.expires_at}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DATABASE SCHEMA VIEWER */}
        {activeTab === 'schema' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Table 1: users */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                <Server className="w-4 h-4 text-blue-400" />
                <h4 className="font-mono font-bold text-sm text-white">Bảng: users</h4>
              </div>
              <ul className="space-y-1.5 text-xs font-mono">
                <li className="flex justify-between text-slate-300"><span>id (PK)</span><span className="text-amber-400">VARCHAR(64)</span></li>
                <li className="flex justify-between text-slate-300"><span>email (UNIQUE)</span><span className="text-blue-400">VARCHAR(255)</span></li>
                <li className="flex justify-between text-slate-300"><span>full_name</span><span className="text-slate-400">VARCHAR(255)</span></li>
                <li className="flex justify-between text-slate-300"><span>avatar_url</span><span className="text-slate-400">TEXT</span></li>
                <li className="flex justify-between text-slate-300"><span>auth_provider</span><span className="text-slate-400">VARCHAR(32)</span></li>
                <li className="flex justify-between text-slate-300"><span>created_at</span><span className="text-emerald-400">DATETIME</span></li>
              </ul>
            </div>

            {/* Table 2: user_profiles */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                <Server className="w-4 h-4 text-emerald-400" />
                <h4 className="font-mono font-bold text-sm text-white">Bảng: user_profiles</h4>
              </div>
              <ul className="space-y-1.5 text-xs font-mono">
                <li className="flex justify-between text-slate-300"><span>id (PK)</span><span className="text-amber-400">VARCHAR(64)</span></li>
                <li className="flex justify-between text-slate-300"><span>user_id (FK -&gt; users)</span><span className="text-blue-400">VARCHAR(64)</span></li>
                <li className="flex justify-between text-slate-300"><span>school</span><span className="text-slate-400">VARCHAR(255)</span></li>
                <li className="flex justify-between text-slate-300"><span>target_exam</span><span className="text-slate-400">VARCHAR(100)</span></li>
                <li className="flex justify-between text-slate-300"><span>target_score</span><span className="text-slate-400">VARCHAR(50)</span></li>
                <li className="flex justify-between text-slate-300"><span>current_level</span><span className="text-slate-400">VARCHAR(100)</span></li>
                <li className="flex justify-between text-slate-300"><span>study_hours</span><span className="text-amber-400">FLOAT</span></li>
                <li className="flex justify-between text-slate-300"><span>solved_problems</span><span className="text-amber-400">INTEGER</span></li>
              </ul>
            </div>

            {/* Table 3: access_logs */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                <Server className="w-4 h-4 text-purple-400" />
                <h4 className="font-mono font-bold text-sm text-white">Bảng: access_logs</h4>
              </div>
              <ul className="space-y-1.5 text-xs font-mono">
                <li className="flex justify-between text-slate-300"><span>id (PK)</span><span className="text-amber-400">INTEGER AUTO</span></li>
                <li className="flex justify-between text-slate-300"><span>ip_address</span><span className="text-blue-400">VARCHAR(64)</span></li>
                <li className="flex justify-between text-slate-300"><span>path</span><span className="text-slate-400">VARCHAR(255)</span></li>
                <li className="flex justify-between text-slate-300"><span>method</span><span className="text-slate-400">VARCHAR(16)</span></li>
                <li className="flex justify-between text-slate-300"><span>user_id / user_email</span><span className="text-slate-400">VARCHAR</span></li>
                <li className="flex justify-between text-slate-300"><span>user_agent</span><span className="text-slate-400">TEXT</span></li>
                <li className="flex justify-between text-slate-300"><span>created_at</span><span className="text-emerald-400">DATETIME</span></li>
              </ul>
            </div>

            {/* Table 4: roadmaps */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                <Server className="w-4 h-4 text-cyan-400" />
                <h4 className="font-mono font-bold text-sm text-white">Bảng: roadmaps</h4>
              </div>
              <ul className="space-y-1.5 text-xs font-mono">
                <li className="flex justify-between text-slate-300"><span>id (PK)</span><span className="text-amber-400">VARCHAR(64)</span></li>
                <li className="flex justify-between text-slate-300"><span>user_id (FK)</span><span className="text-blue-400">VARCHAR(64)</span></li>
                <li className="flex justify-between text-slate-300"><span>title</span><span className="text-slate-400">VARCHAR(255)</span></li>
                <li className="flex justify-between text-slate-300"><span>stages_json</span><span className="text-slate-400">TEXT</span></li>
                <li className="flex justify-between text-slate-300"><span>milestones_json</span><span className="text-slate-400">TEXT</span></li>
                <li className="flex justify-between text-slate-300"><span>schedule_json</span><span className="text-slate-400">TEXT</span></li>
              </ul>
            </div>

            {/* Table 5: tasks */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                <Server className="w-4 h-4 text-rose-400" />
                <h4 className="font-mono font-bold text-sm text-white">Bảng: tasks</h4>
              </div>
              <ul className="space-y-1.5 text-xs font-mono">
                <li className="flex justify-between text-slate-300"><span>id (PK)</span><span className="text-amber-400">VARCHAR(64)</span></li>
                <li className="flex justify-between text-slate-300"><span>user_id (FK)</span><span className="text-blue-400">VARCHAR(64)</span></li>
                <li className="flex justify-between text-slate-300"><span>title</span><span className="text-slate-400">VARCHAR(255)</span></li>
                <li className="flex justify-between text-slate-300"><span>subject</span><span className="text-slate-400">VARCHAR(64)</span></li>
                <li className="flex justify-between text-slate-300"><span>status</span><span className="text-amber-400">'pending' | 'completed'</span></li>
                <li className="flex justify-between text-slate-300"><span>score</span><span className="text-slate-400">VARCHAR(32)</span></li>
              </ul>
            </div>

            {/* Table 6: email_verifications */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                <Server className="w-4 h-4 text-amber-400" />
                <h4 className="font-mono font-bold text-sm text-white">Bảng: email_verifications</h4>
              </div>
              <ul className="space-y-1.5 text-xs font-mono">
                <li className="flex justify-between text-slate-300"><span>id (PK)</span><span className="text-amber-400">INTEGER AUTO</span></li>
                <li className="flex justify-between text-slate-300"><span>email</span><span className="text-blue-400">VARCHAR(255)</span></li>
                <li className="flex justify-between text-slate-300"><span>otp_code</span><span className="text-amber-400">VARCHAR(10)</span></li>
                <li className="flex justify-between text-slate-300"><span>is_used</span><span className="text-purple-400">BOOLEAN</span></li>
                <li className="flex justify-between text-slate-300"><span>created_at / expires_at</span><span className="text-emerald-400">DATETIME</span></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
