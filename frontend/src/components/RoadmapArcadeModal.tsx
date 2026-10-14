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
  GraduationCap
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

// Danh mục cạm bẫy đề thi và ngọc tri thức
const TRAP_LABELS = [
  'Bẫy Quên ĐKXĐ',
  'Bẫy Đổi Dấu Đạo Hàm',
  'Bẫy Paraphrase Lạc Đề',
  'Bẫy Đơn Vị Vật Lý',
  'Bẫy Ngoại Lệ Este',
  'Bẫy Bấm Nhầm Casio',
  'Bẫy Cận Tích Phân',
  'Bẫy Giả Thiết Khống'
];

const ORB_LABELS = [
  'Định Lý Cốt Lõi',
  'Vá Lỗ Hổng 8+',
  'Bổ Đề Đối Xứng',
  'Tư Duy Phản Biện',
  'Kỹ Thuật PEEL',
  'Phương Pháp Socratic',
  'Công Thức Vàng'
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
  const [score, setScore] = useState(0);
  const [trapsDestroyed, setTrapsDestroyed] = useState(0);
  const [orbsCollected, setOrbsCollected] = useState(0);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('eduadvisor_arcade_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<string[]>([]);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Game Loop Refs
  const animFrameRef = useRef<number | null>(null);
  const keysRef = useRef<{ left: boolean; right: boolean; shoot: boolean }>({
    left: false,
    right: false,
    shoot: false
  });

  // Game state engine refs
  const engineRef = useRef({
    playerX: 250,
    playerY: 480,
    playerWidth: 44,
    playerHeight: 44,
    playerSpeed: 7,
    lives: 3,
    invincibleTime: 0,
    shieldActive: false,
    shieldTimer: 0,
    lasers: [] as Array<{ x: number; y: number; vy: number }>,
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
      type: 'normal' | 'rare' | 'vdc' | 'shield';
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

  // Sound Synthesizer via Web Audio API
  const playSound = (type: 'laser' | 'orb' | 'explode' | 'shield' | 'badge' | 'hit') => {
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
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'orb') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.12); // G5
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'explode') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.28);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'shield') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'badge') {
        // Chime Fanfare
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
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
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {}
  };

  // Khởi tạo các vì sao nền
  const initStars = (width: number, height: number) => {
    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.5 + Math.random() * 2.5,
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.7
      });
    }
    return stars;
  };

  // Bắt đầu màn chơi
  const startGame = () => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 500;
    const h = canvas ? canvas.height : 560;

    engineRef.current = {
      playerX: w / 2,
      playerY: h - 60,
      playerWidth: 44,
      playerHeight: 44,
      playerSpeed: 7,
      lives: 3,
      invincibleTime: 60,
      shieldActive: false,
      shieldTimer: 0,
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
    setGameState('playing');
  };

  // Kiểm tra mở khóa huy hiệu real-time
  const checkBadgeUnlocks = (currentScore: number, destroyed: number, streakCombo: number, aliveSec: number) => {
    const eng = engineRef.current;
    const toUnlock: string[] = [];

    // 1. b_station_starter: Khởi đầu lộ trình (điểm >= 300)
    if (currentScore >= 300 && !unlockedBadges.includes('b_station_starter') && !eng.sessionBadgesUnlocked.includes('b_station_starter')) {
      toUnlock.push('b_station_starter');
    }
    // 2. b_trap_detect: Thám tử bắt bẫy (phá >= 3 bẫy)
    if (destroyed >= 3 && !unlockedBadges.includes('b_trap_detect') && !eng.sessionBadgesUnlocked.includes('b_trap_detect')) {
      toUnlock.push('b_trap_detect');
    }
    // 3. b_matching_master: Bậc thầy ghép đôi (combo >= 4)
    if (streakCombo >= 4 && !unlockedBadges.includes('b_matching_master') && !eng.sessionBadgesUnlocked.includes('b_matching_master')) {
      toUnlock.push('b_matching_master');
    }
    // 4. b_logic_architect: Kiến trúc sư logic (vượt trạm 2 / điểm >= 1000)
    if (currentScore >= 1000 && !unlockedBadges.includes('b_logic_architect') && !eng.sessionBadgesUnlocked.includes('b_logic_architect')) {
      toUnlock.push('b_logic_architect');
    }
    // 5. b_streak_hero: Chuỗi lửa kỷ luật (sống sót >= 40s hoặc điểm >= 1800)
    if ((aliveSec >= 40 || currentScore >= 1800) && !unlockedBadges.includes('b_streak_hero') && !eng.sessionBadgesUnlocked.includes('b_streak_hero')) {
      toUnlock.push('b_streak_hero');
    }
    // 6. b_mastery_summit: Thủ khoa 9+ (điểm >= 2500 hoặc phá >= 12 bẫy)
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
        eng.lasers.push({
          x: eng.playerX,
          y: eng.playerY - 22,
          vy: -11
        });
        eng.shootCooldown = 12; // Bắn liên tục mượt mà
        playSound('laser');
      }

      // Invincible / Shield timers
      if (eng.invincibleTime > 0) eng.invincibleTime--;
      if (eng.shieldTimer > 0) {
        eng.shieldTimer--;
        if (eng.shieldTimer === 0) eng.shieldActive = false;
      }

      eng.timeAlive += 1 / 60;
      eng.stationProgress += 0.08;
      if (eng.stationProgress >= 100) {
        eng.stationProgress = 0;
        eng.stationIndex = Math.min(7, eng.stationIndex + 1);
        playSound('badge');
      }

      // 2. Spawn Elements
      eng.spawnTimer++;
      if (eng.spawnTimer % 45 === 0) {
        // Spawn Trap (Cạm bẫy đề thi)
        const trapText = TRAP_LABELS[Math.floor(Math.random() * TRAP_LABELS.length)];
        const isBigTrap = Math.random() < 0.25;
        eng.enemies.push({
          id: Date.now() + Math.random(),
          x: 40 + Math.random() * (w - 80),
          y: -40,
          radius: isBigTrap ? 26 : 18,
          vy: 2.2 + Math.random() * 1.8,
          hp: isBigTrap ? 3 : 1,
          maxHp: isBigTrap ? 3 : 1,
          label: trapText,
          color: isBigTrap ? '#ef4444' : '#f97316'
        });
      }

      if (eng.spawnTimer % 65 === 0) {
        // Spawn Knowledge Orb
        const roll = Math.random();
        let orbType: 'normal' | 'rare' | 'vdc' | 'shield' = 'normal';
        let orbPts = 100;
        let orbCol = '#10b981';

        if (roll < 0.15) {
          orbType = 'shield';
          orbPts = 150;
          orbCol = '#a855f7';
        } else if (roll < 0.35) {
          orbType = 'vdc';
          orbPts = 400;
          orbCol = '#f59e0b';
        } else if (roll < 0.7) {
          orbType = 'rare';
          orbPts = 250;
          orbCol = '#3b82f6';
        }

        const orbText = ORB_LABELS[Math.floor(Math.random() * ORB_LABELS.length)];
        eng.orbs.push({
          id: Date.now() + Math.random(),
          x: 35 + Math.random() * (w - 70),
          y: -30,
          radius: 16,
          vy: 1.8 + Math.random() * 1.2,
          type: orbType,
          label: orbText,
          points: orbPts,
          color: orbCol
        });
      }

      // 3. Update Lasers
      for (let i = eng.lasers.length - 1; i >= 0; i--) {
        const l = eng.lasers[i];
        l.y += l.vy;
        if (l.y < -10) {
          eng.lasers.splice(i, 1);
          continue;
        }

        // Kiểm tra va chạm Laser với Cạm bẫy
        for (let j = eng.enemies.length - 1; j >= 0; j--) {
          const e = eng.enemies[j];
          const dist = Math.hypot(l.x - e.x, l.y - e.y);
          if (dist < e.radius + 6) {
            e.hp--;
            eng.lasers.splice(i, 1);

            // Tạo tia lửa
            for (let p = 0; p < 8; p++) {
              eng.particles.push({
                x: l.x,
                y: l.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 15,
                maxLife: 15,
                color: '#38bdf8',
                size: 2.5
              });
            }

            if (e.hp <= 0) {
              // Bẫy bị tiêu diệt
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

        // Va chạm người chơi
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
            // Dính bẫy
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
              if (localScore > highScore) {
                setHighScore(Math.floor(localScore));
                localStorage.setItem('eduadvisor_arcade_highscore', Math.floor(localScore).toString());
              }
              return;
            }
          }
        }

        if (e.y > h + 50) {
          eng.enemies.splice(i, 1);
        }
      }

      // 5. Update Orbs (Ngọc tri thức)
      for (let i = eng.orbs.length - 1; i >= 0; i--) {
        const o = eng.orbs[i];
        o.y += o.vy;

        // Thu thập ngọc
        const distToPlayer = Math.hypot(eng.playerX - o.x, eng.playerY - o.y);
        if (distToPlayer < o.radius + eng.playerWidth / 2) {
          localOrbs++;
          setOrbsCollected(localOrbs);
          localCombo++;
          setCombo(localCombo);

          if (o.type === 'shield') {
            eng.shieldActive = true;
            eng.shieldTimer = 300; // 5 giây khiên
            playSound('shield');
          } else {
            playSound('orb');
          }

          localScore += o.points * (1 + localCombo * 0.15);
          setScore(Math.floor(localScore));

          // Hạt lấp lánh khi nhặt ngọc
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

      // Thắng lợi khi đạt mục tiêu lớn (Score >= 3500)
      if (localScore >= 3500) {
        setGameState('victory');
        playSound('badge');
        if (onBonusExerciseSolved) onBonusExerciseSolved();
        return;
      }

      // ================= DRAWING SECTION =================
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Gradient Nebula
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.8);
      bgGrad.addColorStop(0, '#111827');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#030712');
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
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(l.x - 2, l.y - 12, 4, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(l.x - 1, l.y - 10, 2, 12);
        ctx.shadowBlur = 0;
      });

      // Enemies (Cạm bẫy đề thi)
      eng.enemies.forEach(e => {
        ctx.save();
        ctx.translate(e.x, e.y);

        // Glow
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 14;

        // Shape: Octagon / Asteroid
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

        // Nhãn cảnh báo cạm bẫy
        ctx.font = 'bold 9px system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(e.label, 0, e.radius + 12);

        // Thanh máu nếu HP > 1
        if (e.maxHp > 1) {
          const barW = 28;
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(-barW / 2, -e.radius - 8, barW, 4);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(-barW / 2, -e.radius - 8, (barW * e.hp) / e.maxHp, 4);
        }

        ctx.restore();
      });

      // Orbs (Ngọc tri thức)
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

        // Nhãn ngọc
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

        // Luồng lửa phản lực
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#fb923c';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(-8, 16);
        ctx.lineTo(8, 16);
        ctx.lineTo(0, 24 + Math.random() * 8);
        ctx.closePath();
        ctx.fill();

        // Thân phi thuyền Cyber Sci-fi
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#2563eb';
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
          ctx.shadowBlur = 15;
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
  }, [isOpen, gameState, isMuted, highScore, unlockedBadges]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-slate-100">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800">
                  Arcade Mini-Game 2D
                </span>
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  Mục tiêu: {targetSchool || 'Đại Học Top 1'} ({targetScore || '28.5+'})
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5 flex items-center gap-2">
                Đấu Trường Bẻ Bẫy Đề Thi & Chinh Phục Lộ Trình
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Đóng game"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Canvas + Live HUD Sidebar */}
        <div className="flex-1 grid lg:grid-cols-12 overflow-hidden bg-slate-950">
          
          {/* Left: Interactive Canvas Game Area */}
          <div className="lg:col-span-8 relative flex items-center justify-center p-3 sm:p-5 bg-black/40">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl w-full max-w-[500px] aspect-[5/5.6]">
              <canvas
                ref={canvasRef}
                width={500}
                height={560}
                className="w-full h-full block bg-[#090d16] cursor-crosshair"
                onMouseMove={(e) => {
                  if (gameState !== 'playing') return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const scaleX = 500 / rect.width;
                  const x = (e.clientX - rect.left) * scaleX;
                  engineRef.current.playerX = Math.max(30, Math.min(470, x));
                }}
                onMouseDown={() => {
                  if (gameState === 'playing') {
                    keysRef.current.shoot = true;
                  }
                }}
                onMouseUp={() => {
                  keysRef.current.shoot = false;
                }}
                onTouchMove={(e) => {
                  if (gameState !== 'playing') return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const touch = e.touches[0];
                  const scaleX = 500 / rect.width;
                  const x = (touch.clientX - rect.left) * scaleX;
                  engineRef.current.playerX = Math.max(30, Math.min(470, x));
                }}
                onTouchStart={() => {
                  if (gameState === 'playing') keysRef.current.shoot = true;
                }}
                onTouchEnd={() => {
                  keysRef.current.shoot = false;
                }}
              />

              {/* In-Game Live HUD Overlay */}
              {gameState === 'playing' && (
                <div className="absolute top-3 inset-x-3 pointer-events-none flex items-center justify-between text-xs">
                  {/* Lives & Score */}
                  <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
                    <div className="flex items-center gap-1 text-rose-400 font-bold">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`text-base ${i < engineRef.current.lives ? 'opacity-100' : 'opacity-25'}`}>
                          ❤️
                        </span>
                      ))}
                    </div>
                    <div className="h-4 w-px bg-slate-700" />
                    <div className="font-mono text-emerald-400 font-bold text-sm">
                      {score.toLocaleString()} <span className="text-[10px] text-slate-400">Điểm</span>
                    </div>
                  </div>

                  {/* Trạm Lộ trình & Combo */}
                  <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
                    <span className="text-[10px] font-bold text-blue-400">
                      Trạm {engineRef.current.stationIndex}/7
                    </span>
                    {combo > 1 && (
                      <span className="text-[10px] font-extrabold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800 animate-pulse">
                        COMBO x{combo}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Start Intro Overlay */}
              {gameState === 'intro' && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 animate-bounce">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Chinh Phục Ngân Hà Lộ Trình</h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                      Điều khiển <strong>Phi Thuyền Tri Thức</strong>: Bắn nổ các cạm bẫy đề thi, thu thập ngọc kiến thức để mở khóa huy hiệu thật!
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-left text-xs space-y-2 w-full max-w-xs">
                    <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Hướng dẫn thao tác:
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Di chuyển phi thuyền:</span>
                      <strong className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded">Chuột / Phím A, D, ←, →</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Bắn Tia Laser Tư Duy:</span>
                      <strong className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded">Space / Click Chuột</strong>
                    </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="w-full max-w-xs py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>BẮT ĐẦU CHINH PHỤC NGAY</span>
                  </button>
                </div>
              )}

              {/* Game Over Overlay */}
              {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                    <RotateCcw className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Kết Thúc Đợt Chinh Phục!</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Bạn đã chiến đấu kiên cường trước các cạm bẫy đề thi hiểm hóc.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full max-w-xs text-center">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Điểm Số</div>
                      <div className="text-sm font-bold text-emerald-400 font-mono">{score}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Bẫy Bắn Vỡ</div>
                      <div className="text-sm font-bold text-amber-400 font-mono">{trapsDestroyed}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Ngọc Thu Thập</div>
                      <div className="text-sm font-bold text-blue-400 font-mono">{orbsCollected}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full max-w-xs">
                    <button
                      onClick={startGame}
                      className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Chơi Lại Trận Mới</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Xong
                    </button>
                  </div>
                </div>
              )}

              {/* Victory Overlay */}
              {gameState === 'victory' && (
                <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/20 animate-bounce">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">🏆 THỦ KHOA CHINH PHỤC THÀNH CÔNG!</h4>
                    <p className="text-xs text-amber-300 mt-1">
                      Đạt đỉnh điểm số {score}đ • Vượt qua toàn bộ ma trận cạm bẫy!
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-2xl text-xs text-emerald-300 max-w-xs">
                    🎉 Tất cả huy hiệu mục tiêu liên quan đã được mở khóa và lưu vĩnh viễn vào hồ sơ học viên!
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full max-w-xs py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/30"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Nhận Danh Hiệu & Quay Về Tủ Huy Hiệu</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Live Mission Progress & Badges Showcase */}
          <div className="lg:col-span-4 p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between space-y-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Mission Target Box */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <GraduationCap className="w-4 h-4" />
                    Mục tiêu lộ trình:
                  </span>
                  <span className="font-mono text-amber-400">{targetScore || '28.5+'}</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {targetSchool || 'Trường Đại học Kỳ Vọng'}
                </div>
                <div className="text-xs text-slate-400">
                  Tổ hợp: {targetSubject || 'Toán, Lý, Hóa / IELTS'}
                </div>
              </div>

              {/* Real-time Achievement Unlocks in Game */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Award className="w-3.5 h-3.5" />
                    Tiến Trình Mở Khóa Huy Hiệu Trong Trận:
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Kỷ lục: {highScore}đ
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
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          isUnlocked
                            ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                            : isFocus
                              ? 'bg-blue-950/60 border-blue-500 text-blue-200 ring-1 ring-blue-500/40'
                              : 'bg-slate-900/50 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold flex items-center gap-1.5">
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
            </div>

            {/* Bottom Controls Notice */}
            <div className="pt-2 text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
              💡 <strong>Mẹo Thủ Khoa:</strong> Bắn các <span className="text-orange-400 font-bold">Cạm Bẫy Đề Thi</span> để kích hoạt combo điểm số và nhặt <span className="text-purple-400 font-bold">Khiên Thủ Khoa</span> để bất tử khi tiến sâu vào các trạm vận dụng cao!
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
