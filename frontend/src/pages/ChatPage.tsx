import React, { useState, useEffect, useRef } from 'react';
import { PageType, ChatMessage } from '../types';
import { api } from '../services/api';
import { FormattedMessage } from '../components/FormattedMessage';
import { studySyncService, Exercise, ActiveStudyContext } from '../services/studySyncService';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Brain, 
  Check, 
  Copy, 
  Plus, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  Share2,
  RotateCcw,
  PanelLeft,
  PanelRight,
  Play,
  Pause,
  Trash2,
  Search,
  ArrowUpRight,
  Volume2,
  Flame,
  Award,
  GraduationCap,
  Lightbulb,
  Tag,
  ListTodo,
  Timer,
  Info,
  Target,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  Trophy,
  XCircle,
  X,
  Pin,
  MessageSquare,
  Maximize2,
  Minimize2,
  ChevronUp,
  Columns,
  GripVertical,
  Sliders,
  ListOrdered
} from 'lucide-react';
import { 
  generateAiExercisesFromPrompt, 
  generateAiExerciseForms, 
  generateAdditionalExercises,
  isExerciseRequest,
  cleanTopicFromPrompt
} from '../services/aiExerciseGenerator';

interface ChatPageProps {
  initialPrompt?: string;
  onNavigate: (page: PageType, initialPrompt?: string) => void;
}

interface ChatSession {
  id: string;
  title: string;
  subject: string;
  timestamp: string;
  preview: string;
  messages: ChatMessage[];
}

interface FormulaItem {
  id: string;
  title: string;
  subject: string;
  category: string;
  formula: string;
  latex: string;
  explanation: string;
  example?: string;
  promptSuggestion: string;
}

const KNOWLEDGE_FORMULAS: FormulaItem[] = [
  // 1. Toán học - Giải tích 9+
  {
    id: 'f_math_01',
    title: 'Bổ đề tích phân hàm đối xứng',
    subject: 'Toán học',
    category: 'Tích phân 9+',
    formula: '∫[a→b] f(x) dx = ∫[a→b] f(a+b-x) dx',
    latex: '\\int_a^b f(x) dx = \\int_a^b f(a+b-x) dx',
    explanation: 'Đặt t = a+b-x. Khi mẫu số chứa dạng f(x) + f(a+b-x) hoặc e^x + 1, cộng 2 tích phân lại sẽ triệt tiêu biểu thức phức tạp, cho kết quả bằng (b-a)/2.',
    example: 'Ví dụ kinh điển: I = ∫[0→π/2] (sin^n x / (sin^n x + cos^n x)) dx = π/4.',
    promptSuggestion: 'Hãy phân tích bổ đề tích phân đối xứng cận [a; b] và chứng minh công thức ∫[a→b] f(x)dx = (b-a)/2 khi f(x) + f(a+b-x) = 1.'
  },
  {
    id: 'f_math_02',
    title: 'Tích phân từng phần (Integration by Parts)',
    subject: 'Toán học',
    category: 'Tích phân 9+',
    formula: '∫ u dv = u·v - ∫ v du',
    latex: '\\int u dv = uv - \\int v du',
    explanation: 'Thứ tự ưu tiên đặt u: "Nhất Lô (ln/log) → Nhì Đa (x^n) → Tam Lượng (sin/cos) → Tứ Mũ (e^x)". Kỹ thuật múa cột giúp giải nhanh trong 30 giây.',
    example: 'Đặt u = x, dv = f\'(x)dx => I = [x·f(x)] - ∫ f(x)dx.',
    promptSuggestion: 'Hướng dẫn em kỹ thuật múa cột tích phân từng phần với đa thức nhân lượng giác hoặc hàm mũ.'
  },
  {
    id: 'f_math_03',
    title: 'Tích phân hàm ẩn phương trình đối xứng',
    subject: 'Toán học',
    category: 'Hàm ẩn 9+',
    formula: 'f(x) + k·f(a+b-x) = g(x)',
    latex: 'f(x) + k \\cdot f(a+b-x) = g(x)',
    explanation: 'Thay x bởi a+b-x để tạo hệ 2 phương trình đối xứng. Khử ẩn f(a+b-x) bằng đại số để rút ra biểu thức tường minh của f(x).',
    example: 'f(x) + 2f(1-x) = 3x² - x => f(x) = x² - 3x + 4/3.',
    promptSuggestion: 'Chào Cố vấn AI! Em muốn học và luyện tập chuyên đề: Tích phân hàm ẩn và kỹ thuật đổi biến số đối xứng (Toán học). Hãy bắt đầu bằng một bài toán ví dụ hoặc tóm tắt phương pháp giải!'
  },
  {
    id: 'f_math_04',
    title: 'Tích phân hàm chẵn & hàm lẻ trên [-a; a]',
    subject: 'Toán học',
    category: 'Tích phân 9+',
    formula: '∫[-a→a] f(x)dx = 2∫[0→a] f(x)dx (chẵn) | 0 (lẻ)',
    latex: '\\int_{-a}^a f(x)dx = 2\\int_0^a f(x)dx \\text{ (nếu chẵn)}, \\quad = 0 \\text{ (nếu lẻ)}',
    explanation: 'Nếu f(x) lẻ thì tích phân trên khoảng đối xứng luôn bằng 0. Nếu biểu thức có mẫu là (a^x + 1) và tử là hàm chẵn, tích phân bằng tích phân từ 0 đến a.',
    example: 'I = ∫[-1→1] (x^4 / (e^x + 1)) dx = ∫[0→1] x^4 dx = 1/5.',
    promptSuggestion: 'Giải thích tính chất hàm chẵn lẻ trong tích phân cận đối xứng [-a; a] và mẹo triệt tiêu e^x + 1 ở mẫu số.'
  },
  {
    id: 'f_math_05',
    title: 'Đổi biến số lượng giác hóa',
    subject: 'Toán học',
    category: 'Giải tích',
    formula: '√(a² - x²) → x = a·sin(t) | √(a² + x²) → x = a·tan(t)',
    latex: '\\sqrt{a^2 - x^2} \\Rightarrow x = a\\sin(t), \\quad \\sqrt{a^2 + x^2} \\Rightarrow x = a\\tan(t)',
    explanation: 'Khử căn thức bậc 2 bằng các đồng nhất thức 1 - sin²t = cos²t và 1 + tan²t = 1/cos²t.',
    promptSuggestion: 'Khi nào nên dùng kỹ thuật lượng giác hóa đổi biến số trong tích phân chứa căn thức bậc hai?'
  },

  // 2. Vật lý 12 - Dao động & Sóng
  {
    id: 'f_phys_01',
    title: 'Phương trình dao động điều hòa',
    subject: 'Vật lý 12',
    category: 'Dao động cơ',
    formula: 'x = A·cos(ωt + φ) | v = -ωA·sin(ωt + φ) | a = -ω²x',
    latex: 'x = A\\cos(\\omega t + \\varphi), \\quad v = -\\omega A\\sin(\\omega t + \\varphi), \\quad a = -\\omega^2 x',
    explanation: 'Vận tốc v sớm pha π/2 so với li độ x; Gia tốc a ngược pha so với x. Hệ thức độc lập thời gian: A² = x² + v²/ω² = a²/ω⁴ + v²/ω².',
    promptSuggestion: 'Tóm tắt các hệ thức độc lập thời gian trong dao động điều hòa và các bẫy đổi đơn vị thường gặp.'
  },
  {
    id: 'f_phys_02',
    title: 'Giao thoa sóng: Cực đại & Cực tiểu',
    subject: 'Vật lý 12',
    category: 'Sóng cơ',
    formula: 'd2 - d1 = k·λ (Cực đại) | (k + 0.5)·λ (Cực tiểu)',
    latex: 'd_2 - d_1 = k\\lambda \\text{ (Cực đại)}, \\quad d_2 - d_1 = (k + 0.5)\\lambda \\text{ (Cực tiểu)}',
    explanation: 'Khoảng cách giữa hai cực đại liên tiếp trên đường nối hai nguồn cùng pha là λ/2. Số vân cực đại: -AB/λ < k < AB/λ.',
    promptSuggestion: 'Hướng dẫn phương pháp xác định số điểm dao động với biên độ cực đại trên đoạn thẳng nối 2 nguồn sóng cùng pha.'
  },
  {
    id: 'f_phys_03',
    title: 'Sóng dừng trên sợi dây',
    subject: 'Vật lý 12',
    category: 'Sóng cơ',
    formula: 'L = k·(λ/2) [2 đầu cố định] | (2k + 1)·(λ/4) [1 đầu tự do]',
    latex: 'L = k\\frac{\\lambda}{2} \\text{ (2 đầu cố định)}, \\quad L = (2k+1)\\frac{\\lambda}{4} \\text{ (1 đầu tự do)}',
    explanation: 'Khoảng cách giữa 2 nút hoặc 2 bụng liên tiếp là λ/2. Khoảng cách nút đến bụng liền kề là λ/4.',
    promptSuggestion: 'Tóm tắt lý thuyết sóng dừng 2 đầu cố định và công thức liên hệ giữa tần số f, tốc độ truyền sóng v và chiều dài dây L.'
  },
  {
    id: 'f_phys_04',
    title: 'Hiện tượng cộng hưởng điện RLC',
    subject: 'Vật lý 12',
    category: 'Dòng điện xoay chiều',
    formula: 'ZL = ZC <=> ω²·L·C = 1 => Z_min = R, I_max, cosφ = 1',
    latex: 'Z_L = Z_C \\Leftrightarrow \\omega^2 LC = 1 \\Rightarrow Z_{\\min} = R, \\quad I_{\\max} = \\frac{U}{R}, \\quad \\cos\\varphi = 1',
    explanation: 'Khi cộng hưởng: điện áp u cùng pha với cường độ dòng điện i, công suất đạt giá trị cực đại P_max = U²/R.',
    promptSuggestion: 'Nêu các dấu hiệu nhận biết hiện tượng cộng hưởng điện xoay chiều trong bài toán RLC biến thiên.'
  },

  // 3. Tiếng Anh - IELTS Academic
  {
    id: 'f_ielts_01',
    title: 'Cấu trúc đoạn văn Writing Task 2 (PEEL)',
    subject: 'Tiếng Anh',
    category: 'IELTS Academic',
    formula: 'P (Point) → E (Explanation) → E (Example) → L (Link)',
    latex: '\\text{Point} \\rightarrow \\text{Explanation} \\rightarrow \\text{Example} \\rightarrow \\text{Link/Impact}',
    explanation: 'Point: Câu chủ đề rõ ràng; Explanation: 2-3 câu làm sáng tỏ nguyên nhân/cơ chế; Example: Dữ liệu hoặc nghiên cứu cụ thể; Link: Khẳng định lại tác động tới luận điểm chính.',
    promptSuggestion: 'Hãy phân tích cấu trúc PEEL mẫu cho một đoạn Body Paragraph về chủ đề Artificial Intelligence in Education đạt band 8.0.'
  },
  {
    id: 'f_ielts_02',
    title: 'Academic Hedging (Văn phong học thuật trung lập)',
    subject: 'Tiếng Anh',
    category: 'IELTS Academic',
    formula: 'It is widely acknowledged that... / Substantial evidence suggests...',
    latex: '\\text{Hedging: } \\text{"It is arguable that..."} \\mid \\text{"Evidence indicates that..."}',
    explanation: 'Tránh dùng từ ngữ tuyệt đối hóa (always, never). Thay bằng: tends to, likely, plausibly, arguably để đạt điểm tiêu chí Lexical Resource & Task Achievement.',
    promptSuggestion: 'Cung cấp 10 cụm từ Academic Hedging thay thế cho các khẳng định tuyệt đối trong bài thi IELTS Writing Task 2.'
  },

  // 4. Tin học & Tư duy ĐGNL
  {
    id: 'f_cs_01',
    title: 'Quy hoạch động: Hệ thức truy hồi cái túi (0/1 Knapsack)',
    subject: 'Tin học',
    category: 'Thuật toán DP',
    formula: 'dp[i][w] = max(dp[i-1][w], dp[i-1][w-wi] + vi)',
    latex: 'dp[i][w] = \\max(dp[i-1][w], \\; dp[i-1][w-w_i] + v_i)',
    explanation: 'Cấu trúc con tối ưu: Chọn lấy hoặc không lấy đồ vật thứ i. Tối ưu không gian bằng mảng 1 chiều duyệt w từ W về wi.',
    promptSuggestion: 'Giải thích nguyên lý quy hoạch động bài toán cái túi 0/1 và cách tối ưu bộ nhớ từ O(N*W) xuống O(W) bằng Python.'
  },
  {
    id: 'f_cs_02',
    title: 'Công thức tổ hợp & Nhị thức Newton',
    subject: 'Tin học',
    category: 'ĐGNL Định lượng',
    formula: 'C(n, k) = n! / (k!(n-k)!) | (a+b)ⁿ = Σ C(n,k) aⁿ⁻ᵏ bᵏ',
    latex: 'C_n^k = \\frac{n!}{k!(n-k)!}, \\quad (a+b)^n = \\sum_{k=0}^n C_n^k a^{n-k} b^k',
    explanation: 'Dùng giải nhanh các câu hỏi xác suất tổ hợp và tìm hệ số số hạng trong đề Đánh Giá Năng Lực ĐHQG.',
    promptSuggestion: 'Phương pháp giải nhanh bài toán tìm hệ số chứa x^k trong khai triển nhị thức Newton nhiều biến.'
  },
  {
    id: 'f_cs_03',
    title: 'Thuật toán Dijkstra (Tìm đường đi ngắn nhất đồ thị trọng số không âm)',
    subject: 'Tin học',
    category: 'Đồ thị & Giải thuật',
    formula: 'd[v] = min(d[v], d[u] + w(u,v)) | O((V + E)·log V)',
    latex: 'd[v] = \\min(d[v], \\; d[u] + w(u, v)), \\quad \\mathcal{O}((V + E)\\log V)',
    explanation: 'Cơ chế nới lỏng cạnh (relaxation) dùng hàng đợi ưu tiên Min-Heap. Mỗi lần lấy đỉnh u có d[u] nhỏ nhất chưa thăm, duyệt các đỉnh kề v để cập nhật d[v]. Không áp dụng cho đồ thị có trọng số âm.',
    example: 'Cài đặt: priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq; pq.push({0, s});',
    promptSuggestion: 'Hãy phân tích chi tiết cơ chế nới lỏng cạnh trong thuật toán Dijkstra và cách cài đặt bằng Priority Queue.'
  },
  {
    id: 'f_cs_04',
    title: 'Duyệt đồ thị: Chiều sâu (DFS) vs Chiều rộng (BFS)',
    subject: 'Tin học',
    category: 'Đồ thị & Giải thuật',
    formula: 'DFS (Stack/Đệ quy) | BFS (Queue/Hàng đợi FIFO) | O(V + E)',
    latex: '\\text{DFS: Stack/Recursion} \\mid \\text{BFS: FIFO Queue} \\quad \\Rightarrow \\mathcal{O}(V + E)',
    explanation: 'DFS duyệt sâu tối đa trước khi quay lui (backtrack), thích hợp tìm chu trình, thành phần liên thông mạnh. BFS duyệt theo từng lớp khoảng cách, tối ưu tìm đường đi ngắn nhất đồ thị không trọng số.',
    example: 'BFS ứng dụng tìm số bước biến đổi ít nhất trong ma trận mê cung.',
    promptSuggestion: 'So sánh chi tiết ưu nhược điểm và trường hợp sử dụng giữa DFS và BFS trong các bài toán đồ thị kinh điển.'
  },
  {
    id: 'f_cs_05',
    title: 'Quản lý bộ nhớ con trỏ & Danh sách liên kết đơn/kép',
    subject: 'Tin học',
    category: 'Cấu trúc dữ liệu',
    formula: 'Node* newNode = new Node(val); newNode->next = head; head = newNode;',
    latex: '\\text{Insert Head: } \\mathcal{O}(1), \\quad \\text{Delete Node: } \\mathcal{O}(1) \\text{ (khi biết node trước)}',
    explanation: 'Con trỏ lưu địa chỉ ô nhớ trong Heap. Cần giải phóng bộ nhớ (delete / free) tránh rò rỉ (memory leak). Thao tác chèn/xóa đầu danh sách có độ phức tạp O(1), truy cập phần tử theo chỉ số là O(N).',
    example: 'struct Node { int val; Node* next; Node(int v) : val(v), next(nullptr) {} };',
    promptSuggestion: 'Hướng dẫn phương pháp đảo ngược danh sách liên kết đơn (Reverse Linked List) trong O(N) thời gian và O(1) bộ nhớ.'
  },
  {
    id: 'f_cs_06',
    title: 'Thuật toán sắp xếp QuickSort & Chia để trị (Divide & Conquer)',
    subject: 'Tin học',
    category: 'Thuật toán',
    formula: 'T(n) = 2T(n/2) + O(n) => Trung bình O(n·log n), Tệ nhất O(n²)',
    latex: 'T(n) = 2T(n/2) + \\mathcal{O}(n) \\Rightarrow \\mathcal{O}(n\\log n)',
    explanation: 'Chọn phần tử chốt (pivot), phân hoạch mảng thành 2 nửa (nhỏ hơn pivot sang trái, lớn hơn sang phải). Đệ quy sắp xếp 2 nửa. Tránh trường hợp xấu nhất O(n²) bằng cách chọn pivot ngẫu nhiên.',
    example: 'Phân hoạch Lomuto / Hoare.',
    promptSuggestion: 'Phân tích cách chọn Pivot trong QuickSort để tránh trường hợp xấu nhất O(N^2) khi mảng đã được sắp xếp sẵn.'
  }
];

