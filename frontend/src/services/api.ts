import { 
  User, 
  UserProfile, 
  OnboardingData, 
  TaskItem, 
  RoadmapData,
  AdminStats,
  AdminUserItem,
  AdminAccessLogItem,
  AdminOtpItem
} from '../types';

const API_BASE_URL = '/api';

export const DEFAULT_APP_USER: User = {
  id: 'user_mingbeo100',
  email: 'mingbeo100@gmail.com',
  full_name: 'Minh Béo',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mingbeo',
  access_token: 'mingbeo_token_default',
  needs_onboarding: false,
  profile: {
    id: 'user_mingbeo100',
    email: 'mingbeo100@gmail.com',
    full_name: 'Minh Béo',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mingbeo',
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

export const api = {
  // Session storage helpers
  getUser(): User | null {
    try {
      const data = localStorage.getItem('eduadvisor_user');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && (parsed.email || parsed.id)) {
          // Nếu là token mặc định cũ chưa qua xác thực thì dọn dẹp và coi như chưa đăng nhập
          if (parsed.access_token === 'mingbeo_token_default' || parsed.id === 'user_mingbeo100') {
            localStorage.removeItem('eduadvisor_user');
            return null;
          }
          if (!parsed.id && parsed.user_id) parsed.id = parsed.user_id;
          if (!parsed.user_id && parsed.id) parsed.user_id = parsed.id;
          
          // Đồng bộ chuẩn hóa thống nhất số liệu với ảnh Dashboard: 28.5h, 8.8đ, 342 bài, 14 ngày
          if (parsed.profile) {
            if (parsed.profile.study_hours === 32.5 && parsed.profile.solved_problems === 412) {
              parsed.profile.study_hours = 28.5;
              parsed.profile.solved_problems = 342;
              parsed.profile.avg_score = 8.8;
              parsed.profile.streak_days = 14;
              localStorage.setItem('eduadvisor_user', JSON.stringify(parsed));
            }
          }
          return parsed;
        }
      }
    } catch {}
    
    // Mặc định là KHÁCH (chưa đăng nhập tài khoản nào)
    return null;
  },

  isLoggedIn(): boolean {
    return !!this.getUser();
  },

  setUser(user: any) {
    try {
      if (!user.id && user.user_id) user.id = user.user_id;
      if (!user.user_id && user.id) user.user_id = user.id;
      localStorage.setItem('eduadvisor_user', JSON.stringify(user));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('eduadvisor_user_updated', { detail: user }));
      }
    } catch {}
  },

  clearUser() {
    try {
      localStorage.removeItem('eduadvisor_user');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('eduadvisor_user_updated', { detail: null }));
      }
    } catch {}
  },

  getRoadmapStorageKey(userId?: string): string {
    const u = this.getUser();
    const uid = userId || u?.id || 'guest';
    return `eduadvisor_${uid}_custom_roadmap`;
  },

  getUserRoadmap(userId?: string): RoadmapData | null {
    try {
      const key = this.getRoadmapStorageKey(userId);
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
      // Fallback for legacy key if guest or matching
      const legacy = localStorage.getItem('eduadvisor_custom_roadmap');
      if (legacy) return JSON.parse(legacy);
      return null;
    } catch {
      return null;
    }
  },

  saveUserRoadmap(roadmap: RoadmapData, userId?: string) {
    try {
      const key = this.getRoadmapStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(roadmap));
      localStorage.setItem('eduadvisor_custom_roadmap', JSON.stringify(roadmap));
    } catch {}
  },

  // Admin Session Storage
  getAdminToken(): string | null {
    try {
      return localStorage.getItem('eduadvisor_admin_token') || sessionStorage.getItem('eduadvisor_admin_token');
    } catch {
      return null;
    }
  },

  setAdminToken(token: string) {
    try {
      localStorage.setItem('eduadvisor_admin_token', token);
      sessionStorage.setItem('eduadvisor_admin_token', token);
    } catch {}
  },

  clearAdminToken() {
    try {
      localStorage.removeItem('eduadvisor_admin_token');
      sessionStorage.removeItem('eduadvisor_admin_token');
    } catch {}
  },

  // 1. Health check
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  // 2. Google Authentication & Onboarding
  async googleAuth(payload: { id_token?: string; email?: string; full_name?: string; avatar_url?: string }) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        this.setUser(data);
      }
      return data;
    } catch {
      // Offline fallback
      const fallbackUser: User = {
        id: 'user_google_' + Date.now().toString().slice(-4),
        email: payload.email || 'student@gmail.com',
        full_name: payload.full_name || 'Học viên Google',
        avatar_url: payload.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        access_token: 'local_token_' + Date.now(),
        needs_onboarding: true
      };
      this.setUser(fallbackUser);
      return fallbackUser;
    }
  },

  async sendOtp(email: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    } catch (err: any) {
      return { status: 'error', message: 'Không thể kết nối đến máy chủ gửi mail. Vui lòng kiểm tra lại kết nối mạng.' };
    }
  },

  async configSmtp(payload: { smtp_user: string; smtp_password: string; smtp_host?: string; smtp_port?: number }) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/config-smtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch {
      return { status: 'error', message: 'Không thể kết nối đến máy chủ.' };
    }
  },

  async verifyOtp(payload: { email: string; otp_code: string; full_name?: string }) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        this.setUser(data);
      }
      return { ok: res.ok, data };
    } catch {
      const fallbackUser: User = {
        id: 'user_otp_' + Date.now().toString().slice(-4),
        email: payload.email,
        full_name: payload.full_name || payload.email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${payload.email}`,
        access_token: 'local_token_' + Date.now(),
        needs_onboarding: true
      };
      this.setUser(fallbackUser);
      return { ok: true, data: fallbackUser };
    }
  },

  async submitOnboarding(data: OnboardingData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok) {
        this.setUser(resData);
      }
      return resData;
    } catch {
      const user = this.getUser();
      const updatedUser: User = {
        id: data.user_id,
        email: user?.email || `${data.user_id}@student.edu.vn`,
        full_name: data.full_name,
        avatar_url: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        access_token: user?.access_token || 'mock_token',
        needs_onboarding: false,
        profile: {
          id: data.user_id,
          email: user?.email || `${data.user_id}@student.edu.vn`,
          full_name: data.full_name,
          avatar_url: user?.avatar_url,
          school: data.school,
          target_exam: data.target_exam,
          target_score: data.target_score,
          current_level: data.current_level,
          focus_subjects: data.focus_subjects,
          learning_needs: data.learning_needs,
          streak_days: 1,
          avg_score: 0.0,
          study_hours: 0.0,
          solved_problems: 0
        }
      };
      this.setUser(updatedUser);
      return updatedUser;
    }
  },

  async getProfile(userId?: string): Promise<UserProfile | null> {
    const u = this.getUser();
    try {
      const targetId = userId || u?.id || u?.user_id;
      const headers: Record<string, string> = {};
      if (u?.access_token) {
        headers['Authorization'] = `Bearer ${u.access_token}`;
      }
      const url = targetId ? `${API_BASE_URL}/auth/me?user_id=${targetId}` : `${API_BASE_URL}/auth/me`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.full_name || data.id)) {
          return data;
        }
      }
      return u?.profile || null;
    } catch {
      return u?.profile || null;
    }
  },

  async updateUserIdentity(payload: { user_id: string; full_name?: string; avatar_url?: string }): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/update-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        this.setUser(data);
        return data;
      }
    } catch {}

    // Fallback if offline
    const current = this.getUser();
    if (current) {
      if (payload.full_name) current.full_name = payload.full_name;
      if (payload.avatar_url !== undefined) current.avatar_url = payload.avatar_url;
      if (current.profile) {
        if (payload.full_name) current.profile.full_name = payload.full_name;
        if (payload.avatar_url !== undefined) current.profile.avatar_url = payload.avatar_url;
      }
      this.setUser(current);
      return current;
    }
    return null;
  },

  // 3. Daily Tasks & Competency Radar
  async getTasks(userId?: string): Promise<TaskItem[]> {
    try {
      const u = this.getUser();
      const targetId = userId || u?.id || u?.user_id;
      const headers: Record<string, string> = {};
      if (u?.access_token) {
        headers['Authorization'] = `Bearer ${u.access_token}`;
      }
      const url = targetId ? `${API_BASE_URL}/tasks?user_id=${targetId}` : `${API_BASE_URL}/tasks`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch {
      return [];
    }
  },

  async toggleTask(taskId: string, status: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, status })
      });
      return await res.json();
    } catch {
      return { status: 'success' };
    }
  },

  async createTask(payload: { title: string; subject: string; difficulty?: string; duration?: string }, userId?: string) {
    try {
      const url = userId ? `${API_BASE_URL}/tasks/create?user_id=${userId}` : `${API_BASE_URL}/tasks/create`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch {
      return {
        id: Date.now().toString(),
        title: payload.title,
        subject: payload.subject,
        difficulty: payload.difficulty || 'Trung bình',
        duration: payload.duration || '30 phút',
        status: 'pending',
        score: '+20 XP'
      };
    }
  },

  async getRadar(userId?: string) {
    try {
      const u = this.getUser();
      const targetId = userId || u?.id || u?.user_id;
      const headers: Record<string, string> = {};
      if (u?.access_token) {
        headers['Authorization'] = `Bearer ${u.access_token}`;
      }
      const url = targetId ? `${API_BASE_URL}/tasks/radar?user_id=${targetId}` : `${API_BASE_URL}/tasks/radar`;
      const res = await fetch(url, { headers });
      return await res.json();
    } catch {
      return null;
    }
  },

  // 4. Study Roadmap
  async getRoadmap(userId?: string): Promise<RoadmapData | null> {
    try {
      const u = this.getUser();
      const targetId = userId || u?.id || u?.user_id;
      const headers: Record<string, string> = {};
      if (u?.access_token) {
        headers['Authorization'] = `Bearer ${u.access_token}`;
      }
      const url = targetId ? `${API_BASE_URL}/roadmap/current?user_id=${targetId}` : `${API_BASE_URL}/roadmap/current`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  },

  async rescheduleRoadmap(userId?: string) {
    try {
      const url = userId ? `${API_BASE_URL}/roadmap/reschedule?user_id=${userId}` : `${API_BASE_URL}/roadmap/reschedule`;
      const res = await fetch(url, { method: 'POST' });
      return await res.json();
    } catch {
      return { message: 'Đã tái phân bổ lại thời khóa biểu thông minh cùng AI.' };
    }
  },

  async configureRoadmap(payload: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/roadmap/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch {
      return { status: 'success', message: 'Đã lưu cấu hình lộ trình học tập cá nhân.' };
    }
  },

  // 5. AI Chat Streaming (Server-Sent Events)
  async streamChat(
    message: string, 
    subject: string, 
    onChunk: (chunk: string) => void, 
    onDone: () => void
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, subject })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) throw new Error('No readable stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let hasChunk = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonPart = trimmed.slice(6).trim();
            if (jsonPart) {
              try {
                const data = JSON.parse(jsonPart);
                if (data.chunk) {
                  hasChunk = true;
                  onChunk(data.chunk);
                }
              } catch {}
            }
          }
        }
      }

      if (buffer.trim().startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.trim().slice(6).trim());
          if (data.chunk) {
            hasChunk = true;
            onChunk(data.chunk);
          }
        } catch {}
      }

      if (!hasChunk) {
        onChunk(`Chào em! Cố vấn học thuật Dr. Minerva AI đã sẵn sàng hỗ trợ em về môn ${subject}. Em cần cố vấn bài tập nào?`);
      }
      onDone();
    } catch {
      onChunk(`Chào em! Cố vấn AI đã tiếp nhận câu hỏi "${message}". Hãy xem xét các công thức cơ bản và liên hệ lại nếu cần hỗ trợ chi tiết!`);
      onDone();
    }
  },

  // 6. Admin Management API
  async adminLogin(password: string, username = 'admin'): Promise<{ ok: boolean; message: string; token?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        this.setAdminToken(data.token);
        return { ok: true, message: data.message, token: data.token };
      }
      return { ok: false, message: data.detail || 'Mật khẩu quản trị không chính xác' };
    } catch {
      return { ok: false, message: 'Không thể kết nối đến máy chủ quản trị.' };
    }
  },

  async getAdminStats(): Promise<AdminStats | null> {
    try {
      const token = this.getAdminToken();
      const res = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  },

  async getAdminUsers(): Promise<AdminUserItem[]> {
    try {
      const token = this.getAdminToken();
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch {
      return [];
    }
  },

  async getAdminLogs(limit = 150): Promise<AdminAccessLogItem[]> {
    try {
      const token = this.getAdminToken();
      const res = await fetch(`${API_BASE_URL}/admin/access-logs?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch {
      return [];
    }
  },

  async getAdminOtps(limit = 100): Promise<AdminOtpItem[]> {
    try {
      const token = this.getAdminToken();
      const res = await fetch(`${API_BASE_URL}/admin/otps?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch {
      return [];
    }
  },

  async logPageVisit(path: string): Promise<void> {
    try {
      const u = this.getUser();
      await fetch(`${API_BASE_URL}/admin/log-visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          user_id: u?.id || u?.user_id,
          user_email: u?.email
        })
      });
    } catch {
      // Ignore background analytics logging errors
    }
  }
};
