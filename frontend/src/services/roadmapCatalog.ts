import { geminiService } from './geminiService';
import { getAlternateQuestionsForStation } from './stationQuestionBank';
import { buildAdaptiveStations } from './adaptiveStationBuilder';

export interface WorkedExampleStep {
  stepNum: number;
  action: string;
  explanation: string;
}

export interface WorkedExample {
  title: string;
  problem: string;
  level: 'Cơ bản' | 'Nền tảng' | 'Vận dụng' | 'Vận dụng cao 9+';
  patternRecognition: string; // Dấu hiệu nhận diện dạng bài trong 5s
  steps: WorkedExampleStep[];
  finalAnswer: string;
  verificationTrick: string; // Mẹo thử lại / Bấm máy tính / Kiểm tra biên
  alternativeMethod?: string;
}

export interface PracticeQuestionWithHints {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  hints: string[]; // [Gợi ý 1: Định hướng, Gợi ý 2: Bước tính then chốt]
  explanation: string;
  trapAnalysis: string; // Phân tích nguyên nhân sai của các phương án nhiễu
  remedyTopic?: string; // Kiến thức cần ôn lại nếu chọn sai
}

export interface StationLearningOutcomes {
  understand: string[]; // Hiểu được bản chất gì
  canDo: string[]; // Làm được kỹ năng gì
  keyConcept: string; // Trọng tâm then chốt nhất
  prerequisites: string; // Kiến thức cần có trước
  scoreImpact: string; // Đóng góp bao nhiêu điểm vào mục tiêu
  whyThisStation: string; // Lý do xuất hiện trong lộ trình
}

export interface FormulaItem {
  name: string;
  formula: string;
  note: string;
}

export interface TrapItem {
  trap: string;
  howToAvoid: string;
}

export interface StationTheory {
  overview: string; // Bản chất khái niệm
  deepExplanation: string; // Phân tích chuyên sâu
  keyFormulas: FormulaItem[]; // Công thức & điều kiện áp dụng
  commonTraps: TrapItem[]; // Bẫy đề thi & lỗi ngộ nhận
  summaryTakeaways: string[]; // Thẻ tóm tắt cần nhớ (1 phút)
}

export interface LearningNode {
  id: string;
  stationNumber: number;
  stageId: number;
  stageName: string;
  stageFocus: string;
  title: string;
  subject: string;
  difficulty: 'Nền tảng' | 'Vận dụng' | 'Vận dụng cao 9+';
  summary: string;
  keyFormula: string;
  status: 'completed' | 'active' | 'locked';
  xp: number;
  estimatedMinutes: number;
  scoreContribution: string;
  outcomes: StationLearningOutcomes;
  theory: StationTheory;
  workedExamples: WorkedExample[];
  practiceQuestions: PracticeQuestionWithHints[];
  masteryTest: PracticeQuestionWithHints[];
  isRemedial?: boolean;
}

export interface PresetRoadmap {
  id: string;
  name: string;
  goal: string;
  score: string;
  days: number;
  dailyHours: number;
  description: string;
  readinessInitial: number;
  coachAdvice: string;
  nodes: LearningNode[];
}

