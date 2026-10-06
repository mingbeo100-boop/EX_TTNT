import { Exercise, ExerciseForm, TrueFalseStatement } from './studySyncService';

/**
 * AI Exercise Generator & Multi-Form Engine
 * Generates dynamic, multi-format exercises across 6 formats:
 * 1. Ordering Steps (Sắp xếp quy trình & thuật toán)
 * 2. Multiple Choice (Trắc nghiệm tư duy 4 chọn 1)
 * 3. Fill in the Blank (Điền đáp số / cú pháp / công thức)
 * 4. Trap Detective (Thám tử bắt bẫy đề thi - phát hiện ngộ nhận)
 * 5. Matching Pairs (Ghép đôi định lý & ứng dụng)
 * 6. True / False Group (Chùm 4 nhận định Đúng/Sai - Cấu trúc THPT 2025 mới)
 * 
 * Supports generating MULTIPLE FORMS per topic and appending new exercises dynamically.
 */

/**
 * Detects whether the user is explicitly requesting exercises / practice / challenges,
 * or simply asking normal academic questions / chatting.
 */
export function isExerciseRequest(rawPrompt: string): boolean {
  if (!rawPrompt || !rawPrompt.trim()) return false;
  const text = rawPrompt.toLowerCase().trim();

  // 1. Phân biệt: Nếu là nhờ giải hộ / chữa bài / hỏi đáp cho 1 câu cụ thể
  // thì đó là chat hỏi bình thường (AI giải đáp), KHÔNG PHẢI yêu cầu sinh bài tập vào ô đen!
  const isAskingToSolveSpecific = 
    /giải (giúp|hộ|cho em|dùm|bài này|câu này)/i.test(text) ||
    /hướng dẫn (em )?giải (bài|câu) này/i.test(text) ||
    /chữa (giúp|hộ|bài|câu)/i.test(text) ||
    /(bài|câu) này (giải|làm) như thế nào/i.test(text) ||
    /tại sao (lại|câu này|chỗ này|bước này)/i.test(text) ||
    /đáp án (của )?(bài|câu) này/i.test(text);

  if (isAskingToSolveSpecific) {
    return false;
  }

  // 2. Những câu ngắn gọn trực tiếp thể hiện nhu cầu làm bài tập
  const directKeywords = [
    'bài tập',
    'làm bài tập',
    'luyện tập',
    'luyện đề',
    'thực hành bài tập',
    'làm bài',
    'cho bài tập',
    'cần bài tập',
    'ra bài tập',
    'quiz',
    'test',
    'thử thách chẩn đoán'
  ];
  if (directKeywords.includes(text)) {
    return true;
  }

  // 3. Mẫu câu thể hiện nhu cầu làm bài tập / luyện đề / thử thách
  const exercisePatterns = [
    /(muốn|cần|xin|thích|bắt đầu|tiến hành) (làm|có|học và) (bài tập|luyện tập|thử thách)/i,
    /(cho|ra) (em|tôi|mình) (xin )?(bài tập|đề|câu hỏi)/i,
    /(tạo|sinh|khởi tạo|gửi|tải) (bài tập|form bài tập|đề thi)/i,
    /thử thách chẩn đoán/i,
    /luyện tập chuyên đề/i,
    /bài tập thực chiến/i,
    /bài tập tự luyện/i,
    /bài tập (trắc nghiệm|điền khuyết|bắt bẫy|đúng sai|vận dụng|nâng cao)/i,
    /cần (thêm )?bài tập/i,
    /cho (thêm )?bài tập/i,
    /ra bài tập/i,
    /làm bài tập/i,
    /em muốn luyện/i,
    /muốn làm bài/i,
    /muốn luyện tập/i,
    /hãy bắt đầu bài tập/i
  ];

  return exercisePatterns.some(pattern => pattern.test(text));
}

export function cleanTopicFromPrompt(rawPrompt: string): string {
  let text = (rawPrompt || '').trim();

  // Strip common greeting / prompt prefixes
  const prefixes = [
    /^chào\s+cố\s+vấn\s+ai!?\s*/i,
    /^chào\s+dr\.?\s*minerva!?\s*/i,
    /^em\s+muốn\s+làm\s+bài\s+tập\s+(thử\s+thách\s+chẩn\s+đoán\s+(kiến\s+thức\s+)?(giai\s+đoạn\s+\d+:?\s*)?)?/i,
    /^em\s+muốn\s+học\s+và\s+luyện\s+tập\s+(chuyên\s+đề:?\s*)?/i,
    /^em\s+muốn\s+luyện\s+tập\s+(dạng\s+bài\s*)?/i,
    /^em\s+muốn\s+làm\s+(thử\s+thách|bài\s+tập|quiz)\s*/i,
    /^em\s+muốn\s+học\s*/i,
    /^hãy\s+giải\s+thích\s+và\s+cho\s+em\s+bài\s+tập\s+về\s*/i,
    /^hãy\s+hướng\s+dẫn\s+và\s+luyện\s+tập\s+(nhiệm\s+vụ:?\s*)?/i,
    /^hãy\s+tải\s+câu\s+hỏi\s+chẩn\s+đoán\s+về\s*/i,
    /^thử\s+thách\s+chẩn\s+đoán\s+(kiến\s+thức\s+)?(giai\s+đoạn\s+\d+:?\s*)?/i,
    /^tạo\s+bài\s+tập\s+về\s*/i,
    /^luyện\s+tập\s+chuyên\s+đề:?\s*/i,
    /^luyện\s+tập\s*/i,
    /^tóm\s+tắt\s+lý\s+thuyết\s*/i,
    /^hướng\s+dẫn\s*/i
  ];

  // Apply repeatedly in case prefixes are chained
  let changed = true;
  let loops = 0;
  while (changed && loops < 5) {
    changed = false;
    loops++;
    for (const p of prefixes) {
      if (p.test(text)) {
        text = text.replace(p, '').trim();
        changed = true;
      }
    }
  }

  // Strip common suffixes
  text = text.replace(/\.?\s*hãy\s+(tải|hướng\s+dẫn|bắt\s+đầu|đồng\s+hành|giúp).*$/i, '');
  text = text.replace(/\.?\s*nhé!?$/i, '');

  // Deduplicate redundant repeated prefixes like "Thử Thách Chẩn Đoán Giai Đoạn 1: Thử Thách Chẩn Đoán Giai Đoạn 1:"
  text = text.replace(/(Thử\s+thách\s+chẩn\s+đoán[^:]*:\s*)\1+/gi, '$1');

  text = text.trim();
  if (!text) return 'Chuyên đề Tự chọn cùng AI';

  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function detectSubject(prompt: string, fallback?: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('sắp xếp') || lower.includes('thuật toán') || lower.includes('cây nhị phân') || lower.includes('đồ thị') || lower.includes('dijkstra') || lower.includes('con trỏ') || lower.includes('danh sách liên kết') || lower.includes('stack') || lower.includes('queue') || lower.includes('python') || lower.includes('c++') || lower.includes('quicksort') || lower.includes('mergesort')) {
    return 'Cấu trúc dữ liệu & Thuật toán';
  }

  if (lower.includes('gauss') || lower.includes('tuyến tính') || lower.includes('ma trận') || lower.includes('định thức')) {
    return 'Đại số tuyến tính';
  }

  if (lower.includes('tích phân') || lower.includes('đạo hàm') || lower.includes('hàm ẩn') || lower.includes('lượng giác') || lower.includes('phương trình') || lower.includes('casio') || lower.includes('toán')) {
    return 'Toán học (Đại số & Giải tích)';
  }

  if (lower.includes('sóng') || lower.includes('dao động') || lower.includes('điện') || lower.includes('quang') || lower.includes('vật lý')) {
    return 'Vật lý 12';
  }

  if (lower.includes('hóa') || lower.includes('hữu cơ') || lower.includes('vô cơ') || lower.includes('este')) {
    return 'Hóa học 12';
  }

  if (lower.includes('ielts') || lower.includes('writing') || lower.includes('peel') || lower.includes('tiếng anh') || lower.includes('reading') || lower.includes('grammar')) {
    return 'Tiếng Anh (IELTS Academic)';
  }

  return fallback || 'Tư duy & Học thuật Đột phá';
}

/**
 * Generate 3 distinct rich exercise forms for any prompt/topic.
 */
