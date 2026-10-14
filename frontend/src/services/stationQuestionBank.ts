import { PracticeQuestionWithHints, LearningNode } from './roadmapCatalog';
import { geminiService } from './geminiService';

/**
 * Ngân hàng câu hỏi thích ứng & Đổi câu hỏi động bằng AI cho từng Trạm học tập
 * Hỗ trợ tạo đề trực tiếp bằng Google Gemini AI (3-5 câu thực hành, tối thiểu 5 câu kiểm tra cuối trạm)
 * Đảm bảo đáp án đúng (A, B, C, D) luôn được phân bổ ngẫu nhiên và đa dạng.
 */

/**
 * Đảm bảo đáp án đúng không bị dồn tất cả vào phương án A (index 0).
 * Hoán đổi vị trí phương án đúng đến các vị trí mục tiêu A, B, C, D một cách tự nhiên.
 */
export function distributeOptionsAndAnswers(questions: PracticeQuestionWithHints[]): PracticeQuestionWithHints[] {
  const targetPattern = [1, 2, 0, 3, 1, 2, 3, 0]; // Luân chuyển B, C, A, D, B, C, D, A
  return questions.map((q, idx) => {
    const opts = [...q.options];
    if (opts.length < 4) return q;

    const curCorrect = Math.max(0, Math.min(q.correctAnswer ?? 0, opts.length - 1));
    const targetIdx = targetPattern[idx % targetPattern.length];

    if (curCorrect !== targetIdx) {
      // Đổi chỗ phương án đúng sang vị trí mục tiêu
      const temp = opts[curCorrect];
      opts[curCorrect] = opts[targetIdx];
      opts[targetIdx] = temp;
      return {
        ...q,
        options: opts,
        correctAnswer: targetIdx
      };
    }
    return {
      ...q,
      options: opts
    };
  });
}