// ============================================================
// 1. PRESET: THPT QUỐC GIA KHỐI A00 (TOÁN - LÝ - HÓA 27.5+)
// ============================================================
export const ROADMAP_THPT_A00: LearningNode[] = [
  // GIAI ĐOẠN 1: CHẨN ĐOÁN & VÁ LỖ HỔNG NỀN TẢNG
  {
    id: 'a00_node_1',
    stationNumber: 1,
    stageId: 1,
    stageName: 'Giai đoạn 1: Chẩn đoán & Củng cố nền tảng cốt lõi',
    stageFocus: 'Quét sạch lỗ hổng 35 câu đầu & Xây dựng phản xạ công thức không bao giờ sai',
    title: 'Đại cương Dao động điều hòa & Kỹ thuật Vòng tròn lượng giác đa trục',
    subject: 'Vật lý 12',
    difficulty: 'Nền tảng',
    summary: 'Làm chủ mối quan hệ vuông pha giữa x, v, a và trục thời gian để giải quyết 100% bài toán tìm thời điểm trong 15 giây.',
    keyFormula: 'x = A cos(ωt + φ), v = ωA cos(ωt + φ + π/2), a = ω²A cos(ωt + φ + π)',
    status: 'completed',
    xp: 40,
    estimatedMinutes: 12,
    scoreContribution: '+0.5 Điểm (Câu 1 - 20 Đề thi)',
    outcomes: {
      understand: [
        'Bản chất dao động điều hòa là hình chiếu của chuyển động tròn đều lên một trục tọa độ.',
        'Mối quan hệ lệch pha: v sớm pha π/2 so với x; a ngược pha với x và sớm pha π/2 so với v.'
      ],
      canDo: [
        'Biểu diễn tức thời trạng thái dao động (x, v) trên vòng tròn đa trục.',
        'Tính nhanh khoảng thời gian ngắn nhất vật đi từ li độ x₁ đến x₂ bằng góc quét Δφ = ω.Δt.'
      ],
      keyConcept: 'Kỹ thuật trục thời gian phân bố đặc biệt: A/2, A√2/2, A√3/2 tương ứng góc 60°, 45°, 30°.',
      prerequisites: 'Định nghĩa hàm lượng giác cơ bản sin, cos và đơn vị radian lớp 11.',
      scoreImpact: 'Ăn chắc 0.5 - 0.75 điểm câu nhận biết và thông hiểu trong đề thi chính thức.',
      whyThisStation: 'Khởi đầu lộ trình Vật lý: Nếu không nắm vững vòng tròn đa trục, bạn sẽ bị bế tắc hoàn toàn ở phần Sóng cơ và Mạch điện xoay chiều RLC.'
    },
    theory: {
      overview: 'Dao động điều hòa không phải là chuyển động thẳng đều hay biến đổi đều. Gia tốc biến thiên liên tục tỉ lệ nghịch với li độ: a = -ω²x. Lực kéo về luôn hướng về vị trí cân bằng và đổi chiều tại x = 0.',
      deepExplanation: 'Khi biểu diễn bằng vectơ quay Fresnel: Vectơ li độ OM dài A quay với tốc độ góc ω. Trục x nằm ngang, trục v hướng xuống dưới (vì v sớm pha π/2), trục a ngược hướng trục x. Nhờ đó, tại bất kỳ thời điểm nào ta chỉ cần chiếu một điểm M duy nhất lên 3 trục là đọc được cả x, v, a mà không cần bấm máy tính.',
      keyFormulas: [
        { name: 'Hệ thức độc lập thời gian', formula: 'x² + (v/ω)² = A² = (a/ω²)² + (v/ω)²', note: 'Áp dụng cho mọi đại lượng vuông pha' },
        { name: 'Góc quét thời gian', formula: 'Δt = Δφ / ω = (Δφ / 360°) × T', note: 'Δφ tính bằng độ hoặc radian' },
        { name: 'Vận tốc & Gia tốc cực đại', formula: 'v_max = ωA; a_max = ω²A', note: 'v_max tại VTCB, a_max tại biên âm' }
      ],
      commonTraps: [
        { trap: 'Nhầm lẫn giữa tốc độ (độ lớn |v|) và vận tốc (đại số v mang dấu âm/dương).', howToAvoid: 'Đọc kỹ đề: Tốc độ luôn không âm; vận tốc âm khi vật chuyển động theo chiều âm.' },
        { trap: 'Quên đổi đơn vị giữa cm và m khi tính gia tốc hoặc năng lượng.', howToAvoid: 'Quy ước ngay: x (cm) thì a (cm/s²); khi tính cơ năng W = 1/2 m ω² A² bắt buộc A phải đổi ra mét (m).' }
      ],
      summaryTakeaways: [
        'Qua VTCB: |x| = 0, |v| max, |a| = 0, lực hồi phục = 0.',
        'Tại Biên: |x| = A max, |v| = 0, |a| max, thế năng cực đại.',
        'Thời gian đi từ 0 đến A/2 là T/12; từ A/2 đến A là T/6 (không bằng nhau!).'
      ]
    },
    workedExamples: [
      {
        title: 'Ví dụ 1: Xác định thời gian chuyển động bằng góc quét',
        problem: 'Một vật dao động điều hòa với chu kỳ T = 2s, biên độ A = 8 cm. Tìm thời gian ngắn nhất để vật đi từ vị trí x₁ = 4 cm theo chiều dương đến vị trí x₂ = -4√3 cm theo chiều âm.',
        level: 'Vận dụng',
        patternRecognition: 'Cho 2 trạng thái có kèm chiều chuyển động ⟹ Dùng ngay vòng tròn lượng giác xác định 2 vị trí M₁ và M₂.',
        steps: [
          { stepNum: 1, action: 'Xác định điểm pha ban đầu M₁', explanation: 'x₁ = 4 = A/2 và v > 0 (chiều dương) ⟹ Điểm M₁ nằm ở nửa dưới đường tròn, pha ban đầu φ₁ = -π/3 (-60°).' },
          { stepNum: 2, action: 'Xác định điểm đích M₂', explanation: 'x₂ = -4√3 = -A√3/2 và v < 0 (chiều âm) ⟹ Điểm M₂ nằm ở nửa trên đường tròn, góc pha φ₂ = +5π/6 (+150°).' },
          { stepNum: 3, action: 'Tính góc quét từ M₁ đến M₂ theo chiều ngược kim đồng hồ', explanation: 'Góc quét Δφ = |-60°| + 150° = 60° + 150° = 210°.' },
          { stepNum: 4, action: 'Quy đổi góc quét ra thời gian', explanation: 'Δt = (210° / 360°) × T = (7/12) × 2 = 7/6 giây ≈ 1.167s.' }
        ],
        finalAnswer: 'Δt = 7/6 giây (khoảng 1.17s)',
        verificationTrick: 'Chia nhỏ chặng: 4 cm -> Biên dương 8 cm (T/6) -> 0 (T/4) -> -4√3 cm (T/6). Tổng = T/6 + T/4 + T/6 = 7T/12 = 7/6s. Khớp hoàn toàn!',
        alternativeMethod: 'Sử dụng trục phân bố thời gian: t = t(4→8) + t(8→0) + t(0→-4√3) = T/6 + T/4 + T/6 = 7T/12.'
      }
    ],
    practiceQuestions: [
      {
        id: 'a00_q1_1',
        question: 'Một chất điểm dao động điều hòa với phương trình x = 6cos(2πt - π/6) (cm). Kể từ t = 0, chất điểm đi qua vị trí có li độ x = -3 cm theo chiều dương lần thứ nhất tại thời điểm:',
        options: ['t = 7/12 s', 't = 5/12 s', 't = 11/12 s', 't = 1/2 s'],
        correctAnswer: 0,
        hints: [
          'Gợi ý 1: Xác định điểm pha ban đầu tại t = 0 ứng với góc φ = -π/6 (-30°).',
          'Gợi ý 2: Vị trí x = -3 cm = -A/2 theo chiều dương nằm ở nửa dưới đường tròn, góc pha là -2π/3 (-120°). Góc quét là từ -30° quay theo chiều dương tới -120° (tức quét qua góc 210°).'
        ],
        explanation: 'Tại t = 0, pha dao động là -π/6 (nửa dưới). Vị trí x = -A/2 theo chiều dương có pha là -2π/3 (nửa dưới). Góc quay từ -30° đến -120° theo chiều dương là: Δφ = 30° + 180° = 210° (hoặc 7π/6 rad). Thời gian t = Δφ / ω = (7π/6) / (2π) = 7/12 giây.',
        trapAnalysis: 'Đáp án B (5/12s) là sai do học sinh tính nhầm chiều quay ngược chiều dương. Đáp án C (11/12s) là thời điểm vật qua lần thứ 2.',
        remedyTopic: 'Kỹ thuật xác định góc quét trên đường tròn lượng giác'
      },
      {
        id: 'a00_q1_2',
        question: 'Khi một vật dao động điều hòa chuyển động từ vị trí biên về vị trí cân bằng thì:',
        options: [
          'Vectơ gia tốc và vectơ vận tốc cùng chiều (chuyển động nhanh dần)',
          'Vectơ gia tốc và vectơ vận tốc ngược chiều (chuyển động chậm dần)',
          'Li độ và gia tốc biến thiên cùng chiều',
          'Thế năng tăng dần, động năng giảm dần'
        ],
        correctAnswer: 0,
        hints: [
          'Gợi ý 1: Nhớ lại định lý động lực học: vật đi từ biên về VTCB thì tốc độ tăng hay giảm?',
          'Gợi ý 2: Chuyển động nhanh dần thì vectơ vận tốc v và vectơ gia tốc a cùng chiều (a.v > 0).'
        ],
        explanation: 'Từ biên về VTCB, tốc độ tăng từ 0 lên v_max nên đây là chuyển động nhanh dần (không đều). Trong chuyển động nhanh dần, vectơ gia tốc a và vectơ vận tốc v luôn cùng hướng.',
        trapAnalysis: 'Nhiều bạn nhầm chuyển động dao động là "nhanh dần đều" - Sai! Vì gia tốc a = -ω²x biến thiên liên tục chứ không phải hằng số hằng định.',
        remedyTopic: 'Tính chất chuyển động và vectơ gia tốc trong dao động điều hòa'
      }
    ],
    masteryTest: [
      {
        id: 'a00_m1_1',
        question: 'Một con lắc lò xo dao động điều hòa có li độ x = 3 cm thì vận tốc v = 40 cm/s, khi li độ x = 4 cm thì vận tốc v = 30 cm/s. Biên độ dao động A và tần số góc ω của con lắc là:',
        options: ['A = 5 cm, ω = 10 rad/s', 'A = 5 cm, ω = 20 rad/s', 'A = 10 cm, ω = 10 rad/s', 'A = 25 cm, ω = 5 rad/s'],
        correctAnswer: 0,
        hints: ['Sử dụng hệ thức độc lập thời gian x² + (v/ω)² = A² cho hai cặp giá trị.'],
        explanation: 'Ta có hệ: 3² + (40/ω)² = A² và 4² + (30/ω)² = A². Trừ 2 vế: (16 - 9) = (1600 - 900)/ω² ⟹ 7 = 700/ω² ⟹ ω² = 100 ⟹ ω = 10 rad/s. Thay vào ta được: A² = 3² + (40/10)² = 9 + 16 = 25 ⟹ A = 5 cm.',
        trapAnalysis: 'Học sinh hay bấm máy tính nhầm đơn vị hoặc quên lấy căn bậc hai của 25.',
        remedyTopic: 'Hệ thức vuông pha độc lập thời gian'
      },
      {
        id: 'a00_m1_2',
        question: 'Lực kéo về tác dụng lên một chất điểm dao động điều hòa có độ lớn:',
        options: [
          'Tỉ lệ thuận với độ lớn của li độ và luôn hướng về vị trí cân bằng',
          'Là hằng số không đổi trong suốt quá trình dao động',
          'Tỉ lệ với bình phương li độ x',
          'Đạt cực đại khi vật đi qua vị trí cân bằng'
        ],
        correctAnswer: 0,
        hints: ['Công thức lực kéo về: F_kv = -kx = -mω²x.'],
        explanation: 'F_kv = -mω²x ⟹ Độ lớn |F_kv| = mω²|x| tỉ lệ thuận với |x| và dấu trừ biểu thị luôn hướng về VTCB.',
        trapAnalysis: 'Nhầm lẫn giữa lực kéo về và lực đàn hồi con lắc lò xo thẳng đứng.',
        remedyTopic: 'Lực hồi phục (kéo về) trong dao động điều hòa'
      }
    ]
  },

  {
    id: 'a00_node_2',
    stationNumber: 2,
    stageId: 1,
    stageName: 'Giai đoạn 1: Chẩn đoán & Củng cố nền tảng cốt lõi',
    stageFocus: 'Quét sạch lỗ hổng 35 câu đầu & Xây dựng phản xạ công thức không bao giờ sai',
    title: 'Phương trình & Bất phương trình Mũ - Logarit: Xử lý Điều kiện xác định & Đặt ẩn phụ',
    subject: 'Toán học',
    difficulty: 'Nền tảng',
    summary: 'Phòng chống bẫy nghiệm ngoại lai, mẹo đổi cơ số logarit và kỹ thuật đặt ẩn phụ t = a^x (t > 0).',
    keyFormula: 'log_a(f(x)) = b ⟺ f(x) = a^b (với a > 0, a ≠ 1); log_a(f(x)) < log_a(g(x)) đảo chiều khi 0 < a < 1',
    status: 'active',
    xp: 40,
    estimatedMinutes: 14,
    scoreContribution: '+0.4 Điểm (Câu 21 - 32 Đề thi)',
    outcomes: {
      understand: [
        'Điều kiện tồn tại của logarit log_a(b): cơ số 0 < a ≠ 1 và biểu thức b > 0.',
        'Sự đổi chiều của bất phương trình logarit khi cơ số nằm trong khoảng (0; 1).'
      ],
      canDo: [
        'Đặt ẩn phụ chuẩn xác cho phương trình dạng a^(2x) + m.a^x + n = 0 kèm điều kiện t > 0.',
        'Sử dụng máy tính Casio để quét nghiệm (Table) và cô lập tham số kiểm tra nhanh.'
      ],
      keyConcept: 'Luôn tìm điều kiện xác định TRƯỚC KHI biến đổi công thức hạ bậc hoặc nhân chia logarit.',
      prerequisites: 'Quy tắc lũy thừa căn bản và giải phương trình bậc hai tam thức.',
      scoreImpact: 'Bảo vệ chắc chắn 0.4 điểm không bị trừ oan do bẫy nghiệm ngoại lai.',
      whyThisStation: 'Chủ đề xuất hiện từ 3 đến 5 câu trong đề thi THPT Quốc Gia, từ mức thông hiểu đến vận dụng.'
    },
    theory: {
      overview: 'Hàm số y = a^x luôn dương với mọi x thuộc R. Hàm số y = log_a(x) chỉ xác định khi x > 0. Đây là sự bất đối xứng kinh điển mà người ra đề luôn khai thác để cài bẫy nghiệm ngoại lai.',
      deepExplanation: 'Khi ta biến đổi log_a(x²) = 2.log_a(x), ta đã vô tình thu hẹp tập xác định từ x ≠ 0 thành x > 0! Công thức đúng bản chất phải là: log_a(x²) = 2.log_a(|x|). Tương tự, log(A) + log(B) = log(A.B) chỉ tương đương khi cả A > 0 và B > 0 đồng thời thỏa mãn.',
      keyFormulas: [
        { name: 'Công thức đổi cơ số', formula: 'log_a(b) = log_c(b) / log_c(a) = 1 / log_b(a)', note: 'Cơ số c > 0, c ≠ 1' },
        { name: 'Bất phương trình cơ số < 1', formula: 'log_a(u) > log_a(v) ⟺ 0 < u < v (khi 0 < a < 1)', note: 'Bắt buộc ĐẢO CHIỀU bất đẳng thức' },
        { name: 'Lũy thừa hóa', formula: 'a^(log_a(b)) = b', note: 'Với a > 0, a ≠ 1, b > 0' }
      ],
      commonTraps: [
        { trap: 'Quên kiểm tra điều kiện sau khi giải ra nghiệm của phương trình logarit.', howToAvoid: 'Thói quen vàng: Đóng khung ĐIỀU KIỆN ở dòng đầu tiên của bài giải.' },
        { trap: 'Đặt ẩn phụ t = 2^x nhưng không đặt điều kiện t > 0, dẫn đến nhận nghiệm t âm vô nghĩa.', howToAvoid: 'Cứ đặt t = a^x thì ngay lập tức viết (t > 0).' }
      ],
      summaryTakeaways: [
        'Cơ số a > 1: Hàm đồng biến, giữ nguyên chiều.',
        'Cơ số 0 < a < 1: Hàm nghịch biến, BẮT BUỘC đảo chiều.',
        'Phương trình a^(2x) + b.a^x + c = 0 có 2 nghiệm x phân biệt ⟺ pt theo t có 2 nghiệm DƯƠNG phân biệt.'
      ]
    },
    workedExamples: [
      {
        title: 'Ví dụ 1: Giải phương trình đặt ẩn phụ có tham số',
        problem: 'Tìm tất cả các giá trị của tham số m để phương trình 4^x - 2^(x+1) + m = 0 có hai nghiệm phân biệt.',
        level: 'Vận dụng',
        patternRecognition: 'Nhận dạng: 4^x = (2^x)², 2^(x+1) = 2.(2^x) ⟹ Đặt ẩn phụ t = 2^x.',
        steps: [
          { stepNum: 1, action: 'Đặt ẩn phụ và biến đổi phương trình', explanation: 'Đặt t = 2^x với điều kiện t > 0. Phương trình trở thành: t² - 2t + m = 0 (1).' },
          { stepNum: 2, action: 'Phân tích điều kiện nghiệm', explanation: 'Để phương trình ban đầu có 2 nghiệm x phân biệt thì phương trình (1) phải có 2 nghiệm phân biệt t₁ > 0, t₂ > 0.' },
          { stepNum: 3, action: 'Áp dụng định lý Vi-ét cho 2 nghiệm dương', explanation: 'Hệ điều kiện: Δ\' = 1 - m > 0; S = t₁ + t₂ = 2 > 0 (luôn đúng); P = t₁.t₂ = m > 0.' },
          { stepNum: 4, action: 'Kết luận tập nghiệm của m', explanation: 'Từ Δ\' > 0 ta có m < 1. Kết hợp P > 0 ta được: 0 < m < 1.' }
        ],
        finalAnswer: '0 < m < 1',
        verificationTrick: 'Thử m = 0.5: t² - 2t + 0.5 = 0 có 2 nghiệm t₁ ≈ 1.707 > 0, t₂ ≈ 0.293 > 0 ⟹ Có 2 nghiệm x. Thử m = 0: t² - 2t = 0 ⟹ t = 0 (loại), t = 2 (chỉ có 1 nghiệm x = 1) ⟹ m = 0 loại. Chính xác!',
        alternativeMethod: 'Phương pháp cô lập m: m = -t² + 2t với t > 0. Lập bảng biến thiên hàm g(t) = -t² + 2t trên (0; +∞) thấy g_max = 1 tại t = 1, g(0) = 0. Để có 2 nghiệm thì 0 < m < 1.'
      }
    ],
    practiceQuestions: [
      {
        id: 'a00_q2_1',
        question: 'Tập nghiệm S của bất phương trình log_{0.5}(x - 1) ≥ -1 là:',
        options: ['S = (1; 3]', 'S = [3; +∞)', 'S = (1; 3)', 'S = (-∞; 3]'],
        correctAnswer: 0,
        hints: [
          'Gợi ý 1: Đặt điều kiện xác định: x - 1 > 0 ⟹ x > 1.',
          'Gợi ý 2: Vì cơ số là 0.5 < 1 nên khi đổi mũ phải ĐẢO CHIỀU: x - 1 ≤ (0.5)^(-1).'
        ],
        explanation: 'Điều kiện: x - 1 > 0 ⟹ x > 1. BPT tương đương: x - 1 ≤ (0.5)^(-1) = 2 ⟹ x ≤ 3. Kết hợp điều kiện ta được tập nghiệm S = (1; 3].',
        trapAnalysis: 'Nếu chọn D: bạn đã quên điều kiện x > 1 khiến logarit không xác định. Nếu chọn B: bạn đã quên đảo chiều bất đẳng thức do cơ số 0.5 < 1.',
        remedyTopic: 'Bất phương trình logarit có cơ số nhỏ hơn 1'
      }
    ],
    masteryTest: [
      {
        id: 'a00_m2_1',
        question: 'Số nghiệm nguyên của bất phương trình log₂(x² - 3x) ≤ 2 là:',
        options: ['4', '2', '3', '5'],
        correctAnswer: 0,
        hints: ['ĐK: x² - 3x > 0 ⟹ x < 0 hoặc x > 3. BPT ⟹ x² - 3x ≤ 4.'],
        explanation: 'ĐK: x(x - 3) > 0 ⟹ x ∈ (-∞; 0) ∪ (3; +∞). BPT ⟹ x² - 3x - 4 ≤ 0 ⟹ -1 ≤ x ≤ 4. Kết hợp điều kiện: x ∈ [-1; 0) ∪ (3; 4]. Nghiệm nguyên là: x ∈ {-1, 4}. Khoan, kiểm tra kỹ: {-1} và {4} là 2 nghiệm, nhưng có x = 0 hay 3 không? Không vì ngoặc tròn. Vậy có 2 nghiệm {-1, 4}.',
        trapAnalysis: 'Cẩn thận với dấu ngoặc tròn tại x = 0 và x = 3!',
        remedyTopic: 'Bất phương trình logarit chứa tam thức bậc hai'
      }
    ]
  },

  // GIAI ĐOẠN 2: KIẾN THỨC TRỌNG TÂM & PHƯƠNG PHÁP GIẢI CỐT LÕI
  {
    id: 'a00_node_3',
    stationNumber: 3,
    stageId: 2,
    stageName: 'Giai đoạn 2: Kiến thức trọng tâm & Phương pháp giải cốt lõi',
    stageFocus: 'Nắm trọn vẹn các chuyên đề 7.0 - 8.5 điểm & Tối ưu thời gian làm bài dưới 1 phút/câu',
    title: 'Giao thoa sóng ánh sáng trắng & Bài toán vân trùng nhiều bức xạ',
    subject: 'Vật lý 12',
    difficulty: 'Vận dụng',
    summary: 'Công thức khoảng vân i = λD/a, điều kiện trùng nhau k₁λ₁ = k₂λ₂ và kỹ thuật chặn bước sóng ánh sáng trắng.',
    keyFormula: 'Vị trí vân sáng: x = k.λ.D / a; Trùng nhau: k₁λ₁ = k₂λ₂; Bước sóng khả kiến: 0.38 μm ≤ λ ≤ 0.76 μm',
    status: 'locked',
    xp: 45,
    estimatedMinutes: 15,
    scoreContribution: '+0.5 Điểm (Câu 33 - 38 Đề thi)',
    outcomes: {
      understand: [
        'Bản chất hiện tượng giao thoa ánh sáng là bằng chứng khẳng định ánh sáng có tính chất sóng.',
        'Tại vân trung tâm luôn có sự trùng nhau của tất cả các ánh sáng đơn sắc tạo thành vân sáng trắng.'
      ],
      canDo: [
        'Lập bảng đếm số bức xạ cho vân sáng tại một vị trí x bất kỳ bằng cách chặn k.',
        'Tìm khoảng vân trùng i_trùng của 2 hoặc 3 bức xạ đơn sắc bằng bội chung nhỏ nhất.'
      ],
      keyConcept: 'Tại vị trí vân sáng trùng nhau: k₁ / k₂ = λ₂ / λ₁ (phân số tối giản c/d ⟹ k₁ = c.n; k₂ = d.n).',
      prerequisites: 'Định nghĩa bước sóng, tần số và thí nghiệm Y-âng giao thoa ánh sáng.',
      scoreImpact: 'Ăn trọn điểm câu vận dụng chuyên đề Sóng ánh sáng trong đề thi.',
      whyThisStation: 'Dạng bài kinh điển luôn chiếm 2 câu (1 câu cơ bản, 1 câu phân loại) trong mọi đề thi tốt nghiệp THPT.'
    },
    theory: {
      overview: 'Ánh sáng trắng là tập hợp vô số ánh sáng đơn sắc biến thiên liên tục từ đỏ (0.76 μm) đến tím (0.38 μm). Vì mỗi màu có bước sóng khác nhau nên khoảng vân i khác nhau, dẫn đến hiện tượng quang phổ giao thoa chồng chập lên nhau ở hai bên vân trung tâm.',
      deepExplanation: 'Tại vị trí x trên màn, một bức xạ cho vân sáng khi x = k.λ.D/a ⟹ λ = (a.x)/(k.D). Do ánh sáng nằm trong vùng nhìn thấy: 0.38 ≤ λ ≤ 0.76 μm ⟹ Ta thiết lập được bất phương trình chặn giá trị của số nguyên k: 0.38 ≤ (a.x)/(k.D) ≤ 0.76. Mỗi giá trị k nguyên tìm được tương ứng với một bức xạ cho vân sáng tại x.',
      keyFormulas: [
        { name: 'Khoảng vân', formula: 'i = λD / a', note: 'λ (μm), D (m), a (mm) ⟹ i (mm)' },
        { name: 'Khoảng vân trùng 2 bức xạ', formula: 'i_trùng = k₁_min . i₁ = k₂_min . i₂', note: 'k₁/k₂ = λ₂/λ₁ = b/c tối giản' },
        { name: 'Bề rộng quang phổ bậc k', formula: 'Δx_k = x_đỏ_k - x_tím_k = k.(D/a).(λ_đỏ - λ_tím)', note: 'Bề rộng dải màu cầu vồng bậc k' }
      ],
      commonTraps: [
        { trap: 'Quên kiểm tra xem có tính cả vân trùng của cả 2 bức xạ hay không khi đề bài hỏi "số vân sáng quan sát được".', howToAvoid: 'Quy tắc: N_quan_sát = N₁ + N₂ - N_trùng (vì tại điểm trùng chỉ thấy 1 vân màu mới).' }
      ],
      summaryTakeaways: [
        'λ_tím nhỏ nhất ⟹ i_tím hẹp nhất; λ_đỏ lớn nhất ⟹ i_đỏ rộng nhất.',
        'Bề rộng quang phổ tỉ lệ thuận với bậc k: Bậc càng cao thì các dải quang phổ càng dễ chồng lấn lên nhau.'
      ]
    },
    workedExamples: [
      {
        title: 'Ví dụ 1: Tìm số bức xạ cho vân sáng tại một điểm x',
        problem: 'Trong thí nghiệm Y-âng, a = 1 mm, D = 2 m. Chiếu ánh sáng trắng có bước sóng từ 0.38 μm đến 0.76 μm. Tại điểm M trên màn cách vân trung tâm x_M = 3.3 mm có bao nhiêu bức xạ cho vân sáng?',
        level: 'Vận dụng',
        patternRecognition: 'Cho tọa độ x_M và dải ánh sáng trắng ⟹ Thiết lập bất đẳng thức chặn k.',
        steps: [
          { stepNum: 1, action: 'Biểu diễn bước sóng theo bậc k', explanation: 'x_M = k.λ.D/a ⟹ λ = (a.x_M) / (k.D) = (1 × 3.3) / (k × 2) = 1.65 / k (μm).' },
          { stepNum: 2, action: 'Chặn điều kiện bước sóng nhìn thấy', explanation: '0.38 ≤ 1.65 / k ≤ 0.76 ⟹ 1.65 / 0.76 ≤ k ≤ 1.65 / 0.38 ⟹ 2.17 ≤ k ≤ 4.34.' },
          { stepNum: 3, action: 'Tìm các giá trị k nguyên thỏa mãn', explanation: 'Vì k là số nguyên nên k nhận các giá trị: k = 3 và k = 4.' }
        ],
        finalAnswer: 'Có 2 bức xạ cho vân sáng tại M (ứng với k = 3: λ = 0.55 μm và k = 4: λ = 0.4125 μm).',
        verificationTrick: 'Bấm Table Casio f(x) = 1.65/x với x chạy từ 1 đến 10, đếm các giá trị f(x) nằm trong [0.38; 0.76] chỉ thấy đúng 2 dòng k = 3 và k = 4. Siêu nhanh!',
        alternativeMethod: 'Sử dụng bất đẳng thức quang phổ bậc k.'
      }
    ],
    practiceQuestions: [
      {
        id: 'a00_q3_1',
        question: 'Chiếu đồng thời hai bức xạ đơn sắc λ₁ = 0.48 μm và λ₂ = 0.64 μm vào hai khe Y-âng. Khoảng cách giữa hai vân sáng cùng màu với vân trung tâm gần nhau nhất là:',
        options: ['4 i₁ = 3 i₂', '3 i₁ = 4 i₂', '2 i₁ = 3 i₂', 'i₁ + i₂'],
        correctAnswer: 0,
        hints: [
          'Gợi ý 1: Thiết lập tỉ số k₁/k₂ = λ₂/λ₁.',
          'Gợi ý 2: Rút gọn 0.64 / 0.48 = 4/3. Vậy vị trí trùng nhỏ nhất ứng với k₁ = 4 và k₂ = 3.'
        ],
        explanation: 'Điều kiện vân trùng: k₁λ₁ = k₂λ₂ ⟹ k₁/k₂ = λ₂/λ₁ = 0.64 / 0.48 = 4/3. Vì 4/3 là phân số tối giản nên vân trùng đầu tiên có k₁ = 4, k₂ = 3. Khoảng vân trùng i_trùng = 4 i₁ = 3 i₂.',
        trapAnalysis: 'Nhầm ngược tỉ số nghịch thành k₁/k₂ = λ₁/λ₂ = 3/4 là lỗi rất phổ biến.',
        remedyTopic: 'Giao thoa hai bức xạ đơn sắc'
      }
    ],
    masteryTest: [
      {
        id: 'a00_m3_1',
        question: 'Trong thí nghiệm Y-âng, khoảng cách giữa 2 vân sáng bậc 3 ở hai phía đối với vân trung tâm là:',
        options: ['6 i', '3 i', '5 i', '2 i'],
        correctAnswer: 0,
        hints: ['Một bên là +3i, một bên là -3i. Khoảng cách là hiệu tọa độ.'],
        explanation: 'Vân sáng bậc 3 có tọa độ x = ±3i. Khoảng cách giữa chúng là d = 3i - (-3i) = 6i.',
        trapAnalysis: 'Nhiều học sinh quên chữ "ở hai phía" nên chỉ tính khoảng cách từ vân bậc 3 đến vân trung tâm là 3i.',
        remedyTopic: 'Vị trí vân sáng và khoảng cách trên màn giao thoa'
      }
    ]
  },

  // GIAI ĐOẠN 3: LUYỆN TẬP PHÂN HÓA 8.5+
  {
    id: 'a00_node_4',
    stationNumber: 4,
    stageId: 3,
    stageName: 'Giai đoạn 3: Luyện tập phân hóa & Nâng cấp tư duy 8.5+',
    stageFocus: 'Giải quyết dứt điểm các bài toán cô lập tham số, cực trị hình học và mạch điện RLC',
    title: 'Khảo sát hàm số & Tương giao đồ thị chứa tham số m (Kỹ thuật Cô lập m)',
    subject: 'Toán học',
    difficulty: 'Vận dụng',
    summary: 'Quy trình 3 bước cô lập tham số m = g(x), lập bảng biến thiên và biện luận số nghiệm của phương trình f(x) = m.',
    keyFormula: 'f(x) = m có n nghiệm ⟺ Đường thẳng nằm ngang y = m cắt đồ thị y = f(x) tại n điểm phân biệt.',
    status: 'locked',
    xp: 45,
    estimatedMinutes: 16,
    scoreContribution: '+0.5 Điểm (Câu 39 - 44 Đề thi)',
    outcomes: {
      understand: [
        'Mối liên hệ giữa số nghiệm của phương trình đại số và số giao điểm hình học của hai đồ thị.',
        'Khi nào CÔ LẬP ĐƯỢC m (tham số xuất hiện bậc nhất) và khi nào dùng định lý Vi-ét tam thức bậc 2.'
      ],
      canDo: [
        'Khảo sát nhanh hàm g(x) = m trên đoạn [a; b] để tìm min, max và điều kiện có nghiệm.',
        'Xử lý điều kiện có nghiệm x thuộc khoảng (a; b) cho trước.'
      ],
      keyConcept: 'Phương trình f(x) = m có nghiệm trên D ⟺ min_D f(x) ≤ m ≤ max_D f(x).',
      prerequisites: 'Đạo hàm bậc nhất, xét dấu đạo hàm và vẽ bảng biến thiên hàm số.',
      scoreImpact: 'Quyết định trực tiếp khả năng vượt ngưỡng 8.0 môn Toán trong kỳ thi.',
      whyThisStation: 'Chiếm tỷ trọng lớn nhất trong đề thi Toán THPTQG với 2-3 câu mức độ vận dụng.'
    },
    theory: {
      overview: 'Bài toán tương giao chứa tham số m là linh hồn của chương Hàm số lớp 12. Ý tưởng chủ đạo là đưa tham số m về một vế độc lập để chuyển bài toán đại số phức tạp thành bài toán quan sát tương giao giữa một đường thẳng nằm ngang y = m và đường cong y = g(x).',
      deepExplanation: 'Khi cô lập m = g(x), ta khảo sát hàm g(x) trên tập xác định K yêu cầu. Chú ý các điểm biên a, b: nếu khoảng (a; b) là ngoặc tròn thì giá trị g(a), g(b) không đạt được, do đó dấu bất đẳng thức có nghiệm sẽ không có dấu bằng tại các giá trị biên này.',
      keyFormulas: [
        { name: 'Có nghiệm trên D', formula: 'min_D g(x) ≤ m ≤ max_D g(x)', note: 'Đảm bảo g(x) liên tục trên D' },
        { name: 'Nghiệm đúng với mọi x thuộc D', formula: 'm ≥ g(x), ∀x ∈ D ⟺ m ≥ max_D g(x)', note: 'Tương tự: m ≤ g(x), ∀x ⟺ m ≤ min_D' }
      ],
      commonTraps: [
        { trap: 'Lấy nhầm dấu bằng khi tập xác định K là khoảng tròn mở (a; b).', howToAvoid: 'Nhìn vào bảng biến thiên: Nếu mũi tên chỉ đến giá trị biên nhưng x không đạt được thì không được lấy dấu bằng.' }
      ],
      summaryTakeaways: [
        'Tham số m bậc nhất ⟹ Ưu tiên số 1: CÔ LẬP m = g(x).',
        'Tham số m dính bậc hai ⟹ Xét nghiệm đặc biệt (nhẩm nghiệm nguyên theo định lý Bezout) hoặc dùng tam thức bậc hai.'
      ]
    },
    workedExamples: [
      {
        title: 'Ví dụ 1: Tìm m để phương trình có đúng 3 nghiệm phân biệt',
        problem: 'Tìm tất cả các giá trị thực của tham số m để phương trình x³ - 3x² + 2 = m có 3 nghiệm thực phân biệt.',
        level: 'Vận dụng',
        patternRecognition: 'Tham số m đã đứng riêng ở vế phải ⟹ Khảo sát trực tiếp hàm số vế trái f(x) = x³ - 3x² + 2.',
        steps: [
          { stepNum: 1, action: 'Tính đạo hàm f\'(x)', explanation: 'f\'(x) = 3x² - 6x = 3x(x - 2). Cho f\'(x) = 0 ⟹ x = 0 hoặc x = 2.' },
          { stepNum: 2, action: 'Tính các giá trị cực trị', explanation: 'Tại x = 0: y_cực_đại = f(0) = 2. Tại x = 2: y_cực_tiểu = f(2) = 2³ - 3(4) + 2 = -2.' },
          { stepNum: 3, action: 'Biện luận số giao điểm', explanation: 'Đường thẳng y = m cắt đồ thị tại 3 điểm phân biệt khi và chỉ khi m nằm nghiêm ngặt giữa cực tiểu và cực đại: y_CT < m < y_CĐ ⟹ -2 < m < 2.' }
        ],
        finalAnswer: '-2 < m < 2',
        verificationTrick: 'Tại m = 2 phương trình có nghiệm kép x = 0 và nghiệm đơn x = 3 (chỉ có 2 nghiệm) ⟹ Không thể lấy m = 2. Vậy -2 < m < 2 là chính xác tuyệt đối.',
        alternativeMethod: 'Vẽ đồ thị nhanh bằng Casio Table bước nhảy 0.5.'
      }
    ],
    practiceQuestions: [
      {
        id: 'a00_q4_1',
        question: 'Tìm tất cả các giá trị thực của m để phương trình -x⁴ + 2x² + 3 = m có 4 nghiệm phân biệt:',
        options: ['3 < m < 4', 'm < 3', 'm > 4', '3 ≤ m ≤ 4'],
        correctAnswer: 0,
        hints: [
          'Gợi ý 1: Khảo sát hàm trùng phương f(x) = -x⁴ + 2x² + 3.',
          'Gợi ý 2: f\'(x) = -4x³ + 4x = -4x(x² - 1) = 0 có 3 nghiệm x = 0, ±1. Điểm cực tiểu f(0) = 3, hai điểm cực đại f(±1) = 4.'
        ],
        explanation: 'Đồ thị có dạng chữ M úp xuống. Cực tiểu tại (0; 3) và cực đại tại (±1; 4). Đường thẳng y = m cắt đồ thị tại 4 điểm phân biệt khi nó nằm giữa cực tiểu và cực đại: 3 < m < 4.',
        trapAnalysis: 'Chọn D (lấy dấu bằng) là sai vì tại m = 4 chỉ có 2 nghiệm (2 đỉnh tiếp xúc), tại m = 3 chỉ có 3 nghiệm.',
        remedyTopic: 'Tương giao đồ thị hàm số trùng phương'
      }
    ],
    masteryTest: [
      {
        id: 'a00_m4_1',
        question: 'Để phương trình 2x³ - 3x² + 1 - m = 0 có 3 nghiệm phân biệt thì khoảng giá trị của m là:',
        options: ['0 < m < 1', '-1 < m < 0', 'm > 1', 'm < 0'],
        correctAnswer: 0,
        hints: ['Cô lập m: m = 2x³ - 3x² + 1. Tính f\'(x) = 6x² - 6x = 0 ⟹ x = 0 (y = 1) và x = 1 (y = 0).'],
        explanation: 'm = 2x³ - 3x² + 1. Cực đại f(0) = 1, cực tiểu f(1) = 0. Để có 3 nghiệm phân biệt: y_CT < m < y_CĐ ⟹ 0 < m < 1.',
        trapAnalysis: 'Cẩn thận với dấu của hệ số khi chuyển vế!',
        remedyTopic: 'Biện luận số nghiệm phương trình bậc ba'
      }
    ]
  },

  // GIAI ĐOẠN 4: VẬN DỤNG CAO 9+
  {
    id: 'a00_node_5',
    stationNumber: 5,
    stageId: 4,
    stageName: 'Giai đoạn 4: Chinh phục Vận dụng cao 9+ & Bẫy phân loại',
    stageFocus: 'Giải phóng tư duy với các dạng bài phân loại 9+ (Tích phân hàm ẩn đối xứng & Số phức Min-Max)',
    title: 'Tích phân hàm ẩn đối xứng f(x) + f(a+b-x) = g(x) & Tích phân từng phần 9+',
    subject: 'Toán học',
    difficulty: 'Vận dụng cao 9+',
    summary: 'Bổ đề tích phân đối xứng kinh điển, kỹ thuật cộng hai vế triệt tiêu hàm ẩn và phương pháp tích phân từng phần đổi vai trò.',
    keyFormula: 'Bổ đề vàng: ∫[a→b] f(x) dx = ∫[a→b] f(a+b-x) dx ⟹ ∫[a→b] f(x) dx = 1/2 ∫[a→b] [f(x) + f(a+b-x)] dx',
    status: 'locked',
    xp: 60,
    estimatedMinutes: 20,
    scoreContribution: '+0.6 Điểm (Câu 45 - 50 Đề thi)',
    outcomes: {
      understand: [
        'Bản chất biến đổi đổi biến số t = a + b - x không làm thay đổi giá trị tích phân xác định.',
        'Ý nghĩa hình học của tính đối xứng tâm và đối xứng trục của đồ thị hàm ẩn.'
      ],
      canDo: [
        'Phát hiện ngay dạng bài đối xứng khi thấy biểu thức chứa x và (1 - x), (π - x) hoặc (-x).',
        'Giải quyết bài toán tích phân hàm ẩn trong 60 giây bằng công thức tính nhanh thay vì đặt biến phức tạp.'
      ],
      keyConcept: 'Với dạng f(x) + f(a+b-x) = k hằng số trên [a; b], tích phân I luôn bằng k.(b - a) / 2.',
      prerequisites: 'Định nghĩa tích phân, đổi biến số dạng 1 và tích phân từng phần.',
      scoreImpact: 'Ăn trọn 0.4 - 0.6 điểm câu phân loại điểm 9 - 10 trong đề thi chính thức.',
      whyThisStation: 'Đây là câu hỏi phân hóa đặc trưng nhất trong đề thi tốt nghiệp THPT những năm gần đây.'
    },
    theory: {
      overview: 'Bài toán tích phân hàm ẩn không cho công thức tường minh của f(x) mà chỉ cho một hệ thức liên hệ. Kỹ thuật mạnh mẽ nhất là đổi biến số t = a + b - x để tạo ra một phương trình tích phân đối xứng thứ hai.',
      deepExplanation: 'Xét I = ∫[a→b] f(x) dx. Đặt x = a + b - t ⟹ dx = -dt. Khi x = a thì t = b; x = b thì t = a. Do đó: I = -∫[b→a] f(a+b-t) dt = ∫[a→b] f(a+b-x) dx. Khi cộng hai biểu thức lại: 2I = ∫[a→b] [f(x) + f(a+b-x)] dx ⟹ I = 1/2 ∫[a→b] [f(x) + f(a+b-x)] dx. Nếu f(x) + f(a+b-x) = g(x) thì ta chỉ cần tính tích phân của g(x) tường minh!',
      keyFormulas: [
        { name: 'Công thức giải nhanh tích phân đối xứng', formula: 'I = 1/2 ∫[a→b] [f(x) + f(a+b-x)] dx', note: 'Áp dụng cho mọi cận [a; b]' },
        { name: 'Dạng mở rộng f(x) + k.f(-x)', formula: 'I = ∫[-a→a] f(x) dx = 1/(k+1) ∫[-a→a] g(x) dx', note: 'Khi cận đối xứng [-a; a]' }
      ],
      commonTraps: [
        { trap: 'Cố gắng đi tìm hàm số f(x) tường minh bằng cách giải phương trình vi phân.', howToAvoid: 'Hãy lấy tích phân hai vế ngay từ đầu, không cần tìm hàm f(x).' }
      ],
      summaryTakeaways: [
        'Cận từ 0 đến 1 ⟹ Đổi biến t = 1 - x.',
        'Cận từ 0 đến π ⟹ Đổi biến t = π - x.',
        'Cận từ -a đến a ⟹ Đổi biến t = -x.'
      ]
    },
    workedExamples: [
      {
        title: 'Ví dụ 1: Tích phân hàm ẩn đối xứng qua tâm',
        problem: 'Cho hàm số f(x) liên tục trên đoạn [0; 1] thỏa mãn f(x) + f(1 - x) = 3x² - 3x + 1. Tính tích phân I = ∫[0→1] f(x) dx.',
        level: 'Vận dụng cao 9+',
        patternRecognition: 'Xuất hiện x và 1 - x cùng cận tích phân [0; 1] ⟹ Áp dụng bổ đề đối xứng t = 1 - x.',
        steps: [
          { stepNum: 1, action: 'Áp dụng tính chất I = ∫[0→1] f(1-x)dx', explanation: 'Đặt t = 1 - x ⟹ I = ∫[0→1] f(x)dx = ∫[0→1] f(1-x)dx.' },
          { stepNum: 2, action: 'Cộng hai tích phân lại với nhau', explanation: '2I = I + I = ∫[0→1] f(x)dx + ∫[0→1] f(1-x)dx = ∫[0→1] [f(x) + f(1-x)] dx.' },
          { stepNum: 3, action: 'Thay hệ thức đề bài vào tích phân', explanation: '2I = ∫[0→1] (3x² - 3x + 1) dx = [x³ - 1.5x² + x]_0^1 = 1 - 1.5 + 1 = 0.5 = 1/2.' },
          { stepNum: 4, action: 'Tính kết quả I', explanation: '2I = 1/2 ⟹ I = 1/4.' }
        ],
        finalAnswer: 'I = 1/4',
        verificationTrick: 'Chọn hàm đại diện: Vì f(x) + f(1-x) = 3x² - 3x + 1 đối xứng qua x = 1/2, chọn f(x) = 1.5x² - 1.5x + 0.5. Tích phân ∫[0→1] (1.5x² - 1.5x + 0.5)dx = 0.5 - 0.75 + 0.5 = 0.25 = 1/4. Tuyệt đối chuẩn!',
        alternativeMethod: 'Phương pháp chọn hàm đại diện (Hệ số bất định).'
      }
    ],
    practiceQuestions: [
      {
        id: 'a00_q5_1',
        question: 'Cho hàm số f(x) liên tục trên R và thỏa mãn f(x) + f(-x) = cos(x). Tính giá trị của tích phân I = ∫[-π/2 → π/2] f(x) dx:',
        options: ['I = 1', 'I = 2', 'I = 1/2', 'I = 0'],
        correctAnswer: 0,
        hints: [
          'Gợi ý 1: Đổi biến t = -x thì I = ∫[-π/2 → π/2] f(-x) dx.',
          'Gợi ý 2: Cộng hai vế: 2I = ∫[-π/2 → π/2] [f(x) + f(-x)] dx = ∫[-π/2 → π/2] cos(x) dx.'
        ],
        explanation: 'Ta có 2I = ∫[-π/2 → π/2] [f(x) + f(-x)] dx = ∫[-π/2 → π/2] cos(x) dx = [sin(x)]_{-π/2}^{π/2} = 1 - (-1) = 2 ⟹ I = 2 / 2 = 1.',
        trapAnalysis: 'Nhiều bạn quên chia cho 2 ở bước cuối nên chọn nhầm I = 2.',
        remedyTopic: 'Tích phân cận đối xứng [-a; a]'
      }
    ],
    masteryTest: [
      {
        id: 'a00_m5_1',
        question: 'Cho hàm số f(x) liên tục trên [0; 2] thỏa mãn f(x) + f(2 - x) = 4. Tích phân I = ∫[0→2] f(x) dx bằng:',
        options: ['4', '8', '2', '16'],
        correctAnswer: 0,
        hints: ['Áp dụng công thức tính nhanh I = 1/2 . k . (b - a) = 1/2 . 4 . (2 - 0).'],
        explanation: '2I = ∫[0→2] [f(x) + f(2-x)] dx = ∫[0→2] 4 dx = 4 × 2 = 8 ⟹ I = 4.',
        trapAnalysis: 'Áp dụng công thức I = k.(b-a)/2 = 4 × 2 / 2 = 4.',
        remedyTopic: 'Tích phân hàm ẩn đối xứng hằng số'
      }
    ]
  },

  // GIAI ĐOẠN 5: TỔNG DUYỆT CHẶNG & MOCK EXAM
  {
    id: 'a00_node_6',
    stationNumber: 6,
    stageId: 5,
    stageName: 'Giai đoạn 5: Tổng duyệt chặng & Đánh giá mức độ sẵn sàng',
    stageFocus: 'Thi thử bấm giờ chuẩn ma trận 50 câu & Tối ưu bản lĩnh phòng thi',
    title: 'Đề Thi Thử Mock Test Chuẩn Hóa THPTQG 2025 (Bấm giờ 90 phút)',
    subject: 'Tổng hợp',
    difficulty: 'Vận dụng cao 9+',
    summary: 'Mô phỏng áp lực phòng thi thật, rèn luyện chiến thuật 40 phút - 35 câu đầu và phân bổ năng lượng cho 15 câu phân loại.',
    keyFormula: 'Chiến thuật phòng thi: 40 phút (35 câu đầu) + 35 phút (10 câu 8+) + 15 phút (5 câu 9+ & Soát đáp án)',
    status: 'locked',
    xp: 100,
    estimatedMinutes: 25,
    scoreContribution: 'Đánh giá độ sẵn sàng 27.5+ Điểm',
    outcomes: {
      understand: [
        'Tâm lý phòng thi và cách đối phó với hiện tượng "nghẽn tư duy" khi gặp câu hỏi lạ.',
        'Quy tắc không bao giờ bỏ trống câu trắc nghiệm và phương pháp loại trừ đáp án nhiễu vô lý.'
      ],
      canDo: [
        'Hoàn thành 35 câu đầu tiên với độ chính xác 100% trong tối đa 40 phút.',
        'Chọn lọc chính xác 5 - 8 câu thuộc thế mạnh trong 15 câu cuối để tối đa hóa điểm số.'
      ],
      keyConcept: 'Mỗi câu trắc nghiệm đều có giá trị 0.2 điểm như nhau: Đừng mất 10 phút cho câu 49 mà làm ẩu câu số 5!',
      prerequisites: 'Toàn bộ kiến thức 5 trạm học trước trong giai đoạn 1, 2, 3 và 4.',
      scoreImpact: 'Bảo chứng phong độ thực chiến đạt điểm mục tiêu 27.5+ trước kỳ thi thật.',
      whyThisStation: 'Trạm về đích của lộ trình: Đánh giá toàn diện năng lực và cấp chứng nhận sẵn sàng vượt vũ môn.'
    },
    theory: {
      overview: 'Điểm số thi thật là sự kết hợp giữa 70% kiến thức và 30% chiến thuật phòng thi. Học sinh giỏi thường mất điểm không phải ở câu khó mà ở những câu dễ do làm quá nhanh và chủ quan.',
      deepExplanation: 'Quy tắc 3 lượt làm bài trắc nghiệm:\n- Lượt 1 (35 - 40 phút): Làm tuần tự, câu nào đọc đề biết ngay cách làm thì giải và tô phiếu ngay. Câu nào tính toán quá 1.5 phút thì đánh dấu tròn (O).\n- Lượt 2 (30 phút): Quay lại giải các câu đã đánh dấu tròn.\n- Lượt 3 (15 - 20 phút cuối): Xử lý câu vận dụng cao thế mạnh và rà soát phiếu trả lời, kiểm tra lệch dòng.',
      keyFormulas: [
        { name: 'Phân bổ thời gian lý tưởng', formula: 'T_cơ_bản ≤ 1 phút/câu; T_vận_dụng ≤ 3 phút/câu', note: 'Dành 10 phút cuối soát lại toàn bộ' }
      ],
      commonTraps: [
        { trap: 'Tô nhầm dòng trên phiếu trả lời trắc nghiệm (lệch 1 câu kéo theo sai 5 câu kế tiếp).', howToAvoid: 'Tô theo từng cụm 5 câu hoặc tô ngay sau khi chắc chắn đáp án.' }
      ],
      summaryTakeaways: [
        'Câu dễ làm chậm và cẩn thận; câu khó làm nhanh và quyết đoán.',
        'Giữ tâm lý bình tĩnh, hít sâu 3 nhịp nếu gặp câu bị rối.'
      ]
    },
    workedExamples: [
      {
        title: 'Chiến thuật: Nhận diện và loại trừ nhanh đáp án',
        problem: 'Trong bài toán tìm khoảng cách hoặc diện tích hình học, nếu 4 phương án cho là: A. -3; B. 5/2; C. √13; D. 2π. Ta loại trừ ngay đáp án nào?',
        level: 'Cơ bản',
        patternRecognition: 'Khoảng cách hình học không thể âm ⟹ Loại A ngay trong 1 giây.',
        steps: [
          { stepNum: 1, action: 'Quan sát điều kiện đại lượng vật lý/toán học', explanation: 'Độ dài, khoảng cách, diện tích, thể tích, bán kính, chu kỳ luôn là số dương.' },
          { stepNum: 2, action: 'Loại trừ phương án vi phạm điều kiện tự nhiên', explanation: 'Loại đáp án A (-3).' }
        ],
        finalAnswer: 'Loại A ngay lập tức',
        verificationTrick: 'Tăng xác suất chọn đúng từ 25% lên 33.3%.'
      }
    ],
    practiceQuestions: [
      {
        id: 'a00_q6_1',
        question: 'Nguyên tắc vàng khi phân bổ thời gian cho đề thi tốt nghiệp THPT 50 câu (90 phút) là:',
        options: [
          'Dành tối đa 40 phút ăn chắc 35 câu đầu, 50 phút còn lại cho các câu phân hóa và soát bài',
          'Chia đều mỗi câu đúng 1.8 phút bất kể câu dễ hay khó',
          'Làm các câu khó ở cuối trước để đỡ mệt mỏi về sau',
          'Làm xong câu nào thì quên câu đó, không cần kiểm tra lại'
        ],
        correctAnswer: 0,
        hints: ['Câu dễ và câu khó đều trị giá 0.2 điểm như nhau.'],
        explanation: 'Ăn chắc 35 câu đầu (mức 7.0 điểm) là nền tảng sống còn. Mất điểm ở câu dễ là sai lầm không thể cứu vãn.',
        trapAnalysis: 'Nhiều học sinh ham câu 9+ mà làm vội câu dễ dẫn đến mất oan 1.0 - 1.5 điểm.',
        remedyTopic: 'Chiến lược phân bổ thời gian phòng thi'
      }
    ],
    masteryTest: [
      {
        id: 'a00_m6_1',
        question: 'Khi còn 5 phút cuối giờ làm bài thi trắc nghiệm, hành động thông minh nhất là:',
        options: [
          'Dừng giải câu khó, kiểm tra toàn bộ phiếu trả lời xem có câu nào chưa tô hoặc tô mờ không',
          'Cố gắng bấm máy tính giải thêm một câu vận dụng cao',
          'Ngồi nghỉ ngơi và nộp bài sớm',
          'Tẩy xóa các câu đang phân vân để đổi đáp án linh cảm'
        ],
        correctAnswer: 0,
        hints: ['Kiểm tra xem có sót câu nào chưa tô trên phiếu trắc nghiệm không.'],
        explanation: '5 phút cuối phải rà soát mã đề, số báo danh và đảm bảo 50/50 câu đã được tô kín trên phiếu thi. Tuyệt đối không để trống câu nào!',
        trapAnalysis: 'Đổi đáp án phút chót theo cảm tính thường có tỉ lệ sai lên tới 70%.',
        remedyTopic: 'Kỹ năng rà soát phiếu trả lời trắc nghiệm'
      }
    ]
  }
];

