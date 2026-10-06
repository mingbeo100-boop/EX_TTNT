import { RoadmapData, StageItem, Milestone, ScheduleItem } from '../types';

export interface Goal {
  id: 'THPT_QG' | 'DGNL_DHQG' | 'DAI_HOC_GPA' | 'LAY_GOC';
  name: string;
  scoreScale: string;
  description: string;
  iconName: string;
}

export interface Variant {
  id: string;
  goalId: string;
  name: string;
  subjectIds: string[];
  description: string;
}

export interface Level {
  id: string;
  goalId: string;
  label: string;
  scoreRange: [number, number];
  profile: string;
}

export interface TargetBand {
  id: string;
  goalId: string;
  label: string;
  min: number;
  max: number;
}

export interface Subject {
  id: string;
  name: string;
  weight: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  goalIds: string[];
  title: string;
  difficulty: 1 | 2 | 3 | 4; // 1: Nền tảng, 2: Thông hiểu, 3: Vận dụng, 4: Vận dụng cao 9+
  scoreValue: number;        // Số điểm đóng góp ước tính
  frequency: number;         // Tần suất xuất hiện (1 - 5 sao)
  hours: number;             // Giờ học ước tính
  prerequisites: string[];   // Các topic phải học trước
  tags: string[];            // 'Nền tảng' | 'Trọng tâm 9+' | 'Bẫy' | 'Điểm liệt'
}

export interface PhaseTemplate {
  goalId: string;
  minDays: number;
  maxDays: number;
  phases: {
    title: string;
    percentOfTime: number;
    topicDifficulty: number[];
    focus: string;
  }[];
}

export interface Rule {
  goalId: string;
  levelId: string;
  targetBandId: string;
  include: {
    difficulty: number[];
    minFrequency?: number;
  };
  skip?: string[];
  boost?: string[];
  weeklyHours: number;
  mockExamEveryDays: number;
}

export interface DiagnosticQuestion {
  id: string;
  goalId: string;
  variantId?: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 1 | 2 | 3 | 4;
}

// ==========================================
// 1. DATA: 4 GOALS & VARIANTS
// ==========================================
export const GOALS: Goal[] = [
  {
    id: 'THPT_QG',
    name: 'THPT Quốc Gia 2025',
    scoreScale: 'Thang 30 (10/môn)',
    description: 'Chiến thuật nước rút các khối thi A00, A01, B00, D01 nhắm trường Đại học Top đầu.',
    iconName: 'GraduationCap'
  },
  {
    id: 'DGNL_DHQG',
    name: 'Đánh Giá Năng Lực ĐHQG',
    scoreScale: 'HSA (150) / VNUHCM (1200)',
    description: 'Chinh phục bài thi ĐGNL Hà Nội & TP.HCM: Tư duy logic, định lượng và đọc hiểu tích hợp.',
    iconName: 'Compass'
  },
  {
    id: 'DAI_HOC_GPA',
    name: 'Toán Đại Học & GPA A/A+',
    scoreScale: 'GPA Hệ 4.0 (hoặc Hệ 10)',
    description: 'Học vượt và bứt phá các môn Giải tích, Đại số tuyến tính, Xác suất và Lập trình DSA.',
    iconName: 'BookOpen'
  },
  {
    id: 'LAY_GOC',
    name: 'Lấy Gốc Cấp Tốc',
    scoreScale: 'Thang 10 (Chẩn đoán bù đắp)',
    description: 'Cấp cứu lỗ hổng lớp 9, 10, 11; chắc chắn thoát điểm liệt và đạt 6.5 - 7.5 điểm nhanh nhất.',
    iconName: 'Zap'
  }
];

export const VARIANTS: Variant[] = [
  // THPT_QG
  { id: 'A00', goalId: 'THPT_QG', name: 'Khối A00 (Toán - Lý - Hóa)', subjectIds: ['toan', 'ly', 'hoa'], description: 'Tổ hợp truyền thống Kỹ thuật, Bách Khoa, CNTT' },
  { id: 'A01', goalId: 'THPT_QG', name: 'Khối A01 (Toán - Lý - Anh)', subjectIds: ['toan', 'ly', 'anh'], description: 'Tổ hợp Công nghệ, Kinh tế Quốc tế' },
  { id: 'B00', goalId: 'THPT_QG', name: 'Khối B00 (Toán - Hóa - Sinh)', subjectIds: ['toan', 'hoa', 'sinh'], description: 'Y Dược, Sinh học, Khoa học Môi trường' },
  { id: 'D01', goalId: 'THPT_QG', name: 'Khối D01 (Toán - Văn - Anh)', subjectIds: ['toan', 'van', 'anh'], description: 'Kinh tế, Ngoại thương, Truyền thông' },

  // DGNL_DHQG
  { id: 'HSA_HN', goalId: 'DGNL_DHQG', name: 'ĐGNL ĐHQG Hà Nội (HSA - 150đ)', subjectIds: ['dgnl_logic', 'dgnl_khtn', 'dgnl_ngon_ngu'], description: 'Định lượng (Toán), Định tính (Văn) và Khoa học' },
  { id: 'VNU_HCM', goalId: 'DGNL_DHQG', name: 'ĐGNL ĐHQG TP.HCM (1200đ)', subjectIds: ['dgnl_logic', 'dgnl_khtn', 'dgnl_ngon_ngu'], description: 'Ngôn ngữ, Toán học - Tư duy logic, Giải quyết vấn đề' },

  // DAI_HOC_GPA
  { id: 'GPA_TOAN_CS', goalId: 'DAI_HOC_GPA', name: 'Toán Cao Cấp (Giải tích 1 & ĐSTT)', subjectIds: ['gpa_gt1', 'gpa_dstt'], description: 'Đại cương Bách Khoa, KHTN, Kinh tế' },
  { id: 'GPA_IT_DSA', goalId: 'DAI_HOC_GPA', name: 'Tin Học Đại Cương & Lập trình DSA', subjectIds: ['gpa_dsa', 'gpa_python'], description: 'Cấu trúc dữ liệu & Thuật toán C++/Python' },

  // LAY_GOC
  { id: 'GOC_TOAN_12', goalId: 'LAY_GOC', name: 'Cấp cứu Toán 12 & Lỗ hổng lớp 11', subjectIds: ['goc_toan'], description: 'Hàm số, Lượng giác, Tích phân và Hình không gian' },
  { id: 'GOC_LY_12', goalId: 'LAY_GOC', name: 'Lấy lại căn bản Vật lý 12 (Dao động & Sóng)', subjectIds: ['goc_ly'], description: 'Nắm chắc 7 điểm Lý trong 30 ngày' }
];