// ============================================================
// BỘ CÂU HỎI DỰ PHÒNG TOÁN HỌC (LUÔN CÓ ÍT NHẤT 5 CÂU MASTERY)
// ============================================================
const MATH_QUESTION_SETS: Array<{ practice: PracticeQuestionWithHints[]; mastery: PracticeQuestionWithHints[] }> = [
  // Set 1
  {
    practice: [
      {
        id: 'math_s1_q1',
        question: 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có đạo hàm $f\'(x) = (x - 1)(x + 2)^2(x - 3)^3$. Hàm số đã cho có bao nhiêu điểm cực trị?',
        options: ['1 điểm', '2 điểm', '3 điểm', '4 điểm'],
        correctAnswer: 1, // B
        hints: [
          'Điểm cực trị chỉ xảy ra khi đạo hàm $f\'(x)$ đổi dấu khi đi qua điểm đó.',
          'Nghiệm bội chẵn thì đạo hàm KHÔNG đổi dấu.'
        ],
        explanation: 'Ta có $f\'(x) = 0 \\Leftrightarrow x = 1$ (bội 1), $x = -2$ (bội 2), $x = 3$ (bội 3). Vì $x = -2$ là nghiệm bội chẵn nên $f\'(x)$ không đổi dấu qua $x = -2$. Do đó hàm số chỉ đổi dấu qua 2 điểm $x = 1$ và $x = 3$. Vậy có đúng 2 điểm cực trị.',
        trapAnalysis: 'Bẫy đếm tất cả các nghiệm của đạo hàm mà quên xét nghiệm bội chẵn khiến chọn nhầm 3 hoặc 4 cực trị.'
      },
      {
        id: 'math_s1_q2',
        question: 'Tập nghiệm của bất phương trình $\\log_2(x - 1) < 3$ là khoảng nào sau đây?',
        options: ['$(-\\infty; 9)$', '$(1; 9)$', '$(1; 8)$', '$(0; 9)$'],
        correctAnswer: 1, // B
        hints: [
          'Bước 1 bắt buộc: Đặt điều kiện xác định cho biểu thức dưới dấu logarit $x - 1 > 0$.',
          'Bước 2: Vì cơ số $a = 2 > 1$ nên bất phương trình giữ nguyên chiều: $x - 1 < 2^3 = 8$.'
        ],
        explanation: 'Điều kiện: $x - 1 > 0 \\Leftrightarrow x > 1$. Bất phương trình tương đương: $x - 1 < 2^3 = 8 \\Leftrightarrow x < 9$. Kết hợp điều kiện suy ra $1 < x < 9$.',
        trapAnalysis: 'Quên điều kiện xác định $x > 1$ dẫn tới chọn sai khoảng $(-\\infty; 9)$.'
      },
      {
        id: 'math_s1_q3',
        question: 'Biết $\\int_0^1 f(x)dx = 3$ và $\\int_0^1 g(x)dx = -2$. Tính tích phân $I = \\int_0^1 [2f(x) - 3g(x)]dx$.',
        options: ['0', '6', '12', '-12'],
        correctAnswer: 2, // C
        hints: [
          'Áp dụng tính chất tuyến tính của tích phân: $\\int [af(x) + bg(x)]dx = a\\int f(x)dx + b\\int g(x)dx$.'
        ],
        explanation: 'Ta có $I = 2\\int_0^1 f(x)dx - 3\\int_0^1 g(x)dx = 2(3) - 3(-2) = 6 + 6 = 12$.',
        trapAnalysis: 'Bẫy dấu âm: $-3 \\times (-2) = +6$, nhiều học sinh nhầm thành $6 - 6 = 0$.'
      }
    ],
    mastery: [
      {
        id: 'math_s1_m1',
        question: 'Cho hàm số bậc ba $y = ax^3 + bx^2 + cx + d$ có đồ thị uốn lượn với nhánh cuối đi xuống ($x \\to +\\infty, y \\to -\\infty$). Khẳng định nào sau đây chắc chắn ĐÚNG?',
        options: ['$a > 0$', '$a < 0$', '$c > 0$', '$d < 0$'],
        correctAnswer: 1, // B
        hints: ['Dấu của hệ số $a$ luôn cùng dấu với giới hạn của hàm số khi $x \\to +\\infty$.'],
        explanation: 'Khi $x \\to +\\infty$, giới hạn của hàm đa thức phụ thuộc vào số hạng bậc cao nhất $ax^3$. Đồ thị đi xuống tức $\\lim_{x \\to +\\infty} y = -\\infty \\Rightarrow a < 0$.',
        trapAnalysis: 'Nhầm dấu hệ số bậc cao nhất với điểm cắt trục tung $d$.'
      },
      {
        id: 'math_s1_m2',
        question: 'Phương trình $2^{x^2 - 3x} = 16$ có tổng các nghiệm bằng bao nhiêu?',
        options: ['-3', '4', '3', '-4'],
        correctAnswer: 2, // C
        hints: ['Đưa về cùng cơ số: $16 = 2^4$.', 'Sử dụng định lý Vi-et cho phương trình bậc hai: $x_1 + x_2 = -b/a$.'],
        explanation: 'Ta có $2^{x^2 - 3x} = 2^4 \\Leftrightarrow x^2 - 3x = 4 \\Leftrightarrow x^2 - 3x - 4 = 0$. Theo định lý Vi-et, tổng các nghiệm là $x_1 + x_2 = -(-3)/1 = 3$.',
        trapAnalysis: 'Quên chuyển vế đổi dấu $4$ thành $-4$, hoặc nhầm tích các nghiệm với tổng các nghiệm.'
      },
      {
        id: 'math_s1_m3',
        question: 'Số phức $z = 3 - 4i$ có môđun $|z|$ bằng bao nhiêu?',
        options: ['5', '7', '1', '25'],
        correctAnswer: 0, // A
        hints: ['Môđun của số phức $z = a + bi$ là $|z| = \\sqrt{a^2 + b^2}$.'],
        explanation: '$|z| = \\sqrt{3^2 + (-4)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$.',
        trapAnalysis: 'Quên căn bậc hai dẫn đến kết quả 25, hoặc lấy $3 - 4 = -1$.'
      },
      {
        id: 'math_s1_m4',
        question: 'Trong không gian $Oxyz$, khoảng cách từ điểm $M(1; 2; -3)$ đến mặt phẳng $(P): 2x - 2y + z + 8 = 0$ bằng:',
        options: ['2', '3', '1', '4'],
        correctAnswer: 2, // C: |2(1) - 2(2) + (-3) + 8| / sqrt(4+4+1) = |3| / 3 = 1
        hints: ['$d(M, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}$.'],
        explanation: '$d = \\frac{|2(1) - 2(2) - 3 + 8|}{\\sqrt{2^2 + (-2)^2 + 1^2}} = \\frac{|3|}{\\sqrt{9}} = \\frac{3}{3} = 1$.',
        trapAnalysis: 'Tính nhầm căn bậc hai ở mẫu hoặc tính sai dấu trong dấu giá trị tuyệt đối.'
      },
      {
        id: 'math_s1_m5',
        question: 'Cho hình nón có bán kính đáy $r = 3$ và chiều cao $h = 4$. Diện tích xung quanh $S_{xq}$ của hình nón đã cho là:',
        options: ['$12\\pi$', '$15\\pi$', '$20\\pi$', '$24\\pi$'],
        correctAnswer: 1, // B: l = 5, S = pi*r*l = 15*pi
        hints: ['Đường sinh $l = \\sqrt{r^2 + h^2} = \\sqrt{3^2 + 4^2} = 5$.', '$S_{xq} = \\pi r l$.'],
        explanation: 'Đường sinh $l = \\sqrt{3^2 + 4^2} = 5$. Diện tích xung quanh: $S_{xq} = \\pi r l = \\pi \\times 3 \\times 5 = 15\\pi$.',
        trapAnalysis: 'Nhầm lẫn công thức diện tích xung quanh với thể tích $V = \\frac{1}{3}\\pi r^2 h = 12\\pi$.'
      }
    ]
  },
  // Set 2
  {
    practice: [
      {
        id: 'math_s2_q1',
        question: 'Tìm tất cả các giá trị thực của tham số $m$ để hàm số $y = \\frac{x - 2}{x - m}$ đồng biến trên từng khoảng xác định.',
        options: ['$m > 2$', '$m < 2$', '$m \\ge 2$', '$m \\neq 2$'],
        correctAnswer: 1, // B
        hints: [
          'Tính đạo hàm: $y\' = \\frac{-m - (-2)}{(x - m)^2} = \\frac{-m + 2}{(x - m)^2}$.',
          'Hàm số đồng biến khi đạo hàm $y\' > 0$.'
        ],
        explanation: 'Ta có $y\' = \\frac{-m + 2}{(x - m)^2}$. Để hàm số đồng biến trên từng khoảng xác định thì $y\' > 0 \\Leftrightarrow -m + 2 > 0 \\Leftrightarrow m < 2$.',
        trapAnalysis: 'Nhầm dấu trong công thức tính nhanh đạo hàm $ad - bc$ dẫn đến chọn nhầm $m > 2$.'
      },
      {
        id: 'math_s2_q2',
        question: 'Biết $\\log_2 3 = a$. Biểu diễn $\\log_{12} 18$ theo $a$ ta được kết quả là:',
        options: ['$\\frac{2 + a}{1 + 2a}$', '$\\frac{1 + 2a}{2 + a}$', '$\\frac{1 + a}{2a}$', '$\\frac{2a - 1}{a + 2}$'],
        correctAnswer: 1, // B
        hints: [
          'Đổi về cơ số 2: $\\log_{12} 18 = \\frac{\\log_2 18}{\\log_2 12}$.',
          'Tách $18 = 2 \\times 3^2$ và $12 = 2^2 \\times 3$.'
        ],
        explanation: '$\\log_{12} 18 = \\frac{\\log_2(2 \\times 3^2)}{\\log_2(2^2 \\times 3)} = \\frac{1 + 2\\log_2 3}{2 + \\log_2 3} = \\frac{1 + 2a}{2 + a}$.',
        trapAnalysis: 'Nhầm lẫn thứ tự tử và mẫu khi áp dụng công thức đổi cơ số.'
      },
      {
        id: 'math_s2_q3',
        question: 'Nếu đặt $t = \\sqrt{x + 1}$ thì tích phân $\\int_0^3 \\frac{x}{\\sqrt{x + 1}}dx$ trở thành tích phân nào?',
        options: ['$\\int_1^2 (t^2 - 1)dt$', '$\\int_0^3 2(t^2 - 1)dt$', '$\\int_1^2 2(t^2 - 1)dt$', '$\\int_1^2 2t^2 dt$'],
        correctAnswer: 2, // C
        hints: [
          'Đổi biến: $t^2 = x + 1 \\Rightarrow x = t^2 - 1 \\Rightarrow dx = 2t dt$.',
          'Đổi cận: $x = 0 \\Rightarrow t = 1$; $x = 3 \\Rightarrow t = 2$.'
        ],
        explanation: 'Đổi cận: $x = 0 \\to t = 1, x = 3 \\to t = 2$. Khi đó tích phân trở thành $\\int_1^2 \\frac{t^2 - 1}{t} (2t dt) = \\int_1^2 2(t^2 - 1)dt$.',
        trapAnalysis: 'Quên nhân vi phân $dx = 2t dt$ hoặc quên đổi cận theo biến mới $t$.'
      }
    ],
    mastery: [
      {
        id: 'math_s2_m1',
        question: 'Cho hàm số $f(x)$ liên tục trên $\\mathbb{R}$ thỏa mãn $f(x) + f(2 - x) = 4$. Tính tích phân $I = \\int_0^2 f(x)dx$.',
        options: ['8', '4', '2', '0'],
        correctAnswer: 1, // B
        hints: ['Đổi biến $t = 2 - x$.', 'Cộng hai tích phân lại: $2I = \\int_0^2 [f(x) + f(2 - x)]dx = \\int_0^2 4dx = 8$.'],
        explanation: '$2I = \\int_0^2 4dx = 8 \\Rightarrow I = 4$.',
        trapAnalysis: 'Tính ra $2I = 8$ nhưng quên chia 2 nên chọn nhầm 8.'
      },
      {
        id: 'math_s2_m2',
        question: 'Một tổ có 6 học sinh nam và 4 học sinh nữ. Chọn ngẫu nhiên 3 học sinh. Xác suất để chọn được ít nhất 1 học sinh nữ là:',
        options: ['$\\frac{1}{6}$', '$\\frac{2}{3}$', '$\\frac{4}{5}$', '$\\frac{5}{6}$'],
        correctAnswer: 3, // D
        hints: ['Dùng biến cố đối: Chọn 3 nam: $P = C_6^3 / C_{10}^3 = 20 / 120 = 1/6$.'],
        explanation: 'Xác suất biến cố đối (không có nữ nào): $20/120 = 1/6$. Vậy xác suất có ít nhất 1 nữ: $1 - 1/6 = 5/6$.',
        trapAnalysis: 'Chọn nhầm biến cố đối $1/6$.'
      },
      {
        id: 'math_s2_m3',
        question: 'Cho khối lăng trụ tam giác $ABC.A\'B\'C\'$ có thể tích $V$. Thể tích khối chóp $A\'.ABC$ bằng:',
        options: ['$\\frac{V}{3}$', '$\\frac{V}{2}$', '$\\frac{2V}{3}$', '$\\frac{V}{6}$'],
        correctAnswer: 0, // A
        hints: ['Khối chóp có cùng đáy và cùng chiều cao với lăng trụ thì $V_{chóp} = \\frac{1}{3} V_{lăng trụ}$.'],
        explanation: 'Vì khối chóp $A\'.ABC$ có cùng diện tích đáy $(ABC)$ và cùng chiều cao hạ từ đỉnh $A\'$ xuống mặt đáy như lăng trụ, nên $V_{A\'.ABC} = \\frac{1}{3}V$.',
        trapAnalysis: 'Nhầm tỷ số $1/3$ với $1/2$.'
      },
      {
        id: 'math_s2_m4',
        question: 'Đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$ có đường tiệm cận đứng và tiệm cận ngang lần lượt là:',
        options: ['$x = -1; y = 2$', '$x = 1; y = 2$', '$x = -1; y = -1$', '$x = 2; y = -1$'],
        correctAnswer: 0, // A
        hints: ['Tiệm cận đứng là nghiệm của mẫu $x + 1 = 0 \\Rightarrow x = -1$.', 'Tiệm cận ngang $y = 2/1 = 2$.'],
        explanation: 'Mẫu số bằng 0 khi $x = -1$ (tiệm cận đứng). Hệ số bậc cao nhất $2/1 = 2$ (tiệm cận ngang $y = 2$).',
        trapAnalysis: 'Đảo ngược giữa tiệm cận đứng và tiệm cận ngang.'
      },
      {
        id: 'math_s2_m5',
        question: 'Giá trị nhỏ nhất của hàm số $f(x) = x^4 - 2x^2 + 3$ trên đoạn $[0; 2]$ bằng:',
        options: ['3', '11', '2', '1'],
        correctAnswer: 2, // C: x=1 => f(1) = 1-2+3 = 2
        hints: ['$f\'(x) = 4x^3 - 4x = 0 \\Leftrightarrow x = 0, x = 1$ trên $[0; 2]$.', 'Tính $f(0) = 3, f(1) = 2, f(2) = 11$.'],
        explanation: 'Ta có $f(0) = 3$, $f(1) = 2$, $f(2) = 11$. Vậy giá trị nhỏ nhất trên đoạn $[0; 2]$ là $2$ đạt tại $x = 1$.',
        trapAnalysis: 'Chỉ tính ở hai đầu mút $f(0) = 3$ và $f(2) = 11$ mà quên tính tại điểm cực trị $x = 1$.'
      }
    ]
  }
];

