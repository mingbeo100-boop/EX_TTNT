import { RoadmapData } from '../types';
import { api } from './api';

export type ExerciseType = 'multiple_choice' | 'fill_blank' | 'trap_detect' | 'matching_pairs' | 'ordering_steps' | 'true_false_group';

export interface TrueFalseStatement {
  id: string;
  label: string; // e.g. "a)", "b)", "c)", "d)"
  statement: string;
  isCorrect: boolean; // true = Đúng, false = Sai
  explanation: string;
}

export interface ExerciseForm {
  id: string;
  title: string;
  description: string;
  formType: 'comprehensive' | 'trap_and_true_false' | 'logic_and_matching' | 'advanced_9plus';
  exercises: Exercise[];
  createdAt?: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  topicId: string;
  topicTitle: string;
  subject: string;
  difficulty: 'Nền tảng' | 'Vận dụng' | 'Vận dụng cao 9+';
  question: string;
  // Multiple Choice fields
  options?: string[];
  correctAnswer?: number;
  // Fill-in fields
  expectedAnswer?: string;
  acceptableAnswers?: string[];
  placeholder?: string;
  hint?: string;
  // Trap Detective fields
  steps?: {
    stepNum: number;
    title: string;
    content: string;
    isFaulty?: boolean;
    faultReason?: string;
  }[];
  // Matching Pairs fields
  matchingPairs?: {
    id: string;
    left: string;
    right: string;
  }[];
  // Ordering Steps fields
  orderingSteps?: {
    id: string;
    correctOrder: number;
    text: string;
  }[];
  // True / False Group fields (Cấu trúc mới THPT 2025)
  statements?: TrueFalseStatement[];
  explanation: string;
  xp: number;
  completed?: boolean;
}

export interface StudyNavigationIntent {
  exerciseType?: ExerciseType;
  exerciseId?: string;
  difficulty?: 'Nền tảng' | 'Vận dụng' | 'Vận dụng cao 9+';
  milestoneId?: string;
  topicTitle?: string;
  subject?: string;
  tab?: 'practice' | 'formulas' | 'pomodoro' | 'checklist';
  isDiagnosticChallenge?: boolean;
  diagnosticStageId?: number;
  initialPrompt?: string;
}

export interface ActiveStudyContext {
  topicTitle: string;
  subject: string;
  milestoneId?: string;
  goalId?: string;
  goalName?: string;
  targetScore?: string;
  currentLevel?: string;
  daysLeft?: number;
  completedExercisesCount: number;
  totalExercisesCount: number;
  completedExercises: string[];
  streakDays: number;
  isDiagnosticChallenge?: boolean;
  diagnosticStageId?: number;
}