// ============================================================
// 2. PRESET: ĐÁNH GIÁ NĂNG LỰC ĐHQG (HSA 110+ / VNUHCM 900+)
// ============================================================
export const ROADMAP_DGNL: LearningNode[] = [
  {
    id: 'dgnl_node_1',
    stationNumber: 1,
    stageId: 1,
    stageName: 'Giai đoạn 1: Chẩn đoán & Tư duy Logic hình thức',
    stageFocus: 'Làm chủ suy luận logic, mệnh đề kéo theo và phương pháp bảng chân trị',
    title: 'Suy luận logic hình thức & Phương pháp Điểm neo (Anchor Method) xếp vị trí',
    subject: 'Tư duy Định lượng & Logic',
    difficulty: 'Nền tảng',
    summary: 'Kỹ thuật cố định điểm neo, phân nhánh giả thiết và sơ đồ hóa bài toán sắp xếp chỗ ngồi, lịch trình.',
    keyFormula: 'Mệnh đề tương đương: (A ⟹ B) ⟺ (Phủ định B ⟹ Phủ định A); Phương pháp điểm neo cố định phần tử có nhiều ràng buộc nhất.',
    status: 'completed',
    xp: 40,
    estimatedMinutes: 12,
    scoreContribution: '+50 Điểm ĐGNL',
    outcomes: {
      understand: [
        'Bản chất suy luận logic không cần công thức toán mà dựa trên các ràng buộc tương hỗ.',
        'Mệnh đề phản đảo: Nếu A thì B tương đương với Nếu không B thì không A.'
      ],
      canDo: [
        'Vẽ sơ đồ vị trí (dãy bàn, vòng tròn, lịch thứ trong tuần) trong 30 giây.',
        'Tìm ra điểm neo (Anchor) có nhiều mối liên kết nhất để bẻ khóa toàn bộ bài toán.'
      ],
      keyConcept: 'Điểm neo là đối tượng xuất hiện trong nhiều điều kiện nhất: Cố định điểm neo trước, các vị trí khác sẽ tự động sáng tỏ.',
      prerequisites: 'Tư duy logic cơ bản, không yêu cầu kiến thức chuyên sâu toán học.',
      scoreImpact: 'Xử lý trọn gói 5 câu logic chùm trong bài thi ĐGNL.',
      whyThisStation: 'Dạng bài độc quyền của đề thi ĐGNL ĐHQG Hà Nội và TP.HCM.'
    },
    theory: {
      overview: 'Logic hình thức kiểm tra năng lực tư duy phản biện và khả năng suy luận khoa học của thí sinh. Đề bài thường cho một nhóm 5-7 người kèm theo 4-5 điều kiện ràng buộc vị trí.',
      deepExplanation: 'Quy trình giải bài logic chùm:\n1. Liệt kê danh sách đối tượng (ví dụ: A, B, C, D, E).\n2. Ghi chú các điều kiện bằng ký hiệu ngắn gọn (A đứng trước B: A < B; C cạnh D: [CD]).\n3. Tìm phần tử xuất hiện nhiều nhất làm "Điểm neo" và lập bảng khả năng.',
      keyFormulas: [
        { name: 'Mệnh đề phản đảo', formula: 'P ⟹ Q ⟺ ¬Q ⟹ ¬P', note: 'Đúng 100% trong mọi bài toán suy luận' }
      ],
      commonTraps: [
        { trap: 'Tự suy diễn thêm điều kiện không có trong đề bài (ví dụ đề cho "A không cạnh B" nhưng lại tự suy ra "A cách B đúng 2 ghế").', howToAvoid: 'Chỉ bám sát vào những gì đề bài khẳng định rõ ràng.' }
      ],
      summaryTakeaways: [
        'Tìm điểm neo trước.',
        'Vẽ khung vị trí dạng bảng.',
        'Thử các đáp án A, B, C, D bằng phương pháp phản chứng nếu phân nhánh quá nhiều.'
      ]
    },
    workedExamples: [
      {
        title: 'Ví dụ 1: Xếp vị trí 5 học sinh ngồi một hàng ghế',
        problem: 'Có 5 bạn An, Bình, Cúc, Dũng, Em ngồi một hàng ghế từ 1 đến 5. Biết: An ngồi ghế số 1. Bình không ngồi cạnh An. Cúc ngồi cạnh Bình. Hỏi Dũng có thể ngồi ghế nào?',
        level: 'Nền tảng',
        patternRecognition: 'An ngồi ghế 1 là điểm neo cố định.',
        steps: [
          { stepNum: 1, action: 'Điền vị trí cố định', explanation: 'Ghế 1: An. Còn lại ghế 2, 3, 4, 5.' },
          { stepNum: 2, action: 'Xét điều kiện của Bình', explanation: 'Bình không cạnh An ⟹ Bình không thể ngồi ghế 2. Bình chỉ có thể ngồi ghế 3, 4 hoặc 5.' },
          { stepNum: 3, action: 'Xét khối Cúc và Bình', explanation: 'Cúc cạnh Bình ⟹ Cúc và Bình là cặp [BC] chiếm 2 ghế liền kề: (3, 4) hoặc (4, 5).' },
          { stepNum: 4, action: 'Suy ra vị trí của Dũng', explanation: 'Dũng có thể ngồi ở các ghế còn lại tùy trường hợp: Ghế 2 luôn trống vì Bình không ngồi đó.' }
        ],
        finalAnswer: 'Dũng có thể ngồi ghế 2 hoặc ghế trống còn lại.',
        verificationTrick: 'Thử đặt Dũng vào ghế 2 thấy thỏa mãn mọi điều kiện đề bài.'
      }
    ],
    practiceQuestions: [
      {
        id: 'dgnl_q1_1',
        question: 'Biết mệnh đề "Nếu trời mưa thì đường trơn" là đúng. Mệnh đề nào sau đây CHẮC CHẮN ĐÚNG?',
        options: [
          'Nếu đường không trơn thì trời không mưa',
          'Nếu đường trơn thì trời mưa',
          'Nếu trời không mưa thì đường không trơn',
          'Trời mưa và đường không trơn'
        ],
        correctAnswer: 0,
        hints: ['Áp dụng luật phản đảo: P ⟹ Q tương đương ¬Q ⟹ ¬P.'],
        explanation: 'Luật tương đương logic phản đảo: "Nếu P thì Q" tương đương "Nếu không Q thì không P". Vậy "Đường không trơn thì trời không mưa" chắc chắn đúng.',
        trapAnalysis: 'Chọn "Nếu đường trơn thì trời mưa" là ngụy biện khẳng định hệ quả (đường trơn có thể do tưới nước).',
        remedyTopic: 'Mệnh đề tương đương logic'
      }
    ],
    masteryTest: [
      {
        id: 'dgnl_m1_1',
        question: 'Nếu tất cả các triết gia đều thông thái, và một số triết gia là nhà thơ. Kết luận nào sau đây tất yếu đúng?',
        options: [
          'Một số nhà thơ thông thái',
          'Tất cả nhà thơ đều thông thái',
          'Không có nhà thơ nào thông thái',
          'Tất cả người thông thái là triết gia'
        ],
        correctAnswer: 0,
        hints: ['Vẽ biểu đồ Ven giao nhau giữa tập Triết gia, Thông thái và Nhà thơ.'],
        explanation: 'Tập Nhà thơ giao với tập Triết gia (khác rỗng). Mà toàn bộ tập Triết gia nằm trong tập Thông thái. Do đó phần giao nhau này cũng nằm trong tập Thông thái ⟹ Một số nhà thơ thông thái.',
        trapAnalysis: 'Không thể kết luận TẤT CẢ nhà thơ đều thông thái vì chỉ có MỘT SỐ triết gia là nhà thơ.',
        remedyTopic: 'Biểu đồ Ven và tam đoạn luận logic'
      }
    ]
  },

  {
    id: 'dgnl_node_2',
    stationNumber: 2,
    stageId: 2,
    stageName: 'Giai đoạn 2: Phân tích số liệu & Đọc hiểu biểu đồ thống kê',
    stageFocus: 'Tốc độ tính toán tỷ lệ phần trăm tăng trưởng và phân tích biểu đồ tròn, cột, đường',
    title: 'Kỹ thuật Phân tích bảng số liệu thống kê & Tính toán tốc độ tăng trưởng nhanh 30s',
    subject: 'Tư duy Định lượng & Logic',
    difficulty: 'Vận dụng',
    summary: 'Công thức tốc độ tăng trưởng, tỷ trọng cơ cấu và phương pháp ước lượng số học không cần bấm máy tính cồng kềnh.',
    keyFormula: 'Tốc độ tăng trưởng = [(Giá trị mới - Giá trị cũ) / Giá trị cũ] × 100%; Tỷ trọng = (Thành phần / Tổng) × 100%',
    status: 'active',
    xp: 45,
    estimatedMinutes: 14,
    scoreContribution: '+60 Điểm ĐGNL',
    outcomes: {
      understand: [
        'Sự khác biệt giữa tăng trưởng tuyệt đối (số đơn vị) và tăng trưởng tương đối (phần trăm %).',
        'Cách đọc trục số liệu biểu đồ kết hợp (vừa cột vừa đường) có 2 trục tung khác đơn vị.'
      ],
      canDo: [
        'Ước lượng tỷ lệ % bằng phương pháp làm tròn số học thông minh để chọn ngay đáp án trong 20s.',
        'Tránh bẫy lệch đơn vị (tấn vs triệu tấn, USD vs tỷ VNĐ).'
      ],
      keyConcept: 'Kỹ thuật so sánh phân số A/B và C/D bằng phương pháp tích chéo hoặc so sánh với phân số trung gian.',
      prerequisites: 'Tính toán tỷ lệ phần trăm căn bản.',
      scoreImpact: 'Ăn trọn 10 câu phân tích số liệu trong bài thi ĐGNL.',
      whyThisStation: 'Phần thi gỡ điểm nhanh nhất nếu nắm được mẹo ước lượng số học.'
    },
    theory: {
      overview: 'Phần phân tích số liệu gồm các bài toán kèm bảng biểu kinh tế, xã hội, môi trường. Đề thi không kiểm tra khả năng bấm máy tính dài dòng mà kiểm tra tư duy chọn lọc dữ liệu và ước lượng nhanh.',
      deepExplanation: 'Mẹo làm tròn để ước tính: Thay vì tính 34,892 / 121,450 hãy làm tròn thành 35 / 120 = 7 / 24 ≈ 29.2%. Trong 4 đáp án trắc nghiệm khoảng cách thường cách nhau ít nhất 3-5%, vì vậy việc làm tròn 2 chữ số có nghĩa luôn cho đáp án chính xác!',
      keyFormulas: [
        { name: 'Tốc độ tăng trưởng hàng năm (CAGR)', formula: 'r = (Giá trị cuối / Giá trị đầu)^(1/n) - 1', note: 'n là số năm' }
      ],
      commonTraps: [
        { trap: 'Nhầm lẫn giữa tăng X% và tăng thêm X điểm phần trăm.', howToAvoid: 'Tăng từ 10% lên 15% là tăng thêm 5 điểm phần trăm, nhưng tốc độ tăng trưởng là (15-10)/10 = 50%!' }
      ],
      summaryTakeaways: [
        'Nhìn kỹ đơn vị 2 trục tung của biểu đồ.',
        'Làm tròn số để ước lượng nhanh.'
      ]
    },
    workedExamples: [
      {
        title: 'Ví dụ 1: Tính tốc độ tăng trưởng doanh thu',
        problem: 'Năm 2022 doanh thu công ty đạt 400 tỷ đồng, năm 2023 đạt 520 tỷ đồng. Tốc độ tăng trưởng doanh thu năm 2023 so với 2022 là:',
        level: 'Nền tảng',
        patternRecognition: 'Áp dụng công thức tăng trưởng tương đối.',
        steps: [
          { stepNum: 1, action: 'Tính mức tăng tuyệt đối', explanation: 'Δ = 520 - 400 = 120 tỷ đồng.' },
          { stepNum: 2, action: 'Tính tỷ lệ phần trăm tăng trưởng', explanation: 'r = (120 / 400) × 100% = 30%.' }
        ],
        finalAnswer: '30%',
        verificationTrick: '400 × 1.3 = 520. Đúng!'
      }
    ],
    practiceQuestions: [
      {
        id: 'dgnl_q2_1',
        question: 'Biết dân số tỉnh A năm 2020 là 2 triệu người, tốc độ tăng dân số bình quân mỗi năm là 1.5%. Dân số tỉnh A năm 2022 xấp xỉ là:',
        options: ['2.06 triệu người', '2.03 triệu người', '2.10 triệu người', '2.00 triệu người'],
        correctAnswer: 0,
        hints: ['Dân số sau 2 năm: N = 2 × (1 + 0.015)².'],
        explanation: 'N = 2 × (1.015)² = 2 × 1.030225 ≈ 2.06045 triệu người.',
        trapAnalysis: 'Nếu quên tính lãi kép (tính tăng đều 1.5% × 2 = 3% = 2.06 triệu) thì kết quả vẫn xấp xỉ 2.06 triệu nhưng về bản chất phải hiểu là tăng theo cấp số nhân.',
        remedyTopic: 'Bài toán tăng trưởng dân số và lãi kép'
      }
    ],
    masteryTest: [
      {
        id: 'dgnl_m2_1',
        question: 'Nếu tỷ trọng sản phẩm A trong tổng doanh thu giảm từ 40% xuống 30%, trong khi tổng doanh thu tăng gấp đôi. Doanh thu của sản phẩm A đã:',
        options: ['Tăng 50%', 'Giảm 25%', 'Giảm 10%', 'Không đổi'],
        correctAnswer: 0,
        hints: ['Giả sử tổng doanh thu ban đầu là 100. Doanh thu A ban đầu là 40. Sau đó tổng doanh thu là 200, A chiếm 30% là 60.'],
        explanation: 'Doanh thu A lúc đầu: 40. Doanh thu A lúc sau: 30% × 200 = 60. Tốc độ tăng trưởng của A: (60 - 40)/40 = 50%.',
        trapAnalysis: 'Rất nhiều học sinh thấy tỷ trọng giảm từ 40% xuống 30% liền chọn "Giảm" mà quên mất quy mô tổng thể đã tăng gấp đôi!',
        remedyTopic: 'Mối quan hệ giữa tỷ trọng cơ cấu và quy mô tuyệt đối'
      }
    ]
  }
];