// ==========================================
// 2. DATA: SUBJECTS
// ==========================================
export const SUBJECTS: Subject[] = [
  { id: 'toan', name: 'Toán học', weight: 1.0 },
  { id: 'ly', name: 'Vật lý', weight: 1.0 },
  { id: 'hoa', name: 'Hóa học', weight: 1.0 },
  { id: 'anh', name: 'Tiếng Anh', weight: 1.0 },
  { id: 'van', name: 'Ngữ văn', weight: 1.0 },
  { id: 'sinh', name: 'Sinh học', weight: 1.0 },
  { id: 'dgnl_logic', name: 'Tư duy Định lượng & Logic', weight: 1.2 },
  { id: 'dgnl_khtn', name: 'Khoa học Tự nhiên & Xã hội', weight: 1.0 },
  { id: 'dgnl_ngon_ngu', name: 'Tư duy Ngôn ngữ', weight: 1.0 },
  { id: 'gpa_gt1', name: 'Giải tích 1', weight: 1.2 },
  { id: 'gpa_dstt', name: 'Đại số tuyến tính', weight: 1.0 },
  { id: 'gpa_dsa', name: 'Cấu trúc dữ liệu & Giải thuật', weight: 1.2 },
  { id: 'gpa_python', name: 'Lập trình Python/C++', weight: 1.0 },
  { id: 'goc_toan', name: 'Toán học Căn bản', weight: 1.0 },
  { id: 'goc_ly', name: 'Vật lý Căn bản', weight: 1.0 }
];

// ==========================================
// 3. DATA: LEVELS & TARGET BANDS
// ==========================================
export const LEVELS: Level[] = [
  // THPT_QG
  { id: 'thpt_yeu', goalId: 'THPT_QG', label: 'Yếu (< 5.0đ/môn)', scoreRange: [0, 15], profile: 'Mất căn bản nhiều chương, dễ sai câu nhận biết.' },
  { id: 'thpt_tb', goalId: 'THPT_QG', label: 'Trung bình (5.0 - 6.5đ)', scoreRange: [15, 20], profile: 'Nắm được công thức cơ bản, chưa vững phương pháp giải nhanh.' },
  { id: 'thpt_kha', goalId: 'THPT_QG', label: 'Khá (6.5 - 8.0đ)', scoreRange: [20, 24], profile: 'Giải tốt 35 câu đầu, vướng mắc ở các câu vận dụng cao 8.5+.' },
  { id: 'thpt_gioi', goalId: 'THPT_QG', label: 'Giỏi (8.0+ đ)', scoreRange: [24, 30], profile: 'Tốc độ nhanh, tập trung săn điểm 9-10 câu phân loại.' },

  // DGNL_DHQG
  { id: 'dgnl_yeu', goalId: 'DGNL_DHQG', label: 'Sơ cấp (< 50% câu đúng)', scoreRange: [0, 60], profile: 'Chưa quen cấu trúc đề ĐGNL, áp lực thời gian.' },
  { id: 'dgnl_tb', goalId: 'DGNL_DHQG', label: 'Trung bình (50% - 65%)', scoreRange: [60, 85], profile: 'Xử lý được câu cơ bản, yếu phần suy luận số liệu.' },
  { id: 'dgnl_kha', goalId: 'DGNL_DHQG', label: 'Khá (65% - 80%)', scoreRange: [85, 110], profile: 'Tư duy logic tốt, cần tối ưu thời gian 150 phút.' },
  { id: 'dgnl_gioi', goalId: 'DGNL_DHQG', label: 'Xuất sắc (> 80%)', scoreRange: [110, 150], profile: 'Tốc độ và độ chính xác cao, nhắm top 5% thí sinh.' },

  // DAI_HOC_GPA
  { id: 'gpa_canh_bao', goalId: 'DAI_HOC_GPA', label: 'Cảnh báo học vụ (GPA < 2.0)', scoreRange: [0, 2.0], profile: 'Hổng kiến thức đại cương, nguy cơ trượt môn.' },
  { id: 'gpa_tb', goalId: 'DAI_HOC_GPA', label: 'GPA 2.0 - 2.8 (Mức Khá)', scoreRange: [2.0, 2.8], profile: 'Đạt điểm C/B, mong muốn nâng hạng học lực.' },
  { id: 'gpa_kha', goalId: 'DAI_HOC_GPA', label: 'GPA 2.8 - 3.4 (Mức Giỏi)', scoreRange: [2.8, 3.4], profile: 'Học lực khá giỏi, cần bứt phá các môn chuyên ngành.' },
  { id: 'gpa_xuat_sac', goalId: 'DAI_HOC_GPA', label: 'GPA 3.4+ (Xuất sắc)', scoreRange: [3.4, 4.0], profile: 'Nhắm mục tiêu học bổng và tốt nghiệp Thủ khoa.' },

  // LAY_GOC
  { id: 'goc_mat_nang', goalId: 'LAY_GOC', label: 'Mất gốc nghiêm trọng (< 3.0đ)', scoreRange: [0, 3.0], profile: 'Sợ học, không nhớ bảng công thức đạo hàm/nguyên hàm.' },
  { id: 'goc_hong_chuong', goalId: 'LAY_GOC', label: 'Hổng từng chuyên đề (3.0 - 5.0đ)', scoreRange: [3.0, 5.0], profile: 'Làm được vài câu dễ, hay bị bẫy đề thi.' },
  { id: 'goc_cham', goalId: 'LAY_GOC', label: 'Tính toán chậm (5.0 - 6.0đ)', scoreRange: [5.0, 6.0], profile: 'Biết cách làm nhưng tính nhầm, không kịp giờ.' }
];

export const TARGET_BANDS: TargetBand[] = [
  // THPT_QG
  { id: 'thpt_21_24', goalId: 'THPT_QG', label: '21 - 24 Điểm', min: 21, max: 24 },
  { id: 'thpt_24_26', goalId: 'THPT_QG', label: '24 - 26 Điểm', min: 24, max: 26 },
  { id: 'thpt_26_28', goalId: 'THPT_QG', label: '26 - 28 Điểm (Mục tiêu cao)', min: 26, max: 28 },
  { id: 'thpt_28_plus', goalId: 'THPT_QG', label: '28+ Điểm (Thủ khoa / Top 1%)', min: 28, max: 30 },

  // DGNL_DHQG
  { id: 'dgnl_85_100', goalId: 'DGNL_DHQG', label: '85 - 100đ (HSA) / 700 - 800 (HCM)', min: 85, max: 100 },
  { id: 'dgnl_100_110', goalId: 'DGNL_DHQG', label: '100 - 110đ (HSA) / 800 - 900 (HCM)', min: 100, max: 110 },
  { id: 'dgnl_110_125', goalId: 'DGNL_DHQG', label: '110 - 125đ (HSA) / 900 - 1000 (HCM)', min: 110, max: 125 },
  { id: 'dgnl_125_plus', goalId: 'DGNL_DHQG', label: '125+ đ (HSA) / 1000+ (HCM Top trường)', min: 125, max: 150 },

  // DAI_HOC_GPA
  { id: 'gpa_2_5', goalId: 'DAI_HOC_GPA', label: 'Qua môn an toàn (GPA 2.5)', min: 2.5, max: 2.8 },
  { id: 'gpa_3_0', goalId: 'DAI_HOC_GPA', label: 'Bằng Khá (GPA 3.0)', min: 3.0, max: 3.3 },
  { id: 'gpa_3_4', goalId: 'DAI_HOC_GPA', label: 'Bằng Giỏi (GPA 3.4)', min: 3.4, max: 3.6 },
  { id: 'gpa_3_6_plus', goalId: 'DAI_HOC_GPA', label: 'Học bổng Xuất sắc (GPA 3.6+)', min: 3.6, max: 4.0 },

  // LAY_GOC
  { id: 'goc_6', goalId: 'LAY_GOC', label: 'Kéo về 6.0 Điểm (Chống liệt)', min: 5.5, max: 6.5 },
  { id: 'goc_7', goalId: 'LAY_GOC', label: 'Đạt mốc 7.0 Điểm an toàn', min: 6.5, max: 7.5 },
  { id: 'goc_8', goalId: 'LAY_GOC', label: 'Bứt phá lên 8.0 Điểm', min: 7.5, max: 8.5 }
];