// ============================================================
// BỘ CÂU HỎI DỰ PHÒNG IELTS ACADEMIC (LUÔN CÓ ÍT NHẤT 5 CÂU MASTERY)
// ============================================================
const IELTS_QUESTION_SETS: Array<{ practice: PracticeQuestionWithHints[]; mastery: PracticeQuestionWithHints[] }> = [
  // Set 1: Writing Task 2 Cohesion & Speaking Fluency
  {
    practice: [
      {
        id: 'ielts_s1_q1',
        question: 'Which cohesive device best fits this gap: "Renewable energy has become much cheaper over the last decade. ______, many nations still rely predominantly on fossil fuels."',
        options: ['Furthermore', 'Nevertheless', 'Consequently', 'For instance'],
        correctAnswer: 1, // B
        hints: ['Look for a contrast marker expressing an unexpected paradox.'],
        explanation: '"Nevertheless" expresses strong contrast between falling green energy costs and persistent fossil fuel use.',
        trapAnalysis: 'Selecting "Consequently" is a trap because the second sentence does NOT describe a natural result of the first sentence.'
      },
      {
        id: 'ielts_s1_q2',
        question: 'In IELTS Speaking Part 2, when you need 5 seconds to gather your thoughts without losing fluency points, which natural filler is best?',
        options: [
          '"Uhm... ah... I don\'t know..."',
          'Remaining completely silent',
          '"That\'s an intriguing question. Let me reflect on that for a second..."',
          '"Can you translate this word into Vietnamese for me?"'
        ],
        correctAnswer: 2, // C
        hints: ['Examiners look for natural conversational discourse markers rather than dead silence.'],
        explanation: 'Using authentic conversational phrases ("That\'s an intriguing question...") maintains your fluency score.',
        trapAnalysis: 'Dead silence over 3 seconds severely penalizes your Fluency and Coherence criterion.'
      },
      {
        id: 'ielts_s1_q3',
        question: 'In IELTS Reading True/False/Not Given: The text states "Dr. Smith conducted experiments primarily on nocturnal mammals." The statement says "Dr. Smith only tested mammals that are active at night." What is the answer?',
        options: ['TRUE', 'NOT GIVEN', 'FALSE', 'INSUFFICIENT'],
        correctAnswer: 2, // C
        hints: ['Compare "primarily" (chiefly/mostly) with "only" (exclusively). They contradict!'],
        explanation: '"Primarily" means most of the time, not strictly 100%. "Only" implies zero exceptions. Therefore the statement contradicts the passage -> FALSE.',
        trapAnalysis: 'Many candidates choose TRUE because both mention nocturnal mammals, overlooking the absolute qualifier "only".'
      }
    ],
    mastery: [
      {
        id: 'ielts_s1_m1',
        question: 'In IELTS Writing Task 2, what is the optimal length of an essay that balances depth with proofreading time?',
        options: ['Under 230 words', '260 – 290 words', 'Over 450 words', 'Exactly 250 words'],
        correctAnswer: 1, // B
        hints: ['Writing too long wastes time; writing under 250 words incurs an underlength penalty.'],
        explanation: '260-290 words provides sufficient depth for Task Response while leaving 3-5 minutes for proofreading.',
        trapAnalysis: 'Writing 400+ words often results in rushed conclusions and numerous avoidable slip-ups.'
      },
      {
        id: 'ielts_s1_m2',
        question: 'Which sentence demonstrates the best use of conditional grammar for IELTS Writing Task 2?',
        options: [
          '"If government make rule, emission will go down."',
          '"Government should make rules so emission decreases."',
          '"Were governments to enforce stricter regulations, industrial emissions would witness a substantial decline."',
          '"Had government make rules, emission is down."'
        ],
        correctAnswer: 2, // C
        hints: ['Inverted conditional (Inversion with "Were") is a top-tier C2 grammatical structure.'],
        explanation: 'Inverted conditional "Were governments to enforce..." demonstrates sophisticated grammatical range (Band 8.0+).',
        trapAnalysis: 'Using simple First Conditionals without lexical variety keeps Grammar at Band 6.0.'
      },
      {
        id: 'ielts_s1_m3',
        question: 'Which of the following is a C1/C2 band academic collocation for discussing solutions to climate change?',
        options: ['fix the planet issue', 'do something to stop bad weather', 'make nature become better', 'mitigate the environmental ramifications'],
        correctAnswer: 3, // D
        hints: ['Look for a formal verb + noun collocation used in academic journals.'],
        explanation: '"Mitigate the ramifications" demonstrates advanced Lexical Resource (Band 8.0+).',
        trapAnalysis: 'Colloquial phrases like "do something" or "fix the planet" are Band 5.0 - 6.0 vocabulary.'
      },
      {
        id: 'ielts_s1_m4',
        question: 'In IELTS Listening Part 3: Speaker A says: "We should choose the digital format." Speaker B replies: "I was keen on that initially, but printing costs dropped dramatically, so let\'s stick to paper." Which format was finalized?',
        options: ['Digital format', 'Paper format', 'Both formats', 'Neither'],
        correctAnswer: 1, // B
        hints: ['Listen to the resolution after the pivot word "but".'],
        explanation: 'Speaker B changed their mind ("let\'s stick to paper"), which Speaker A agreed with. Thus paper is the final decision.',
        trapAnalysis: 'Falling for the distractor "digital format" mentioned first.'
      },
      {
        id: 'ielts_s1_m5',
        question: 'What is the primary role of a Topic Sentence in an IELTS Writing Task 2 body paragraph?',
        options: [
          'To introduce personal background information about the candidate',
          'To state the central controlling idea of the entire paragraph clearly and concisely',
          'To summarize the whole essay in 50 words',
          'To quote statistics from unknown researchers'
        ],
        correctAnswer: 1, // B
        hints: ['A topic sentence anchors Coherence & Cohesion by stating the main argument.'],
        explanation: 'The topic sentence announces the controlling idea of that specific paragraph so the examiner immediately grasps the argument.',
        trapAnalysis: 'Starting with a random example without a clear overarching claim degrades Coherence.'
      }
    ]
  },
  // Set 2: Reading Skills & Advanced Task Response
  {
    practice: [
      {
        id: 'ielts_s2_q1',
        question: 'Paraphrase this prompt sentence for an academic introduction: "More people are choosing to live in mega cities than ever before."',
        options: [
          '"Lots of persons like big cities today."',
          '"There has been an unprecedented surge in urbanization worldwide."',
          '"Mega cities have lots of inhabitants."',
          '"People decide to move to big town continually."'
        ],
        correctAnswer: 1, // B
        hints: ['Transform verbs and nouns into formal academic equivalents (urbanization, unprecedented surge).'],
        explanation: '"Unprecedented surge in urbanization" paraphrases the idea eloquently without copying source vocabulary.',
        trapAnalysis: 'Copying original words word-for-word limits your Lexical Resource to Band 6.0.'
      },
      {
        id: 'ielts_s2_q2',
        question: 'In IELTS Speaking Part 3, how should you structure your response to an analytical question?',
        options: [
          'A simple "Yes, I agree" with 1 sentence',
          'Direct Answer -> Underlying Cause -> Real-world Example -> Counter-perspective or Future Projection',
          'Talk for 5 minutes without letting the examiner speak',
          'Memorize a generic template from the internet'
        ],
        correctAnswer: 1, // B
        hints: ['Part 3 tests abstract discussion and analytical discourse.'],
        explanation: 'Using the A-E-E-C framework (Answer, Explain, Example, Consequence) guarantees Band 7.5+ coherence.',
        trapAnalysis: 'Giving short personal anecdotes in Part 3 instead of broad societal viewpoints.'
      },
      {
        id: 'ielts_s2_q3',
        question: 'In Listening, if you hear: "The lecture will be held on the 14th of August, not the 4th as previously announced", what is the correct date?',
        options: ['4th August', '40th August', '14th August (14 August)', '24th August'],
        correctAnswer: 2, // C
        hints: ['Distinguish between the teen (-teen) and ten (-ty) sound, and notice the negation "not the 4th".'],
        explanation: 'The speaker explicitly rejected the 4th and confirmed the 14th.',
        trapAnalysis: 'Writing down 4th because it was remembered from earlier in the sentence.'
      }
    ],
    mastery: [
      {
        id: 'ielts_s2_m1',
        question: 'In Writing Task 2 Cohesion, what is the best way to link the second body paragraph to the first body paragraph?',
        options: [
          'Start immediately with "I also think"',
          'Use a transitional bridge sentence referencing the previous viewpoint before introducing the counter-argument',
          'Repeat the whole thesis statement word-for-word',
          'Leave a gap of 5 blank lines'
        ],
        correctAnswer: 1, // B
        hints: ['Cohesion between paragraphs is evaluated for Band 8+ Coherence.'],
        explanation: 'A transitional bridge (e.g., "While the economic advantages discussed above are undeniable, the social repercussions cannot be overlooked") seamlessly links paragraphs.',
        trapAnalysis: 'Abruptly starting with generic words like "Also" damages paragraph progression.'
      },
      {
        id: 'ielts_s2_m2',
        question: 'Which transition phrase denotes a cause-and-effect relationship in formal writing?',
        options: ['Conversely', 'As a direct consequence of this', 'In a similar vein', 'On the other hand'],
        correctAnswer: 1, // B
        hints: ['Look for a phrase showing consequence or outcome.'],
        explanation: '"As a direct consequence of this" explicitly ties an effect back to its root cause.',
        trapAnalysis: 'Confusing contrast transitions (Conversely) with causal transitions.'
      },
      {
        id: 'ielts_s2_m3',
        question: 'When analyzing charts in IELTS Writing Task 1, what should you NEVER include in the overview paragraph?',
        options: [
          'The general upward or downward trajectory',
          'The highest and lowest general extremes',
          'Detailed specific numerical figures and data points for every single year',
          'The overall key features without raw numbers'
        ],
        correctAnswer: 2, // C
        hints: ['The overview is for main trends, not granular raw data.'],
        explanation: 'Detailed figures belong in the body paragraphs. The Overview should highlight broad trends without getting bogged down in individual numbers.',
        trapAnalysis: 'Putting raw statistics in the overview leads to a penalized Task Achievement score.'
      },
      {
        id: 'ielts_s2_m4',
        question: 'Which word is a formal synonym for "disadvantage" suitable for Band 8+ essays?',
        options: ['Bad thing', 'Drawback / Shortcoming', 'Problematic stuff', 'Negative element thing'],
        correctAnswer: 1, // B
        hints: ['Academic nouns representing drawbacks.'],
        explanation: '"Drawback", "shortcoming", and "impediment" are precise academic nouns.',
        trapAnalysis: 'Using informal phrases like "bad thing" drops Lexical Resource to Band 5.'
      },
      {
        id: 'ielts_s2_m5',
        question: 'In IELTS Reading, how should you approach a Paragraph Heading Matching question?',
        options: [
          'Read the whole passage line-by-line first for 15 minutes',
          'Read the headings first, underline key distinctions, then read the first and last sentences of each paragraph to determine the main theme',
          'Pick headings based on matching individual identical words',
          'Guess all headings without reading'
        ],
        correctAnswer: 1, // B
        hints: ['Paragraph headings summarize the core theme of the entire paragraph, not minor details.'],
        explanation: 'Analyzing headings first and skimming topic and concluding sentences reveals the paragraph focus efficiently.',
        trapAnalysis: 'Falling for "word-matching traps" where a heading contains a word from the paragraph that is only a passing mention.'
      }
    ]
  }
];