// ============================================================
// 3. PRESET: IELTS ACADEMIC BỨT PHÁ (BAND 7.5+)
// ============================================================
export const ROADMAP_IELTS: LearningNode[] = [
  {
    id: 'ielts_node_1',
    stationNumber: 1,
    stageId: 1,
    stageName: 'Giai đoạn 1: Chẩn đoán & Cấu trúc lập luận Writing Task 2',
    stageFocus: 'Làm chủ cấu trúc thân bài PEEL và Collocations học thuật C1/C2',
    title: 'Cấu trúc Thân bài PEEL (Point - Explanation - Example - Link) chuẩn Band 7.5+',
    subject: 'IELTS Writing',
    difficulty: 'Vận dụng cao 9+',
    summary: 'Cách phát triển luận điểm chặt chẽ, mở rộng ý sâu sắc không bị cụt ý và liên kết mạch lạc (Cohesion & Coherence).',
    keyFormula: 'P (Topic sentence) ⟹ E (Elaborate WHY) ⟹ E (Concrete Evidence/Example) ⟹ L (Link back to prompt)',
    status: 'completed',
    xp: 50,
    estimatedMinutes: 15,
    scoreContribution: '+0.5 Band Writing',
    outcomes: {
      understand: [
        'Tiêu chí chấm điểm Task Achievement: Giám khảo cần chiều sâu phân tích chứ không cần liệt kê quá nhiều ý hời hợt.',
        'Mối nối mạch lạc giữa câu chủ đề và câu giải thích nguyên nhân sâu xa.'
      ],
      canDo: [
        'Viết một đoạn thân bài 80-100 từ chuẩn chỉnh trong 10 phút.',
        'Sử dụng các từ nối tinh tế: Consequently, In particular, This phenomenon is precipitated by...'
      ],
      keyConcept: 'Mỗi thân bài chỉ nên có 1 hoặc tối đa 2 luận điểm trọng tâm nhưng phải được giải thích đến tận cùng.',
      prerequisites: 'Ngữ pháp câu phức và từ vựng B2.',
      scoreImpact: 'Nâng band Task Response và Coherence & Cohesion từ 6.0 lên 7.5+.',
      whyThisStation: 'Khắc phục lỗi lớn nhất của học sinh Việt Nam: ý tưởng rời rạc và thiếu tính liên kết chặt chẽ.'
    },
    theory: {
      overview: 'Writing Task 2 chiếm 2/3 tổng số điểm bài thi Viết. Cấu trúc PEEL là tiêu chuẩn vàng của các bài luận học thuật quốc tế.',
      deepExplanation: 'Phân tích từng thành phần:\n- Point: Nêu rõ luận điểm chính khẳng định lập trường.\n- Explanation: Trả lời câu hỏi "Tại sao điều đó lại xảy ra và hệ quả là gì?".\n- Example: Dẫn chứng số liệu, chính sách hoặc trường hợp điển hình.\n- Link: Câu chốt hạ gắn kết quả phân tích về lại yêu cầu đề bài.',
      keyFormulas: [
        { name: 'Khung câu PEEL mẫu', formula: 'The primary rationale is that... Specifically, when... For instance, a study by... Therefore, it is evident that...', note: 'Linh hoạt biến đổi từ vựng' }
      ],
      commonTraps: [
        { trap: 'Đưa ra ví dụ cá nhân ("Ví dụ như tôi hay bạn tôi...").', howToAvoid: 'Writing Academic yêu cầu tính khách quan: Dùng "For instance, empirical evidence from developing nations demonstrates..."' }
      ],
      summaryTakeaways: [
        'Không liệt kê "First, Second, Third" một cách cơ học.',
        'Ý sâu > Ý nhiều.'
      ]
    },
    workedExamples: [
      {
        title: 'Ví dụ mẫu: Viết đoạn văn về tác động của làm việc từ xa',
        problem: 'Viết thân bài phân tích lợi ích của Remote Working đối với năng suất lao động.',
        level: 'Vận dụng cao 9+',
        patternRecognition: 'Dạng bài Discuss Advantage ⟹ Sử dụng PEEL.',
        steps: [
          { stepNum: 1, action: 'Point', explanation: 'One undeniable benefit of remote working is the considerable reduction in commuting time, which fosters higher employee productivity.' },
          { stepNum: 2, action: 'Explanation', explanation: 'Without the physical exhaustion caused by daily transit in congested traffic, workers can allocate their mental energy more efficiently to complex tasks.' },
          { stepNum: 3, action: 'Example', explanation: 'For example, recent data from European tech enterprises revealed a 15% increase in weekly output after adopting flexible telecommuting arrangements.' },
          { stepNum: 4, action: 'Link', explanation: 'Consequently, allowing staff to operate from home directly bolsters workplace efficiency.' }
        ],
        finalAnswer: 'Đoạn văn 85 từ đạt tiêu chuẩn Band 8.0',
        verificationTrick: 'Kiểm tra 4 tiêu chí: Đủ cả 4 chữ cái P - E - E - L không thiếu phần nào.'
      }
    ],
    practiceQuestions: [
      {
        id: 'ielts_q1_1',
        question: 'Trong cấu trúc PEEL, vai trò của câu Link (L) là gì?',
        options: [
          'Tóm tắt lại ý chính của đoạn và kết nối trực tiếp về câu hỏi đề bài',
          'Đưa ra một luận điểm mới hoàn toàn để chuẩn bị cho đoạn sau',
          'Liệt kê thêm các ví dụ minh họa chi tiết',
          'Khẳng định lại thông tin cá nhân của người viết'
        ],
        correctAnswer: 0,
        hints: ['Link có nghĩa là liên kết, kết nối về lại luận đề chung.'],
        explanation: 'Câu Link đóng vai trò neo giữ đoạn văn, chứng minh cho giám khảo thấy lập luận vừa nêu giải quyết trực tiếp yêu cầu đề bài.',
        trapAnalysis: 'Đưa luận điểm mới vào câu Link là lỗi cấu trúc nghiêm trọng.',
        remedyTopic: 'Cấu trúc bài luận học thuật IELTS'
      }
    ],
    masteryTest: [
      {
        id: 'ielts_m1_1',
        question: 'Cụm từ nào sau đây mang tính học thuật (Academic) cao nhất để đưa ra ví dụ?',
        options: [
          'A compelling illustration of this is...',
          'Like for example as I see...',
          'You can see this clearly when...',
          'Just imagine that...'
        ],
        correctAnswer: 0,
        hints: ['Chọn cụm từ trang trọng, khách quan không dùng đại từ ngôi thứ nhất/hai.'],
        explanation: '"A compelling illustration of this is..." là cụm collocation C1/C2 chuẩn mực trong văn phong nghị luận.',
        trapAnalysis: 'Tránh dùng "You can see" hoặc "Just imagine" vì mang tính khẩu ngữ (informal).',
        remedyTopic: 'Academic Lexical Resource trong IELTS Writing'
      }
    ]
  },
  {
    id: 'ielts_node_2',
    stationNumber: 2,
    stageId: 2,
    stageName: 'Giai đoạn 2: Nâng cấp Vốn từ vựng & Cấu trúc Linh hoạt (LR & GRA)',
    stageFocus: 'Làm chủ Nominalisation (Danh từ hóa) và Collocations học thuật tự nhiên',
    title: 'Chiến thuật Paraphrasing & Nâng cấp Lexical Resource C1/C2 không gượng ép',
    subject: 'IELTS Writing & Reading',
    difficulty: 'Vận dụng',
    summary: 'Kỹ thuật chuyển đổi cấu trúc ngữ pháp và danh từ hóa thay vì chỉ tra từ điển tìm từ đồng nghĩa đơn lẻ gây tối nghĩa.',
    keyFormula: 'Động từ + Trạng từ ⟹ Danh từ hóa + Tính từ (e.g. "consume water rapidly" ⟹ "a rapid surge in water consumption")',
    status: 'active',
    xp: 45,
    estimatedMinutes: 14,
    scoreContribution: '+0.5 Band Lexical Resource',
    outcomes: {
      understand: [
        'Bản chất Paraphrasing đỉnh cao là thay đổi cấu trúc câu (Word Class Transformation), không phải thay từng từ riêng lẻ bằng từ lạ.',
        'Nguyên tắc Collocation: Từ chỉ được coi là tự nhiên khi đi kèm đúng giới từ và danh từ đối ứng.'
      ],
      canDo: [
        'Danh từ hóa (Nominalisation) các cụm vị ngữ để biến câu văn thành văn phong học thuật trang trọng.',
        'Nhận diện các bẫy sai ngữ cảnh khi sử dụng Thesaurus (từ điển đồng nghĩa).'
      ],
      keyConcept: 'Kỹ thuật "Word Family Switch": Chuyển Verb ⟹ Noun Phrase để câu văn mang tính khách quan và súc tích.',
      prerequisites: 'Cấu trúc cụm danh từ (Noun Phrases) và mạo từ a/an/the.',
      scoreImpact: 'Ăn chắc điểm 7.5+ ở tiêu chí Lexical Resource (LR) và Grammatical Range and Accuracy (GRA).',
      whyThisStation: 'Khắc phục thói quen dịch "word-by-word" từ tiếng Việt sang tiếng Anh khiến bài thi Writing bị gượng gạo.'
    },
    theory: {
      overview: 'Giám khảo IELTS đánh giá cao tính tự nhiên và chính xác (precision) hơn là việc cố nhét những từ vựng hiếm (obscure words) sai ngữ cảnh.',
      deepExplanation: '3 phương pháp Paraphrase chuẩn quốc tế:\n1. Thay đổi dạng từ (Nominalisation): "People migrate to cities" ⟹ "Urban migration".\n2. Thay đổi trật tự logic & Thể bị động: "Technology transforms education" ⟹ "Educational practices have undergone profound transformations facilitated by technology".\n3. Cụm từ bao hàm (General to specific hoặc ngược lại): "cars, buses and trains" ⟹ "modes of transport".',
      keyFormulas: [
        { name: 'Công thức Danh từ hóa', formula: 'Subject + Verb + Adverb ⟹ There is + Adjective + Noun + in + Object', note: 'Ví dụ: Temperatures rose significantly ⟹ There was a significant rise in temperatures' }
      ],
      commonTraps: [
        { trap: 'Tra từ điển đồng nghĩa rồi thay thế cơ học dẫn đến câu vô nghĩa (e.g., "fast food" thay bằng "quick nutrition").', howToAvoid: 'Chỉ dùng từ đồng nghĩa khi bạn chắc chắn 100% về văn cảnh và Collocation đi kèm.' }
      ],
      summaryTakeaways: [
        'Chính xác > Hoa mỹ.',
        'Danh từ hóa giúp câu văn súc tích và khách quan hơn.',
        'Học từ theo cụm Collocation 3-4 từ, không học từ vựng đơn lẻ.'
      ]
    },
    workedExamples: [
      {
        title: 'Ví dụ 1: Paraphrase câu mở đầu đề bài (Introduction Prompt)',
        problem: 'Đề bài: "Many young people today prefer to communicate via social media rather than face-to-face interaction."',
        level: 'Vận dụng',
        patternRecognition: 'Đổi cấu trúc prefer A to B ⟹ show a marked preference for.',
        steps: [
          { stepNum: 1, action: 'Xác định từ khóa cốt lõi', explanation: 'Young people, prefer, communicate via social media, face-to-face interaction.' },
          { stepNum: 2, action: 'Biến đổi ngữ pháp & Collocations', explanation: 'Young people ⟹ the younger generation; prefer ⟹ exhibit a strong inclination toward; communicate via social media ⟹ virtual interaction; face-to-face ⟹ in-person communication.' },
          { stepNum: 3, action: 'Viết câu hoàn chỉnh', explanation: 'Nowadays, the younger generation tends to exhibit a pronounced preference for virtual interaction over in-person conversations.' }
        ],
        finalAnswer: 'Câu paraphrase chuẩn Band 8.0 mượt mà, giữ trọn vẹn ngữ nghĩa gốc.',
        verificationTrick: 'So sánh nghĩa: Câu mới truyền tải đúng 100% thông điệp của đề bài nhưng với văn phong học thuật cao cấp.'
      }
    ],
    practiceQuestions: [
      {
        id: 'ielts_q2_1',
        question: 'Cách viết nào sau đây thể hiện kỹ thuật Danh từ hóa (Nominalisation) chuẩn xác cho câu: "The population increased dramatically"?',
        options: [
          'There was a dramatic increase in the population',
          'The dramatic population was increased',
          'Increasing dramatically was what the population did',
          'People grew in numbers very fast'
        ],
        correctAnswer: 0,
        hints: ['Đổi động từ "increased" thành danh từ "increase", trạng từ "dramatically" thành tính từ "dramatic".'],
        explanation: '"There was a dramatic increase in the population" là cấu trúc danh từ hóa kinh điển trong IELTS Writing Task 1 và Task 2.',
        trapAnalysis: 'Phương án B làm sai chủ ngữ ("dramatic population"), phương án D là khẩu ngữ không phù hợp cho bài viết học thuật.',
        remedyTopic: 'Kỹ thuật Danh từ hóa (Nominalisation) trong tiếng Anh'
      }
    ],
    masteryTest: [
      {
        id: 'ielts_m2_1',
        question: 'Collocation nào dưới đây tự nhiên và chuẩn học thuật nhất để diễn đạt "giải quyết vấn đề ô nhiễm môi trường"?',
        options: [
          'Tackle the issue of environmental degradation',
          'Repair the broken environment problem',
          'Make an answer to pollution dilemma',
          'Do something about dirty nature'
        ],
        correctAnswer: 0,
        hints: ['Động từ "tackle" (giải quyết) đi cùng "issue" hoặc "problem", "environmental degradation" là thuật ngữ học thuật chuẩn.'],
        explanation: '"Tackle the issue of environmental degradation" đạt độ chính xác và tự nhiên cao nhất chuẩn C1/C2.',
        trapAnalysis: 'Các phương án B, C, D dịch theo lối nói tiếng Việt ("repair environment", "do something about dirty nature") làm mất điểm Lexical Resource.',
        remedyTopic: 'Academic Collocations chủ đề Môi trường'
      }
    ]
  }
];


