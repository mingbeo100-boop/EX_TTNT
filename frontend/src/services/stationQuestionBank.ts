import { PracticeQuestionWithHints, LearningNode } from './roadmapCatalog';
import { geminiService } from './geminiService';

/**
 * Ngân hàng câu hỏi thích ứng & Đổi câu hỏi động bằng AI cho từng Trạm học tập
 * Hỗ trợ nhiều bộ câu hỏi (Sets) với độ khó tăng dần và giải thích Socratic chi tiết.
 */

// Bộ câu hỏi dự phòng Toán học THPT
const MATH_QUESTION_SETS: Array<{ practice: PracticeQuestionWithHints[]; mastery: PracticeQuestionWithHints[] }> = [
  // Set 1
  {
    practice: [
      {
        id: 'math_s1_q1',
        question: 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có đạo hàm $f\'(x) = (x - 1)(x + 2)^2(x - 3)^3$. Hàm số đã cho có bao nhiêu điểm cực trị?',
        options: ['1 điểm', '2 điểm', '3 điểm', '4 điểm'],
        correctAnswer: 1,
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
        correctAnswer: 1,
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
        options: ['0', '12', '6', '-12'],
        correctAnswer: 1,
        hints: [
          'Áp dụng tính chất tuyến tính của tích phân: $\\int [af(x) + bg(x)]dx = a\\int f(x)dx + b\\int g(x)dx$.'
        ],
        explanation: 'Ta có $I = 2\\int_0^1 f(x)dx - 3\\int_0^1 g(x)dx = 2(3) - 3(-2) = 6 + 6 = 12$.',
        trapAnalysis: 'Bẫy dấu âm: $-3 \\times (-2) = +6$, nhiều học sinh nhầm thành $6 - 6 = 0$.'
      },
      {
        id: 'math_s1_q4',
        question: 'Trong không gian $Oxyz$, mặt phẳng $(P): 2x - y + 3z - 5 = 0$ có một vectơ pháp tuyến là:',
        options: ['$\\vec{n}_1 = (2; -1; 3)$', '$\\vec{n}_2 = (2; 1; 3)$', '$\\vec{n}_3 = (2; -1; -5)$', '$\\vec{n}_4 = (-2; -1; 3)$'],
        correctAnswer: 0,
        hints: ['Vectơ pháp tuyến của mặt phẳng $Ax + By + Cz + D = 0$ là $\\vec{n} = (A; B; C)$.'],
        explanation: 'Hệ số trước $x, y, z$ lần lượt là $2, -1, 3$. Do đó một vectơ pháp tuyến là $\\vec{n} = (2; -1; 3)$.',
        trapAnalysis: 'Nhầm lẫn đưa hệ số tự do $D = -5$ vào tọa độ vectơ pháp tuyến.'
      }
    ],
    mastery: [
      {
        id: 'math_s1_m1',
        question: 'Cho hàm số bậc ba $y = ax^3 + bx^2 + cx + d$ có đồ thị uốn lượn với nhánh cuối đi xuống ($x \\to +\\infty, y \\to -\\infty$). Khẳng định nào sau đây chắc chắn ĐÚNG?',
        options: ['$a < 0$', '$a > 0$', '$c > 0$', '$d < 0$'],
        correctAnswer: 0,
        hints: ['Dấu của hệ số $a$ luôn cùng dấu với giới hạn của hàm số khi $x \\to +\\infty$.'],
        explanation: 'Khi $x \\to +\\infty$, giới hạn của hàm đa thức phụ thuộc vào số hạng bậc cao nhất $ax^3$. Đồ thị đi xuống tức $\\lim_{x \\to +\\infty} y = -\\infty \\Rightarrow a < 0$.',
        trapAnalysis: 'Nhầm dấu hệ số bậc cao nhất với điểm cắt trục tung $d$.'
      },
      {
        id: 'math_s1_m2',
        question: 'Phương trình $2^{x^2 - 3x} = 16$ có tổng các nghiệm bằng bao nhiêu?',
        options: ['3', '-3', '4', '-4'],
        correctAnswer: 0,
        hints: ['Đưa về cùng cơ số: $16 = 2^4$.', 'Sử dụng định lý Vi-et cho phương trình bậc hai: $x_1 + x_2 = -b/a$.'],
        explanation: 'Ta có $2^{x^2 - 3x} = 2^4 \\Leftrightarrow x^2 - 3x = 4 \\Leftrightarrow x^2 - 3x - 4 = 0$. Theo định lý Vi-et, tổng các nghiệm là $x_1 + x_2 = -(-3)/1 = 3$.',
        trapAnalysis: 'Quên chuyển vế đổi dấu $4$ thành $-4$, hoặc nhầm tích các nghiệm với tổng các nghiệm.'
      },
      {
        id: 'math_s1_m3',
        question: 'Số phức $z = 3 - 4i$ có môđun $|z|$ bằng bao nhiêu?',
        options: ['5', '7', '1', '25'],
        correctAnswer: 0,
        hints: ['Môđun của số phức $z = a + bi$ là $|z| = \\sqrt{a^2 + b^2}$.'],
        explanation: '$|z| = \\sqrt{3^2 + (-4)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$.',
        trapAnalysis: 'Quên căn bậc hai dẫn đến kết quả 25, hoặc lấy $3 - 4 = -1$.'
      }
    ]
  },
  // Set 2 (Thử thách biến thể mới)
  {
    practice: [
      {
        id: 'math_s2_q1',
        question: 'Tìm tất cả các giá trị thực của tham số $m$ để hàm số $y = \\frac{x - 2}{x - m}$ đồng biến trên từng khoảng xác định.',
        options: ['$m > 2$', '$m < 2$', '$m \\ge 2$', '$m \\neq 2$'],
        correctAnswer: 0,
        hints: [
          'Tính đạo hàm: $y\' = \\frac{-m - (-2)}{(x - m)^2} = \\frac{-m + 2}{(x - m)^2}$.',
          'Hàm số đồng biến khi đạo hàm $y\' > 0$ (với hàm phân thức bậc nhất/bậc nhất dấu không có dấu bằng).'
        ],
        explanation: 'Ta có $y\' = \\frac{-m + 2}{(x - m)^2}$. Để hàm số đồng biến trên từng khoảng xác định thì $y\' > 0 \\Leftrightarrow -m + 2 > 0 \\Leftrightarrow m < 2$.',
        trapAnalysis: 'Nhầm dấu trong công thức tính nhanh đạo hàm $ad - bc$ dẫn đến chọn nhầm $m > 2$.'
      },
      {
        id: 'math_s2_q2',
        question: 'Biết $\\log_2 3 = a$. Biểu diễn $\\log_{12} 18$ theo $a$ ta được kết quả là:',
        options: ['$\\frac{1 + 2a}{2 + a}$', '$\\frac{2 + a}{1 + 2a}$', '$\\frac{1 + a}{2a}$', '$\\frac{2a - 1}{a + 2}$'],
        correctAnswer: 0,
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
        options: ['$\\int_1^2 2(t^2 - 1)dt$', '$\\int_1^2 (t^2 - 1)dt$', '$\\int_0^3 2(t^2 - 1)dt$', '$\\int_1^2 2t^2 dt$'],
        correctAnswer: 0,
        hints: [
          'Đổi biến: $t^2 = x + 1 \\Rightarrow x = t^2 - 1 \\Rightarrow dx = 2t dt$.',
          'Đổi cận: $x = 0 \\Rightarrow t = 1$; $x = 3 \\Rightarrow t = 2$.'
        ],
        explanation: 'Đổi cận: $x = 0 \\to t = 1, x = 3 \\to t = 2$. Khi đó tích phân trở thành $\\int_1^2 \\frac{t^2 - 1}{t} (2t dt) = \\int_1^2 2(t^2 - 1)dt$.',
        trapAnalysis: 'Quên nhân vi phân $dx = 2t dt$ hoặc quên đổi cận theo biến mới $t$.'
      },
      {
        id: 'math_s2_q4',
        question: 'Hình chóp $S.ABC$ có đáy $ABC$ là tam giác vuông tại $B$, $SA \\perp (ABC)$. Góc giữa đường thẳng $SC$ và mặt phẳng $(ABC)$ là góc nào?',
        options: ['$\\widehat{SCA}$', '$\\widehat{SCB}$', '$\\widehat{CSA}$', '$\\widehat{SBA}$'],
        correctAnswer: 0,
        hints: [
          'Hình chiếu vuông góc của $S$ lên $(ABC)$ là $A$.',
          'Hình chiếu của đoạn thẳng $SC$ lên $(ABC)$ là đoạn thẳng $AC$.'
        ],
        explanation: 'Vì $SA \\perp (ABC)$ nên hình chiếu của $SC$ lên mặt phẳng đáy $(ABC)$ chính là $AC$. Vậy góc giữa $SC$ và $(ABC)$ là $\\widehat{SCA}$.',
        trapAnalysis: 'Nhầm hình chiếu lên cạnh $BC$ nên chọn góc $\\widehat{SCB}$.'
      }
    ],
    mastery: [
      {
        id: 'math_s2_m1',
        question: 'Cho hàm số $f(x)$ liên tục trên $\\mathbb{R}$ thỏa mãn $f(x) + f(2 - x) = 4$. Tính tích phân $I = \\int_0^2 f(x)dx$.',
        options: ['4', '8', '2', '0'],
        correctAnswer: 0,
        hints: [
          'Sử dụng bổ đề tích phân đối xứng: Đổi biến $t = 2 - x$.',
          'Cộng hai tích phân lại với nhau: $2I = \\int_0^2 [f(x) + f(2 - x)]dx$.'
        ],
        explanation: 'Đổi biến $t = 2 - x \\Rightarrow dx = -dt$. Ta có $I = \\int_0^2 f(2 - t)dt$. Do đó $2I = \\int_0^2 [f(x) + f(2 - x)]dx = \\int_0^2 4dx = 8 \\Rightarrow I = 4$.',
        trapAnalysis: 'Tính ra $2I = 8$ nhưng quên chia 2 nên chọn nhầm 8.'
      },
      {
        id: 'math_s2_m2',
        question: 'Một tổ có 6 học sinh nam và 4 học sinh nữ. Chọn ngẫu nhiên 3 học sinh. Xác suất để chọn được ít nhất 1 học sinh nữ là:',
        options: ['$\\frac{5}{6}$', '$\\frac{1}{6}$', '$\\frac{2}{3}$', '$\\frac{4}{5}$'],
        correctAnswer: 0,
        hints: [
          'Dùng biến cố đối: "Không chọn được học sinh nữ nào" (tức là chọn cả 3 nam).',
          '$P(A) = 1 - P(\\bar{A}) = 1 - \\frac{C_6^3}{C_{10}^3}$.'
        ],
        explanation: 'Số phần tử không gian mẫu: $n(\\Omega) = C_{10}^3 = 120$. Số cách chọn 3 nam: $C_6^3 = 20$. Xác suất chọn 3 nam: $20/120 = 1/6$. Vậy xác suất có ít nhất 1 nữ: $1 - 1/6 = 5/6$.',
        trapAnalysis: 'Tính trực tiếp từng trường hợp rồi cộng sót hoặc nhầm biến cố đối $1/6$.'
      }
    ]
  }
];