// ============================================================
// BỘ CÂU HỎI DỰ PHÒNG ĐGNL & TƯ DUY LOGIC (ÍT NHẤT 5 CÂU MASTERY)
// ============================================================
const DGNL_QUESTION_SETS: Array<{ practice: PracticeQuestionWithHints[]; mastery: PracticeQuestionWithHints[] }> = [
  {
    practice: [
      {
        id: 'dgnl_s1_q1',
        question: 'Trong một giải bóng đá có 8 đội tham gia thi đấu vòng tròn 1 lượt (mỗi đội gặp nhau đúng 1 lần). Tổng số trận đấu trong giải là bao nhiêu?',
        options: ['56 trận', '28 trận', '16 trận', '32 trận'],
        correctAnswer: 1, // B
        hints: ['Mỗi trận đấu là một tập hợp gồm 2 đội chọn từ 8 đội: $C_8^2$.'],
        explanation: 'Số trận đấu là tổ hợp chập 2 của 8 đội: $C_8^2 = \\frac{8 \\times 7}{2} = 28$ trận.',
        trapAnalysis: 'Nhầm lẫn giữa chỉnh hợp $A_8^2 = 56$ (tính cả lượt đi lượt về) và tổ hợp $C_8^2 = 28$ (chỉ 1 lượt).'
      },
      {
        id: 'dgnl_s1_q2',
        question: 'Cho mệnh đề: "Nếu trời mưa thì đường trơn". Mệnh đề đảo nào sau đây phản ánh đúng tính chất logic tương đương phản đảo?',
        options: [
          '"Nếu đường trơn thì trời mưa"',
          '"Nếu trời không mưa thì đường không trơn"',
          '"Nếu đường không trơn thì trời không mưa"',
          '"Trời mưa nhưng đường không trơn"'
        ],
        correctAnswer: 2, // C
        hints: ['Quy tắc phản đảo: $P \\Rightarrow Q$ tương đương với $\\neg Q \\Rightarrow \\neg P$.'],
        explanation: 'Mệnh đề phản đảo của $P \\Rightarrow Q$ là $\\neg Q \\Rightarrow \\neg P$ ("Nếu đường không trơn thì trời không mưa").',
        trapAnalysis: 'Nhầm lẫn giữa mệnh đề phản đảo (tương đương logic) và mệnh đề đảo $Q \\Rightarrow P$ (không nhất thiết đúng).'
      },
      {
        id: 'dgnl_s1_q3',
        question: 'Biểu đồ thể hiện doanh thu tăng 20% mỗi năm trong 2 năm liên tiếp. So với năm đầu tiên, sau 2 năm doanh thu tăng tổng cộng bao nhiêu %?',
        options: ['40%', '24%', '44%', '50%'],
        correctAnswer: 2, // C
        hints: ['Lãi kép / Tăng lũy tiến: $1.2 \\times 1.2 = 1.44$.'],
        explanation: 'Sau năm thứ nhất: $1 + 0.2 = 1.2$. Sau năm thứ hai: $1.2 \\times 1.2 = 1.44$, tương ứng tăng $44\\%$.',
        trapAnalysis: 'Lỗi cộng cơ học: $20\\% + 20\\% = 40\\%$, quên mất phần tăng trên nền doanh thu mới.'
      }
    ],
    mastery: [
      {
        id: 'dgnl_s1_m1',
        question: 'Có 5 người A, B, C, D, E ngồi vào một hàng ghế 5 chỗ. Xác suất để A và B luôn ngồi cạnh nhau là:',
        options: ['$\\frac{1}{5}$', '$\\frac{2}{5}$', '$\\frac{3}{5}$', '$\\frac{1}{2}$'],
        correctAnswer: 1, // B
        hints: ['Buộc A và B thành một khối $(AB)$. Khi đó có 4 phần tử xếp chỗ: $4! \\times 2!$.'],
        explanation: 'Số phần tử không gian mẫu: $5! = 120$. Xếp A và B cạnh nhau: coi $(AB)$ là 1 người, có $4! = 24$ cách; đổi chỗ A và B có $2! = 2$ cách $\\Rightarrow 48$ cách. Xác suất: $48/120 = 2/5$.',
        trapAnalysis: 'Quên nhân hoán vị 2 người A và B trong khối ($2!$).'
      },
      {
        id: 'dgnl_s1_m2',
        question: 'Nếu tất cả A đều là B, và một số B là C. Khẳng định nào sau đây CHẮC CHẮN ĐÚNG?',
        options: [
          'Tất cả A đều là C',
          'Một số A là C',
          'Chưa đủ dữ kiện để khẳng định bất kỳ A nào là C',
          'Không có A nào là C'
        ],
        correctAnswer: 2, // C
        hints: ['Dùng biểu đồ Ven: Tập hợp C có thể chỉ giao với phần B mà không giao với phần A.'],
        explanation: 'Vì phần B chứa C có thể hoàn toàn nằm ngoài tập hợp con A, nên không thể khẳng định chắc chắn mối quan hệ giữa A và C.',
        trapAnalysis: 'Ngộ nhận suy diễn bắc cầu khi mệnh đề thứ hai là mệnh đề bộ phận ("một số").'
      },
      {
        id: 'dgnl_s1_m3',
        question: 'Dãy số 2, 6, 12, 20, 30, ... có số hạng tiếp theo là:',
        options: ['40', '42', '44', '36'],
        correctAnswer: 1, // B: 1*2, 2*3, 3*4, 4*5, 5*6, 6*7 = 42
        hints: ['Quy luật: $n(n+1)$ hoặc khoảng cách tăng dần: +4, +6, +8, +10, +12.'],
        explanation: 'Khoảng cách giữa các số hạng là 4, 6, 8, 10. Khoảng cách tiếp theo là 12, do đó số tiếp theo là $30 + 12 = 42$.',
        trapAnalysis: 'Cộng nhầm khoảng cách thành +10 dẫn đến 40.'
      },
      {
        id: 'dgnl_s1_m4',
        question: 'Một bình kín chứa hỗn hợp khí X gồm $H_2$ và $O_2$ có tỷ khối so với $He$ bằng 2.5. Tỷ lệ thể tích giữa $H_2$ và $O_2$ trong hỗn hợp là:',
        options: ['1 : 1', '7 : 1', '11 : 4', '3 : 1'],
        correctAnswer: 2, // C: M_tb = 10. Dùng đường chéo: H2 (2) và O2 (32) với M_tb = 10 => (32-10)/(10-2) = 22/8 = 11/4
        hints: ['Khối lượng mol trung bình $\\bar{M} = 2.5 \\times 4 = 10$. Dùng quy tắc đường chéo.'],
        explanation: 'Khối lượng mol trung bình là $2.5 \\times 4 = 10$. Áp dụng quy tắc đường chéo: $n_{H_2}/n_{O_2} = (32 - 10)/(10 - 2) = 22/8 = 11/4$.',
        trapAnalysis: 'Nhầm khối lượng mol của He là 2 thay vì 4.'
      },
      {
        id: 'dgnl_s1_m5',
        question: 'Biết rằng 3 máy in làm việc cùng công suất in xong một lượng tài liệu trong 4 giờ. Muốn in xong lượng tài liệu đó trong 1.5 giờ thì cần thêm bao nhiêu máy in cùng loại?',
        options: ['8 máy', '5 máy', '6 máy', '4 máy'],
        correctAnswer: 1, // B: 3*4 = 12 máy.giờ. 12 / 1.5 = 8 máy. Cần THÊM: 8 - 3 = 5 máy.
        hints: ['Tổng khối lượng công việc: $3 \\times 4 = 12$ máy-giờ.', 'Đọc kỹ câu hỏi: Cần THÊM bao nhiêu máy, chứ không phải tổng số máy.'],
        explanation: 'Số máy cần để hoàn thành trong 1.5 giờ: $12 / 1.5 = 8$ máy. Vì đã có sẵn 3 máy, nên cần thêm $8 - 3 = 5$ máy.',
        trapAnalysis: 'Bẫy trả lời tổng số máy (8 máy) thay vì số máy cần thêm (5 máy).'
      }
    ]
  }
];