// ============================================================
// 4. PRESET: LẬP TRÌNH WEB FULL-STACK & GPA A/A+
// ============================================================
export const ROADMAP_FULLSTACK: LearningNode[] = [
  {
    id: 'it_node_1',
    stationNumber: 1,
    stageId: 1,
    stageName: 'Giai đoạn 1: Nền tảng cấu trúc & Tư duy giải thuật',
    stageFocus: 'Tối ưu độ phức tạp thuật toán O(N) và cơ chế bất đồng bộ JavaScript',
    title: 'Cơ chế Bất đồng bộ trong JavaScript: Event Loop, Promise & Async/Await bản chất',
    subject: 'Công Nghệ Thông Tin',
    difficulty: 'Vận dụng',
    summary: 'Hiểu cặn kẽ Call Stack, Web APIs, Microtask Queue vs Macrotask Queue để debug lỗi race-condition và tối ưu render.',
    keyFormula: 'Microtasks (Promise.then, queueMicrotask) luôn được ưu tiên xử lý TRƯỚC Macrotasks (setTimeout, setInterval).',
    status: 'completed',
    xp: 45,
    estimatedMinutes: 15,
    scoreContribution: '+1.0 GPA Học Phần Web',
    outcomes: {
      understand: [
        'Tại sao JavaScript là single-threaded nhưng vẫn xử lý non-blocking I/O hiệu quả.',
        'Sự khác nhau giữa Microtask Queue và Macrotask Queue trong Event Loop.'
      ],
      canDo: [
        'Dự đoán chính xác 100% thứ tự console.log của các đoạn code bất đồng bộ phức tạp.',
        'Chuyển đổi thuần thục giữa Callback, Promise chaining và cú pháp Async/Await với try/catch.'
      ],
      keyConcept: 'Event Loop chỉ kéo task từ Queue lên Stack khi và chỉ khi Call Stack hoàn toàn TRỐNG (Empty).',
      prerequisites: 'Cú pháp JavaScript ES6 cơ bản (Arrow functions, Destructuring).',
      scoreImpact: 'Chinh phục câu hỏi phỏng vấn kỹ thuật và điểm A môn Lập trình Web.',
      whyThisStation: 'Kiến thức cốt lõi phân biệt giữa lập trình viên nghiệp dư và kỹ sư phần mềm chuyên nghiệp.'
    },
    theory: {
      overview: 'JavaScript chạy trên một Single Thread duy nhất với Call Stack. Khi gặp tác vụ tốn thời gian (Network fetch, Timer), nó đẩy sang trình duyệt Web APIs xử lý nền và tiếp tục chạy các dòng code tiếp theo.',
      deepExplanation: 'Thứ tự ưu tiên thực thi:\n1. Toàn bộ code đồng bộ (Synchronous) trên Call Stack.\n2. Tất cả Microtasks trong Microtask Queue (Promise.then, MutationObserver).\n3. Một Macrotask từ Macrotask Queue (setTimeout, setInterval, I/O).\n4. Render UI nếu cần thiết.\n5. Lặp lại chu trình.',
      keyFormulas: [
        { name: 'Thứ tự ưu tiên', formula: 'Call Stack > Microtasks (Promise) > Macrotasks (setTimeout)', note: 'Bất biến trong Node.js và Browser' }
      ],
      commonTraps: [
        { trap: 'Nghĩ rằng setTimeout(fn, 0) sẽ chạy ngay lập tức.', howToAvoid: 'setTimeout(fn, 0) chỉ đăng ký vào Macrotask Queue, nó BẮT BUỘC phải chờ Call Stack và toàn bộ Microtask Queue hoàn thành mới được chạy.' }
      ],
      summaryTakeaways: [
        'Promise resolve đưa callback vào Microtask Queue.',
        'setTimeout đưa callback vào Macrotask Queue.',
        'Luôn dùng async/await kèm try/catch để code sạch và dễ bắt lỗi.'
      ]
    },
    workedExamples: [
      {
        title: 'Ví dụ 1: Dự đoán thứ tự output của Event Loop',
        problem: 'Cho đoạn code: console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4); Thứ tự in ra là gì?',
        level: 'Vận dụng',
        patternRecognition: 'Phân loại: Đồng bộ vs Microtask vs Macrotask.',
        steps: [
          { stepNum: 1, action: 'Chạy code đồng bộ', explanation: 'In 1. Gặp setTimeout ⟹ đẩy vào Macrotask Queue. Gặp Promise.then ⟹ đẩy vào Microtask Queue. In 4.' },
          { stepNum: 2, action: 'Kiểm tra Call Stack trống ⟹ Quét Microtask Queue', explanation: 'Microtask Queue có then(() => console.log(3)) ⟹ In 3.' },
          { stepNum: 3, action: 'Quét Macrotask Queue', explanation: 'Lấy setTimeout(() => console.log(2)) ⟹ In 2.' }
        ],
        finalAnswer: '1 -> 4 -> 3 -> 2',
        verificationTrick: 'Chạy thử trong Chrome DevTools Console ra đúng 1, 4, 3, 2!'
      }
    ],
    practiceQuestions: [
      {
        id: 'it_q1_1',
        question: 'Tác vụ nào sau đây được xếp vào Microtask Queue trong JavaScript?',
        options: [
          'Callback của Promise.then()',
          'Callback của setTimeout()',
          'Callback của setInterval()',
          'Sự kiện click chuột của người dùng'
        ],
        correctAnswer: 0,
        hints: ['Promise.then, catch, finally thuộc hàng đợi Microtask.'],
        explanation: 'Promise callbacks và queueMicrotask thuộc Microtask Queue, trong khi timers (setTimeout) và DOM events thuộc Macrotask Queue.',
        trapAnalysis: 'Rất nhiều người nhầm setTimeout(0) là Microtask.',
        remedyTopic: 'Event Loop và Asynchronous Queues'
      }
    ],
    masteryTest: [
      {
        id: 'it_m1_1',
        question: 'Khi sử dụng async/await, từ khóa await có tác dụng gì?',
        options: [
          'Tạm dừng việc thực thi hàm async hiện tại cho đến khi Promise được giải quyết (resolve), trả về giá trị kết quả',
          'Tạo ra một Thread mới chạy song song trong CPU',
          'Khóa toàn bộ trình duyệt không cho người dùng thao tác',
          'Tự động hủy bỏ Promise nếu quá thời gian'
        ],
        correctAnswer: 0,
        hints: ['await chỉ tạm dừng bên trong hàm async, không block main thread.'],
        explanation: 'await tạm dừng hàm async và biến phần code phía sau thành một Microtask tương đương .then(), cho phép code nhìn như đồng bộ nhưng chạy bất đồng bộ.',
        trapAnalysis: 'JavaScript không có multi-thread do await tạo ra.',
        remedyTopic: 'Async / Await Syntax và Cơ chế hoạt động'
      }
    ]
  },
  {
    id: 'it_node_2',
    stationNumber: 2,
    stageId: 2,
    stageName: 'Giai đoạn 2: Quản lý Trạng thái & Tối ưu Render Frontend',
    stageFocus: 'Nắm vững React State Immutability, Virtual DOM Diffing & Tránh Re-render thừa',
    title: 'React State Management: Immutability, Reconciliation & Kỹ thuật Memoization',
    subject: 'Công Nghệ Thông Tin',
    difficulty: 'Vận dụng cao 9+',
    summary: 'Hiểu nguyên lý Shallow Comparison của React, giải quyết triệt để lỗi đột biến dữ liệu (Mutating State) và dùng React.memo/useCallback đúng chỗ.',
    keyFormula: 'setState(prev => [...prev, newItem]) thay vì state.push(); useMemo cho tác vụ tính toán nặng, useCallback cho hàm truyền xuống memoized child.',
    status: 'active',
    xp: 50,
    estimatedMinutes: 16,
    scoreContribution: '+1.0 GPA Đồ Án Chuyên Ngành',
    outcomes: {
      understand: [
        'React chỉ re-render khi tham chiếu bộ nhớ (memory reference) của state thay đổi.',
        'Chi phí của Virtual DOM Diffing và khi nào Memoization thực sự mang lại hiệu năng so với overhead.'
      ],
      canDo: [
        'Cập nhật state phức tạp (Nested Objects, Arrays) an toàn bằng cú pháp Spread Operator mà không làm mutate state cũ.',
        'Sử dụng React DevTools Profiler để bắt bệnh component bị re-render liên tục.'
      ],
      keyConcept: 'Immutability (Tính bất biến) là nền tảng của React: Không bao giờ thay đổi trực tiếp biến state hiện tại.',
      prerequisites: 'Cơ bản về React Functional Components và useState Hook.',
      scoreImpact: 'Ăn điểm tuyệt đối phần Kiến trúc phần mềm trong bài thi thực hành hoặc phỏng vấn Fresher.',
      whyThisStation: 'Lỗi mutate state trực tiếp là nguyên nhân số 1 gây ra bug không cập nhật giao diện trong các dự án thực tế.'
    },
    theory: {
      overview: 'React so sánh state cũ và mới bằng toán tử Object.is (Shallow Comparison). Nếu bạn mutate trực tiếp một mảng (ví dụ: arr.push(x)), tham chiếu con trỏ bộ nhớ không đổi ⟹ React coi như không có gì thay đổi và không vẽ lại UI.',
      deepExplanation: 'Nguyên tắc cập nhật State an toàn:\n1. Mảng: Thêm dùng [...arr, item], Xóa dùng arr.filter(x => x.id !== id), Sửa dùng arr.map(x => x.id === id ? {...x, done: true} : x).\n2. Object lồng nhau: setUser(prev => ({ ...prev, profile: { ...prev.profile, age: 25 } })).\n3. Tối ưu Re-render: Chỉ dùng useCallback khi truyền hàm cho con đã được bọc React.memo.',
      keyFormulas: [
        { name: 'Cập nhật Mảng chuẩn React', formula: 'setList(prev => prev.map(item => item.id === targetId ? { ...item, ...updates } : item))', note: 'Giữ tính bất biến 100%' }
      ],
      commonTraps: [
        { trap: 'Dùng mảng/đối tượng làm dependency array trong useEffect mà không memoize, gây ra Infinite Loop.', howToAvoid: 'Dùng primitive values hoặc bọc object trong useMemo.' }
      ],
      summaryTakeaways: [
        'Không bao giờ dùng arr.push() hay obj.prop = val với React state.',
        'Luôn dùng updater function: setCount(prev => prev + 1).',
        'Lạm dụng useMemo/useCallback khi không cần thiết có thể làm chậm app hơn do overhead.'
      ]
    },
    workedExamples: [
      {
        title: 'Ví dụ 1: Sửa bug Mutate State trong danh sách giỏ hàng',
        problem: 'Đoạn code sau không render lại khi tăng số lượng sản phẩm: const handleAdd = (id) => { const item = cart.find(x => x.id === id); item.qty += 1; setCart(cart); }; Hãy sửa lại cho đúng chuẩn Immutability.',
        level: 'Vận dụng cao 9+',
        patternRecognition: 'item.qty += 1 và setCart(cart) giữ nguyên tham chiếu mảng cũ ⟹ React bỏ qua render.',
        steps: [
          { stepNum: 1, action: 'Sử dụng map để tạo mảng mới và clone object cần sửa', explanation: 'setCart(prevCart => prevCart.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item));' },
          { stepNum: 2, action: 'Kiểm tra tham chiếu mới', explanation: 'Mảng mới được tạo với địa chỉ bộ nhớ mới, object được sửa cũng có địa chỉ mới ⟹ React kích hoạt Reconciliation render UI chính xác.' }
        ],
        finalAnswer: 'setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i))',
        verificationTrick: 'UI tự động cập nhật ngay lập tức mà không cần F5 trình duyệt.'
      }
    ],
    practiceQuestions: [
      {
        id: 'it_q2_1',
        question: 'Tại sao việc gọi `stateArray.push(newItem)` rồi `setArray(stateArray)` trong React lại KHÔNG làm giao diện cập nhật?',
        options: [
          'Vì React thực hiện so sánh nông (shallow comparison) tham chiếu bộ nhớ; con trỏ của stateArray không đổi nên React coi là không có thay đổi',
          'Vì hàm push() bị vô hiệu hóa trong React',
          'Vì React chỉ chấp nhận kiểu dữ liệu nguyên thủy (primitive types)',
          'Vì phải gọi window.location.reload() thì React mới nhận'
        ],
        correctAnswer: 0,
        hints: ['React so sánh tham chiếu Object.is(oldState, newState).'],
        explanation: 'Do con trỏ bộ nhớ của stateArray vẫn trỏ vào cùng một vùng nhớ, React so sánh thấy oldState === newState nên bỏ qua quá trình render để tiết kiệm tài nguyên.',
        trapAnalysis: 'Chọn B sai vì push() là hàm chuẩn của JavaScript, React không cấm chạy nhưng nó vi phạm nguyên lý immutability.',
        remedyTopic: 'React State Immutability & Shallow Comparison'
      }
    ],
    masteryTest: [
      {
        id: 'it_m2_1',
        question: 'Khi nào việc sử dụng `useCallback` thực sự mang lại lợi ích hiệu năng rõ rệt?',
        options: [
          'Khi hàm đó được truyền làm prop xuống một Component con đã được bọc bằng `React.memo`',
          'Cho tất cả mọi hàm viết trong component mà không cần điều kiện gì',
          'Khi hàm đó chỉ chứa các phép toán cộng trừ đơn giản',
          'Khi component đó không bao giờ bị re-render'
        ],
        correctAnswer: 0,
        hints: ['useCallback giữ nguyên tham chiếu hàm để ngăn chặn component con (được memoized) bị re-render vô ích.'],
        explanation: 'Nếu component con không được bọc React.memo, nó vẫn sẽ luôn re-render khi cha re-render dù prop hàm có dùng useCallback hay không. Do đó useCallback chỉ phát huy giá trị khi kết hợp với React.memo.',
        trapAnalysis: 'Bọc useCallback tràn lan cho mọi hàm sẽ gây lãng phí bộ nhớ lưu trữ dependency array.',
        remedyTopic: 'Kỹ thuật tối ưu render với React.memo và useCallback'
      }
    ]
  }
];