// Bộ câu hỏi dự phòng IELTS 4 Kỹ Năng
const IELTS_QUESTION_SETS: Array<{ practice: PracticeQuestionWithHints[]; mastery: PracticeQuestionWithHints[] }> = [
  // Set 1
  {
    practice: [
      {
        id: 'ielts_s1_q1',
        question: 'Which cohesive device best fits this gap: "Renewable energy has become much cheaper over the last decade. ______, many nations still rely predominantly on fossil fuels."',
        options: ['Nevertheless', 'Furthermore', 'Consequently', 'For instance'],
        correctAnswer: 0,
        hints: ['Look for a contrast marker (indicating an unexpected obstacle or paradox).'],
        explanation: '"Nevertheless" expresses strong contrast between the falling cost of green energy and the ongoing reliance on coal and oil.',
        trapAnalysis: 'Selecting "Consequently" is a trap because the second sentence does NOT describe a natural result of the first sentence.'
      },
      {
        id: 'ielts_s1_q2',
        question: 'In IELTS Speaking Part 2, when you need 5 seconds to gather your thoughts without losing fluency points, which natural filler is best?',
        options: [
          '"That\'s an intriguing question. Let me reflect on that for a second..."',
          '"Uhm... ah... I don\'t know..."',
          'Remaining completely silent',
          '"Can you translate this word into Vietnamese for me?"'
        ],
        correctAnswer: 0,
        hints: ['Examiners look for natural conversational discourse markers rather than awkward dead silence.'],
        explanation: 'Using authentic conversational phrases ("That\'s an intriguing question...", "Off the top of my head...") maintains your fluency score.',
        trapAnalysis: 'Dead silence over 3 seconds severely penalizes your Fluency and Coherence criterion.'
      },
      {
        id: 'ielts_s1_q3',
        question: 'In IELTS Reading True/False/Not Given: The text states "Dr. Smith conducted experiments primarily on nocturnal mammals." The statement says "Dr. Smith only tested mammals that are active at night." What is the answer?',
        options: ['FALSE', 'TRUE', 'NOT GIVEN', 'INSUFFICIENT'],
        correctAnswer: 0,
        hints: ['Compare "primarily" (chiefly/mostly) with "only" (exclusively). They directly contradict!'],
        explanation: '"Primarily" means most of the time, not strictly 100%. "Only" implies zero exceptions. Therefore the statement contradicts the passage -> FALSE.',
        trapAnalysis: 'Many candidates choose TRUE because both mention nocturnal mammals, overlooking the absolute qualifier "only".'
      },
      {
        id: 'ielts_s1_q4',
        question: 'Which of the following is a C1/C2 band academic collocation for discussing solutions to climate change?',
        options: ['mitigate the environmental ramifications', 'do something to stop bad weather', 'make nature become better', 'fix the planet issue'],
        correctAnswer: 0,
        hints: ['Look for a formal verb + noun collocation used in academic journals.'],
        explanation: '"Mitigate the ramifications" demonstrates advanced Lexical Resource (Band 8.0+).',
        trapAnalysis: 'Colloquial phrases like "do something" or "fix the planet" are Band 5.0 - 6.0 vocabulary.'
      }
    ],
    mastery: [
      {
        id: 'ielts_s1_m1',
        question: 'In IELTS Writing Task 2, what is the optimal length of an essay that balances depth with proofreading time?',
        options: ['260 – 290 words', 'Over 450 words', 'Under 230 words', 'Exactly 250 words'],
        correctAnswer: 0,
        hints: ['Writing too long wastes time and increases grammatical errors; writing under 250 words incurs a penalty.'],
        explanation: '260-290 words provides sufficient depth for Task Response while leaving 3-5 minutes for proofreading grammar and spelling.',
        trapAnalysis: 'Writing 400+ words often results in rushed conclusions and numerous avoidable slip-ups.'
      },
      {
        id: 'ielts_s1_m2',
        question: 'In Listening Part 3: Speaker A says: "We should choose the digital format." Speaker B replies: "I was keen on that initially, but the printing cost has dropped dramatically, so let\'s stick to paper." Which format was finalized?',
        options: ['Paper format', 'Digital format', 'Both formats', 'Neither'],
        correctAnswer: 0,
        hints: ['Listen to the resolution after the pivot word "but".'],
        explanation: 'Speaker B changed their mind ("let\'s stick to paper"), which Speaker A agreed with. Thus paper is the final decision.',
        trapAnalysis: 'Falling for the distractor "digital format" mentioned first.'
      }
    ]
  },
  // Set 2
  {
    practice: [
      {
        id: 'ielts_s2_q1',
        question: 'Paraphrase this prompt sentence for an academic introduction: "More people are choosing to live in mega cities than ever before."',
        options: [
          '"There has been an unprecedented surge in urbanization worldwide."',
          '"Lots of persons like big cities today."',
          '"Mega cities have lots of inhabitants."',
          '"People decide to move to big town continually."'
        ],
        correctAnswer: 0,
        hints: ['Transform verbs and nouns into formal academic equivalents (urbanization, unprecedented surge).'],
        explanation: '"Unprecedented surge in urbanization" paraphrases the idea eloquently without copying source vocabulary.',
        trapAnalysis: 'Copying original words word-for-word limits your Lexical Resource to Band 6.0.'
      },
      {
        id: 'ielts_s2_q2',
        question: 'In IELTS Speaking Part 3, how should you structure your response to an analytical question?',
        options: [
          'Direct Answer -> Underlying Cause -> Real-world Example -> Counter-perspective or Future Projection',
          'A simple "Yes, I agree" with 1 sentence',
          'Talk for 5 minutes without letting the examiner speak',
          'Memorize a generic template from the internet'
        ],
        correctAnswer: 0,
        hints: ['Part 3 tests abstract discussion and analytical discourse.'],
        explanation: 'Using the A-E-E-C framework (Answer, Explain, Example, Consequence) guarantees Band 7.5+ coherence.',
        trapAnalysis: 'Giving short personal anecdotes in Part 3 instead of broad societal viewpoints.'
      },
      {
        id: 'ielts_s2_q3',
        question: 'In Listening, if you hear: "The lecture will be held on the 14th of August, not the 4th as previously announced", what is the correct date?',
        options: ['14th August (14 August)', '4th August', '40th August', '24th August'],
        correctAnswer: 0,
        hints: ['Distinguish between the teen (-teen) and ten (-ty) sound, and notice the negation "not the 4th".'],
        explanation: 'The speaker explicitly rejected the 4th and confirmed the 14th.',
        trapAnalysis: 'Writing down 4th because it was remembered from earlier in the sentence.'
      }
    ],
    mastery: [
      {
        id: 'ielts_s2_m1',
        question: 'Which sentence demonstrates the best use of conditional grammar for IELTS Writing Task 2?',
        options: [
          '"Were governments to enforce stricter regulations, industrial emissions would witness a substantial decline."',
          '"If government make rule, emission will go down."',
          '"Government should make rules so emission decreases."',
          '"Had government make rules, emission is down."'
        ],
        correctAnswer: 0,
        hints: ['Inverted conditional (Inversion with "Were") is a top-tier C2 grammatical structure.'],
        explanation: 'Inverted conditional "Were governments to enforce..." demonstrates sophisticated grammatical range (Band 8.0+).',
        trapAnalysis: 'Using simple First Conditionals without lexical variety keeps Grammar at Band 6.0.'
      }
    ]
  }
];