const PRELOADED_SESSIONS: ChatSession[] = [
  {
    id: 'sess_free_chat',
    title: '💬 Trò chuyện tự do & Tâm sự cùng AI',
    subject: 'Trò chuyện tự do (Chỉ Chat / Hỏi đáp)',
    timestamp: 'Hôm nay • 11:55 AM',
    preview: 'Chào bạn! Cố vấn AI sẵn sàng lắng nghe, tâm sự và giải tỏa áp lực học tập...',
    messages: [
      {
        id: 'fc_1',
        sender: 'user',
        time: '11:55 AM',
        text: 'Chào Dr. Minerva, em thấy dạo này ôn thi nhiều bài tập quá nên hơi căng thẳng, muốn vào đây trò chuyện và nghỉ ngơi một chút.'
      },
      {
        id: 'fc_2',
        sender: 'ai',
        time: '11:56 AM',
        text: 'Chào bạn! Thật tuyệt vời khi bạn đã chủ động dành một khoảng lặng để nạp lại năng lượng cho bản thân! 🌿\n\nKỳ thi là một chặng đua đường dài chứ không phải chạy nước rút 100m. Não bộ và tinh thần của chúng ta cũng giống như chiếc điện thoại, nếu cứ dùng hết pin mà không cắm sạc thì sẽ bị kiệt sức (burnout).\n\nỞ chuyên mục **Trò chuyện tự do** này, bạn hoàn toàn không phải giải bài tập hay tính toán công thức nào cả. Hãy hít thở thật sâu, uống một ngụm nước ấm và chia sẻ với mình: Có điều gì khiến bạn lo lắng nhất lúc này không, hay bạn muốn cùng mình nghe một câu chuyện truyền cảm hứng? ✨'
      }
    ]
  },
  {
    id: 'sess_1',
    title: 'Tích phân hàm ẩn Chuyên ĐHSP Hà Nội',
    subject: 'Toán học (Đại số & Giải tích)',
    timestamp: 'Hôm nay • 11:40 AM',
    preview: 'Cho hàm số f(x) thỏa mãn f(x) + 2f(1-x) = 3x² - x. Tính I = ∫[0→1] x·f\'(x)dx...',
    messages: [
      {
        id: '1',
        sender: 'user',
        time: '11:40 AM',
        text: 'Cô Minerva ơi, em đang bị vướng câu tích phân hàm ẩn trong đề thi thử Chuyên ĐH Sư Phạm Hà Nội. Làm sao để nhận biết khi nào dùng đổi biến số và khi nào dùng tích phân từng phần ạ? Em có đính kèm bài toán câu 48.',
        homeworkAttachment: {
          title: 'Đề thi thử THPTQG 2025 - Chuyên ĐHSP Hà Nội - Câu 48',
          ocrText: 'Cho hàm số f(x) liên tục trên R thỏa mãn f(x) + 2f(1-x) = 3x² - x. Tính tích phân I = ∫[0→1] x · f\'(x) dx',
          confidence: 'Đã trích xuất đề bài OCR chính xác 99.8%'
        }
      },
      {
        id: '2',
        sender: 'ai',
        time: '11:41 AM',
        text: 'Chào em! Đây là một câu hỏi vận dụng cao (mức 9+) rất kinh điển kết hợp giữa **phương trình hàm đối xứng** và **tích phân từng phần**. Để xử lý gọn gàng trong dưới 2 phút thi trắc nghiệm, chúng ta sẽ áp dụng chiến thuật 3 bước:\n\n### 🔍 Chiến thuật 3 bước giải quyết gọn gàng:\n\n**Bước 1: Tìm hàm số f(x) tường minh**\nNhận thấy hệ thức có tính chất đối xứng qua tâm $x = 1/2$. Ta đặt phương trình ban đầu:\n$$f(x) + 2f(1-x) = 3x^2 - x \\quad (1)$$\nThay $x$ bởi $(1-x)$ ta được phương trình đối xứng:\n$$f(1-x) + 2f(x) = 3(1-x)^2 - (1-x) = 3x^2 - 5x + 2 \\quad (2)$$\n\n**Bước 2: Khử ẩn f(1-x) để giải ra f(x)**\nLấy $2 \\times (2) - (1)$:\n$$3f(x) = 2(3x^2 - 5x + 2) - (3x^2 - x) = 3x^2 - 9x + 4$$\n$$\\Rightarrow f(x) = x^2 - 3x + \\frac{4}{3}$$\n\n**Bước 3: Tích phân từng phần hạ bậc đạo hàm**\nÁp dụng công thức $\\int u dv = uv - \\int v du$ với $u = x, dv = f\'(x)dx$:\n$$I = [x \\cdot f(x)]_0^1 - \\int_0^1 f(x)dx = f(1) - \\int_0^1 \\left(x^2 - 3x + \\frac{4}{3}\\right) dx$$\nVới $f(1) = 1 - 3 + 4/3 = -2/3$.\nTính nguyên hàm: $\\int_0^1 (x^2 - 3x + 4/3)dx = [x^3/3 - 3x^2/2 + 4x/3]_0^1 = 1/6$.\nThay vào: **$I = -2/3 - 1/6 = -\\frac{5}{6}$**.\n\n```python\n# Kiểm chứng nghiệm bằng Python Sympy\nfrom sympy import symbols, integrate\nx = symbols(\'x\')\nf = x**2 - 3*x + 4/3\nI = integrate(x * f.diff(x), (x, 0, 1))\nprint(\'Kết quả tích phân I =\', I)  # Output: -5/6\n```\n\n💡 **Câu hỏi tư duy Socratic**: Nếu đề bài đổi cận từ $-1$ đến $1$ và biểu thức có dạng $f(x) + f(-x) = g(x)$, em sẽ vận dụng tính chất hàm chẵn/lẻ như thế nào để tính nhẩm nhanh hơn?'
      }
    ]
  },
  {
    id: 'sess_2',
    title: 'Phương trình sóng dừng & Giao thoa 12',
    subject: 'Vật lý 12 (Sóng & Quang học)',
    timestamp: 'Hôm qua • 03:15 PM',
    preview: 'Điều kiện cực đại và cực tiểu giao thoa ánh sáng trắng và vân trùng...',
    messages: [
      {
        id: 'p1',
        sender: 'user',
        time: '03:15 PM',
        text: 'Dr. Minerva tóm tắt giúp em phương pháp đếm số vân cực đại trên đoạn nối 2 nguồn cùng pha với ạ!'
      },
      {
        id: 'p2',
        sender: 'ai',
        time: '03:16 PM',
        text: 'Chào em! Đây là dạng bài nền tảng chiếm từ 0.5 - 1.0 điểm trong đề thi tốt nghiệp THPT Vật lý:\n\n### ⚡ Phương pháp xác định số cực đại giao thoa:\n1. **Công thức hiệu đường đi cực đại**: $d_2 - d_1 = k\\lambda$ với $k \\in \\mathbb{Z}$.\n2. **Bất đẳng thức chặn khoảng**: Hai nguồn $S_1, S_2$ cách nhau khoảng $L$, điểm $M$ nằm trên đoạn $S_1S_2$ thỏa mãn:\n$$-L < k\\lambda < L \\iff -\\frac{L}{\\lambda} < k < \\frac{L}{\\lambda}$$\n3. **Số vân cực đại** chính là số giá trị nguyên của $k$.\n\n💡 **Mẹo làm nhanh**: Lấy phần nguyên của $\\frac{L}{\\lambda}$, gọi là $n$. Số cực đại luôn bằng: **$2n + 1$** (với $n = [L/\\lambda]$).'
      }
    ]
  },
  {
    id: 'sess_3',
    title: 'Writing Task 2 Academic Strategy (IELTS 7.5+)',
    subject: 'Tiếng Anh (IELTS Academic)',
    timestamp: '3 ngày trước',
    preview: 'Cấu trúc bài luận PEEL và bộ collocations nâng cao band 8.0...',
    messages: [
      {
        id: 'e1',
        sender: 'user',
        time: '09:20 AM',
        text: 'Em muốn viết đoạn thân bài Task 2 về Technology in Education theo phương pháp PEEL.'
      },
      {
        id: 'e2',
        sender: 'ai',
        time: '09:21 AM',
        text: 'Chào em! Cấu trúc PEEL sẽ giúp đoạn văn đạt điểm tuyệt đối ở tiêu chí Coherence & Cohesion:\n\n### 📝 Cấu trúc 4 câu chuẩn PEEL:\n* **Point**: It is undeniable that digital pedagogical tools significantly enhance student engagement.\n* **Explanation**: By converting abstract academic theories into interactive multimedia simulations, learners can grasp sophisticated concepts at an accelerated pace.\n* **Example**: For instance, recent empirical research from Harvard University indicates that students utilizing AI-assisted tutoring improved their retention rate by over 35% compared to traditional rote learning.\n* **Link**: Consequently, integrating advanced technologies plays an instrumental role in modernizing tertiary education.'
      }
    ]
  },
  {
    id: 'sess_4',
    title: 'Thuật toán Quy hoạch động (Dynamic Programming)',
    subject: 'Lập trình & Thuật toán',
    timestamp: '5 ngày trước',
    preview: 'Bản chất nguyên lý tối ưu Bellman và tối ưu bộ nhớ 1D mảng cái túi...',
    messages: [
      {
        id: 'c1',
        sender: 'user',
        time: '02:00 PM',
        text: 'Làm sao để nhận biết bài toán có cấu trúc quy hoạch động ạ?'
      },
      {
        id: 'c2',
        sender: 'ai',
        time: '02:01 PM',
        text: 'Chào em! Một bài toán dùng được **Quy hoạch động (DP)** khi thỏa mãn đúng 2 điều kiện cốt lõi:\n\n1. **Cấu trúc con tối ưu (Optimal Substructure)**: Lời giải tối ưu của bài toán lớn được tạo thành từ lời giải tối ưu của các bài toán con nhỏ hơn.\n2. **Bài toán con gối nhau (Overlapping Subproblems)**: Các bài toán con bị lặp đi lặp lại nhiều lần nếu dùng đệ quy thuần túy, do đó ta dùng mảng `dp[]` để lưu lại (Memoization).'
      }
    ]
  }
];

const getSessionsStorageKey = (userId?: string) => {
  const uid = userId || api.getUser()?.id || 'guest';
  return `eduadvisor_${uid}_chat_sessions`;
};