// ============================================================
// 5. PRESET: LẤY GỐC CẤP TỐC 30 NGÀY
// ============================================================
export const ROADMAP_LAY_GOC: LearningNode[] = [
  {
    id: 'goc_node_1',
    stationNumber: 1,
    stageId: 1,
    stageName: 'Giai đoạn 1: Cấp cứu chống điểm liệt & Đạo hàm căn bản',
    stageFocus: 'Lấy lại 100% gốc công thức đạo hàm lớp 11 và phương trình tiếp tuyến',
    title: 'Bảng 10 Công thức Đạo hàm Vàng & Phương trình Tiếp tuyến không sợ sai',
    subject: 'Toán học',
    difficulty: 'Nền tảng',
    summary: 'Quy tắc tính đạo hàm u/v, u.v, đạo hàm hàm hợp và công thức phương trình tiếp tuyến y = f\'(x₀)(x - x₀) + y₀.',
    keyFormula: '(x^n)\' = n.x^(n-1); (u/v)\' = (u\'v - uv\') / v²; Tiếp tuyến: y = f\'(x₀)(x - x₀) + y₀',
    status: 'completed',
    xp: 35,
    estimatedMinutes: 10,
    scoreContribution: '+0.6 Điểm THPT',
    outcomes: {
      understand: [
        'Ý nghĩa hình học của đạo hàm tại một điểm x₀ chính là hệ số góc k của tiếp tuyến tại điểm đó.',
        'Sự khác nhau giữa "tiếp tuyến TẠI điểm M(x₀; y₀)" và "tiếp tuyến ĐI QUA điểm A(x_A; y_A)".'
      ],
      canDo: [
        'Tính đạo hàm của mọi hàm đa thức, phân thức bậc nhất/bậc nhất trong 10 giây.',
        'Viết chính xác phương trình tiếp tuyến biết hoành độ tiếp điểm x₀.'
      ],
      keyConcept: 'Đạo hàm phân thức bậc nhất y = (ax+b)/(cx+d) có y\' = (ad - bc) / (cx + d)²',
      prerequisites: 'Cộng trừ nhân chia phân số và giải phương trình bậc nhất.',
      scoreImpact: 'Ăn chắc 0.6 điểm nhận biết, thoát khỏi vùng nguy hiểm mất gốc.',
      whyThisStation: 'Đạo hàm là chìa khóa mở toàn bộ cánh cửa chương 1 Khảo sát hàm số lớp 12.'
    },
    theory: {
      overview: 'Mất gốc Toán 12 đa phần là do quên đạo hàm lớp 11. Chỉ cần nắm vững bảng 10 công thức cơ bản và công thức tính nhanh đạo hàm phân thức là bạn có thể giải ngon lành 10 câu đầu tiên.',
      deepExplanation: 'Công thức tính nhanh đạo hàm hàm phân thức hữu tỉ:\ny = (ax + b) / (cx + d) ⟹ y\' = (a.d - b.c) / (cx + d)². Bạn chỉ cần nhớ quy tắc nhân chéo "Huyền trừ Sắc": (a nhân d) trừ đi (b nhân c). Mẫu số luôn là bình phương nên dấu của đạo hàm chỉ phụ thuộc vào tử số!',
      keyFormulas: [
        { name: 'Đạo hàm phân thức bậc nhất', formula: '[(ax+b)/(cx+d)]\' = (ad - bc) / (cx + d)²', note: 'Nhân chéo: ad trừ bc' },
        { name: 'Phương trình tiếp tuyến', formula: 'y = f\'(x₀)(x - x₀) + f(x₀)', note: 'x₀ là hoành độ tiếp điểm' }
      ],
      commonTraps: [
        { trap: 'Nhầm lẫn giữa (ad - bc) thành (ad + bc).', howToAvoid: 'Nhớ câu thần chú: "Huyền TRỪ Sắc".' }
      ],
      summaryTakeaways: [
        'Hàm phân thức (ax+b)/(cx+d) luôn đồng biến hoặc luôn nghịch biến trên từng khoảng xác định, không bao giờ có cực trị!'
      ]
    },
    workedExamples: [
      {
        title: 'Ví dụ 1: Viết phương trình tiếp tuyến tại một điểm',
        problem: 'Cho hàm số y = x³ - 3x + 1 (C). Viết phương trình tiếp tuyến của (C) tại điểm M có hoành độ x₀ = 2.',
        level: 'Nền tảng',
        patternRecognition: 'Tiếp tuyến TẠI điểm đã cho hoành độ x₀ = 2.',
        steps: [
          { stepNum: 1, action: 'Tính tung độ tiếp điểm y₀', explanation: 'y₀ = f(2) = 2³ - 3(2) + 1 = 8 - 6 + 1 = 3 ⟹ Tiếp điểm M(2; 3).' },
          { stepNum: 2, action: 'Tính đạo hàm và hệ số góc k', explanation: 'y\' = 3x² - 3 ⟹ Hệ số góc k = y\'(2) = 3(2²) - 3 = 12 - 3 = 9.' },
          { stepNum: 3, action: 'Viết phương trình tiếp tuyến', explanation: 'y = k(x - x₀) + y₀ = 9(x - 2) + 3 = 9x - 18 + 3 = 9x - 15.' }
        ],
        finalAnswer: 'y = 9x - 15',
        verificationTrick: 'Bấm d/dx (x³ - 3x + 1) tại x = 2 trên Casio ra ngay 9. Đúng!'
      }
    ],
    practiceQuestions: [
      {
        id: 'goc_q1_1',
        question: 'Đạo hàm của hàm số y = (2x - 1) / (x + 1) là:',
        options: [
          'y\' = 3 / (x + 1)²',
          'y\' = 1 / (x + 1)²',
          'y\' = -3 / (x + 1)²',
          'y\' = 2 / (x + 1)²'
        ],
        correctAnswer: 0,
        hints: ['Áp dụng ad - bc: 2 × 1 - (-1) × 1 = 2 - (-1) = 3.'],
        explanation: 'y\' = [2(1) - (-1)(1)] / (x + 1)² = (2 + 1) / (x + 1)² = 3 / (x + 1)².',
        trapAnalysis: 'Rất nhiều học sinh tính 2 - 1 = 1 vì quên dấu trừ của số -1.',
        remedyTopic: 'Đạo hàm phân thức bậc nhất'
      }
    ],
    masteryTest: [
      {
        id: 'goc_m1_1',
        question: 'Hệ số góc của tiếp tuyến của đồ thị hàm số y = x² - 4x + 3 tại điểm có hoành độ x₀ = 3 là:',
        options: ['k = 2', 'k = 0', 'k = 3', 'k = -4'],
        correctAnswer: 0,
        hints: ['Tính y\' = 2x - 4. Thay x = 3.'],
        explanation: 'y\' = 2x - 4 ⟹ k = y\'(3) = 2(3) - 4 = 6 - 4 = 2.',
        trapAnalysis: 'Nhầm lẫn giữa hệ số góc k = y\'(x₀) và tung độ y₀.',
        remedyTopic: 'Hệ số góc tiếp tuyến'
      }
    ]
  }
];

