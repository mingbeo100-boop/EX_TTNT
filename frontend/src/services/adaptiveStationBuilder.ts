import { LearningNode } from './roadmapCatalog';

export interface StationBuilderOptions {
  goal: string;
  targetExamName?: string;
  subjectCombo?: string;
  targetScore: string;
  currentLevel?: string;
  weak1: string;
  weak2: string;
  dailyHours: number;
  numStations: number;
}

export function buildAdaptiveStations(options: StationBuilderOptions): LearningNode[] {
  const {
    goal,
    targetExamName = '',
    subjectCombo = '',
    targetScore,
    weak1,
    weak2,
    dailyHours,
    numStations
  } = options;

  const targetCount = numStations === 5 || numStations === 10 ? numStations : 7;
  const isIelts = goal === 'IELTS' || subjectCombo.toLowerCase().includes('ielts') || targetExamName.toLowerCase().includes('ielts');
  const isSat = goal === 'SAT' || subjectCombo.toLowerCase().includes('sat') || targetExamName.toLowerCase().includes('sat');
  const isToeic = goal === 'TOEIC' || subjectCombo.toLowerCase().includes('toeic') || targetExamName.toLowerCase().includes('toeic');
  const isHsaTsa = goal === 'DGNL_DHQG' || goal === 'TSA_HUST' || targetExamName.toLowerCase().includes('đánh giá');
  const isGpa = goal === 'DAI_HOC_GPA' || targetExamName.toLowerCase().includes('gpa') || targetExamName.toLowerCase().includes('đại học');

  const estMinutes = Math.round((dailyHours || 2.5) * 60);

  let rawStations: LearningNode[] = [];

  // =========================================================================
  // 1. IELTS ACADEMIC (TOÀN BỘ PHƯƠNG PHÁP TIẾNG ANH CHUẨN MỰC)
  // =========================================================================
  if (isIelts) {
    rawStations = [
      {
        id: `ielts_s1_${Date.now()}`,
        stationNumber: 1,
        stageId: 1,
        stageName: 'Giai đoạn 1: Chẩn đoán & Vá Lỗ Hổng Nền Tảng',
        stageFocus: 'Khắc phục ngập ngừng và phản xạ cấu trúc câu tự nhiên',
        title: `Chẩn đoán Lỗ Hổng: ${weak1 || 'Speaking Fluency & Kỹ thuật PEEL'}`,
        subject: 'IELTS Speaking',
        difficulty: 'Nền tảng',
        summary: 'Xây dựng cấu trúc PEEL (Point, Explain, Example, Link) và kỹ thuật câu giờ tự nhiên khi gặp chủ đề lạ.',
        keyFormula: 'P.E.E.L Structure + Discourse Markers (Furthermore, As a consequence)',
        status: 'active',
        xp: 120,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.5 Band',
        outcomes: {
          understand: ['Cơ chế chấm điểm 4 tiêu chí Speaking của giám khảo', 'Cách duy trì độ trôi chảy không bị ậm ừ'],
          canDo: ['Nói mạch lạc liên tục 2 phút trong Part 2', 'Sử dụng ngữ điệu tự nhiên'],
          keyConcept: 'Cấu trúc tư duy mở rộng ý theo trục Thời gian & Không gian',
          prerequisites: 'Từ vựng B1 - B2',
          scoreImpact: 'Tăng 0.5 - 1.0 band Speaking',
          whyThisStation: 'Vá dứt điểm tâm lý sợ nói và ngập ngừng khi vào phòng thi.'
        },
        theory: {
          overview: 'Fluency không phải là nói nhanh như gió mà là sự liền mạch trong mạch suy nghĩ và sử dụng từ nối tự nhiên.',
          deepExplanation: 'Giám khảo đánh giá khả năng tự sửa lỗi (self-correction) hợp lý và việc sử dụng các cụm collocation tự nhiên thay vì nhồi nhét từ hiếm.',
          keyFormulas: [
            { name: 'Khung P.E.E.L', formula: 'Point -> Explanation -> Concrete Example -> Lasting Link', note: 'Áp dụng cho mọi câu hỏi Part 2 & 3' }
          ],
          commonTraps: [
            { trap: 'Dịch từng từ từ tiếng Việt sang tiếng Anh trong đầu', howToAvoid: 'Tập tư duy theo cụm Chunking và Collocation sẵn có' }
          ],
          summaryTakeaways: ['Mở đầu dứt khoát', 'Khai thác ví dụ cá nhân', 'Kiểm soát nhịp thở và ngữ điệu']
        },
        workedExamples: [
          {
            title: 'Describe an unforgettable journey you have taken',
            problem: 'Thí sinh hay bị cạn ý sau 1 phút nói.',
            level: 'Vận dụng',
            patternRecognition: 'Áp dụng công thức 5W1H (Who, When, Where, What, Why, How).',
            steps: [
              { stepNum: 1, action: 'Hook mở bài', explanation: 'Nêu ngay tên chuyến đi và cảm xúc bao quát.' },
              { stepNum: 2, action: 'Diễn biến cao trào', explanation: 'Kể lại một sự cố bất ngờ và cách bạn vượt qua.' },
              { stepNum: 3, action: 'Bài học rút ra', explanation: 'Tổng kết giá trị và liên hệ với hiện tại.' }
            ],
            finalAnswer: 'Hoàn thành bài nói 2 phút trọn vẹn đạt Band 7.5+.',
            verificationTrick: 'Ghi âm và đếm số lần nói "uhm/ah" để giảm dần theo ngày.'
          }
        ],
        practiceQuestions: [
          {
            id: 'ielts_p_1',
            question: 'Khi gặp một từ vựng bất chợt quên trong Speaking Part 2, chiến thuật xử lý tối ưu là gì?',
            options: [
              'Dừng lại suy nghĩ cho đến khi nhớ ra từ đó',
              'Dùng kỹ thuật Paraphrase (giải thích vòng quanh bằng từ đơn giản hơn)',
              'Hỏi lại giám khảo từ đó tiếng Anh là gì',
              'Bỏ qua câu hỏi và chuyển sang ý khác ngay lập tức'
            ],
            correctAnswer: 1,
            hints: ['Giám khảo đánh giá cao khả năng linh hoạt ngôn ngữ', 'Không được tạo khoảng im lặng chết trên 3 giây'],
            explanation: 'Kỹ thuật Paraphrase chứng minh năng lực ngôn ngữ linh hoạt của thí sinh đạt Band 7+.',
            trapAnalysis: 'Im lặng quá 3 giây sẽ bị trừ điểm nặng ở tiêu chí Fluency.'
          }
        ],
        masteryTest: [
          {
            id: 'ielts_m_1',
            question: 'Từ nối nào sau đây phù hợp nhất để thể hiện sự tương phản trang trọng trong Writing & Speaking?',
            options: ['But', 'On the contrary / Conversely', 'Also', 'So'],
            correctAnswer: 1,
            hints: ['Tìm từ nối học thuật cấp C1'],
            explanation: 'Conversely / On the contrary thể hiện tư duy học thuật sắc sảo.',
            trapAnalysis: 'Tránh dùng "But" ở đầu câu trong văn phong học thuật.'
          }
        ]
      },
      {
        id: `ielts_s2_${Date.now()}`,
        stationNumber: 2,
        stageId: 1,
        stageName: 'Giai đoạn 1: Củng cố Nền tảng Cốt lõi',
        stageFocus: 'Làm chủ kỹ thuật Skimming & Scanning trong Reading',
        title: `Kỹ Thuật Đột Phá: ${weak2 || 'Reading Skimming, Scanning & Bẫy True/False/Not Given'}`,
        subject: 'IELTS Reading',
        difficulty: 'Nền tảng',
        summary: 'Nhận diện bẫy thông tin 100% Not Given vs False và kỹ thuật định vị từ khóa paraphrased.',
        keyFormula: 'Keywords -> Synonym Matching -> Verification Against Passage',
        status: 'locked',
        xp: 140,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.5 Band',
        outcomes: {
          understand: ['Sự khác biệt ranh giới giữa False (mâu thuẫn) và Not Given (không đề cập)'],
          canDo: ['Hoàn thành Passage 1 trong dưới 15 phút với độ chính xác 13/13'],
          keyConcept: 'Nguyên tắc bảo toàn nghĩa của Synonym trong bài đọc',
          prerequisites: 'Ngữ pháp câu phức',
          scoreImpact: 'Tăng 0.5 Band Reading',
          whyThisStation: 'Vá dứt điểm dạng câu hỏi mất điểm nhiều nhất của học sinh.'
        },
        theory: {
          overview: 'Dạng bài True/False/Not Given kiểm tra khả năng bám sát văn bản, tuyệt đối không suy đoán ngoài thực tế.',
          deepExplanation: 'Nếu đề bài nói "tất cả" mà bài đọc chỉ nói "một số", đáp án là False. Nếu bài đọc không nói đến tính chất đó, đáp án là Not Given.',
          keyFormulas: [
            { name: 'Quy tắc 3 bước T/F/NG', formula: 'Gạch chân Keyword -> Quét đoạn văn -> So khớp logic 1:1', note: 'Không suy diễn ngoài văn bản' }
          ],
          commonTraps: [
            { trap: 'Dùng kiến thức xã hội bên ngoài để chọn True', howToAvoid: 'Chỉ tin vào thông tin hiển hiện trên từng con chữ của bài đọc' }
          ],
          summaryTakeaways: ['False là nói ngược lại', 'Not Given là không đủ bằng chứng kết luận', 'Tìm từ đồng nghĩa thay vì từ y hệt']
        },
        workedExamples: [
          {
            title: 'Phân biệt False và Not Given trong đoạn văn khoa học',
            problem: 'Đề bài: "The temperature has tripled". Bài đọc: "The temperature rose slightly".',
            level: 'Nền tảng',
            patternRecognition: 'So sánh mức độ tăng (tripled vs rose slightly).',
            steps: [
              { stepNum: 1, action: 'Xác định mâu thuẫn', explanation: 'Tăng gấp ba mâu thuẫn trực tiếp với tăng nhẹ.' },
              { stepNum: 2, action: 'Kết luận', explanation: 'Thông tin có được đề cập nhưng trái ngược -> FALSE.' }
            ],
            finalAnswer: 'Đáp án FALSE chuẩn xác 100%.',
            verificationTrick: 'Đọc lại cả câu chứa từ khóa để tránh bỏ sót từ phủ định ngầm (barely, seldom).'
          }
        ],
        practiceQuestions: [
          {
            id: 'ielts_p_2',
            question: 'Khi bài đọc không hề nhắc tới quan điểm của tác giả về vấn đề X, đáp án là gì?',
            options: ['TRUE', 'FALSE', 'NOT GIVEN', 'INSUFFICIENT'],
            correctAnswer: 2,
            hints: ['Không có thông tin xác nhận hoặc phủ định'],
            explanation: 'Khi văn bản không đề cập đủ bằng chứng, đáp án chính xác là NOT GIVEN.',
            trapAnalysis: 'Rất nhiều học sinh chọn FALSE vì nghĩ rằng không thấy tức là sai.'
          }
        ],
        masteryTest: [
          {
            id: 'ielts_m_2',
            question: 'Từ "drastically" trong bài đọc thường được paraphrase bằng từ nào trong câu hỏi?',
            options: ['Significantly / Dramatically', 'Slightly', 'Regularly', 'Barely'],
            correctAnswer: 0,
            hints: ['Mang nghĩa đột biến, đáng kể'],
            explanation: 'Drastically đồng nghĩa với Significantly / Dramatically.',
            trapAnalysis: 'Nhầm với slightly (nhẹ nhàng).'
          }
        ]
      },
      {
        id: `ielts_s3_${Date.now()}`,
        stationNumber: 3,
        stageId: 2,
        stageName: 'Giai đoạn 2: Nâng Cao Chuyên Đề & Nhận Diện Dạng Bài',
        stageFocus: 'Lập luận Task Response & Coherence trong Writing Task 2',
        title: 'Bứt Phá Writing Task 2: Cấu Trúc Lập Luận Sắc Bén & Luận Điểm Band 7.5+',
        subject: 'IELTS Writing',
        difficulty: 'Vận dụng',
        summary: 'Khai triển đoạn văn thân bài chặt chẽ với phương pháp Cause - Effect - Example.',
        keyFormula: 'Topic Sentence -> Explanation -> Concrete Evidence -> Counter-argument',
        status: 'locked',
        xp: 160,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.5 Band',
        outcomes: {
          understand: ['Cách triển khai luận điểm sâu sắc mà không bị lạc đề'],
          canDo: ['Viết một bài Essay 280 từ trong đúng 40 phút'],
          keyConcept: 'Tính mạch lạc xuyên suốt (Coherence & Cohesion)',
          prerequisites: 'Cấu trúc câu phức & Từ vựng theo chủ đề',
          scoreImpact: 'Tăng 0.5 - 1.0 Band Writing',
          whyThisStation: 'Writing là kỹ năng kéo điểm trung bình nhiều nhất của thí sinh.'
        },
        theory: {
          overview: 'Một bài viết điểm cao là bài viết mà người đọc không phải đọc lại câu nào lần thứ hai để hiểu ý.',
          deepExplanation: 'Mỗi đoạn thân bài chỉ tập trung vào duy nhất một ý tưởng cốt lõi và phát triển ý tưởng đó đến tận cùng.',
          keyFormulas: [
            { name: 'Khung Thân Bài Chuẩn', formula: 'Câu chủ đề -> Vì sao lại thế -> Dẫn chứng thực tế -> Tác động lâu dài', note: 'Khoảng 90-100 từ mỗi đoạn thân bài' }
          ],
          commonTraps: [
            { trap: 'Liệt kê quá nhiều ý mà không đào sâu giải thích', howToAvoid: 'Chỉ chọn 2 ý đắt giá nhất cho 2 đoạn thân bài' }
          ],
          summaryTakeaways: ['Đào sâu hơn liệt kê', 'Dẫn chứng cụ thể', 'Kiểm tra lỗi chính tả trong 5 phút cuối']
        },
        workedExamples: [
          {
            title: 'Viết đoạn thân bài chủ đề Giáo dục trực tuyến',
            problem: 'Topic: Should online learning replace traditional classrooms?',
            level: 'Vận dụng',
            patternRecognition: 'Dạng bài Discussion / Opinion.',
            steps: [
              { stepNum: 1, action: 'Topic sentence', explanation: 'Nêu lợi thế về tính linh hoạt thời gian.' },
              { stepNum: 2, action: 'Deep explanation', explanation: 'Học sinh có thể xem lại bài giảng nhiều lần theo nhịp độ riêng.' },
              { stepNum: 3, action: 'Example & Result', explanation: 'Đưa ví dụ về sinh viên vùng sâu vùng xa tiếp cận bài giảng quốc tế.' }
            ],
            finalAnswer: 'Đoạn văn 95 từ chuẩn xác từ vựng và ngữ pháp.',
            verificationTrick: 'Đọc lướt câu đầu của mỗi đoạn để xem mạch bài có liền mạch không.'
          }
        ],
        practiceQuestions: [
          {
            id: 'ielts_p_3',
            question: 'Trong tiêu chí Task Response, lỗi nào bị trừ điểm nặng nhất?',
            options: [
              'Trả lời thiếu một vế của câu hỏi đề bài',
              'Sử dụng từ vựng đơn giản',
              'Viết dài hơn 300 từ',
              'Dùng câu chủ động nhiều hơn câu bị động'
            ],
            correctAnswer: 0,
            hints: ['Đọc kỹ đề bài yêu cầu bao nhiêu phần'],
            explanation: 'Bỏ sót một vế câu hỏi sẽ khiến Task Response bị tụt xuống dưới Band 6.0.',
            trapAnalysis: 'Rất nhiều học sinh mải viết vế 1 mà quên mất vế 2 của đề bài "Discuss both views".'
          }
        ],
        masteryTest: [
          {
            id: 'ielts_m_3',
            question: 'Đoạn kết luận (Conclusion) trong IELTS Writing Task 2 có được đưa thêm ý tưởng mới không?',
            options: ['Tuyệt đối không, chỉ tóm tắt lại các ý đã nêu', 'Nên đưa để tạo bất ngờ', 'Tùy thích', 'Được đưa nếu ý đó hay'],
            correctAnswer: 0,
            hints: ['Kết luận là tổng kết, không phải mở đề mới'],
            explanation: 'Đưa ý mới vào kết luận vi phạm cấu trúc văn bản học thuật và bị trừ điểm Coherence.',
            trapAnalysis: 'Lỗi đưa ý mới vào kết luận rất phổ biến ở học sinh Band 5.5 - 6.0.'
          }
        ]
      },
      {
        id: `ielts_s4_${Date.now()}`,
        stationNumber: 4,
        stageId: 3,
        stageName: 'Giai đoạn 3: Bắt Bẫy Đề Thi & Rèn Phản Xạ Nhanh',
        stageFocus: 'Xử lý bẫy Distractor & Paraphrase trong Listening Part 3 & 4',
        title: 'Bắt Bẫy Đề Thi Listening: Vượt Bẫy Đổi Ý & Ghi Điểm Tuyệt Đối Part 3 - 4',
        subject: 'IELTS Listening',
        difficulty: 'Vận dụng',
        summary: 'Luyện tai nghe nhận diện tín hiệu đổi ý ("However", "Actually", "I changed my mind") để không bị phương án nhiễu đánh lừa.',
        keyFormula: 'Distractor Signal Words: But, Actually, However, Instead of, Rather than',
        status: 'locked',
        xp: 170,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.5 Band',
        outcomes: {
          understand: ['Cách người ra đề tạo bẫy tâm lý trong bài nghe'],
          canDo: ['Dự đoán dạng từ và thông tin cần điền trong 30s đọc trước đề'],
          keyConcept: 'Kỹ thuật nghe đón lõng từ khóa (Signposting Language)',
          prerequisites: 'Khả năng bắt âm nối và ngữ điệu',
          scoreImpact: 'Tăng 0.5 Band Listening',
          whyThisStation: 'Part 3 và 4 là nơi phân loại giữa Band 6.5 và 8.0.'
        },
        theory: {
          overview: 'Trong Listening, đáp án đầu tiên bạn nghe thấy trong đoạn hội thoại thường là bẫy nhiễu.',
          deepExplanation: 'Người nói thường đưa ra một lựa chọn, sau đó người thứ hai phản bác hoặc chính người đó đổi ý bằng từ "Actually, I changed my mind".',
          keyFormulas: [
            { name: 'Nguyên lý Bẫy Đổi Ý', formula: 'Option A mentioned -> "Wait, let\'s reconsider" -> Option B chosen', note: 'Luôn lắng nghe đến hết câu' }
          ],
          commonTraps: [
            { trap: 'Khoanh ngay phương án đầu tiên nghe thấy', howToAvoid: 'Chờ hết câu và nghe thái độ đồng thuận của các nhân vật' }
          ],
          summaryTakeaways: ['Đọc trước đề và gạch chân từ khóa', 'Bắt từ nối đổi hướng', 'Kiểm tra số ít / số nhiều']
        },
        workedExamples: [
          {
            title: 'Phân tích bẫy đặt bàn hội thảo Listening Part 3',
            problem: 'Speaker 1: "We could book Room 302." Speaker 2: "Yes, but it is under renovation, so we settled on Room 405."',
            level: 'Vận dụng',
            patternRecognition: 'Xuất hiện liên từ "but" và lý do từ chối "under renovation".',
            steps: [
              { stepNum: 1, action: 'Nhận diện bẫy', explanation: 'Room 302 chỉ là đề xuất ban đầu.' },
              { stepNum: 2, action: 'Bắt đáp án chốt', explanation: '"Settled on Room 405" là quyết định cuối cùng.' }
            ],
            finalAnswer: 'Đáp án đúng là Room 405.',
            verificationTrick: 'Chú ý thì của động từ (settled on là quá khứ đã chốt).'
          }
        ],
        practiceQuestions: [
          {
            id: 'ielts_p_4',
            question: 'Khi nghe thấy cụm từ "I was going to suggest X, but Y seems more feasible", đáp án đúng là gì?',
            options: ['X', 'Y', 'Cả X và Y', 'Không có đáp án nào'],
            correctAnswer: 1,
            hints: ['Cụm "was going to" ám chỉ dự định đã bị hủy bỏ'],
            explanation: 'Người nói đã chọn Y vì khả thi hơn, X chỉ là ý định ban đầu.',
            trapAnalysis: 'Thí sinh vội vàng ghi X vào phiếu trả lời.'
          }
        ],
        masteryTest: [
          {
            id: 'ielts_m_4',
            question: 'Yêu cầu "NO MORE THAN TWO WORDS AND/OR A NUMBER" cho phép viết tối đa bao nhiêu từ?',
            options: ['2 từ và 1 số', '3 từ', 'Chỉ được viết số', 'Tối đa 1 từ'],
            correctAnswer: 0,
            hints: ['Đọc kỹ giới hạn số từ'],
            explanation: 'Cho phép tối đa 2 từ và kèm thêm 1 số nếu có.',
            trapAnalysis: 'Viết 3 từ sẽ bị tính là sai hoàn toàn câu đó.'
          }
        ]
      },
      {
        id: `ielts_s5_${Date.now()}`,
        stationNumber: 5,
        stageId: 4,
        stageName: 'Giai đoạn 4: Đột Phá Vận Dụng Cao & Nâng Cấp Ngôn Ngữ',
        stageFocus: 'Nâng cấp Lexical Resource & Cụm từ Collocations đắt giá',
        title: 'Đột Phá Band 8.0+: Nghệ Thuật Dùng Collocation & Paraphrasing Cấp C1/C2',
        subject: 'IELTS Vocabulary & Speaking',
        difficulty: 'Vận dụng cao 9+',
        summary: 'Chuyển hóa từ vựng thông thường sang các cụm Collocations tự nhiên và ngữ cảnh học thuật chuẩn xác.',
        keyFormula: 'Natural Collocations > Obscure Rare Words',
        status: 'locked',
        xp: 190,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.5 Band',
        outcomes: {
          understand: ['Cách đạt điểm 8.0+ ở tiêu chí Lexical Resource mà không bị gượng ép'],
          canDo: ['Thay thế 100% các từ cơ bản (good, bad, important) bằng cụm thành ngữ học thuật'],
          keyConcept: 'Collocation tự nhiên theo ngữ cảnh bản ngữ',
          prerequisites: 'Band 6.5 vững vàng',
          scoreImpact: 'Chạm mốc Band 8.0+',
          whyThisStation: 'Khắc phục tình trạng kẹt điểm ở Band 6.5 suốt thời gian dài.'
        },
        theory: {
          overview: 'Band 8.0 không phải là dùng từ cổ hay từ ít gặp trong từ điển, mà là khả năng dùng từ tự nhiên như người bản xứ có học thức.',
          deepExplanation: 'Dùng "pose a serious threat to" thay vì "is dangerous to", dùng "exert a profound influence on" thay vì "affect deeply".',
          keyFormulas: [
            { name: 'Cụm Collocation Vàng', formula: 'Verb + Noun Collocation (e.g., bridge the gap, mitigate the risk)', note: 'Được tính điểm C1/C2' }
          ],
          commonTraps: [
            { trap: 'Nhét từ đao to búa lớn sai ngữ cảnh (misuse of big words)', howToAvoid: 'Chỉ dùng từ khi bạn biết chính xác giới từ đi kèm với nó' }
          ],
          summaryTakeaways: ['Độ chính xác cao hơn độ khó', 'Học theo cụm cả câu', 'Kiểm soát tính trang trọng (Formal tone)']
        },
        workedExamples: [
          {
            title: 'Nâng cấp câu văn từ Band 6.0 lên Band 8.0',
            problem: 'Câu gốc: "Pollution causes a lot of bad problems for health."',
            level: 'Vận dụng cao 9+',
            patternRecognition: 'Thay thế các từ yếu (causes, a lot of, bad problems).',
            steps: [
              { stepNum: 1, action: 'Thay causes', explanation: 'Dùng "wreaks havoc on" hoặc "poses grave hazards to".' },
              { stepNum: 2, action: 'Thay bad problems', explanation: 'Dùng "detrimental ramifications".' },
              { stepNum: 3, action: 'Hoàn thiện', explanation: '"Environmental pollution poses grave hazards to public health and wreaks havoc on ecosystems."' }
            ],
            finalAnswer: 'Câu văn Band 8.0 hoàn chỉnh và giàu sức biểu cảm.',
            verificationTrick: 'Kiểm tra tính logic mạch lạc của câu văn.'
          }
        ],
        practiceQuestions: [
          {
            id: 'ielts_p_5',
            question: 'Cụm từ nào sau đây mang tính học thuật cao nhất để diễn đạt "giải quyết vấn đề"?',
            options: ['Fix the problem', 'Address / Tackle the pressing issue', 'Do with the trouble', 'Make problem go away'],
            correctAnswer: 1,
            hints: ['Cụm từ trang trọng thường dùng trong nghị trường và báo chí'],
            explanation: '"Address / Tackle the pressing issue" là collocation học thuật chuẩn C1/C2.',
            trapAnalysis: '"Fix the problem" quá thông tục, chỉ đạt Band 5.5 - 6.0.'
          }
        ],
        masteryTest: [
          {
            id: 'ielts_m_5',
            question: 'Từ "mitigate" thường đi kèm với danh từ nào sau đây?',
            options: ['Risks / Effects', 'Happiness', 'Success', 'Opportunities'],
            correctAnswer: 0,
            hints: ['Mang nghĩa giảm thiểu tác hại tiêu cực'],
            explanation: 'Mitigate the risks / negative effects (giảm thiểu rủi ro / hệ quả tiêu cực).',
            trapAnalysis: 'Mitigate chỉ dùng cho những điều tiêu cực cần giảm bớt.'
          }
        ]
      },
      {
        id: `ielts_s6_${Date.now()}`,
        stationNumber: 6,
        stageId: 4,
        stageName: 'Giai đoạn 4: Chuyên Đề Nâng Cao Writing Task 1',
        stageFocus: 'Kỹ thuật phân tích biểu đồ xu hướng & So sánh số liệu',
        title: 'Writing Task 1 Chuyên Sâu: Kỹ Thuật Phân Tích Biểu Đồ & Ngôn Ngữ Xu Hướng',
        subject: 'IELTS Writing',
        difficulty: 'Vận dụng',
        summary: 'Làm chủ kỹ thuật viết Overview đắt giá và nhóm thông tin thông minh cho biểu đồ đường, cột, tròn và bảng số liệu.',
        keyFormula: 'Introduction (Paraphrase) + Overview (2 Key Trends) + Body 1 & 2 (Key Comparisons)',
        status: 'locked',
        xp: 180,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.5 Band',
        outcomes: {
          understand: ['Cách viết đoạn Overview chuẩn đạt ngay Band 7.0 Task Achievement'],
          canDo: ['Hoàn thành bài Task 1 chuẩn mực 170 từ trong đúng 18 phút'],
          keyConcept: 'Lựa chọn đặc điểm nổi bật thay vì mô tả cơ học từng con số',
          prerequisites: 'Từ vựng miêu tả tăng giảm (soar, plunge, fluctuate)',
          scoreImpact: 'Tăng 0.5 Band Writing',
          whyThisStation: 'Nhiều thí sinh mất điểm vì viết Task 1 quá dài khiến không kịp giờ Task 2.'
        },
        theory: {
          overview: 'Writing Task 1 là báo cáo dữ liệu khoa học, tuyệt đối không đưa ý kiến cá nhân vào bài viết.',
          deepExplanation: 'Đoạn Overview là trái tim của bài Task 1. Thiếu Overview hoặc Overview không rõ ràng sẽ khiến Task Achievement bị giới hạn ở Band 5.0.',
          keyFormulas: [
            { name: 'Công thức Overview', formula: '"Overall, it is evident that [Trend 1], while [Trend 2]."', note: 'Không đưa số liệu chi tiết vào Overview' }
          ],
          commonTraps: [
            { trap: 'Liệt kê từng con số của từng năm', howToAvoid: 'Nhóm các đối tượng có cùng xu hướng tăng hoặc giảm vào chung một đoạn' }
          ],
          summaryTakeaways: ['Overview là bắt buộc', 'Không đưa quan điểm cá nhân', 'Phân bổ tối đa 20 phút']
        },
        workedExamples: [
          {
            title: 'Viết Overview cho biểu đồ xuất nhập khẩu 3 quốc gia',
            problem: 'Biểu đồ có 2 nước tăng liên tục, 1 nước giảm mạnh.',
            level: 'Vận dụng',
            patternRecognition: 'Nhận diện xu hướng tổng quát đối lập.',
            steps: [
              { stepNum: 1, action: 'Quan sát tổng thể', explanation: 'Xác định điểm đầu và điểm cuối của từng đường.' },
              { stepNum: 2, action: 'Khái quát hóa', explanation: 'Nêu nước nào luôn dẫn đầu và xu hướng tăng/giảm nổi bật.' }
            ],
            finalAnswer: '"Overall, exports from country A and B witnessed an upward trajectory, whereas country C experienced a precipitous drop."',
            verificationTrick: 'Đảm bảo không xuất hiện bất kỳ con số cụ thể nào trong câu Overview.'
          }
        ],
        practiceQuestions: [
          {
            id: 'ielts_p_6',
            question: 'Trong IELTS Writing Task 1, câu nhận định nào sau đây là SAI?',
            options: [
              'Cần phải đưa giải thích vì sao số liệu lại tăng hoặc giảm',
              'Cần viết tối thiểu 150 từ',
              'Đoạn Overview không nên chứa số liệu chi tiết',
              'Nên nhóm các đường có cùng xu hướng vào cùng một đoạn thân bài'
            ],
            correctAnswer: 0,
            hints: ['Task 1 là bản báo cáo dữ liệu khách quan, không phải bài luận suy đoán'],
            explanation: 'Tuyệt đối không giải thích nguyên nhân ("because...") trong Task 1 vì đó là suy đoán ngoài đề.',
            trapAnalysis: 'Rất nhiều học sinh tự ý suy đoán nguyên nhân khiến bài viết bị trừ điểm nặng.'
          }
        ],
        masteryTest: [
          {
            id: 'ielts_m_6',
            question: 'Từ nào sau đây mô tả sự sụt giảm nhanh và mạnh nhất?',
            options: ['Plummet / Plunge', 'Decline slightly', 'Dips', 'Stabilize'],
            correctAnswer: 0,
            hints: ['Tương đương rơi tự do'],
            explanation: 'Plummet / Plunge mang nghĩa lao dốc cực mạnh.',
            trapAnalysis: 'Dip chỉ là giảm tạm thời rồi lại tăng.'
          }
        ]
      },
      {
        id: `ielts_s7_${Date.now()}`,
        stationNumber: 7,
        stageId: 5,
        stageName: 'Giai đoạn 5: Tổng Ôn Áp Lực Cao & Chiến Thuật Phòng Thi',
        stageFocus: 'Mô phỏng thi thật 4 kỹ năng & Chiến thuật phân bổ năng lượng',
        title: 'Tổng Ôn Thực Chiến: Mô Phỏng Full Test 4 Kỹ Năng & Chiến Thuật Cán Đích',
        subject: 'IELTS Full Simulation',
        difficulty: 'Vận dụng cao 9+',
        summary: 'Kỹ thuật giữ vững tâm lý phòng thi, xử lý tình huống mất bình tĩnh và phân bổ 60 phút Writing chuẩn xác.',
        keyFormula: 'Task 1: 20 mins | Task 2: 40 mins | Proofread: 5 mins',
        status: 'locked',
        xp: 200,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.5 Band',
        outcomes: {
          understand: ['Cơ chế kiểm soát thời gian thi thật không bị cuống'],
          canDo: ['Thi thử liên tục 3 tiếng đạt điểm số mục tiêu ổn định'],
          keyConcept: 'Chiến thuật phòng thi và phong độ đỉnh cao',
          prerequisites: 'Hoàn thành các trạm kỹ năng 1 - 6',
          scoreImpact: 'Hiện thực hóa mục tiêu điểm số',
          whyThisStation: 'Chuyển hóa năng lực học tập thành kết quả thi thật.'
        },
        theory: {
          overview: 'Đi thi là bài toán quản trị năng lượng và sự tập trung suốt 3 giờ liên tục.',
          deepExplanation: 'Phân bổ 20 phút cho Task 1 (tối thiểu 150 từ) và 40 phút cho Task 2 (tối thiểu 250 từ). Luôn dành 5 phút cuối dò lại thì động từ và lỗi chính tả.',
          keyFormulas: [
            { name: 'Nguyên tắc 3 Vòng Writing', formula: 'Lập dàn ý (5p) -> Viết thân bài (30p) -> Dò lỗi (5p)', note: 'Không bao giờ cắm đầu viết ngay khi chưa có dàn ý' }
          ],
          commonTraps: [
            { trap: 'Dành 35 phút cho Task 1 khiến Task 2 không kịp viết kết luận', howToAvoid: 'Cắt giờ nghiêm ngặt sau đúng 20 phút dù Task 1 chưa hoàn hảo' }
          ],
          summaryTakeaways: ['Ngủ đủ giấc trước ngày thi', 'Đến sớm 45 phút', 'Tự tin vào sự chuẩn bị của bản thân']
        },
        workedExamples: [
          {
            title: 'Chiến thuật phân bổ 40 phút cho Writing Task 2',
            problem: 'Thí sinh hay bị thiếu thời gian viết đoạn Kết luận.',
            level: 'Vận dụng cao 9+',
            patternRecognition: 'Áp dụng đồng hồ đếm ngược nội tâm.',
            steps: [
              { stepNum: 1, action: 'Phút 0 - 5', explanation: 'Phân tích đề, gạch chân từ khóa, lên 2 ý chính.' },
              { stepNum: 2, action: 'Phút 5 - 35', explanation: 'Viết Mở bài (5p), Thân bài 1 (12p), Thân bài 2 (12p), Kết luận (3p).' },
              { stepNum: 3, action: 'Phút 35 - 40', explanation: 'Dò từng dòng để sửa mạo từ (a/an/the) và chia động từ số ít/nhiều.' }
            ],
            finalAnswer: 'Bài thi hoàn chỉnh đạt điểm tối đa cấu trúc.',
            verificationTrick: 'Đếm dòng ước lượng số từ để không mất thời gian đếm từng chữ.'
          }
        ],
        practiceQuestions: [
          {
            id: 'ielts_p_7',
            question: 'Khi chỉ còn 3 phút mà chưa viết xong kết luận của Writing Task 2, hành động khôn ngoan nhất là gì?',
            options: [
              'Viết một câu tóm tắt ngắn gọn khẳng định lại quan điểm chính',
              'Bỏ trống kết luận và tập trung sửa lỗi thân bài',
              'Cố gắng viết một đoạn kết luận dài',
              'Xóa bớt một đoạn thân bài'
            ],
            correctAnswer: 0,
            hints: ['Bài viết thiếu kết luận sẽ bị đánh tụt xuống Band 5.0'],
            explanation: 'Dù chỉ một câu kết luận ngắn cũng giúp bài viết có đầy đủ bố cục và cứu điểm Task Response.',
            trapAnalysis: 'Bỏ kết luận là sai lầm chí mạng khiến mất 1.5 Band.'
          }
        ],
        masteryTest: [
          {
            id: 'ielts_m_7',
            question: 'Điều quan trọng nhất cần kiểm tra trong 5 phút cuối của bài thi Reading & Listening là gì?',
            options: [
              'Chính tả (Spelling) và dạng số ít/số nhiều (Plural/Singular)',
              'Độ đẹp của chữ viết',
              'Đọc lại cả đoạn văn từ đầu',
              'Nộp bài sớm để ra về'
            ],
            correctAnswer: 0,
            hints: ['Sai một chữ cái hoặc thiếu "s" đều bị tính 0 điểm'],
            explanation: 'Lỗi sai chính tả và thiếu "s" là nguyên nhân làm mất 2-3 câu đúng quý giá.',
            trapAnalysis: 'Rất nhiều bạn chủ quan không dò lại chữ s ở cuối danh từ số nhiều.'
          }
        ]
      },
      {
        id: `ielts_s8_${Date.now()}`,
        stationNumber: 8,
        stageId: 5,
        stageName: 'Giai đoạn 5: Mở Rộng Chuyên Sâu Speaking Part 3',
        stageFocus: 'Phản xạ lập luận trừu tượng & Trình bày quan điểm đa chiều',
        title: 'Speaking Part 3 Phản Xạ: Kỹ Thuật Trình Bày Quan Điểm Đa Chiều',
        subject: 'IELTS Speaking',
        difficulty: 'Vận dụng cao 9+',
        summary: 'Mở rộng câu trả lời theo các góc độ xã hội, kinh tế, tâm lý và đạo đức để đạt điểm 8.0 Fluency & Coherence.',
        keyFormula: 'Direct Answer + Social Perspective + Future Prediction',
        status: 'locked',
        xp: 210,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.5 Band',
        outcomes: {
          understand: ['Cách phát triển ý tưởng trừu tượng không bị cụt câu'],
          canDo: ['Trả lời trôi chảy từ 4-6 câu có chiều sâu cho mỗi câu hỏi Part 3'],
          keyConcept: 'Kỹ thuật nhìn nhận vấn đề từ nhiều lăng kính xã hội',
          prerequisites: 'Cấu trúc PEEL ở Trạm 1',
          scoreImpact: 'Nâng điểm Speaking lên ngưỡng 8.0',
          whyThisStation: 'Part 3 là nơi quyết định điểm số phân loại cao nhất trong phần thi Speaking.'
        },
        theory: {
          overview: 'Part 3 không hỏi về cá nhân bạn mà hỏi về các hiện tượng xã hội mang tính khái quát.',
          deepExplanation: 'Tránh trả lời "I think I...", hãy dùng "From a broader societal standpoint, it is widely believed that...".',
          keyFormulas: [
            { name: 'Khung 3 Tầng Part 3', formula: 'Quan điểm chung -> Lý do kinh tế/xã hội -> Dự báo tương lai', note: 'Khoảng 45 - 60 giây mỗi câu trả lời' }
          ],
          commonTraps: [
            { trap: 'Kể chuyện cá nhân bản thân trong Part 3', howToAvoid: 'Dùng chủ ngữ số nhiều (people, society, governments, youths)' }
          ],
          summaryTakeaways: ['Tính khái quát cao', 'Đa chiều góc nhìn', 'Dự báo tương lai']
        },
        workedExamples: [
          {
            title: 'Trả lời câu hỏi "How has technology changed family relationships?"',
            problem: 'Thí sinh hay trả lời ngắn: "Technology makes people talk less."',
            level: 'Vận dụng cao 9+',
            patternRecognition: 'Câu hỏi phân tích tác động hai mặt.',
            steps: [
              { stepNum: 1, action: 'Thừa nhận hai mặt', explanation: 'Nêu công nghệ vừa kết nối vừa tạo khoảng cách vô hình.' },
              { stepNum: 2, action: 'Đào sâu mặt tiêu cực', explanation: 'Hiện tượng phubbing (cắm mặt vào điện thoại trong bữa ăn).' },
              { stepNum: 3, action: 'Mặt tích cực', explanation: 'Giúp người thân xa xứ gọi video hàng ngày.' }
            ],
            finalAnswer: 'Câu trả lời 55 giây mạch lạc, sử dụng từ vựng C1 chuẩn xác.',
            verificationTrick: 'Dùng từ nối chuyển ý "On the flip side, however...".'
          }
        ],
        practiceQuestions: [
          {
            id: 'ielts_p_8',
            question: 'Chủ ngữ nào sau đây KHÔNG NÊN dùng làm chủ ngữ chính trong Speaking Part 3?',
            options: ['My mother and I', 'The vast majority of citizens', 'Policymakers', 'Future generations'],
            correctAnswer: 0,
            hints: ['Part 3 yêu cầu thảo luận mang tính xã hội khái quát'],
            explanation: '"My mother and I" quá cá nhân hóa, chỉ thích hợp cho Part 1.',
            trapAnalysis: 'Mang lối trả lời Part 1 sang Part 3 khiến tiêu chí Coherence bị đánh giá thấp.'
          }
        ],
        masteryTest: [
          {
            id: 'ielts_m_8',
            question: 'Cụm từ nào dùng để câu giờ tự nhiên nhất khi gặp câu hỏi trừu tượng trong Part 3?',
            options: [
              '"That\'s a rather intriguing question, let me ponder over it for a second"',
              '"I don\'t know"',
              '"Can you change the question?"',
              '"Wait, let me think in Vietnamese first"'
            ],
            correctAnswer: 0,
            hints: ['Thể hiện sự trôi chảy tự nhiên như người bản xứ'],
            explanation: 'Cụm từ học thuật trên giúp bạn có 3 giây suy nghĩ mà không bị tính là ngắc ngứ.',
            trapAnalysis: 'Im lặng không nói gì sẽ bị trừ điểm ngập ngừng.'
          }
        ]
      },
      {
        id: `ielts_s9_${Date.now()}`,
        stationNumber: 9,
        stageId: 5,
        stageName: 'Giai đoạn 5: Bẻ Gãy Bẫy Reading Nâng Cao',
        stageFocus: 'Xử lý Matching Headings & Summary Completion có từ điển bẫy',
        title: 'Bẻ Gãy Bẫy Reading Nâng Cao: Matching Headings & Summary Completion',
        subject: 'IELTS Reading',
        difficulty: 'Vận dụng cao 9+',
        summary: 'Phương pháp đọc lướt nắm ý chính đoạn văn (Main Idea vs Supporting Details) để không bị tiêu đề bẫy đánh lừa.',
        keyFormula: 'Read First & Last Sentences -> Identify Core Theme -> Match Heading',
        status: 'locked',
        xp: 220,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.5 Band',
        outcomes: {
          understand: ['Cơ chế tạo tiêu đề bẫy chứa từ khóa y hệt nhưng sai ý chính'],
          canDo: ['Giải quyết dạng bài Matching Headings trong dưới 8 phút với độ chính xác 100%'],
          keyConcept: 'Phân biệt ý chính của cả đoạn với ví dụ minh họa đơn lẻ',
          prerequisites: 'Skimming & Scanning ở Trạm 2',
          scoreImpact: 'Đạt điểm tối đa Passage 2 & 3',
          whyThisStation: 'Matching Headings là dạng bài tốn thời gian và gây hoang mang nhất cho thí sinh.'
        },
        theory: {
          overview: 'Người ra đề thường lấy một chi tiết nhỏ ở giữa đoạn văn làm một tiêu đề bẫy.',
          deepExplanation: 'Một tiêu đề đúng phải bao quát được 100% nội dung của đoạn văn, chứ không chỉ một ví dụ đơn lẻ.',
          keyFormulas: [
            { name: 'Nguyên tắc loại trừ Headings', formula: 'Nếu tiêu đề chỉ nói về 1 câu ví dụ => LOẠI NGAY LẬP TỨC', note: 'Chỉ chọn tiêu đề tóm tắt toàn bộ đoạn' }
          ],
          commonTraps: [
            { trap: 'Thấy từ khóa trong tiêu đề giống y hệt từ trong đoạn văn liền chọn ngay', howToAvoid: 'Đọc kỹ xem từ đó chỉ là ví dụ hay là ý tưởng trung tâm' }
          ],
          summaryTakeaways: ['Đọc đoạn văn trước tiêu đề', 'Gạch chân ý chính', 'Loại tiêu đề quá hẹp hoặc quá rộng']
        },
        workedExamples: [
          {
            title: 'Chọn tiêu đề cho đoạn văn nói về sự tiến hóa của loài voi',
            problem: 'Đoạn văn có nhắc tới kích thước tai voi ở dòng 3.',
            level: 'Vận dụng cao 9+',
            patternRecognition: 'Xuất hiện tiêu đề bẫy "The size of elephant ears".',
            steps: [
              { stepNum: 1, action: 'Phân tích cả đoạn', explanation: 'Đoạn văn nói về cách loài voi thích nghi với biến đổi khí hậu qua hàng triệu năm.' },
              { stepNum: 2, action: 'Loại bẫy', explanation: 'Tai voi chỉ là một ví dụ minh họa cho sự tản nhiệt.' },
              { stepNum: 3, action: 'Chọn tiêu đề', explanation: 'Chọn "Adaptation to climatic shifts over epochs".' }
            ],
            finalAnswer: 'Chọn tiêu đề khái quát toàn diện đúng 100%.',
            verificationTrick: 'Tự đặt câu hỏi: "Nếu cả đoạn này chỉ nói về tai voi thì có đúng không?".'
          }
        ],
        practiceQuestions: [
          {
            id: 'ielts_p_9',
            question: 'Khi làm bài Matching Headings, bước đầu tiên nên làm là gì?',
            options: [
              'Đọc lướt qua đoạn văn để nắm ý chính rồi mới nhìn danh sách Headings',
              'Đọc thuộc lòng danh sách Headings trước',
              'Chọn bừa một Heading ngắn nhất',
              'Chỉ đọc câu cuối cùng của đoạn văn'
            ],
            correctAnswer: 0,
            hints: ['Đọc danh sách Headings trước sẽ dễ bị ám thị tâm lý bởi các tiêu đề bẫy'],
            explanation: 'Nắm được ý chính tự nhiên của đoạn văn giúp bạn không bị các tiêu đề nhiễu dẫn dụ.',
            trapAnalysis: 'Rất nhiều học sinh sa vào đọc Headings trước rồi cố tìm từ khóa trong bài.'
          }
        ],
        masteryTest: [
          {
            id: 'ielts_m_9',
            question: 'Tiêu đề nào sau đây thường là tiêu đề bẫy trong IELTS Reading?',
            options: [
              'Tiêu đề chỉ nhắc tới một ví dụ phụ trong đoạn văn',
              'Tiêu đề tóm tắt ý chính của đoạn văn',
              'Tiêu đề chứa từ đồng nghĩa với câu chủ đề',
              'Tiêu đề phản ánh đúng kết luận của đoạn'
            ],
            correctAnswer: 0,
            hints: ['Bẫy "Too specific" (quá chi tiết, không đại diện cho cả đoạn)'],
            explanation: 'Tiêu đề quá chi tiết là bẫy kinh điển trong bài thi IELTS Reading.',
            trapAnalysis: 'Thí sinh thấy từ quen là khoanh ngay mà không xét phạm vi bao quát.'
          }
        ]
      },
      {
        id: `ielts_s10_${Date.now()}`,
        stationNumber: 10,
        stageId: 5,
        stageName: 'Giai đoạn 5: Chốt Điểm Đỉnh Cao Master',
        stageFocus: 'Trạm Checkpoint Master: Bộ đề thi thử chuẩn quốc tế đạt mục tiêu điểm',
        title: 'IELTS Master Checkpoint: Khẳng Định Đẳng Cấp & Vượt Ngưỡng Mục Tiêu',
        subject: 'IELTS Real Test Simulation',
        difficulty: 'Vận dụng cao 9+',
        summary: 'Kiểm tra toàn diện 4 kỹ năng trong môi trường áp lực cao, mở khóa huy hiệu Cố vấn Vinh danh.',
        keyFormula: 'Target Readiness: 100% | Fluency + Accuracy + Coherence',
        status: 'locked',
        xp: 250,
        estimatedMinutes: estMinutes,
        scoreContribution: '+1.0 Band',
        outcomes: {
          understand: ['Tâm thế vững vàng của một thí sinh Band 8.0+'],
          canDo: ['Đạt hoặc vượt điểm số mục tiêu trong đề thi thử chuẩn hóa'],
          keyConcept: 'Bản lĩnh thi cử và phong độ ổn định',
          prerequisites: 'Hoàn thành 9 trạm trước',
          scoreImpact: 'Chính thức cán đích thành công',
          whyThisStation: 'Trạm cuối cùng chốt hạ toàn bộ hành trình rèn luyện.'
        },
        theory: {
          overview: 'Bạn đã hoàn thiện đầy đủ mọi kỹ năng từ nền tảng, bẫy đề đến vận dụng cao.',
          deepExplanation: 'Giờ là lúc bước vào phòng thi với tâm lý tự tin, thanh thản và phong độ tốt nhất.',
          keyFormulas: [
            { name: 'Công thức Thành Công', formula: 'Kiến thức chuẩn + Tâm lý vững + Phân bổ thời gian kỷ luật', note: 'Chiến thắng thuộc về người có sự chuẩn bị kỹ lưỡng nhất' }
          ],
          commonTraps: [
            { trap: 'Lo lắng quá mức vào đêm trước ngày thi', howToAvoid: 'Nghỉ ngơi hoàn toàn, không nhồi nhét thêm kiến thức sau 20h' }
          ],
          summaryTakeaways: ['Tự tin vào bản thân', 'Kiểm soát nhịp thở', 'Chiến đấu đến giây cuối cùng']
        },
        workedExamples: [
          {
            title: 'Chiến thuật thi đạt phong độ đỉnh cao',
            problem: 'Căng thẳng trước giờ phát đề thi.',
            level: 'Vận dụng cao 9+',
            patternRecognition: 'Áp dụng kỹ thuật thở 4-4-4.',
            steps: [
              { stepNum: 1, action: 'Hít sâu 4 giây', explanation: 'Ổn định nhịp tim và oxy lên não.' },
              { stepNum: 2, action: 'Giữ 4 giây và thở ra 4 giây', explanation: 'Xua tan cảm giác hồi hộp.' }
            ],
            finalAnswer: 'Tâm trí sáng suốt 100% sẵn sàng bứt phá.',
            verificationTrick: 'Mỉm cười nhẹ trước khi bắt đầu bài thi.'
          }
        ],
        practiceQuestions: [
          {
            id: 'ielts_p_10',
            question: 'Yếu tố quan trọng nhất để bứt phá từ Band 6.5 lên 8.0 là gì?',
            options: [
              'Tính tự nhiên trong giao tiếp và sự mạch lạc logic trong văn bản',
              'Học thuộc lòng bài mẫu trên mạng',
              'Cố gắng nói thật nhanh không ngừng nghỉ',
              'Chỉ tập trung vào 1 kỹ năng duy nhất'
            ],
            correctAnswer: 0,
            hints: ['Bản chất ngôn ngữ là phương tiện truyền đạt tư duy'],
            explanation: 'Sự tự nhiên và tính mạch lạc logic là tiêu chí phân định đẳng cấp cao nhất.',
            trapAnalysis: 'Học vẹt bài mẫu là cách nhanh nhất để bị giám khảo phát hiện và hạ điểm.'
          }
        ],
        masteryTest: [
          {
            id: 'ielts_m_10',
            question: 'Sau khi hoàn thành lộ trình thích ứng tại EduAdvisor AI, bạn tự tin nhất vào điều gì?',
            options: [
              'Làm chủ toàn bộ phương pháp, không còn nỗi sợ cạm bẫy và bứt phá mục tiêu điểm',
              'Chỉ nhớ được vài từ vựng',
              'Vẫn sợ phòng thi',
              'Chưa có kế hoạch gì'
            ],
            correctAnswer: 0,
            hints: ['Bạn đã hoàn thành trọn vẹn lộ trình cá nhân hóa'],
            explanation: 'Sự chuẩn bị toàn diện đem lại sự tự tin tuyệt đối!',
            trapAnalysis: 'Không có.'
          }
        ]
      }
    ];
  }

  // =========================================================================
  // 2. NẾU LÀ THPT QUỐC GIA (TOÁN - LÝ - HÓA - SINH - ANH HOẶC KHOA HỌC)
  // =========================================================================
  else {
    // 10 Trạm THPT Quốc Gia chuẩn mực
    rawStations = [
      {
        id: `thpt_s1_${Date.now()}`,
        stationNumber: 1,
        stageId: 1,
        stageName: 'Giai đoạn 1: Chẩn đoán & Vá Lỗ Hổng Nền Tảng',
        stageFocus: `Vá dứt điểm lỗ hổng trọng tâm 1: ${weak1 || 'Hàm số & Cực trị hàm chứa dấu GTTĐ'}`,
        title: `Vá Lỗ Hổng Cấp Tốc: ${weak1 || 'Khảo sát hàm số & Cực trị hàm chứa dấu GTTĐ'}`,
        subject: subjectCombo.includes('Lý') && (weak1 || '').includes('Lý') ? 'Vật lý 12' : subjectCombo.includes('Hóa') && (weak1 || '').includes('Hóa') ? 'Hóa học 12' : 'Toán học 12',
        difficulty: 'Nền tảng',
        summary: `Chữa dứt điểm các lỗi sai kinh điển ở chuyên đề ${weak1 || 'Hàm số'}, làm chủ kỹ thuật nhận diện bản chất trong 15 giây.`,
        keyFormula: `Định lý then chốt cho ${weak1 || 'Hàm số'} + Kỹ thuật Casio kiểm tra nghiệm nhanh`,
        status: 'active',
        xp: 120,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.4 Điểm',
        outcomes: {
          understand: [`Bản chất cốt lõi của chuyên đề ${weak1 || 'Hàm số'}`, 'Các điều kiện ràng buộc và tập xác định'],
          canDo: ['Giải quyết chính xác 100% câu hỏi ở mức 7.0 điểm', 'Kiểm tra lại kết quả trong 10 giây bằng máy tính Casio'],
          keyConcept: 'Bản chất toán học & quy luật biến thiên',
          prerequisites: 'Kiến thức SGK cơ bản',
          scoreImpact: 'Ăn trọn vẹn điểm phần câu hỏi thông hiểu',
          whyThisStation: 'Được AI ưu tiên số 1 vì đây là lỗ hổng mà bạn đã khai báo trong form thiết kế.'
        },
        theory: {
          overview: 'Lỗ hổng nền tảng là nguyên nhân làm mất từ 1 - 2 điểm oan uổng nhất trong đề thi.',
          deepExplanation: 'Học sinh thường mất điểm do vội vàng quên đặt điều kiện xác định hoặc nhầm lẫn giữa các công thức biến đổi tương đương.',
          keyFormulas: [
            { name: 'Công thức vàng đặc trị', formula: 'Đặt điều kiện -> Chuẩn hóa dạng toán -> Áp dụng công thức giải nhanh', note: 'Áp dụng cho mọi câu hỏi trắc nghiệm chuẩn cấu trúc 2025' }
          ],
          commonTraps: [
            { trap: 'Quên kiểm tra điều kiện nghiệm ngoại lai', howToAvoid: 'Luôn viết điều kiện đầu tiên bằng bút khác màu trước khi biến đổi' }
          ],
          summaryTakeaways: ['Không bỏ qua bước điều kiện', 'Dùng phép thử giá trị đặc biệt khi bí phương pháp', 'Rèn phản xạ dưới áp lực 60 giây/câu']
        },
        workedExamples: [
          {
            title: `Bài toán điển hình về ${weak1 || 'Hàm số'}`,
            problem: 'Tìm nghiệm hoặc giá trị tham số m thỏa mãn bài toán.',
            level: 'Nền tảng',
            patternRecognition: 'Nhận diện cấu trúc đặc trưng của phương trình/hệ thức trong 5s.',
            steps: [
              { stepNum: 1, action: 'Xác định tập xác định', explanation: 'Đặt điều kiện chặt chẽ cho biến số.' },
              { stepNum: 2, action: 'Biến đổi tương đương', explanation: 'Sử dụng công thức giải nhanh đặc trị.' },
              { stepNum: 3, action: 'Đối chiếu và kết luận', explanation: 'Loại bỏ nghiệm ngoại lai và chọn đáp án.' }
            ],
            finalAnswer: 'Phương án đúng được xác định dứt khoát không ngộ nhận.',
            verificationTrick: 'Dùng chức năng TABLE hoặc SOLVE trên Casio fx-580VNX/880BTG để thử lại.'
          }
        ],
        practiceQuestions: [
          {
            id: 'thpt_p_1',
            question: 'Trong bài toán giải phương trình/bất phương trình, bước đầu tiên bắt buộc phải thực hiện là gì?',
            options: [
              'Tìm tập xác định và điều kiện có nghĩa của biểu thức',
              'Bình phương hai vế ngay lập tức',
              'Đặt ẩn phụ mà không cần điều kiện cho ẩn mới',
              'Bấm máy tính ngẫu nhiên 4 phương án'
            ],
            correctAnswer: 0,
            hints: ['Điều kiện tồn tại của biểu thức là yếu tố sống còn'],
            explanation: 'Mọi bài toán đều phải bắt đầu từ tập xác định để loại trừ các nghiệm không thỏa mãn.',
            trapAnalysis: 'Rất nhiều học sinh vội vàng biến đổi dẫn đến lấy thừa nghiệm.'
          }
        ],
        masteryTest: [
          {
            id: 'thpt_m_1',
            question: 'Khi áp dụng kỹ thuật giải nhanh, công cụ nào hỗ trợ kiểm tra nghiệm an toàn nhất?',
            options: [
              'Thay ngược 4 phương án đề bài vào biểu thức ban đầu (CALC/TABLE)',
              'Đoán mò phương án dài nhất',
              'Chọn phương án C theo thói quen',
              'Bỏ qua không kiểm tra lại'
            ],
            correctAnswer: 0,
            hints: ['Phương pháp thử nghiệm ngược là vũ khí số 1 trong thi trắc nghiệm'],
            explanation: 'CALC các giá trị phương án vào biểu thức gốc giúp khẳng định 100% tính chính xác.',
            trapAnalysis: 'Chủ quan không thử lại khiến mất 0.2 điểm vô cùng đáng tiếc.'
          }
        ]
      },
      {
        id: `thpt_s2_${Date.now()}`,
        stationNumber: 2,
        stageId: 1,
        stageName: 'Giai đoạn 1: Củng cố Nền tảng Cốt lõi',
        stageFocus: `Gia cố nền tảng chuyên đề trọng tâm: ${weak2 || 'Đồ thị & Bảng biến thiên'}`,
        title: `Gia Cố Nền Tảng: ${weak2 || 'Đồ thị, Bảng biến thiên & Kỹ thuật đọc nhanh'}`,
        subject: subjectCombo.includes('Lý') ? 'Vật lý 12' : 'Toán học 12',
        difficulty: 'Nền tảng',
        summary: `Làm chủ kỹ năng trích xuất thông tin từ đồ thị, bảng số liệu và xử lý trọn vẹn chuyên đề ${weak2 || 'Đồ thị'}.`,
        keyFormula: 'Mối liên hệ giữa đạo hàm, cực trị và hình học đồ thị',
        status: 'locked',
        xp: 140,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.4 Điểm',
        outcomes: {
          understand: ['Cách chuyển đổi linh hoạt giữa ngôn ngữ giải tích và hình ảnh đồ thị', 'Các điểm uốn, tiệm cận và cực trị'],
          canDo: ['Đọc đúng 100% thông số từ đồ thị trong dưới 20 giây', 'Loại trừ ngay 2 phương án sai sau 5 giây'],
          keyConcept: 'Ý nghĩa hình học của đạo hàm và tích phân',
          prerequisites: 'Khảo sát hàm số cơ bản',
          scoreImpact: 'Nâng điểm phần đồ thị lên tuyệt đối',
          whyThisStation: 'Đồ thị là định dạng câu hỏi xuất hiện với tần suất cao nhất trong đề thi mới.'
        },
        theory: {
          overview: 'Đồ thị là hình thức trực quan hóa bài toán. Người ra đề thường giấu các điều kiện biên vào các điểm cắt trục tọa độ và tiệm cận.',
          deepExplanation: 'Phân tích đồ thị theo thứ tự: 1. Dấu của hệ số bậc cao nhất -> 2. Điểm cắt trục tung x=0 -> 3. Số điểm cực trị -> 4. Tọa độ các điểm đặc biệt.',
          keyFormulas: [
            { name: 'Nguyên lý đọc nhanh đồ thị', formula: 'Nhánh phải hướng lên => a > 0; Giao Ox => số nghiệm; Giao Oy => hệ số tự do', note: 'Áp dụng cho mọi hàm số đa thức và phân thức' }
          ],
          commonTraps: [
            { trap: 'Nhầm lẫn giữa đồ thị của hàm f(x) và đồ thị của đạo hàm f\'(x)', howToAvoid: 'Luôn khoanh tròn ký hiệu trên trục tung (y hay y\') ngay khi đọc đề' }
          ],
          summaryTakeaways: ['Nhìn nhánh cuối trước', 'Kiểm tra điểm giao trục tọa độ', 'Đếm số lần đổi dấu']
        },
        workedExamples: [
          {
            title: 'Nhận dạng hàm số từ đồ thị cho trước',
            problem: 'Cho đồ thị cong có 2 điểm cực trị và tiệm cận đứng x=1, tiệm cận ngang y=2.',
            level: 'Nền tảng',
            patternRecognition: 'Nhận dạng hàm phân thức bậc nhất trên bậc nhất y = (ax+b)/(cx+d).',
            steps: [
              { stepNum: 1, action: 'Xác định tiệm cận', explanation: 'TCĐ: x = -d/c = 1; TCN: y = a/c = 2.' },
              { stepNum: 2, action: 'Xác định giao điểm', explanation: 'Cắt Oy tại (0, -1) => b/d = -1.' },
              { stepNum: 3, action: 'So khớp 4 phương án', explanation: 'Loại bỏ các hàm số không thỏa mãn 3 thông số trên.' }
            ],
            finalAnswer: 'Chọn được hàm số chính xác chỉ trong 15 giây.',
            verificationTrick: 'Thử tọa độ 1 điểm cực trị xem có thỏa mãn không.'
          }
        ],
        practiceQuestions: [
          {
            id: 'thpt_p_2',
            question: 'Khi nhìn vào đồ thị hàm số y = f\'(x), số điểm cực trị của hàm số ban đầu y = f(x) bằng gì?',
            options: [
              'Số lần đồ thị f\'(x) cắt trục hoành Ox và đổi dấu',
              'Số đỉnh cực đại và cực tiểu của chính đồ thị f\'(x)',
              'Số điểm đồ thị f\'(x) cắt trục tung Oy',
              'Số đường tiệm cận của đồ thị f\'(x)'
            ],
            correctAnswer: 0,
            hints: ['Cực trị xảy ra khi đạo hàm đổi dấu qua điểm đó'],
            explanation: 'Cực trị của f(x) tương ứng với nghiệm bội lẻ của f\'(x) = 0 (tức là đồ thị f\'(x) cắt xuyên qua Ox).',
            trapAnalysis: 'Rất nhiều học sinh nhầm lấy số đỉnh uốn lượn của chính đồ thị f\'(x).'
          }
        ],
        masteryTest: [
          {
            id: 'thpt_m_2',
            question: 'Nếu đồ thị f\'(x) tiếp xúc với trục hoành Ox tại điểm x = x0 (không cắt qua), thì tại x0 hàm số f(x) có cực trị không?',
            options: ['Không có cực trị', 'Chắc chắn là cực đại', 'Chắc chắn là cực tiểu', 'Có 2 cực trị'],
            correctAnswer: 0,
            hints: ['Tiếp xúc nghĩa là đạo hàm không đổi dấu'],
            explanation: 'Vì f\'(x) không đổi dấu khi đi qua x0 nên hàm số f(x) không đạt cực trị tại x0.',
            trapAnalysis: 'Bẫy nghiệm kép kinh điển trong đề thi THPT Quốc Gia.'
          }
        ]
      },
      {
        id: `thpt_s3_${Date.now()}`,
        stationNumber: 3,
        stageId: 2,
        stageName: 'Giai đoạn 2: Nâng Cao Chuyên Đề & Phân Dạng Trọng Tâm',
        stageFocus: 'Phương pháp tư duy giải nhanh & Phân loại bài toán 8+',
        title: 'Phân Dạng Chuyên Đề: Kỹ Thuật Đổi Biến & Ghép Trục Hàm Hợp Nâng Cao',
        subject: 'Toán học 12',
        difficulty: 'Vận dụng',
        summary: 'Chinh phục bài toán hàm hợp, tương giao đồ thị chứa tham số và kỹ thuật ghép trục giải toán trong 30 giây.',
        keyFormula: 'Bảng biến thiên ghép u = u(x) -> f(u) trong 1 dòng duy nhất',
        status: 'locked',
        xp: 160,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.6 Điểm',
        outcomes: {
          understand: ['Bản chất phương pháp ghép trục trong hàm hợp', 'Sự tương quan giữa biến sơ cấp x và biến trung gian u'],
          canDo: ['Giải quyết bài toán tìm số nghiệm của f(u(x)) = m trong dưới 45 giây', 'Vẽ bảng biến thiên ghép chuẩn xác'],
          keyConcept: 'Bảo toàn chiều biến thiên và các điểm cực trị trung gian',
          prerequisites: 'Đạo hàm hàm hợp',
          scoreImpact: 'Ăn chắc câu 35 - 42 trong đề thi',
          whyThisStation: 'Rút ngắn thời gian làm bài từ 5 phút xuống còn dưới 1 phút cho câu 8+.'
        },
        theory: {
          overview: 'Phương pháp ghép trục là tuyệt kỹ chuyển bài toán hàm hợp phức tạp về việc đọc bảng biến thiên của hàm đơn giản u(x).',
          deepExplanation: 'Các bước ghép trục: 1. Đặt ẩn phụ u = u(x) -> 2. Lập dòng x, u(x) và chèn điểm cực trị của f(u) -> 3. Lập dòng f(u) tương ứng.',
          keyFormulas: [
            { name: 'Khung Ghép Trục', formula: 'x -> u(x) (kèm điểm cực trị của f) -> f(u)', note: 'Cực kỳ lợi hại cho bài toán đếm số nghiệm' }
          ],
          commonTraps: [
            { trap: 'Quên không chèn điểm cực trị của hàm gốc f(t) vào giữa các khoảng của u', howToAvoid: 'Luôn nhìn lại đồ thị gốc f(t) có cực trị tại t bằng bao nhiêu để điền vào dòng u' }
          ],
          summaryTakeaways: ['Tìm miền giá trị của u', 'Chèn điểm cực trị trung gian', 'Dóng thẳng cột giá trị f(u)']
        },
        workedExamples: [
          {
            title: 'Tìm số nghiệm của phương trình f(x² - 2x) = 1',
            problem: 'Cho hàm số f(x) có bảng biến thiên cho trước. Tìm số nghiệm thực của phương trình f(x² - 2x) = 1.',
            level: 'Vận dụng',
            patternRecognition: 'Bài toán tương giao hàm hợp f(u(x)) = const.',
            steps: [
              { stepNum: 1, action: 'Đặt u = x² - 2x', explanation: 'u\' = 2x - 2 = 0 <=> x = 1, u(1) = -1. Miền giá trị u chạy từ +∞ về -1 rồi lên +∞.' },
              { stepNum: 2, action: 'Chèn cực trị của f', explanation: 'Chèn các điểm cực trị của hàm f rơi vào khoảng (-1; +∞).' },
              { stepNum: 3, action: 'Đếm giao điểm', explanation: 'Kẻ đường thẳng y = 1 cắt đồ thị ghép và đếm số nghiệm.' }
            ],
            finalAnswer: 'Phương trình có chính xác 4 nghiệm phân biệt.',
            verificationTrick: 'Vẽ nhanh parabol u(x) ở góc nháp để kiểm soát chiều mũi tên.'
          }
        ],
        practiceQuestions: [
          {
            id: 'thpt_p_3',
            question: 'Khi lập bảng ghép trục cho hàm u(x), nếu u(x) chạy từ -2 lên 3, ta cần chèn các điểm nào vào giữa?',
            options: [
              'Tất cả các điểm cực trị của hàm số gốc f(t) nằm trong khoảng (-2; 3)',
              'Các nghiệm của phương trình u(x) = 0',
              'Các điểm uốn của u(x)',
              'Chỉ cần chèn số 0'
            ],
            correctAnswer: 0,
            hints: ['Hàm f(u) chỉ đổi chiều biến thiên tại các điểm cực trị của chính nó'],
            explanation: 'Quy tắc ghép trục bắt buộc phải điền các điểm cực trị của hàm f(t) nằm trên khoảng chuyển động của u.',
            trapAnalysis: 'Quên chèn điểm cực trị trung gian là lỗi sai phổ biến nhất.'
          }
        ],
        masteryTest: [
          {
            id: 'thpt_m_3',
            question: 'Phương pháp ghép trục có áp dụng được khi hàm f(u) chứa giá trị tuyệt đối |f(u)| không?',
            options: [
              'Hoàn toàn áp dụng được bằng cách lấy đối xứng qua trục Ox phần dưới',
              'Không áp dụng được',
              'Chỉ áp dụng được khi hàm số là bậc hai',
              'Phải phá dấu giá trị tuyệt đối trước'
            ],
            correctAnswer: 0,
            hints: ['Ghép trục vẽ xong f(u) rồi lấy trị tuyệt đối cực kỳ nhanh'],
            explanation: 'Vẽ bảng biến thiên f(u) rồi lật phần âm lên trên trục Ox cho ra kết quả |f(u)| trong 10 giây.',
            trapAnalysis: 'Nhiều bạn nghĩ có trị tuyệt đối là không ghép trục được.'
          }
        ]
      },
      {
        id: `thpt_s4_${Date.now()}`,
        stationNumber: 4,
        stageId: 3,
        stageName: 'Giai đoạn 3: Bắt Bẫy Đề Thi & Chùm Đúng/Sai Cấu Trúc 2025',
        stageFocus: 'Rèn luyện khả năng nhận diện bẫy đề thi & Chùm câu hỏi 4 ý Đúng/Sai',
        title: 'Bắt Bẫy Đề Thi 2025: Bẫy Ngộ Nhận, Điều Kiện Biên & Chùm Đúng/Sai',
        subject: subjectCombo.includes('Lý') ? 'Vật lý 12' : 'Toán học 12',
        difficulty: 'Vận dụng',
        summary: 'Rèn luyện khả năng thẩm định 4 ý Đúng/Sai theo format mới 2025 của Bộ GD&ĐT, phòng chống bẫy đơn vị và bẫy khoảng nghiệm.',
        keyFormula: 'Xác suất 4 ý: Đúng cả 4 ý đạt 1.0 điểm; Đúng 1 ý chỉ được 0.1 điểm',
        status: 'locked',
        xp: 170,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.6 Điểm',
        outcomes: {
          understand: ['Cơ chế tính điểm lũy tiến của dạng Đúng/Sai (0.1 - 0.25 - 0.5 - 1.0 điểm)'],
          canDo: ['Thẩm định dứt khoát tính đúng sai của từng mệnh đề không phụ thuộc may rủi'],
          keyConcept: 'Tính độc lập và liên đới giữa 4 ý a, b, c, d',
          prerequisites: 'Nắm vững lý thuyết toàn diện',
          scoreImpact: 'Bảo toàn trọn vẹn 4.0 điểm phần Đúng/Sai',
          whyThisStation: 'Cấu trúc đề thi mới 2025 trừng phạt nặng học sinh học tủ hoặc đoán mò.'
        },
        theory: {
          overview: 'Trong cấu trúc đề 2025, dạng Đúng/Sai đòi hỏi thí sinh phải hiểu bản chất sâu sắc. Ý a và b thường là nền tảng, ý c và d là vận dụng cao.',
          deepExplanation: 'Chiến thuật: Làm chắc chắn ý a và b trước để có điểm nền. Dùng kết quả của ý a và b làm dữ kiện kiểm tra ý c và d.',
          keyFormulas: [
            { name: 'Ma trận điểm Đúng/Sai 2025', formula: '1 ý = 0.1đ | 2 ý = 0.25đ | 3 ý = 0.5đ | 4 ý = 1.0đ', note: 'Không được phép sai dù chỉ 1 dấu cộng trừ ở ý d' }
          ],
          commonTraps: [
            { trap: 'Sai ý c dẫn đến làm sai dây chuyền ý d', howToAvoid: 'Kiểm tra độc lập ý d bằng một hướng tiếp cận khác nếu có thể' }
          ],
          summaryTakeaways: ['Đọc kỹ từng từ phủ định', 'Đổi đơn vị chuẩn SI trước khi tính', 'Không đoán mò']
        },
        workedExamples: [
          {
            title: 'Thẩm định chùm câu hỏi Đúng/Sai về Khảo sát Hàm số',
            problem: 'Cho hàm số y = x³ - 3x² + 2. a) Đồng biến trên (-∞; 0). b) Cực tiểu tại x=2. c) Tâm đối xứng I(1; 0). d) Tiếp tuyến tại I có hệ số góc lớn nhất.',
            level: 'Vận dụng',
            patternRecognition: 'Kiểm tra tuần tự 4 khẳng định theo đạo hàm y\' = 3x² - 6x.',
            steps: [
              { stepNum: 1, action: 'Ý a & b', explanation: 'y\' = 0 <=> x=0, x=2. Dấu y\' dương trên (-∞; 0) -> a ĐÚNG; x=2 là cực tiểu -> b ĐÚNG.' },
              { stepNum: 2, action: 'Ý c', explanation: 'Tâm đối xứng là điểm uốn x=1, y(1)=0 -> c ĐÚNG.' },
              { stepNum: 3, action: 'Ý d', explanation: 'y\'(1) = -3 là giá trị NHỎ NHẤT (parabol bề lõm quay lên), không phải lớn nhất -> d SAI.' }
            ],
            finalAnswer: 'a: ĐÚNG, b: ĐÚNG, c: ĐÚNG, d: SAI (Đạt trọn vẹn 1.0 điểm).',
            verificationTrick: 'Vẽ nhanh parabol y\' để thấy đỉnh là giá trị nhỏ nhất.'
          }
        ],
        practiceQuestions: [
          {
            id: 'thpt_p_4',
            question: 'Trong dạng câu hỏi Đúng/Sai cấu trúc 2025, nếu bạn chỉ đúng 2 ý trên 4 ý thì số điểm nhận được là bao nhiêu?',
            options: ['0.25 điểm', '0.5 điểm', '0.2 điểm', '0.4 điểm'],
            correctAnswer: 0,
            hints: ['Thang điểm Bộ GD&ĐT quy định: 1 ý = 0.1, 2 ý = 0.25, 3 ý = 0.5, 4 ý = 1.0'],
            explanation: 'Quy chế thi 2025 quy định đúng 2 ý được 0.25 điểm.',
            trapAnalysis: 'Nhiều người lầm tưởng mỗi ý được 0.25 điểm đều nhau.'
          }
        ],
        masteryTest: [
          {
            id: 'thpt_m_4',
            question: 'Mệnh đề: "Hàm số f(x) đồng biến trên khoảng K khi và chỉ khi f\'(x) > 0 với mọi x thuộc K" là ĐÚNG hay SAI?',
            options: ['SAI (thiếu dấu bằng tại hữu hạn điểm)', 'ĐÚNG', 'Tùy hàm số', 'Chưa đủ dữ kiện'],
            correctAnswer: 0,
            hints: ['Định lý mở rộng cho phép f\'(x) = 0 tại hữu hạn điểm'],
            explanation: 'Mệnh đề SAI vì điều kiện đủ là f\'(x) >= 0 với mọi x thuộc K và dấu bằng chỉ xảy ra tại hữu hạn điểm.',
            trapAnalysis: 'Bẫy lý thuyết cực kỳ phổ biến khiến hàng ngàn học sinh mất điểm.'
          }
        ]
      },
      {
        id: `thpt_s5_${Date.now()}`,
        stationNumber: 5,
        stageId: 4,
        stageName: 'Giai đoạn 4: Đột Phá Vận Dụng Cao 9+ & Câu Phân Loại',
        stageFocus: 'Chinh phục bài toán điểm 10 & Tham số hóa cực trị',
        title: 'Đột Phá Điểm 9+: Bài Toán Tham Số, Cực Trị Tối Ưu & Chuẩn Hóa Số Liệu',
        subject: 'Toán học 12',
        difficulty: 'Vận dụng cao 9+',
        summary: 'Làm chủ phương pháp chuẩn hóa số liệu, dồn biến và đánh giá bất đẳng thức biên trong bài toán phân loại top 1% thí sinh.',
        keyFormula: 'Bất đẳng thức Cauchy-Schwarz & Phương pháp Chuẩn hóa tham số hóa',
        status: 'locked',
        xp: 190,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.8 Điểm',
        outcomes: {
          understand: ['Tư duy quy nạp toán học và tính đối xứng trong bài toán 9+'],
          canDo: ['Tìm ra hướng giải cho câu hỏi điểm 10 trong dưới 90 giây suy nghĩ ban đầu'],
          keyConcept: 'Kỹ thuật chọn điểm rơi và chuẩn hóa tỉ lệ',
          prerequisites: 'Tất cả các trạm 1 - 4',
          scoreImpact: 'Bứt phá vượt ngưỡng điểm 9.0 để vào trường top 1',
          whyThisStation: 'Đây là câu hỏi quyết định học bổng và thủ khoa khối thi.'
        },
        theory: {
          overview: 'Các câu hỏi 9+ thường kết hợp từ 2 chuyên đề trở lên (ví dụ: Hình học Oxyz kết hợp Cực trị hàm số).',
          deepExplanation: 'Quy tắc vàng: 1. Đưa về ngôn ngữ hình học -> 2. Sử dụng bất đẳng thức tam giác -> 3. Kiểm tra điều kiện dấu bằng xảy ra.',
          keyFormulas: [
            { name: 'Bất đẳng thức Modun Số Phức', formula: '||z1| - |z2|| <= |z1 + z2| <= |z1| + |z2|', note: 'Dấu bằng xảy ra khi hai vector cùng hướng' }
          ],
          commonTraps: [
            { trap: 'Tìm ra giá trị cực trị nhưng không tồn tại điểm rơi để dấu bằng xảy ra', howToAvoid: 'Luôn giải phương trình tìm z0 cụ thể thỏa mãn dấu bằng' }
          ],
          summaryTakeaways: ['Hình học hóa số phức', 'Chọn điểm rơi đối xứng', 'Loại trừ phương án bằng giá trị biên']
        },
        workedExamples: [
          {
            title: 'Tìm giá trị lớn nhất của |z - 3 + 4i| biết |z| = 2',
            problem: 'Cho số phức z thỏa mãn |z| = 2. Tìm giá trị lớn nhất của biểu thức P = |z - (3 - 4i)|.',
            level: 'Vận dụng cao 9+',
            patternRecognition: 'Tập hợp điểm M biểu diễn z là đường tròn tâm O bán kính R=2. Điểm A(3; -4).',
            steps: [
              { stepNum: 1, action: 'Hình học hóa', explanation: 'P = MA với M thuộc đường tròn (O; 2) và OA = 5.' },
              { stepNum: 2, action: 'Đánh giá khoảng cách', explanation: 'P_max = OA + R = 5 + 2 = 7.' }
            ],
            finalAnswer: 'Giá trị lớn nhất P_max = 7.',
            verificationTrick: 'Bất đẳng thức tam giác: P <= |z| + |-3 + 4i| = 2 + 5 = 7.'
          }
        ],
        practiceQuestions: [
          {
            id: 'thpt_p_5',
            question: 'Khi tập hợp điểm biểu diễn số phức z là đường tròn tâm I bán kính R, khoảng cách ngắn nhất từ điểm A ngoài đường tròn tới M(z) là gì?',
            options: ['IA - R', 'IA + R', 'R - IA', '√(IA² + R²)'],
            correctAnswer: 0,
            hints: ['Điểm M gần A nhất nằm trên đoạn thẳng nối A và tâm I'],
            explanation: 'Khoảng cách nhỏ nhất luôn là d_min = IA - R.',
            trapAnalysis: 'Nhầm lẫn giữa giá trị nhỏ nhất (IA - R) và lớn nhất (IA + R).'
          }
        ],
        masteryTest: [
          {
            id: 'thpt_m_5',
            question: 'Trong bài toán cực trị hình học không gian Oxyz, phương pháp nào thường cho kết quả nhanh nhất khi có yếu tố đối xứng?',
            options: [
              'Tọa độ hóa gắn hệ trục Oxyz chuẩn',
              'Dựng hình thuần túy cấp 2',
              'Đoán mò tọa độ trọng tâm',
              'Bỏ qua không làm'
            ],
            correctAnswer: 0,
            hints: ['Tọa độ hóa đưa mọi bài toán hình học về đại số giải tích thuần túy'],
            explanation: 'Gắn hệ trục Oxyz giúp chuyển bài toán hình học phức tạp thành việc tính tích vô hướng và khoảng cách đại số.',
            trapAnalysis: 'Ngại gắn hệ trục tọa độ vì sợ tính toán cồng kềnh.'
          }
        ]
      },
      {
        id: `thpt_s6_${Date.now()}`,
        stationNumber: 6,
        stageId: 5,
        stageName: 'Giai đoạn 5: Tổng Ôn Áp Lực Cao & Chiến Thuật Phòng Thi',
        stageFocus: 'Mô phỏng thi thật & Chiến thuật 3 vòng phân bổ thời gian',
        title: 'Tổng Ôn Đề Thi Thực Chiến: Chiến Thuật 3 Vòng & Kiểm Soát Tâm Lý Phòng Thi',
        subject: subjectCombo.includes('Lý') ? 'Vật lý 12' : 'Toán học 12',
        difficulty: 'Vận dụng cao 9+',
        summary: 'Thi thử áp lực bấm giờ nghiêm ngặt, hoàn thiện chiến thuật 3 vòng làm bài và tối ưu hóa điểm số tuyệt đối.',
        keyFormula: 'Vòng 1 (25p): 30 câu đầu | Vòng 2 (30p): 10 câu 8+ | Vòng 3 (30p): 10 câu 9+ | Soát bài (5p)',
        status: 'locked',
        xp: 200,
        estimatedMinutes: estMinutes,
        scoreContribution: '+1.0 Điểm',
        outcomes: {
          understand: ['Cách vận hành đồng hồ sinh học và sự tập trung cao độ trong 90 phút thi'],
          canDo: ['Không bao giờ bị cuống thời gian hoặc tô nhầm phiếu trả lời trắc nghiệm'],
          keyConcept: 'Kỹ thuật buông bỏ câu quá khó để tối đa tổng điểm',
          prerequisites: 'Hoàn thành tất cả các trạm 1 - 5',
          scoreImpact: 'Tối ưu hóa điểm số thực tế sát với điểm tiềm năng nhất',
          whyThisStation: 'Biến kiến thức tích lũy thành điểm số rực rỡ trên giấy thi.'
        },
        theory: {
          overview: 'Phòng thi không phải là nơi chứng minh bạn thông minh nhất, mà là nơi chứng minh bạn phạm ít sai lầm nhất.',
          deepExplanation: 'Quy tắc 3 Vòng: Vòng 1 làm ngay các câu nhìn ra đáp án trong 30s. Vòng 2 giải các câu cần biến đổi ngắn. Vòng 3 dành cho các câu phân loại.',
          keyFormulas: [
            { name: 'Nguyên tắc Vàng Phòng Thi', formula: 'Câu 1 điểm cũng bằng điểm Câu 10 => Không được bỏ qua câu dễ để cày câu khó', note: 'Mỗi câu đều có giá trị điểm số ngang nhau' }
          ],
          commonTraps: [
            { trap: 'Mắc kẹt ở một câu khó quá 5 phút khiến mất thời gian làm 3 câu dễ phía sau', howToAvoid: 'Đánh dấu lại câu đó, chuyển ngay sang câu tiếp theo sau đúng 90 giây' }
          ],
          summaryTakeaways: ['Tô phiếu ngay sau mỗi trang', 'Dành 5 phút cuối kiểm tra mã đề', 'Giữ nhịp thở đều']
        },
        workedExamples: [
          {
            title: 'Xử lý tình huống gặp câu lạ chưa từng học',
            problem: 'Còn 15 phút, gặp câu 48 hoàn toàn mới lạ.',
            level: 'Vận dụng cao 9+',
            patternRecognition: 'Phân tích tính đối xứng và thử các giá trị đặc biệt.',
            steps: [
              { stepNum: 1, action: 'Chuẩn hóa số liệu', explanation: 'Cho các tham số a=1, b=1, c=2 để đơn giản hóa bài toán.' },
              { stepNum: 2, action: 'Thử máy tính Casio', explanation: 'Bấm máy tính với bộ số chuẩn hóa để tìm quy luật.' },
              { stepNum: 3, action: 'Loại trừ phương án', explanation: 'Loại được 2 phương án vô lý, tăng xác suất trúng lên 50%.' }
            ],
            finalAnswer: 'Chọn được đáp án chính xác nhờ kỹ thuật chuẩn hóa số liệu.',
            verificationTrick: 'Thử thêm 1 bộ số thứ hai để kiểm chứng quy luật.'
          }
        ],
        practiceQuestions: [
          {
            id: 'thpt_p_6',
            question: 'Khi làm bài thi trắc nghiệm, thời điểm tối ưu nhất để tô đáp án vào phiếu trả lời là khi nào?',
            options: [
              'Làm xong trang nào tô ngay trang đó vào phiếu',
              'Chờ hết giờ mới tô tất cả một lượt',
              'Tô từng câu một sau mỗi phép tính',
              'Chỉ khoanh vào đề thi không cần tô phiếu'
            ],
            correctAnswer: 0,
            hints: ['Tô theo từng trang giúp vừa giải lao mắt vừa tránh rủi ro hết giờ chưa kịp tô'],
            explanation: 'Tô theo từng mặt giấy (khoảng 5-8 câu) là chiến thuật khoa học nhất được các thủ khoa áp dụng.',
            trapAnalysis: 'Chờ đến cuối giờ mới tô là sai lầm nguy hiểm nhất dẫn đến không kịp tô hoặc tô lệch dòng.'
          }
        ],
        masteryTest: [
          {
            id: 'thpt_m_6',
            question: 'Trong 5 phút cuối của giờ thi, hành động quan trọng nhất bạn cần làm là gì?',
            options: [
              'Kiểm tra lại số báo danh, mã đề thi và đảm bảo không có câu nào để trống',
              'Cố gắng giải nốt một câu 9+ chưa xong',
              'Ngồi chờ trống thu bài',
              'Tẩy xóa các câu đã tô để đổi ý'
            ],
            correctAnswer: 0,
            hints: ['Sai mã đề hoặc số báo danh là mất toàn bộ bài thi'],
            explanation: 'Kiểm tra mã đề thi và tô kín 100% các câu hỏi là nguyên tắc sống còn.',
            trapAnalysis: 'Để trống câu hỏi trắc nghiệm là tự tước đi 25% cơ hội có điểm.'
          }
        ]
      },
      {
        id: `thpt_s7_${Date.now()}`,
        stationNumber: 7,
        stageId: 5,
        stageName: 'Giai đoạn 5: Trạm Checkpoint Master Chuẩn Hóa',
        stageFocus: 'Bộ đề thi thử chuẩn cấu trúc 2025 của các trường Chuyên Top đầu',
        title: 'Trạm Checkpoint Master: Bộ Đề Chuẩn Hóa & Bứt Phá Điểm Số Mục Tiêu',
        subject: 'Toán - Lý - Hóa Tổng Hợp',
        difficulty: 'Vận dụng cao 9+',
        summary: 'Kiểm chứng toàn diện năng lực, sẵn sàng bước vào kỳ thi chính thức với sự tự tin tuyệt đối.',
        keyFormula: 'Target Readiness 100% • Sẵn sàng chinh phục trường Đại học mục tiêu',
        status: 'locked',
        xp: 220,
        estimatedMinutes: estMinutes,
        scoreContribution: '+1.0 Điểm',
        outcomes: {
          understand: ['Toàn bộ cấu trúc và ma trận phân bổ câu hỏi của đề thi chính thức'],
          canDo: ['Giải quyết đề thi trong 75 phút, dư 15 phút rà soát'],
          keyConcept: 'Bản lĩnh phòng thi và tâm thế thủ khoa',
          prerequisites: 'Tất cả các trạm 1 - 6',
          scoreImpact: 'Cán mốc điểm số mục tiêu kỳ vọng',
          whyThisStation: 'Trạm đích khẳng định sự trưởng thành vượt bậc sau toàn bộ lộ trình.'
        },
        theory: {
          overview: 'Bạn đã hoàn thiện trọn vẹn mọi mảnh ghép kiến thức từ nền tảng đến vận dụng cao.',
          deepExplanation: 'Giờ là lúc bước vào phòng thi với tâm thế của một người làm chủ đề thi.',
          keyFormulas: [
            { name: 'Nguyên tắc vàng', formula: 'Chắc chắn câu dễ - Nhanh gọn câu trung bình - Bình tĩnh xử lý câu khó', note: 'Không để mất bất kỳ điểm số đáng tiếc nào' }
          ],
          commonTraps: [
            { trap: 'Chủ quan ở những câu hỏi lý thuyết quen thuộc', howToAvoid: 'Đọc kỹ từng chữ của đề bài trước khi kết luận' }
          ],
          summaryTakeaways: ['Giữ vững niềm tin', 'Tập trung cao độ', 'Chiến thắng mục tiêu']
        },
        workedExamples: [
          {
            title: 'Kỹ thuật rà soát bài làm 15 phút cuối',
            problem: 'Kiểm tra lại toàn bộ 50 câu hỏi đã làm.',
            level: 'Vận dụng cao 9+',
            patternRecognition: 'So khớp đề bài và phiếu trả lời.',
            steps: [
              { stepNum: 1, action: 'So khớp mã đề', explanation: 'Đảm bảo tô đúng mã đề thi.' },
              { stepNum: 2, action: 'Đếm số câu', explanation: 'Đảm bảo 50/50 ô đều đã được tô đậm.' }
            ],
            finalAnswer: 'Bài thi hoàn hảo 100% không tì vết.',
            verificationTrick: 'Dùng thước kẻ gióng thẳng hàng số câu và ô tô.'
          }
        ],
        practiceQuestions: [
          {
            id: 'thpt_p_7',
            question: 'Khi nhận được đề thi, điều đầu tiên thí sinh cần làm trong 5 phút đầu là gì?',
            options: [
              'Kiểm tra số trang, chất lượng in ấn và đọc lướt một lượt toàn bộ đề',
              'Làm ngay câu khó nhất',
              'Ngồi chờ giám thị nhắc nhở',
              'Khoanh bừa đáp án'
            ],
            correctAnswer: 0,
            hints: ['Quy chế thi yêu cầu kiểm tra đề thi ngay khi phát'],
            explanation: 'Kiểm tra đề thi giúp phát hiện sớm đề rách hoặc mờ chữ để đổi ngay.',
            trapAnalysis: 'Chủ quan không kiểm tra đề dẫn đến phát hiện đề in mờ khi sắp hết giờ.'
          }
        ],
        masteryTest: [
          {
            id: 'thpt_m_7',
            question: 'Sau khi hoàn thành lộ trình thích ứng tại EduAdvisor AI, mục tiêu lớn nhất của bạn là gì?',
            options: [
              'Tự tin bước vào phòng thi và đỗ nguyện vọng 1 trường Đại học mơ ước',
              'Chỉ cần qua môn',
              'Vẫn còn lo lắng',
              'Chưa có mục tiêu'
            ],
            correctAnswer: 0,
            hints: ['Bạn đã có sự chuẩn bị bài bản nhất'],
            explanation: 'Sự kiên trì và lộ trình đúng đắn sẽ dẫn bạn tới thành công rực rỡ!',
            trapAnalysis: 'Không có.'
          }
        ]
      },
      {
        id: `thpt_s8_${Date.now()}`,
        stationNumber: 8,
        stageId: 5,
        stageName: 'Giai đoạn 5: Chuyên Đề Mở Rộng Liên Môn 2025',
        stageFocus: 'Tích hợp thực tiễn và mô hình toán học trong Vật lý & Hóa học',
        title: 'Chuyên Đề Mở Rộng: Ứng Dụng Thực Tiễn & Mô Hình Hóa Liên Môn',
        subject: 'Toán - KHTN Thực Nghiệm',
        difficulty: 'Vận dụng cao 9+',
        summary: 'Xử lý các bài toán bối cảnh thực tế mới lạ trong đề thi 2025: Mô hình tăng trưởng dân số, tài chính, mạch điện tử và hóa học xanh.',
        keyFormula: 'Mô hình hóa thực tế: Dữ kiện thực tế -> Biểu thức đại số -> Giải tối ưu',
        status: 'locked',
        xp: 230,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.5 Điểm',
        outcomes: {
          understand: ['Cách trích xuất dữ kiện toán học từ bài đọc thực tiễn dài'],
          canDo: ['Giải quyết bài toán thực tế trong dưới 90 giây'],
          keyConcept: 'Kỹ năng mô hình hóa toán học',
          prerequisites: 'Hàm số mũ, logarit và đạo hàm',
          scoreImpact: 'Ăn chắc các câu hỏi thực tế cấu trúc 2025',
          whyThisStation: 'Đề thi mới tăng tỷ trọng câu hỏi ứng dụng thực tiễn.'
        },
        theory: {
          overview: 'Đề thi 2025 không kiểm tra tính toán máy móc mà kiểm tra tư duy ứng dụng toán học vào đời sống.',
          deepExplanation: 'Đọc lướt bỏ qua các từ ngữ văn hoa, chỉ chú ý vào biến số, đơn vị đo và mối liên hệ hàm số giữa các đại lượng.',
          keyFormulas: [
            { name: 'Công thức Tăng trưởng Mũ', formula: 'N(t) = N0 * e^(k*t)', note: 'Áp dụng cho bài toán dân số, vi khuẩn, phóng xạ' }
          ],
          commonTraps: [
            { trap: 'Bị choáng ngợp bởi đề bài dài hơn nửa trang giấy', howToAvoid: 'Gạch chân ngay các con số và đơn vị đo' }
          ],
          summaryTakeaways: ['Lọc dữ kiện chính', 'Thiết lập hàm mục tiêu', 'Khảo sát tìm cực trị']
        },
        workedExamples: [
          {
            title: 'Bài toán tối ưu hóa chi phí sản xuất thùng chứa',
            problem: 'Thiết kế thùng chứa hình trụ dung tích V không đổi sao cho diện tích toàn phần nhỏ nhất.',
            level: 'Vận dụng cao 9+',
            patternRecognition: 'Bài toán cực trị thể tích và diện tích.',
            steps: [
              { stepNum: 1, action: 'Biểu diễn diện tích', explanation: 'S_tp = 2πr² + 2πrh với h = V/(πr²).' },
              { stepNum: 2, action: 'Dùng BĐT Cauchy', explanation: 'S_tp = 2πr² + V/r + V/r >= 3 * ∛(2π * V²).' },
              { stepNum: 3, action: 'Tìm điều kiện dấu bằng', explanation: 'h = 2r (chiều cao bằng đường kính đáy).' }
            ],
            finalAnswer: 'Tỷ lệ tối ưu h = 2r.',
            verificationTrick: 'Quy tắc kinh điển: Hình trụ có chi phí nhỏ nhất khi thiết diện qua trục là hình vuông.'
          }
        ],
        practiceQuestions: [
          {
            id: 'thpt_p_8',
            question: 'Trong bài toán lãi kép gửi ngân hàng không rút tiền lãi ra, số tiền nhận được sau n kỳ hạn tính theo công thức nào?',
            options: ['A = P * (1 + r)^n', 'A = P * (1 + n*r)', 'A = P * r^n', 'A = P * (1 + r/n)'],
            correctAnswer: 0,
            hints: ['Lãi mẹ đẻ lãi con theo cấp số nhân'],
            explanation: 'Công thức lãi kép kinh điển: A = P * (1 + r)^n.',
            trapAnalysis: 'Nhầm sang công thức lãi đơn A = P * (1 + n*r).'
          }
        ],
        masteryTest: [
          {
            id: 'thpt_m_8',
            question: 'Độ pH của dung dịch được định nghĩa theo nồng độ ion H+ như thế nào?',
            options: ['pH = -log[H+]', 'pH = log[H+]', 'pH = ln[H+]', 'pH = 10^[H+]'],
            correctAnswer: 0,
            hints: ['pH là logarit cơ số 10 mang dấu trừ'],
            explanation: 'pH = -log[H+] là ứng dụng thực tế phổ biến của hàm logarit trong Hóa học.',
            trapAnalysis: 'Quên dấu trừ trong định nghĩa pH.'
          }
        ]
      },
      {
        id: `thpt_s9_${Date.now()}`,
        stationNumber: 9,
        stageId: 5,
        stageName: 'Giai đoạn 5: Chinh Phục 10 Câu Phân Loại Cuối',
        stageFocus: 'Bẻ gãy câu hỏi điểm 10 phân loại thí sinh chuyên nghiệp',
        title: 'Chinh Phục Câu Hỏi Điểm 10: Tuyệt Kỹ Đánh Giá & Bất Đẳng Thức Đa Biến',
        subject: 'Toán học 12',
        difficulty: 'Vận dụng cao 9+',
        summary: 'Các phương pháp dồn biến, hàm đặc trưng nâng cao và hình học vi phân dành riêng cho các bạn đặt mục tiêu thủ khoa 29+.',
        keyFormula: 'f(u) = f(v) với hàm f đơn điệu => u = v',
        status: 'locked',
        xp: 240,
        estimatedMinutes: estMinutes,
        scoreContribution: '+0.5 Điểm',
        outcomes: {
          understand: ['Cách nhìn thấu hàm đặc trưng giấu sau phương trình phức tạp'],
          canDo: ['Đưa phương trình 2 ẩn mũ - logarit về quan hệ u = v trong 60 giây'],
          keyConcept: 'Tính đơn điệu của hàm số đặc trưng',
          prerequisites: 'Đạo hàm và tính đơn điệu cấp cao',
          scoreImpact: 'Quyết định điểm 9.8 - 10.0',
          whyThisStation: 'Phân loại tuyệt đối nhóm thí sinh đạt điểm cao nhất cả nước.'
        },
        theory: {
          overview: 'Hàm đặc trưng là công cụ mạnh nhất để giải các phương trình mũ - logarit chứa tham số m.',
          deepExplanation: 'Nếu f(t) là hàm số luôn đồng biến hoặc nghịch biến trên toàn miền xác định, thì f(u) = f(v) xảy ra khi và chỉ khi u = v.',
          keyFormulas: [
            { name: 'Định lý Hàm Đặc Trưng', formula: 'f\'(t) > 0 ∀t => f(u) = f(v) <=> u = v', note: 'Chuyển phương trình siêu việt về phương trình đại số' }
          ],
          commonTraps: [
            { trap: 'Chưa chứng minh hàm số đơn điệu đã vội cho hai ruột bằng nhau', howToAvoid: 'Luôn kiểm tra đạo hàm f\'(t) có cùng dấu hay không' }
          ],
          summaryTakeaways: ['Tách 2 vế có cùng cấu trúc', 'Chứng minh tính đơn điệu', 'Rút ra quan hệ ẩn']
        },
        workedExamples: [
          {
            title: 'Giải phương trình 2^(x - y) + x = y + 1',
            problem: 'Phương trình chứa cả hàm mũ và đa thức.',
            level: 'Vận dụng cao 9+',
            patternRecognition: 'Chuyển vế để tạo hàm f(t) = 2^t + t.',
            steps: [
              { stepNum: 1, action: 'Biến đổi', explanation: '2^x / 2^y + x = y + 1 <=> 2^x + x * 2^y = (y + 1) * 2^y.' },
              { stepNum: 2, action: 'Xét hàm f(t) = 2^t + t', explanation: 'f\'(t) = 2^t * ln2 + 1 > 0 => f(t) luôn đồng biến.' },
              { stepNum: 3, action: 'Kết luận', explanation: 'Phương trình tương đương x = y.' }
            ],
            finalAnswer: 'Rút ra quan hệ x = y chỉ trong 45 giây.',
            verificationTrick: 'Thử lại với x=1, y=1 xem có thỏa mãn không.'
          }
        ],
        practiceQuestions: [
          {
            id: 'thpt_p_9',
            question: 'Khi sử dụng phương pháp hàm đặc trưng, điều kiện cốt lõi bắt buộc của hàm số f(t) là gì?',
            options: [
              'Hàm số phải luôn đơn điệu (đồng biến hoặc nghịch biến) trên miền xác định',
              'Hàm số phải là hàm bậc hai',
              'Hàm số phải có nghiệm bằng 0',
              'Hàm số phải chẵn hoặc lẻ'
            ],
            correctAnswer: 0,
            hints: ['Chỉ khi luôn đơn điệu thì f(u) = f(v) mới tương đương u = v'],
            explanation: 'Tính đơn điệu đảm bảo mỗi giá trị của f chỉ tương ứng với duy nhất một giá trị t.',
            trapAnalysis: 'Áp dụng hàm đặc trưng cho hàm không đơn điệu sẽ dẫn đến thiếu hoặc thừa nghiệm.'
          }
        ],
        masteryTest: [
          {
            id: 'thpt_m_9',
            question: 'Đạo hàm của hàm số f(t) = e^t + 2t có dấu như thế nào với mọi t thuộc R?',
            options: ['Luôn dương (f\'(t) > 0)', 'Luôn âm', 'Đổi dấu tại t=0', 'Bằng 0'],
            correctAnswer: 0,
            hints: ['e^t > 0 và 2 > 0'],
            explanation: 'f\'(t) = e^t + 2 > 0 với mọi số thực t, do đó f(t) luôn đồng biến trên R.',
            trapAnalysis: 'Không có.'
          }
        ]
      },
      {
        id: `thpt_s10_${Date.now()}`,
        stationNumber: 10,
        stageId: 5,
        stageName: 'Giai đoạn 5: Vinh Danh Thủ Khoa',
        stageFocus: 'Mô phỏng kỳ thi chính thức & Kỷ luật thép phòng thi',
        title: 'Vinh Danh Thủ Khoa: Kỷ Luật Thép Phòng Thi & Cán Mốc 28.5+ Tuyệt Đối',
        subject: 'Toán - KHTN Đỉnh Cao',
        difficulty: 'Vận dụng cao 9+',
        summary: 'Tổng hợp toàn diện năng lực, quản trị cảm xúc và tâm lý phòng thi, mở khóa huy hiệu Kim Cương danh dự.',
        keyFormula: 'Bản lĩnh + Kỷ luật + Năng lực = Thủ khoa kỳ thi',
        status: 'locked',
        xp: 250,
        estimatedMinutes: estMinutes,
        scoreContribution: '+1.0 Điểm',
        outcomes: {
          understand: ['Phong độ của một thủ khoa trong ngày thi chính thức'],
          canDo: ['Giải quyết đề thi đạt 9.6 - 10.0 điểm'],
          keyConcept: 'Kỷ luật và bản lĩnh',
          prerequisites: 'Hoàn thành 9 trạm trước',
          scoreImpact: 'Hiện thực hóa giấc mơ Đại học top 1',
          whyThisStation: 'Trạm cuối cùng đánh dấu sự hoàn thiện toàn diện của bạn.'
        },
        theory: {
          overview: 'Bạn đã đi qua một hành trình nỗ lực bền bỉ và phi thường.',
          deepExplanation: 'Mọi kiến thức, mẹo giải nhanh và bẫy đề thi đều đã nằm trong tầm tay bạn.',
          keyFormulas: [
            { name: 'Công thức vinh quang', formula: 'Tập trung tuyệt đối vào từng con chữ trong 90 phút thi', note: 'Chiến thắng đã ở rất gần' }
          ],
          commonTraps: [
            { trap: 'Mất tập trung ở 10 phút cuối giờ thi', howToAvoid: 'Giữ bút và rà soát từng ô tô cho đến khi có hiệu lệnh nộp bài' }
          ],
          summaryTakeaways: ['Tự hào về sự cố gắng của bản thân', 'Bình tĩnh - Tự tin - Quyết thắng']
        },
        workedExamples: [
          {
            title: 'Tâm thế bước vào phòng thi',
            problem: 'Giữ vững sự tập trung cao độ.',
            level: 'Vận dụng cao 9+',
            patternRecognition: 'Nhìn vào mục tiêu đã đặt ra từ đầu.',
            steps: [
              { stepNum: 1, action: 'Tin vào sự chuẩn bị', explanation: 'Bạn đã hoàn thành đủ mọi trạm học.' },
              { stepNum: 2, action: 'Chiến đấu hết mình', explanation: 'Từng câu hỏi đều là cơ hội ghi điểm.' }
            ],
            finalAnswer: 'Đạt kết quả rực rỡ nhất!',
            verificationTrick: 'Thở đều và mỉm cười tự tin.'
          }
        ],
        practiceQuestions: [
          {
            id: 'thpt_p_10',
            question: 'Điều gì tạo nên sự khác biệt giữa một học sinh đạt 8.0 và một thủ khoa 9.5+?',
            options: [
              'Kỷ luật không để sai câu dễ và bản lĩnh phân tích sắc bén câu khó',
              'Sự may mắn ngẫu nhiên',
              'Học thuộc lòng sách giải',
              'Chỉ cần thông minh bẩm sinh'
            ],
            correctAnswer: 0,
            hints: ['Kỷ luật phòng thi quyết định 80% thành công'],
            explanation: 'Không mất điểm oan và tư duy có phương pháp là chìa khóa của mọi thủ khoa.',
            trapAnalysis: 'Chủ quan ở câu dễ là lý do lớn nhất khiến học sinh giỏi không chạm tới điểm 9+.'
          }
        ],
        masteryTest: [
          {
            id: 'thpt_m_10',
            question: 'Bạn đã sẵn sàng để chinh phục kỳ thi mục tiêu cùng EduAdvisor AI chưa?',
            options: [
              'Sẵn sàng 100%, tự tin bứt phá!',
              'Vẫn chưa sẵn sàng',
              'Cần thêm thời gian',
              'Chưa biết'
            ],
            correctAnswer: 0,
            hints: ['Hành trình vạn dặm bắt đầu từ một bước chân!'],
            explanation: 'Chúc bạn có một kỳ thi thành công rực rỡ và đỗ nguyện vọng 1!',
            trapAnalysis: 'Không có.'
          }
        ]
      }
    ];
  }

  // =========================================================================
  // CẮT ĐÚNG TARGETCOUNT TRẠM (5 TRẠM, 7 TRẠM HOẶC 10 TRẠM) THEO QUY MÔ
  // =========================================================================
  const sliced = rawStations.slice(0, targetCount);

  return sliced.map((node, idx) => {
    // Phân bổ Giai đoạn (Stage) khoa học theo số lượng trạm
    const currentStageId = Math.min(4, Math.floor((idx / targetCount) * 4) + 1);
    let stageName = `Giai đoạn ${currentStageId}: `;
    if (idx === 0) {
      stageName += 'Chẩn đoán & Vá Lỗ Hổng Nền Tảng';
    } else if (idx < Math.floor(targetCount * 0.4)) {
      stageName += 'Củng cố Nền Tảng Cốt Lõi';
    } else if (idx < Math.floor(targetCount * 0.7)) {
      stageName += 'Nâng Cao Chuyên Đề & Bắt Bẫy Đề Thi';
    } else if (idx < targetCount - 1) {
      stageName += 'Đột Phá Vận Dụng Cao';
    } else {
      stageName += 'Tổng Ôn Thực Chiến Cán Đích';
    }

    return {
      ...node,
      stationNumber: idx + 1,
      stageId: currentStageId,
      stageName,
      status: idx === 0 ? ('active' as const) : ('locked' as const)
    };
  });
}