// ==========================================
// 4. DATA: TOPICS (CÂY KIẾN THỨC)
// ==========================================
export const TOPICS: Topic[] = [
  // --- TOÁN THPT (A00, A01, B00, D01) ---
  {
    id: 'toan-dao-ham-khao-sat',
    subjectId: 'toan',
    goalIds: ['THPT_QG', 'LAY_GOC'],
    title: 'Khảo sát hàm số & Các bài toán tương giao đồ thị',
    difficulty: 1,
    scoreValue: 1.6,
    frequency: 5,
    hours: 8,
    prerequisites: [],
    tags: ['Nền tảng', 'Trọng tâm']
  },
  {
    id: 'toan-cuc-tri-chua-m',
    subjectId: 'toan',
    goalIds: ['THPT_QG'],
    title: 'Cực trị hàm số chứa dấu giá trị tuyệt đối và tham số m',
    difficulty: 3,
    scoreValue: 0.6,
    frequency: 5,
    hours: 7,
    prerequisites: ['toan-dao-ham-khao-sat'],
    tags: ['Vận dụng', 'Điểm 8+']
  },
  {
    id: 'toan-mu-logarit-co-ban',
    subjectId: 'toan',
    goalIds: ['THPT_QG', 'LAY_GOC'],
    title: 'Phương trình và bất phương trình Mũ - Logarit',
    difficulty: 1,
    scoreValue: 1.2,
    frequency: 5,
    hours: 6,
    prerequisites: [],
    tags: ['Nền tảng']
  },
  {
    id: 'toan-mu-logarit-nang-cao',
    subjectId: 'toan',
    goalIds: ['THPT_QG'],
    title: 'Bất phương trình Mũ - Logarit chứa tham số m & Phương pháp hàm đặc trưng',
    difficulty: 4,
    scoreValue: 0.4,
    frequency: 4,
    hours: 8,
    prerequisites: ['toan-mu-logarit-co-ban', 'toan-dao-ham-khao-sat'],
    tags: ['Trọng tâm 9+', 'Vận dụng cao']
  },
  {
    id: 'toan-tich-phan-co-ban',
    subjectId: 'toan',
    goalIds: ['THPT_QG', 'LAY_GOC'],
    title: 'Bảng nguyên hàm & Tích phân đổi biến số cơ bản',
    difficulty: 1,
    scoreValue: 1.0,
    frequency: 5,
    hours: 6,
    prerequisites: ['toan-dao-ham-khao-sat'],
    tags: ['Nền tảng']
  },
  {
    id: 'toan-tich-phan-tung-phan',
    subjectId: 'toan',
    goalIds: ['THPT_QG'],
    title: 'Tích phân từng phần & Kỹ thuật múa cột vi phân nhanh',
    difficulty: 2,
    scoreValue: 0.6,
    frequency: 5,
    hours: 5,
    prerequisites: ['toan-tich-phan-co-ban'],
    tags: ['Trọng tâm']
  },
  {
    id: 'toan-tich-phan-ham-an',
    subjectId: 'toan',
    goalIds: ['THPT_QG'],
    title: 'Tích phân hàm ẩn & Kỹ thuật biến đổi đối xứng cận [a; b]',
    difficulty: 4,
    scoreValue: 0.4,
    frequency: 4,
    hours: 6,
    prerequisites: ['toan-tich-phan-tung-phan'],
    tags: ['Trọng tâm 9+', 'Vận dụng cao']
  },
  {
    id: 'toan-hinh-khong-gian-khoang-cach',
    subjectId: 'toan',
    goalIds: ['THPT_QG', 'LAY_GOC'],
    title: 'Góc & Khoảng cách trong không gian thuần túy (Lớp 11)',
    difficulty: 2,
    scoreValue: 0.8,
    frequency: 5,
    hours: 7,
    prerequisites: [],
    tags: ['Trọng tâm', 'Bẫy đề thi']
  },
  {
    id: 'toan-oxyz-mat-cau-mat-phang',
    subjectId: 'toan',
    goalIds: ['THPT_QG'],
    title: 'Phương pháp tọa độ Oxyz: Mặt cầu, Mặt phẳng và Vị trí tương đối',
    difficulty: 2,
    scoreValue: 1.2,
    frequency: 5,
    hours: 7,
    prerequisites: ['toan-hinh-khong-gian-khoang-cach'],
    tags: ['Trọng tâm']
  },
  {
    id: 'toan-so-phuc-cuc-tri',
    subjectId: 'toan',
    goalIds: ['THPT_QG'],
    title: 'Số phức & Bài toán cực trị hình học Elip/Đường tròn',
    difficulty: 4,
    scoreValue: 0.4,
    frequency: 4,
    hours: 6,
    prerequisites: [],
    tags: ['Trọng tâm 9+']
  },

  // --- VẬT LÝ 12 ---
  {
    id: 'ly-dao-dong-dieu-hoa',
    subjectId: 'ly',
    goalIds: ['THPT_QG', 'LAY_GOC'],
    title: 'Đại cương dao động điều hòa & Vòng tròn lượng giác đa trục',
    difficulty: 1,
    scoreValue: 1.5,
    frequency: 5,
    hours: 6,
    prerequisites: [],
    tags: ['Nền tảng']
  },
  {
    id: 'ly-con-lac-lo-xo-don',
    subjectId: 'ly',
    goalIds: ['THPT_QG'],
    title: 'Con lắc lò xo, con lắc đơn & Lực đàn hồi, lực hồi phục',
    difficulty: 2,
    scoreValue: 1.0,
    frequency: 5,
    hours: 6,
    prerequisites: ['ly-dao-dong-dieu-hoa'],
    tags: ['Trọng tâm']
  },
  {
    id: 'ly-giao-thoa-song',
    subjectId: 'ly',
    goalIds: ['THPT_QG', 'LAY_GOC'],
    title: 'Giao thoa sóng cơ & Bài toán xác định số cực đại, cực tiểu',
    difficulty: 2,
    scoreValue: 0.8,
    frequency: 5,
    hours: 6,
    prerequisites: ['ly-dao-dong-dieu-hoa'],
    tags: ['Trọng tâm']
  },
  {
    id: 'ly-song-dung-van-trung',
    subjectId: 'ly',
    goalIds: ['THPT_QG'],
    title: 'Sóng dừng trên sợi dây & Thí nghiệm giao thoa ánh sáng trắng vân trùng',
    difficulty: 3,
    scoreValue: 0.6,
    frequency: 4,
    hours: 6,
    prerequisites: ['ly-giao-thoa-song'],
    tags: ['Vận dụng', 'Điểm 8+']
  },
  {
    id: 'ly-mach-rlc-cong-huong',
    subjectId: 'ly',
    goalIds: ['THPT_QG'],
    title: 'Mạch xoay chiều RLC nối tiếp, Giản đồ vectơ & Hiện tượng cộng hưởng',
    difficulty: 2,
    scoreValue: 1.0,
    frequency: 5,
    hours: 7,
    prerequisites: ['ly-dao-dong-dieu-hoa'],
    tags: ['Trọng tâm']
  },
  {
    id: 'ly-cuc-tri-dien-do-thi',
    subjectId: 'ly',
    goalIds: ['THPT_QG'],
    title: 'Cực trị điện xoay chiều (L, C, R, ω biến thiên) & Đọc đồ thị dao động',
    difficulty: 4,
    scoreValue: 0.4,
    frequency: 4,
    hours: 8,
    prerequisites: ['ly-mach-rlc-cong-huong'],
    tags: ['Trọng tâm 9+', 'Vận dụng cao']
  },

  // --- HÓA HỌC 12 ---
  {
    id: 'hoa-este-lipit',
    subjectId: 'hoa',
    goalIds: ['THPT_QG', 'LAY_GOC'],
    title: 'Este - Lipit: Đồng phân, Danh pháp & Phản ứng xà phòng hóa cơ bản',
    difficulty: 1,
    scoreValue: 1.2,
    frequency: 5,
    hours: 5,
    prerequisites: [],
    tags: ['Nền tảng']
  },
  {
    id: 'hoa-dong-dang-hoa-este',
    subjectId: 'hoa',
    goalIds: ['THPT_QG'],
    title: 'Phương pháp Đồng đẳng hóa & Quy đổi bài toán Este đa chức, chất béo',
    difficulty: 4,
    scoreValue: 0.4,
    frequency: 4,
    hours: 7,
    prerequisites: ['hoa-este-lipit'],
    tags: ['Trọng tâm 9+', 'Vận dụng cao']
  },
  {
    id: 'hoa-kim-loai-kiem-nhom',
    subjectId: 'hoa',
    goalIds: ['THPT_QG'],
    title: 'Kim loại kiềm, kiềm thổ, nhôm & Bài toán đồ thị CO2 tác dụng với kiềm',
    difficulty: 2,
    scoreValue: 1.0,
    frequency: 5,
    hours: 6,
    prerequisites: [],
    tags: ['Trọng tâm']
  },

  // --- ĐÁNH GIÁ NĂNG LỰC (DGNL_DHQG) ---
  {
    id: 'dgnl-phan-tich-so-lieu',
    subjectId: 'dgnl_logic',
    goalIds: ['DGNL_DHQG'],
    title: 'Phân tích bảng số liệu, biểu đồ tròn, cột và đường kết hợp',
    difficulty: 2,
    scoreValue: 15,
    frequency: 5,
    hours: 8,
    prerequisites: [],
    tags: ['Trọng tâm', 'Định lượng']
  },
  {
    id: 'dgnl-suy-luan-logic',
    subjectId: 'dgnl_logic',
    goalIds: ['DGNL_DHQG'],
    title: 'Tư duy suy luận logic: Mệnh đề, giả định, sắp xếp thứ tự và suy diễn',
    difficulty: 3,
    scoreValue: 15,
    frequency: 5,
    hours: 8,
    prerequisites: [],
    tags: ['Trọng tâm', 'Logic']
  },
  {
    id: 'dgnl-to-hop-xac-suat',
    subjectId: 'dgnl_logic',
    goalIds: ['DGNL_DHQG'],
    title: 'Tổ hợp, chỉnh hợp, quy tắc đếm và xác suất thực tiễn',
    difficulty: 2,
    scoreValue: 10,
    frequency: 5,
    hours: 6,
    prerequisites: [],
    tags: ['Trọng tâm']
  },
  {
    id: 'dgnl-tieng-viet-doc-hieu',
    subjectId: 'dgnl_ngon_ngu',
    goalIds: ['DGNL_DHQG'],
    title: 'Đọc hiểu văn bản khoa học, nhận diện lỗi diễn đạt & ngữ pháp Tiếng Việt',
    difficulty: 2,
    scoreValue: 20,
    frequency: 5,
    hours: 6,
    prerequisites: [],
    tags: ['Ngôn ngữ']
  },
  {
    id: 'dgnl-khtn-tich-hop',
    subjectId: 'dgnl_khtn',
    goalIds: ['DGNL_DHQG'],
    title: 'Khoa học tự nhiên tích hợp: Ứng dụng thực tế Vật lý - Hóa học - Sinh học',
    difficulty: 3,
    scoreValue: 20,
    frequency: 5,
    hours: 10,
    prerequisites: [],
    tags: ['Tích hợp KHTN']
  },

  // --- ĐẠI HỌC & GPA ---
  {
    id: 'gpa-ma-tran-dinh-thuc',
    subjectId: 'gpa_dstt',
    goalIds: ['DAI_HOC_GPA'],
    title: 'Ma trận, Phép khử Gauss, Định thức cấp n & Ma trận nghịch đảo',
    difficulty: 1,
    scoreValue: 2.5,
    frequency: 5,
    hours: 8,
    prerequisites: [],
    tags: ['Đại số đại cương']
  },
  {
    id: 'gpa-khong-gian-vector',
    subjectId: 'gpa_dstt',
    goalIds: ['DAI_HOC_GPA'],
    title: 'Không gian véc tơ con, Độc lập tuyến tính & Tìm cơ sở số chiều',
    difficulty: 3,
    scoreValue: 2.5,
    frequency: 5,
    hours: 10,
    prerequisites: ['gpa-ma-tran-dinh-thuc'],
    tags: ['Trọng tâm Giữa kỳ']
  },
  {
    id: 'gpa-taylor-maclaurin',
    subjectId: 'gpa_gt1',
    goalIds: ['DAI_HOC_GPA'],
    title: 'Khai triển Taylor - Maclaurin & Ứng dụng tính giới hạn dạng vô định',
    difficulty: 2,
    scoreValue: 2.0,
    frequency: 5,
    hours: 8,
    prerequisites: [],
    tags: ['Giải tích 1']
  },
  {
    id: 'gpa-tich-phan-suy-rong',
    subjectId: 'gpa_gt1',
    goalIds: ['DAI_HOC_GPA'],
    title: 'Tích phân suy rộng loại 1, loại 2 & Các tiêu chuẩn hội tụ so sánh',
    difficulty: 3,
    scoreValue: 2.5,
    frequency: 5,
    hours: 9,
    prerequisites: ['gpa-taylor-maclaurin'],
    tags: ['Trọng tâm Cuối kỳ']
  },
  {
    id: 'gpa-pt-vi-phan-cap-1-2',
    subjectId: 'gpa_gt1',
    goalIds: ['DAI_HOC_GPA'],
    title: 'Phương trình vi phân cấp 1 & cấp 2 tuyến tính hệ số hằng',
    difficulty: 4,
    scoreValue: 2.5,
    frequency: 4,
    hours: 10,
    prerequisites: ['gpa-tich-phan-suy-rong'],
    tags: ['Điểm A/A+']
  },
  {
    id: 'gpa-con-tro-danh-sach',
    subjectId: 'gpa_dsa',
    goalIds: ['DAI_HOC_GPA'],
    title: 'Quản lý bộ nhớ con trỏ, Cấp phát động & Danh sách liên kết đơn/kép',
    difficulty: 2,
    scoreValue: 2.5,
    frequency: 5,
    hours: 9,
    prerequisites: [],
    tags: ['Lập trình DSA']
  },
  {
    id: 'gpa-quy-hoach-dong',
    subjectId: 'gpa_dsa',
    goalIds: ['DAI_HOC_GPA'],
    title: 'Thiết kế thuật toán Quy hoạch động (Knapsack, LCS, LIS) & Tối ưu bộ nhớ',
    difficulty: 4,
    scoreValue: 3.0,
    frequency: 4,
    hours: 12,
    prerequisites: ['gpa-con-tro-danh-sach'],
    tags: ['Thuật toán điểm 10']
  },
  {
    id: 'gpa-ngan-xep-hang-doi',
    subjectId: 'gpa_dsa',
    goalIds: ['DAI_HOC_GPA'],
    title: 'Cấu trúc Ngăn xếp (Stack) & Hàng đợi (Queue): Ứng dụng duyệt biểu thức và bộ đệm',
    difficulty: 1,
    scoreValue: 2.0,
    frequency: 5,
    hours: 6,
    prerequisites: [],
    tags: ['Cơ bản DSA']
  },
  {
    id: 'gpa-sap-xep-tim-kiem',
    subjectId: 'gpa_dsa',
    goalIds: ['DAI_HOC_GPA'],
    title: 'Thuật toán Sắp xếp (QuickSort, MergeSort) & Tìm kiếm nhị phân O(log N)',
    difficulty: 2,
    scoreValue: 2.5,
    frequency: 5,
    hours: 7,
    prerequisites: [],
    tags: ['Trọng tâm Giữa kỳ']
  },
  {
    id: 'gpa-cay-nhi-phan-bst',
    subjectId: 'gpa_dsa',
    goalIds: ['DAI_HOC_GPA'],
    title: 'Cây nhị phân tìm kiếm (Binary Search Tree) & Kỹ thuật duyệt tiền - trung - hậu tự',
    difficulty: 2,
    scoreValue: 2.5,
    frequency: 5,
    hours: 8,
    prerequisites: ['gpa-con-tro-danh-sach'],
    tags: ['Cấu trúc dữ liệu']
  },
  {
    id: 'gpa-thuat-toan-do-thi',
    subjectId: 'gpa_dsa',
    goalIds: ['DAI_HOC_GPA'],
    title: 'Thuật toán đồ thị: Duyệt DFS, BFS và Tìm đường đi ngắn nhất Dijkstra',
    difficulty: 3,
    scoreValue: 2.5,
    frequency: 4,
    hours: 10,
    prerequisites: ['gpa-cay-nhi-phan-bst'],
    tags: ['Trọng tâm Cuối kỳ']
  },

  // --- LẤY GỐC CẤP TỐC ---
  {
    id: 'goc-10-cong-thuc-luong-giac',
    subjectId: 'goc_toan',
    goalIds: ['LAY_GOC'],
    title: '10 công thức biến đổi lượng giác cơ bản & Cung liên kết không được nhầm',
    difficulty: 1,
    scoreValue: 1.0,
    frequency: 5,
    hours: 4,
    prerequisites: [],
    tags: ['Chống liệt', 'Nền tảng']
  },
  {
    id: 'goc-dao-ham-ham-hop',
    subjectId: 'goc_toan',
    goalIds: ['LAY_GOC'],
    title: 'Quy tắc tính đạo hàm cơ bản và đạo hàm hàm hợp u(x)',
    difficulty: 1,
    scoreValue: 1.5,
    frequency: 5,
    hours: 5,
    prerequisites: [],
    tags: ['Chống liệt']
  },
  {
    id: 'goc-casio-580vnx',
    subjectId: 'goc_toan',
    goalIds: ['LAY_GOC'],
    title: '12 Thủ thuật bấm máy tính Casio giải nhanh phương trình, tích phân và số phức',
    difficulty: 1,
    scoreValue: 2.0,
    frequency: 5,
    hours: 5,
    prerequisites: [],
    tags: ['Mẹo Casio']
  }
];