// ============================================================
// BẢNG DANH MỤC TỔNG HỢP CÁC LỘ TRÌNH (PRESET CATALOG)
// ============================================================
export const PRESET_CATALOG: Record<string, PresetRoadmap> = {
  thpt_a00: {
    id: 'thpt_a00',
    name: 'THPT QG Khối A00 (Toán - Lý - Hóa 27.5+)',
    goal: 'THPT_QG',
    score: '27.5+ Điểm',
    days: 88,
    dailyHours: 2.5,
    description: 'Chiến thuật nước rút 3 môn A00 nhắm Đại học Bách Khoa, CNTT. Tập trung diệt sạch bẫy đề và săn điểm 9+.',
    readinessInitial: 65,
    coachAdvice: 'Bạn đang ở chặng củng cố Vận dụng. Hãy ăn chắc 35 câu đầu Vật lý và rèn luyện kỹ thuật đổi biến tích phân đối xứng!',
    nodes: ROADMAP_THPT_A00
  },
  thpt_d01: {
    id: 'thpt_d01',
    name: 'THPT QG Khối D01 (Toán - Văn - Anh 26.5+)',
    goal: 'THPT_QG',
    score: '26.5+ Điểm',
    days: 88,
    dailyHours: 2.0,
    description: 'Bứt phá khối D01 nhắm Ngoại thương, Kinh tế Quốc dân. Trọng tâm: Toán 8.5+, Tiếng Anh 9.0+, Ngữ văn 8.5+.',
    readinessInitial: 60,
    coachAdvice: 'Hãy tập trung mở rộng vốn từ vựng Collocation Tiếng Anh và rèn kỹ năng xử lý bảng biến thiên Toán học.',
    nodes: ROADMAP_THPT_A00 // Có thể bổ sung chuyên biệt
  },
  dgnl_dhqg: {
    id: 'dgnl_dhqg',
    name: 'Đánh Giá Năng Lực ĐHQG (HSA 110+ / VNUHCM 900+)',
    goal: 'DGNL_DHQG',
    score: '900+ / 1200 Điểm',
    days: 75,
    dailyHours: 2.0,
    description: 'Chinh phục bài thi ĐGNL Hà Nội & TP.HCM: Rèn phản xạ logic, định lượng và phân tích bảng số liệu thần tốc.',
    readinessInitial: 55,
    coachAdvice: 'Điểm neo logic là chìa khóa vàng! Đừng tính toán máy móc, hãy tập ước lượng số học để tiết kiệm thời gian.',
    nodes: ROADMAP_DGNL
  },
  ielts_75: {
    id: 'ielts_75',
    name: 'IELTS Academic Bứt Phá (Band 7.5+)',
    goal: 'IELTS',
    score: 'Band 7.5+',
    days: 60,
    dailyHours: 2.0,
    description: 'Lộ trình chuyên sâu Writing & Speaking: Khắc phục lỗi cụt ý, nâng cấp cấu trúc PEEL và từ vựng C1/C2.',
    readinessInitial: 58,
    coachAdvice: 'Tập trung vào chiều sâu lập luận của từng đoạn thân bài thay vì đưa quá nhiều ý tưởng rời rạc.',
    nodes: ROADMAP_IELTS
  },
  it_web_fullstack: {
    id: 'it_web_fullstack',
    name: 'Lập Trình Web Full-Stack & GPA A/A+',
    goal: 'DAI_HOC_GPA',
    score: 'GPA 3.6+ / A',
    days: 90,
    dailyHours: 2.0,
    description: 'Lộ trình thực chiến từ thuật toán, JavaScript Event Loop, React State đến xây dựng REST API hoàn chỉnh.',
    readinessInitial: 50,
    coachAdvice: 'Hiểu cặn kẽ Event Loop và Microtasks trước khi nhảy vào React Hooks phức tạp.',
    nodes: ROADMAP_FULLSTACK
  },
  lay_goc_30: {
    id: 'lay_goc_30',
    name: 'Lấy Gốc Cấp Tốc 30 Ngày (Chống Liệt -> 7.5+)',
    goal: 'LAY_GOC',
    score: '7.5+ Điểm',
    days: 30,
    dailyHours: 1.5,
    description: 'Kế hoạch cấp cứu mất gốc trong 30 ngày: Nắm chắc 10 công thức đạo hàm vàng, mũ logarit và thoát điểm liệt.',
    readinessInitial: 40,
    coachAdvice: 'Đừng nản lòng! Chỉ cần nắm chắc 35 câu đầu là bạn đã có 7.0 điểm trong tay. Bắt đầu từ công thức đạo hàm ngay hôm nay!',
    nodes: ROADMAP_LAY_GOC
  }
};