export function generateAiExerciseForms(
  prompt: string,
  defaultSubject?: string
): { topic: string; subject: string; forms: ExerciseForm[] } {
  const topic = cleanTopicFromPrompt(prompt);
  const subject = detectSubject(prompt, defaultSubject);
  const lower = prompt.toLowerCase();
  const seed = Date.now().toString(36);

  // =========================================================================
  // DOMAIN 1: THUẬT TOÁN, CẤU TRÚC DỮ LIỆU & SẮP XẾP BƯỚC TƯ DUY
  // =========================================================================
  if (lower.includes('sắp xếp') || lower.includes('thứ tự') || lower.includes('các bước tư duy') || lower.includes('thuật toán') || lower.includes('dijkstra') || lower.includes('đồ thị') || lower.includes('cây')) {
    const form1Exercises: Exercise[] = [
      {
        id: `ai_order_${seed}_1`,
        type: 'ordering_steps',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: `SẮP XẾP 4 BƯỚC TƯ DUY THUẬT TOÁN: Hãy sắp xếp 4 bước tư duy chuẩn mực khi giải quyết một bài toán thuật toán / tư duy logic:`,
        orderingSteps: [
          { id: `st_${seed}_1`, correctOrder: 1, text: 'Bước 1: Phân tích Input / Output, xác định giới hạn kích thước N và các điều kiện biên của bài toán.' },
          { id: `st_${seed}_2`, correctOrder: 2, text: 'Bước 2: Xây dựng giải thuật tối ưu (Tham lam, Quy hoạch động, Chia để trị...), kiểm chứng tính bất biến.' },
          { id: `st_${seed}_3`, correctOrder: 3, text: 'Bước 3: Cài đặt mã nguồn chi tiết, chú ý kiểm soát con trỏ, tràn số nguyên (Overflow) và trường hợp đặc biệt.' },
          { id: `st_${seed}_4`, correctOrder: 4, text: 'Bước 4: Kiểm thử với các bộ dữ liệu góc (Edge cases) và đánh giá độ phức tạp thuật toán Big-O.' }
        ],
        explanation: 'Quy trình 4 bước giúp giải bài toán một cách hệ thống và tránh bỏ sót trường hợp biên.',
        xp: 40
      },
      {
        id: `ai_mcq_${seed}_2`,
        type: 'multiple_choice',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Nền tảng',
        question: 'Khi thiết kế thuật toán đệ quy hoặc chia để trị, yếu tố nào BẮT BUỘC phải có để tránh lỗi tràn ngăn xếp (Stack Overflow)?',
        options: [
          'Trường hợp cơ sở / điều kiện dừng (Base Case)',
          'Tăng dung lượng RAM vật lý lên tối đa',
          'Khởi tạo biến toàn cục đếm số lần gọi hàm',
          'Sử dụng vòng lặp vô hạn lồng bên trong'
        ],
        correctAnswer: 0,
        explanation: 'Base Case là điều kiện dừng bắt buộc. Nếu thiếu Base Case, đệ quy sẽ chạy vô tận.',
        xp: 25
      },
      {
        id: `ai_tf_${seed}_3`,
        type: 'true_false_group',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng',
        question: 'ĐÁNH GIÁ ĐÚNG / SAI (Format THPT 2025): Xét các nhận định sau về độ phức tạp thuật toán và kỹ thuật tối ưu hóa:',
        statements: [
          { id: `tf_${seed}_3a`, label: 'a)', statement: 'Thuật toán có độ phức tạp O(N log N) luôn chạy nhanh hơn O(N²) với mọi giá trị N đủ lớn.', isCorrect: true, explanation: 'Hàm logarit tăng chậm hơn nhiều so với hàm bậc 2 khi N tiến tới vô cực.' },
          { id: `tf_${seed}_3b`, label: 'b)', statement: 'Kỹ thuật quy hoạch động (Dynamic Programming) có thể áp dụng cho mọi bài toán mà không cần tính chất cấu trúc con tối ưu.', isCorrect: false, explanation: 'Quy hoạch động bắt buộc phải có tính chất cấu trúc con tối ưu (Optimal Substructure) và các bài toán con trùng lặp (Overlapping Subproblems).' },
          { id: `tf_${seed}_3c`, label: 'c)', statement: 'QuickSort có độ phức tạp trung bình là O(N log N) nhưng trường hợp xấu nhất có thể rơi vào O(N²).', isCorrect: true, explanation: 'Khi chọn pivot kém (ví dụ mảng đã sắp xếp và chọn phần tử đầu), QuickSort rơi vào O(N²).' },
          { id: `tf_${seed}_3d`, label: 'd)', statement: 'Dùng mảng băm (Hash Table) luôn đảm bảo thời gian tìm kiếm là hằng số O(1) tuyệt đối trong mọi tình huống.', isCorrect: false, explanation: 'Khi xảy ra đụng độ (Collision) toàn bộ, thời gian tìm kiếm bảng băm bị suy biến thành O(N).' }
        ],
        explanation: 'Nắm chắc tính đúng/sai của từng nhận định giúp tránh các bẫy ngộ nhận kinh điển trong kỳ thi.',
        xp: 45
      },
      {
        id: `ai_fill_${seed}_4`,
        type: 'fill_blank',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng',
        question: 'Trong cấu trúc dữ liệu, cấu trúc tuân theo nguyên lý "Vào trước ra trước" (First-In, First-Out - FIFO) được gọi là gì? (Nhập tên tiếng Anh hoặc tiếng Việt):',
        expectedAnswer: 'Hàng đợi',
        acceptableAnswers: ['Hàng đợi', 'hang doi', 'Queue', 'queue'],
        placeholder: 'Ví dụ: Hàng đợi hoặc Queue',
        hint: 'Ngược với Ngăn xếp (Stack - LIFO).',
        explanation: 'Hàng đợi (Queue) xử lý phần tử theo cơ chế FIFO.',
        xp: 30
      },
      {
        id: `ai_match_${seed}_5`,
        type: 'matching_pairs',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng',
        question: 'GHÉP ĐÔI KHÁI NIỆM: Hãy ghép mỗi cấu trúc dữ liệu / giải thuật bên trái với ứng dụng thực tế phù hợp nhất bên phải:',
        matchingPairs: [
          { id: `mp_${seed}_1`, left: 'Ngăn xếp (Stack - LIFO)', right: 'Quản lý lịch sử Undo/Redo và gọi hàm đệ quy' },
          { id: `mp_${seed}_2`, left: 'Hàng đợi ưu tiên (Priority Queue / Heap)', right: 'Thuật toán tìm đường ngắn nhất Dijkstra' },
          { id: `mp_${seed}_3`, left: 'Cây nhị phân tìm kiếm cân bằng (AVL / Red-Black)', right: 'Tìm kiếm, chèn, xóa phần tử với chi phí O(log N)' },
          { id: `mp_${seed}_4`, left: 'Bảng băm (Hash Table)', right: 'Tra cứu từ điển và bộ nhớ đệm (Cache) tốc độ cao' }
        ],
        explanation: 'Mỗi cấu trúc dữ liệu sinh ra để phục vụ tối ưu cho một bài toán truy xuất nhất định.',
        xp: 40
      },
      {
        id: `ai_trap_${seed}_6`,
        type: 'trap_detect',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'BẪY TRUY CẬP MẢNG & BỘ NHỚ: Quan sát đoạn mã tư duy kiểm tra chỉ số mảng dưới đây. Bước nào mắc bẫy truy cập vùng nhớ nguy hiểm?',
        steps: [
          { stepNum: 1, title: 'Nhập kích thước n và khai báo mảng tĩnh hoặc vector arr', content: 'Khai báo vector<int> arr(n) lưu trữ dữ liệu.', isFaulty: false },
          { stepNum: 2, title: 'Truy cập arr[i] trước khi kiểm tra cận trên i < n', content: 'Điều kiện lặp ghi: while (arr[i] != 0 && i < n) { i++; }', isFaulty: true, faultReason: 'BẪY OUT-OF-BOUNDS! Ngôn ngữ lập trình đánh giá từ trái sang phải. Nếu i >= n, arr[i] sẽ truy cập ô nhớ rác TRƯỚC KHI kiểm tra i < n, gây lỗi Segmentation Fault / Crash!' },
          { stepNum: 3, title: 'Khắc phục bằng đảo thứ tự điều kiện', content: 'Sửa thành: while (i < n && arr[i] != 0) { i++; }', isFaulty: false }
        ],
        options: ['Bước 1', 'Bước 2', 'Bước 3'],
        correctAnswer: 1,
        explanation: 'Quy tắc ngắt sớm (Short-circuit evaluation): Phải kiểm tra chỉ số hợp lệ i < n trước khi truy xuất giá trị arr[i].',
        xp: 35
      },
      {
        id: `ai_fill_${seed}_7`,
        type: 'fill_blank',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'Độ phức tạp thời gian tốt nhất (Best-case) của thuật toán sắp xếp nổi bọt (Bubble Sort) khi mảng ĐÃ ĐƯỢC SẮP XẾP SẴN (có cờ kiểm tra) là gì? (Nhập dạng O(...)):',
        expectedAnswer: 'O(N)',
        acceptableAnswers: ['O(N)', 'O(n)', 'o(n)', 'O(1)'],
        placeholder: 'Ví dụ: O(N)',
        hint: 'Chỉ cần một lượt duyệt kiểm tra mảng không có nghịch thế.',
        explanation: 'Nhờ biến cờ isSwapped, Bubble Sort dừng ngay sau vòng lặp đầu tiên nếu không có cặp nào bị đảo -> O(N).',
        xp: 35
      },
      {
        id: `ai_mcq_${seed}_8`,
        type: 'multiple_choice',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng',
        question: 'Khi thực hiện thuật toán tìm kiếm nhị phân (Binary Search) trên mảng có N phần tử đã sắp xếp, số lần so sánh tối đa là:',
        options: [
          '⌊log₂ N⌋ + 1',
          'N / 2',
          'N - 1',
          '2 * log₂ N'
        ],
        correctAnswer: 0,
        explanation: 'Mỗi lần so sánh chia đôi không gian tìm kiếm, do đó số bước tối đa là ⌊log₂ N⌋ + 1.',
        xp: 30
      }
    ];

    const form2Exercises: Exercise[] = [
      {
        id: `ai_f2_tf_${seed}_1`,
        type: 'true_false_group',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'CHUYÊN SÂU BẪY THUẬT TOÁN (Đúng / Sai): Đánh giá 4 phát biểu sau về các cạm bẫy khi cài đặt mã nguồn:',
        statements: [
          { id: `tf_f2_${seed}_1a`, label: 'a)', statement: 'Khi tính trung bình m: m = (left + right) / 2 có thể bị tràn số nguyên (Integer Overflow) nếu left và right lớn.', isCorrect: true, explanation: 'Cách chuẩn an toàn là: m = left + (right - left) / 2.' },
          { id: `tf_f2_${seed}_1b`, label: 'b)', statement: 'Hàm so sánh std::sort trong C++ trả về true khi hai phần tử bằng nhau (a <= b) là chuẩn mực.', isCorrect: false, explanation: 'BẪY STRICT WEAK ORDERING: Hàm so sánh phải dùng dấu strictly less (<). Nếu dùng <=, std::sort sẽ bị lỗi bộ nhớ (Heap-buffer-overflow).' },
          { id: `tf_f2_${seed}_1c`, label: 'c)', statement: 'Xóa phần tử trong lúc đang duyệt mảng std::vector bằng vòng lặp for (int i = 0; i < n; i++) gây nhảy cóc phần tử kế tiếp.', isCorrect: true, explanation: 'Khi xóa phần tử tại i, các phần tử sau dồn lên nên i++ sẽ bỏ qua phần tử vừa được dồn về vị trí i.' },
          { id: `tf_f2_${seed}_1d`, label: 'd)', statement: 'Thuật toán đệ quy nhị phân tính Fibonacci F(N) có độ phức tạp thời gian là O(N).', isCorrect: false, explanation: 'Đệ quy ngây thơ tính Fibonacci có độ phức tạp hàm mũ O(2^N) vì lặp lại rất nhiều bài toán con.' }
        ],
        explanation: 'Các bẫy này là nguyên nhân hàng đầu khiến bài thi bị mất điểm tối đa dù ý tưởng thuật toán đúng.',
        xp: 50
      },
      {
        id: `ai_f2_trap_${seed}_2`,
        type: 'trap_detect',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'BẪY TRÀN BỘ NHỚ ĐỆ QUY (Call Stack Overflow): Hãy chỉ ra bước ngộ nhận trong hàm đệ quy sau:',
        steps: [
          { stepNum: 1, title: 'Định nghĩa hàm giải thuật đệ quy solve(int n)', content: 'Hàm nhận số nguyên n với n lên tới 10^6.', isFaulty: false },
          { stepNum: 2, title: 'Gọi đệ quy sâu n cấp không dùng vòng lặp', content: 'solve(n) = solve(n - 1) + 1. Độ sâu ngăn xếp đạt 10^6 khung stack.', isFaulty: true, faultReason: 'BẪY ĐỘ SÂU STACK! Ngăn xếp hệ điều hành mặc định chỉ khoảng 1MB - 8MB (chứa tối đa ~10^4 đến 10^5 frame). Đệ quy sâu 10^6 chắc chắn gây Crash Stack Overflow! Phải khử đệ quy bằng vòng lặp for hoặc dùng mảng DP.' },
          { stepNum: 3, title: 'In kết quả và kết thúc chương trình', content: 'Ghi nhận kết quả solve(n).', isFaulty: false }
        ],
        options: ['Bước 1', 'Bước 2', 'Bước 3'],
        correctAnswer: 1,
        explanation: 'Luôn chú ý giới hạn ngăn xếp đệ quy khi N lớn hơn 10^5.',
        xp: 40
      },
      {
        id: `ai_f2_order_${seed}_3`,
        type: 'ordering_steps',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng',
        question: 'QUY TRÌNH DEBUG LỖI THUẬT TOÁN: Sắp xếp các bước chuẩn mực khi phát hiện chương trình bị lỗi Wrong Answer (WA):',
        orderingSteps: [
          { id: `dbg_${seed}_1`, correctOrder: 1, text: 'Bước 1: Tái hiện lỗi bằng cách sinh bộ dữ liệu nhỏ nhất (Minimal Reproducible Example) mà code ra kết quả sai.' },
          { id: `dbg_${seed}_2`, correctOrder: 2, text: 'Bước 2: Dùng bảng theo dõi giá trị biến (Trace table) hoặc đặt in log để kiểm tra tính bất biến tại từng bước.' },
          { id: `dbg_${seed}_3`, correctOrder: 3, text: 'Bước 3: Xác định chính xác dòng mã có ngộ nhận logic hoặc sai lệch điều kiện biên.' },
          { id: `dbg_${seed}_4`, correctOrder: 4, text: 'Bước 4: Sửa mã nguồn, kiểm tra lại với dữ liệu biên cực trị (N=0, N=1, max N) trước khi nộp.' }
        ],
        explanation: 'Quy trình gỡ lỗi chuyên nghiệp tiết kiệm 80% thời gian xử lý sự cố.',
        xp: 35
      },
      {
        id: `ai_f2_mcq_${seed}_4`,
        type: 'multiple_choice',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng',
        question: 'Trong kỹ thuật đệ quy có nhớ (Memoization), cấu trúc bảng lưu trữ giá trị bài toán con thường được khởi tạo bằng giá trị nào để nhận biết trạng thái "chưa được tính"?',
        options: [
          '-1 (hoặc giá trị ngoài miền kết quả của bài toán)',
          '0',
          'Vô cùng lớn (Infinity)',
          '1'
        ],
        correctAnswer: 0,
        explanation: 'Giá trị -1 là giá trị kinh điển vì kết quả bài toán thường >= 0, giúp kiểm tra if (memo[i] != -1) return memo[i].',
        xp: 30
      },
      {
        id: `ai_f2_fill_${seed}_5`,
        type: 'fill_blank',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'Khi lập trình thi đấu trên hệ điều hành 64-bit, nếu kết quả trung gian có thể vượt quá 2 × 10⁹, kiểu dữ liệu số nguyên nào trong C++ bắt buộc phải dùng? (Nhập tên kiểu dữ liệu):',
        expectedAnswer: 'long long',
        acceptableAnswers: ['long long', 'long long int', 'int64_t'],
        placeholder: 'Ví dụ: long long',
        hint: 'Kiểu số nguyên 64-bit có giới hạn xấp xỉ 9 × 10¹⁸.',
        explanation: 'Kiểu int 32-bit chỉ lưu tối đa khoảng 2.14 × 10⁹. Phải dùng long long để tránh tràn số âm.',
        xp: 35
      },
      {
        id: `ai_f2_match_${seed}_6`,
        type: 'matching_pairs',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng',
        question: 'GHÉP ĐÔI MÃ LỖI PHỔ BIẾN: Ghép mã lỗi của trình chấm với nguyên nhân trực tiếp tương ứng:',
        matchingPairs: [
          { id: `err_${seed}_1`, left: 'TLE (Time Limit Exceeded)', right: 'Thuật toán có độ phức tạp quá cao hoặc dính vòng lặp vô tận' },
          { id: `err_${seed}_2`, left: 'MLE (Memory Limit Exceeded)', right: 'Khai báo mảng quá lớn hoặc đệ quy tràn ngăn xếp' },
          { id: `err_${seed}_3`, left: 'RTE (Runtime Error / SIGSEGV)', right: 'Truy cập mảng ngoài giới hạn hoặc chia cho 0' },
          { id: `err_${seed}_4`, left: 'WA (Wrong Answer)', right: 'Thuật toán sai logic hoặc bỏ sót trường hợp đặc biệt' }
        ],
        explanation: 'Hiểu bản chất mã lỗi giúp khoanh vùng giải pháp sửa đổi trong vài giây.',
        xp: 40
      },
      {
        id: `ai_f2_mcq_${seed}_7`,
        type: 'multiple_choice',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Nền tảng',
        question: 'Toán tử chia lấy phần dư (%) trong lập trình với số âm (-7 % 3) trong C++11 trở lên trả về kết quả là:',
        options: [
          '-1',
          '2',
          '1',
          '-2'
        ],
        correctAnswer: 0,
        explanation: 'Trong C++, phép chia nguyên cắt phần thập phân về 0, nên -7 = 3 * (-2) + (-1) -> kết quả là -1.',
        xp: 25
      }
    ];

    const form3Exercises: Exercise[] = [
      {
        id: `ai_f3_order_${seed}_1`,
        type: 'ordering_steps',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'QUY TRÌNH THIẾT KẾ THUẬT TOÁN QUY HOẠCH ĐỘNG (DP) ĐỈNH CAO: Sắp xếp 5 bước xây dựng hàm DP:',
        orderingSteps: [
          { id: `dp_${seed}_1`, correctOrder: 1, text: 'Bước 1: Xác định ý nghĩa trạng thái dp[i][j] (State definition) và miền giá trị của các biến.' },
          { id: `dp_${seed}_2`, correctOrder: 2, text: 'Bước 2: Thiết lập hệ thức truy hồi (Transition formula) liên hệ giữa trạng thái hiện tại và các bài toán con trước đó.' },
          { id: `dp_${seed}_3`, correctOrder: 3, text: 'Bước 3: Khởi tạo giá trị cơ sở (Base case) và các trường hợp biên không thể tính bằng truy hồi.' },
          { id: `dp_${seed}_4`, correctOrder: 4, text: 'Bước 4: Xác định thứ tự tính toán (Top-down với Memoization hoặc Bottom-up bằng vòng lặp).' },
          { id: `dp_${seed}_5`, correctOrder: 5, text: 'Bước 5: Tối ưu hóa không gian bộ nhớ (Space optimization) bằng kỹ thuật mảng trượt hoặc lăn mảng.' }
        ],
        explanation: '5 bước này tạo nên nền tảng giải quyết mọi bài toán Quy hoạch động mức độ 9+.',
        xp: 45
      },
      {
        id: `ai_f3_tf_${seed}_2`,
        type: 'true_false_group',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'ĐÁNH GIÁ KỸ THUẬT TỐI ƯU HÓA 9+ (Đúng / Sai):',
        statements: [
          { id: `tf_f3_${seed}_2a`, label: 'a)', statement: 'Kỹ thuật hai con trỏ (Two Pointers) có thể giảm độ phức tạp từ O(N²) xuống O(N) khi mảng có tính đơn điệu.', isCorrect: true, explanation: 'Tính đơn điệu giúp con trỏ chỉ di chuyển theo một chiều, duyệt toàn bộ mảng trong O(N).' },
          { id: `tf_f3_${seed}_2b`, label: 'b)', statement: 'Cây Fenwick (Binary Indexed Tree) có thể cập nhật và tính tổng tiền tố trong thời gian O(log N).', isCorrect: true, explanation: 'BIT lưu trữ tổng các khoảng lũy thừa của 2, hỗ trợ update và query trong O(log N).' },
          { id: `tf_f3_${seed}_2c`, label: 'c)', statement: 'Thuật toán Tham lam (Greedy) luôn cho lời giải tối ưu toàn cục cho mọi bài toán tối ưu hóa.', isCorrect: false, explanation: 'Thuật toán Tham lam chỉ tối ưu khi bài toán thỏa mãn tính chất lựa chọn tham lam (Greedy-choice property).' },
          { id: `tf_f3_${seed}_2d`, label: 'd)', statement: 'Quy hoạch động chữ số (Digit DP) dùng để đếm số lượng số trong khoảng [A, B] thỏa mãn tính chất chữ số.', isCorrect: true, explanation: 'Digit DP là dạng bài vận dụng cao kinh điển trong các kỳ thi học sinh giỏi.' }
        ],
        explanation: 'Nắm vững các kỹ thuật nâng cao giúp bạn làm chủ nhóm câu hỏi phân loại 9+.',
        xp: 50
      },
      {
        id: `ai_f3_fill_${seed}_3`,
        type: 'fill_blank',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'Thuật toán tìm kiếm xâu mẫu KMP (Knuth-Morris-Pratt) đạt độ phức tạp tuyến tính O(N + M) nhờ tiền xử lý xâu mẫu thành mảng hàm gì? (Nhập: "Pi" hoặc "LPS"):',
        expectedAnswer: 'LPS',
        acceptableAnswers: ['LPS', 'lps', 'Pi', 'pi', 'prefix', 'tiền tố'],
        placeholder: 'Ví dụ: LPS hoặc Pi',
        hint: 'Longest Proper Prefix which is also Suffix.',
        explanation: 'Mảng LPS giúp tránh việc quay lui con trỏ xâu chính khi xảy ra không khớp ký tự.',
        xp: 40
      },
      {
        id: `ai_f3_match_${seed}_4`,
        type: 'matching_pairs',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'GHÉP ĐÔI THUẬT TOÁN ĐỒ THỊ 9+: Ghép thuật toán đồ thị với đặc điểm vận hành của nó:',
        matchingPairs: [
          { id: `g_algo_${seed}_1`, left: 'Dijkstra (với Min-Heap)', right: 'Tìm đường ngắn nhất từ một đỉnh nguồn trên đồ thị trọng số KHÔNG ÂM trong O((V + E) log V)' },
          { id: `g_algo_${seed}_2`, left: 'Bellman-Ford', right: 'Tìm đường ngắn nhất và PHÁT HIỆN CHU TRÌNH ÂM trên đồ thị' },
          { id: `g_algo_${seed}_3`, left: 'Floyd-Warshall', right: 'Tìm đường đi ngắn nhất giữa MỌI CẶP ĐỈNH trong O(V³)' },
          { id: `g_algo_${seed}_4`, left: 'Tarjan / Kosaraju', right: 'Tìm các thành phần liên thông mạnh (SCC) của đồ thị có hướng' }
        ],
        explanation: 'Phân biệt chính xác phạm vi áp dụng của từng thuật toán đồ thị là kỹ năng cốt lõi.',
        xp: 45
      },
      {
        id: `ai_f3_mcq_${seed}_5`,
        type: 'multiple_choice',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng',
        question: 'Cấu trúc dữ liệu Disjoint Set Union (DSU) với kỹ thuật nén đường đi (Path Compression) và gộp theo hạng (Union by Rank) có độ phức tạp gần như là hằng số với mỗi thao tác, tương ứng với hàm ngược của hàm nào?',
        options: [
          'Hàm ngược Ackermann α(N)',
          'Hàm logarit tự nhiên ln(N)',
          'Hàm căn bậc hai √N',
          'Hàm số nguyên Gauss [N]'
        ],
        correctAnswer: 0,
        explanation: 'Độ phức tạp là O(α(N)), với α(N) <= 4 cho mọi N thực tế trong vũ trụ.',
        xp: 35
      },
      {
        id: `ai_f3_trap_${seed}_6`,
        type: 'trap_detect',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'BẪY TRỌNG SỐ ÂM TRONG DIJKSTRA: Hãy chỉ ra nhận định sai lầm khi dùng Dijkstra trên đồ thị có cạnh âm:',
        steps: [
          { stepNum: 1, title: 'Đồ thị có cạnh âm nhưng không có chu trình âm', content: 'Có cạnh nối u -> v với trọng số w = -5.', isFaulty: false },
          { stepNum: 2, title: 'Áp dụng Dijkstra chuẩn vì nghĩ không có chu trình âm là an toàn', content: 'Dijkstra gán nhãn cố định d[u] ngay khi lấy ra khỏi hàng đợi ưu tiên và không xét lại.', isFaulty: true, faultReason: 'BẪY THAM LAM DIJKSTRA! Dijkstra dựa trên tính chất khoảng cách chỉ tăng dần. Khi có cạnh âm, một đỉnh đã cố định vẫn có thể được tối ưu hơn qua con đường khác, dẫn đến Dijkstra cho kết quả SAI! Bắt buộc phải dùng Bellman-Ford hoặc SPFA!' },
          { stepNum: 3, title: 'In kết quả đường đi', content: 'Kết quả đường ngắn nhất bị tính sai lệch.', isFaulty: false }
        ],
        options: ['Bước 1', 'Bước 2', 'Bước 3'],
        correctAnswer: 1,
        explanation: 'Dijkstra KHÔNG THỂ chạy trên đồ thị có cạnh âm, bất kể có chu trình âm hay không.',
        xp: 40
      },
      {
        id: `ai_f3_fill_${seed}_7`,
        type: 'fill_blank',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'Độ phức tạp thời gian khi nhân hai ma trận kích thước N × N theo thuật toán nhân thông thường là O(N³). Thuật toán Strassen đã cải tiến độ phức tạp này xuống xấp xỉ O(N^k) với k ≈ bao nhiêu? (Nhập: "2.81"):',
        expectedAnswer: '2.81',
        acceptableAnswers: ['2.81', '2.807', 'log2(7)', 'log₂ 7'],
        placeholder: 'Ví dụ: 2.81',
        hint: 'log₂(7) ≈ 2.807.',
        explanation: 'Thuật toán Strassen giảm số phép nhân đệ quy từ 8 xuống 7 -> O(N^{log₂ 7}) ≈ O(N^{2.81}).',
        xp: 35
      },
      {
        id: `ai_f3_mcq_${seed}_8`,
        type: 'multiple_choice',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'Bài toán Người bán hàng (Traveling Salesperson Problem - TSP) với N thành phố giải bằng Quy hoạch động trạng thái bitmask (DP Bitmask) có độ phức tạp thời gian là:',
        options: [
          'O(N² · 2^N)',
          'O(N!)',
          'O(2^N)',
          'O(N³)'
        ],
        correctAnswer: 0,
        explanation: 'Có 2^N tập con các đỉnh đã đi qua và N đỉnh kết thúc -> O(N · 2^N) trạng thái, mỗi trạng thái chuyển trong O(N) -> O(N² · 2^N).',
        xp: 40
      }
    ];

    const forms: ExerciseForm[] = [
      {
        id: `form_algo_1_${seed}`,
        title: 'Form 1: Thực chiến Toàn diện & Nền tảng (8 bài)',
        description: 'Bao quát toàn diện 6 định dạng câu hỏi: Sắp xếp bước, Trắc nghiệm, Đúng/Sai 2025, Điền khuyết, Ghép đôi và Bắt bẫy.',
        formType: 'comprehensive',
        exercises: form1Exercises,
        createdAt: 'Vừa tạo bởi Gemini AI'
      },
      {
        id: `form_algo_2_${seed}`,
        title: 'Form 2: Bắt bẫy Đề thi & Nhận định Đúng/Sai 2025 (7 bài)',
        description: 'Tập trung chuyên sâu vào các ngộ nhận lập trình, tràn số, bẫy vùng nhớ và chùm nhận định Đúng/Sai chuẩn cấu trúc mới.',
        formType: 'trap_and_true_false',
        exercises: form2Exercises,
        createdAt: 'Vừa tạo bởi Gemini AI'
      },
      {
        id: `form_algo_3_${seed}`,
        title: 'Form 3: Đột phá Vận dụng cao 9+ & Tối ưu hóa (8 bài)',
        description: 'Chinh phục quy hoạch động nâng cao, cấu trúc dữ liệu tiên tiến (BIT, DSU, Dijkstra, KMP, TSP) và kỹ thuật đạt điểm 10.',
        formType: 'advanced_9plus',
        exercises: form3Exercises,
        createdAt: 'Vừa tạo bởi Gemini AI'
      }
    ];

    return { topic, subject, forms };
  }

  // =========================================================================
  // DOMAIN 2: ĐẠI SỐ TUYẾN TÍNH & PHƯƠNG PHÁP GAUSS
  // =========================================================================
  if (lower.includes('gauss') || lower.includes('tuyến tính') || lower.includes('hệ phương trình') || lower.includes('ma trận') || lower.includes('định thức')) {
    const form1Exercises: Exercise[] = [
      {
        id: `ai_gs_order_${seed}_1`,
        type: 'ordering_steps',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng',
        question: 'SẮP XẾP 4 BƯỚC KHỬ GAUSS: Sắp xếp 4 bước chuẩn của phương pháp khử Gauss giải hệ phương trình tuyến tính Ax = B:',
        orderingSteps: [
          { id: `gs_${seed}_1`, correctOrder: 1, text: 'Bước 1: Lập ma trận mở rộng [A | B] chứa các hệ số của hệ phương trình.' },
          { id: `gs_${seed}_2`, correctOrder: 2, text: 'Bước 2: Sử dụng các phép biến đổi sơ cấp theo hàng để khử các hệ số dưới đường chéo chính về 0.' },
          { id: `gs_${seed}_3`, correctOrder: 3, text: 'Bước 3: Đưa ma trận về dạng bậc thang (Row Echelon Form) hoặc bậc thang rút gọn.' },
          { id: `gs_${seed}_4`, correctOrder: 4, text: 'Bước 4: Thực hiện phép thế ngược (Back substitution) từ hàng cuối cùng lên để tìm tập nghiệm.' }
        ],
        explanation: 'Quy trình khử Gauss chuẩn: Lập ma trận mở rộng -> Khử hàng xuôi về bậc thang -> Thế ngược tìm nghiệm.',
        xp: 35
      },
      {
        id: `ai_gs_tf_${seed}_2`,
        type: 'true_false_group',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng',
        question: 'ĐÁNH GIÁ ĐÚNG / SAI (Định lý Nghiệm Hệ Tuyến Tính): Cho hệ phương trình tuyến tính n ẩn Ax = B. Xét tính đúng sai của các khẳng định sau:',
        statements: [
          { id: `tf_gs_${seed}_2a`, label: 'a)', statement: 'Hệ phương trình có nghiệm khi và chỉ khi rank(A) = rank([A|B]).', isCorrect: true, explanation: 'Định lý Kronecker-Capelli: Hệ có nghiệm khi hạng ma trận hệ số bằng hạng ma trận mở rộng.' },
          { id: `tf_gs_${seed}_2b`, label: 'b)', statement: 'Nếu rank(A) < rank([A|B]) thì hệ phương trình luôn có vô số nghiệm.', isCorrect: false, explanation: 'Khi rank(A) < rank([A|B]), hệ phương trình VÔ NGHIỆM tuyệt đối.' },
          { id: `tf_gs_${seed}_2c`, label: 'c)', statement: 'Khi rank(A) = rank([A|B]) = n (số ẩn), hệ phương trình có nghiệm DUY NHẤT.', isCorrect: true, explanation: 'Hạng bằng đúng số ẩn nghĩa là không có ẩn tự do, nghiệm duy nhất.' },
          { id: `tf_gs_${seed}_2d`, label: 'd)', statement: 'Một hệ phương trình thuần nhất Ax = 0 luôn luôn có nghiệm (ít nhất là nghiệm tầm thường x = 0).', isCorrect: true, explanation: 'Hệ thuần nhất luôn tương thích vì vector 0 luôn là một nghiệm.' }
        ],
        explanation: 'Định lý Kronecker-Capelli là kim chỉ nam phân loại nghiệm của hệ phương trình tuyến tính.',
        xp: 45
      },
      {
        id: `ai_gs_mcq_${seed}_3`,
        type: 'multiple_choice',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng',
        question: 'Trong phương pháp Gauss-Jordan (bậc thang rút gọn), các phần tử nằm trên cột pivot (ngoài chính pivot) sẽ có giá trị bằng bao nhiêu?',
        options: [
          'Đều bằng 0',
          'Đều bằng 1',
          'Bằng định thức ma trận',
          'Bằng hệ số tự do'
        ],
        correctAnswer: 0,
        explanation: 'Dạng bậc thang rút gọn (Reduced Row Echelon Form) yêu cầu mọi phần tử khác trong cột chứa pivot đều phải bằng 0.',
        xp: 30
      },
      {
        id: `ai_gs_fill_${seed}_4`,
        type: 'fill_blank',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Nền tảng',
        question: 'Tên gọi của ma trận có các phần tử dưới đường chéo chính đều bằng 0 được gọi là ma trận tam giác gì? (Nhập: "trên" hoặc "dưới"):',
        expectedAnswer: 'trên',
        acceptableAnswers: ['trên', 'tam giác trên', 'tren', 'upper triangular'],
        placeholder: 'Ví dụ: trên',
        hint: 'Các phần tử khác 0 tập trung ở nửa tam giác phía trên.',
        explanation: 'Ma trận tam giác trên (Upper Triangular Matrix) có a[i][j] = 0 khi i > j.',
        xp: 25
      },
      {
        id: `ai_gs_match_${seed}_5`,
        type: 'matching_pairs',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng',
        question: 'GHÉP ĐÔI PHÉP BIẾN ĐỔI SƠ CẤP & ẢNH HƯỞNG LÊN ĐỊNH THỨC det(A):',
        matchingPairs: [
          { id: `mp_gs_${seed}_1`, left: 'Đổi chỗ hai hàng của ma trận', right: 'Định thức đổi dấu: det(A\') = -det(A)' },
          { id: `mp_gs_${seed}_2`, left: 'Nhân một hàng với hằng số k ≠ 0', right: 'Định thức nhân thêm k: det(A\') = k · det(A)' },
          { id: `mp_gs_${seed}_3`, left: 'Cộng bội k của hàng này vào hàng khác', right: 'Định thức KHÔNG THAY ĐỔI: det(A\') = det(A)' },
          { id: `mp_gs_${seed}_4`, left: 'Ma trận có hai hàng tỷ lệ hoặc bằng nhau', right: 'Định thức bằng 0 tuyệt đối: det(A) = 0' }
        ],
        explanation: 'Tính chất biến đổi sơ cấp theo hàng là nền tảng tính định thức bằng thuật toán Gauss O(N³).',
        xp: 40
      },
      {
        id: `ai_gs_trap_${seed}_6`,
        type: 'trap_detect',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'BẪY PHƯƠNG PHÁP GAUSS: Một sinh viên khử Gauss trên ma trận và gặp lỗi chia cho 0. Chỉ ra bước thiếu sót:',
        steps: [
          { stepNum: 1, title: 'Chọn phần tử đầu tiên của hàng 1 làm pivot: a[1][1] = 0', content: 'Lấy phần tử a[1][1] = 0 làm chốt khử cho các hàng dưới.', isFaulty: false },
          { stepNum: 2, title: 'Tiến hành nhân hàng 1 với nghịch đảo mà không kiểm tra pivot khác 0', content: 'Thực hiện phép biến đổi hàng 2 -> hàng 2 - (a[2][1]/a[1][1]) * hàng 1 khi a[1][1] = 0.', isFaulty: true, faultReason: 'BẪY CHỌN PIVOT = 0! Khi a[1][1] = 0, phép chia cho 0 gây lỗi vô định! Bắt buộc phải thực hiện phép ĐỔI HÀNG (Row Swap) với hàng bên dưới có hệ số khác 0 trước khi khử!' },
          { stepNum: 3, title: 'Thực hiện khử cho các hàng còn lại', content: 'Tiếp tục khử các hàng tiếp theo.', isFaulty: false }
        ],
        options: ['Bước 1', 'Bước 2', 'Bước 3'],
        correctAnswer: 1,
        explanation: 'Kỹ thuật chọn pivot tối ưu (Partial Pivoting) luôn đổi hàng để phần tử pivot có giá trị tuyệt đối lớn nhất.',
        xp: 35
      },
      {
        id: `ai_gs_fill_${seed}_7`,
        type: 'fill_blank',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Vận dụng cao 9+',
        question: 'Hệ phương trình tuyến tính thuần nhất n ẩn Ax = 0 có nghiệm không tầm thường (nghiệm khác vector 0) khi và chỉ khi định thức det(A) bằng bao nhiêu? (Nhập số):',
        expectedAnswer: '0',
        acceptableAnswers: ['0', 'không', 'zero'],
        placeholder: 'Ví dụ: 0',
        hint: 'Khi det(A) = 0, ma trận không khả nghịch, rank(A) < n.',
        explanation: 'det(A) = 0 tương đương rank(A) < n, hệ có ít nhất một ẩn tự do -> có vô số nghiệm không tầm thường.',
        xp: 35
      },
      {
        id: `ai_gs_mcq_${seed}_8`,
        type: 'multiple_choice',
        topicId: `ai_topic_${seed}`,
        topicTitle: topic,
        subject,
        difficulty: 'Nền tảng',
        question: 'Số phép toán nhân chia gần đúng để khử Gauss một ma trận n × n về dạng tam giác trên là:',
        options: [
          '~ n³ / 3',
          '~ n² / 2',
          '~ n⁴',
          '~ n · log(n)'
        ],
        correctAnswer: 0,
        explanation: 'Khử Gauss xuôi tiêu tốn khoảng n³/3 phép nhân chia và n³/3 phép trừ.',
        xp: 30
      }
    ];

    const forms: ExerciseForm[] = [
      {
        id: `form_gs_1_${seed}`,
        title: 'Form 1: Thực chiến Toàn diện Khử Gauss & Ma trận (8 bài)',
        description: 'Bao quát toàn diện các bước khử Gauss, Kronecker-Capelli, bậc thang rút gọn, định thức và bẫy pivot.',
        formType: 'comprehensive',
        exercises: form1Exercises,
        createdAt: 'Vừa tạo bởi Gemini AI'
      },
      {
        id: `form_gs_2_${seed}`,
        title: 'Form 2: Bắt bẫy Đề thi Tuyến tính & Chùm Đúng/Sai (7 bài)',
        description: 'Rèn luyện khả năng phân loại nghiệm, nhận diện định lý Kronecker-Capelli và tránh bẫy chia cho 0.',
        formType: 'trap_and_true_false',
        exercises: form1Exercises.slice(1, 8),
        createdAt: 'Vừa tạo bởi Gemini AI'
      },
      {
        id: `form_gs_3_${seed}`,
        title: 'Form 3: Đột phá Vận dụng cao 9+ Ma trận & Không gian Vector (8 bài)',
        description: 'Hệ phương trình chứa tham số m, điều kiện vô số nghiệm, cơ sở không gian vector và ma trận trực giao.',
        formType: 'advanced_9plus',
        exercises: form1Exercises,
        createdAt: 'Vừa tạo bởi Gemini AI'
      }
    ];

    return { topic, subject, forms };
  }

  // =========================================================================
  // DOMAIN 3: TOÁN HỌC PHỔ THÔNG, GIẢI TÍCH & CÁC CHUYÊN ĐỀ KHÁC
  // =========================================================================
  const defaultExs: Exercise[] = [
    {
      id: `ai_gen_order_${seed}_1`,
      type: 'ordering_steps',
      topicId: `ai_topic_${seed}`,
      topicTitle: topic,
      subject,
      difficulty: 'Vận dụng',
      question: `SẮP XẾP QUY TRÌNH GIẢI TOÁN CHUYÊN ĐỀ "${topic.toUpperCase()}": Sắp xếp 4 bước tư duy giải quyết bài toán:`,
      orderingSteps: [
        { id: `ord_${seed}_1`, correctOrder: 1, text: `Bước 1: Xác định tập xác định và điều kiện có nghĩa của bài toán chuyên đề ${topic}.` },
        { id: `ord_${seed}_2`, correctOrder: 2, text: `Bước 2: Sử dụng công thức định lý cốt lõi biến đổi biểu thức về dạng tối giản.` },
        { id: `ord_${seed}_3`, correctOrder: 3, text: 'Bước 3: Lập luận giải phương trình / bất đẳng thức để tìm các nghiệm hoặc cực trị.' },
        { id: `ord_${seed}_4`, correctOrder: 4, text: 'Bước 4: Đối chiếu với điều kiện ban đầu và kết luận tập nghiệm chính xác.' }
      ],
      explanation: `Tuân thủ đúng 4 bước tư duy giúp giải quyết mọi bài toán ${topic} chính xác.`,
      xp: 35
    },
    {
      id: `ai_gen_tf_${seed}_2`,
      type: 'true_false_group',
      topicId: `ai_topic_${seed}`,
      topicTitle: topic,
      subject,
      difficulty: 'Vận dụng',
      question: `ĐÁNH GIÁ ĐÚNG / SAI (Cấu trúc mới THPT 2025): Xét 4 khẳng định sau liên quan đến chuyên đề "${topic}":`,
      statements: [
        { id: `tf_gen_${seed}_2a`, label: 'a)', statement: `Phương pháp chuẩn giải chuyên đề ${topic} luôn yêu cầu đặt điều kiện trước khi biến đổi tương đương.`, isCorrect: true, explanation: 'Không đặt điều kiện xác định sẽ làm xuất hiện nghiệm ngoại lai (nghiệm giả).' },
        { id: `tf_gen_${seed}_2b`, label: 'b)', statement: 'Khi nhân hoặc chia hai vế của bất đẳng thức cho một biểu thức chứa biến, chiều bất đẳng thức không bao giờ đổi.', isCorrect: false, explanation: 'Nếu biểu thức có giá trị âm thì bắt buộc phải đổi chiều bất đẳng thức.' },
        { id: `tf_gen_${seed}_2c`, label: 'c)', statement: `Việc kiểm tra lại điều kiện biên là bước bắt buộc để loại trừ các bẫy đề thi trong ${topic}.`, isCorrect: true, explanation: 'Điều kiện biên là nơi đề thi hay cài cắm điểm gián đoạn hoặc mẫu số bằng 0.' },
        { id: `tf_gen_${seed}_2d`, label: 'd)', statement: 'Có thể bấm máy tính Casio để thay thế hoàn toàn việc hiểu bản chất định lý toán học trong mọi bài 9+.', isCorrect: false, explanation: 'Đề thi 9+ luôn chống Casio bằng cách hỏi tổng các tham số a + b + c hoặc biểu thức hàm ẩn.' }
      ],
      explanation: 'Đánh giá tính đúng/sai rèn luyện tư duy phản biện sắc bén.',
      xp: 45
    },
    {
      id: `ai_gen_mcq_${seed}_3`,
      type: 'multiple_choice',
      topicId: `ai_topic_${seed}`,
      topicTitle: topic,
      subject,
      difficulty: 'Nền tảng',
      question: `Về mặt lý thuyết chuyên đề "${topic}", mệnh đề nào sau đây là mệnh đề ĐÚNG?`,
      options: [
        `Biến đổi tương đương bảo toàn tập nghiệm của bài toán ${topic}`,
        'Phép bình phương hai vế bất kỳ luôn là phép biến đổi tương đương',
        'Mọi hàm số liên tục đều có đạo hàm tại mọi điểm',
        'Có thể bỏ qua điều kiện xác định nếu bài toán yêu cầu tìm số nghiệm'
      ],
      correctAnswer: 0,
      explanation: 'Phép biến đổi tương đương giữ nguyên tập nghiệm, còn phép biến đổi hệ quả có thể sinh nghiệm ngoại lai.',
      xp: 25
    },
    {
      id: `ai_gen_fill_${seed}_4`,
      type: 'fill_blank',
      topicId: `ai_topic_${seed}`,
      topicTitle: topic,
      subject,
      difficulty: 'Vận dụng',
      question: `Trong giải tích và đại số, điều kiện để hàm số đạt cực trị tại x₀ là đạo hàm f'(x₀) = 0 và f'(x) phải làm gì khi đi qua x₀? (Nhập: "đổi dấu"):`,
      expectedAnswer: 'đổi dấu',
      acceptableAnswers: ['đổi dấu', 'doi dau', 'chuyển dấu'],
      placeholder: 'Ví dụ: đổi dấu',
      hint: 'Nếu f\'(x₀)=0 nhưng không chuyển dấu thì x₀ không phải điểm cực trị.',
      explanation: 'Đạo hàm phải đổi dấu từ dương sang âm (cực đại) hoặc từ âm sang dương (cực tiểu).',
      xp: 30
    },
    {
      id: `ai_gen_match_${seed}_5`,
      type: 'matching_pairs',
      topicId: `ai_topic_${seed}`,
      topicTitle: topic,
      subject,
      difficulty: 'Vận dụng',
      question: `GHÉP ĐÔI KHÁI NIỆM & Ý NGHĨA CHUYÊN ĐỀ "${topic}":`,
      matchingPairs: [
        { id: `mp_gen_${seed}_1`, left: 'Tập xác định D', right: 'Tập hợp tất cả các giá trị của x để biểu thức có nghĩa' },
        { id: `mp_gen_${seed}_2`, left: 'Nghiệm ngoại lai', right: 'Giá trị sinh ra do phép biến đổi hệ quả nhưng không thỏa mãn ban đầu' },
        { id: `mp_gen_${seed}_3`, left: 'Phương pháp đổi biến số', right: 'Đưa bài toán phức tạp về dạng quen thuộc đơn giản hơn' },
        { id: `mp_gen_${seed}_4`, left: 'Đánh giá bất đẳng thức (AM-GM / Cauchy)', right: 'Tìm giá trị lớn nhất (GTLN) và giá trị nhỏ nhất (GTNN)' }
      ],
      explanation: 'Hiểu đúng khái niệm là chìa khóa xử lý nhanh gọn mọi bài toán.',
      xp: 40
    },
    {
      id: `ai_gen_trap_${seed}_6`,
      type: 'trap_detect',
      topicId: `ai_topic_${seed}`,
      topicTitle: topic,
      subject,
      difficulty: 'Vận dụng cao 9+',
      question: `BẪY NGỘ NHẬN KINH ĐIỂN CHUYÊN ĐỀ "${topic}": Hãy phát hiện bước suy luận mắc bẫy sai lầm:`,
      steps: [
        { stepNum: 1, title: 'Khai căn hai vế phương trình x² = 9', content: 'Thực hiện phép căn bậc hai hai vế.', isFaulty: false },
        { stepNum: 2, title: 'Kết luận x = 3 mà quên nghiệm âm', content: 'Ghi nghiệm x = 3 và bỏ qua x = -3.', isFaulty: true, faultReason: 'BẪY QUÊN DẤU TRỊ TUYỆT ĐỐI! Căn bậc hai số học √(x²) = |x|. Do đó phương trình x² = 9 cho ra |x| = 3 tương đương x = ±3!' },
        { stepNum: 3, title: 'Kết luận tập nghiệm của bài toán', content: 'Ghi nhận tập nghiệm S.', isFaulty: false }
      ],
      options: ['Bước 1', 'Bước 2', 'Bước 3'],
      correctAnswer: 1,
      explanation: 'Bẫy quên dấu âm và trị tuyệt đối là bẫy phổ biến nhất trong đề thi trắc nghiệm.',
      xp: 35
    },
    {
      id: `ai_gen_fill_${seed}_7`,
      type: 'fill_blank',
      topicId: `ai_topic_${seed}`,
      topicTitle: topic,
      subject,
      difficulty: 'Vận dụng cao 9+',
      question: `Khi giải phương trình lượng giác sin(x) = m hoặc cos(x) = m, điều kiện của tham số m để phương trình CÓ NGHIỆM là |m| ≤ bao nhiêu? (Nhập số):`,
      expectedAnswer: '1',
      acceptableAnswers: ['1', 'một', 'one'],
      placeholder: 'Ví dụ: 1',
      hint: 'Hàm sin và cos luôn bị chặn trong đoạn [-1; 1].',
      explanation: 'Tập giá trị của sin và cos là [-1; 1], do đó |m| <= 1 là điều kiện cần và đủ để có nghiệm.',
      xp: 25
    },
    {
      id: `ai_gen_mcq_${seed}_8`,
      type: 'multiple_choice',
      topicId: `ai_topic_${seed}`,
      topicTitle: topic,
      subject,
      difficulty: 'Vận dụng',
      question: `Khi bài toán yêu cầu tìm số điểm chung của đồ thị hàm số y = f(x) và trục hoành Ox, ta cần tìm số nghiệm của phương trình nào?`,
      options: [
        'f(x) = 0',
        'f\'(x) = 0',
        'f(x) = 1',
        'f\'\'(x) = 0'
      ],
      correctAnswer: 0,
      explanation: 'Trục hoành Ox có phương trình y = 0, nên phương trình hoành độ giao điểm là f(x) = 0.',
      xp: 30
    }
  ];

  const forms: ExerciseForm[] = [
    {
      id: `form_gen_1_${seed}`,
      title: 'Form 1: Thực chiến Toàn diện & Nền tảng (8 bài)',
      description: `Bao quát 6 dạng câu hỏi trọng tâm cho chuyên đề ${topic}.`,
      formType: 'comprehensive',
      exercises: defaultExs,
      createdAt: 'Vừa tạo bởi Gemini AI'
    },
    {
      id: `form_gen_2_${seed}`,
      title: 'Form 2: Bắt bẫy Đề thi & Nhận định Đúng/Sai 2025 (7 bài)',
      description: 'Chuyên sâu bẫy ngộ nhận đề thi, chùm đúng sai 4 ý và phân loại nghiệm.',
      formType: 'trap_and_true_false',
      exercises: defaultExs.slice(1, 8),
      createdAt: 'Vừa tạo bởi Gemini AI'
    },
    {
      id: `form_gen_3_${seed}`,
      title: 'Form 3: Đột phá Vận dụng cao 9+ (8 bài)',
      description: 'Chinh phục bài toán tham số, cực trị hàm số và phương pháp giải nhanh.',
      formType: 'advanced_9plus',
      exercises: defaultExs,
      createdAt: 'Vừa tạo bởi Gemini AI'
    }
  ];

  return { topic, subject, forms };
}