// Built-in Diverse Multi-Format Exercise Bank
const PRELOADED_EXERCISES: Exercise[] = [
  // --- TOÁN: TÍCH PHÂN HÀM ẨN & ĐỐI XỨNG ---
  {
    id: 'ex_math_mcq_1',
    type: 'multiple_choice',
    topicId: 'toan-tich-phan-ham-an',
    topicTitle: 'Tích phân hàm ẩn & Kỹ thuật biến đổi đối xứng',
    subject: 'Toán học',
    difficulty: 'Vận dụng',
    question: 'Cho hàm số f(x) liên tục trên ℝ thỏa mãn f(x) + f(-x) = cos(x). Giá trị của tích phân I = ∫[-π/2 → π/2] f(x) dx bằng:',
    options: ['0', '1', '2', 'π'],
    correctAnswer: 1,
    explanation: 'Áp dụng tính chất hàm đối xứng qua gốc tọa độ: Lấy tích phân 2 vế trên [-π/2; π/2]: 2I = ∫[-π/2 → π/2] cos(x)dx = 2 => I = 1.',
    xp: 25
  },
  {
    id: 'ex_math_fill_1',
    type: 'fill_blank',
    topicId: 'toan-tich-phan-ham-an',
    topicTitle: 'Tích phân hàm ẩn & Kỹ thuật biến đổi đối xứng',
    subject: 'Toán học',
    difficulty: 'Vận dụng cao 9+',
    question: 'Cho hàm số f(x) thỏa mãn f(x) + 2f(1-x) = 3x² - x. Giá trị của tích phân I = ∫[0→1] x·f\'(x) dx là phân số tối giản a/b. Hãy nhập kết quả phân số (dạng -a/b):',
    expectedAnswer: '-5/6',
    acceptableAnswers: ['-5/6', '-0.833', '-0.83'],
    placeholder: 'Ví dụ: -5/6',
    hint: 'Khử ẩn để tìm f(x) = x² - 3x + 4/3, sau đó tích phân từng phần: I = [x·f(x)] - ∫ f(x)dx.',
    explanation: 'Sau khi giải hệ ta được f(x) = x² - 3x + 4/3. Tích phân từng phần cho I = f(1) - [x³/3 - 3x²/2 + 4x/3]_0^1 = -2/3 - 1/6 = -5/6.',
    xp: 35
  },
  {
    id: 'ex_math_trap_1',
    type: 'trap_detect',
    topicId: 'toan-tich-phan-ham-an',
    topicTitle: 'Tích phân hàm ẩn & Kỹ thuật biến đổi đối xứng',
    subject: 'Toán học',
    difficulty: 'Vận dụng cao 9+',
    question: 'BẪY ĐỀ THI: Một bạn học sinh giải bài toán "Tính I = ∫[0→π] x·sin(x) / (1 + cos²x) dx" qua 3 bước như sau. Hãy phát hiện bước nào chứa lỗi sai bản chất:',
    steps: [
      {
        stepNum: 1,
        title: 'Đổi biến số đối xứng',
        content: 'Đặt x = π - t => dx = -dt. Cận đổi thành t từ π đến 0. Ta được: I = ∫[π→0] (π - t)sin(π-t) / (1 + cos²(π-t)) (-dt) = ∫[0→π] (π - t)sin(t) / (1 + cos²t) dt.',
        isFaulty: false
      },
      {
        stepNum: 2,
        title: 'Cộng 2 tích phân ban đầu và đối xứng',
        content: 'Lấy 2I = I + I = ∫[0→π] [x + (π - x)] · sin(x) / (1 + cos²x) dx = π · ∫[0→π] sin(x) / (1 + cos²x) dx.',
        isFaulty: false
      },
      {
        stepNum: 3,
        title: 'Đổi biến đặt u = cos(x) tính nguyên hàm',
        content: 'Đặt u = cos(x) => du = -sin(x)dx. Khi x=0 => u=1; x=π => u=-1. Ta có: 2I = π · [arctan(u)]_{-1}^1 = π · (π/4 - (-π/4)) = π²/2 => I = π²/4.',
        isFaulty: true,
        faultReason: 'Quên dấu trừ (-du) khi thay thế sin(x)dx! Khi đặt u = cos(x) thì sin(x)dx = -du, nên cận đổi từ 1 đến -1 cùng dấu trừ sẽ đảo lại từ -1 đến 1.'
      }
    ],
    explanation: 'Tại Bước 3, học sinh thường quên dấu trừ của du = -sin(x)dx. Tuy nhiên do cận từ 1 đến -1 bị đảo dấu nên hai lỗi triệt tiêu, nhưng trình bày luận cứ sai khiến mất trọn điểm tự luận!',
    xp: 40
  },

  // --- CNTT & GPA: CON TRỎ & DANH SÁCH LIÊN KẾT ---
  {
    id: 'ex_dsa_mcq_1',
    type: 'multiple_choice',
    topicId: 'gpa-con-tro-danh-sach',
    topicTitle: 'Quản lý bộ nhớ con trỏ & Danh sách liên kết',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Nền tảng',
    question: 'Trong ngôn ngữ C/C++, hành vi nào sau đây trực tiếp gây ra hiện tượng rò rỉ bộ nhớ (Memory Leak)?',
    options: [
      'Giải phóng vùng nhớ 2 lần bằng lệnh delete ptr;',
      'Cấp phát vùng nhớ bằng new nhưng không gọi delete khi con trỏ ra khỏi phạm vi (scope)',
      'Truy cập con trỏ trỏ vào vùng nhớ NULL',
      'Ép kiểu con trỏ void* sang int*'
    ],
    correctAnswer: 1,
    explanation: 'Khi cấp phát bộ nhớ động trên Heap bằng new/malloc mà không thu hồi bằng delete/free, địa chỉ bộ nhớ bị mất nhưng dung lượng RAM vẫn bị chiếm giữ, gây Memory Leak.',
    xp: 25
  },
  {
    id: 'ex_dsa_fill_1',
    type: 'fill_blank',
    topicId: 'gpa-con-tro-danh-sach',
    topicTitle: 'Quản lý bộ nhớ con trỏ & Danh sách liên kết',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Vận dụng',
    question: 'Độ phức tạp thời gian (Big-O) của thao tác chèn một nút mới vào ngay ĐẦU danh sách liên kết đơn (Singly Linked List) là:',
    expectedAnswer: 'O(1)',
    acceptableAnswers: ['O(1)', '1', 'o(1)'],
    placeholder: 'Nhập độ phức tạp (ví dụ: O(1))',
    hint: 'Chỉ cần gán newNode->next = head; head = newNode, không cần duyệt qua danh sách.',
    explanation: 'Thao tác chèn đầu chỉ tốn số phép gán con trỏ cố định (2 phép gán), không phụ thuộc vào độ dài N của danh sách, do đó độ phức tạp tối ưu tuyệt đối O(1).',
    xp: 30
  },
  {
    id: 'ex_dsa_trap_1',
    type: 'trap_detect',
    topicId: 'gpa-con-tro-danh-sach',
    topicTitle: 'Quản lý bộ nhớ con trỏ & Danh sách liên kết',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Vận dụng cao 9+',
    question: 'BẪY PHỎNG VẤN & THI CUỐI KỲ: Xem xét đoạn mã xóa một nút p khỏi danh sách liên kết đơn có con trỏ trước nó là prev. Đâu là bước sai sót nghiêm trọng?',
    steps: [
      {
        stepNum: 1,
        title: 'Kiểm tra tính hợp lệ của con trỏ',
        content: 'if (p == nullptr) return; // Nếu nút cần xóa rỗng thì dừng',
        isFaulty: false
      },
      {
        stepNum: 2,
        title: 'Thu hồi bộ nhớ',
        content: 'delete p; // Giải phóng vùng nhớ của nút p ngay lập tức',
        isFaulty: true,
        faultReason: 'XÓA QUÁ SỚM! Khi delete p trước, vùng nhớ chứa p->next bị giải phóng, lệnh nối danh sách tiếp theo sẽ truy cập vào vùng nhớ rác (Dangling Pointer / Undefined Behavior)!'
      },
      {
        stepNum: 3,
        title: 'Nối lại liên kết danh sách',
        content: 'prev->next = p->next; // Nối con trỏ kế tiếp của nút trước qua nút sau',
        isFaulty: false
      }
    ],
    explanation: 'Thứ tự đúng bắt buộc phải là: prev->next = p->next; sau đó mới được delete p; Nếu delete trước, p->next sẽ bị hủy và gây lỗi crash chương trình.',
    xp: 40
  },

  // --- VẬT LÝ: DAO ĐỘNG & GIAO THOA SÓNG ---
  {
    id: 'ex_phys_mcq_1',
    type: 'multiple_choice',
    topicId: 'ly-giao-thoa-song',
    topicTitle: 'Giao thoa sóng cơ & Bài toán cực đại cực tiểu',
    subject: 'Vật lý 12',
    difficulty: 'Nền tảng',
    question: 'Trong hiện tượng giao thoa sóng trên mặt nước với hai nguồn cùng pha, khoảng cách giữa hai điểm cực đại giao thoa liên tiếp trên đoạn thẳng nối hai nguồn bằng:',
    options: ['Một bước sóng (λ)', 'Nửa bước sóng (λ/2)', 'Một phần tư bước sóng (λ/4)', 'Hai bước sóng (2λ)'],
    correctAnswer: 1,
    explanation: 'Trên đoạn thẳng nối hai nguồn cùng pha, khoảng cách giữa 2 cực đại liên tiếp hoặc 2 cực tiểu liên tiếp luôn luôn là λ/2.',
    xp: 25
  },
  {
    id: 'ex_phys_fill_1',
    type: 'fill_blank',
    topicId: 'ly-dao-dong-dieu-hoa',
    topicTitle: 'Đại cương dao động điều hòa',
    subject: 'Vật lý 12',
    difficulty: 'Nền tảng',
    question: 'Một vật dao động điều hòa với biên độ A = 5 cm và tần số góc ω = 10 rad/s. Tốc độ cực đại (v_max) của vật khi qua vị trí cân bằng bằng bao nhiêu cm/s?',
    expectedAnswer: '50',
    acceptableAnswers: ['50', '50 cm/s', '50cm/s'],
    placeholder: 'Nhập số (cm/s)',
    hint: 'Công thức tốc độ cực đại: v_max = ω · A.',
    explanation: 'Áp dụng công thức v_max = ω · A = 10 · 5 = 50 cm/s.',
    xp: 20
  },
  {
    id: 'ex_phys_trap_1',
    type: 'trap_detect',
    topicId: 'ly-giao-thoa-song',
    topicTitle: 'Giao thoa sóng cơ & Bài toán cực đại cực tiểu',
    subject: 'Vật lý 12',
    difficulty: 'Vận dụng cao 9+',
    question: 'BẪY ĐỀ THI: Đề bài cho 2 nguồn sóng A, B dao động NGƯỢC PHA. Một học sinh xác định số điểm cực đại trên đoạn AB như sau. Hãy tìm bước sai lầm nghiêm trọng:',
    steps: [
      {
        stepNum: 1,
        title: 'Tính bước sóng λ',
        content: 'λ = v / f = 40 / 20 = 2 cm. Khoảng cách AB = 11 cm.',
        isFaulty: false
      },
      {
        stepNum: 2,
        title: 'Thiết lập điều kiện cực đại giao thoa',
        content: 'Điểm cực đại thỏa mãn: d2 - d1 = k·λ với k nguyên.',
        isFaulty: true,
        faultReason: 'BẪY HAI NGUỒN NGƯỢC PHA! Khi 2 nguồn ngược pha, điều kiện cực đại là d2 - d1 = (k + 0.5)·λ, còn d2 - d1 = k·λ là điều kiện của hai nguồn cùng pha!'
      },
      {
        stepNum: 3,
        title: 'Giải bất phương trình tìm số giá trị k',
        content: '-AB < k·λ < AB <=> -5.5 < k < 5.5 => có 11 cực đại.',
        isFaulty: false
      }
    ],
    explanation: 'Học sinh thường quen làm bài toán hai nguồn cùng pha (cực đại = kλ) nên khi đề đổi thành hai nguồn ngược pha hoặc vuông pha sẽ bị dính bẫy ngay lập tức.',
    xp: 40
  },

  // --- CÂY NHỊ PHÂN & STACK/QUEUE (DSA) ---
  {
    id: 'ex_dsa_tree_1',
    type: 'multiple_choice',
    topicId: 'gpa-cay-nhi-phan-bst',
    topicTitle: 'Cây nhị phân tìm kiếm (BST) & Cân bằng AVL',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Vận dụng',
    question: 'Trong cây nhị phân tìm kiếm (Binary Search Tree), phép duyệt nào sau đây cho danh sách các phần tử theo thứ tự TĂNG DẦN?',
    options: ['Pre-order (Tiền thứ tự: Gốc - Trái - Phải)', 'In-order (Trung thứ tự: Trái - Gốc - Phải)', 'Post-order (Hậu thứ tự: Trái - Phải - Gốc)', 'Level-order (Duyệt theo mức)'],
    correctAnswer: 1,
    explanation: 'Phép duyệt In-order (Left → Root → Right) trên BST luôn ghé thăm các nút nhỏ hơn trước, sau đó đến nút hiện tại, rồi đến các nút lớn hơn, cho ra dãy khóa tăng dần tuyệt đối.',
    xp: 30
  },
  {
    id: 'ex_dsa_stack_1',
    type: 'fill_blank',
    topicId: 'gpa-stack-queue-hang-doi',
    topicTitle: 'Ngăn xếp (Stack) & Hàng đợi (Queue)',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Nền tảng',
    question: 'Ngăn xếp (Stack) hoạt động theo nguyên lý nào? (Nhập từ viết tắt 4 chữ cái tiếng Anh):',
    expectedAnswer: 'LIFO',
    acceptableAnswers: ['LIFO', 'lifo', 'Last In First Out'],
    placeholder: 'Ví dụ: LIFO hoặc FIFO',
    hint: 'Phần tử được đưa vào cuối cùng sẽ được lấy ra đầu tiên (Last In, First Out).',
    explanation: 'Ngăn xếp hoạt động theo cơ chế LIFO (Last In First Out - Vào sau ra trước), ngược lại Hàng đợi (Queue) là FIFO.',
    xp: 20
  },

  // --- DẠNG MỚI 1: GHÉP NỐI KHÁI NIỆM & CÔNG THỨC (MATCHING PAIRS) ---
  {
    id: 'ex_math_match_1',
    type: 'matching_pairs',
    topicId: 'toan-tich-phan-ham-an',
    topicTitle: 'Tích phân hàm ẩn & Kỹ thuật biến đổi đối xứng',
    subject: 'Toán học',
    difficulty: 'Vận dụng',
    question: 'THỬ THÁCH GHÉP ĐÔI: Hãy ghép từng định lý/kỹ thuật tích phân ở Cột Trái với hệ thức tương ứng chính xác ở Cột Phải:',
    matchingPairs: [
      { id: 'p1', left: 'Bổ đề đối xứng f(x) + f(a+b-x) = 1', right: '∫[a→b] f(x)dx = (b-a)/2' },
      { id: 'p2', left: 'Hàm số chẵn liên tục trên [-a; a]', right: '∫[-a→a] f(x)dx = 2∫[0→a] f(x)dx' },
      { id: 'p3', left: 'Hàm số lẻ liên tục trên [-a; a]', right: '∫[-a→a] f(x)dx = 0' },
      { id: 'p4', left: 'Công thức tích phân từng phần', right: '∫ u dv = u·v - ∫ v du' }
    ],
    explanation: 'Các bổ đề này giúp giải quyết các bài toán tích phân vận dụng cao 9+ trong vòng 30-45 giây mà không cần tìm nguyên hàm tường minh.',
    xp: 35
  },

  // --- DẠNG MỚI 2: SẮP XẾP THỨ TỰ BƯỚC GIẢI (ORDERING STEPS) ---
  {
    id: 'ex_math_order_1',
    type: 'ordering_steps',
    topicId: 'toan-tich-phan-ham-an',
    topicTitle: 'Tích phân hàm ẩn & Kỹ thuật biến đổi đối xứng',
    subject: 'Toán học',
    difficulty: 'Vận dụng cao 9+',
    question: 'SẮP XẾP THỨ TỰ TƯ DUY: Cho phương trình hàm ẩn f(x) + 2f(1-x) = 3x² - x. Hãy sắp xếp 4 bước sau theo đúng quy trình giải đại số:',
    orderingSteps: [
      { id: 's1', correctOrder: 1, text: 'Thay biến x bởi 1-x trên toàn miền xác định để thiết lập phương trình đối xứng thứ hai.' },
      { id: 's2', correctOrder: 2, text: 'Nhân 2 vào phương trình thứ hai rồi lấy hiệu với phương trình thứ nhất để triệt tiêu ẩn f(1-x).' },
      { id: 's3', correctOrder: 3, text: 'Rút ra công thức tường minh của hàm số f(x) = x² - 3x + 4/3.' },
      { id: 's4', correctOrder: 4, text: 'Áp dụng công thức tích phân từng phần: I = [x·f(x)] - ∫ f(x)dx để tính giá trị tích phân cần tìm.' }
    ],
    explanation: 'Quy trình khử ẩn đối xứng luôn tuân thủ: Biến đổi x -> a+b-x -> Giải hệ phương trình đại số bậc nhất 2 ẩn hàm -> Rút hàm tường minh -> Tính tích phân.',
    xp: 40
  },

  // --- DẠNG GHÉP NỐI & SẮP XẾP CHO DSA / CNTT ---
  {
    id: 'ex_dsa_order_1',
    type: 'ordering_steps',
    topicId: 'gpa-con-tro-danh-sach',
    topicTitle: 'Quản lý bộ nhớ con trỏ & Danh sách liên kết',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Vận dụng',
    question: 'SẮP XẾP QUY TRÌNH: Sắp xếp 4 thao tác chuẩn kỹ thuật để xóa nút p trong danh sách liên kết đơn có nút đứng trước là prev:',
    orderingSteps: [
      { id: 'd1', correctOrder: 1, text: 'Kiểm tra con trỏ p và prev khác nullptr để bảo đảm không truy cập vùng nhớ bất hợp lệ.' },
      { id: 'd2', correctOrder: 2, text: 'Bắc cầu liên kết: prev->next = p->next để bảo toàn tính liên tục của danh sách.' },
      { id: 'd3', correctOrder: 3, text: 'Giải phóng vùng nhớ của nút mục tiêu: delete p;' },
      { id: 'd4', correctOrder: 4, text: 'Gán p = nullptr để triệt tiêu con trỏ treo (Dangling Pointer).' }
    ],
    explanation: 'Nếu delete p trước khi bắc cầu prev->next = p->next, dữ liệu p->next sẽ bị hủy và toàn bộ danh sách phía sau sẽ bị mất (Memory Leak / Crash).',
    xp: 35
  },

  // --- DSA: SẮP XẾP & TÌM KIẾM NHỊ PHÂN ---
  {
    id: 'ex_dsa_sort_mcq_1',
    type: 'multiple_choice',
    topicId: 'gpa-thuat-toan-sap-xep',
    topicTitle: 'Thuật toán Sắp xếp (QuickSort, MergeSort) & Tìm kiếm nhị phân O(log N)',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Vận dụng',
    question: 'Trong trường hợp xấu nhất (Worst-case), khi mảng đã được sắp xếp tăng dần và thuật toán QuickSort luôn chọn phần tử đầu tiên làm pivot (chốt), độ phức tạp thời gian của QuickSort là bao nhiêu?',
    options: ['O(log N)', 'O(N)', 'O(N log N)', 'O(N²)'],
    correctAnswer: 3,
    explanation: 'Khi pivot luôn là phần tử nhỏ nhất hoặc lớn nhất, cây đệ quy bị suy biến thành đường thẳng chiều cao N, mỗi tầng duyệt N phần tử dẫn đến tổng số phép so sánh là N(N-1)/2 = O(N²). Để khắc phục, người ta dùng Randomized QuickSort hoặc chọn Median-of-three.',
    xp: 30
  },
  {
    id: 'ex_dsa_sort_fill_1',
    type: 'fill_blank',
    topicId: 'gpa-thuat-toan-sap-xep',
    topicTitle: 'Thuật toán Sắp xếp (QuickSort, MergeSort) & Tìm kiếm nhị phân O(log N)',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Nền tảng',
    question: 'Để áp dụng được thuật toán Tìm kiếm nhị phân (Binary Search) trên một mảng dữ liệu, điều kiện tiên quyết bắt buộc đối với các phần tử trong mảng là gì? (Nhập: "đã sắp xếp"):',
    expectedAnswer: 'đã sắp xếp',
    acceptableAnswers: ['đã sắp xếp', 'da sap xep', 'được sắp xếp', 'sorted', 'tăng dần hoặc giảm dần'],
    placeholder: 'Ví dụ: đã sắp xếp',
    hint: 'Mảng phải có thứ tự tăng dần hoặc giảm dần thì mới chia đôi được không gian tìm kiếm.',
    explanation: 'Tìm kiếm nhị phân dựa trên nguyên lý "chia để trị". Mảng bắt buộc phải ĐÃ ĐƯỢC SẮP XẾP (Sorted) để sau mỗi phép so sánh với phần tử ở giữa, ta có thể loại bỏ ngay 1/2 số phần tử còn lại.',
    xp: 25
  },
  {
    id: 'ex_dsa_sort_trap_1',
    type: 'trap_detect',
    topicId: 'gpa-thuat-toan-sap-xep',
    topicTitle: 'Thuật toán Sắp xếp (QuickSort, MergeSort) & Tìm kiếm nhị phân O(log N)',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Vận dụng cao 9+',
    question: 'BẪY TRÀN BỘ NHỚ LẬP TRÌNH: Đoạn mã C++/Java tìm kiếm nhị phân sau đây có chứa một lỗi tiềm ẩn kinh điển (Google Bug). Hãy phát hiện dòng lệnh mang rủi ro tràn số nguyên:',
    steps: [
      {
        stepNum: 1,
        title: 'Khởi tạo cận tìm kiếm',
        content: 'int left = 0; int right = n - 1;',
        isFaulty: false
      },
      {
        stepNum: 2,
        title: 'Tính toán chỉ số phần tử chính giữa (mid)',
        content: 'int mid = (left + right) / 2;',
        isFaulty: true,
        faultReason: 'BẪY INTEGER OVERFLOW! Khi mảng có kích thước rất lớn (hơn 1 tỷ phần tử), biểu thức (left + right) sẽ vượt quá giá trị cực đại của số nguyên có dấu 32-bit (INT_MAX = 2^31 - 1), dẫn đến giá trị âm và gây lỗi IndexOutOfBounds! Cách chuẩn là: mid = left + (right - left) / 2 hoặc mid = ((unsigned int)left + (unsigned int)right) >> 1.'
      },
      {
        stepNum: 3,
        title: 'Thu hẹp không gian tìm kiếm',
        content: 'if (arr[mid] < target) left = mid + 1; else right = mid - 1;',
        isFaulty: false
      }
    ],
    explanation: 'Lỗi mid = (left + right) / 2 từng tồn tại trong thư viện chuẩn Java java.util.Arrays.binarySearch hơn 9 năm trước khi được nhà nghiên cứu của Google phát hiện vào năm 2006.',
    xp: 40
  },
  {
    id: 'ex_dsa_sort_order_1',
    type: 'ordering_steps',
    topicId: 'gpa-thuat-toan-sap-xep',
    topicTitle: 'Thuật toán Sắp xếp (QuickSort, MergeSort) & Tìm kiếm nhị phân O(log N)',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Vận dụng',
    question: 'SẮP XẾP QUY TRÌNH PHÂN HOẠCH LOMUTO (QuickSort): Hãy sắp xếp 4 bước chuẩn để phân hoạch mảng quanh pivot là phần tử cuối arr[high]:',
    orderingSteps: [
      { id: 'lo1', correctOrder: 1, text: 'Chọn phần tử chốt pivot = arr[high] và khởi tạo chỉ số i = low - 1 (vùng các số nhỏ hơn pivot).' },
      { id: 'lo2', correctOrder: 2, text: 'Duyệt j từ low đến high - 1: Nếu arr[j] <= pivot, tăng i lên 1 và hoán đổi swap(arr[i], arr[j]).' },
      { id: 'lo3', correctOrder: 3, text: 'Hoán đổi pivot vào vị trí chính xác: swap(arr[i + 1], arr[high]).' },
      { id: 'lo4', correctOrder: 4, text: 'Trả về chỉ số (i + 1) để tiếp tục gọi đệ quy phân chia hai nửa mảng con độc lập.' }
    ],
    explanation: 'Thuật toán phân hoạch Lomuto duyệt một chiều, liên tục duy trì bất biến: các phần tử từ low..i luôn <= pivot, và từ i+1..j-1 > pivot.',
    xp: 35
  },
  {
    id: 'ex_dsa_sort_match_1',
    type: 'matching_pairs',
    topicId: 'gpa-thuat-toan-sap-xep',
    topicTitle: 'Thuật toán Sắp xếp (QuickSort, MergeSort) & Tìm kiếm nhị phân O(log N)',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Vận dụng',
    question: 'GHÉP ĐÔI THUẬT TOÁN & ĐẶC TÍNH PHỨC TẠP: Hãy ghép từng thuật toán ở Cột Trái với độ phức tạp hoặc đặc tính tương ứng ở Cột Phải:',
    matchingPairs: [
      { id: 'sm1', left: 'MergeSort (Sắp xếp trộn)', right: 'Độ phức tạp O(N log N) trong mọi trường hợp, tốn O(N) bộ nhớ phụ' },
      { id: 'sm2', left: 'QuickSort (Phân hoạch ngẫu nhiên)', right: 'Trung bình O(N log N), In-place không tốn mảng phụ, xấu nhất O(N²)' },
      { id: 'sm3', left: 'Binary Search (Tìm kiếm nhị phân)', right: 'Độ phức tạp O(log N), yêu cầu dữ liệu bắt buộc đã sắp xếp' },
      { id: 'sm4', left: 'Counting Sort (Đếm phân phối)', right: 'Độ phức tạp O(N + K), sắp xếp tuyến tính không dựa trên so sánh' }
    ],
    explanation: 'MergeSort có tính ổn định (Stable) nhưng tốn O(N) RAM. QuickSort không ổn định nhưng nhanh hơn trong thực tế nhờ bộ nhớ đệm Cache (Cache-friendly).',
    xp: 35
  }
,

  // --- BÀI TẬP THỬ THÁCH CHẨN ĐOÁN GIAI ĐOẠN (STAGE DIAGNOSTIC BOSS CHALLENGES) ---
  {
    id: 'diag_challenge_stage_1',
    type: 'multiple_choice',
    topicId: 'diag_stage_1',
    topicTitle: 'Thử Thách Chẩn Đoán Giai Đoạn 1: Đánh giá tư duy nền tảng & Khái niệm cốt lõi',
    subject: 'Toán học & Khoa học Tự nhiên',
    difficulty: 'Vận dụng',
    question: 'CHẨN ĐOÁN GIAI ĐOẠN 1: Cho hàm số f(x) liên tục trên ℝ thỏa mãn f(x) + 2f(-x) = 3cos(x) + sin(x). Giá trị của tích phân I = ∫_{-π/2}^{π/2} f(x)dx bằng:',
    options: [
      'I = 2',
      'I = 4/3',
      'I = 0',
      'I = 2/3'
    ],
    correctAnswer: 0,
    explanation: 'Lấy tích phân 2 vế từ -π/2 đến π/2: ∫ f(x)dx + 2∫ f(-x)dx = ∫ (3cos x + sin x)dx. Do ∫_{-a}^a f(-x)dx = ∫_{-a}^a f(x)dx = I, ta có 3I = [3sin(x) - cos(x)]_{-π/2}^{π/2} = 3(1 - (-1)) = 6 => I = 2.',
    xp: 40
  },
  {
    id: 'diag_challenge_stage_2',
    type: 'trap_detect',
    topicId: 'diag_stage_2',
    topicTitle: 'Thử Thách Chẩn Đoán Giai Đoạn 2: Bắt bẫy đề thi & Phòng chống ngộ nhận thường gặp',
    subject: 'Toán học & Vật lý',
    difficulty: 'Vận dụng cao 9+',
    question: 'CHẨN ĐOÁN GIAI ĐOẠN 2: Một học sinh giải bài toán "Tìm tập nghiệm của bất phương trình log₂(x - 1) < log₂(3 - x)" qua 3 bước dưới đây. Hãy phát hiện bước SAI LẦM nghiêm trọng nhất:',
    steps: [
      {
        stepNum: 1,
        title: 'Bỏ qua bước đặt điều kiện xác định',
        content: 'Học sinh bỏ qua điều kiện: x - 1 > 0 và 3 - x > 0 (1 < x < 3)',
        isFaulty: true,
        faultReason: 'BẪY TỬ HUYỆT LOGARIT: Quên điều kiện xác định hàm logarit là lỗi bị trừ toàn bộ điểm số! Biến đổi trực tiếp x - 1 < 3 - x cho ra x < 2, nhưng kết quả đúng phải giao với điều kiện (1 < x < 3), tức là 1 < x < 2!'
      },
      {
        stepNum: 2,
        title: 'Khử cơ số do cơ số 2 > 1',
        content: 'Vì cơ số 2 > 1 nên bất phương trình tương đương x - 1 < 3 - x',
        isFaulty: false
      },
      {
        stepNum: 3,
        title: 'Chuyển vế giải bất phương trình bậc nhất',
        content: '2x < 4 => x < 2',
        isFaulty: false
      }
    ],
    explanation: 'Nếu quên điều kiện xác định x > 1, học sinh sẽ nhận cả nghiệm âm (ví dụ x = 0, x = -5), gây sai lệch hoàn toàn tập nghiệm.',
    xp: 50
  },
  {
    id: 'diag_challenge_stage_3',
    type: 'matching_pairs',
    topicId: 'diag_stage_3',
    topicTitle: 'Thử Thách Chẩn Đoán Giai Đoạn 3: Khớp nối bổ đề & Tư duy giải nhanh đột phá',
    subject: 'Toán học & Kỹ thuật bổ đề',
    difficulty: 'Vận dụng',
    question: 'CHẨN ĐOÁN GIAI ĐOẠN 3: Khớp nối 4 Bổ đề kinh điển ở Cột Trái với Công thức rút gọn ở Cột Phải:',
    matchingPairs: [
      { id: 'bp1', left: 'Bổ đề tích phân hàm chẵn f(-x) = f(x)', right: '∫_{-a}^a f(x)dx = 2 ∫_0^a f(x)dx' },
      { id: 'bp2', left: 'Bổ đề tích phân hàm lẻ f(-x) = -f(x)', right: '∫_{-a}^a f(x)dx = 0' },
      { id: 'bp3', left: 'Bổ đề tâm đối xứng f(x) + f(2a-x) = 2b', right: '∫_0^{2a} f(x)dx = 2ab' },
      { id: 'bp4', left: 'Bổ đề đổi biến trục x = a + b - t', right: '∫_a^b f(x)dx = ∫_a^b f(a+b-x)dx' }
    ],
    explanation: '4 Bổ đề đối xứng này là chìa khóa xử lý 90% bài toán tích phân hàm ẩn trong các đề thi thử chuyên và THPT Quốc gia.',
    xp: 45
  },
  {
    id: 'diag_challenge_stage_4',
    type: 'ordering_steps',
    topicId: 'diag_stage_4',
    topicTitle: 'Thử Thách Chẩn Đoán Giai Đoạn 4: Quy trình 4 bước chinh phục Vận dụng cao 9+',
    subject: 'Tư duy Thuật toán & Toán 9+',
    difficulty: 'Vận dụng cao 9+',
    question: 'CHẨN ĐOÁN GIAI ĐOẠN 4: Hãy sắp xếp 4 bước tư duy của phương pháp Ghép Bảng Biến Thiên giải phương trình f(u(x)) = m:',
    orderingSteps: [
      { id: 'gb1', correctOrder: 1, text: "Bước 1: Tìm tập xác định, tính đạo hàm u'(x) và lập bảng biến thiên của hàm lõi u = u(x)." },
      { id: 'gb2', correctOrder: 2, text: "Bước 2: Xác định các điểm cực trị x_i của hàm u(x) và các điểm cực trị u_k của đồ thị hàm f(u)." },
      { id: 'gb3', correctOrder: 3, text: "Bước 3: Ghép các khoảng biến thiên của u vào dòng biến thiên f(u) theo đúng chiều tăng giảm." },
      { id: 'gb4', correctOrder: 4, text: "Bước 4: Vẽ đường thẳng y = m cắt đồ thị ghép f(u) để đếm chính xác số nghiệm phân biệt." }
    ],
    explanation: 'Phương pháp sơ đồ ghép trục / ghép bảng biến thiên giúp giải các câu tương giao hàm hợp cực khó trong vòng 60 giây.',
    xp: 60
  },
  {
    id: 'diag_challenge_stage_5',
    type: 'fill_blank',
    topicId: 'diag_stage_5',
    topicTitle: 'Thử Thách Chẩn Đoán Giai Đoạn 5: Đề thi chẩn đoán tổng hợp bấm giờ chuẩn ma trận',
    subject: 'Toán học & Giải tích thực chiến',
    difficulty: 'Vận dụng cao 9+',
    question: "CHẨN ĐOÁN GIAI ĐOẠN 5: Cho f(x) liên tục thỏa mãn f(x) + x · f'(x) = 4x³ + 2x với f(1) = 2. Giá trị của f(2) bằng bao nhiêu? (Nhập số nguyên):",
    expectedAnswer: '10',
    acceptableAnswers: ['10', 'mười'],
    placeholder: 'Nhập giá trị f(2)',
    hint: "Nhận diện đạo hàm tích: [x · f(x)]' = f(x) + x · f'(x).",
    explanation: "Ta có [x · f(x)]' = 4x³ + 2x. Lấy nguyên hàm hai vế: x · f(x) = x⁴ + x² + C. Với x = 1: 1 · f(1) = 2 = 1 + 1 + C => C = 0. Do đó f(x) = x³ + x. Tại x = 2: f(2) = 2³ + 2 = 8 + 2 = 10.",
    xp: 55
  },
  {
    id: 'diag_challenge_stage_6',
    type: 'ordering_steps',
    topicId: 'diag_stage_6',
    topicTitle: 'Thử Thách Chẩn Đoán Giai Đoạn 6: Tổng duyệt phong độ Thủ khoa & Bản lĩnh thi cử',
    subject: 'Chiến thuật Phòng thi Thủ khoa',
    difficulty: 'Vận dụng cao 9+',
    question: 'CHẨN ĐOÁN GIAI ĐOẠN 6: Hãy sắp xếp 4 bước chiến thuật phân bổ 90 phút thi chuẩn xác của các Thủ khoa:',
    orderingSteps: [
      { id: 'tk1', correctOrder: 1, text: 'Chặng 1 (25 phút đầu): Quét nhanh và giải quyết chắc chắn 35 câu nhận biết & thông hiểu đầu tiên (7.0 điểm).' },
      { id: 'tk2', correctOrder: 2, text: 'Chặng 2 (30 phút tiếp): Xử lý dứt điểm 10 câu vận dụng 8+ quen thuộc, đánh dấu câu phân vân.' },
      { id: 'tk3', correctOrder: 3, text: 'Chặng 3 (25 phút tiếp): Tập trung cao độ công phá 5 câu Vận dụng cao 9+ phân loại bằng sơ đồ tư duy.' },
      { id: 'tk4', correctOrder: 4, text: 'Chặng 4 (10 phút cuối): Tô phiếu trắc nghiệm, dò soát bẫy tính toán và khóa chặt toàn bộ kết quả.' }
    ],
    explanation: 'Chiến thuật kim tự tháp thời gian đảm bảo không bao giờ bị mất điểm oan câu dễ và tối ưu hóa thời gian cho các câu phân loại.',
    xp: 70
  },

  // --- THUẬT TOÁN ĐỒ THỊ: DUYỆT DFS, BFS VÀ TÌM ĐƯỜNG ĐI NGẮN NHẤT DIJKSTRA ---
  {
    id: 'ex_dsa_graph_mcq_1',
    type: 'multiple_choice',
    topicId: 'gpa-thuat-toan-do-thi',
    topicTitle: 'Thuật toán đồ thị: Duyệt DFS, BFS và Tìm đường đi ngắn nhất Dijkstra',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Nền tảng',
    question: 'Khi áp dụng thuật toán Dijkstra để tìm đường đi ngắn nhất từ một đỉnh nguồn s đến mọi đỉnh khác trên đồ thị có hướng G = (V, E), điều kiện BẮT BUỘC về trọng số các cạnh là gì?',
    options: [
      'Trọng số của tất cả các cạnh phải KHÔNG ÂM (w(u, v) >= 0)',
      'Đồ thị không được có bất kỳ chu trình nào (DAG)',
      'Trọng số các cạnh phải là số nguyên dương liên tiếp',
      'Đồ thị bắt buộc phải là đồ thị phẳng và liên thông vô hướng'
    ],
    correctAnswer: 0,
    explanation: 'Thuật toán Dijkstra dựa trên tư tưởng Tham lam (Greedy): Một khi đỉnh u có khoảng cách nhỏ nhất được chọn ra từ Heap, khoảng cách dist[u] được coi là đã tối ưu tuyệt đối. Nếu có cạnh âm, giả định này bị phá vỡ hoàn toàn và cần dùng thuật toán Bellman-Ford hoặc SPFA.',
    xp: 25
  },
  {
    id: 'ex_dsa_graph_fill_1',
    type: 'fill_blank',
    topicId: 'gpa-thuat-toan-do-thi',
    topicTitle: 'Thuật toán đồ thị: Duyệt DFS, BFS và Tìm đường đi ngắn nhất Dijkstra',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Vận dụng',
    question: 'Khi cài đặt thuật toán Dijkstra bằng danh sách kề kết hợp Hàng đợi ưu tiên (Min-Heap / std::priority_queue), với V là số đỉnh và E là số cạnh, độ phức tạp thời gian tối ưu là bao nhiêu? (Nhập dạng: O(E log V)):',
    expectedAnswer: 'O(E log V)',
    acceptableAnswers: ['O(E log V)', 'O(ElogV)', 'O((V+E)log V)', 'O((V+E) log V)', 'O(E*logV)', 'E log V'],
    placeholder: 'Ví dụ: O(E log V)',
    hint: 'Mỗi đỉnh được lấy ra tối đa 1 lần, mỗi cạnh thực hiện thao tác giảm khóa hoặc đẩy vào heap tốn O(log V).',
    explanation: 'Với danh sách kề và nhị phân Min-Heap, mỗi thao tác push vào heap tốn O(log V), thực hiện tối đa E lần. Do đó độ phức tạp tối ưu là O((V + E) log V), thường viết rút gọn là O(E log V).',
    xp: 35
  },
  {
    id: 'ex_dsa_graph_trap_1',
    type: 'trap_detect',
    topicId: 'gpa-thuat-toan-do-thi',
    topicTitle: 'Thuật toán đồ thị: Duyệt DFS, BFS và Tìm đường đi ngắn nhất Dijkstra',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Vận dụng cao 9+',
    question: 'BẪY THUẬT TOÁN ĐỒ THỊ KINH ĐIỂN: Đoạn mã C++ tìm đường đi ngắn nhất trên đồ thị KHÔNG TRỌNG SỐ bằng BFS sau đây tiềm ẩn lỗi nghiêm trọng. Hãy phát hiện bước gây bùng nổ bộ nhớ và TLE:',
    steps: [
      {
        stepNum: 1,
        title: 'Khởi tạo hàng đợi và khoảng cách',
        content: 'queue<int> q; q.push(s); dist[s] = 0;',
        isFaulty: false
      },
      {
        stepNum: 2,
        title: 'Đánh dấu đã thăm visited sau khi lấy ra khỏi hàng đợi',
        content: 'while (!q.empty()) { int u = q.front(); q.pop(); visited[u] = true; ... }',
        isFaulty: true,
        faultReason: 'BẪY BFS ĐÁNH DẤU CHẬM! Đánh dấu visited sau khi pop() sẽ khiến một đỉnh bị nhiều đỉnh láng giềng khác nhau đẩy trùng lặp vào hàng đợi nhiều lần trước khi nó được lấy ra! Điều này làm bùng nổ bộ nhớ (MLE) và đưa độ phức tạp từ O(V + E) lên cấp số nhân O(2^V)! Cần phải đánh dấu visited = true NGAY TẠI LÚC PUSH VÀO HÀNG ĐỢI!'
      },
      {
        stepNum: 3,
        title: 'Duyệt các đỉnh láng giềng và cập nhật khoảng cách',
        content: 'for (int v : adj[u]) { if (!visited[v]) { dist[v] = dist[u] + 1; q.push(v); } }',
        isFaulty: false
      }
    ],
    explanation: 'Quy tắc sống còn khi lập trình BFS: Bắt buộc phải đánh dấu visited[v] = true ngay khi gọi q.push(v), tuyệt đối không đợi đến lúc pop() mới đánh dấu.',
    xp: 40
  },
  {
    id: 'ex_dsa_graph_order_1',
    type: 'ordering_steps',
    topicId: 'gpa-thuat-toan-do-thi',
    topicTitle: 'Thuật toán đồ thị: Duyệt DFS, BFS và Tìm đường đi ngắn nhất Dijkstra',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Vận dụng cao 9+',
    question: 'SẮP XẾP 4 BƯỚC CHUẨN THUẬT TOÁN DIJKSTRA: Hãy sắp xếp 4 bước thực thi chuẩn của thuật toán Dijkstra tìm đường đi ngắn nhất từ đỉnh nguồn s:',
    orderingSteps: [
      { id: 'dj1', correctOrder: 1, text: 'Bước 1: Khởi tạo mảng khoảng cách dist[s] = 0, dist[v] = ∞ với mọi v ≠ s; đẩy cặp (0, s) vào Min-Heap priority_queue.' },
      { id: 'dj2', correctOrder: 2, text: 'Bước 2: Lấy đỉnh u có dist[u] nhỏ nhất ra khỏi Min-Heap. Nếu khoảng cách d lấy ra lớn hơn dist[u] hiện tại thì bỏ qua.' },
      { id: 'dj3', correctOrder: 3, text: 'Bước 3: Duyệt từng đỉnh kề v của u: Nếu dist[u] + w(u, v) < dist[v], tiến hành cập nhật khoảng cách tối ưu mới dist[v] = dist[u] + w(u, v).' },
      { id: 'dj4', correctOrder: 4, text: 'Bước 4: Đẩy cặp (dist[v], v) mới được cập nhật vào Min-Heap và ghi nhận mảng truy vết trace[v] = u.' }
    ],
    explanation: 'Quy trình 4 bước chuẩn của Dijkstra đảm bảo các đỉnh được chốt khoảng cách theo thứ tự tăng dần, cho kết quả đường đi ngắn nhất chính xác 100%.',
    xp: 45
  },

  // --- CÂY NHỊ PHÂN TÌM KIẾM (BST) ĐỦ BỘ 4 DẠNG ---
  {
    id: 'ex_dsa_tree_fill_1',
    type: 'fill_blank',
    topicId: 'gpa-cay-nhi-phan-bst',
    topicTitle: 'Cây nhị phân tìm kiếm (Binary Search Tree) & Kỹ thuật duyệt tiền - trung - hậu tự',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Nền tảng',
    question: 'Trong cây nhị phân cân bằng AVL, tại bất kỳ nút nào, độ chênh lệch chiều cao tuyệt đối giữa cây con trái và cây con phải (Hệ số cân bằng Balance Factor) không được vượt quá số mấy? (Nhập số nguyên):',
    expectedAnswer: '1',
    acceptableAnswers: ['1', 'một', 'one'],
    placeholder: 'Nhập số (ví dụ: 1)',
    hint: 'Cây AVL yêu cầu |h_left - h_right| <= 1.',
    explanation: 'Cây AVL duy trì hệ số cân bằng Balance Factor ∈ {-1, 0, 1}. Nếu vượt quá 1, cây sẽ thực hiện phép quay (Rotate) để tái cân bằng về O(log N).',
    xp: 25
  },
  {
    id: 'ex_dsa_tree_trap_1',
    type: 'trap_detect',
    topicId: 'gpa-cay-nhi-phan-bst',
    topicTitle: 'Cây nhị phân tìm kiếm (Binary Search Tree) & Kỹ thuật duyệt tiền - trung - hậu tự',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Vận dụng cao 9+',
    question: 'BẪY XÓA NÚT TRÊN CÂY NHỊ PHÂN BST: Khi xóa một nút X có đầy đủ CẢ HAI CON (Left và Right), một lập trình viên thực hiện các bước sau. Bước nào vi phạm nguyên tắc bất biến của BST?',
    steps: [
      {
        stepNum: 1,
        title: 'Tìm nút thay thế kế vị In-order Successor',
        content: 'Tìm nút nhỏ nhất trên cây con bên phải (Right Subtree) của X, gọi là S.',
        isFaulty: false
      },
      {
        stepNum: 2,
        title: 'Xóa ngay liên kết của nút X khỏi cây',
        content: 'Ngắt con trỏ của nút cha trỏ tới X và delete X ngay trước khi sao chép dữ liệu của S.',
        isFaulty: true,
        faultReason: 'BẪY MẤT DỮ LIỆU CÂY! Nếu xóa nút X trước khi sao chép giá trị của nút thay thế S, cấu trúc hai cây con bên dưới sẽ bị đứt gãy hoàn toàn. Thứ tự chuẩn là: Sao chép giá trị của S vào X, sau đó mới gọi đệ quy xóa nút lá S!'
      },
      {
        stepNum: 3,
        title: 'Thu hồi bộ nhớ của nút thế mạng',
        content: 'Giải phóng vùng nhớ của nút S và cập nhật lại liên kết cha của S.',
        isFaulty: false
      }
    ],
    explanation: 'Khi xóa nút có 2 con, ta không xóa trực tiếp nút đó mà tìm phần tử nhỏ nhất bên phải (hoặc lớn nhất bên trái) để copy giá trị, rồi xóa nút lá đó.',
    xp: 40
  },
  {
    id: 'ex_dsa_tree_order_1',
    type: 'ordering_steps',
    topicId: 'gpa-cay-nhi-phan-bst',
    topicTitle: 'Cây nhị phân tìm kiếm (Binary Search Tree) & Kỹ thuật duyệt tiền - trung - hậu tự',
    subject: 'Cấu trúc dữ liệu & Giải thuật',
    difficulty: 'Vận dụng',
    question: 'SẮP XẾP QUY TRÌNH CHÈN NÚT (INSERT) VÀO CÂY BST: Sắp xếp 4 bước chuẩn để chèn khóa key mới vào cây BST:',
    orderingSteps: [
      { id: 'bt1', correctOrder: 1, text: 'Bước 1: Nếu cây rỗng (root == nullptr), cấp phát nút mới chứa key và gán làm gốc cây.' },
      { id: 'bt2', correctOrder: 2, text: 'Bước 2: So sánh key với khóa của nút hiện tại: Nếu key < curr->key, di chuyển rẽ sang cây con trái.' },
      { id: 'bt3', correctOrder: 3, text: 'Bước 3: Nếu key > curr->key, di chuyển rẽ sang nhánh cây con bên phải.' },
      { id: 'bt4', correctOrder: 4, text: 'Bước 4: Khi gặp vị trí con trỏ nullptr, tạo nút mới và móc liên kết vào nút cha tương ứng.' }
    ],
    explanation: 'Quy trình chèn trên BST luôn duy trì bất biến: mọi nút bên trái nhỏ hơn nút hiện tại và mọi nút bên phải lớn hơn nút hiện tại.',
    xp: 35
  },

  // --- LƯỢNG GIÁC: 10 CÔNG THỨC & CUNG LIÊN KẾT ---
  {
    id: 'ex_trig_mcq_1',
    type: 'multiple_choice',
    topicId: 'goc-10-cong-thuc-luong-giac',
    topicTitle: '10 công thức biến đổi lượng giác cơ bản & Cung liên kết không được nhầm',
    subject: 'Toán học',
    difficulty: 'Nền tảng',
    question: 'Công thức hạ bậc nào sau đây đối với hàm cos²(x) là HOÀN TOÀN ĐÚNG?',
    options: [
      'cos²(x) = (1 + cos 2x) / 2',
      'cos²(x) = (1 - cos 2x) / 2',
      'cos²(x) = (1 + sin 2x) / 2',
      'cos²(x) = 1 - 2 sin²(2x)'
    ],
    correctAnswer: 0,
    explanation: 'Từ công thức nhân đôi cos 2x = 2cos²x - 1, ta suy ra công thức hạ bậc: cos²x = (1 + cos 2x) / 2. Đối với sin²x thì là (1 - cos 2x) / 2.',
    xp: 20
  },
  {
    id: 'ex_trig_fill_1',
    type: 'fill_blank',
    topicId: 'goc-10-cong-thuc-luong-giac',
    topicTitle: '10 công thức biến đổi lượng giác cơ bản & Cung liên kết không được nhầm',
    subject: 'Toán học',
    difficulty: 'Nền tảng',
    question: 'Hằng đẳng thức lượng giác cơ bản: Với mọi góc x, giá trị của biểu thức sin²(x) + cos²(x) luôn bằng bao nhiêu? (Nhập số):',
    expectedAnswer: '1',
    acceptableAnswers: ['1', 'một'],
    placeholder: 'Nhập số',
    hint: 'Định lý Pytago trên đường tròn lượng giác bán kính R = 1.',
    explanation: 'sin²(x) + cos²(x) = 1 là hằng đẳng thức lượng giác nền tảng quan trọng nhất.',
    xp: 15
  },
  {
    id: 'ex_trig_trap_1',
    type: 'trap_detect',
    topicId: 'goc-10-cong-thuc-luong-giac',
    topicTitle: '10 công thức biến đổi lượng giác cơ bản & Cung liên kết không được nhầm',
    subject: 'Toán học',
    difficulty: 'Vận dụng',
    question: 'BẪY DẤU CUNG LIÊN KẾT (Cos đối, Sin bù, Phụ chéo, Hơn kém pi Tan): Hãy tìm bước biến đổi SAI LẦM về dấu sau đây:',
    steps: [
      {
        stepNum: 1,
        title: 'Cung đối: cos(-x) = cos(x)',
        content: 'cos(-x) = cos(x) và sin(-x) = -sin(x)',
        isFaulty: false
      },
      {
        stepNum: 2,
        title: 'Cung bù: x và π - x',
        content: 'sin(π - x) = sin(x) và cos(π - x) = cos(x)',
        isFaulty: true,
        faultReason: 'BẪY DẤU CUNG BÙ! "Sin bù" nghĩa là CHỈ CÓ SIN giữ nguyên dấu: sin(π - x) = sin(x), còn cos(π - x) phải đổi dấu thành -cos(x)!'
      },
      {
        stepNum: 3,
        title: 'Cung phụ: x và π/2 - x',
        content: 'sin(π/2 - x) = cos(x) và cos(π/2 - x) = sin(x)',
        isFaulty: false
      }
    ],
    explanation: 'Câu thần chú "Cos đối, Sin bù, Phụ chéo, Khác pi Tan" chỉ ra đại lượng GIỮ DẤU DƯƠNG. Với cung bù (π - x), chỉ sin giữ dấu, các hàm cos, tan, cot đều đổi thành dấu âm.',
    xp: 30
  },
  {
    id: 'ex_trig_order_1',
    type: 'ordering_steps',
    topicId: 'goc-10-cong-thuc-luong-giac',
    topicTitle: '10 công thức biến đổi lượng giác cơ bản & Cung liên kết không được nhầm',
    subject: 'Toán học',
    difficulty: 'Vận dụng',
    question: 'SẮP XẾP QUY TRÌNH RÚT GỌN BIỂU THỨC LƯỢNG GIÁC: Sắp xếp 4 bước tư duy chuẩn để rút gọn A = sin(x) + sin(3x) + sin(5x):',
    orderingSteps: [
      { id: 'tg1', correctOrder: 1, text: 'Bước 1: Ghép cặp hai góc đối xứng có tổng chẵn: [sin(x) + sin(5x)] + sin(3x).' },
      { id: 'tg2', correctOrder: 2, text: 'Bước 2: Áp dụng công thức biến đổi tổng thành tích: sin a + sin b = 2 sin((a+b)/2) cos((a-b)/2).' },
      { id: 'tg3', correctOrder: 3, text: 'Bước 3: Thu được 2 sin(3x) cos(2x) + sin(3x), nhận thấy nhân tử chung là sin(3x).' },
      { id: 'tg4', correctOrder: 4, text: 'Bước 4: Đặt nhân tử chung đưa về tích tối giản: sin(3x) · [2 cos(2x) + 1].' }
    ],
    explanation: 'Kỹ thuật ghép góc đối xứng (min + max) là chìa khóa xử lý các bài toán tổng chuỗi lượng giác trong đề thi.',
    xp: 35
  },

  // --- ĐẠO HÀM HÀM HỢP U(X) ---
  {
    id: 'ex_deriv_mcq_1',
    type: 'multiple_choice',
    topicId: 'goc-dao-ham-ham-hop',
    topicTitle: 'Quy tắc tính đạo hàm cơ bản và đạo hàm hàm hợp u(x)',
    subject: 'Toán học',
    difficulty: 'Nền tảng',
    question: 'Cho hàm số hợp y = f(u) với u = u(x). Quy tắc tính đạo hàm của hàm hợp y\'_x theo biến x là:',
    options: [
      "y' = u'(x) · f'(u)",
      "y' = f'(u) / u'(x)",
      "y' = f'(x) · u'(x)",
      "y' = f'(u(x))"
    ],
    correctAnswer: 0,
    explanation: 'Đạo hàm của hàm hợp luôn bằng đạo hàm của hàm ngoài f\'(u) nhân với đạo hàm của hàm trong u\'(x): [f(u)]\' = u\' · f\'(u).',
    xp: 20
  },
  {
    id: 'ex_deriv_fill_1',
    type: 'fill_blank',
    topicId: 'goc-dao-ham-ham-hop',
    topicTitle: 'Quy tắc tính đạo hàm cơ bản và đạo hàm hàm hợp u(x)',
    subject: 'Toán học',
    difficulty: 'Vận dụng',
    question: "Cho hàm số y = (2x + 1)³. Đạo hàm y' tại điểm x = 1 có giá trị bằng bao nhiêu? (Nhập số nguyên):",
    expectedAnswer: '54',
    acceptableAnswers: ['54'],
    placeholder: 'Nhập giá trị y\'(1)',
    hint: "Áp dụng công thức [u^n]' = n · u^(n-1) · u'. Với u = 2x+1 => u' = 2.",
    explanation: "y' = 3 · (2x + 1)² · (2x + 1)' = 3 · (2x + 1)² · 2 = 6(2x + 1)². Tại x = 1: y'(1) = 6 · 3² = 54.",
    xp: 25
  },
  {
    id: 'ex_deriv_trap_1',
    type: 'trap_detect',
    topicId: 'goc-dao-ham-ham-hop',
    topicTitle: 'Quy tắc tính đạo hàm cơ bản và đạo hàm hàm hợp u(x)',
    subject: 'Toán học',
    difficulty: 'Vận dụng cao 9+',
    question: "BẪY TÍNH ĐẠO HÀM CĂN THỨC: Một học sinh tính đạo hàm của hàm số y = √(x² - 4x + 5) qua các bước sau. Bước nào chứa lỗi sai kinh điển?",
    steps: [
      {
        stepNum: 1,
        title: 'Nhận diện hàm hợp căn bậc hai',
        content: 'Đặt u(x) = x² - 4x + 5. Hàm có dạng y = √u.',
        isFaulty: false
      },
      {
        stepNum: 2,
        title: 'Áp dụng công thức đạo hàm [√u]\'',
        content: "Học sinh ghi công thức: y' = 1 / (2√(x² - 4x + 5))",
        isFaulty: true,
        faultReason: "BẪY QUÊN NHÂN U'(X)! Công thức [√x]' = 1/(2√x) chỉ áp dụng cho biến x đơn. Đối với hàm hợp u(x), công thức bắt buộc là [√u]' = u' / (2√u) = (2x - 4) / (2√(x² - 4x + 5)) = (x - 2) / √(x² - 4x + 5)!"
      },
      {
        stepNum: 3,
        title: 'Rút gọn biểu thức phân thức',
        content: 'Thay giá trị x vào phân số để tìm hệ số góc tiếp tuyến.',
        isFaulty: false
      }
    ],
    explanation: 'Quên nhân u\'(x) khi tính đạo hàm hàm hợp căn thức và hàm lũy thừa là lỗi mất điểm phổ biến nhất trong đề thi tốt nghiệp THPT.',
    xp: 35
  },
  {
    id: 'ex_deriv_order_1',
    type: 'ordering_steps',
    topicId: 'goc-dao-ham-ham-hop',
    topicTitle: 'Quy tắc tính đạo hàm cơ bản và đạo hàm hàm hợp u(x)',
    subject: 'Toán học',
    difficulty: 'Vận dụng',
    question: "SẮP XẾP QUY TRÌNH TÍNH ĐẠO HÀM HÀM HỢP: Hãy sắp xếp 4 bước chuẩn để tính đạo hàm của y = ln(cos 2x):",
    orderingSteps: [
      { id: 'dh1', correctOrder: 1, text: 'Bước 1: Xác định hàm lõi trong cùng u(x) = cos(2x) và v(x) = 2x.' },
      { id: 'dh2', correctOrder: 2, text: "Bước 2: Áp dụng công thức đạo hàm hàm ln(u): [ln(u)]' = u' / u." },
      { id: 'dh3', correctOrder: 3, text: "Bước 3: Tính đạo hàm của hàm trong: [cos(2x)]' = -(2x)' · sin(2x) = -2 sin(2x)." },
      { id: 'dh4', correctOrder: 4, text: "Bước 4: Ghép lại biểu thức và rút gọn: y' = -2 sin(2x) / cos(2x) = -2 tan(2x)." }
    ],
    explanation: 'Quy trình bóc tách từng lớp từ ngoài vào trong đảm bảo không bao giờ bị sót đạo hàm các hàm hợp con.',
    xp: 35
  },

  // --- CASIO 580VN X ---
  {
    id: 'ex_casio_mcq_1',
    type: 'multiple_choice',
    topicId: 'goc-casio-580vnx',
    topicTitle: '12 Thủ thuật bấm máy tính Casio giải nhanh phương trình, tích phân và số phức',
    subject: 'Kỹ năng Máy tính Casio',
    difficulty: 'Nền tảng',
    question: 'Khi sử dụng tính năng TABLE (MENU 8) trên máy tính Casio fx-580VN X để tìm Min/Max của hàm số f(x) trên đoạn [a; b], cài đặt bước nhảy (Step) tối ưu nhất là:',
    options: [
      'Step = (b - a) / 29 (hoặc (b - a) / 44 khi tắt bảng g(x))',
      'Step = 1 với mọi bài toán',
      'Step = (b - a) · 10',
      'Step = b - a'
    ],
    correctAnswer: 0,
    explanation: 'Máy tính Casio fx-580VN X hỗ trợ tối đa 30 đến 45 dòng dữ liệu. Chọn Step = (b - a) / 29 (hoặc chia 44 khi tắt hàm g(x)) giúp quét trọn vẹn đoạn [a; b] với mật độ điểm dày đặc nhất, tránh bỏ sót điểm cực trị.',
    xp: 25
  },
  {
    id: 'ex_casio_fill_1',
    type: 'fill_blank',
    topicId: 'goc-casio-580vnx',
    topicTitle: '12 Thủ thuật bấm máy tính Casio giải nhanh phương trình, tích phân và số phức',
    subject: 'Kỹ năng Máy tính Casio',
    difficulty: 'Nền tảng',
    question: 'Trên máy tính Casio fx-580VN X, tổ hợp phím MENU kèm phím số mấy để mở chế độ Giải Phương trình và Hệ phương trình? (Nhập số):',
    expectedAnswer: '9',
    acceptableAnswers: ['9', 'MENU 9', 'Menu 9'],
    placeholder: 'Nhập số phím',
    hint: 'Bấm MENU rồi bấm phím số 9 (Equation / Func).',
    explanation: 'MENU 9 là chế độ giải phương trình bậc 2, 3, 4 và hệ phương trình từ 2 đến 4 ẩn trên Casio fx-580VN X.',
    xp: 20
  },
  {
    id: 'ex_casio_trap_1',
    type: 'trap_detect',
    topicId: 'goc-casio-580vnx',
    topicTitle: '12 Thủ thuật bấm máy tính Casio giải nhanh phương trình, tích phân và số phức',
    subject: 'Kỹ năng Máy tính Casio',
    difficulty: 'Vận dụng',
    question: 'BẪY BẤM MÁY TÍNH TÍCH PHÂN LƯỢNG GIÁC: Khi bấm tích phân I = ∫[0→π/2] x·sin(x) dx trên máy Casio, học sinh bấm ra kết quả sai lệch hoàn toàn. Nguyên nhân là gì?',
    steps: [
      {
        stepNum: 1,
        title: 'Nhập biểu thức tích phân vào máy',
        content: 'Nhập dấu tích phân: ∫(X · sin(X), 0, π/2)',
        isFaulty: false
      },
      {
        stepNum: 2,
        title: 'Cài đặt đơn vị góc trên máy tính',
        content: 'Máy tính đang để ở chế độ hiển thị chữ D (Degree - Độ) trên màn hình.',
        isFaulty: true,
        faultReason: 'BẪY ĐƠN VỊ ĐỘ/RADIAN! Cận tích phân chứa số π (từ 0 đến π/2), bắt buộc máy tính phải ở chế độ Radian (chữ R). Nếu để chữ D, máy tính sẽ hiểu là từ 0 đến (π/2) độ (~1.57 độ), cho kết quả sai hoàn toàn!'
      },
      {
        stepNum: 3,
        title: 'Bấm dấu = để nhận kết quả',
        content: 'Máy hiển thị kết quả phân số hoặc số thập phân.',
        isFaulty: false
      }
    ],
    explanation: 'Quy tắc vàng khi tính toán giải tích lượng giác trên Casio: Luôn kiểm tra chữ R trên màn hình bằng cách bấm SHIFT MENU 2 2 (Radian).',
    xp: 35
  },
  {
    id: 'ex_casio_order_1',
    type: 'ordering_steps',
    topicId: 'goc-casio-580vnx',
    topicTitle: '12 Thủ thuật bấm máy tính Casio giải nhanh phương trình, tích phân và số phức',
    subject: 'Kỹ năng Máy tính Casio',
    difficulty: 'Vận dụng',
    question: 'SẮP XẾP QUY TRÌNH TÌM TIỆM CẬN ĐỨNG BẰNG LỆNH CALC: Sắp xếp 4 bước chuẩn để kiểm tra x = x₀ có là tiệm cận đứng của hàm y = f(x):',
    orderingSteps: [
      { id: 'cs1', correctOrder: 1, text: 'Bước 1: Nhập biểu thức f(x) vào màn hình chính của máy tính Casio fx-580VN X.' },
      { id: 'cs2', correctOrder: 2, text: 'Bước 2: Bấm phím CALC, máy hỏi X? ta nhập x₀ + 10⁻⁸ (để kiểm tra giới hạn bên phải lim x→x₀⁺).' },
      { id: 'cs3', correctOrder: 3, text: 'Bước 3: Quan sát kết quả hiển thị: Nếu ra một số rất lớn (dạng > 10⁶ hoặc -10⁶), hàm số tiến tới ±∞.' },
      { id: 'cs4', correctOrder: 4, text: 'Bước 4: Kết luận x = x₀ là đường tiệm cận đứng của đồ thị hàm số.' }
    ],
    explanation: 'Thủ thuật CALC x₀ ± 10⁻⁸ giúp xác định giới hạn một bên cực nhanh trong vòng 10 giây mà không cần biến đổi đại số.',
    xp: 35
  }
];

