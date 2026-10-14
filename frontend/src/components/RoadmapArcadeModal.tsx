import React, { useEffect, useRef, useState } from 'react';
import {
  Trophy,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Target,
  Award,
  RefreshCw,
  Play,
  RotateCcw,
  CheckCircle2,
  Compass,
  GraduationCap,
  Heart,
  Shield,
  Bomb,
  Flame,
  Users,
  Medal,
  Star,
  ChevronRight
} from 'lucide-react';

export interface RoadmapArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSchool: string;
  targetScore: string;
  targetSubject: string;
  focusBadgeId?: string | null;
  unlockedBadges: string[];
  onUnlockBadge: (badgeId: string) => void;
  onBonusExerciseSolved?: () => void;
}

export interface LeaderboardPlayer {
  rank: number;
  name: string;
  school: string;
  targetScore: string;
  score: number;
  trapsDestroyed: number;
  timeAliveStr: string;
  isCurrentUser?: boolean;
}

// Bảng xếp hạng khởi tạo mặc định các thủ khoa trường Chuyên
const INITIAL_LEADERBOARD: LeaderboardPlayer[] = [
  { rank: 1, name: 'Trần Minh Đức', school: 'THPT Chuyên KHTN Hà Nội', targetScore: '29.25đ', score: 9850, trapsDestroyed: 48, timeAliveStr: '15:20' },
  { rank: 2, name: 'Lê Hoàng Nam', school: 'THPT Chuyên Chu Văn An', targetScore: '28.80đ', score: 8200, trapsDestroyed: 39, timeAliveStr: '12:45' },
  { rank: 3, name: 'Nguyễn Mai Anh', school: 'THPT Chuyên Lê Hồng Phong TP.HCM', targetScore: '28.50đ', score: 7350, trapsDestroyed: 34, timeAliveStr: '10:30' },
  { rank: 4, name: 'Phạm Quốc Bảo', school: 'THPT Chuyên Quốc Học Huế', targetScore: '28.25đ', score: 6100, trapsDestroyed: 29, timeAliveStr: '08:15' },
  { rank: 5, name: 'Đỗ Thu Trang', school: 'THPT Chuyên Trần Phú Hải Phòng', targetScore: '28.00đ', score: 5450, trapsDestroyed: 25, timeAliveStr: '06:50' },
  { rank: 6, name: 'Vũ Hoàng Quân', school: 'THPT Chuyên Lam Sơn Thanh Hóa', targetScore: '27.75đ', score: 4800, trapsDestroyed: 21, timeAliveStr: '05:30' }
];

// Danh mục cạm bẫy đề thi và ngọc tri thức
const TRAP_LABELS = [
  'Bẫy Quên ĐKXĐ',
  'Bẫy Đổi Dấu Đạo Hàm',
  'Bẫy Paraphrase Lạc Đề',
  'Bẫy Đơn Vị Vật Lý',
  'Bẫy Ngoại Lệ Este',
  'Bẫy Bấm Nhầm Casio',
  'Bẫy Cận Tích Phân',
  'Bẫy Giả Thiết Khống',
  'Bẫy Nghiệm Ngoại Lai',
  'Bẫy Cực Trị RLC'
];

const ORB_LABELS = [
  'Định Lý Cốt Lõi',
  'Vá Lỗ Hổng 8+',
  'Bổ Đề Đối Xứng',
  'Tư Duy Phản Biện',
  'Kỹ Thuật PEEL',
  'Phương Pháp Socratic',
  'Công Thức Vàng',
  'Mẹo Casio 15s'
];

