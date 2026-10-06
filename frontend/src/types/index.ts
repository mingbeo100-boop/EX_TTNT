export type PageType = 'landing' | 'dashboard' | 'chat' | 'roadmap' | 'login' | 'profile' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  school: string;
  target_exam: string;
  target_score: string;
  current_level: string;
  focus_subjects: string[];
  learning_needs: string[];
  streak_days: number;
  avg_score: number;
  study_hours: number;
  solved_problems: number;
}

export interface User {
  id: string;
  user_id?: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  access_token: string;
  needs_onboarding?: boolean;
  profile?: UserProfile;
}

export interface OnboardingData {
  user_id: string;
  full_name: string;
  school: string;
  target_exam: string;
  target_score: string;
  current_level: string;
  focus_subjects: string[];
  learning_needs: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  time: string;
  text: string;
  hasMath?: boolean;
  mathFormula?: string[];
  homeworkAttachment?: {
    title: string;
    ocrText: string;
    confidence: string;
  };
  steps?: {
    stepNum: number;
    title: string;
    detail: string;
    formula?: string;
  }[];
  codeSnippet?: {
    language: string;
    code: string;
  };
  socraticPrompt?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  subject: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó' | 'Vận dụng cao' | string;
  duration: string;
  status: 'pending' | 'completed';
  score?: string;
}

export interface DiagnosticChallenge {
  id: string;
  title: string;
  focus: string;
  difficulty: 'Vận dụng' | 'Vận dụng cao 9+';
  xpReward: number;
  isUnlocked: boolean;
  isPassed: boolean;
  questionText?: string;
  exerciseType: 'trap_detect' | 'ordering_steps' | 'matching_pairs' | 'multiple_choice' | 'fill_blank';
}

export interface Milestone {
  id: string;
  title: string;
  subject: string;
  status: 'done' | 'active' | 'locked' | string;
  progress?: string;
  tag: string;
  score?: string;
  unlockDate?: string;
  stageId?: number;
}

export interface StageItem {
  id: number;
  title: string;
  status: string;
  duration: string;
  progress: string;
  diagnosticChallenge?: DiagnosticChallenge;
}

export interface ScheduleItem {
  day: string;
  subject: string;
  time: string;
  topic: string;
  status: string;
}

export interface RoadmapData {
  id: string;
  title: string;
  targetExam: string;
  targetScore: string;
  currentLevel: string;
  daysLeft: number;
  totalProgress: number;
  stages: StageItem[];
  milestones: Milestone[];
  schedule: ScheduleItem[];
}

export interface AdminStats {
  database: {
    location: string;
    size_kb: number;
    tables: string[];
  };
  metrics: {
    total_users: number;
    total_profiles: number;
    total_tasks: number;
    total_tasks_completed: number;
    total_study_hours: number;
    total_visits: number;
    total_otps: number;
  };
}

export interface AdminUserItem {
  id: string;
  email: string;
  full_name: string;
  auth_provider: string;
  created_at: string | null;
  school: string;
  target_exam: string;
  target_score: string;
  current_level: string;
  study_hours: number;
  solved_problems: number;
  streak_days: number;
}

export interface AdminAccessLogItem {
  id: number;
  ip_address: string;
  path: string;
  method: string;
  user_id: string | null;
  user_email: string | null;
  user_agent: string | null;
  created_at: string | null;
}

export interface AdminOtpItem {
  id: number;
  email: string;
  otp_code: string;
  is_used: boolean;
  created_at: string | null;
  expires_at: string | null;
}