// Smart dynamic generator for any custom roadmap topic to ensure 4 tailored, authentic exercises
function generateDynamicExercises(topicTitle: string, subject: string): Exercise[] {
  const hash = Math.abs(topicTitle.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0)).toString(36);
  const lower = topicTitle.toLowerCase();

  // 1. CHỦ ĐỀ CÔNG NGHỆ THÔNG TIN & THUẬT TOÁN
  if (lower.includes('thuật toán') || lower.includes('đồ thị') || lower.includes('dijkstra') || lower.includes('quy hoạch động') || lower.includes('mã') || lower.includes('code') || lower.includes('python') || lower.includes('c++')) {
    return [
      {
        id: `dyn_it_mcq_${hash}`,
        type: 'multiple_choice',
        topicId: `topic_${hash}`,
        topicTitle,
        subject,
        difficulty: 'Nền tảng',
        question: `Trong chuyên đề "${topicTitle}", yếu tố nào quyết định tính hiệu quả và tối ưu của giải thuật khi kích thước dữ liệu N tăng lên vô cùng lớn?`,
        options: [
          'Độ phức tạp thời gian Big-O (Time Complexity) và không gian bộ nhớ (Space Complexity)',
          'Độ dài số dòng mã nguồn (Lines of Code) của chương trình',
          'Tốc độ gõ phím của lập trình viên',
          'Số lượng biến số toàn cục khai báo trong chương trình'
        ],
        correctAnswer: 0,
        explanation: `Độ phức tạp thuật toán Big-O phản ánh tốc độ tăng trưởng thời gian chạy và bộ nhớ, là tiêu chuẩn tối cao để đánh giá giải thuật trong ${topicTitle}.`,
        xp: 25
      },
      {
        id: `dyn_it_fill_${hash}`,
        type: 'fill_blank',
        topicId: `topic_${hash}`,
        topicTitle,
        subject,
        difficulty: 'Vận dụng',
        question: `Để tránh lỗi lặp vô hạn (Infinite Loop) trong giải thuật của chuyên đề "${topicTitle}", điều kiện nào trong cấu trúc lặp/đệ quy bắt buộc phải được thỏa mãn? (Nhập: "điều kiện dừng" hoặc "base case"):`,
        expectedAnswer: 'điều kiện dừng',
        acceptableAnswers: ['điều kiện dừng', 'dieu kien dung', 'base case', 'điểm dừng'],
        placeholder: 'Ví dụ: điều kiện dừng',
        hint: 'Điểm dừng đệ quy hoặc điều kiện thoát vòng lặp.',
        explanation: 'Mọi thuật toán đệ quy hoặc vòng lặp đều cần điều kiện dừng (Base Case) để kết thúc và trả về kết quả.',
        xp: 30
      },
      {
        id: `dyn_it_trap_${hash}`,
        type: 'trap_detect',
        topicId: `topic_${hash}`,
        topicTitle,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: `BẪY THỰC THI THUẬT TOÁN: Khi triển khai giải thuật thuộc "${topicTitle}", lập trình viên gặp lỗi sai. Đâu là bước tiềm ẩn nguy cơ tràn bộ nhớ hoặc TLE?`,
        steps: [
          {
            stepNum: 1,
            title: 'Khởi tạo cấu trúc dữ liệu lưu trữ',
            content: 'Cấp phát mảng hoặc danh sách kề để ánh xạ các phần tử của bài toán.',
            isFaulty: false
          },
          {
            stepNum: 2,
            title: 'Thực thi vòng lặp duyệt không kiểm soát trạng thái lặp',
            content: 'Không đánh dấu các trạng thái/nút đã ghé thăm hoặc tính toán lại các bài toán con trùng lặp.',
            isFaulty: true,
            faultReason: 'BẪY TRÙNG LẶP TRẠNG THÁI! Việc không lưu vết (Memoization/Visited) khiến thuật toán duyệt đi duyệt lại cùng một trạng thái, đẩy độ phức tạp lên cấp số nhân O(2^N) gây lỗi Time Limit Exceeded (TLE) hoặc tràn ngăn xếp đệ quy (Stack Overflow)!'
          },
          {
            stepNum: 3,
            title: 'Truy vết và xuất kết quả',
            content: 'Xuất ra giá trị tối ưu hoặc đường đi theo yêu cầu.',
            isFaulty: false
          }
        ],
        explanation: 'Lưu vết trạng thái đã xử lý là nguyên tắc sống còn trong các thuật toán duyệt và tối ưu hóa.',
        xp: 40
      },
      {
        id: `dyn_it_order_${hash}`,
        type: 'ordering_steps',
        topicId: `topic_${hash}`,
        topicTitle,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: `SẮP XẾP QUY TRÌNH THỰC THI TỐI ƯU CHO "${topicTitle}": Hãy sắp xếp 4 bước chuẩn để giải quyết bài toán thuật toán này:`,
        orderingSteps: [
          { id: `ito_${hash}_1`, correctOrder: 1, text: 'Bước 1: Đọc đề, xác định rõ ràng giới hạn kích thước dữ liệu N và cấu trúc đầu vào/đầu ra.' },
          { id: `ito_${hash}_2`, correctOrder: 2, text: 'Bước 2: Lựa chọn cấu trúc dữ liệu tối ưu và thiết kế giải thuật thỏa mãn giới hạn thời gian (dưới 1 giây).' },
          { id: `ito_${hash}_3`, correctOrder: 3, text: 'Bước 3: Cài đặt mã nguồn, chú ý kiểm soát các trường hợp biên đặc biệt (N = 0, 1 hoặc số âm).' },
          { id: `ito_${hash}_4`, correctOrder: 4, text: 'Bước 4: Kiểm thử với các bộ dữ liệu mẫu lớn và biên để tối ưu hóa thời gian chạy.' }
        ],
        explanation: 'Quy trình 4 bước giúp đảm bảo mã nguồn đạt điểm tuyệt đối 100/100 trên hệ thống chấm tự động.',
        xp: 40
      }
    ];
  }

  // 2. CHỦ ĐỀ TOÁN HỌC & TƯ DUY ĐỊNH LƯỢNG
  return [
    {
      id: `dyn_mcq_${hash}_1`,
      type: 'multiple_choice',
      topicId: `topic_${hash}`,
      topicTitle,
      subject,
      difficulty: 'Nền tảng',
      question: `Trong chuyên đề "${topicTitle}", nhận định nào sau đây là NGUYÊN TẮC CỐT LÕI đúng đắn nhất?`,
      options: [
        `Luôn nắm chắc định nghĩa, điều kiện áp dụng trước khi triển khai các bước biến đổi`,
        `Chỉ cần học thuộc các công thức cuối cùng mà không cần hiểu bản chất suy luận`,
        `Bỏ qua các trường hợp ngoại lệ và điều kiện biên để tăng tốc độ làm bài`,
        `Phương pháp này chỉ áp dụng được cho duy nhất một bài toán số liệu cố định`
      ],
      correctAnswer: 0,
      explanation: `Đối với chuyên đề "${topicTitle}", việc nắm vững bản chất lý thuyết và điều kiện biên là chìa khóa để giải quyết mọi biến thể câu hỏi trong đề thi.`,
      xp: 25
    },
    {
      id: `dyn_fill_${hash}_2`,
      type: 'fill_blank',
      topicId: `topic_${hash}`,
      topicTitle,
      subject,
      difficulty: 'Vận dụng',
      question: `Thuật ngữ / Khái niệm then chốt trong chuyên đề "${topicTitle}" quyết định tính đúng đắn của lời giải là gì? (Nhập: "chính xác"):`,
      expectedAnswer: 'chính xác',
      acceptableAnswers: ['chính xác', 'chinh xac', 'chuẩn xác', 'đúng đắn', 'tối ưu'],
      placeholder: 'Ví dụ: chính xác',
      hint: 'Mọi thuật toán và phương pháp giải đều hướng tới kết quả chính xác và tối ưu.',
      explanation: `Độ chính xác và tính tối ưu là tiêu chuẩn đánh giá cao nhất trong chuyên đề ${topicTitle}.`,
      xp: 30
    },
    {
      id: `dyn_trap_${hash}_3`,
      type: 'trap_detect',
      topicId: `topic_${hash}`,
      topicTitle,
      subject,
      difficulty: 'Vận dụng cao 9+',
      question: `BẪY THƯỜNG GẶP TRONG ĐỀ THI: Khi giải quyết bài toán thuộc "${topicTitle}", một bạn học sinh thực hiện các bước sau. Bước nào tiềm ẩn lỗi sai lớn nhất?`,
      steps: [
        {
          stepNum: 1,
          title: 'Đọc kỹ đề và xác định giả thiết',
          content: 'Phân tích các dữ kiện cho trước, thiết lập điều kiện ban đầu của bài toán.',
          isFaulty: false
        },
        {
          stepNum: 2,
          title: 'Bỏ qua điều kiện xác định và miền giá trị biên',
          content: 'Tiến hành biến đổi/tính toán ngay lập tức mà không kiểm tra điều kiện tồn tại.',
          isFaulty: true,
          faultReason: 'BẪY QUÊN ĐIỀU KIỆN! Việc bỏ qua điều kiện xác định hoặc miền biên sẽ dẫn đến nhận nghiệm ngoại lai hoặc lỗi thuật toán khi xử lý dữ liệu đặc biệt.'
        },
        {
          stepNum: 3,
          title: 'Tổng hợp kết quả và kết luận',
          content: 'Đối chiếu với các điều kiện đề bài để đưa ra đáp số cuối cùng.',
          isFaulty: false
        }
      ],
      explanation: `Lỗi sai phổ biến nhất của học sinh trong ${topicTitle} là quên kiểm tra điều kiện xác định và điều kiện biên.`,
      xp: 35
    },
    {
      id: `dyn_order_${hash}_4`,
      type: 'ordering_steps',
      topicId: `topic_${hash}`,
      topicTitle,
      subject,
      difficulty: 'Vận dụng cao 9+',
      question: `QUY TRÌNH CHUẨN TƯ DUY: Hãy sắp xếp 4 bước tư duy chuẩn mực để giải quyết triệt để chuyên đề "${topicTitle}":`,
      orderingSteps: [
        { id: `ord_${hash}_1`, correctOrder: 1, text: `Bước 1: Phân tích bài toán, xác định rõ yêu cầu trọng tâm và các ràng buộc dữ liệu.` },
        { id: `ord_${hash}_2`, correctOrder: 2, text: `Bước 2: Lựa chọn công thức / giải thuật tối ưu phù hợp với tính chất của bài toán.` },
        { id: `ord_${hash}_3`, correctOrder: 3, text: `Bước 3: Thực hiện tính toán từng bước, chú ý kiểm soát các bẫy đề thi và tính toán đại số.` },
        { id: `ord_${hash}_4`, correctOrder: 4, text: `Bước 4: Kiểm tra lại nghiệm / tính đúng đắn với các trường hợp đặc biệt và đưa ra kết luận.` }
      ],
      explanation: `Quy trình 4 bước giúp giải quyết mọi bài toán phức tạp một cách có hệ thống và hạn chế tối đa sai sót.`,
      xp: 40
    }
  ];
}