// Bộ câu hỏi dự phòng ĐGNL & TSA Bách Khoa
const DGNL_QUESTION_SETS: Array<{ practice: PracticeQuestionWithHints[]; mastery: PracticeQuestionWithHints[] }> = [
  {
    practice: [
      {
        id: 'dgnl_s1_q1',
        question: 'Trong một giải bóng đá có 8 đội tham gia thi đấu vòng tròn 1 lượt (mỗi đội gặp nhau đúng 1 lần). Tổng số trận đấu trong giải là bao nhiêu?',
        options: ['28 trận', '56 trận', '16 trận', '32 trận'],
        correctAnswer: 0,
        hints: ['Mỗi trận đấu là một tập hợp gồm 2 đội chọn từ 8 đội: $C_8^2$.'],
        explanation: 'Số trận đấu là tổ hợp chập 2 của 8 đội: $C_8^2 = \\frac{8 \\times 7}{2} = 28$ trận.',
        trapAnalysis: 'Nhầm lẫn giữa chỉnh hợp $A_8^2 = 56$ (tính cả lượt đi lượt về) và tổ hợp $C_8^2 = 28$ (chỉ 1 lượt).'
      },
      {
        id: 'dgnl_s1_q2',
        question: 'Cho mệnh đề: "Nếu trời mưa thì đường trơn". Mệnh đề đảo nào sau đây phản ánh đúng tính chất logic tương đương phản đảo?',
        options: [
          '"Nếu đường không trơn thì trời không mưa"',
          '"Nếu đường trơn thì trời mưa"',
          '"Nếu trời không mưa thì đường không trơn"',
          '"Trời mưa nhưng đường không trơn"'
        ],
        correctAnswer: 0,
        hints: ['Quy tắc phản đảo: $P \\Rightarrow Q$ tương đương với $\\neg Q \\Rightarrow \\neg P$.'],
        explanation: 'Mệnh đề phản đảo của $P \\Rightarrow Q$ là $\\neg Q \\Rightarrow \\neg P$ ("Nếu đường không trơn thì trời không mưa").',
        trapAnalysis: 'Nhầm lẫn giữa mệnh đề phản đảo (tương đương logic) và mệnh đề đảo $Q \\Rightarrow P$ (không nhất thiết đúng).'
      },
      {
        id: 'dgnl_s1_q3',
        question: 'Biểu đồ thể hiện doanh thu tăng 20% mỗi năm trong 2 năm liên tiếp. So với năm đầu tiên, sau 2 năm doanh thu tăng tổng cộng bao nhiêu %?',
        options: ['44%', '40%', '24%', '50%'],
        correctAnswer: 0,
        hints: ['Lãi kép / Tăng lũy tiến: $1.2 \\times 1.2 = 1.44$.'],
        explanation: 'Sau năm thứ nhất: $1 + 0.2 = 1.2$. Sau năm thứ hai: $1.2 \\times 1.2 = 1.44$, tương ứng tăng $44\\%$.',
        trapAnalysis: 'Lỗi cộng cơ học: $20\\% + 20\\% = 40\\%$, quên mất phần tăng trên nền doanh thu mới.'
      }
    ],
    mastery: [
      {
        id: 'dgnl_s1_m1',
        question: 'Có 5 người A, B, C, D, E ngồi vào một hàng ghế 5 chỗ. Xác suất để A và B luôn ngồi cạnh nhau là:',
        options: ['$\\frac{2}{5}$', '$\\frac{1}{5}$', '$\\frac{3}{5}$', '$\\frac{1}{2}$'],
        correctAnswer: 0,
        hints: ['Buộc A và B thành một khối $(AB)$. Khi đó có 4 phần tử xếp chỗ: $4! \\times 2!$.'],
        explanation: 'Số phần tử không gian mẫu: $5! = 120$. Xếp A và B cạnh nhau: coi $(AB)$ là 1 người, có $4! = 24$ cách; đổi chỗ A và B có $2! = 2$ cách $\\Rightarrow 48$ cách. Xác suất: $48/120 = 2/5$.',
        trapAnalysis: 'Quên nhân hoán vị 2 người A và B trong khối ($2!$).'
      }
    ]
  }
];