const createTopicSession = (topicTitle: string, subject: string, uncompletedCount: number): ChatSession => {
  const sessId = 'sess_' + Date.now();
  return {
    id: sessId,
    title: topicTitle,
    subject: subject,
    timestamp: 'Vừa xong',
    preview: `Chuyên đề: ${topicTitle}...`,
    messages: [
      {
        id: 'msg_welcome_' + Date.now(),
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Chào mừng bạn đến với chuyên đề **${topicTitle}** (${subject})!\n\nTôi là Cố vấn Học thuật AI Dr. Minerva. Lộ trình của bạn đã được kết nối trực tiếp với bảng thử thách tương tác bên dưới.\n\n🎯 **Mục tiêu chuyên đề:** Bạn có **${uncompletedCount} bài tập chưa hoàn thành** cần giải quyết để tiếp tục đẩy tiến độ lộ trình lên mức tối đa.\n\nBạn có thể thử sức ngay ở bảng bài tập bên trên hoặc nhắn tin để tôi giải thích chi tiết phương pháp giải nhé!`
      }
    ]
  };
};

const loadUserSessions = (userId?: string): { sessions: ChatSession[]; activeId: string } => {
  try {
    const key = getSessionsStorageKey(userId);
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { sessions: parsed, activeId: parsed[0].id };
      }
    }
  } catch {}
  
  const actCtx = studySyncService.getActiveContext();
  const exs = studySyncService.getExercisesForCurrentTopic(actCtx.topicTitle);
  const uncompleted = exs.filter(e => !studySyncService.isExerciseCompleted(e.id));
  const initSess = createTopicSession(actCtx.topicTitle, actCtx.subject, uncompleted.length);
  return { sessions: [initSess], activeId: initSess.id };
};

export const ChatPage: React.FC<ChatPageProps> = ({ initialPrompt = '', onNavigate }) => {
  // User-scoped Chat Sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadUserSessions().sessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(() => loadUserSessions().activeId);

  // Active Session messages
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || {
    id: 'default',
    title: 'Hội thoại AI',
    subject: 'Toán học',
    timestamp: 'Vừa xong',
    preview: 'Chào bạn!',
    messages: []
  };
  const [messages, setMessages] = useState<ChatMessage[]>(activeSession.messages || []);

  const [inputText, setInputText] = useState(initialPrompt);
  const [selectedSubject, setSelectedSubject] = useState(activeSession.subject || 'Toán học (Đại số & Giải tích)');
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('Tất cả');
  const [isStreaming, setIsStreaming] = useState(false);

  // Right sidebar active tab: 'practice' | 'formulas' | 'pomodoro' | 'checklist'
  const [rightTab, setRightTab] = useState<'practice' | 'formulas' | 'pomodoro' | 'checklist'>('practice');
  const [formulaSubject, setFormulaSubject] = useState('Toán học');
  const [expandedFormulaId, setExpandedFormulaId] = useState<string | null>('f_math_01');
  const [copiedFormulaId, setCopiedFormulaId] = useState<string | null>(null);

  // Study Sync State & Multi-Format Exercises
  const [studyContext, setStudyContext] = useState<ActiveStudyContext>(studySyncService.getActiveContext());
  const [exerciseFilter, setExerciseFilter] = useState<'all' | 'multiple_choice' | 'fill_blank' | 'trap_detect' | 'matching_pairs' | 'ordering_steps' | 'true_false_group'>('all');
  const [completionFilter, setCompletionFilter] = useState<'uncompleted' | 'all'>('uncompleted');
  const [inChatSelectedExId, setInChatSelectedExId] = useState<string | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [fillAnswers, setFillAnswers] = useState<Record<string, string>>({});
  const [trapSelectedSteps, setTrapSelectedSteps] = useState<Record<string, number>>({});
  const [selectedMatchingLeft, setSelectedMatchingLeft] = useState<{ exId: string; pairId: string } | null>(null);
  const [userMatches, setUserMatches] = useState<Record<string, Record<string, string>>>({});
  const [stepOrderings, setStepOrderings] = useState<Record<string, Array<{ id: string; correctOrder: number; text: string }>>>({});
  const [tfAnswers, setTfAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [submittedExercises, setSubmittedExercises] = useState<Record<string, { isCorrect: boolean; message: string }>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [xpToast, setXpToast] = useState<{ message: string; xp: number } | null>(null);
  const [isProgressPopoverOpen, setIsProgressPopoverOpen] = useState(false);

  // Pomodoro State
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(2);

  // Checklist State
  const [checklist, setChecklist] = useState([
    { id: 'c1', text: 'Luyện lại câu 48 Chuyên Sư Phạm bằng cách tự giải trên nháp', done: true },
    { id: 'c2', text: 'Làm bài tập tương tự: 5 câu hàm ẩn trong Chuyên Lam Sơn', done: false },
    { id: 'c3', text: 'Xem lại video Bổ đề tích phân đối xứng (15 phút)', done: false },
    { id: 'c4', text: 'Ghi chép công thức múa cột từng phần vào sổ tay', done: false },
    { id: 'c5', text: 'Luyện tập đề thi thử THPTQG 2025 đợt 2', done: false }
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'pending' | 'done'>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const practiceCardRef = useRef<HTMLDivElement>(null);

  // Gemini 50/50 Split & Resizing States ("kéo ra kéo vào dễ nhìn")
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const centerSplitRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('eduadvisor_chat_left_width');
      return saved ? parseInt(saved, 10) : 280;
    } catch {
      return 280;
    }
  });
  const [splitRatio, setSplitRatio] = useState<number>(0.5); // 50% Chat AI - 50% Bài tập
  const [isDraggingLeft, setIsDraggingLeft] = useState<boolean>(false);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);
  const [formulaSearch, setFormulaSearch] = useState<string>('');

  // 1. Mouse Drag Left Sidebar Resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingLeft) return;
      const newWidth = Math.max(200, Math.min(460, e.clientX));
      setLeftWidth(newWidth);
      try {
        localStorage.setItem('eduadvisor_chat_left_width', newWidth.toString());
      } catch {}
    };

    const handleMouseUp = () => {
      if (isDraggingLeft) {
        setIsDraggingLeft(false);
      }
    };

    if (isDraggingLeft) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingLeft]);

  // 2. Mouse Drag Splitter (Gemini 50/50 and custom ratio)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplitter || !centerSplitRef.current) return;
      const rect = centerSplitRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const newRatio = Math.max(0.25, Math.min(0.75, relativeX / rect.width));
      setSplitRatio(newRatio);
    };

    const handleMouseUp = () => {
      if (isDraggingSplitter) {
        setIsDraggingSplitter(false);
      }
    };

    if (isDraggingSplitter) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingSplitter]);

  // Handle clicking "Luyện tập": Kích hoạt chia đôi 50/50 kiểu Gemini và hiển thị phần bài tập đen bên phải
  const handleOpenPractice = () => {
    setRightTab('practice');
    setIsRightOpen(true);
    setSplitRatio(0.5); // Chia đều 2 phần bằng nhau 50:50 giống Gemini
    if (window.innerWidth < 1280) {
      setIsLeftOpen(false); // Thu gọn menu lịch sử để ưu tiên diện tích 50/50
    }
    const topicExs = studySyncService.getExercisesForCurrentTopic(studyContext.topicTitle);
    const uncompleted = topicExs.find(
      e => !studySyncService.isExerciseCompleted(e.id) && !submittedExercises[e.id]?.isCorrect
    );
    if (uncompleted) {
      setInChatSelectedExId(uncompleted.id);
    } else if (topicExs[0]) {
      setInChatSelectedExId(topicExs[0].id);
    }

    // AI in chat automatically announces the generated exercises in the right box
    const aiNoticeMsg: ChatMessage = {
      id: 'msg_ai_practice_' + Date.now(),
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `🤖 **Cố vấn AI Dr. Minerva:** Đã kích hoạt không gian **Luyện tập 50:50 kiểu Gemini**! Bộ bài tập thực chiến của chuyên đề **${studyContext.topicTitle}** (${studyContext.subject}) đã được tải và sẵn sàng ở khung màu đen bên phải. Tôi sẽ đồng hành, hướng dẫn và giải mẫu trực tiếp cùng bạn!`
    };
    setMessages(prev => [...prev, aiNoticeMsg]);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle advancing to the next milestone in roadmap when all exercises are done
  const handleAdvanceMilestone = () => {
    const prevTopic = studyContext.topicTitle;
    const res = studySyncService.advanceToNextMilestone();
    if (res.success && res.nextMilestone) {
      setRightTab('practice');
      setIsRightOpen(true);
      setSplitRatio(0.5);
      if (window.innerWidth < 1280) setIsLeftOpen(false);

      const newTopic = res.nextMilestone.title;
      const newSubject = res.nextMilestone.subject;

      const celebMsg: ChatMessage = {
        id: 'msg_adv_' + Date.now(),
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🎉 **CHÚC MỪNG BẠN ĐÃ HOÀN THÀNH TOÀN BỘ 4/4 BÀI TẬP CHUYÊN ĐỀ "${prevTopic}"!**\n\n🚀 Hệ thống Lộ Trình đã tự động ghi nhận và chuyển bạn sang mục tiêu tiếp theo: **${newTopic}** (${newSubject}).\n\n🤖 Cố vấn AI đã phân tích chuyên đề mới và tự động khởi tạo bộ bài tập thực chiến vào **khung bài tập màu đen bên phải**.\n\nHãy tiếp tục phát huy phong độ và chinh phục câu hỏi đầu tiên nhé!`
      };
      setMessages(prev => [...prev, celebMsg]);

      const newExs = studySyncService.getExercisesForCurrentTopic(newTopic);
      if (newExs[0]) {
        setInChatSelectedExId(newExs[0].id);
      }
      triggerXpToast(`✓ Đã hoàn thành "${prevTopic}" & Mở khóa "${newTopic}"!`, 50);
    } else if (res.isCompletedAll) {
      const allDoneMsg: ChatMessage = {
        id: 'msg_all_done_' + Date.now(),
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🏆 **XUẤT SẮC TUYỆT ĐỐI! BẠN ĐÃ HOÀN THÀNH 100% TOÀN BỘ LỘ TRÌNH HỌC TẬP!**\n\nTất cả các chuyên đề và bài tập thử thách chẩn đoán đã được bạn vượt qua trọn vẹn. Bạn đã sẵn sàng bứt phá điểm số tối đa trong kỳ thi thực tế!`
      };
      setMessages(prev => [...prev, allDoneMsg]);
      triggerXpToast('🏆 Chúc mừng bạn đã hoàn thành 100% Lộ Trình!', 100);
    }
  };

  // Autonomous AI Solving for exercises in the black box ("để dữ liệu AI tự làm")
  const handleAiAutoSolve = (ex: Exercise) => {
    let answerStr = '';
    if (ex.type === 'multiple_choice') {
      const correctIdx = ex.correctAnswer ?? 0;
      const optText = ex.options ? ex.options[correctIdx] : '';
      answerStr = `Phương án ${String.fromCharCode(65 + correctIdx)}: "${optText}"`;
      setMcqAnswers(prev => ({ ...prev, [ex.id]: correctIdx }));
    } else if (ex.type === 'fill_blank') {
      answerStr = `"${ex.expectedAnswer || ''}"`;
      setFillAnswers(prev => ({ ...prev, [ex.id]: ex.expectedAnswer || '' }));
    } else if (ex.type === 'trap_detect') {
      const correctTrap = ex.correctAnswer ?? 0;
      const stepText = ex.steps ? ex.steps[correctTrap]?.title : (ex.options ? ex.options[correctTrap] : `Bước ${correctTrap + 1}`);
      answerStr = `Bước ${correctTrap + 1} (${stepText}) là bước dính bẫy ngộ nhận`;
      setTrapSelectedSteps(prev => ({ ...prev, [ex.id]: correctTrap }));
    } else if (ex.type === 'ordering_steps' && ex.orderingSteps) {
      const sorted = [...ex.orderingSteps].sort((a, b) => a.correctOrder - b.correctOrder);
      setStepOrderings(prev => ({ ...prev, [ex.id]: sorted }));
      answerStr = `Đã sắp xếp đúng toàn bộ các bước theo trình tự chuẩn logic`;
    } else if (ex.type === 'matching_pairs' && ex.matchingPairs) {
      const matches: Record<string, string> = {};
      ex.matchingPairs.forEach(p => {
        matches[p.id] = p.id;
      });
      setUserMatches(prev => ({ ...prev, [ex.id]: matches }));
      answerStr = `Đã ghép nối chính xác toàn bộ ${ex.matchingPairs.length} cặp khái niệm tương ứng`;
    } else if (ex.type === 'true_false_group' && ex.statements) {
      const answers: Record<string, boolean> = {};
      ex.statements.forEach(s => {
        answers[s.id] = s.isCorrect;
      });
      setTfAnswers(prev => ({ ...prev, [ex.id]: answers }));
      answerStr = ex.statements.map(s => `${s.label} ${s.isCorrect ? 'ĐÚNG' : 'SAI'}`).join(' | ');
    }

    setSubmittedExercises(prev => ({
      ...prev,
      [ex.id]: {
        isCorrect: true,
        message: `🤖 Cố vấn AI đã phân tích và hoàn thiện câu này giúp bạn! +${ex.xp} XP`
      }
    }));

    onExerciseSolvedSuccess(ex, `🤖 Cố vấn AI đã tự động giải mẫu thành công!`);

    const aiSolveMessage: ChatMessage = {
      id: 'msg_ai_solve_' + Date.now(),
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `🤖 **CỐ VẤN AI DR. MINERVA - TỰ ĐỘNG GIẢI MẪU BÀI TẬP:**\n\n📝 **Câu hỏi:** ${ex.question}\n\n✅ **Đáp án chính xác:** **${answerStr}**\n\n💡 **Phương pháp giải & Phân tích chi tiết:**\n${ex.explanation}\n\n📌 *Dữ liệu bài tập ở khung đen bên phải đã được AI tự động hoàn thành (+${ex.xp} XP). Bạn hãy tham khảo phương pháp trên để chủ động xử lý các câu tương tự nhé!*`
    };
    setMessages(prev => [...prev, aiSolveMessage]);
  };

  // Check navigation intent on mount (from Roadmap, Profile, or Dashboard "Luyện cùng AI")
  useEffect(() => {
    const intent = studySyncService.getNavigationIntent();
    if (intent) {
      const isExIntent = intent.isDiagnosticChallenge || intent.exerciseType || intent.exerciseId || (intent.initialPrompt && isExerciseRequest(intent.initialPrompt)) || intent.tab === 'practice';
      if (isExIntent) {
        setIsRightOpen(true);
        setRightTab('practice');
        setSplitRatio(0.5);
        if (window.innerWidth < 1280) setIsLeftOpen(false);
      }

      const cleanIntentTopic = intent.topicTitle 
        ? cleanTopicFromPrompt(intent.topicTitle) 
        : (intent.initialPrompt ? cleanTopicFromPrompt(intent.initialPrompt) : studyContext.topicTitle);

      if (cleanIntentTopic && cleanIntentTopic !== studyContext.topicTitle) {
        studySyncService.setActiveContext({
          topicTitle: cleanIntentTopic,
          subject: intent.subject || studyContext.subject,
          milestoneId: intent.milestoneId || studyContext.milestoneId,
          completedExercisesCount: 0,
          totalExercisesCount: 4
        });
      }

      const topic = cleanIntentTopic || studyContext.topicTitle;
      const subj = intent.subject || studyContext.subject;
      const prompt = intent.initialPrompt || (isExIntent ? `Chào Cố vấn AI! Em muốn học và luyện tập chuyên đề: ${topic} (${subj}).` : `Chào Cố vấn AI! Em muốn hỏi về chuyên đề: ${topic} (${subj}).`);

      const userMsg: ChatMessage = {
        id: 'msg_u_nav_' + Date.now(),
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: prompt
      };

      if (isExIntent) {
        const aiMsg: ChatMessage = {
          id: 'msg_ai_nav_' + (Date.now() + 1),
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `🤖 **Cố vấn Học thuật AI Dr. Minerva:** Chào bạn! Tôi đã phân tích chuyên đề **${topic}** (${subj}) và tự động khởi tạo bộ bài tập thực chiến 4 dạng vào **khung bài tập màu đen bên phải**:\n\n1. **Trắc nghiệm tư duy**: Nắm vững bản chất lý thuyết cốt lõi.\n2. **Điền đáp số / Cú pháp**: Rèn độ chuẩn xác và tốc độ.\n3. **Bắt bẫy đề thi**: Nhận diện ngộ nhận và lỗi tư duy hay gặp.\n4. **Sắp xếp quy trình**: Rèn tư duy giải thuật hệ thống.\n\n👉 Bạn hãy làm bài trực tiếp ở khung đen bên phải theo chế độ chia đôi 50:50. Nếu cần giải mẫu tự động, chỉ cần nhấn nút **'🤖 AI Tự làm & Giải mẫu'** ở bên dưới mỗi câu nhé!`
        };
        setMessages(prev => [...prev, userMsg, aiMsg]);
      } else {
        const aiMsgId = 'msg_ai_nav_' + (Date.now() + 1);
        const placeholderAiMsg: ChatMessage = {
          id: aiMsgId,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: ''
        };
        setMessages(prev => [...prev, userMsg, placeholderAiMsg]);
        setIsStreaming(true);
        let streamText = '';
        api.streamChat(
          prompt,
          subj,
          (chunk) => {
            streamText += chunk;
            setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: streamText } : m));
          },
          () => setIsStreaming(false)
        );
      }

      studySyncService.clearNavigationIntent();

      const topicExs = studySyncService.getExercisesForCurrentTopic(topic);
      if (topicExs[0]) {
        setInChatSelectedExId(topicExs[0].id);
      }
    }
  }, []);

  // Subscribe to studySyncService
  useEffect(() => {
    const unsub = studySyncService.subscribe(() => {
      setStudyContext(studySyncService.getActiveContext());
    });
    return unsub;
  }, []);

  const triggerXpToast = (message: string, xp: number) => {
    setXpToast({ message, xp });
    setTimeout(() => setXpToast(null), 3500);
  };

  const onExerciseSolvedSuccess = (ex: Exercise, defaultSuccessMsg: string) => {
    studySyncService.submitExercise(ex.id, true, ex.xp);

    if (ex.id.startsWith('diag_challenge_stage_')) {
      const stageNum = parseInt(ex.id.replace('diag_challenge_stage_', ''), 10) || 1;
      studySyncService.passStageDiagnostic(stageNum, ex.xp);
      triggerXpToast(`🎉 Vượt qua Thử Thách Chẩn Đoán Giai Đoạn ${stageNum}!`, ex.xp);

      const celebMsg: ChatMessage = {
        id: 'msg_diag_' + Date.now(),
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🏆 **XUẤT SẮC! BẠN ĐÃ HOÀN THÀNH THỬ THÁCH CHẨN ĐOÁN GIAI ĐOẠN ${stageNum}!**\n\nNăng lực tư duy và kiến thức của bạn ở giai đoạn này đã được kiểm chứng chuẩn xác. Hệ thống Lộ Trình đã tự động **MỞ KHÓA GIAI ĐOẠN TIẾP THEO** cùng với **+${ex.xp} XP** thưởng!\n\nHãy tiếp tục phát huy phong độ và chinh phục các chặng tiếp theo nhé!`
      };
      setMessages(prev => [...prev, celebMsg]);
    } else {
      triggerXpToast(defaultSuccessMsg, ex.xp);
    }
  };

  // 1. Submit Multiple Choice
  const handleSelectMCQ = (ex: Exercise, optionIdx: number) => {
    if (submittedExercises[ex.id]?.isCorrect || studySyncService.isExerciseCompleted(ex.id)) return;
    setMcqAnswers(prev => ({ ...prev, [ex.id]: optionIdx }));
    const isCorrect = optionIdx === ex.correctAnswer;
    setSubmittedExercises(prev => ({
      ...prev,
      [ex.id]: {
        isCorrect,
        message: isCorrect 
          ? `Chính xác! +${ex.xp} XP đã được cộng và tiến độ bài tập đã đồng bộ sang Lộ trình.` 
          : 'Chưa chính xác. Hãy xem phân tích phương pháp bên dưới!'
      }
    }));

    if (isCorrect) {
      onExerciseSolvedSuccess(ex, 'Xuất sắc! Bạn đã giải đúng câu hỏi trắc nghiệm');
    }
  };

  // 2. Submit Fill in the Blank
  const handleSubmitFill = (ex: Exercise) => {
    const val = (fillAnswers[ex.id] || '').trim();
    if (!val || submittedExercises[ex.id]?.isCorrect || studySyncService.isExerciseCompleted(ex.id)) return;

    const normalized = val.toLowerCase().replace(/\s+/g, '');
    const isCorrect = 
      normalized === (ex.expectedAnswer || '').toLowerCase().replace(/\s+/g, '') ||
      (ex.acceptableAnswers && ex.acceptableAnswers.some(a => a.toLowerCase().replace(/\s+/g, '') === normalized));

    setSubmittedExercises(prev => ({
      ...prev,
      [ex.id]: {
        isCorrect: !!isCorrect,
        message: isCorrect 
          ? `Xuất sắc! Đáp án chính xác. +${ex.xp} XP đã được cộng.` 
          : `Chưa đúng. Đáp án chuẩn là ${ex.expectedAnswer}. Xem phân tích lời giải bên dưới.`
      }
    }));

    if (isCorrect) {
      onExerciseSolvedSuccess(ex, 'Chính xác! Bạn đã điền đúng đáp số bài toán');
    }
  };

  // 3. Submit Trap Detective
  const handleSelectTrapStep = (ex: Exercise, stepNum: number) => {
    if (submittedExercises[ex.id]?.isCorrect || studySyncService.isExerciseCompleted(ex.id)) return;
    setTrapSelectedSteps(prev => ({ ...prev, [ex.id]: stepNum }));

    const faultyStep = ex.steps?.find(s => s.isFaulty);
    const isCorrect = faultyStep && faultyStep.stepNum === stepNum;

    setSubmittedExercises(prev => ({
      ...prev,
      [ex.id]: {
        isCorrect: !!isCorrect,
        message: isCorrect 
          ? `Tinh mắt lắm! Bạn đã bắt đúng bẫy đề thi tại Bước ${stepNum}. +${ex.xp} XP`
          : `Bước ${stepNum} hoàn toàn hợp lệ về mặt toán học. Hãy kiểm tra các bước còn lại xem có bẫy ẩn nào không!`
      }
    }));

    if (isCorrect) {
      onExerciseSolvedSuccess(ex, 'Bắt bẫy đề thi thành công! Nhận ngay');
    }
  };

  // 4. Handle Matching Pairs
  const handleSelectMatchingLeft = (exId: string, pairId: string) => {
    setSelectedMatchingLeft({ exId, pairId });
  };

  const handleSelectMatchingRight = (ex: Exercise, rightPairId: string) => {
    if (!selectedMatchingLeft || selectedMatchingLeft.exId !== ex.id) return;
    const leftPairId = selectedMatchingLeft.pairId;

    const newMatches = {
      ...(userMatches[ex.id] || {}),
      [leftPairId]: rightPairId
    };
    setUserMatches(prev => ({ ...prev, [ex.id]: newMatches }));
    setSelectedMatchingLeft(null);

    // If all pairs have been matched
    if (ex.matchingPairs && Object.keys(newMatches).length === ex.matchingPairs.length) {
      const allCorrect = ex.matchingPairs.every(p => newMatches[p.id] === p.id);
      setSubmittedExercises(prev => ({
        ...prev,
        [ex.id]: {
          isCorrect: allCorrect,
          message: allCorrect 
            ? `Xuất sắc! Bạn đã ghép đôi chính xác toàn bộ ${ex.matchingPairs?.length} cặp định lý. +${ex.xp} XP` 
            : 'Một số cặp ghép chưa chuẩn xác. Hãy bấm ghép lại để nắm vững bản chất!'
        }
      }));

      if (allCorrect) {
        onExerciseSolvedSuccess(ex, 'Ghép đôi khái niệm thành công! Nhận ngay');
      }
    }
  };

  // 5. Handle Step Ordering
  const getOrderedSteps = (ex: Exercise) => {
    if (stepOrderings[ex.id]) return stepOrderings[ex.id];
    const raw = ex.orderingSteps || [];
    return [...raw].reverse();
  };

  const handleMoveStep = (ex: Exercise, fromIdx: number, toIdx: number) => {
    const currentList = stepOrderings[ex.id] ? [...stepOrderings[ex.id]] : [...(ex.orderingSteps || [])].reverse();
    if (toIdx < 0 || toIdx >= currentList.length) return;
    const item = currentList.splice(fromIdx, 1)[0];
    currentList.splice(toIdx, 0, item);
    setStepOrderings(prev => ({ ...prev, [ex.id]: currentList }));
  };

  const handleVerifyOrdering = (ex: Exercise) => {
    const list = stepOrderings[ex.id] || [...(ex.orderingSteps || [])].reverse();
    const isCorrect = list.every((item, idx) => item.correctOrder === idx + 1);

    setSubmittedExercises(prev => ({
      ...prev,
      [ex.id]: {
        isCorrect,
        message: isCorrect 
          ? `Tư duy logic chuẩn xác! Bạn đã sắp xếp đúng quy trình giải bài. +${ex.xp} XP`
          : 'Thứ tự các bước chưa đúng. Hãy xem lại bước nào cần giải trước!'
      }
    }));

    if (isCorrect) {
      onExerciseSolvedSuccess(ex, 'Sắp xếp quy trình giải thành công! Nhận ngay');
    }
  };

  // 6. Handle True / False Group (THPT 2025 format)
  const handleSelectTrueFalse = (exId: string, stmtId: string, value: boolean) => {
    if (submittedExercises[exId]?.isCorrect || studySyncService.isExerciseCompleted(exId)) return;
    setTfAnswers(prev => ({
      ...prev,
      [exId]: {
        ...(prev[exId] || {}),
        [stmtId]: value
      }
    }));
  };

  const handleSubmitTrueFalse = (ex: Exercise) => {
    const statements = ex.statements;
    if (!statements || statements.length === 0) return;
    const userAnswers = tfAnswers[ex.id] || {};
    const unAnswered = statements.find(s => userAnswers[s.id] === undefined);
    if (unAnswered) {
      alert('Vui lòng chọn Đúng hoặc Sai cho tất cả 4 nhận định trước khi nộp bài!');
      return;
    }

    const allCorrect = statements.every(s => userAnswers[s.id] === s.isCorrect);
    const correctCount = statements.filter(s => userAnswers[s.id] === s.isCorrect).length;

    setSubmittedExercises(prev => ({
      ...prev,
      [ex.id]: {
        isCorrect: allCorrect,
        message: allCorrect
          ? `Xuất sắc tuyệt đối! Bạn đã đánh giá chính xác 4/4 nhận định theo cấu trúc đề thi 2025. +${ex.xp} XP`
          : `Bạn đã đánh giá đúng ${correctCount}/${statements.length} nhận định. Hãy xem phân tích chi tiết từng mệnh đề bên dưới!`
      }
    }));

    if (allCorrect) {
      onExerciseSolvedSuccess(ex, 'Vượt qua chùm nhận định Đúng/Sai xuất sắc');
    }
  };

  // Sync active session messages
  useEffect(() => {
    const cur = sessions.find(s => s.id === activeSessionId);
    if (cur) {
      setMessages(cur.messages);
      setSelectedSubject(cur.subject);
    }
  }, [activeSessionId, sessions]);

  // Keep sessions updated in localStorage
  useEffect(() => {
    try {
      const key = getSessionsStorageKey();
      localStorage.setItem(key, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Handle user account switch
  useEffect(() => {
    const handleUserChange = (e: any) => {
      const { sessions: loaded, activeId } = loadUserSessions(e.detail?.id);
      setSessions(loaded);
      setActiveSessionId(activeId);
      setStudyContext(studySyncService.getActiveContext());
    };
    window.addEventListener('eduadvisor_user_updated', handleUserChange);
    return () => {
      window.removeEventListener('eduadvisor_user_updated', handleUserChange);
    };
  }, []);

  // Handle milestone advanced event
  useEffect(() => {
    const handleMilestoneAdvanced = (e: any) => {
      const { previousTopic, nextMilestone } = e.detail || {};
      if (nextMilestone) {
        setStudyContext(studySyncService.getActiveContext());
        const celebMsg: ChatMessage = {
          id: 'msg_adv_' + Date.now(),
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `🎉 **CHÚC MỪNG BẠN!** Bạn đã hoàn thành 100% mục tiêu chuyên đề: **${previousTopic || 'chuyên đề vừa học'}**.\n\nHệ thống Lộ trình đã tự động nâng cấp và chuyển bạn sang mục tiêu tiếp theo:\n👉 **${nextMilestone.title}** (${nextMilestone.subject})\n\nHãy cùng tôi giải quyết các bài tập của chuyên đề mới này nhé!`
        };
        setMessages(prev => [...prev, celebMsg]);
        triggerXpToast(`Mở khóa mục tiêu mới: ${nextMilestone.title}`, 50);
      }
    };

    window.addEventListener('eduadvisor_milestone_advanced', handleMilestoneAdvanced);
    return () => {
      window.removeEventListener('eduadvisor_milestone_advanced', handleMilestoneAdvanced);
    };
  }, []);

  // Keep sessions updated when messages change
  const updateCurrentSessionMessages = (newMsgs: ChatMessage[]) => {
    setMessages(newMsgs);
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const lastMsg = newMsgs[newMsgs.length - 1];
        return {
          ...s,
          messages: newMsgs,
          preview: lastMsg?.text?.slice(0, 65) || s.preview
        };
      }
      return s;
    }));
  };

  // When initialPrompt or navigation intent or active topic changes
  useEffect(() => {
    const intent = studySyncService.getNavigationIntent();
    if (intent) {
      const isExIntent = intent.isDiagnosticChallenge || intent.exerciseType || intent.exerciseId || (intent.initialPrompt && isExerciseRequest(intent.initialPrompt)) || intent.tab === 'practice';
      if (isExIntent) {
        setRightTab('practice');
        setIsRightOpen(true);
        setSplitRatio(0.5); // Ensure 50:50 Gemini split layout
        if (window.innerWidth < 1280) {
          setIsLeftOpen(false);
        }
      } else if (intent.tab) {
        setRightTab(intent.tab);
      }

      if (intent.isDiagnosticChallenge && intent.diagnosticStageId) {
        studySyncService.setActiveContext({
          isDiagnosticChallenge: true,
          diagnosticStageId: intent.diagnosticStageId
        });
        const diagExId = `diag_challenge_stage_${intent.diagnosticStageId}`;
        setInChatSelectedExId(diagExId);
        setExerciseFilter('all');
      } else if (intent.exerciseType) {
        setExerciseFilter(intent.exerciseType as any);
        const topicExs = studySyncService.getExercisesForCurrentTopic(intent.topicTitle || studyContext.topicTitle);
        const match = topicExs.find(e => e.type === intent.exerciseType);
        if (match) {
          setInChatSelectedExId(match.id);
        }
      } else if (intent.difficulty) {
        const topicExs = studySyncService.getExercisesForCurrentTopic(intent.topicTitle || studyContext.topicTitle);
        const match = topicExs.find(e => e.difficulty === intent.difficulty);
        if (match) {
          setInChatSelectedExId(match.id);
        }
      } else if (intent.exerciseId) {
        setInChatSelectedExId(intent.exerciseId);
      }

      if (intent.initialPrompt) {
        setInputText(intent.initialPrompt);
      }

      studySyncService.clearNavigationIntent();
    } else {
      if (initialPrompt && !initialPrompt.startsWith('Chào Cố vấn AI! Em muốn học')) {
        setInputText(initialPrompt);
      } else if (!inputText) {
        setInputText('');
      }
    }

    if (!studyContext.topicTitle) return;

    setSessions(prev => {
      const match = prev.find(s => 
        s.title.toLowerCase().trim() === studyContext.topicTitle.toLowerCase().trim()
      );
      if (match) {
        setActiveSessionId(match.id);
        return prev;
      }

      const topicExs = studySyncService.getExercisesForCurrentTopic(studyContext.topicTitle);
      const uncompleted = topicExs.filter(e => !studySyncService.isExerciseCompleted(e.id));
      const newSess = createTopicSession(studyContext.topicTitle, studyContext.subject, uncompleted.length);
      setActiveSessionId(newSess.id);
      return [newSess, ...prev];
    });
  }, [studyContext.topicTitle, initialPrompt]);

  // Pomodoro timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds(prev => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0) {
      if (timerMode === 'work') {
        setCompletedPomodoros(c => c + 1);
        setTimerMode('break');
        setPomodoroSeconds(5 * 60);
      } else {
        setTimerMode('work');
        setPomodoroSeconds(25 * 60);
      }
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds, timerMode]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShowScrollBottom(!isNearBottom);
  };

  // Create new Chat Session
  const handleNewChat = (mode: 'academic' | 'free_chat' = 'academic') => {
    const isFree = mode === 'free_chat' || selectedSubject.includes('Trò chuyện') || selectedSubject.includes('Chỉ Chat');
    const newId = 'sess_' + Date.now();
    const newSubject = isFree ? 'Trò chuyện tự do (Chỉ Chat / Hỏi đáp)' : (mode === 'academic' && selectedSubject.includes('Trò chuyện') ? 'Toán học (Đại số & Giải tích)' : selectedSubject);
    const newTitle = isFree 
      ? '💬 Trò chuyện tự do ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Hội thoại ' + newSubject.split('(')[0].trim() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const welcomeText = isFree
      ? `Chào bạn! Cố vấn AI **Dr. Minerva** rất vui được đồng hành cùng bạn trong không gian **Trò chuyện tự do & Tâm sự** này! 😊\n\nTại đây bạn có thể thoải mái chia sẻ mọi điều: tâm tư tình cảm, áp lực thi cử, kỹ năng sống, phương pháp quản lý thời gian hoặc bất cứ chủ đề thú vị nào mà không bị gò bó vào bài tập hay điểm số.\n\nHôm nay của bạn thế nào? Cùng chia sẻ với mình nhé! ✨`
      : `Chào em! Cố vấn học thuật **Dr. Minerva AI** đã sẵn sàng đồng hành cùng em trong môn **${newSubject}**.\n\nEm đang gặp khó khăn ở bài toán, chuyên đề lý thuyết hay cần chiến lược ôn thi nào? Em có thể gõ câu hỏi hoặc bấm chọn nhanh các công thức bên sổ tay tri thức nhé!`;

    const newSession: ChatSession = {
      id: newId,
      title: newTitle,
      subject: newSubject,
      timestamp: 'Vừa xong',
      preview: isFree ? 'Chào bạn! Cố vấn AI sẵn sàng trò chuyện và lắng nghe...' : 'Chào em! Cố vấn AI sẵn sàng đồng hành cùng em...',
      messages: [
        {
          id: 'welcome_' + Date.now(),
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: welcomeText
        }
      ]
    };

    setSelectedSubject(newSubject);
    if (isFree) {
      setIsRightOpen(false);
    }
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setInputText('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Delete Chat Session
  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      alert('Bạn cần giữ ít nhất một phiên hội thoại.');
      return;
    }
    const filtered = sessions.filter(s => s.id !== sessionId);
    setSessions(filtered);
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0].id);
    }
  };

  // Send message
  const handleSend = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text || isStreaming) return;

    const userMsgText = text;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: userMsgText
    };

    const newMsgs = [...messages, userMsg];
    updateCurrentSessionMessages(newMsgs);
    setInputText('');

    // Kiểm tra xem người dùng có yêu cầu/cần bài tập hay không (Chuyên mục Trò chuyện tự do sẽ KHÔNG ép sinh bài tập)
    const isFreeChat = selectedSubject.includes('Trò chuyện') || selectedSubject.includes('Chỉ Chat');
    const needExercise = !isFreeChat && isExerciseRequest(userMsgText);
    let accumulatedText = '';

    if (needExercise) {
      // 1. AUTONOMOUS AI EXERCISE SYNTHESIS: Chỉ tạo và đẩy bài tập lên ô đen bên phải khi người dùng CẦN BÀI TẬP
      const generated = generateAiExercisesFromPrompt(userMsgText, selectedSubject);
      studySyncService.setFormsForTopic(generated.topic, generated.forms);
      studySyncService.setActiveContext({
        topicTitle: generated.topic,
        subject: generated.subject,
        milestoneId: 'ai_' + Date.now(),
        completedExercisesCount: 0,
        totalExercisesCount: generated.exercises.length,
        isDiagnosticChallenge: false
      });

      // Reset exercise submission states for fresh exercises
      setSubmittedExercises({});
      setMcqAnswers({});
      setFillAnswers({});
      setTrapSelectedSteps({});
      setStepOrderings({});
      setUserMatches({});
      setTfAnswers({});
      if (generated.exercises[0]) {
        setInChatSelectedExId(generated.exercises[0].id);
      }

      // Automatically open right 50:50 pane with practice tab
      setRightTab('practice');
      setIsRightOpen(true);
      setSplitRatio(0.5);
      if (window.innerWidth < 1280) {
        setIsLeftOpen(false);
      }

      accumulatedText = `🤖 **Cố vấn AI Dr. Minerva:** Tôi đã chuẩn bị bộ bài tập thực chiến chuyên đề **${generated.topic}** (${generated.subject}) và đưa lên **khung bài tập màu đen bên phải** cho bạn.\n\n👉 Bạn hãy làm bài trực tiếp ở ô bên phải, tôi sẽ đồng hành, theo dõi và giải thích chi tiết từng câu nhé!\n\n`;
    }

    // Placeholder for AI streaming message
    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: accumulatedText
    };

    const msgsWithPlaceholder = [...newMsgs, initialAiMsg];
    updateCurrentSessionMessages(msgsWithPlaceholder);
    setIsStreaming(true);

    api.streamChat(
      userMsgText,
      selectedSubject,
      (chunk) => {
        accumulatedText += chunk;
        setMessages(prev => {
          const updated = prev.map(m => m.id === aiMsgId ? { ...m, text: accumulatedText } : m);
          // Sync with session
          setSessions(sPrev => sPrev.map(s => s.id === activeSessionId ? { ...s, messages: updated, preview: accumulatedText.slice(0, 70) } : s));
          return updated;
        });
      },
      () => {
        setIsStreaming(false);
      }
    );
  };

  // Insert formula to input box
  const handleInsertFormulaToInput = (formula: FormulaItem) => {
    setInputText(formula.promptSuggestion);
    inputRef.current?.focus();
  };

  // Copy formula latex
  const handleCopyFormula = (f: FormulaItem) => {
    navigator.clipboard.writeText(f.latex || f.formula);
    setCopiedFormulaId(f.id);
    setTimeout(() => setCopiedFormulaId(null), 2000);
  };

  // Checklist actions
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklist(prev => [
      ...prev,
      { id: 'c_' + Date.now(), text: newChecklistText.trim(), done: false }
    ]);
    setNewChecklistText('');
  };

  const handleClearCompletedTasks = () => {
    setChecklist(prev => prev.filter(item => !item.done));
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(historySearch.toLowerCase()) || 
                        s.preview.toLowerCase().includes(historySearch.toLowerCase());
    let matchSubject = subjectFilter === 'Tất cả';
    if (subjectFilter === 'Chỉ Chat') {
      matchSubject = s.subject.includes('Trò chuyện') || s.subject.includes('Chỉ Chat');
    } else if (subjectFilter !== 'Tất cả') {
      matchSubject = s.subject.includes(subjectFilter);
    }
    return matchSearch && matchSubject;
  });

  // AI Smart Suggested Formulas based on active study topic & subject (Không cần chọn dropdown)
  const currentTopicStr = (studyContext.topicTitle || '').toLowerCase();
  const currentSubjectStr = (studyContext.subject || selectedSubject || '').toLowerCase();

  const autoSuggestedFormulas = KNOWLEDGE_FORMULAS.filter(f => {
    if (formulaSearch.trim()) {
      const q = formulaSearch.toLowerCase();
      return f.title.toLowerCase().includes(q) || 
             f.formula.toLowerCase().includes(q) || 
             f.explanation.toLowerCase().includes(q) ||
             f.category.toLowerCase().includes(q) ||
             f.subject.toLowerCase().includes(q);
    }

    if (currentTopicStr.includes('đồ thị') || currentTopicStr.includes('dijkstra') || currentTopicStr.includes('dfs') || currentTopicStr.includes('bfs')) {
      if (f.id === 'f_cs_03' || f.id === 'f_cs_04') return true;
    }
    if (currentTopicStr.includes('con trỏ') || currentTopicStr.includes('danh sách liên kết') || currentTopicStr.includes('bộ nhớ') || currentTopicStr.includes('cấp phát')) {
      if (f.id === 'f_cs_05') return true;
    }
    if (currentTopicStr.includes('sắp xếp') || currentTopicStr.includes('quicksort') || currentTopicStr.includes('mergesort')) {
      if (f.id === 'f_cs_06') return true;
    }
    if (currentTopicStr.includes('tích phân') || currentTopicStr.includes('hàm ẩn') || currentTopicStr.includes('đổi biến')) {
      if (f.subject === 'Toán học') return true;
    }
    if (currentTopicStr.includes('sóng') || currentTopicStr.includes('dao động') || currentTopicStr.includes('giao thoa') || currentTopicStr.includes('quang')) {
      if (f.subject.includes('Vật lý')) return true;
    }
    if (currentTopicStr.includes('ielts') || currentTopicStr.includes('writing') || currentTopicStr.includes('tiếng anh')) {
      if (f.subject.includes('Tiếng Anh')) return true;
    }

    if ((currentSubjectStr.includes('tin') || currentSubjectStr.includes('thuật toán') || currentSubjectStr.includes('đồ thị') || currentSubjectStr.includes('cấu trúc')) && f.subject.includes('Tin học')) return true;
    if (currentSubjectStr.includes('toán') && f.subject.includes('Toán')) return true;
    if (currentSubjectStr.includes('lý') && f.subject.includes('Vật lý')) return true;
    if (currentSubjectStr.includes('anh') && f.subject.includes('Tiếng Anh')) return true;

    return false;
  });

  const displayFormulas = autoSuggestedFormulas.length > 0 ? autoSuggestedFormulas : KNOWLEDGE_FORMULAS;

  // Format pomodoro time
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  // Current Topic Exercises & Uncompleted breakdown
  const topicForms = studySyncService.getFormsForTopic(studyContext.topicTitle);
  const activeForm = studySyncService.getActiveForm(studyContext.topicTitle);
  const currentTopicExercises = studySyncService.getExercisesForCurrentTopic(studyContext.topicTitle);
  const uncompletedExercises = currentTopicExercises.filter(ex => !studySyncService.isExerciseCompleted(ex.id) && !submittedExercises[ex.id]?.isCorrect);
  const activeInChatEx = currentTopicExercises.find(e => e.id === inChatSelectedExId) || uncompletedExercises[0] || currentTopicExercises[0];
  const activeExIndex = activeInChatEx ? currentTopicExercises.findIndex(e => e.id === activeInChatEx.id) : 0;
  const isCurrentTopicDone = studyContext.completedExercisesCount >= studyContext.totalExercisesCount;
  const nextMilestone = studySyncService.getNextMilestone();
  const completionPercent = Math.min(100, Math.round((studyContext.completedExercisesCount / Math.max(1, studyContext.totalExercisesCount)) * 100));

  // Multi-Form Management Actions
  const handleSwitchForm = (formId: string) => {
    studySyncService.switchActiveForm(studyContext.topicTitle, formId);
    const exs = studySyncService.getExercisesForCurrentTopic(studyContext.topicTitle);
    if (exs[0]) {
      setInChatSelectedExId(exs[0].id);
    }
    triggerXpToast(`✓ Đã chuyển sang Form mới (${exs.length} bài)!`, 10);
  };

  const handleAddMoreExercises = () => {
    const curExs = studySyncService.getExercisesForCurrentTopic(studyContext.topicTitle);
    const newExs = generateAdditionalExercises(studyContext.topicTitle, studyContext.subject, curExs.length, 3);
    studySyncService.addExercisesToActiveForm(studyContext.topicTitle, newExs);
    triggerXpToast(`✨ AI vừa tạo thêm +${newExs.length} câu hỏi mới vào Form này!`, 25);
  };

  const handleCreateNewAiForm = () => {
    const existingForms = studySyncService.getFormsForTopic(studyContext.topicTitle);
    const formNum = existingForms.length + 1;
    const res = generateAiExerciseForms(studyContext.topicTitle, studyContext.subject);
    const archetype = formNum % 3 === 2 ? res.forms[1] : (formNum % 3 === 0 ? res.forms[2] : res.forms[0]);
    const newForm = {
      ...archetype,
      id: `form_ai_${Date.now()}`,
      title: `Form ${formNum}: ${archetype.title.split(':')[1]?.trim() || 'Luyện tập Chuyên sâu'} (${archetype.exercises.length} bài)`
    };
    studySyncService.addNewFormForTopic(studyContext.topicTitle, newForm);
    setInChatSelectedExId(newForm.exercises[0]?.id || null);
    triggerXpToast(`🚀 AI Gemini vừa khởi tạo ${newForm.title}!`, 30);
  };

  const handlePrevExercise = () => {
    if (activeExIndex > 0) {
      setInChatSelectedExId(currentTopicExercises[activeExIndex - 1].id);
    }
  };

  const handleNextExercise = () => {
    if (activeExIndex < currentTopicExercises.length - 1) {
      setInChatSelectedExId(currentTopicExercises[activeExIndex + 1].id);
    }
  };

  return (
    <div 
      ref={mainContainerRef}
      className="h-full w-full flex overflow-hidden bg-slate-50 min-h-0 font-sans"
    >
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR: Kéo ra kéo vào, thiết kế Glassmorphism & Quản lý phiên   */}
      {/* ========================================================================= */}
      <aside 
        style={{ width: isLeftOpen ? `${leftWidth}px` : '0px' }}
        className={`${
          isLeftOpen ? 'flex' : 'hidden'
        } flex-col h-full border-r border-slate-200/90 bg-white/95 backdrop-blur-md p-3.5 space-y-3 shrink-0 overflow-hidden min-h-0 shadow-sm z-20 transition-[width] duration-75`}
      >
        {/* Top: New Chat Buttons */}
        <div className="space-y-1.5 shrink-0">
          <button
            onClick={() => handleNewChat('academic')}
            className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all transform active:scale-98"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-200" />
              <span>Phiên học thuật mới</span>
            </div>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono text-white/90">Ctrl+N</span>
          </button>

          <button
            onClick={() => handleNewChat('free_chat')}
            className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs transition-all transform active:scale-98 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>💬 Chuyên mục Chỉ Chat</span>
            </div>
            <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold uppercase">Tự do</span>
          </button>
        </div>

        {/* Search Session Bar */}
        <div className="relative shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            placeholder="Tìm kiếm lịch sử học tập..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar shrink-0 text-[11px]">
          {['Tất cả', 'Chỉ Chat', 'Toán', 'Lý', 'Anh', 'Tin'].map(sub => (
            <button
              key={sub}
              onClick={() => setSubjectFilter(sub)}
              className={`px-2.5 py-1 rounded-full font-medium shrink-0 transition-colors ${
                subjectFilter === sub 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Pinned Goal & Streak Widget */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50/90 to-indigo-50/80 border border-blue-200/70 space-y-2 shrink-0 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              Mục tiêu tuần: 8.5+ Mock Test
            </span>
            <span className="text-blue-700">76%</span>
          </div>
          <div className="w-full bg-blue-200/50 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: '76%' }} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-blue-800 font-medium">
            <span className="flex items-center gap-1 text-amber-600 font-bold">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              14 ngày streak
            </span>
            <span className="text-slate-500">Đã giải 42 câu khó</span>
          </div>
        </div>

        {/* Chat History Grouped List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs min-h-0 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 py-1">
            <span>Danh sách phiên ({filteredSessions.length})</span>
            <Clock className="w-3 h-3" />
          </div>

          <div className="space-y-1.5">
            {filteredSessions.map(sess => {
              const isActive = sess.id === activeSessionId;
              return (
                <div
                  key={sess.id}
                  onClick={() => setActiveSessionId(sess.id)}
                  className={`group relative flex flex-col p-2.5 rounded-xl cursor-pointer transition-all border ${
                    isActive 
                      ? 'bg-blue-50/90 border-blue-300 text-blue-950 shadow-xs' 
                      : 'hover:bg-slate-100/80 border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`font-semibold text-xs truncate ${isActive ? 'text-blue-900 font-bold' : 'text-slate-800'}`}>
                      {sess.title}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSession(e, sess.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                      title="Xóa phiên"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {sess.preview}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                    <span className="bg-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-medium">
                      {sess.subject.split('(')[0].trim()}
                    </span>
                    <span>{sess.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Nav Links at bottom of Left Sidebar */}
        <div className="shrink-0 pt-2 border-t border-slate-200/80 space-y-1 text-xs">
          <button 
            onClick={() => onNavigate('roadmap')}
            className="w-full flex items-center justify-between p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Lộ trình học tập cá nhân</span>
            </div>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </button>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="w-full flex items-center justify-between p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Bảng điều khiển &amp; Nhiệm vụ</span>
            </div>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </aside>

      {/* Resizer Handle between Left and Center */}
      {isLeftOpen && (
        <div
          onMouseDown={() => setIsDraggingLeft(true)}
          className="w-1.5 hover:w-2.5 bg-slate-200/90 hover:bg-blue-400 active:bg-blue-600 cursor-col-resize transition-all flex items-center justify-center shrink-0 group z-30 select-none"
          title="Kéo sang trái/phải để thay đổi độ rộng menu lịch sử"
        >
          <div className="w-0.5 h-8 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CENTER + RIGHT SPLIT CONTAINER (Hiệu ứng Gemini 50/50 & Resizable)     */}
      {/* ========================================================================= */}
      <div 
        ref={centerSplitRef}
        className="flex-1 flex h-full overflow-hidden min-h-0 min-w-0"
      >
        {/* 2A. CENTER CHAT CANVAS: Khung tương tác AI, trò chuyện và hỏi đáp */}
        <section 
          style={{ 
            width: isRightOpen ? `${splitRatio * 100}%` : '100%',
            flex: isRightOpen ? 'none' : '1 1 0%'
          }}
          className="flex flex-col h-full bg-slate-50 relative overflow-hidden min-w-[300px] min-h-0 transition-[width] duration-75"
        >
          {/* Top Header Bar */}
          <div className="h-14 px-4 sm:px-6 border-b border-slate-200/90 bg-white/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 shadow-xs z-10">
            <div className="flex items-center gap-3">
              {/* Toggle Left Sidebar */}
              <button
                onClick={() => setIsLeftOpen(prev => !prev)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                title={isLeftOpen ? 'Thu gọn lịch sử' : 'Mở rộng lịch sử'}
              >
                <PanelLeft className="w-4 h-4" />
              </button>

              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-blue-500/20">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Dr. Minerva AI</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-200/60">
                    {selectedSubject.includes('Trò chuyện') || selectedSubject.includes('Chỉ Chat') ? '💬 Góc Tâm Sự & Chat Tự Do' : 'Cố vấn Khối A00 & IELTS'}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Trực tuyến • Gemini 3.8 Flash + AI Inference
                </div>
              </div>
            </div>

            {/* Subject Dropdown & Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <select
                value={selectedSubject}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedSubject(val);
                  setSessions(sPrev => sPrev.map(s => s.id === activeSessionId ? { ...s, subject: val } : s));
                  if (val.includes('Trò chuyện') || val.includes('Chỉ Chat')) {
                    setIsRightOpen(false);
                  }
                }}
                className="text-xs font-semibold bg-slate-100 border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs cursor-pointer"
              >
                <option value="Trò chuyện tự do (Chỉ Chat / Hỏi đáp)">💬 Trò chuyện tự do (Chỉ để Chat &amp; Hỏi đáp)</option>
                <option value="Toán học (Đại số & Giải tích)">Toán học: Đại số &amp; Giải tích</option>
                <option value="Vật lý 12 (Sóng & Quang học)">Vật lý 12: Sóng &amp; Quang</option>
                <option value="Hóa học 12 (Hóa hữu cơ)">Hóa học: Hóa hữu cơ</option>
                <option value="Lập trình & Thuật toán">Tin học: Lập trình Python</option>
                <option value="Tiếng Anh (IELTS Academic)">Tiếng Anh: IELTS Academic</option>
              </select>

              <button 
                onClick={() => alert('Đã trích xuất tệp PDF tóm tắt bài học & công thức sang thiết bị của bạn!')}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors" 
                title="Chia sẻ hoặc tải PDF"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  if (confirm('Đặt lại toàn bộ cuộc trò chuyện này về trạng thái ban đầu?')) {
                    const defaultSess = PRELOADED_SESSIONS[0];
                    setMessages(defaultSess.messages);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors" 
                title="Đặt lại hội thoại mẫu"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Toggle Right Sidebar / Split 50:50 */}
              <button
                onClick={() => {
                  if (!isRightOpen) {
                    handleOpenPractice();
                  } else {
                    setIsRightOpen(false);
                  }
                }}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                  isRightOpen 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
                title={isRightOpen ? 'Thu gọn bảng bài tập' : 'Mở chia đôi 50:50 Chat & Bài tập (Gemini)'}
              >
                <Columns className="w-4 h-4" />
                <span className="hidden md:inline text-[11px]">{isRightOpen ? 'Thu gọn' : 'Luyện tập 50:50'}</span>
              </button>
            </div>
          </div>

        {/* ========================================================================= */}
        {/* FLOATING CIRCULAR % PROGRESS WIDGET ("hình tròn % hoàn thành lơ lửng")    */}
        {/* Thay thế thanh ngang chèn chật chội bằng widget hình tròn lơ lửng tinh tế */}
        {/* ========================================================================= */}
        {studyContext && (
          <div className="absolute top-16 right-4 sm:right-6 z-30 select-none">
            <div className="relative">
              {/* Floating Circular Button */}
              <button
                type="button"
                onClick={() => setIsProgressPopoverOpen(prev => !prev)}
                className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center backdrop-blur-md shadow-xl transition-all duration-300 cursor-pointer active:scale-95 border ${
                  isCurrentTopicDone
                    ? 'bg-slate-900/90 hover:bg-slate-900 border-emerald-500/80 shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                    : 'bg-slate-900/90 hover:bg-slate-900 border-blue-500/70 shadow-blue-500/25 hover:border-blue-400'
                } ${isProgressPopoverOpen ? 'ring-2 ring-blue-400 scale-105' : 'hover:scale-105'}`}
                title={`Tiến độ hoàn thành: ${completionPercent}% (${studyContext.completedExercisesCount}/${studyContext.totalExercisesCount} bài). Nhấn để xem chi tiết!`}
              >
                {/* SVG Circular Progress Ring */}
                <svg className="w-10 h-10 sm:w-11 sm:h-11 -rotate-90 transform" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-slate-800"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Dynamic Progress Stroke */}
                  <path
                    className={`transition-all duration-700 ease-out ${
                      isCurrentTopicDone ? 'text-emerald-400' : 'text-blue-500'
                    }`}
                    strokeWidth="3.2"
                    strokeDasharray={`${completionPercent}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                {/* Center % text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className={`text-[10px] sm:text-[11px] font-black font-mono tracking-tighter ${
                    isCurrentTopicDone ? 'text-emerald-300' : 'text-white'
                  }`}>
                    {completionPercent}%
                  </span>
                </div>

                {/* Ping badge when 100% complete */}
                {isCurrentTopicDone && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900 items-center justify-center text-[8px] text-white font-bold">
                      ✓
                    </span>
                  </span>
                )}
              </button>

              {/* Popover Card */}
              {isProgressPopoverOpen && (
                <>
                  {/* Backdrop to close on click outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProgressPopoverOpen(false)}
                  />
                  <div className="absolute top-14 right-0 w-80 sm:w-88 bg-slate-950/95 backdrop-blur-xl border border-blue-500/40 rounded-2xl shadow-2xl p-4 text-white z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 relative shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold text-slate-200">Tiến độ Lộ trình AI</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsProgressPopoverOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Topic details */}
                    <div className="space-y-1">
                      <div className="text-[11px] text-blue-400 font-semibold flex items-center justify-between">
                        <span>Chuyên đề hiện tại</span>
                        <span className="text-[10px] bg-blue-900/70 text-blue-200 px-2 py-0.5 rounded-full border border-blue-700/60 font-medium">
                          {studyContext.subject}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug">
                        {studyContext.topicTitle}
                      </h4>
                    </div>

                    {/* Progress bar */}
                    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">Tiến độ bài tập:</span>
                        <span className="font-bold font-mono text-emerald-400">
                          {studyContext.completedExercisesCount}/{studyContext.totalExercisesCount} bài ({completionPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isCurrentTopicDone
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          }`}
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons inside Popover */}
                    <div className="space-y-2 pt-1">
                      {isCurrentTopicDone ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Đã hoàn thành 100% chuyên đề!</span>
                          </div>
                          {nextMilestone ? (
                            <button
                              type="button"
                              onClick={() => {
                                setIsProgressPopoverOpen(false);
                                handleAdvanceMilestone();
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md animate-pulse active:scale-98 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Mục tiêu tiếp: {nextMilestone.title.length > 22 ? nextMilestone.title.slice(0, 20) + '...' : nextMilestone.title} ➔</span>
                            </button>
                          ) : (
                            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-amber-400" />
                              <span>Đã hoàn thành 100% Lộ trình!</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProgressPopoverOpen(false);
                            handleOpenPractice();
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Mở Luyện tập 50:50 ({studyContext.totalExercisesCount - studyContext.completedExercisesCount} câu còn lại) ➔</span>
                        </button>
                      )}

                      {/* Bottom Nav Links */}
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProgressPopoverOpen(false);
                            onNavigate('roadmap');
                          }}
                          className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <span>Xem sơ đồ Lộ Trình</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const generated = generateAiExercisesFromPrompt(studyContext.topicTitle, studyContext.subject);
                            studySyncService.setCustomExercisesForTopic(generated.topic, generated.exercises);
                            studySyncService.setActiveContext({
                              topicTitle: generated.topic,
                              subject: generated.subject,
                              milestoneId: 'ai_' + Date.now(),
                              completedExercisesCount: 0,
                              totalExercisesCount: generated.exercises.length,
                              isDiagnosticChallenge: false
                            });
                            setSubmittedExercises({});
                            setMcqAnswers({});
                            setFillAnswers({});
                            setTrapSelectedSteps({});
                            setStepOrderings({});
                            if (generated.exercises[0]) {
                              setInChatSelectedExId(generated.exercises[0].id);
                            }
                            setIsProgressPopoverOpen(false);
                            setRightTab('practice');
                            setIsRightOpen(true);
                            setSplitRatio(0.5);
                            triggerXpToast(`✨ AI đã tạo bộ bài tập mới 4 dạng!`, 20);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI tạo bộ mới</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Celebration XP Toast */}
        {xpToast && (
          <div className="absolute top-24 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white border border-emerald-500/80 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">{xpToast.message}</div>
              <div className="text-[11px] text-emerald-400 font-semibold font-mono">+{xpToast.xp} XP • Đã đồng bộ sang Lộ trình & Thông tin cá nhân!</div>
            </div>
          </div>
        )}

        {/* Message Stream: Vùng cuộn tin nhắn */}
        <div 
          ref={chatContainerRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth min-h-0 scrollbar-thin scrollbar-thumb-slate-300"
        >
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Chat Message Stream */}

            {messages.map(msg => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Header info */}
                <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] text-slate-400 font-sans">
                  <span className="font-semibold text-slate-700">
                    {msg.sender === 'user' ? (api.getUser()?.full_name || 'Học viên') : 'Dr. Minerva AI'}
                  </span>
                  <span>•</span>
                  <span>{msg.time}</span>
                </div>

                {/* Message Content Container */}
                <div className={`max-w-3xl space-y-3 font-sans ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl rounded-tr-xs text-xs sm:text-sm leading-relaxed shadow-sm'
                    : 'bg-white border border-slate-200/90 text-slate-800 p-5 rounded-2xl rounded-tl-xs text-xs sm:text-sm leading-relaxed shadow-xs'
                }`}>
                  {/* Text Body */}
                  {msg.text ? (
                    msg.sender === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <FormattedMessage content={msg.text} />
                    )
                  ) : (
                    <div className="flex items-center gap-2 py-1 text-slate-400 text-xs font-sans">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse [animation-delay:200ms]" />
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse [animation-delay:400ms]" />
                      <span className="text-slate-500 font-medium ml-1">Dr. Minerva đang giải thích & tổng hợp kiến thức...</span>
                    </div>
                  )}

                  {/* Homework OCR Attachment Card (if present) */}
                  {msg.homeworkAttachment && (
                    <div className="mt-3 p-3.5 rounded-xl bg-blue-700/80 border border-blue-400/40 text-white space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          {msg.homeworkAttachment.title}
                        </span>
                        <span className="text-[10px] bg-blue-800 px-2 py-0.5 rounded text-blue-100 font-mono">
                          {msg.homeworkAttachment.confidence}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-blue-900/60 font-mono text-xs border border-blue-700/50">
                        {msg.homeworkAttachment.ocrText}
                      </div>
                    </div>
                  )}

                  {/* Action Bar for AI message */}
                  {msg.sender === 'ai' && msg.text && (
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(msg.text);
                            alert('Đã sao chép nội dung bài giải');
                          }}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </button>
                        <button 
                          onClick={() => {
                            const u = new SpeechSynthesisUtterance(msg.text.slice(0, 200));
                            u.lang = 'vi-VN';
                            window.speechSynthesis?.speak(u);
                          }}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Đọc to</span>
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400">AI Counselor v2.4</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Auto scroll anchor */}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* Floating Scroll to Bottom Button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-28 right-8 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-300 shadow-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all text-xs font-semibold"
          >
            <ChevronDown className="w-4 h-4 text-blue-600 animate-bounce" />
            Cuộn xuống mới nhất
          </button>
        )}

        {/* Bottom Input Dock */}
        <div className="p-3 sm:p-4 border-t border-slate-200/90 bg-white/95 backdrop-blur-md shrink-0 z-10 shadow-xs">
          <div className="max-w-4xl mx-auto space-y-2.5">
            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              {selectedSubject.includes('Trò chuyện') || selectedSubject.includes('Chỉ Chat') ? (
                <>
                  <button
                    onClick={() => {
                      setInputText('Chào Dr. Minerva, dạo này em học nhiều thấy hơi căng thẳng và quá tải, bạn có lời khuyên nào giúp em giải tỏa áp lực không?');
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold shrink-0 transition-colors border border-emerald-200/70 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    ☕ Tâm sự &amp; Giải tỏa áp lực học tập
                  </button>
                  <button
                    onClick={() => {
                      setInputText('Dr. Minerva ơi, làm sao để cân bằng giữa việc học trên trường, đi học thêm và thời gian tự học ở nhà hiệu quả?');
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium shrink-0 transition-colors border border-blue-200/60"
                  >
                    💡 Cách quản lý thời gian &amp; tự học
                  </button>
                  <button
                    onClick={() => {
                      setInputText('Bạn có thể chia sẻ cho mình một phương pháp giữ tỉnh táo và tập trung cao độ khi học bài buổi tối không?');
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium shrink-0 transition-colors border border-purple-200/60"
                  >
                    🎯 Giữ tỉnh táo và tập trung buổi tối
                  </button>
                  <button
                    onClick={() => {
                      setInputText('Kể cho mình nghe một câu chuyện truyền cảm hứng của những thủ khoa hoặc danh nhân từng vượt khó học tập với!');
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium shrink-0 transition-colors border border-amber-200/60"
                  >
                    ✨ Câu chuyện truyền cảm hứng
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setInputText('Chào Cố vấn AI! Em muốn học và luyện tập chuyên đề: Tích phân hàm ẩn và kỹ thuật đổi biến số đối xứng (Toán học). Hãy bắt đầu bằng một bài toán ví dụ hoặc tóm tắt phương pháp giải!');
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold shrink-0 transition-colors border border-blue-200/70 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    📐 Tích phân hàm ẩn &amp; Đổi biến đối xứng
                  </button>
                  <button
                    onClick={() => {
                      setInputText('Tóm tắt lý thuyết Sóng dừng và phương pháp giải bài toán vân cực đại cực tiểu giao thoa sóng cơ (Vật lý 12).');
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium shrink-0 transition-colors border border-indigo-200/60"
                  >
                    ⚡ Lý thuyết Sóng dừng &amp; Vân trùng
                  </button>
                  <button
                    onClick={() => {
                      setInputText('Hướng dẫn cấu trúc viết luận IELTS Writing Task 2 theo phương pháp PEEL đạt band 7.5+.');
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium shrink-0 transition-colors border border-purple-200/60"
                  >
                    🌐 IELTS Writing Task 2 (PEEL)
                  </button>
                  <button
                    onClick={() => {
                      setInputText('Lập kế hoạch nước rút 14 ngày cho khối thi A00 (Toán - Lý - Hóa) nhắm mục tiêu 27 điểm.');
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium shrink-0 transition-colors border border-emerald-200/60"
                  >
                    📅 Kế hoạch ôn thi 14 ngày
                  </button>
                </>
              )}
            </div>

            {/* Input Box */}
            <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-300/80 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white focus-within:border-transparent transition-all shadow-xs">
              <button 
                onClick={() => alert('Chọn tải lên đề thi dạng PDF hoặc hình ảnh bài tập chụp từ điện thoại để AI OCR nhận diện tức thì.')}
                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-white transition-colors"
                title="Tải lên tệp đề thi (PDF / Ảnh)"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  alert('Đang kích hoạt microphone... Hãy nói câu hỏi về đề thi để AI chuyển thành văn bản.');
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-white transition-colors"
                title="Hỏi bằng giọng nói"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Hỏi Cố vấn học thuật về đề thi, công thức toán hoặc phương pháp ôn tập..."
                className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />

              <button 
                onClick={() => handleSend()}
                disabled={isStreaming || !inputText.trim()}
                className={`p-2.5 rounded-xl font-semibold shadow-xs transition-all flex items-center justify-center ${
                  isStreaming || !inputText.trim()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
                }`}
                title="Gửi câu hỏi"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* GEMINI VERTICAL SPLITTER: Kéo sang trái/phải để chia đôi màn hình 50:50 hoặc tùy chỉnh */}
      {isRightOpen && (
        <div
          onMouseDown={() => setIsDraggingSplitter(true)}
          className={`hidden md:flex w-2 hover:w-3 bg-slate-200/90 hover:bg-blue-400 active:bg-blue-600 cursor-col-resize transition-all items-center justify-center shrink-0 z-30 select-none ${
            isDraggingSplitter ? 'bg-blue-500 w-3' : ''
          }`}
          title="Kéo sang trái/phải để điều chỉnh tỷ lệ chia đôi màn hình (Gemini)"
        >
          <div className="w-0.5 h-12 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RIGHT SIDEBAR: Khung Bài Tập Đen (50:50 Gemini) & Sổ tay tri thức AI   */}
      {/* ========================================================================= */}
      <aside 
        style={{ 
          width: isRightOpen ? `${(1 - splitRatio) * 100}%` : '0px',
          flex: isRightOpen ? 'none' : '0 0 0%'
        }}
        className={`${
          isRightOpen ? 'flex fixed inset-y-0 right-0 z-40 md:relative md:z-20 md:flex shadow-2xl md:shadow-none' : 'hidden'
        } flex-col h-full border-l border-slate-200/90 bg-white/98 backdrop-blur-md shrink-0 overflow-hidden min-h-0 min-w-[320px] transition-[width] duration-75`}
      >
        {/* Right Sidebar Header with 50:50 Reset */}
        <div className="p-3 border-b border-slate-200/90 shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Góc Học Tập &amp; Luyện Đề</span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {Math.round((1 - splitRatio) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSplitRatio(0.5)}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="Đặt lại chia đều 50:50 (Gemini split)"
              >
                <Columns className="w-3 h-3" />
                <span>50:50</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRightOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Đóng bảng bên phải"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Sidebar Tab Selector (4 Tabs) */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setRightTab('practice')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
                rightTab === 'practice' 
                  ? 'bg-white text-emerald-700 shadow-xs font-bold' 
                  : 'hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bài tập</span>
            </button>
            <button
              onClick={() => setRightTab('formulas')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
                rightTab === 'formulas' 
                  ? 'bg-white text-blue-700 shadow-xs font-bold' 
                  : 'hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Sổ tay</span>
            </button>
            <button
              onClick={() => setRightTab('pomodoro')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
                rightTab === 'pomodoro' 
                  ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                  : 'hover:text-slate-900'
              }`}
            >
              <Timer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pomodoro</span>
            </button>
            <button
              onClick={() => setRightTab('checklist')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
                rightTab === 'checklist' 
                  ? 'bg-white text-purple-700 shadow-xs font-bold' 
                  : 'hover:text-slate-900'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5 text-purple-600" />
              <span>Nhiệm vụ</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 0: BÀI TẬP ĐA DẠNG (PHẦN BÀI TẬP ĐEN TƯƠNG TÁC CAO CẤP) ================= */}
        {rightTab === 'practice' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-200">
            {/* PHẦN BÀI TẬP ĐEN (DARK INTERACTIVE PRACTICE CARD) */}
            {studyContext && (
              <div ref={practiceCardRef} className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-2xl border border-blue-800/80 shadow-lg p-4 sm:p-4.5 space-y-3.5 transition-all">
                {/* Header */}
                <div className="space-y-3 pb-3 border-b border-slate-800">
                  <div className="flex items-start gap-2.5">
                    <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                      <Target className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 flex-wrap leading-normal">
                          <span>Chuyên đề: {cleanTopicFromPrompt(studyContext.topicTitle)}</span>
                        </h3>
                        <span className="text-[10px] font-semibold bg-blue-800/70 text-blue-200 px-2.5 py-0.5 rounded-full border border-blue-700/50 shrink-0">
                          {studyContext.subject}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Chinh phục các bài tập bên dưới để đồng bộ và đẩy nhanh tiến độ Lộ trình học tập!
                      </p>
                    </div>
                  </div>

                  {/* Nút hành động dàn hàng ngang riêng, không ép thu hẹp tiêu đề */}
                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    <button
                      type="button"
                      onClick={handleCreateNewAiForm}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-indigo-100 hover:text-white text-[11px] font-semibold border border-indigo-500/60 flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                      title="Yêu cầu AI sinh thêm một Form chuyên sâu mới hoàn toàn"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>✨ AI Tạo Form Mới</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddMoreExercises}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 hover:text-white text-[11px] font-semibold border border-emerald-500/60 flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                      title="Nhờ AI sinh thêm 3 câu hỏi mới vào Form này"
                    >
                      <Plus className="w-3 h-3 text-emerald-200" />
                      <span>+3 câu AI</span>
                    </button>

                    <div className="text-[11px] bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 shrink-0">
                      <span>Tiến độ: </span>
                      <span className="font-bold font-mono text-emerald-400">
                        {studyContext.completedExercisesCount}/{studyContext.totalExercisesCount} bài
                      </span>
                    </div>

                    {isCurrentTopicDone ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-900/80 text-emerald-300 border border-emerald-600/60 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>✓ Đã hoàn thành</span>
                        </span>
                        {nextMilestone && (
                          <button
                            onClick={handleAdvanceMilestone}
                            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer animate-pulse active:scale-95"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Mục tiêu tiếp theo ➔</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-400 font-medium px-2 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/20 shrink-0">
                        {studyContext.totalExercisesCount - studyContext.completedExercisesCount} bài còn lại
                      </span>
                    )}
                  </div>
                </div>

                {/* Form Selector Bar (Hiển thị nhiều Form do AI tạo) */}
                {topicForms.length > 0 && (
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                    <span className="text-[11px] text-slate-400 font-semibold shrink-0 flex items-center gap-1 px-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" /> Chọn Form bài:
                    </span>
                    {topicForms.map((f, fIdx) => {
                      const isActive = (activeForm?.id === f.id) || (!activeForm && fIdx === 0);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleSwitchForm(f.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          <span className="max-w-[170px] truncate">{f.title.split('(')[0].trim()}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400'
                          }`}>
                            {f.exercises.length} câu
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Exercise selection tabs (Hỗ trợ 6 định dạng đa dạng: Trắc nghiệm, Điền đáp số, Bắt bẫy, Sắp xếp bước, Ghép đôi, Đúng/Sai 4 ý) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {currentTopicExercises.map((ex, idx) => {
                    const isDone = studySyncService.isExerciseCompleted(ex.id) || submittedExercises[ex.id]?.isCorrect;
                    const isSelected = activeInChatEx?.id === ex.id;
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => setInChatSelectedExId(ex.id)}
                        className={`px-2.5 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all text-xs shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm font-bold ring-2 ring-blue-400/50'
                            : isDone
                            ? 'bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
                            : 'bg-slate-800/90 border border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span className="w-4 h-4 text-slate-400 font-mono text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                        )}
                        <span>
                          {ex.type === 'multiple_choice' ? 'Trắc nghiệm' :
                           ex.type === 'fill_blank' ? 'Điền đáp số' :
                           ex.type === 'trap_detect' ? 'Bắt bẫy' :
                           ex.type === 'ordering_steps' ? 'Sắp xếp bước' :
                           ex.type === 'matching_pairs' ? 'Ghép đôi' :
                           ex.type === 'true_false_group' ? 'Đúng/Sai 4 ý' : 'Bài tập'}
                        </span>
                        {!isDone && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Exercise In-Card Body */}
                {activeInChatEx && (
                  <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3.5 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-400">{activeInChatEx.difficulty}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-amber-400 font-mono font-bold">+{activeInChatEx.xp} XP</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={activeExIndex === 0}
                          onClick={handlePrevExercise}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
                          title="Câu trước"
                        >
                          ←
                        </button>
                        <span className="text-[11px] text-slate-400 font-mono px-1">
                          {activeExIndex + 1}/{currentTopicExercises.length}
                        </span>
                        <button
                          type="button"
                          disabled={activeExIndex >= currentTopicExercises.length - 1}
                          onClick={handleNextExercise}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
                          title="Câu tiếp theo"
                        >
                          →
                        </button>

                        {(studySyncService.isExerciseCompleted(activeInChatEx.id) || submittedExercises[activeInChatEx.id]?.isCorrect) && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] ml-1 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/60">
                            <Check className="w-3 h-3" /> Đã xong
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-100 font-medium leading-relaxed">
                      {activeInChatEx.question}
                    </p>

                    {/* FORMAT 1: Multiple Choice */}
                    {activeInChatEx.type === 'multiple_choice' && activeInChatEx.options && (
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        {activeInChatEx.options.map((opt, optIdx) => {
                          const isChosen = mcqAnswers[activeInChatEx.id] === optIdx;
                          const isCorrect = activeInChatEx.correctAnswer === optIdx;
                          const isDone = studySyncService.isExerciseCompleted(activeInChatEx.id) || submittedExercises[activeInChatEx.id]?.isCorrect;
                          
                          let btnCls = "bg-slate-900/90 text-slate-200 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600";
                          if (isDone) {
                            if (isCorrect) btnCls = "bg-emerald-600 text-white border-emerald-500 font-bold";
                            else if (isChosen) btnCls = "bg-rose-600 text-white border-rose-500 line-through";
                          } else if (isChosen) {
                            btnCls = "bg-blue-600 text-white border-blue-500 font-bold";
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={isDone}
                              onClick={() => handleSelectMCQ(activeInChatEx, optIdx)}
                              className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${btnCls}`}
                            >
                              <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="leading-snug">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* FORMAT 2: Fill in the Blank */}
                    {activeInChatEx.type === 'fill_blank' && (
                      <div className="space-y-2 pt-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            disabled={studySyncService.isExerciseCompleted(activeInChatEx.id) || submittedExercises[activeInChatEx.id]?.isCorrect}
                            value={fillAnswers[activeInChatEx.id] || ''}
                            onChange={(e) => setFillAnswers(prev => ({ ...prev, [activeInChatEx.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitFill(activeInChatEx); }}
                            placeholder={activeInChatEx.placeholder || 'Nhập câu trả lời...'}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
                          />
                          <button
                            type="button"
                            disabled={studySyncService.isExerciseCompleted(activeInChatEx.id) || submittedExercises[activeInChatEx.id]?.isCorrect}
                            onClick={() => handleSubmitFill(activeInChatEx)}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                          >
                            Kiểm tra
                          </button>
                        </div>
                        {activeInChatEx.hint && !studySyncService.isExerciseCompleted(activeInChatEx.id) && (
                          <div className="text-[11px] text-amber-300/90 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Gợi ý: {activeInChatEx.hint}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* FORMAT 3: Trap Detect */}
                    {activeInChatEx.type === 'trap_detect' && activeInChatEx.options && (
                      <div className="space-y-2 pt-1">
                        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Chỉ ra biến đổi hoặc bước lập luận SAI lầm nhất:</span>
                        </div>
                        <div className="space-y-1.5">
                          {activeInChatEx.options.map((opt, optIdx) => {
                            const isChosen = trapSelectedSteps[activeInChatEx.id] === optIdx;
                            const isDone = studySyncService.isExerciseCompleted(activeInChatEx.id) || submittedExercises[activeInChatEx.id]?.isCorrect;
                            const isCorrectTrap = activeInChatEx.correctAnswer === optIdx;

                            let btnCls = "bg-slate-900/90 text-slate-200 border-slate-700/80 hover:bg-slate-800";
                            if (isDone) {
                              if (isCorrectTrap) btnCls = "bg-amber-600 text-white border-amber-500 font-bold";
                              else if (isChosen) btnCls = "bg-rose-600 text-white border-rose-500 line-through";
                            } else if (isChosen) {
                              btnCls = "bg-amber-600 text-white border-amber-500 font-bold";
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={isDone}
                                onClick={() => handleSelectTrapStep(activeInChatEx, optIdx)}
                                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${btnCls}`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="font-mono text-amber-400 font-bold">[{optIdx + 1}]</span>
                                  <span>{opt}</span>
                                </span>
                                {isDone && isCorrectTrap && (
                                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">Bẫy chính xác</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* FORMAT 4: Step Ordering */}
                    {activeInChatEx.type === 'ordering_steps' && (
                      <div className="space-y-2 pt-1">
                        <div className="text-xs text-blue-300 font-semibold flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-blue-400" />
                          <span>Dùng mũi tên ↑ / ↓ để sắp xếp các bước tư duy chuẩn mực:</span>
                        </div>
                        <div className="space-y-1.5">
                          {(stepOrderings[activeInChatEx.id] || activeInChatEx.orderingSteps || []).map((step, idx, arr) => (
                            <div 
                              key={step.id} 
                              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span>{step.text}</span>
                              </div>
                              {!(studySyncService.isExerciseCompleted(activeInChatEx.id) || submittedExercises[activeInChatEx.id]?.isCorrect) && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveStep(activeInChatEx, idx, idx - 1)}
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 cursor-pointer"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === arr.length - 1}
                                    onClick={() => handleMoveStep(activeInChatEx, idx, idx + 1)}
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 cursor-pointer"
                                  >
                                    ↓
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {!(studySyncService.isExerciseCompleted(activeInChatEx.id) || submittedExercises[activeInChatEx.id]?.isCorrect) && (
                          <button
                            type="button"
                            onClick={() => handleVerifyOrdering(activeInChatEx)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Xác nhận thứ tự các bước
                          </button>
                        )}
                      </div>
                    )}

                    {/* FORMAT 5: Matching Pairs */}
                    {activeInChatEx.type === 'matching_pairs' && activeInChatEx.matchingPairs && (
                      <div className="space-y-3 pt-1">
                        <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>Bấm chọn một ô ở Cột Trái, sau đó bấm ô tương ứng ở Cột Phải để ghép cặp:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Cột Trái (Định lý / Khái niệm) */}
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cột Trái (Khái niệm)</div>
                            {activeInChatEx.matchingPairs.map((pair, pIdx) => {
                              const isSelected = selectedMatchingLeft?.pairId === pair.id;
                              const isMatched = !!userMatches[activeInChatEx.id]?.[pair.id];
                              return (
                                <button
                                  key={pair.id}
                                  type="button"
                                  onClick={() => handleSelectMatchingLeft(activeInChatEx.id, pair.id)}
                                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2 cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-blue-400 font-bold ring-2 ring-blue-400/50'
                                      : isMatched
                                      ? 'bg-emerald-950/60 text-emerald-200 border-emerald-600'
                                      : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                                  }`}
                                >
                                  <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                                    {String.fromCharCode(65 + pIdx)}
                                  </span>
                                  <span className="leading-snug">{pair.left}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Cột Phải (Ứng dụng / Ý nghĩa) */}
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cột Phải (Ứng dụng)</div>
                            {activeInChatEx.matchingPairs.map((pair, pIdx) => {
                              const isMatchedToThis = Object.values(userMatches[activeInChatEx.id] || {}).includes(pair.id);
                              return (
                                <button
                                  key={pair.id}
                                  type="button"
                                  onClick={() => handleSelectMatchingRight(activeInChatEx, pair.id)}
                                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2 cursor-pointer ${
                                    isMatchedToThis
                                      ? 'bg-emerald-950/60 text-emerald-200 border-emerald-600'
                                      : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                                  }`}
                                >
                                  <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                                    {pIdx + 1}
                                  </span>
                                  <span className="leading-snug">{pair.right}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {/* Reset matches button */}
                        {userMatches[activeInChatEx.id] && Object.keys(userMatches[activeInChatEx.id]).length > 0 && (
                          <button
                            type="button"
                            onClick={() => setUserMatches(prev => ({ ...prev, [activeInChatEx.id]: {} }))}
                            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Ghép lại từ đầu</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* FORMAT 6: True / False Group (Format THPT 2025) */}
                    {activeInChatEx.type === 'true_false_group' && activeInChatEx.statements && (
                      <div className="space-y-3 pt-1">
                        <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>Trắc nghiệm Đúng / Sai 4 ý (Định dạng đề thi mới THPT 2025):</span>
                        </div>
                        <div className="space-y-2">
                          {activeInChatEx.statements.map((stmt) => {
                            const userChoice = tfAnswers[activeInChatEx.id]?.[stmt.id];
                            const isDone = studySyncService.isExerciseCompleted(activeInChatEx.id) || submittedExercises[activeInChatEx.id]?.isCorrect;
                            return (
                              <div
                                key={stmt.id}
                                className={`p-3 rounded-xl border transition-all space-y-2 ${
                                  isDone
                                    ? userChoice === stmt.isCorrect
                                      ? 'bg-emerald-950/40 border-emerald-600/70 text-slate-100'
                                      : 'bg-rose-950/40 border-rose-600/70 text-slate-100'
                                    : 'bg-slate-900 border-slate-700/80 text-slate-200'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="text-xs font-medium leading-relaxed">
                                    <span className="font-bold text-amber-400 mr-1.5">{stmt.label}</span>
                                    {stmt.statement}
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      disabled={isDone}
                                      onClick={() => handleSelectTrueFalse(activeInChatEx.id, stmt.id, true)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        userChoice === true
                                          ? 'bg-emerald-600 text-white shadow-sm'
                                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                      }`}
                                    >
                                      Đúng
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isDone}
                                      onClick={() => handleSelectTrueFalse(activeInChatEx.id, stmt.id, false)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        userChoice === false
                                          ? 'bg-rose-600 text-white shadow-sm'
                                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                      }`}
                                    >
                                      Sai
                                    </button>
                                  </div>
                                </div>
                                {isDone && stmt.explanation && (
                                  <div className="text-[11px] text-slate-300 pt-1.5 border-t border-white/10 flex items-start gap-1.5">
                                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                      stmt.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                    }`}>
                                      {stmt.isCorrect ? 'ĐÁP ÁN: ĐÚNG' : 'ĐÁP ÁN: SAI'}
                                    </span>
                                    <span>{stmt.explanation}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {!(studySyncService.isExerciseCompleted(activeInChatEx.id) || submittedExercises[activeInChatEx.id]?.isCorrect) && (
                          <button
                            type="button"
                            onClick={() => handleSubmitTrueFalse(activeInChatEx)}
                            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-98"
                          >
                            Xác nhận đánh giá Đúng / Sai
                          </button>
                        )}
                      </div>
                    )}

                    {/* Result Feedback Banner */}
                    {submittedExercises[activeInChatEx.id] && (
                      <div className={`p-3 rounded-xl text-xs border ${
                        submittedExercises[activeInChatEx.id].isCorrect
                          ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                          : 'bg-rose-950/60 border-rose-600 text-rose-200'
                      }`}>
                        <div className="font-bold mb-1">{submittedExercises[activeInChatEx.id].message}</div>
                        {activeInChatEx.explanation && (
                          <div className="text-[11px] text-slate-300 leading-relaxed border-t border-white/10 pt-1 mt-1">
                            <span className="font-semibold text-white">Giải thích: </span>{activeInChatEx.explanation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Instant 1-Click Ask AI Action Bar */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Hỏi AI ngay:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAiAutoSolve(activeInChatEx)}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 text-emerald-300 border border-emerald-700/80 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
                        title="AI sẽ tự động giải mẫu chi tiết trong chat và hoàn thành bài tập này vào khung bên phải"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>🤖 AI Tự làm &amp; Giải mẫu</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const qText = `Chào Cố vấn AI! Em đang làm câu ${activeExIndex + 1} ("${activeInChatEx.question.slice(0, 75)}..."). Cố vấn gợi ý giúp em bước tư duy đầu tiên mà không làm lộ đáp án nhé!`;
                          handleSend(qText);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                      >
                        <Lightbulb className="w-3 h-3 text-amber-400" />
                        <span>Xin gợi ý bước giải</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const qText = `Cố vấn AI ơi, hãy giảng giải chi tiết phương pháp giải câu ${activeExIndex + 1}: "${activeInChatEx.question.slice(0, 90)}..." và chỉ ra các bẫy thường gặp giúp em nhé!`;
                          handleSend(qText);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                      >
                        <HelpCircle className="w-3 h-3 text-purple-400" />
                        <span>Giảng giải chi tiết</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputText(`Đối với bài toán câu ${activeExIndex + 1}: "${activeInChatEx.question.slice(0, 60)}...", em thắc mắc về chỗ `);
                          inputRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <MessageSquare className="w-3 h-3 text-slate-400" />
                        <span>Tự đặt câu hỏi</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Completion Filter & Overview */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCompletionFilter('uncompleted')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  completionFilter === 'uncompleted'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chưa làm ({uncompletedExercises.length})
              </button>
              <button
                type="button"
                onClick={() => setCompletionFilter('all')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  completionFilter === 'all'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({currentTopicExercises.length})
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 1: SỔ TAY TRI THỨC & CÔNG THỨC (AI TỰ GỢI Ý) ================= */}
        {rightTab === 'formulas' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-200">
            {/* AI Smart Auto-Suggestion Card: Tự động đề xuất theo chuyên đề, không cần chọn thủ công */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-700/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  AI Tự Động Đề Xuất Công Thức &amp; Định Lý
                </span>
                <span className="text-[10px] font-bold bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full border border-blue-400/40">
                  {studyContext.subject}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-100">
                Chuyên đề: <span className="text-amber-300">{studyContext.topicTitle}</span>
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Hệ thống AI tự động trích xuất các công thức trọng tâm, hệ thức truy hồi và phương pháp tư duy phù hợp nhất cho bài học hiện tại mà bạn không cần chọn môn thủ công.
              </p>
            </div>

            {/* Quick Filter Search for formulas */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={formulaSearch}
                onChange={(e) => setFormulaSearch(e.target.value)}
                placeholder="Tìm nhanh công thức, định lý..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Formula Cards */}
            <div className="space-y-3">
              {displayFormulas.map(item => {
                const isExpanded = expandedFormulaId === item.id;
                const isCopied = copiedFormulaId === item.id;

                return (
                  <div 
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/90 space-y-2 hover:border-blue-300 transition-all shadow-xs"
                  >
                    <div 
                      onClick={() => setExpandedFormulaId(isExpanded ? null : item.id)}
                      className="flex items-start justify-between cursor-pointer gap-2"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full inline-block mb-1">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 leading-snug">
                          {item.title}
                        </h4>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                    </div>

                    {/* Formula Math Box */}
                    <div className="p-2 rounded-lg bg-slate-900 text-sky-200 font-mono text-xs border border-slate-800 overflow-x-auto text-center leading-relaxed">
                      {item.formula}
                    </div>

                    {/* Explanation */}
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {item.explanation}
                    </p>

                    {/* Expanded Detail / Example */}
                    {isExpanded && item.example && (
                      <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-950 text-[11px] space-y-1">
                        <div className="font-bold flex items-center gap-1 text-amber-800">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Ví dụ minh họa:</span>
                        </div>
                        <p className="font-mono text-[10px] text-amber-900">{item.example}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-1.5 flex items-center justify-between text-xs gap-2">
                      <button
                        onClick={() => handleCopyFormula(item)}
                        className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 text-[11px] font-medium transition-all"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Đã sao chép' : 'Sao chép LaTeX'}</span>
                      </button>

                      <button
                        onClick={() => handleInsertFormulaToInput(item)}
                        className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-[11px] font-semibold transition-all shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Hỏi AI về công thức này</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: POMODORO TẬP TRUNG ================= */}
        {rightTab === 'pomodoro' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0 scrollbar-thin scrollbar-thumb-slate-200 text-center">
            {/* Mode Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
              <button
                onClick={() => {
                  setTimerMode('work');
                  setPomodoroSeconds(25 * 60);
                  setIsTimerRunning(false);
                }}
                className={`py-1 px-3 rounded-lg transition-all ${
                  timerMode === 'work' ? 'bg-indigo-600 text-white shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Học sâu (25 phút)
              </button>
              <button
                onClick={() => {
                  setTimerMode('break');
                  setPomodoroSeconds(5 * 60);
                  setIsTimerRunning(false);
                }}
                className={`py-1 px-3 rounded-lg transition-all ${
                  timerMode === 'break' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Nghỉ ngơi (5 phút)
              </button>
            </div>

            {/* Circular Timer Visual */}
            <div className="relative w-44 h-44 mx-auto rounded-full bg-gradient-to-tr from-slate-900 to-indigo-950 border-4 border-indigo-400/30 flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-500/10">
              <span className="text-4xl font-mono font-bold tracking-tight">
                {formatTime(pomodoroSeconds)}
              </span>
              <span className="text-[11px] text-indigo-300 font-medium mt-1">
                {timerMode === 'work' ? '🎯 Phiên tập trung' : '☕ Thư giãn mắt'}
              </span>
              {isTimerRunning && (
                <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-20 pointer-events-none" />
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`py-2 px-6 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all ${
                  isTimerRunning 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isTimerRunning ? 'Tạm dừng' : 'Bắt đầu học'}</span>
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setPomodoroSeconds(timerMode === 'work' ? 25 * 60 : 5 * 60);
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Đặt lại đồng hồ"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Pomodoro Stats */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 text-left">
              <div className="flex items-center justify-between font-semibold">
                <span>Tiến độ Pomodoro hôm nay:</span>
                <span className="text-indigo-600 font-bold">{completedPomodoros}/4 phiên</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map(idx => (
                  <div 
                    key={idx}
                    className={`flex-1 h-2 rounded-full ${
                      idx <= completedPomodoros ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-500 italic">
                Cứ sau mỗi 4 phiên học sâu 25 phút, hãy nghỉ ngơi 15 phút để não bộ tái tạo năng lượng.
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB 3: NHIỆM VỤ RÈN LUYỆN ================= */}
        {rightTab === 'checklist' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-200">
            {/* Header with Stats */}
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Nhiệm Vụ Cần Hoàn Thành
              </h4>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {checklist.filter(c => c.done).length}/{checklist.length} xong
              </span>
            </div>

            {/* Filter checklist */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-[10px] font-semibold text-slate-600">
              <button
                onClick={() => setChecklistFilter('all')}
                className={`flex-1 py-1 rounded ${checklistFilter === 'all' ? 'bg-white shadow-xs text-slate-900 font-bold' : ''}`}
              >
                Tất cả ({checklist.length})
              </button>
              <button
                onClick={() => setChecklistFilter('pending')}
                className={`flex-1 py-1 rounded ${checklistFilter === 'pending' ? 'bg-white shadow-xs text-slate-900 font-bold' : ''}`}
              >
                Chưa xong ({checklist.filter(c => !c.done).length})
              </button>
              <button
                onClick={() => setChecklistFilter('done')}
                className={`flex-1 py-1 rounded ${checklistFilter === 'done' ? 'bg-white shadow-xs text-slate-900 font-bold' : ''}`}
              >
                Đã xong ({checklist.filter(c => c.done).length})
              </button>
            </div>

            {/* Add new task input */}
            <form onSubmit={handleAddChecklistItem} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Thêm bài tập cần làm..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                title="Thêm nhiệm vụ"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Task list items */}
            <div className="space-y-2">
              {checklist
                .filter(item => {
                  if (checklistFilter === 'pending') return !item.done;
                  if (checklistFilter === 'done') return item.done;
                  return true;
                })
                .map(item => (
                  <div 
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border ${
                      item.done 
                        ? 'bg-slate-50/80 border-slate-200 text-slate-400' 
                        : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-300 shadow-xs'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={item.done}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={`text-xs leading-relaxed flex-1 ${item.done ? 'line-through text-slate-400' : 'font-medium'}`}>
                      {item.text}
                    </span>
                    {item.done && (
                      <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                        +20 XP
                      </span>
                    )}
                  </div>
                ))}
            </div>

            {checklist.some(c => c.done) && (
              <button
                onClick={handleClearCompletedTasks}
                className="w-full py-1.5 text-center text-[11px] text-slate-500 hover:text-rose-600 transition-colors"
              >
                Dọn dẹp các việc đã hoàn thành
              </button>
            )}
          </div>
        )}

        {/* Motivational Quote at bottom of right sidebar */}
        <div className="p-3.5 border-t border-slate-200/90 shrink-0 bg-gradient-to-br from-blue-50/90 to-indigo-50/80 text-xs text-blue-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-blue-900">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Lời khuyên từ Cố vấn
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed italic">
            "Sự kiên trì qua từng câu hỏi khó chính là chìa khóa mở cánh cổng Đại học Bách Khoa và các trường Đại học Top đầu."
          </p>
        </div>
      </aside>
      </div>
    </div>
  );
};

export default ChatPage;