/**
 * Trả về bộ câu hỏi thích ứng (Practice + Mastery) cho trạm học tập
 * Hỗ trợ xoay vòng setIndex: 0, 1, 2...
 * Đảm bảo masteryTest luôn có ít nhất 5 câu hỏi và đáp án phân bổ đa dạng.
 */
export function getAlternateQuestionsForStation(
  node: LearningNode,
  setIndex: number = 0
): {
  practiceQuestions: PracticeQuestionWithHints[];
  masteryTest: PracticeQuestionWithHints[];
  setName: string;
} {
  const subjectLower = (node.subject || '').toLowerCase();
  const titleLower = (node.title || '').toLowerCase();

  const isIelts = subjectLower.includes('ielts') || titleLower.includes('ielts') || titleLower.includes('band') || subjectLower.includes('english') || titleLower.includes('writing') || titleLower.includes('speaking') || titleLower.includes('reading');
  const isDgnl = subjectLower.includes('đgnl') || subjectLower.includes('đgtd') || subjectLower.includes('tsa') || titleLower.includes('logic');

  let chosenBank = MATH_QUESTION_SETS;
  if (isIelts) {
    chosenBank = IELTS_QUESTION_SETS;
  } else if (isDgnl) {
    chosenBank = DGNL_QUESTION_SETS;
  }

  const safeIdx = Math.abs(setIndex) % chosenBank.length;
  const set = chosenBank[safeIdx];
  const setLetter = String.fromCharCode(65 + safeIdx); // A, B, C...

  // Tùy biến mã câu hỏi theo station để tránh trùng ID
  const customizedPractice = set.practice.map((q, qIdx) => ({
    ...q,
    id: `${node.id}_p_s${safeIdx}_${qIdx}`
  }));

  const customizedMastery = set.mastery.map((q, qIdx) => ({
    ...q,
    id: `${node.id}_m_s${safeIdx}_${qIdx}`
  }));

  // Phân bổ đáp án không để tất cả là A
  const distributedPractice = distributeOptionsAndAnswers(customizedPractice);
  const distributedMastery = distributeOptionsAndAnswers(customizedMastery);

  return {
    practiceQuestions: distributedPractice,
    masteryTest: distributedMastery,
    setName: `Bộ Đề Thích Ứng ${setLetter} (AI Curated)`
  };
}