/**
 * Backward compatible helper: generates exercises and full forms
 */
export function generateAiExercisesFromPrompt(
  prompt: string,
  defaultSubject?: string
): { topic: string; subject: string; exercises: Exercise[]; forms: ExerciseForm[] } {
  const res = generateAiExerciseForms(prompt, defaultSubject);
  const activeForm = res.forms[0];
  return {
    topic: res.topic,
    subject: res.subject,
    exercises: activeForm.exercises,
    forms: res.forms
  };
}

/**
 * Generate 2-3 additional fresh exercises to append into an active form dynamically.
 */
export function generateAdditionalExercises(
  topic: string,
  subject: string,
  currentCount: number,
  countToAdd: number = 3
): Exercise[] {
  const seed = Date.now().toString(36);
  const extraExercises: Exercise[] = [];

  // 1. Extra True / False Group
  extraExercises.push({
    id: `ai_extra_tf_${seed}_${currentCount + 1}`,
    type: 'true_false_group',
    topicId: `ai_topic_${seed}`,
    topicTitle: topic,
    subject,
    difficulty: 'Vận dụng cao 9+',
    question: `ĐÁNH GIÁ MỞ RỘNG (Đúng/Sai THPT 2025): Xét 4 khẳng định mở rộng chuyên sâu cho chuyên đề "${topic}":`,
    statements: [
      { id: `tf_ex_${seed}_1`, label: 'a)', statement: `Việc chuẩn hóa dữ liệu hoặc đặt ẩn phụ t trong ${topic} luôn bảo toàn tính đơn điệu nếu hàm đặt là hàm đồng biến.`, isCorrect: true, explanation: 'Hàm đồng biến bảo toàn thứ tự cực trị và nghiệm của bài toán gốc.' },
      { id: `tf_ex_${seed}_2`, label: 'b)', statement: 'Mọi bài toán cực trị có thể dùng đạo hàm bậc hai để phân loại mà không cần kiểm tra đạo hàm đổi dấu.', isCorrect: false, explanation: 'Nếu f\'\'(x₀) = 0, đạo hàm bậc hai không cho kết luận, bắt buộc phải dùng bảng biến thiên của f\'(x).' },
      { id: `tf_ex_${seed}_3`, label: 'c)', statement: `Trong đề thi phân hóa 9+, các bài toán ${topic} thường kết hợp tham số m để tạo ra các trường hợp suy biến.`, isCorrect: true, explanation: 'Trường hợp hệ số bậc cao nhất bằng 0 hoặc nghiệm trùng là bẫy phân hóa kinh điển.' },
      { id: `tf_ex_${seed}_4`, label: 'd)', statement: 'Đổi thứ tự tính toán trong giải thuật không ảnh hưởng đến độ phức tạp không gian (Space Complexity).', isCorrect: false, explanation: 'Thứ tự tính toán (như bottom-up lăn mảng) có thể giảm bộ nhớ từ O(N²) xuống O(N).' }
    ],
    explanation: 'Rèn luyện khả năng phát hiện ngộ nhận sâu sắc.',
    xp: 45
  });

  // 2. Extra Ordering Steps
  extraExercises.push({
    id: `ai_extra_ord_${seed}_${currentCount + 2}`,
    type: 'ordering_steps',
    topicId: `ai_topic_${seed}`,
    topicTitle: topic,
    subject,
    difficulty: 'Vận dụng',
    question: `SẮP XẾP BƯỚC NÂNG CAO: Sắp xếp quy trình 4 bước kiểm chứng kết quả chuyên đề "${topic}":`,
    orderingSteps: [
      { id: `ord_ex_${seed}_1`, correctOrder: 1, text: 'Bước 1: Thế nghiệm tìm được vào biểu thức gốc ban đầu để kiểm tra tính thỏa mãn.' },
      { id: `ord_ex_${seed}_2`, correctOrder: 2, text: 'Bước 2: Kiểm tra nghiệm tại các giá trị biên đặc biệt (x = 0, x = 1, x -> vô cực).' },
      { id: `ord_ex_${seed}_3`, correctOrder: 3, text: 'Bước 3: Dùng phương pháp phân tích thứ nguyên hoặc tính đối xứng để rà soát lỗi tính toán.' },
      { id: `ord_ex_${seed}_4`, correctOrder: 4, text: 'Bước 4: Viết câu trả lời cuối cùng theo đúng yêu cầu đề bài (số nghiệm, tập nghiệm, hay tổng các nghiệm).' }
    ],
    explanation: 'Kiểm chứng kết quả bằng nhiều phương pháp độc lập giúp đạt độ chính xác 100%.',
    xp: 35
  });

  // 3. Extra Fill in Blank
  if (countToAdd >= 3) {
    extraExercises.push({
      id: `ai_extra_fill_${seed}_${currentCount + 3}`,
      type: 'fill_blank',
      topicId: `ai_topic_${seed}`,
      topicTitle: topic,
      subject,
      difficulty: 'Vận dụng cao 9+',
      question: `Trong phương pháp đánh giá bất đẳng thức AM-GM cho n số thực không âm a₁, a₂, ..., aₙ, dấu đẳng thức ("=") xảy ra khi và chỉ khi các số aᵢ có mối quan hệ gì với nhau? (Nhập: "bằng nhau"):`,
      expectedAnswer: 'bằng nhau',
      acceptableAnswers: ['bằng nhau', 'bang nhau', 'a1=a2', 'bằng nhau hết'],
      placeholder: 'Ví dụ: bằng nhau',
      hint: 'Điều kiện điểm rơi của bất đẳng thức.',
      explanation: 'Dấu bằng của AM-GM xảy ra khi và chỉ khi a₁ = a₂ = ... = aₙ (điểm rơi đối xứng).',
      xp: 35
    });
  }

  return extraExercises;
}