// ============================================================
// HÀM SINH LỘ TRÌNH THÍCH ỨNG BẰNG EDUADVISOR AI
// ============================================================
export interface AdaptiveRoadmapInput {
  goal: string;
  targetExamName?: string;
  targetSchool?: string;
  subjectCombo?: string;
  targetScore: string;
  currentLevel: string;
  daysLeft: number;
  dailyHours: number;
  weakTopics?: string;
  learningStrategy?: string;
  numStations?: number;
  presetKey?: string;
}

export interface AdaptiveRoadmapResult {
  roadmapName: string;
  roadmapDescription: string;
  score: string;
  days: number;
  dailyHours: number;
  coachAdvice: string;
  feasibilityWarning?: string;
  isAiGenerated: boolean;
  nodes: LearningNode[];
}

// Bộ tổng hợp Lời khuyên Cố vấn Sư phạm Siêu tốc EduAdvisor AI (< 5ms)
function synthesizePedagogicalAdvice(input: {
  targetSchool?: string;
  targetScore: string;
  currentLevel: string;
  daysLeft: number;
  dailyHours: number;
  cleanWeak: string;
  learningStrategy: string;
  numStations?: number;
}): string {
  const { targetSchool, targetScore, currentLevel, daysLeft, dailyHours, cleanWeak, learningStrategy, numStations = 7 } = input;
  const schoolHighlight = targetSchool?.trim() ? `chinh phục mục tiêu vào ${targetSchool.trim()}` : `chạm mốc mục tiêu ${targetScore}`;
  const pacing = daysLeft < 45 ? `giai đoạn nước rút ${daysLeft} ngày` : `lộ trình ${daysLeft} ngày`;
  const timeCommitment = `với ${dailyHours}h tập trung cao độ mỗi ngày`;

  if (learningStrategy.includes('Nước rút')) {
    return `🎯 Chiến lược Nước Rút Về Đích (${pacing}, ${timeCommitment}): Để ${schoolHighlight} với xuất phát điểm ${currentLevel}, nguyên tắc vàng là "Không để mất điểm oan ở các câu nền tảng". Hãy dành thời gian giải quyết sạch sẽ các câu nhận biết - thông hiểu, và dành trọn thời gian còn lại dứt điểm 2 lỗ hổng then chốt: ${cleanWeak}. Bộ ${numStations} trạm học thích ứng được thiết lập chuyên sâu để bẻ gãy bẫy đề thi và tối ưu hóa điểm số bứt phá của bạn!`;
  }
  
  if (learningStrategy.includes('Chắc lý thuyết')) {
    return `💡 Chiến lược Làm Chủ Bản Chất (${pacing}): Điểm ${targetScore} không đến từ việc làm đề số lượng lớn mà đến từ việc trị dứt điểm ngộ nhận. Với ${cleanWeak}, hãy rà soát lại 100% định nghĩa và điều kiện nghiệm trước khi tăng tốc qua ${numStations} trạm học. Khi nền móng vững chắc, bạn sẽ tự tin đạt điểm tuyệt đối ở các câu vận dụng mà không lo bẫy đề!`;
  }

  if (learningStrategy.includes('Đột phá Vận dụng cao')) {
    return `⚡ Chiến lược Đột Phá Điểm Cao (${pacing} vào ${targetSchool || 'mục tiêu mơ ước'}): Ở mốc ${currentLevel}, ranh giới giữa trung bình khá và ${targetScore} nằm ở năng lực xử lý dạng bài bẫy và liên chuyên đề. Toàn bộ ${numStations} trạm học được EduAdvisor AI phân tầng trực tiếp vào việc bẻ gãy dạng bài bẫy của ${cleanWeak}, giúp bạn làm chủ tư duy giải nhanh trong phòng thi!`;
  }

  return `✨ Lời khuyên Cố vấn Sư phạm EduAdvisor AI: ${pacing} ${timeCommitment} là khoảng thời gian hoàn hảo để từ ${currentLevel} bứt phá lên ${targetScore}. Hãy bám sát ${numStations} trạm học thích ứng, tập trung vá triệt để "${cleanWeak}" và hoàn thành trọn vẹn các bài kiểm tra chuẩn đầu ra để mở khóa các mốc huy hiệu vinh danh!`;
}

export async function generateAdaptiveRoadmap(input: AdaptiveRoadmapInput): Promise<AdaptiveRoadmapResult> {
  const { 
    goal, 
    targetExamName,
    targetSchool,
    subjectCombo = 'Khối A00 (Toán - Lý - Hóa)',
    targetScore, 
    currentLevel, 
    daysLeft, 
    dailyHours, 
    weakTopics = '', 
    learningStrategy = 'Thực chiến luyện đề & Săn bẫy điểm cao',
    numStations = 7,
    presetKey 
  } = input;

  // 1. Phân tích tính khả thi sư phạm (Feasibility Check)
  let feasibilityWarning: string | undefined = undefined;
  if (daysLeft < 30 && (targetScore.includes('27') || targetScore.includes('9+') || targetScore.includes('8.0') || targetScore.includes('28'))) {
    feasibilityWarning = `⚠️ Cảnh báo sư phạm: Thời gian còn lại khá ngắn (${daysLeft} ngày) cho mục tiêu rất cao (${targetScore}). Lộ trình được EduAdvisor AI tối ưu hóa ưu tiên các chuyên đề có trọng số điểm cao nhất và mẹo loại trừ bẫy đề thay vì dàn trải lý thuyết.`;
  } else if (dailyHours < 1.5) {
    feasibilityWarning = `💡 Khuyến nghị: Bạn dành ${dailyHours}h/ngày. EduAdvisor AI đã thu gọn các trạm học xuống các dạng bài tinh gọn nhất để đảm bảo bạn không bị quá tải.`;
  }

  // 2. Tên và Mô tả lộ trình thích ứng hoàn toàn mới
  const examLabel = targetExamName || (
    goal === 'THPT_QG' ? 'THPT Quốc Gia 2025' :
    goal === 'DGNL_DHQG' ? 'ĐGNL ĐHQG (HSA & VNUHCM)' :
    goal === 'TSA_HUST' ? 'Đánh Giá Tư Duy ĐH Bách Khoa (TSA)' :
    goal === 'IELTS' ? 'IELTS Academic 4 Kỹ Năng' :
    goal === 'DAI_HOC_GPA' ? 'Đại Học GPA A & CNTT' :
    goal === 'CHUYEN_HSG' ? 'Bồi Dưỡng Học Sinh Giỏi & Thi Chuyên' :
    'Lấy Gốc Cấp Tốc Bứt Phá'
  );

  const roadmapName = targetSchool && targetSchool.trim() 
    ? `${examLabel}: ${subjectCombo} (${targetScore}) • ${targetSchool.trim()}`
    : `${examLabel}: ${subjectCombo} (Mục tiêu ${targetScore})`;

  const cleanWeak = weakTopics.trim() || 'Các dạng bài bẫy và câu hỏi phân loại';
  const roadmapDescription = `Chiến lược cá nhân hóa ${daysLeft} ngày (cường độ ${dailyHours}h/ngày) thiết kế riêng theo trình độ ${currentLevel}. Tập trung vá triệt để lỗ hổng "${cleanWeak}", rèn luyện kỹ năng nhận diện dạng bài trong 15s và bứt phá mục tiêu ${targetScore}. Quy mô: ${numStations} trạm học tối ưu hóa theo chiến lược: ${learningStrategy}.`;

  // 3. Lời khuyên Cố vấn Sư phạm AI Siêu Tốc (Instant Synthesized Advice)
  let customCoachAdvice = synthesizePedagogicalAdvice({
    targetSchool,
    targetScore,
    currentLevel,
    daysLeft,
    dailyHours,
    cleanWeak,
    learningStrategy,
    numStations
  });

  const apiKey = geminiService.getApiKey();
  const isMockKey = !apiKey || apiKey.startsWith('AQ.') || apiKey.length < 20;

  if (!isMockKey) {
    try {
      const prompt = `Bạn là Giám đốc Sư phạm (Learning Design Director) của EduAdvisor AI. Hãy đưa ra 1 lời khuyên ngắn gọn (2-3 câu), cực kỳ thực tế, chân thành và truyền cảm hứng cho học sinh có thông tin sau:
- Kỳ thi & Mục tiêu: ${roadmapName}
- Trường/Ngành kỳ vọng: ${targetSchool || 'Đại học top đầu'}
- Trình độ hiện tại: ${currentLevel}
- Thời gian còn lại: ${daysLeft} ngày, học ${dailyHours} giờ/ngày.
- Phần kiến thức còn yếu: ${cleanWeak}
- Chiến lược: ${learningStrategy}
Không dùng lời khen sáo rỗng. Hãy chỉ rõ chiến lược bứt phá cụ thể.`;

      const aiRes = await Promise.race([
        geminiService.sendMessage({
          prompt,
          subject: 'Cố vấn Lộ trình Sư phạm',
          timeoutMs: 800
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 850))
      ]);
      if (aiRes && (aiRes as any).text && (aiRes as any).text.trim()) {
        customCoachAdvice = (aiRes as any).text.trim();
      }
    } catch (err) {
      console.warn('Gemini coach advice error, used instant synthesized advice:', err);
    }
  }

  // 4. TÁCH LỖ HỔNG VÀ THIẾT LẬP CÁC TRẠM HỌC THÍCH ỨNG THEO ĐÚNG MỤC TIÊU & QUY MÔ
  const isIelts = goal === 'IELTS' || (subjectCombo && subjectCombo.toLowerCase().includes('ielts')) || (targetExamName || '').toLowerCase().includes('ielts');
  const isSat = goal === 'SAT' || (subjectCombo && subjectCombo.toLowerCase().includes('sat')) || (targetExamName || '').toLowerCase().includes('sat');
  const isToeic = goal === 'TOEIC' || (subjectCombo && subjectCombo.toLowerCase().includes('toeic')) || (targetExamName || '').toLowerCase().includes('toeic');
  const isHsaTsa = goal === 'DGNL_DHQG' || goal === 'TSA_HUST' || (targetExamName || '').toLowerCase().includes('đánh giá');
  const isGpa = goal === 'DAI_HOC_GPA' || (targetExamName || '').toLowerCase().includes('gpa') || (targetExamName || '').toLowerCase().includes('đại học');

  const parsedWeaks = weakTopics.split(/[,;\n\+]/).map(s => s.trim()).filter(Boolean);
  let weak1 = parsedWeaks[0] || '';
  let weak2 = parsedWeaks[1] || '';

  if (isIelts) {
    if (!weak1 || weak1.includes('Tích phân') || weak1.includes('Sóng') || weak1.includes('RLC')) {
      weak1 = 'Speaking Fluency & Kỹ thuật PEEL';
    }
    if (!weak2 || weak2.includes('Tích phân') || weak2.includes('Sóng') || weak2.includes('RLC')) {
      weak2 = 'Writing Task 2 Cohesion & Paraphrasing';
    }
  } else if (isSat) {
    if (!weak1 || weak1.includes('Tích phân') || weak1.includes('Speaking')) {
      weak1 = 'Digital SAT Reading Craft and Structure';
    }
    if (!weak2 || weak2.includes('Sóng') || weak2.includes('Writing')) {
      weak2 = 'SAT Math Advanced Math & Desmos Tricks';
    }
  } else if (isToeic) {
    if (!weak1 || weak1.includes('Tích phân') || weak1.includes('Speaking')) {
      weak1 = 'Part 5 Bẫy Ngữ pháp & Từ loại Từ vựng';
    }
    if (!weak2 || weak2.includes('Sóng') || weak2.includes('Writing')) {
      weak2 = 'Part 7 Đọc hiểu Đoạn văn kép đa nguồn';
    }
  } else if (isHsaTsa) {
    if (!weak1 || weak1.includes('Speaking') || weak1.includes('IELTS')) {
      weak1 = 'Tư duy Định lượng & Bài toán Logic';
    }
    if (!weak2 || weak2.includes('Writing') || weak2.includes('IELTS')) {
      weak2 = 'Đọc hiểu Khoa học & Xử lý biểu đồ';
    }
  } else if (isGpa) {
    if (!weak1 || weak1.includes('Speaking') || weak1.includes('Tích phân')) {
      weak1 = 'Cấu trúc Dữ liệu & Giải thuật nâng cao';
    }
    if (!weak2 || weak2.includes('Writing') || weak2.includes('Sóng')) {
      weak2 = 'Kiến trúc Hệ thống & Tối ưu Database';
    }
  } else {
    if (!weak1 || weak1.includes('Speaking') || weak1.includes('Writing') || weak1.includes('IELTS')) {
      weak1 = 'Tích phân hàm ẩn & Vi phân đổi biến';
    }
    if (!weak2 || weak2.includes('Listening') || weak2.includes('Reading') || weak2.includes('IELTS')) {
      weak2 = 'Sóng ánh sáng & Giao thoa đa sắc';
    }
  }

  const customNodes = buildAdaptiveStations({
    goal,
    targetExamName,
    subjectCombo,
    targetScore,
    currentLevel,
    weak1,
    weak2,
    dailyHours,
    numStations: numStations || 7
  });

  return {
    roadmapName,
    roadmapDescription,
    score: targetScore,
    days: daysLeft,
    dailyHours,
    coachAdvice: customCoachAdvice,
    feasibilityWarning,
    isAiGenerated: true,
    nodes: customNodes
  };
}