/**
 * Tạo câu hỏi mới trực tiếp qua Google Gemini API hoặc Backend FastAPI
 * Đảm bảo:
 * - 3 câu thực hành có gợi ý
 * - BẮT BUỘC ÍT NHẤT 5 CÂU HỎI KIỂM TRA CUỐI TRẠM (Mastery)
 * - Các đáp án đúng được phân bổ ngẫu nhiên (không luôn là A)
 */
export async function generateLiveStationQuestionsWithAi(
  node: LearningNode,
  difficulty: string
): Promise<{
  practiceQuestions: PracticeQuestionWithHints[];
  masteryTest: PracticeQuestionWithHints[];
} | null> {
  const keyConcept = node.outcomes?.keyConcept || node.title;

  // 1. Ưu tiên gọi Backend FastAPI (Endpoint chuyên sâu tích hợp Gemini 3.5 & phân bổ đáp án)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    const res = await fetch('/api/roadmap/generate-station-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        station_number: node.stationNumber,
        title: node.title,
        subject: node.subject,
        key_concept: keyConcept,
        difficulty: difficulty || node.difficulty,
        stage_name: node.stageName
      }),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.practice) && Array.isArray(data.mastery) && data.mastery.length >= 5) {
        return {
          practiceQuestions: distributeOptionsAndAnswers(data.practice),
          masteryTest: distributeOptionsAndAnswers(data.mastery)
        };
      }
    }
  } catch (backendErr) {
    console.warn('Backend station question endpoint unavailable, attempting client-side Gemini:', backendErr);
  }

  // 2. Dự phòng: Gọi trực tiếp Google Gemini API từ trình duyệt
  if (geminiService.hasApiKey()) {
    try {
      const prompt = `Bạn là Chuyên gia Khảo thí và Thiết kế Câu hỏi Trắc nghiệm của EduAdvisor AI.
Hãy tạo một bộ câu hỏi ĐỘC BẢN, SÁT CHỦ ĐỀ và CHUẨN SƯ PHẠM cho trạm học tập sau:
- Trạm số: ${node.stationNumber}
- Tên trạm: ${node.title}
- Môn học: ${node.subject}
- Trọng tâm kiến thức: ${keyConcept}
- Độ khó: ${difficulty || node.difficulty}

YÊU CẦU NGHIÊM NGẶT:
1. practice: Đúng 3 câu hỏi trắc nghiệm có gợi ý (hints), lời giải thích Socratic (explanation) và phân tích bẫy (trapAnalysis).
2. mastery: BẮT BUỘC ĐÚNG 5 CÂU HỎI (ít nhất 5 câu hỏi kiểm tra cuối trạm chuẩn đầu ra, đánh số từ m1 đến m5).
3. ĐÁP ÁN ĐÚNG (correctAnswer):
   - TUYỆT ĐỐI KHÔNG ĐƯỢC để tất cả câu hỏi đều có đáp án là 0 (A).
   - BẮT BUỘC phân bổ ngẫu nhiên và đa dạng giữa các phương án 0, 1, 2, 3 (A, B, C, D). Ví dụ câu 1 chọn B (1), câu 2 chọn C (2), câu 3 chọn D (3), câu 4 chọn A (0), câu 5 chọn B (1)...
4. Mỗi câu hỏi phải có đúng 4 lựa chọn [A, B, C, D].

Trả về DUY NHẤT một chuỗi JSON hợp lệ không có markdown bọc ngoài theo cấu trúc:
{
  "practice": [
    {
      "id": "p_1",
      "question": "Câu hỏi thực hành 1 sát chủ đề ${node.title}...",
      "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      "correctAnswer": 1,
      "hints": ["Gợi ý bước 1", "Gợi ý bước 2"],
      "explanation": "Lời giải thích Socratic...",
      "trapAnalysis": "Phân tích bẫy thi..."
    }
  ],
  "mastery": [
    {
      "id": "m_1",
      "question": "Câu hỏi kiểm tra cuối trạm 1 sát chủ đề ${node.title}...",
      "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      "correctAnswer": 2,
      "hints": ["Gợi ý cốt lõi"],
      "explanation": "Lời giải...",
      "trapAnalysis": "Bẫy..."
    }
  ]
}`;

      const res = await geminiService.sendMessage({
        prompt,
        subject: node.subject,
        timeoutMs: 25000
      });

      if (res && res.text) {
        let cleanJson = res.text.trim();
        if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/^```json/, '');
        if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/^```/, '');
        if (cleanJson.endsWith('```')) cleanJson = cleanJson.replace(/```$/, '');
        cleanJson = cleanJson.trim();

        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed.practice) && Array.isArray(parsed.mastery)) {
          let practice = parsed.practice;
          let mastery = parsed.mastery;

          // Nếu AI sinh thiếu câu test cuối trạm, bổ sung từ ngân hàng
          if (mastery.length < 5) {
            const fallback = getAlternateQuestionsForStation(node, 0);
            while (mastery.length < 5 && fallback.masteryTest.length > mastery.length) {
              mastery.push(fallback.masteryTest[mastery.length]);
            }
          }

          return {
            practiceQuestions: distributeOptionsAndAnswers(practice),
            masteryTest: distributeOptionsAndAnswers(mastery)
          };
        }
      }
    } catch (err) {
      console.warn('Direct Gemini API question generation error, fallback to curated bank:', err);
    }
  }

  // 3. Fallback an toàn có phân bổ đáp án
  return getAlternateQuestionsForStation(node, Math.floor(Math.random() * 5));
}