// ==========================================
// 5. DATA: PHASE TEMPLATES
// ==========================================
export const PHASE_TEMPLATES: PhaseTemplate[] = [
  {
    goalId: 'THPT_QG',
    minDays: 30,
    maxDays: 180,
    phases: [
      { title: 'Quét sạch nền tảng & Lấp lỗ hổng cốt lõi', percentOfTime: 20, topicDifficulty: [1, 2], focus: 'Chắc chắn 7.0 điểm đầu tiên trong 25 phút' },
      { title: 'Bắt bẫy đề thi & Phòng chống ngộ nhận thường gặp', percentOfTime: 20, topicDifficulty: [2, 3], focus: 'Khắc phục triệt để các bẫy đổi cận, hàm hợp, dấu âm' },
      { title: 'Phương pháp giải nhanh & Ghép nối bổ đề đối xứng', percentOfTime: 20, topicDifficulty: [2, 3], focus: 'Nâng tốc độ giải trắc nghiệm dưới 90 giây/câu' },
      { title: 'Đột phá Vận dụng cao 9+ & Phân hóa chuyên sâu', percentOfTime: 18, topicDifficulty: [3, 4], focus: 'Làm chủ bài toán cực trị, hàm ẩn và tham số m' },
      { title: 'Thực chiến bấm giờ 50 câu/90 phút chuẩn ma trận', percentOfTime: 14, topicDifficulty: [3, 4], focus: 'Tối ưu áp lực thời gian và chiến thuật làm bài thi' },
      { title: 'Tổng duyệt phong độ Thủ khoa & Tâm lý phòng thi', percentOfTime: 8, topicDifficulty: [4], focus: 'Rà soát bẫy đề thi và bảo toàn điểm số tối đa' }
    ]
  },
  {
    goalId: 'DGNL_DHQG',
    minDays: 30,
    maxDays: 120,
    phases: [
      { title: 'Làm chủ Tư duy logic & Phân tích số liệu', percentOfTime: 22, topicDifficulty: [1, 2], focus: 'Phân tích bảng biểu và suy luận giả định' },
      { title: 'Bắt bẫy đề thi suy luận & Mệnh đề phủ định', percentOfTime: 20, topicDifficulty: [2, 3], focus: 'Nhận diện bẫy ngụy biện logic trong đề ĐGNL' },
      { title: 'Tối ưu phần Ngôn ngữ & KHTN tích hợp', percentOfTime: 18, topicDifficulty: [2, 3], focus: 'Tăng tốc độ đọc hiểu văn bản khoa học' },
      { title: 'Kỹ thuật tư duy định lượng & Khử ẩn toán học', percentOfTime: 18, topicDifficulty: [3, 4], focus: 'Chinh phục bài toán suy luận đa biến' },
      { title: 'Luyện đề thi thử ĐGNL full 120-150 câu', percentOfTime: 14, topicDifficulty: [2, 3, 4], focus: 'Phân bổ 150 phút chuẩn chiến thuật' },
      { title: 'Tổng kết chiến thuật & Bứt phá ngưỡng điểm Top', percentOfTime: 8, topicDifficulty: [3, 4], focus: 'Tối đa hóa điểm số các phần thế mạnh' }
    ]
  },
  {
    goalId: 'DAI_HOC_GPA',
    minDays: 30,
    maxDays: 120,
    phases: [
      { title: 'Nắm vững bản chất định lý & Lý thuyết cốt lõi', percentOfTime: 20, topicDifficulty: [1, 2], focus: 'Giải tích 1 & Đại số tuyến tính chuẩn mực' },
      { title: 'Bắt bẫy điều kiện biên & Các dạng vô định', percentOfTime: 20, topicDifficulty: [2, 3], focus: 'Tránh mất điểm tự luận ở các bước suy diễn' },
      { title: 'Kỹ thuật tính tích phân bội, vi phân & Chuỗi số', percentOfTime: 20, topicDifficulty: [2, 3], focus: 'Thực hành bài tập lớn & Luyện đề Giữa kỳ' },
      { title: 'Thuật toán nâng cao & Cấu trúc dữ liệu phân loại', percentOfTime: 18, topicDifficulty: [3, 4], focus: 'Làm chủ cây nhị phân, đồ thị Dijkstra và sắp xếp' },
      { title: 'Cày đề thi kết thúc học phần các năm trước', percentOfTime: 14, topicDifficulty: [3, 4], focus: 'Xử lý bài toán phân hóa điểm A/A+' },
      { title: 'Tổng duyệt kiến thức & Chốt điểm A', percentOfTime: 8, topicDifficulty: [4], focus: 'Tự tin bước vào phòng thi cuối kỳ' }
    ]
  },
  {
    goalId: 'LAY_GOC',
    minDays: 15,
    maxDays: 90,
    phases: [
      { title: 'Cấp cứu lỗ hổng lớp 10 - 11 & Bảng công thức', percentOfTime: 22, topicDifficulty: [1], focus: 'Không để mất điểm câu nhận biết dễ' },
      { title: 'Bắt bẫy sai lầm đại số & Dấu âm thường gặp', percentOfTime: 20, topicDifficulty: [1, 2], focus: 'Nhận diện sai lầm căn bậc hai và phân số' },
      { title: 'Luyện 30 dạng bài nhận biết & Kỹ năng Casio', percentOfTime: 20, topicDifficulty: [1, 2], focus: 'Bấm máy Casio và tính toán chuẩn xác' },
      { title: 'Rèn luyện phương pháp giải câu thông hiểu', percentOfTime: 18, topicDifficulty: [2], focus: 'Chắc chắn đạt 6.5 - 7.0 điểm' },
      { title: 'Làm đề kiểm tra tiến bộ & Khóa điểm an toàn', percentOfTime: 12, topicDifficulty: [2], focus: 'Luyện đề thực tế chống liệt 100%' },
      { title: 'Tổng kết & Phòng tránh sai lầm ngớ ngẩn', percentOfTime: 8, topicDifficulty: [1, 2], focus: 'Tâm lý tự tin, vững vàng bước vào phòng thi' }
    ]
  }
];