class StudySyncService {
  private navigationIntent: StudyNavigationIntent | null = null;

  setNavigationIntent(intent: StudyNavigationIntent) {
    this.navigationIntent = intent;
  }

  getNavigationIntent(): StudyNavigationIntent | null {
    return this.navigationIntent;
  }

  clearNavigationIntent() {
    this.navigationIntent = null;
  }

  // Unlock a specific milestone directly (không bị cứng)
  unlockMilestone(milestoneId: string, customTopic?: string, customSubject?: string): boolean {
    try {
      const u = api.getUser();
      const rm: RoadmapData | null = api.getUserRoadmap(u?.id);
      if (!rm || !rm.milestones) return false;

      const targetIdx = rm.milestones.findIndex(m => m.id === milestoneId);
      if (targetIdx === -1) return false;

      const targetMs = rm.milestones[targetIdx];
      targetMs.status = 'active';

      // Also ensure its stage is active
      if (targetMs.stageId && rm.stages) {
        const stage = rm.stages.find(s => s.id === targetMs.stageId);
        if (stage && stage.status !== 'done') {
          stage.status = 'active';
        }
      }

      api.saveUserRoadmap(rm, u?.id);

      this.activeContext = {
        ...this.activeContext,
        topicTitle: customTopic || targetMs.title,
        subject: customSubject || targetMs.subject,
        milestoneId: targetMs.id,
        completedExercisesCount: 0,
        totalExercisesCount: 4,
        isDiagnosticChallenge: false
      };

      try {
        localStorage.setItem(this.getContextKey(), JSON.stringify(this.activeContext));
      } catch {}

      this.notify();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('eduadvisor_milestone_unlocked', { detail: targetMs }));
        window.dispatchEvent(new CustomEvent('eduadvisor_roadmap_updated', { detail: rm }));
      }
      return true;
    } catch (err) {
      console.error('Error unlocking milestone:', err);
      return false;
    }
  }

  // Unlock an entire stage
  unlockStage(stageId: number): boolean {
    try {
      const u = api.getUser();
      const rm: RoadmapData | null = api.getUserRoadmap(u?.id);
      if (!rm || !rm.stages) return false;

      const stage = rm.stages.find(s => s.id === stageId);
      if (!stage) return false;

      stage.status = 'active';
      if (stage.diagnosticChallenge) {
        stage.diagnosticChallenge.isUnlocked = true;
      }

      // Unlock first milestone in this stage
      const stageMilestones = rm.milestones.filter(m => m.stageId === stageId);
      if (stageMilestones.length > 0) {
        stageMilestones[0].status = 'active';
        this.activeContext = {
          ...this.activeContext,
          topicTitle: stageMilestones[0].title,
          subject: stageMilestones[0].subject,
          milestoneId: stageMilestones[0].id,
          completedExercisesCount: 0,
          totalExercisesCount: 4,
          isDiagnosticChallenge: false
        };
        try {
          localStorage.setItem(this.getContextKey(), JSON.stringify(this.activeContext));
        } catch {}
      }

      api.saveUserRoadmap(rm, u?.id);
      this.notify();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('eduadvisor_stage_unlocked', { detail: stage }));
        window.dispatchEvent(new CustomEvent('eduadvisor_roadmap_updated', { detail: rm }));
      }
      return true;
    } catch (err) {
      console.error('Error unlocking stage:', err);
      return false;
    }
  }

  // Complete end-of-stage diagnostic challenge: marks stage as completed & unlocks next stage!
  passStageDiagnostic(stageId: number, xp: number = 60): boolean {
    try {
      const u = api.getUser();
      const rm: RoadmapData | null = api.getUserRoadmap(u?.id);
      if (!rm || !rm.stages) return false;

      const stage = rm.stages.find(s => s.id === stageId);
      if (!stage) return false;

      stage.status = 'done';
      stage.progress = '100%';
      if (stage.diagnosticChallenge) {
        stage.diagnosticChallenge.isPassed = true;
        stage.diagnosticChallenge.isUnlocked = true;
      }

      // Automatically unlock NEXT stage
      const nextStage = rm.stages.find(s => s.id === stageId + 1);
      if (nextStage) {
        nextStage.status = 'active';
        if (nextStage.diagnosticChallenge) {
          nextStage.diagnosticChallenge.isUnlocked = true;
        }
        // Unlock first milestone in next stage
        const nextMilestones = rm.milestones.filter(m => m.stageId === stageId + 1);
        if (nextMilestones.length > 0) {
          nextMilestones[0].status = 'active';
          this.activeContext = {
            ...this.activeContext,
            topicTitle: nextMilestones[0].title,
            subject: nextMilestones[0].subject,
            milestoneId: nextMilestones[0].id,
            completedExercisesCount: 0,
            totalExercisesCount: 4,
            isDiagnosticChallenge: false
          };
          try {
            localStorage.setItem(this.getContextKey(), JSON.stringify(this.activeContext));
          } catch {}
        }
      }

      const doneStages = rm.stages.filter(s => s.status === 'done').length;
      rm.totalProgress = Math.min(100, Math.round((doneStages / rm.stages.length) * 100));

      api.saveUserRoadmap(rm, u?.id);
      this.notify();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('eduadvisor_stage_diagnostic_passed', { detail: { stage, nextStage, xp } }));
        window.dispatchEvent(new CustomEvent('eduadvisor_roadmap_updated', { detail: rm }));
      }
      return true;
    } catch (err) {
      console.error('Error passing stage diagnostic:', err);
      return false;
    }
  }

  private activeContext: ActiveStudyContext = {
    topicTitle: 'Tích phân hàm ẩn & Kỹ thuật biến đổi đối xứng',
    subject: 'Toán học (Đại số & Giải tích)',
    milestoneId: 'm1',
    goalId: 'THPT_QG',
    goalName: 'THPT Quốc Gia Khối A00',
    targetScore: '27.5+',
    currentLevel: 'Khá (7 - 8.5 điểm)',
    daysLeft: 88,
    completedExercisesCount: 0,
    totalExercisesCount: 4,
    completedExercises: [],
    streakDays: 7
  };

  private completedExerciseIds: Set<string> = new Set();
  private listeners: Array<(ctx: ActiveStudyContext) => void> = [];

  constructor() {
    this.initFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('eduadvisor_user_updated', (e: any) => {
        this.initFromStorage(e.detail?.id);
        this.notify();
      });
    }
  }

  private getUserId(userId?: string): string {
    if (userId) return userId;
    const u = api.getUser();
    return u?.id || 'guest';
  }

  private getContextKey(userId?: string): string {
    return `eduadvisor_${this.getUserId(userId)}_active_study_context`;
  }

  private getCompletedKey(userId?: string): string {
    return `eduadvisor_${this.getUserId(userId)}_completed_exercises`;
  }

  private initFromStorage(userId?: string) {
    const uid = this.getUserId(userId);
    try {
      // 1. Load completed exercises strictly for THIS user (starts empty for new accounts!)
      const savedCompleted = localStorage.getItem(this.getCompletedKey(uid));
      if (savedCompleted) {
        this.completedExerciseIds = new Set(JSON.parse(savedCompleted));
      } else {
        this.completedExerciseIds = new Set();
      }

      // 2. Load active study context strictly for THIS user
      const savedCtx = localStorage.getItem(this.getContextKey(uid));
      if (savedCtx) {
        this.activeContext = { ...this.activeContext, ...JSON.parse(savedCtx) };
      } else {
        // Fallback: check this user's roadmap
        const userRoadmap = api.getUserRoadmap(uid);
        if (userRoadmap && userRoadmap.milestones && userRoadmap.milestones.length > 0) {
          const activeMs = userRoadmap.milestones.find(m => m.status === 'active') || userRoadmap.milestones[0];
          this.activeContext = {
            topicTitle: activeMs.title,
            subject: activeMs.subject || 'Lộ trình học tập',
            milestoneId: activeMs.id,
            goalId: userRoadmap.targetExam || 'THPT_QG',
            goalName: userRoadmap.title || 'Lộ trình cá nhân hóa',
            targetScore: userRoadmap.targetScore || '8.5+',
            currentLevel: userRoadmap.currentLevel || 'Khá',
            daysLeft: userRoadmap.daysLeft || 88,
            completedExercisesCount: 0,
            totalExercisesCount: 4,
            completedExercises: [],
            streakDays: this.getStreakDays()
          };
        } else {
          this.activeContext = {
            topicTitle: 'Tích phân hàm ẩn & Kỹ thuật biến đổi đối xứng',
            subject: 'Toán học (Đại số & Giải tích)',
            milestoneId: 'm1',
            goalId: 'THPT_QG',
            goalName: 'THPT Quốc Gia Khối A00',
            targetScore: '27.5+',
            currentLevel: 'Khá (7 - 8.5 điểm)',
            daysLeft: 88,
            completedExercisesCount: 0,
            totalExercisesCount: 4,
            completedExercises: [],
            streakDays: this.getStreakDays()
          };
        }
      }
    } catch {
      this.completedExerciseIds = new Set();
    }
  }

  isExerciseCompleted(id: string): boolean {
    return this.completedExerciseIds.has(id);
  }

  getStreakDays(): number {
    try {
      const u = api.getUser();
      return u?.profile?.streak_days || 7;
    } catch {
      return 7;
    }
  }

  // Get active study context
  getActiveContext(): ActiveStudyContext {
    return {
      ...this.activeContext,
      completedExercises: Array.from(this.completedExerciseIds),
      streakDays: this.getStreakDays()
    };
  }

  // Set active study context when user clicks "Học cùng AI ngay" anywhere
  setActiveContext(updates: Partial<ActiveStudyContext>) {
    this.activeContext = { ...this.activeContext, ...updates };
    try {
      localStorage.setItem(this.getContextKey(), JSON.stringify(this.activeContext));
    } catch {}
    this.notify();
  }

  private customExercises: Map<string, Exercise[]> = new Map();
  private topicForms: Map<string, ExerciseForm[]> = new Map();
  private activeFormIdPerTopic: Map<string, string> = new Map();

  setFormsForTopic(topic: string, forms: ExerciseForm[]) {
    const key = topic.toLowerCase().trim();
    this.topicForms.set(key, forms);
    if (forms.length > 0) {
      this.activeFormIdPerTopic.set(key, forms[0].id);
      this.customExercises.set(key, forms[0].exercises);
      this.activeContext.totalExercisesCount = forms[0].exercises.length;
      this.activeContext.completedExercisesCount = forms[0].exercises.filter(e => this.completedExerciseIds.has(e.id)).length;
      this.setActiveContext(this.activeContext);
    }
    this.notify();
  }

  getFormsForTopic(topic: string): ExerciseForm[] {
    const key = topic.toLowerCase().trim();
    return this.topicForms.get(key) || [];
  }

  getActiveFormId(topic: string): string | undefined {
    const key = topic.toLowerCase().trim();
    return this.activeFormIdPerTopic.get(key);
  }

  getActiveForm(topic: string): ExerciseForm | undefined {
    const key = topic.toLowerCase().trim();
    const forms = this.topicForms.get(key) || [];
    const activeId = this.activeFormIdPerTopic.get(key);
    return forms.find(f => f.id === activeId) || forms[0];
  }

  switchActiveForm(topic: string, formId: string) {
    const key = topic.toLowerCase().trim();
    const forms = this.topicForms.get(key) || [];
    const targetForm = forms.find(f => f.id === formId);
    if (targetForm) {
      this.activeFormIdPerTopic.set(key, targetForm.id);
      this.customExercises.set(key, targetForm.exercises);
      this.activeContext.totalExercisesCount = targetForm.exercises.length;
      this.activeContext.completedExercisesCount = targetForm.exercises.filter(e => this.completedExerciseIds.has(e.id)).length;
      this.setActiveContext(this.activeContext);
      this.notify();
    }
  }

  addNewFormForTopic(topic: string, form: ExerciseForm) {
    const key = topic.toLowerCase().trim();
    const forms = this.topicForms.get(key) || [];
    const updated = [...forms, form];
    this.topicForms.set(key, updated);
    this.activeFormIdPerTopic.set(key, form.id);
    this.customExercises.set(key, form.exercises);
    this.activeContext.totalExercisesCount = form.exercises.length;
    this.activeContext.completedExercisesCount = form.exercises.filter(e => this.completedExerciseIds.has(e.id)).length;
    this.setActiveContext(this.activeContext);
    this.notify();
  }

  addExercisesToActiveForm(topic: string, newExercises: Exercise[]) {
    const key = topic.toLowerCase().trim();
    const forms = this.topicForms.get(key) || [];
    const activeId = this.activeFormIdPerTopic.get(key);
    if (forms.length > 0) {
      const updatedForms = forms.map(f => {
        if (f.id === activeId || (!activeId && f === forms[0])) {
          return {
            ...f,
            exercises: [...f.exercises, ...newExercises]
          };
        }
        return f;
      });
      this.topicForms.set(key, updatedForms);
    }
    const current = this.customExercises.get(key) || [];
    const combined = [...current, ...newExercises];
    this.customExercises.set(key, combined);
    this.activeContext.totalExercisesCount = combined.length;
    this.activeContext.completedExercisesCount = combined.filter(e => this.completedExerciseIds.has(e.id)).length;
    this.setActiveContext(this.activeContext);
    this.notify();
  }

  setCustomExercisesForTopic(topic: string, exercises: Exercise[]) {
    const key = topic.toLowerCase().trim();
    this.customExercises.set(key, exercises);
    if (!this.topicForms.has(key) || (this.topicForms.get(key) || []).length === 0) {
      const defaultForm: ExerciseForm = {
        id: `form_default_${Date.now()}`,
        title: `Form 1: Thực chiến Toàn diện (${exercises.length} câu)`,
        description: 'Bộ bài tập thực chiến đa dạng được AI Gemini khởi tạo riêng cho chuyên đề này.',
        formType: 'comprehensive',
        exercises
      };
      this.topicForms.set(key, [defaultForm]);
      this.activeFormIdPerTopic.set(key, defaultForm.id);
    }
    this.notify();
  }

  getCustomExercisesForTopic(topic: string): Exercise[] | undefined {
    return this.customExercises.get(topic.toLowerCase().trim());
  }

  // Get matching multi-format exercises for current topic
  getExercisesForCurrentTopic(topicTitle?: string): Exercise[] {
    const rawTitle = topicTitle || this.activeContext.topicTitle;
    const currentTopic = rawTitle.toLowerCase().trim();

    // 1. If custom AI exercises were generated for this prompt/topic, ALWAYS use them!
    if (this.customExercises.has(currentTopic)) {
      return this.customExercises.get(currentTopic)!;
    }

    // 2. Only use diagnostic challenge if this topic is explicitly a diagnostic boss challenge
    if (this.activeContext.isDiagnosticChallenge && this.activeContext.diagnosticStageId && currentTopic.includes('chẩn đoán')) {
      const diagEx = PRELOADED_EXERCISES.find(e => e.id === `diag_challenge_stage_${this.activeContext.diagnosticStageId}`);
      if (diagEx) {
        return [diagEx, ...PRELOADED_EXERCISES.filter(e => e.id !== diagEx.id).slice(0, 3)];
      }
    }
    
    const matched = PRELOADED_EXERCISES.filter(ex => 
      currentTopic.includes(ex.topicTitle.toLowerCase()) || 
      ex.topicTitle.toLowerCase().includes(currentTopic) ||
      ((currentTopic.includes('đồ thị') || currentTopic.includes('dijkstra') || currentTopic.includes('dfs') || currentTopic.includes('bfs')) && ex.topicTitle.includes('Dijkstra')) ||
      (currentTopic.includes('lượng giác') && ex.topicTitle.includes('lượng giác')) ||
      ((currentTopic.includes('đạo hàm') || currentTopic.includes('hàm hợp')) && ex.topicTitle.includes('đạo hàm')) ||
      ((currentTopic.includes('casio') || currentTopic.includes('máy tính')) && ex.topicTitle.includes('Casio')) ||
      (currentTopic.includes('sắp xếp') && ex.topicTitle.includes('Sắp xếp')) ||
      (currentTopic.includes('quicksort') && ex.topicTitle.includes('QuickSort')) ||
      (currentTopic.includes('nhị phân') && ex.topicTitle.includes('nhị phân')) ||
      (currentTopic.includes('tích phân') && ex.subject.includes('Toán')) ||
      (currentTopic.includes('con trỏ') && ex.subject.includes('Cấu trúc dữ liệu')) ||
      (currentTopic.includes('cây nhị phân') && ex.topicTitle.includes('Cây nhị phân')) ||
      (currentTopic.includes('stack') && ex.topicTitle.includes('Ngăn xếp')) ||
      (currentTopic.includes('dao động') && ex.subject.includes('Vật lý')) ||
      (currentTopic.includes('giao thoa') && ex.subject.includes('Vật lý'))
    );

    if (matched.length > 0) {
      return matched;
    }

    // Dynamic generation fallback: NEVER falls back to Math exercises for other topics!
    return generateDynamicExercises(rawTitle, this.activeContext.subject);
  }

  // Get the next milestone in roadmap if available
  getNextMilestone(): any {
    try {
      const u = api.getUser();
      const rm: RoadmapData | null = api.getUserRoadmap(u?.id);
      if (!rm || !rm.milestones || rm.milestones.length === 0) return null;

      let targetIdx = rm.milestones.findIndex(m => m.id === this.activeContext.milestoneId);
      if (targetIdx === -1) {
        const curTopicLower = (this.activeContext.topicTitle || '').toLowerCase().trim();
        targetIdx = rm.milestones.findIndex(m => {
          const mTitleLower = (m.title || '').toLowerCase().trim();
          return mTitleLower === curTopicLower || 
                 curTopicLower.includes(mTitleLower) || 
                 mTitleLower.includes(curTopicLower);
        });
      }

      if (targetIdx !== -1) {
        const next = rm.milestones.find((m, idx) => idx > targetIdx && m.status !== 'done');
        if (next) return next;
      }
      return rm.milestones.find(m => m.status !== 'done' && m.id !== this.activeContext.milestoneId) || null;
    } catch {
      return null;
    }
  }

  // Advance to the next milestone in the roadmap once all exercises for current milestone are done
  advanceToNextMilestone(): { success: boolean; nextMilestone?: any; isCompletedAll?: boolean } {
    try {
      const u = api.getUser();
      const rm: RoadmapData | null = api.getUserRoadmap(u?.id);
      if (!rm || !rm.milestones || rm.milestones.length === 0) return { success: false };

      // 1. Find the current milestone index flexibly
      let targetIdx = rm.milestones.findIndex(m => m.id === this.activeContext.milestoneId);
      if (targetIdx === -1) {
        const curTopicLower = (this.activeContext.topicTitle || '').toLowerCase().trim();
        targetIdx = rm.milestones.findIndex(m => {
          const mTitleLower = (m.title || '').toLowerCase().trim();
          return mTitleLower === curTopicLower || 
                 curTopicLower.includes(mTitleLower) || 
                 mTitleLower.includes(curTopicLower);
        });
      }
      if (targetIdx === -1) {
        targetIdx = rm.milestones.findIndex(m => m.status === 'active');
      }
      if (targetIdx === -1) {
        targetIdx = 0;
      }

      // Mark current milestone as done
      rm.milestones[targetIdx].status = 'done';
      rm.milestones[targetIdx].score = '4/4 bài tập (100%)';

      // 2. Find next milestone that is not done (preferring subsequent milestones)
      let nextIdx = rm.milestones.findIndex((m, idx) => idx > targetIdx && m.status !== 'done');
      if (nextIdx === -1) {
        // Wrap around or find any remaining uncompleted milestone
        nextIdx = rm.milestones.findIndex(m => m.status !== 'done');
      }

      if (nextIdx !== -1 && nextIdx !== targetIdx) {
        const nextMs = rm.milestones[nextIdx];
        nextMs.status = 'active';

        // Also activate the stage if needed
        if (nextMs.stageId && rm.stages) {
          const st = rm.stages.find(s => s.id === nextMs.stageId);
          if (st && st.status !== 'done') {
            st.status = 'active';
          }
        }

        const doneCount = rm.milestones.filter(m => m.status === 'done').length;
        rm.totalProgress = Math.round((doneCount / rm.milestones.length) * 100);

        api.saveUserRoadmap(rm, u?.id);

        // Update active context to next milestone
        this.activeContext = {
          ...this.activeContext,
          topicTitle: nextMs.title,
          subject: nextMs.subject,
          milestoneId: nextMs.id,
          completedExercisesCount: 0,
          totalExercisesCount: 4,
          isDiagnosticChallenge: false
        };

        try {
          localStorage.setItem(this.getContextKey(), JSON.stringify(this.activeContext));
        } catch {}

        this.notify();

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('eduadvisor_milestone_advanced', { 
            detail: { previousTopic: rm.milestones[targetIdx].title, nextMilestone: nextMs } 
          }));
          window.dispatchEvent(new CustomEvent('eduadvisor_roadmap_updated', { detail: rm }));
        }

        return { success: true, nextMilestone: nextMs };
      } else {
        // All milestones completed!
        rm.totalProgress = 100;
        api.saveUserRoadmap(rm, u?.id);
        this.notify();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('eduadvisor_milestone_all_completed', { detail: rm }));
          window.dispatchEvent(new CustomEvent('eduadvisor_roadmap_updated', { detail: rm }));
        }
        return { success: true, isCompletedAll: true };
      }
    } catch (err) {
      console.error('Error advancing milestone:', err);
      return { success: false };
    }
  }

  // Submit exercise result: updates roadmap milestone progress & user profile statistics
  submitExercise(exerciseId: string, isCorrect: boolean, xp: number) {
    if (!isCorrect) return;

    this.completedExerciseIds.add(exerciseId);
    try {
      localStorage.setItem(this.getCompletedKey(), JSON.stringify(Array.from(this.completedExerciseIds)));
    } catch {}

    // Calculate completed count for CURRENT topic specifically
    const topicExercises = this.getExercisesForCurrentTopic(this.activeContext.topicTitle);
    const completedForThisTopic = topicExercises.filter(ex => this.completedExerciseIds.has(ex.id)).length;

    this.activeContext.completedExercisesCount = Math.min(
      this.activeContext.totalExercisesCount,
      completedForThisTopic
    );
    this.setActiveContext(this.activeContext);

    // 1. Update user profile stats in storage
    const u = api.getUser();
    if (u) {
      if (u.profile) {
        u.profile.solved_problems = (u.profile.solved_problems || 0) + 1;
        u.profile.study_hours = Number(((u.profile.study_hours || 0) + 0.3).toFixed(1));
      }
      api.setUser(u);
    }

    // 2. Update user roadmap progress
    try {
      const rm = api.getUserRoadmap(u?.id);
      if (rm && rm.milestones && rm.milestones.length > 0) {
        const msIdx = rm.milestones.findIndex(
          m => m.id === this.activeContext.milestoneId || m.title === this.activeContext.topicTitle
        );
        const targetIdx = msIdx >= 0 ? msIdx : 0;
        rm.milestones[targetIdx].score = `${this.activeContext.completedExercisesCount}/${this.activeContext.totalExercisesCount} bài tập`;
        
        if (this.activeContext.completedExercisesCount >= this.activeContext.totalExercisesCount) {
          rm.milestones[targetIdx].status = 'done';
          if (rm.milestones[targetIdx + 1]) {
            rm.milestones[targetIdx + 1].status = 'active';
          }
        }
        const doneMilestones = rm.milestones.filter(m => m.status === 'done').length;
        rm.totalProgress = Math.round((doneMilestones / rm.milestones.length) * 100);
        api.saveUserRoadmap(rm, u?.id);
      }
    } catch {}

    this.notify();

    // 3. Auto advance to the next milestone if all exercises completed
    if (this.activeContext.completedExercisesCount >= this.activeContext.totalExercisesCount) {
      setTimeout(() => {
        this.advanceToNextMilestone();
      }, 1000);
    }
  }

  // Subscribe to changes
  subscribe(listener: (ctx: ActiveStudyContext) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const ctx = this.getActiveContext();
    this.listeners.forEach(l => l(ctx));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('eduadvisor_study_state_updated', { detail: ctx }));
    }
  }
}

export const studySyncService = new StudySyncService();