export const RoadmapArcadeModal: React.FC<RoadmapArcadeModalProps> = ({
  isOpen,
  onClose,
  targetSchool,
  targetScore,
  targetSubject,
  focusBadgeId,
  unlockedBadges,
  onUnlockBadge,
  onBonusExerciseSolved
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'victory'>('intro');
  const [gameMode, setGameMode] = useState<'endless' | 'survival'>('endless');
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard'>('badges');
  const [score, setScore] = useState(0);
  const [trapsDestroyed, setTrapsDestroyed] = useState(0);
  const [orbsCollected, setOrbsCollected] = useState(0);
  const [combo, setCombo] = useState(0);
  const [survivalSeconds, setSurvivalSeconds] = useState(0);
  const [reviveCount, setReviveCount] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('eduadvisor_arcade_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>(() => {
    try {
      const raw = localStorage.getItem('eduadvisor_arcade_leaderboard');
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_LEADERBOARD;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<string[]>([]);
  const [showCelebrationBanner, setShowCelebrationBanner] = useState<string | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Game Loop Refs
  const animFrameRef = useRef<number | null>(null);
  const keysRef = useRef<{ left: boolean; right: boolean; shoot: boolean; bomb: boolean }>({
    left: false,
    right: false,
    shoot: false,
    bomb: false
  });

  // Game state engine refs
  const engineRef = useRef({
    playerX: 250,
    playerY: 480,
    playerWidth: 44,
    playerHeight: 44,
    playerSpeed: 7,
    lives: 999, // Endless = 999; Survival = 3
    invincibleTime: 0,
    shieldActive: false,
    shieldTimer: 0,
    tripleLaserTimer: 0,
    bombs: 1,
    lasers: [] as Array<{ x: number; y: number; vx: number; vy: number }>,
    enemies: [] as Array<{
      id: number;
      x: number;
      y: number;
      radius: number;
      vy: number;
      hp: number;
      maxHp: number;
      label: string;
      color: string;
    }>,
    orbs: [] as Array<{
      id: number;
      x: number;
      y: number;
      radius: number;
      vy: number;
      type: 'normal' | 'rare' | 'vdc' | 'shield' | 'heart' | 'triple' | 'bomb';
      label: string;
      points: number;
      color: string;
    }>,
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }>,
    stars: [] as Array<{ x: number; y: number; speed: number; size: number; alpha: number }>,
    stationProgress: 0,
    stationIndex: 1,
    spawnTimer: 0,
    shootCooldown: 0,
    timeAlive: 0,
    sessionBadgesUnlocked: [] as string[]
  });

  // Helper format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Sound Synthesizer via Web Audio API
  const playSound = (type: 'laser' | 'orb' | 'explode' | 'shield' | 'badge' | 'hit' | 'heal' | 'powerup' | 'bomb') => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'laser') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'orb') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.05);
        osc.frequency.setValueAtTime(783.99, now + 0.1);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'explode') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'shield') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(950, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'heal') {
        [440, 554.37, 659.25, 880].forEach((f, idx) => {
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.connect(subGain);
          subGain.connect(ctx.destination);
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(f, now + idx * 0.04);
          subGain.gain.setValueAtTime(0.2, now + idx * 0.04);
          subGain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.04 + 0.15);
          subOsc.start(now + idx * 0.04);
          subOsc.stop(now + idx * 0.04 + 0.15);
        });
      } else if (type === 'powerup') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(1050, now + 0.22);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'bomb') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'badge') {
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((f, idx) => {
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.connect(subGain);
          subGain.connect(ctx.destination);
          subOsc.type = 'triangle';
          subOsc.frequency.setValueAtTime(f, now + idx * 0.08);
          subGain.gain.setValueAtTime(0.25, now + idx * 0.08);
          subGain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);
          subOsc.start(now + idx * 0.08);
          subOsc.stop(now + idx * 0.08 + 0.25);
        });
      } else if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.14);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      }
    } catch {}
  };

  // Khởi tạo các vì sao nền
  const initStars = (width: number, height: number) => {
    const stars = [];
    for (let i = 0; i < 75; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.6 + Math.random() * 2.8,
        size: 1 + Math.random() * 2.2,
        alpha: 0.3 + Math.random() * 0.7
      });
    }
    return stars;
  };

  // Đồng bộ Leaderboard khi có kỷ lục mới
  const syncLeaderboard = (finalScore: number, finalTraps: number, finalSecs: number) => {
    const raw = localStorage.getItem('eduadvisor_user');
    let userName = 'Bạn (Sĩ tử 2025)';
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u.full_name) userName = u.full_name;
      } catch {}
    }

    const currentBest = Math.max(finalScore, highScore);
    const newEntry: LeaderboardPlayer = {
      rank: 0,
      name: `${userName}`,
      school: targetSchool || 'Mục tiêu 27.5+',
      targetScore: targetScore || '28.0+',
      score: currentBest,
      trapsDestroyed: finalTraps,
      timeAliveStr: formatTime(finalSecs),
      isCurrentUser: true
    };

    setLeaderboard(prev => {
      const others = prev.filter(p => !p.isCurrentUser);
      const combined = [...others, newEntry].sort((a, b) => b.score - a.score);
      const ranked = combined.map((item, idx) => ({ ...item, rank: idx + 1 }));
      try {
        localStorage.setItem('eduadvisor_arcade_leaderboard', JSON.stringify(ranked));
      } catch {}
      return ranked;
    });
  };

  // Bắt đầu màn chơi
  const startGame = (mode: 'endless' | 'survival' = gameMode) => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 500;
    const h = canvas ? canvas.height : 560;

    setGameMode(mode);
    engineRef.current = {
      playerX: w / 2,
      playerY: h - 60,
      playerWidth: 44,
      playerHeight: 44,
      playerSpeed: 7.5,
      lives: mode === 'endless' ? 999 : 3,
      invincibleTime: 60,
      shieldActive: false,
      shieldTimer: 0,
      tripleLaserTimer: 0,
      bombs: 1,
      lasers: [],
      enemies: [],
      orbs: [],
      particles: [],
      stars: initStars(w, h),
      stationProgress: 0,
      stationIndex: 1,
      spawnTimer: 0,
      shootCooldown: 0,
      timeAlive: 0,
      sessionBadgesUnlocked: []
    };

    setScore(0);
    setTrapsDestroyed(0);
    setOrbsCollected(0);
    setCombo(0);
    setSurvivalSeconds(0);
    setReviveCount(0);
    setShowCelebrationBanner(null);
    setGameState('playing');
  };

  // Hồi sinh tiếp tục chơi không mất điểm
  const handleRevive = () => {
    const eng = engineRef.current;
    eng.lives = 3;
    eng.invincibleTime = 120;
    eng.shieldActive = true;
    eng.shieldTimer = 360; // 6s khiên
    setReviveCount(prev => prev + 1);
    setGameState('playing');
    playSound('heal');
  };

  // Kích hoạt bom tri thức quét sạch bẫy
  const triggerNukeBomb = () => {
    const eng = engineRef.current;
    if (eng.bombs <= 0) return;
    eng.bombs--;

    playSound('bomb');
    let pointsGained = 0;
    eng.enemies.forEach(e => {
      pointsGained += 120;
      for (let p = 0; p < 12; p++) {
        eng.particles.push({
          x: e.x,
          y: e.y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 25,
          maxLife: 25,
          color: '#fbbf24',
          size: 4
        });
      }
    });

    setTrapsDestroyed(t => t + eng.enemies.length);
    eng.enemies = [];
    setScore(s => s + pointsGained);
  };

  // Kiểm tra mở khóa huy hiệu real-time
  const checkBadgeUnlocks = (currentScore: number, destroyed: number, streakCombo: number, aliveSec: number) => {
    const eng = engineRef.current;
    const toUnlock: string[] = [];

    if (currentScore >= 300 && !unlockedBadges.includes('b_station_starter') && !eng.sessionBadgesUnlocked.includes('b_station_starter')) {
      toUnlock.push('b_station_starter');
    }
    if (destroyed >= 3 && !unlockedBadges.includes('b_trap_detect') && !eng.sessionBadgesUnlocked.includes('b_trap_detect')) {
      toUnlock.push('b_trap_detect');
    }
    if (streakCombo >= 4 && !unlockedBadges.includes('b_matching_master') && !eng.sessionBadgesUnlocked.includes('b_matching_master')) {
      toUnlock.push('b_matching_master');
    }
    if (currentScore >= 1000 && !unlockedBadges.includes('b_logic_architect') && !eng.sessionBadgesUnlocked.includes('b_logic_architect')) {
      toUnlock.push('b_logic_architect');
    }
    if ((aliveSec >= 40 || currentScore >= 1800) && !unlockedBadges.includes('b_streak_hero') && !eng.sessionBadgesUnlocked.includes('b_streak_hero')) {
      toUnlock.push('b_streak_hero');
    }
    if ((currentScore >= 2500 || destroyed >= 12) && !unlockedBadges.includes('b_mastery_summit') && !eng.sessionBadgesUnlocked.includes('b_mastery_summit')) {
      toUnlock.push('b_mastery_summit');
    }

    if (toUnlock.length > 0) {
      toUnlock.forEach(id => {
        eng.sessionBadgesUnlocked.push(id);
        onUnlockBadge(id);
      });
      setRecentlyUnlocked(prev => [...prev, ...toUnlock]);
      playSound('badge');
    }
  };

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keysRef.current.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keysRef.current.right = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        keysRef.current.shoot = true;
      }
      if (e.code === 'KeyB') {
        e.preventDefault();
        triggerNukeBomb();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keysRef.current.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keysRef.current.right = false;
      }
      if (e.code === 'Space') {
        keysRef.current.shoot = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen]);

  // Main Canvas Render & Game Loop
  useEffect(() => {
    if (!isOpen || gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localScore = score;
    let localDestroyed = trapsDestroyed;
    let localOrbs = orbsCollected;
    let localCombo = combo;

    const render = () => {
      const eng = engineRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Cập nhật Player & Keyboard
      if (keysRef.current.left) {
        eng.playerX = Math.max(eng.playerWidth / 2 + 10, eng.playerX - eng.playerSpeed);
      }
      if (keysRef.current.right) {
        eng.playerX = Math.min(w - eng.playerWidth / 2 - 10, eng.playerX + eng.playerSpeed);
      }

      // Shoot Laser
      if (eng.shootCooldown > 0) eng.shootCooldown--;
      if (keysRef.current.shoot && eng.shootCooldown === 0) {
        if (eng.tripleLaserTimer > 0) {
          // Bắn 3 tia quạt
          eng.lasers.push({ x: eng.playerX, y: eng.playerY - 22, vx: 0, vy: -12 });
          eng.lasers.push({ x: eng.playerX - 10, y: eng.playerY - 18, vx: -3.5, vy: -11.5 });
          eng.lasers.push({ x: eng.playerX + 10, y: eng.playerY - 18, vx: 3.5, vy: -11.5 });
        } else {
          // Bắn tia đơn
          eng.lasers.push({ x: eng.playerX, y: eng.playerY - 22, vx: 0, vy: -12 });
        }
        eng.shootCooldown = 11;
        playSound('laser');
      }

      // Timers
      if (eng.invincibleTime > 0) eng.invincibleTime--;
      if (eng.shieldTimer > 0) {
        eng.shieldTimer--;
        if (eng.shieldTimer === 0) eng.shieldActive = false;
      }
      if (eng.tripleLaserTimer > 0) eng.tripleLaserTimer--;

      eng.timeAlive += 1 / 60;
      setSurvivalSeconds(Math.floor(eng.timeAlive));

      // Tiến trình trạm vô tận (Station 1 -> Station 99+)
      eng.stationProgress += 0.07;
      if (eng.stationProgress >= 100) {
        eng.stationProgress = 0;
        eng.stationIndex += 1;
        playSound('badge');
        setShowCelebrationBanner(`🚀 Chúc mừng bạn đã tiến vào Trạm ${eng.stationIndex} Ngân Hà!`);
        setTimeout(() => setShowCelebrationBanner(null), 3000);
      }

      // 2. Spawn Elements (Bẫy đề thi & Vật phẩm)
      eng.spawnTimer++;
      const trapRate = Math.max(26, 45 - Math.floor(eng.stationIndex * 1.5));
      if (eng.spawnTimer % trapRate === 0) {
        const trapText = TRAP_LABELS[Math.floor(Math.random() * TRAP_LABELS.length)];
        const isBigTrap = Math.random() < 0.28;
        eng.enemies.push({
          id: Date.now() + Math.random(),
          x: 40 + Math.random() * (w - 80),
          y: -40,
          radius: isBigTrap ? 26 : 18,
          vy: 2.3 + Math.random() * 1.8 + (eng.stationIndex * 0.1),
          hp: isBigTrap ? 3 : 1,
          maxHp: isBigTrap ? 3 : 1,
          label: trapText,
          color: isBigTrap ? '#ef4444' : '#f97316'
        });
      }

      // Spawn Power-up / Knowledge Orbs
      if (eng.spawnTimer % 55 === 0) {
        const roll = Math.random();
        let orbType: 'normal' | 'rare' | 'vdc' | 'shield' | 'heart' | 'triple' | 'bomb' = 'normal';
        let orbPts = 100;
        let orbCol = '#10b981';
        let orbLabel = ORB_LABELS[Math.floor(Math.random() * ORB_LABELS.length)];

        if (roll < 0.08) {
          orbType = 'heart';
          orbPts = 200;
          orbCol = '#ec4899';
          orbLabel = '💖 +1 Mạng';
        } else if (roll < 0.16) {
          orbType = 'triple';
          orbPts = 250;
          orbCol = '#38bdf8';
          orbLabel = '⚡ 3 Tia Laser';
        } else if (roll < 0.24) {
          orbType = 'bomb';
          orbPts = 300;
          orbCol = '#eab308';
          orbLabel = '💣 Bom Tri Thức';
        } else if (roll < 0.36) {
          orbType = 'shield';
          orbPts = 150;
          orbCol = '#a855f7';
          orbLabel = '🛡️ Khiên Bất Tử';
        } else if (roll < 0.55) {
          orbType = 'vdc';
          orbPts = 400;
          orbCol = '#f59e0b';
          orbLabel = '💎 Vận Dụng Cao';
        } else if (roll < 0.75) {
          orbType = 'rare';
          orbPts = 250;
          orbCol = '#3b82f6';
          orbLabel = '⭐ Bổ Đề 9+';
        }

        eng.orbs.push({
          id: Date.now() + Math.random(),
          x: 35 + Math.random() * (w - 70),
          y: -30,
          radius: 17,
          vy: 1.8 + Math.random() * 1.2,
          type: orbType,
          label: orbLabel,
          points: orbPts,
          color: orbCol
        });
      }

      // 3. Update Lasers
      for (let i = eng.lasers.length - 1; i >= 0; i--) {
        const l = eng.lasers[i];
        l.x += l.vx;
        l.y += l.vy;

        if (l.y < -30 || l.x < -20 || l.x > w + 20) {
          eng.lasers.splice(i, 1);
          continue;
        }

        // Va chạm bẫy
        for (let j = eng.enemies.length - 1; j >= 0; j--) {
          const e = eng.enemies[j];
          const dist = Math.hypot(l.x - e.x, l.y - e.y);
          if (dist < e.radius + 6) {
            e.hp--;
            eng.lasers.splice(i, 1);

            // Tia lửa
            for (let p = 0; p < 8; p++) {
              eng.particles.push({
                x: l.x,
                y: l.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 14,
                maxLife: 14,
                color: '#38bdf8',
                size: 2.5
              });
            }

            if (e.hp <= 0) {
              localDestroyed++;
              setTrapsDestroyed(localDestroyed);
              localScore += 150 * (1 + localCombo * 0.2);
              setScore(Math.floor(localScore));

              // Nổ mạnh
              for (let p = 0; p < 16; p++) {
                eng.particles.push({
                  x: e.x,
                  y: e.y,
                  vx: (Math.random() - 0.5) * 9,
                  vy: (Math.random() - 0.5) * 9,
                  life: 22,
                  maxLife: 22,
                  color: e.color,
                  size: 3.5
                });
              }
              playSound('explode');
              eng.enemies.splice(j, 1);
            } else {
              playSound('hit');
            }
            break;
          }
        }
      }

      // 4. Update Enemies (Cạm bẫy)
      for (let i = eng.enemies.length - 1; i >= 0; i--) {
        const e = eng.enemies[i];
        e.y += e.vy;

        const distToPlayer = Math.hypot(eng.playerX - e.x, eng.playerY - e.y);
        if (distToPlayer < e.radius + eng.playerWidth / 2 - 4) {
          if (eng.shieldActive) {
            // Khiên bảo vệ làm vỡ bẫy
            localDestroyed++;
            setTrapsDestroyed(localDestroyed);
            playSound('explode');
            eng.enemies.splice(i, 1);
            continue;
          } else if (eng.invincibleTime === 0) {
            if (gameMode === 'endless') {
              // Chế độ Vô Tận Bất Tử: Đẩy lùi bẫy, trừ combo nhưng KHÔNG CHẾT!
              eng.invincibleTime = 50;
              localCombo = 0;
              setCombo(0);
              playSound('hit');
              eng.enemies.splice(i, 1);

              for (let p = 0; p < 16; p++) {
                eng.particles.push({
                  x: eng.playerX,
                  y: eng.playerY,
                  vx: (Math.random() - 0.5) * 7,
                  vy: (Math.random() - 0.5) * 7,
                  life: 20,
                  maxLife: 20,
                  color: '#60a5fa',
                  size: 3
                });
              }
            } else {
              // Chế độ Sinh Tồn: Trừ 1 mạng
              eng.lives--;
              eng.invincibleTime = 80;
              localCombo = 0;
              setCombo(0);
              playSound('hit');

              for (let p = 0; p < 20; p++) {
                eng.particles.push({
                  x: eng.playerX,
                  y: eng.playerY,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  life: 25,
                  maxLife: 25,
                  color: '#ef4444',
                  size: 3
                });
              }

              if (eng.lives <= 0) {
                setGameState('gameover');
                const finalSc = Math.floor(localScore);
                if (finalSc > highScore) {
                  setHighScore(finalSc);
                  localStorage.setItem('eduadvisor_arcade_highscore', finalSc.toString());
                }
                syncLeaderboard(finalSc, localDestroyed, eng.timeAlive);
                return;
              }
            }
          }
        }

        if (e.y > h + 50) {
          eng.enemies.splice(i, 1);
        }
      }

      // 5. Update Orbs
      for (let i = eng.orbs.length - 1; i >= 0; i--) {
        const o = eng.orbs[i];
        o.y += o.vy;

        const distToPlayer = Math.hypot(eng.playerX - o.x, eng.playerY - o.y);
        if (distToPlayer < o.radius + eng.playerWidth / 2) {
          localOrbs++;
          setOrbsCollected(localOrbs);
          localCombo++;
          setCombo(localCombo);

          if (o.type === 'shield') {
            eng.shieldActive = true;
            eng.shieldTimer = 360; // 6s khiên
            playSound('shield');
          } else if (o.type === 'heart') {
            if (eng.lives < 5) eng.lives++;
            playSound('heal');
          } else if (o.type === 'triple') {
            eng.tripleLaserTimer = 550; // ~9s 3 tia
            playSound('powerup');
          } else if (o.type === 'bomb') {
            eng.bombs = Math.min(3, eng.bombs + 1);
            playSound('powerup');
          } else {
            playSound('orb');
          }

          localScore += o.points * (1 + localCombo * 0.15);
          setScore(Math.floor(localScore));

          for (let p = 0; p < 14; p++) {
            eng.particles.push({
              x: o.x,
              y: o.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 20,
              maxLife: 20,
              color: o.color,
              size: 3
            });
          }

          eng.orbs.splice(i, 1);
          continue;
        }

        if (o.y > h + 40) {
          eng.orbs.splice(i, 1);
        }
      }

      // 6. Update Particles
      for (let i = eng.particles.length - 1; i >= 0; i--) {
        const p = eng.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
          eng.particles.splice(i, 1);
        }
      }

      // 7. Update Starfield
      eng.stars.forEach(s => {
        s.y += s.speed;
        if (s.y > h) {
          s.y = 0;
          s.x = Math.random() * w;
        }
      });

      // Kiểm tra huy hiệu
      checkBadgeUnlocks(localScore, localDestroyed, localCombo, eng.timeAlive);

      // Cập nhật kỷ lục liên tục
      if (Math.floor(localScore) > highScore) {
        setHighScore(Math.floor(localScore));
        localStorage.setItem('eduadvisor_arcade_highscore', Math.floor(localScore).toString());
      }

      // ================= DRAWING SECTION =================
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, w, h);

      // Gradient Nebula background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.85);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.6, '#090d16');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Stars
      eng.stars.forEach(s => {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Grid Roadmap Cyber Lines
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Lasers
      eng.lasers.forEach(l => {
        ctx.shadowColor = eng.tripleLaserTimer > 0 ? '#38bdf8' : '#60a5fa';
        ctx.shadowBlur = 12;
        ctx.fillStyle = eng.tripleLaserTimer > 0 ? '#06b6d4' : '#38bdf8';
        ctx.fillRect(l.x - 2.5, l.y - 12, 5, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(l.x - 1, l.y - 10, 2, 12);
        ctx.shadowBlur = 0;
      });

      // Enemies (Cạm bẫy đề thi)
      eng.enemies.forEach(e => {
        ctx.save();
        ctx.translate(e.x, e.y);

        ctx.shadowColor = e.color;
        ctx.shadowBlur = 14;

        ctx.fillStyle = e.color;
        ctx.beginPath();
        const sides = 8;
        for (let s = 0; s < sides; s++) {
          const angle = (s * Math.PI * 2) / sides;
          const r = e.radius * (s % 2 === 0 ? 1 : 0.85);
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.shadowBlur = 0;

        ctx.font = 'bold 9px system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(e.label, 0, e.radius + 12);

        if (e.maxHp > 1) {
          const barW = 28;
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(-barW / 2, -e.radius - 8, barW, 4);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(-barW / 2, -e.radius - 8, (barW * e.hp) / e.maxHp, 4);
        }

        ctx.restore();
      });

      // Orbs (Ngọc & Vật phẩm)
      eng.orbs.forEach(o => {
        ctx.save();
        ctx.translate(o.x, o.y);

        ctx.shadowColor = o.color;
        ctx.shadowBlur = 16;

        ctx.fillStyle = o.color;
        ctx.beginPath();
        ctx.arc(0, 0, o.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-o.radius * 0.3, -o.radius * 0.3, o.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.font = 'bold 9px system-ui, sans-serif';
        ctx.fillStyle = o.color;
        ctx.textAlign = 'center';
        ctx.fillText(o.label, 0, o.radius + 12);

        ctx.restore();
      });

      // Particles
      eng.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Player Ship (Phi Thuyền Tri Thức)
      const isBlinking = eng.invincibleTime > 0 && Math.floor(eng.invincibleTime / 6) % 2 === 0;
      if (!isBlinking) {
        ctx.save();
        ctx.translate(eng.playerX, eng.playerY);

        // Lửa phản lực
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#fb923c';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(-8, 16);
        ctx.lineTo(8, 16);
        ctx.lineTo(0, 24 + Math.random() * 8);
        ctx.closePath();
        ctx.fill();

        // Thân phi thuyền
        ctx.shadowColor = eng.tripleLaserTimer > 0 ? '#38bdf8' : '#3b82f6';
        ctx.shadowBlur = 15;
        ctx.fillStyle = eng.tripleLaserTimer > 0 ? '#0284c7' : '#2563eb';
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(18, 16);
        ctx.lineTo(8, 12);
        ctx.lineTo(-8, 12);
        ctx.lineTo(-18, 16);
        ctx.closePath();
        ctx.fill();

        // Cánh & Buồng lái
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(6, 4);
        ctx.lineTo(-6, 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -4, 4, 0, Math.PI * 2);
        ctx.fill();

        // Vòng Khiên bảo hộ (Shield Aura)
        if (eng.shieldActive) {
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, gameState, gameMode, isMuted, highScore, unlockedBadges]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  ARCADE MINI-GAME 2D
                </span>
                <span className="text-xs text-amber-400 font-medium hidden sm:inline">
                  🎯 Mục tiêu: {targetSchool} ({targetScore})
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-serif tracking-tight mt-0.5">
                Đấu Trường Bẻ Bẫy Đề Thi & Chinh Phục Ngân Hà Lộ Trình
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-[560px]">
          
          {/* Left Canvas Arena */}
          <div className="lg:col-span-8 bg-black flex items-center justify-center relative select-none overflow-hidden p-2">
            <canvas
              ref={canvasRef}
              width={500}
              height={560}
              onMouseMove={(e) => {
                if (gameState !== 'playing' || !canvasRef.current) return;
                const rect = canvasRef.current.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                engineRef.current.playerX = Math.max(25, Math.min(canvasRef.current.width - 25, mouseX));
              }}
              onMouseDown={() => {
                if (gameState === 'playing') keysRef.current.shoot = true;
              }}
              onMouseUp={() => {
                keysRef.current.shoot = false;
              }}
              className="border border-slate-800/80 rounded-2xl shadow-inner bg-slate-950 cursor-crosshair max-w-full max-h-[560px]"
            />

            {/* Notification Celebration Banner */}
            {showCelebrationBanner && (
              <div className="absolute top-16 inset-x-8 bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-purple-600/90 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xl border border-amber-300/40 text-center animate-bounce z-20">
                {showCelebrationBanner}
              </div>
            )}

            {/* Live In-Game HUD Overlay */}
            {gameState === 'playing' && (
              <div className="absolute top-4 inset-x-4 pointer-events-none flex items-center justify-between text-xs z-10">
                {/* Lives & Score */}
                <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
                  {gameMode === 'endless' ? (
                    <div className="flex items-center gap-1.5 text-cyan-400 font-extrabold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      <span>VÔ TẬN BẤT TỬ ∞</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-rose-400 font-bold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < engineRef.current.lives ? 'opacity-100 scale-105' : 'opacity-20'}`}>
                          ❤️
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="h-4 w-px bg-slate-700" />
                  <div className="font-mono text-emerald-400 font-bold text-sm">
                    {score.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">điểm</span>
                  </div>
                </div>

                {/* Survival Time & Station & Bombs */}
                <div className="flex items-center gap-2">
                  <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/60 shadow-lg text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1">
                    <span>⏱ {formatTime(survivalSeconds)}</span>
                  </div>

                  {engineRef.current.tripleLaserTimer > 0 && (
                    <span className="text-[10px] font-extrabold text-cyan-300 bg-cyan-950/90 px-2 py-1 rounded-lg border border-cyan-700 animate-pulse">
                      ⚡ 3 TIA
                    </span>
                  )}

                  <button
                    onClick={triggerNukeBomb}
                    className="pointer-events-auto bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                    title="Bấm B hoặc click để quét sạch bẫy"
                  >
                    <Bomb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bom ({engineRef.current.bombs})</span>
                  </button>

                  <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
                    <span className="text-[10px] font-bold text-blue-400">
                      Trạm {engineRef.current.stationIndex}/∞
                    </span>
                    {combo > 1 && (
                      <span className="text-[10px] font-extrabold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800 animate-pulse">
                        COMBO x{combo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Start Intro Overlay */}
            {gameState === 'intro' && (
              <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 animate-bounce">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Chinh Phục Ngân Hà Lộ Trình</h4>
                  <p className="text-xs text-slate-300 max-w-sm mt-1.5 leading-relaxed">
                    Điều khiển <strong>Phi Thuyền Tri Thức</strong>: Bắn nổ cạm bẫy đề thi, thu thập vật phẩm và thăng cấp không giới hạn thời gian!
                  </p>
                </div>

                {/* Mode Selection */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                  <button
                    type="button"
                    onClick={() => setGameMode('endless')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      gameMode === 'endless'
                        ? 'bg-blue-900/40 border-blue-500 ring-2 ring-blue-500/30 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5 text-blue-400">
                      <Sparkles className="w-3.5 h-3.5" /> Chế Độ Vô Tận
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Chơi bao lâu cũng được, mạng bất tử ∞, luyện tập không áp lực!
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGameMode('survival')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      gameMode === 'survival'
                        ? 'bg-amber-900/40 border-amber-500 ring-2 ring-amber-500/30 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5 text-amber-400">
                      <Trophy className="w-3.5 h-3.5" /> Leo Rank Sinh Tồn
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Bắt đầu 3 mạng, nhặt tim hồi máu & bom, tranh cúp Bảng Xếp Hạng!
                    </p>
                  </button>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5 w-full max-w-sm">
                  <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Thao tác điều khiển:
                  </div>
                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span>Di chuyển:</span>
                    <strong className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded">Chuột / Phím A, D, ←, →</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span>Bắn Laser:</span>
                    <strong className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded">Space / Click Chuột</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span>Bom Quét Bẫy:</span>
                    <strong className="text-amber-300 font-mono bg-slate-800 px-2 py-0.5 rounded">Phím B / Nút Bom</strong>
                  </div>
                </div>

                <button
                  onClick={() => startGame(gameMode)}
                  className="w-full max-w-sm py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>BẮT ĐẦU CHINH PHỤC ({gameMode === 'endless' ? 'CHƠI VÔ TẬN' : 'LEO RANK'})</span>
                </button>
              </div>
            )}

            {/* Game Over Overlay (Survival mode) */}
            {gameState === 'gameover' && (
              <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                  <Heart className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white font-serif">Hết Mạng Sinh Tồn!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Bạn có thể hồi sinh để tiếp tục trận đấu bất tận hoặc lưu kỷ lục vào Bảng Xếp Hạng!
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 w-full max-w-sm text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Điểm Số</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">{score.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Thời Gian</div>
                    <div className="text-sm font-bold text-cyan-400 font-mono">{formatTime(survivalSeconds)}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Bẫy Bắn Vỡ</div>
                    <div className="text-sm font-bold text-amber-400 font-mono">{trapsDestroyed}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Trạm Đạt</div>
                    <div className="text-sm font-bold text-purple-400 font-mono">{engineRef.current.stationIndex}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-sm">
                  <button
                    onClick={handleRevive}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>💖 HỒI SINH (+3 MẠNG) CHƠI TIẾP NGAY</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startGame(gameMode)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Chơi Lại Trận Mới</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('leaderboard')}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Xem Bảng Xếp Hạng</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Badges Showcase & Leaderboard */}
          <div className="lg:col-span-4 p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between space-y-4 overflow-y-auto">
            <div className="space-y-4">
              
              {/* Target & Score Summary Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <GraduationCap className="w-4 h-4" />
                    Mục tiêu lộ trình:
                  </span>
                  <span className="font-mono text-amber-400 font-bold">{targetScore || '27.5+'}</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {targetSchool || 'Đại học Kỳ Vọng'}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Kỷ lục cao nhất: <strong className="text-emerald-400 font-mono">{highScore.toLocaleString()}đ</strong></span>
                  <span className="text-cyan-400 font-mono">Trạm: {engineRef.current.stationIndex}/∞</span>
                </div>
              </div>

              {/* Tab Selector: Badges vs Leaderboard */}
              <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                <button
                  onClick={() => setActiveTab('badges')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'badges'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Huy Hiệu</span>
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'leaderboard'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Bảng Xếp Hạng</span>
                </button>
              </div>

              {/* TAB 1: BADGES SHOWCASE */}
              {activeTab === 'badges' && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Award className="w-3.5 h-3.5" />
                      Tiến Trình Huy Hiệu:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Mở: {unlockedBadges.length}/6
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        id: 'b_station_starter',
                        title: 'Khởi Đầu Lộ Trình',
                        desc: 'Đạt từ 300 điểm trong đấu trường',
                        condition: score >= 300 || unlockedBadges.includes('b_station_starter')
                      },
                      {
                        id: 'b_trap_detect',
                        title: 'Thám Tử Bắt Bẫy',
                        desc: 'Bắn hạ ít nhất 3 cạm bẫy đề thi',
                        condition: trapsDestroyed >= 3 || unlockedBadges.includes('b_trap_detect')
                      },
                      {
                        id: 'b_matching_master',
                        title: 'Bậc Thầy Ghép Đôi',
                        desc: 'Đạt chuỗi combo 4 ngọc liên tiếp',
                        condition: combo >= 4 || unlockedBadges.includes('b_matching_master')
                      },
                      {
                        id: 'b_logic_architect',
                        title: 'Kiến Trúc Sư Logic',
                        desc: 'Vượt qua trạm 2 (Đạt 1,000 điểm)',
                        condition: score >= 1000 || unlockedBadges.includes('b_logic_architect')
                      },
                      {
                        id: 'b_streak_hero',
                        title: 'Chuỗi Lửa Kỷ Luật',
                        desc: 'Sống sót 40s hoặc đạt 1,800 điểm',
                        condition: score >= 1800 || unlockedBadges.includes('b_streak_hero')
                      },
                      {
                        id: 'b_mastery_summit',
                        title: 'Thủ Khoa Đích Thực 9+',
                        desc: 'Ghi 2,500 điểm hoặc hạ 12 cạm bẫy',
                        condition: score >= 2500 || trapsDestroyed >= 12 || unlockedBadges.includes('b_mastery_summit')
                      }
                    ].map((badge) => {
                      const isUnlocked = badge.condition || unlockedBadges.includes(badge.id);
                      const isFocus = focusBadgeId === badge.id;

                      return (
                        <div
                          key={badge.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                            isUnlocked
                              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                              : isFocus
                                ? 'bg-blue-950/60 border-blue-500 text-blue-200 ring-1 ring-blue-500/40'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold flex items-center gap-1.5 text-[11px]">
                              {badge.title}
                              {isFocus && !isUnlocked && (
                                <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-normal">
                                  Đang chọn
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{badge.desc}</div>
                          </div>

                          <div>
                            {isUnlocked ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/40">
                                <CheckCircle2 className="w-3 h-3" /> Đã Mở
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">Chưa đạt</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: LEADERBOARD SHOWCASE */}
              {activeTab === 'leaderboard' && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Trophy className="w-3.5 h-3.5" />
                      Top Cao Thủ Chinh Phục:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Cập nhật liên tục
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                    {leaderboard.map((player) => {
                      let medalBadge = (
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-bold text-[10px] flex items-center justify-center">
                          {player.rank}
                        </span>
                      );
                      let rowStyle = 'bg-slate-900/50 border-slate-800/80 text-slate-300';

                      if (player.rank === 1) {
                        medalBadge = <span className="text-base" title="Top 1 Thủ Khoa">🥇</span>;
                        rowStyle = 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-xs';
                      } else if (player.rank === 2) {
                        medalBadge = <span className="text-base" title="Top 2 Á Khoa">🥈</span>;
                        rowStyle = 'bg-slate-800/80 border-slate-600/60 text-slate-100';
                      } else if (player.rank === 3) {
                        medalBadge = <span className="text-base" title="Top 3">🥉</span>;
                        rowStyle = 'bg-amber-950/25 border-amber-800/50 text-amber-100';
                      }

                      if (player.isCurrentUser) {
                        rowStyle = 'bg-blue-950/70 border-blue-500 text-blue-100 ring-1 ring-blue-500/60';
                      }

                      return (
                        <div
                          key={player.rank}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${rowStyle}`}
                        >
                          <div className="flex items-center gap-2">
                            {medalBadge}
                            <div>
                              <div className="font-bold flex items-center gap-1.5 text-[11px]">
                                <span>{player.name}</span>
                                {player.isCurrentUser && (
                                  <span className="text-[9px] bg-blue-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                                    BẠN
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                {player.school}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-mono font-extrabold text-emerald-400 text-xs">
                              {player.score.toLocaleString()}đ
                            </div>
                            <div className="text-[9px] text-slate-400">
                              ⏱ {player.timeAliveStr} • 💥 {player.trapsDestroyed} bẫy
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls Notice */}
            <div className="pt-2 text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
              💡 <strong>Bí quyết sinh tồn:</strong> Nhặt <span className="text-pink-400 font-bold">Trái Tim (+1 Mạng)</span>, <span className="text-cyan-400 font-bold">Laser 3 Tia</span> và kích hoạt <span className="text-amber-400 font-bold">Bom (Phím B)</span> khi cạm bẫy xuất hiện dày đặc!
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