// ==========================================
// 6. DATA: RULES (LEVE x TARGET BAND MATRIX)
// ==========================================
export const RULES: Rule[] = [
  // THPT_QG
  {
    goalId: 'THPT_QG',
    levelId: 'thpt_yeu',
    targetBandId: 'thpt_21_24',
    include: { difficulty: [1, 2], minFrequency: 3 },
    skip: ['toan-tich-phan-ham-an', 'toan-mu-logarit-nang-cao', 'ly-cuc-tri-dien-do-thi'],
    boost: ['toan-dao-ham-khao-sat', 'toan-tich-phan-co-ban', 'ly-dao-dong-dieu-hoa', 'hoa-este-lipit'],
    weeklyHours: 14,
    mockExamEveryDays: 10
  },
  {
    goalId: 'THPT_QG',
    levelId: 'thpt_tb',
    targetBandId: 'thpt_24_26',
    include: { difficulty: [1, 2, 3], minFrequency: 3 },
    skip: ['toan-so-phuc-cuc-tri'],
    boost: ['toan-cuc-tri-chua-m', 'toan-tich-phan-tung-phan', 'ly-giao-thoa-song', 'ly-mach-rlc-cong-huong'],
    weeklyHours: 16,
    mockExamEveryDays: 7
  },
  {
    goalId: 'THPT_QG',
    levelId: 'thpt_kha',
    targetBandId: 'thpt_26_28',
    include: { difficulty: [2, 3, 4], minFrequency: 3 },
    skip: [],
    boost: ['toan-tich-phan-ham-an', 'ly-cuc-tri-dien-do-thi', 'hoa-dong-dang-hoa-este'],
    weeklyHours: 18,
    mockExamEveryDays: 5
  },
  {
    goalId: 'THPT_QG',
    levelId: 'thpt_gioi',
    targetBandId: 'thpt_28_plus',
    include: { difficulty: [3, 4], minFrequency: 2 },
    skip: [],
    boost: ['toan-tich-phan-ham-an', 'toan-mu-logarit-nang-cao', 'ly-cuc-tri-giao-thoa', 'toan-so-phuc-cuc-tri'],
    weeklyHours: 22,
    mockExamEveryDays: 4
  },

  // DGNL_DHQG
  {
    goalId: 'DGNL_DHQG',
    levelId: 'dgnl_tb',
    targetBandId: 'dgnl_100_110',
    include: { difficulty: [1, 2, 3], minFrequency: 3 },
    boost: ['dgnl-phan-tich-so-lieu', 'dgnl-suy-luan-logic'],
    weeklyHours: 15,
    mockExamEveryDays: 7
  },
  {
    goalId: 'DGNL_DHQG',
    levelId: 'dgnl_kha',
    targetBandId: 'dgnl_110_125',
    include: { difficulty: [2, 3, 4], minFrequency: 2 },
    boost: ['dgnl-suy-luan-logic', 'dgnl-khtn-tich-hop'],
    weeklyHours: 18,
    mockExamEveryDays: 5
  },

  // DAI_HOC_GPA
  {
    goalId: 'DAI_HOC_GPA',
    levelId: 'gpa_tb',
    targetBandId: 'gpa_3_0',
    include: { difficulty: [1, 2, 3] },
    boost: ['gpa-ma-tran-dinh-thuc', 'gpa-taylor-maclaurin'],
    weeklyHours: 14,
    mockExamEveryDays: 10
  },
  {
    goalId: 'DAI_HOC_GPA',
    levelId: 'gpa_kha',
    targetBandId: 'gpa_3_6_plus',
    include: { difficulty: [2, 3, 4] },
    boost: ['gpa-pt-vi-phan-cap-1-2', 'gpa-quy-hoach-dong'],
    weeklyHours: 20,
    mockExamEveryDays: 6
  },

  // LAY_GOC
  {
    goalId: 'LAY_GOC',
    levelId: 'goc_mat_nang',
    targetBandId: 'goc_6',
    include: { difficulty: [1] },
    boost: ['goc-10-cong-thuc-luong-giac', 'goc-dao-ham-ham-hop', 'goc-casio-580vnx'],
    weeklyHours: 12,
    mockExamEveryDays: 7
  }
];