/**
 * Trả về bộ câu hỏi thích ứng (Practice + Mastery) cho trạm học tập
 * Hỗ trợ xoay vòng setIndex: 0, 1, 2...
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

  const isIelts = subjectLower.includes('ielts') || titleLower.includes('ielts') || titleLower.includes('band') || subjectLower.includes('english');
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

  return {
    practiceQuestions: customizedPractice,
    masteryTest: customizedMastery,
    setName: `Bộ Đề Thích Ứng ${setLetter} (AI Generated)`
  };
}

/**
 * Tạo câu hỏi mới trực tiếp qua Google Gemini nếu có kết nối API
 */
export async function generateLiveStationQuestionsWithAi(
  node: LearningNode,
  difficulty: string
): Promise<{
  practiceQuestions: PracticeQuestionWithHints[];
  masteryTest: PracticeQuestionWithHints[];
} | null> {
  if (!geminiService.hasApiKey()) {
    return null;
  }

  try {
    const prompt = `Bạn là Chuyên gia Khảo thí và Thiết kế Câu hỏi Trắc nghiệm của EduAdvisor AI.
Hãy tạo 3 câu hỏi trắc nghiệm thực hành có gợi ý (Practice) và 2 câu hỏi kiểm tra chuẩn đầu ra (Mastery) cho trạm học tập sau:
- Môn học: ${node.subject}
- Tên trạm: ${node.title}
- Trọng tâm kiến thức: ${node.outcomes.keyConcept}
- Độ khó: ${difficulty || node.difficulty}

Yêu cầu định dạng JSON CHÍNH XÁC (không thêm markdown ngoài JSON):
{
  "practice": [
    {
      "id": "ai_p_1",
      "question": "Nội dung câu hỏi rõ ràng, có dữ kiện thực tế...",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswer": 0,
      "hints": ["Gợi ý bước 1", "Gợi ý bước 2"],
      "explanation": "Lời giải thích Socratic chi tiết tại sao đúng...",
      "trapAnalysis": "Phân tích bẫy thi thường gặp ở phương án nhiễu..."
    }
  ],
  "mastery": [
    {
      "id": "ai_m_1",
      "question": "Câu hỏi đánh giá chuẩn đầu ra...",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswer": 0,
      "hints": ["Gợi ý cốt lõi"],
      "explanation": "Lời giải...",
      "trapAnalysis": "Bẫy..."
    }
  ]
}`;

    const res = await geminiService.sendMessage({
      prompt,
      subject: node.subject,
      timeoutMs: 1200
    });

    if (res && res.text) {
      let cleanJson = res.text.trim();
      if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/^```json/, '');
      if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/^```/, '');
      if (cleanJson.endsWith('```')) cleanJson = cleanJson.replace(/```$/, '');
      cleanJson = cleanJson.trim();

      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed.practice) && Array.isArray(parsed.mastery)) {
        return {
          practiceQuestions: parsed.practice,
          masteryTest: parsed.mastery
        };
      }
    }
  } catch (err) {
    console.warn('Live AI question generation error, fallback to curated bank:', err);
  }
  return null;
}