// ==========================================
// 7. DIAGNOSTIC ASSESSMENT QUESTIONS (MINI-TEST)
// ==========================================
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'diag_1',
    goalId: 'THPT_QG',
    subject: 'Toán học',
    question: 'Hàm số y = x³ - 3x² + 2 có bao nhiêu điểm cực trị?',
    options: ['0 điểm', '1 điểm', '2 điểm', '3 điểm'],
    correctAnswer: 2,
    difficulty: 1
  },
  {
    id: 'diag_2',
    goalId: 'THPT_QG',
    subject: 'Toán học',
    question: 'Tích phân I = ∫[0→1] (2x + 1) dx có giá trị bằng bao nhiêu?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 1,
    difficulty: 1
  },
  {
    id: 'diag_3',
    goalId: 'THPT_QG',
    subject: 'Vật lý',
    question: 'Một con lắc lò xo có k = 100 N/m, m = 0.1 kg. Tần số góc ω dao động điều hòa là:',
    options: ['10 rad/s', '10π rad/s', '31.6 rad/s (10√10)', '100 rad/s'],
    correctAnswer: 2,
    difficulty: 2
  },
  {
    id: 'diag_4',
    goalId: 'THPT_QG',
    subject: 'Hóa học',
    question: 'Thủy phân hoàn toàn 8.8g etyl axetat (CH3COOC2H5) trong NaOH vừa đủ thu được m gam muối CH3COONa. Giá trị m là:',
    options: ['6.8g', '8.2g', '9.4g', '10.2g'],
    correctAnswer: 1,
    difficulty: 2
  },
  {
    id: 'diag_5',
    goalId: 'THPT_QG',
    subject: 'Toán học (Vận dụng)',
    question: 'Cho hàm số f(x) thỏa mãn f(x) + 2f(1-x) = 3x² - x. Hàm số f(x) tường minh là:',
    options: ['f(x) = x² - 3x + 4/3', 'f(x) = 2x² - x + 1', 'f(x) = x² + 2x - 1', 'f(x) = 3x² - 5x + 2'],
    correctAnswer: 0,
    difficulty: 4
  }
];

// ==========================================
// 8. ALGORITHM: GENERATE ROADMAP DATA
// ==========================================
export function buildStageDiagnosticChallenge(stageIndex: number, variantName: string): any {
  const challengeTypes: Array<'multiple_choice' | 'trap_detect' | 'matching_pairs' | 'ordering_steps' | 'fill_blank'> = [
    'multiple_choice',
    'trap_detect',
    'matching_pairs',
    'ordering_steps',
    'fill_blank',
    'ordering_steps'
  ];
  const type = challengeTypes[stageIndex % challengeTypes.length];
  
  const challengeDetails = [
    {
      title: `Thử Thách Chẩn Đoán Giai Đoạn 1: Đánh giá tư duy nền tảng & Khái niệm cốt lõi`,
      focus: `Đánh giá mức độ thông thạo kiến thức cơ bản và phản xạ công thức ${variantName}`,
      difficulty: 'Vận dụng' as const,
      xp: 40
    },
    {
      title: `Thử Thách Chẩn Đoán Giai Đoạn 2: Bắt bẫy đề thi & Phòng chống ngộ nhận thường gặp`,
      focus: `Phát hiện các bước giải sai lầm và điều kiện biên ẩn trong đề thi ${variantName}`,
      difficulty: 'Vận dụng cao 9+' as const,
      xp: 50
    },
    {
      title: `Thử Thách Chẩn Đoán Giai Đoạn 3: Khớp nối bổ đề & Tư duy giải nhanh đột phá`,
      focus: `Ghép nối các hệ thức toán học, công thức giải nhanh và định lý tương hỗ`,
      difficulty: 'Vận dụng' as const,
      xp: 45
    },
    {
      title: `Thử Thách Chẩn Đoán Giai Đoạn 4: Quy trình 4 bước chinh phục Vận dụng cao 9+`,
      focus: `Sắp xếp chuẩn mực các bước lập luận logic để giải quyết triệt để bài toán phân loại`,
      difficulty: 'Vận dụng cao 9+' as const,
      xp: 60
    },
    {
      title: `Thử Thách Chẩn Đoán Giai Đoạn 5: Đề thi chẩn đoán tổng hợp bấm giờ chuẩn ma trận`,
      focus: `Điền đáp số chính xác và kiểm soát thời gian làm bài dưới áp lực phòng thi`,
      difficulty: 'Vận dụng cao 9+' as const,
      xp: 55
    },
    {
      title: `Thử Thách Chẩn Đoán Giai Đoạn 6: Tổng duyệt phong độ Thủ khoa & Bản lĩnh thi cử`,
      focus: `Hoàn thiện 100% năng lực tư duy, sẵn sàng bứt phá ngưỡng điểm cao nhất`,
      difficulty: 'Vận dụng cao 9+' as const,
      xp: 70
    }
  ];

  const detail = challengeDetails[stageIndex] || challengeDetails[0];

  return {
    id: `diag_challenge_stage_${stageIndex + 1}`,
    title: detail.title,
    focus: detail.focus,
    difficulty: detail.difficulty,
    xpReward: detail.xp,
    isUnlocked: stageIndex === 0,
    isPassed: false,
    exerciseType: type
  };
}

export interface GenerateRoadmapParams {
  goalId: string;
  variantId: string;
  levelId: string;
  targetBandId: string;
  daysLeft: number;
  weeklyHours?: number;
}

export function generateRoadmap(params: GenerateRoadmapParams): RoadmapData {
  const { goalId, variantId, levelId, targetBandId, daysLeft } = params;

  // 1. Resolve objects
  const goal = GOALS.find(g => g.id === goalId) || GOALS[0];
  const variant = VARIANTS.find(v => v.id === variantId) || VARIANTS.find(v => v.goalId === goalId) || VARIANTS[0];
  const level = LEVELS.find(l => l.id === levelId) || LEVELS.find(l => l.goalId === goalId) || LEVELS[0];
  const targetBand = TARGET_BANDS.find(t => t.id === targetBandId) || TARGET_BANDS.find(t => t.goalId === goalId) || TARGET_BANDS[0];

  // 2. Find matching Rule (or default fallback)
  const rule = RULES.find(r => r.goalId === goalId && r.levelId === levelId && r.targetBandId === targetBandId)
    || RULES.find(r => r.goalId === goalId && r.levelId === levelId)
    || RULES.find(r => r.goalId === goalId)
    || RULES[0];

  // 3. Filter Topics
  let eligibleTopics = TOPICS.filter(t => {
    // Check goal match
    const matchGoal = t.goalIds.includes(goalId as any);
    // Check subject match
    const matchSubject = variant.subjectIds.includes(t.subjectId);
    // Check rule difficulty include
    const matchDifficulty = rule.include.difficulty.includes(t.difficulty);
    // Check rule frequency
    const matchFrequency = rule.include.minFrequency ? t.frequency >= rule.include.minFrequency : true;
    // Check rule skip
    const isSkipped = rule.skip ? rule.skip.includes(t.id) : false;

    return matchGoal && matchSubject && matchDifficulty && matchFrequency && !isSkipped;
  });

  // If time is short (< 45 days), prune low-frequency topics
  if (daysLeft < 45) {
    eligibleTopics = eligibleTopics.filter(t => t.frequency >= 4 || t.difficulty >= 3);
  }

  // Ensure prerequisite topics are included
  const includedIds = new Set(eligibleTopics.map(t => t.id));
  eligibleTopics.forEach(t => {
    t.prerequisites.forEach(prereqId => {
      if (!includedIds.has(prereqId)) {
        const prereqTopic = TOPICS.find(tp => tp.id === prereqId);
        if (prereqTopic && variant.subjectIds.includes(prereqTopic.subjectId)) {
          eligibleTopics.unshift(prereqTopic);
          includedIds.add(prereqId);
        }
      }
    });
  });

  // 4. Sort Topics by Prerequisites Topological Layer & Priority Heuristic
  // Heuristic Score = (frequency * scoreValue / hours) * (boosted ? 1.5 : 1.0)
  eligibleTopics.sort((a, b) => {
    // If a is prerequisite of b, a must come first
    if (b.prerequisites.includes(a.id)) return -1;
    if (a.prerequisites.includes(b.id)) return 1;

    const scoreA = (a.frequency * a.scoreValue / a.hours) * (rule.boost?.includes(a.id) ? 1.5 : 1.0);
    const scoreB = (b.frequency * b.scoreValue / b.hours) * (rule.boost?.includes(b.id) ? 1.5 : 1.0);
    return scoreB - scoreA;
  });

  // 5. Phase Mapping using PhaseTemplate
  const phaseTemplate = PHASE_TEMPLATES.find(p => p.goalId === goalId) || PHASE_TEMPLATES[0];
  const stages: StageItem[] = phaseTemplate.phases.map((phase, pIdx) => {
    const stageDays = Math.max(7, Math.round(daysLeft * (phase.percentOfTime / 100)));
    const startWeek = Math.max(1, Math.round((daysLeft - (daysLeft - (pIdx * (daysLeft / phaseTemplate.phases.length)))) / 7));
    const endWeek = Math.round(startWeek + (stageDays / 7));

    const status = pIdx === 0 ? 'active' : 'upcoming';
    const progress = pIdx === 0 ? '0%' : '0%';

    return {
      id: pIdx + 1,
      title: `Giai đoạn ${pIdx + 1}: ${phase.title}`,
      status,
      duration: `Tuần ${startWeek} - ${endWeek} (${stageDays} ngày)`,
      progress,
      diagnosticChallenge: buildStageDiagnosticChallenge(pIdx, variant.name)
    };
  });

  // 6. Generate Milestones from Top Sorted Topics across all Stages (2 milestones per stage)
  const totalWantedMilestones = Math.min(eligibleTopics.length, stages.length * 2);
  const milestones: Milestone[] = eligibleTopics.slice(0, Math.max(8, totalWantedMilestones)).map((topic, mIdx) => {
    const subjectObj = SUBJECTS.find(s => s.id === topic.subjectId);
    const stageId = Math.min(stages.length, Math.floor(mIdx / 2) + 1);
    const isFirst = mIdx === 0;

    return {
      id: `m_${topic.id}`,
      title: topic.title,
      subject: subjectObj?.name || 'Tổng hợp',
      status: isFirst ? 'active' : 'locked',
      tag: topic.tags[0] || (topic.difficulty >= 4 ? 'Trọng tâm 9+' : 'Chuyên đề'),
      score: `0/${Math.max(4, Math.round(topic.hours))} bài tập`,
      unlockDate: isFirst ? undefined : `Giai đoạn ${stageId}`,
      stageId
    };
  });

  // Ensure at least 4 milestones
  if (milestones.length < 4) {
    milestones.push({
      id: 'm_mock_checkpoint',
      title: `Đề thi thử chuẩn hóa ${variant.name} (Bấm giờ kiểm tra tiến độ)`,
      subject: variant.name,
      status: 'locked',
      tag: 'Checkpoint',
      score: `${targetBand.min}+ Mục tiêu`,
      unlockDate: 'Chủ nhật tuần 2',
      stageId: 1
    });
  }

  // 7. Generate Personalized 7-day Weekly Timetable (Always distinct, varied pedagogical activities)
  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
  const dailyFocusThemes = [
    'Lý thuyết nền tảng & Khái niệm cốt lõi',
    'Phương pháp giải bài tập mẫu & Các dạng trọng điểm',
    'Bài toán nâng cao & Phân tích bẫy đề thi',
    'Luyện tập trắc nghiệm tính giờ & Rèn tốc độ phản xạ',
    'Hỏi đáp chuyên sâu & Thực hành bài tập cùng Dr. Minerva AI'
  ];

  const schedule: ScheduleItem[] = daysOfWeek.map((day, dIdx) => {
    if (day === 'Thứ 7') {
      return {
        day,
        subject: 'Thi thử Mock Exam',
        time: '14:00 - 16:30',
        topic: `Làm đề thi thử ${variant.name} bấm giờ chuẩn phòng thi (Mục tiêu: ${targetBand.label})`,
        status: 'upcoming'
      };
    }

    if (day === 'Chủ Nhật') {
      return {
        day,
        subject: 'Cố vấn AI Review',
        time: 'Tự do trong ngày',
        topic: 'Xem lại các câu sai trong tuần cùng Dr. Minerva AI & Củng cố sổ tay công thức',
        status: 'upcoming'
      };
    }

    // Pick topic: if multiple topics, cycle through them; otherwise pair with distinct daily pedagogical focus
    const topicIndex = dIdx % Math.max(1, eligibleTopics.length);
    const topicForDay = eligibleTopics[topicIndex];
    const subjectObj = SUBJECTS.find(s => s.id === topicForDay?.subjectId);
    const focusTheme = dailyFocusThemes[dIdx] || 'Luyện tập chuyên đề';

    // Ensure topic title is distinct and descriptive
    const topicTitle = eligibleTopics.length > 3 
      ? `${topicForDay?.title}: ${focusTheme}`
      : `${topicForDay?.title} • Chặng ${dIdx + 1}: ${focusTheme}`;

    return {
      day,
      subject: subjectObj?.name || variant.name,
      time: '19:30 - 21:00',
      topic: topicTitle,
      status: dIdx === 0 ? 'current' : 'upcoming'
    };
  });

  const title = `Lộ Trình Cá Nhân Hóa ${variant.name} - Mục tiêu ${targetBand.label} (${daysLeft} Ngày)`;

  return {
    id: `roadmap_${goalId}_${variantId}_${Date.now()}`,
    title,
    targetExam: goal.name,
    targetScore: targetBand.label,
    currentLevel: level.label,
    daysLeft,
    totalProgress: 0,
    stages,
    milestones,
    schedule
  };
}
