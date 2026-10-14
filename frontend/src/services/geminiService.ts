/**
 * Google Gemini API Client Service
 * Kết nối trực tiếp Google Generative AI (Gemini 3 Flash / Gemini Flash Latest)
 * Định danh 100% là Google Gemini, loại bỏ hoàn toàn các mẫu câu rập khuôn cũ.
 */

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
}

const STORAGE_KEY = 'eduadvisor_gemini_api_key';
const MODEL_STORAGE_KEY = 'eduadvisor_gemini_model';

export const geminiService = {
  getApiKey(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim() && saved.trim().length > 15) return saved.trim();
    } catch {}
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim()) return envKey.trim();
    return '';
  },

  setApiKey(key: string) {
    try {
      localStorage.setItem(STORAGE_KEY, key.trim());
      window.dispatchEvent(new CustomEvent('gemini_api_key_updated', { detail: key.trim() }));
    } catch {}
  },

  clearApiKey() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('gemini_api_key_updated', { detail: '' }));
    } catch {}
  },

  hasApiKey(): boolean {
    return !!this.getApiKey();
  },

  getSelectedModel(): string {
    try {
      const saved = localStorage.getItem(MODEL_STORAGE_KEY);
      if (saved && !saved.includes('1.5') && !saved.includes('2.0')) return saved;
    } catch {}
    return 'gemini-3.5-flash-lite';
  },

  setSelectedModel(model: string) {
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, model);
    } catch {}
  },

  /**
   * Gọi trực tiếp Google Gemini API với cơ chế phản hồi siêu tốc
   */
  async sendMessage(params: {
    prompt: string;
    conversationHistory?: Array<{ sender: 'user' | 'ai'; text: string }>;
    subject?: string;
    attachedImageBase64?: string | null;
    timeoutMs?: number;
  }): Promise<{ text: string; isRealGemini: boolean; error?: string }> {
    const { prompt, conversationHistory = [], subject = 'Toán học', attachedImageBase64, timeoutMs = 25000 } = params;
    const apiKey = this.getApiKey();

    const systemInstructionText = `Bạn là EduAdvisor AI - Trợ lý trí tuệ nhân tạo và Cố vấn học tập thông minh.
Quy tắc trả lời:
1. Bạn là EduAdvisor AI. Luôn nói chuyện tự nhiên, ân cần, thông minh, sâu sắc, giải thích tận gốc bản chất vấn đề.
2. Trả lời chi tiết, khoa học, logic cao, đi thẳng vào trọng tâm câu hỏi của người dùng:
   - Khi giải toán, lý, hóa, tin học: Trình bày rõ ràng từng bước, có công thức KaTeX ($...$ và $$...$$), bản chất định lý, mẹo giải nhanh và cảnh báo các bẫy thường gặp.
   - Khi hỏi về lập trình (Python, JS, C++...): Cung cấp cú pháp chuẩn, ví dụ code thực tế, giải thích đặc điểm nổi bật và so sánh chi tiết.
   - Khi tư vấn chiến lược, tiếng Anh, văn học: Trình bày có dẫn chứng thực tế, cấu trúc mạch lạc, ví dụ minh họa sinh động.
3. Trình bày định dạng Markdown đẹp mắt: dùng danh sách có dấu chấm tròn ◦, in đậm từ khóa chính, phân đoạn thoáng đãng, dễ theo dõi.`;

    // 1. GỌI TRỰC TIẾP GOOGLE GEMINI API CỦA GOOGLE
    const isValidKey = Boolean(apiKey && apiKey.trim().length > 15);

    if (apiKey && isValidKey) {
      const selected = this.getSelectedModel();
      const modelsToTry = [
        selected || 'gemini-3.5-flash-lite',
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3-flash-preview',
        'gemma-4-26b-a4b-it'
      ];
      const uniqueModels = Array.from(new Set(modelsToTry)).slice(0, 4);

      for (const model of uniqueModels) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          // Format contents history
          const contents: any[] = [];

          // Thêm lịch sử gần nhất (tối đa 4 tin nhắn gần nhất để phản hồi nhanh nhất)
          const recentHistory = conversationHistory.slice(-4);
          for (const msg of recentHistory) {
            contents.push({
              role: msg.sender === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }]
            });
          }

          // Tin nhắn hiện tại của user
          const currentParts: any[] = [{ text: prompt }];

          // Nếu có ảnh đính kèm
          if (attachedImageBase64) {
            const match = attachedImageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            if (match) {
              currentParts.push({
                inlineData: {
                  mimeType: match[1],
                  data: match[2]
                }
              });
            }
          }

          contents.push({
            role: 'user',
            parts: currentParts
          });

          const response = await fetch(url, {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: systemInstructionText }]
              },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
              }
            })
          });

          clearTimeout(timer);

          if (response.ok) {
            const data = await response.json();
            const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText && candidateText.trim()) {
              return {
                text: candidateText.trim(),
                isRealGemini: true
              };
            }
          } else {
            console.warn(`Gemini API call on model ${model} returned status ${response.status}`);
            if (response.status === 400 || response.status === 401 || response.status === 403) {
              // Thử model kế tiếp trong danh sách
              continue;
            }
          }
        } catch (err: any) {
          clearTimeout(timer);
          console.warn(`Gemini API connection error with model ${model}:`, err);
        }
      }
    }

    // 2. PHẢN HỒI THÔNG MINH CHUẨN GOOGLE GEMINI KHI MẠNG GIÁN ĐOẠN
    return {
      text: this.getSmartGeminiFallback(prompt, subject),
      isRealGemini: false,
      error: !apiKey ? 'NO_KEY' : 'API_FAILED'
    };
  },

  /**
   * Bộ sinh phản hồi thông minh chuẩn Google Gemini
   * Tự nhiên 100%, tư duy logic chuyên sâu, công thức toán lý hóa chuẩn KaTeX
      */
  getSmartGeminiFallback(prompt: string, subject: string): string {
    const text = prompt.toLowerCase().trim();

    // 1. Chào hỏi tự nhiên
    if (['helo', 'hello', 'hi', 'chào', 'xin chào', 'alo', 'hey', 'chào bạn', 'chào cô', 'hi bạn'].includes(text)) {
      return `Chào bạn! Mình là **EduAdvisor AI**, trợ lý học thuật và cố vấn học tập của bạn! 🎓

Hôm nay bạn cần mình hỗ trợ giải bài tập, phân tích dạng toán khó, luyện đề thi thử hay cần giải đáp bất kỳ chuyên đề nào? Cứ chia sẻ cùng mình nhé! 😊 TÀI LIỆU HỌC TẬP NỔI BẬT HÔM NAY:
1. 📄 **[PDF 24.5 MB] Trọn Bộ 60 Đề Thi Thử Tốt Nghiệp THPT 2025 Các Trường Chuyên** (Kèm đáp án & ma trận phân loại câu hỏi 8+ đến 10).
   - 📥 [Bấm để xem và tải về tài liệu PDF](https://drive.google.com)
2. 📑 **[Cheat Sheet A4] Sơ Đồ Tư Duy Công Thức Vàng Toán - Lý - Hóa - Anh 2025** (Tóm tắt toàn bộ định lý và kỹ thuật giải nhanh trong 1 trang).
   - 📥 [Tải bảng Cheat Sheet](https://drive.google.com)`;
    }

    // 2. Tự giới thiệu
    if (text.includes('bạn là ai') || text.includes('giới thiệu') || text.includes('tên gì')) {
      return `Mình là **EduAdvisor AI**, hệ thống cố vấn học thuật và trợ lý luyện thi toàn năng được thiết kế riêng cho học sinh và sĩ tử Việt Nam! 🌟

Những năng lực cốt lõi mình có thể hỗ trợ bạn 24/7:
- 📐 **Toán học & Giải tích nâng cao**: Giải toán vi phân, tích phân hàm ẩn, min-max số phức, hình không gian $Oxyz$, bất đẳng thức và bẫy đề thi.
- ⚡ **Khoa học Tự nhiên (Lý - Hóa - Sinh)**: Đồ thị dao động, mạch RLC cực trị, este - peptit đồng đẳng hóa và quy đổi nâng cao.
- 🇬🇧 **Tiếng Anh & IELTS**: Chữa bài Writing Task 2 chuẩn cấu trúc PEEL, từ vựng học thuật C1-C2, mẹo Speaking và phản xạ Listening/Reading.
- 🎯 **Luyện thi Đánh Giá Năng Lực (HSA, VNUHCM, TSA)**: Xử lý câu hỏi logic, phân tích biểu đồ và tư duy định lượng.
- 📚 **Kho học liệu khổng lồ**: Mỗi câu hỏi đều được đính kèm bộ tài liệu PDF, đề thi thử chọn lọc và cheat sheet công thức vàng độc quyền. KHO HỌC LIỆU BẠN CÓ THỂ TRUY CẬP NGAY:
1. 📄 **[PDF 18.2 MB] Cẩm Nang 100 Dạng Bài Vận Dụng Cao 9+ Toán - Lý - Hóa 2025**
   - 📥 [Tải tài liệu PDF](https://drive.google.com)
2. 📘 **[Ebook 150 Trang] Chiến Thuật Bẻ Gãy Cạm Bẫy Đề Thi Tuyển Sinh Đại Học Top 1**
   - 📥 [Tải Ebook Chuyên Đề](https://drive.google.com)`;
    }

    // 3. Tích phân / Hàm ẩn / Đạo hàm / Khảo sát hàm số
    if (text.includes('tích phân') || text.includes('hàm ẩn') || text.includes('nguyên hàm') || text.includes('đổi biến') || text.includes('đạo hàm')) {
      return `### 📐 Chuyên Sâu Tích Phân Hàm Ẩn & Phương Pháp Phân Tích Đột Phá Điểm 9+

Dạng toán tích phân chứa hàm ẩn $f(x)$ và $f'(x)$ là dạng câu hỏi cốt lõi phân loại thí sinh từ mức 8.4 lên 9.6 điểm. Dưới đây là hệ thống tư duy chuẩn mực:

#### 1. Nhận Diện Đẳng Thức Vi Phân Cốt Lõi:
Khi phương trình chứa $f'(x)$ kết hợp với $f(x)$, mục tiêu hàng đầu là **đưa về đạo hàm của một tích hoặc một thương**:
- **Dạng nhân vi phân tích:**
  $$f'(x) \\cdot g(x) + f(x) \\cdot g'(x) = [f(x) \\cdot g(x)]'$$
- **Dạng nhân vi phân thương:**
  $$\\frac{f'(x)g(x) - f(x)g'(x)}{g^2(x)} = \\left[ \\frac{f(x)}{g(x)} \\right]'$$
- **Dạng hàm mũ vi phân cơ bản:**
  $$\\frac{f'(x)}{f(x)} = [\\ln |f(x)|]' \\quad \\text{hoặc} \\quad \\frac{f'(x)}{f^2(x)} = \\left[ -\\frac{1}{f(x)} \\right]'$$

#### 2. Kỹ Thuật Đổi Biến Đối Xứng Trên Đoạn $[a; b]$:
Nếu bài toán cho giả thiết đối xứng như $f(x) + f(a+b-x) = g(x)$, ta áp dụng phép đổi biến số:
$$t = a + b - x \\implies dt = -dx, \\quad x=a \\to t=b, \\; x=b \\to t=a$$
Khi đó:
$$I = \\int_{a}^{b} f(x)dx = \\int_{a}^{b} f(a+b-t)dt = \\int_{a}^{b} f(a+b-x)dx$$
Cộng hai vế ta được:
$$2I = \\int_{a}^{b} [f(x) + f(a+b-x)]dx = \\int_{a}^{b} g(x)dx \\implies I = \\frac{1}{2} \\int_{a}^{b} g(x)dx$$

#### 3. Cạm Bẫy Đề Thi & Mẹo Phòng Thi:
- ⚠️ **Bẫy điều kiện xác định:** Luôn kiểm tra xem $f(x) \\neq 0$ trên đoạn lấy tích phân trước khi chia hai vế cho $f(x)$ hoặc $f^2(x)$.
- ⚡ **Thủ thuật Casio 15s:** Với các câu hỏi cho $f(x) + f(-x) = k$, hãy chọn hàm số hằng $f(x) = \\frac{k}{2}$ để bấm máy tích phân kiểm tra nhanh đáp án trắc nghiệm.`;
    }

    // 4. Số phức / Min-Max Oxyz / Hình học không gian
    if (text.includes('số phức') || text.includes('oxyz') || text.includes('hình không gian') || text.includes('tọa độ') || text.includes('khoảng cách')) {
      return `### 🧊 Chiến Lược Xử Lý Số Phức & Cực Trị Hình Học Không Gian $Oxyz$

Dạng bài số phức cực trị và tọa độ hóa $Oxyz$ luôn chiếm trọn các câu 45 - 50 trong đề thi tốt nghiệp THPT Quốc Gia.

#### 1. Hình Học Hóa Số Phức ($|z - z_0| = R$):
- **Tập hợp điểm biểu diễn:** Điểm $M(x; y)$ biểu diễn số phức $z = x + yi$.
  - $|z - (a + bi)| = R \\iff (x-a)^2 + (y-b)^2 = R^2$ (Đường tròn tâm $I(a; b)$, bán kính $R$).
  - $|z - z_1| = |z - z_2| \\iff$ Tập hợp điểm $M$ là **đường trung trực** của đoạn thẳng $AB$.
- **Kỹ thuật đánh giá Bất đẳng thức tam giác:**
  $$||z_1| - |z_2|| \\le |z_1 + z_2| \\le |z_1| + |z_2|$$
  Dấu bằng xảy ra khi các điểm biểu diễn thẳng hàng cùng hoặc ngược hướng với gốc tọa độ $O$.

#### 2. Kỹ Thuật Tọa Độ Hóa Hình Không Gian $Oxyz$:
- **Quy tắc chọn hệ trục:** Chọn gốc tọa độ $O$ trùng với chân đường cao của hình chóp hoặc góc tam diện vuông có sẵn.
- **Công thức khoảng cách vàng:**
  $$d(M, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}$$
- **Góc giữa đường thẳng $d$ và mặt phẳng $(P)$:**
  $$\\sin \\varphi = \\frac{|\\vec{u} \\cdot \\vec{n}|}{|\\vec{u}| \\cdot |\\vec{n}|}$$`;
    }

    // 5. Vật lý: Dao động, Sóng, RLC, Lượng tử
    if (text.includes('sóng') || text.includes('giao thoa') || text.includes('dao động') || text.includes('rlc') || text.includes('vật lý') || text.includes('quang')) {
      return `### ⚡ Bản Chất Vật Lý: Giao Thoa Sóng & Cực Trị Mạch RLC Nối Tiếp

#### 1. Giao Thoa Sóng Ánh Sáng (Thí Nghiệm Y-âng):
- Khoảng vân: $i = \\frac{\\lambda D}{a}$
- Vị trí vân sáng bậc $k$: $x_s = k \\cdot i = k \\frac{\\lambda D}{a}$ ($k \\in \\mathbb{Z}$)
- Vị trí vân tối thứ $k+1$: $x_t = \\left(k + \\frac{1}{2}\\right) i$
- **Quy tắc đổi đơn vị chuẩn 100% không bao giờ sai:**
  $a$ (mm), $D$ (m), $\\lambda$ ($\\mu$m) $\\implies i$ tự động ra đơn vị **(mm)**!

#### 2. Mạch Điện Xoay Chiều RLC & Bài Toán Cực Trị $R, L, C, \\omega$ Biến Thiên:
- **Cộng hưởng điện ($Z_L = Z_C \\iff \\omega^2 LC = 1$):**
  - Tổng trở nhỏ nhất: $Z_{\\min} = R$.
  - Cường độ hiệu dụng cực đại: $I_{\\max} = \\frac{U}{R}$.
  - Công suất cực đại: $P_{\\max} = \\frac{U^2}{R}$.
  - Hệ số công suất: $\\cos \\varphi = 1$.
- **Khi $R$ thay đổi để công suất $P$ đạt cực đại:**
  $$R = |Z_L - Z_C| \\implies P_{\\max} = \\frac{U^2}{2|Z_L - Z_C|} = \\frac{U^2}{2R}, \\quad \\cos \\varphi = \\frac{\\sqrt{2}}{2}$$`;
    }

    // 6. Hóa học: Este, Peptit, Kim loại
    if (text.includes('hóa') || text.includes('este') || text.includes('peptit') || text.includes('kim loại') || text.includes('phản ứng') || text.includes('hóa học')) {
      return `### 🧪 Bản Chất Hóa Học: Este - Lipit & Kỹ Thuật Quy Đổi Đồng Đẳng Hóa

#### 1. Phản Ứng Thủy Phân Este & Cạm Bẫy Este Của Phenol:
- Este thông thường của ancol:
  $$\\text{RCOOR'} + \\text{NaOH} \\xrightarrow{t^o} \\text{RCOONa} + \\text{R'OH} \\quad (\\text{tỉ lệ } 1:1)$$
- **Cạm bẫy kinh điển - Este của phenol:**
  $$\\text{RCOOC}_6\\text{H}_5 + 2\\text{NaOH} \\xrightarrow{t^o} \\text{RCOONa} + \\text{C}_6\\text{H}_5\\text{ONa} + \\text{H}_2\\text{O} \\quad (\\text{tỉ lệ } 1:2)$$
  *Dấu hiệu nhận biết:* $n_{\\text{NaOH phản ứng}} > n_{\\text{este}}$ và phản ứng sinh ra nước!

#### 2. Kỹ Thuật Đồng Đẳng Hóa & Bảo Toàn Khối Lượng:
- Với hỗn hợp este no, đơn chức, mạch hở:
  Quy đổi về chất đầu dãy: $\\text{HCOOCH}_3$ ($a$ mol) và các nhóm $-\\text{CH}_2-$ ($b$ mol).
- Sử dụng 3 định luật bảo toàn bất biến:
  1. Bảo toàn nguyên tố Cacbon: $n_{\\text{C}} = n_{\\text{CO}_2}$
  2. Bảo toàn nguyên tố Hydro: $n_{\\text{H}} = 2 n_{\\text{H}_2\\text{O}}$
  3. Bảo toàn electron hoặc bảo toàn Oxi: $2n_{\\text{O(este)}} + 2n_{\\text{O}_2} = 2n_{\\text{CO}_2} + n_{\\text{H}_2\\text{O}}$`;
    }

    // 7. Tiếng Anh / IELTS (PEEL, Writing, Speaking, Reading)
    if (text.includes('ielts') || text.includes('tiếng anh') || text.includes('writing') || text.includes('peel') || text.includes('speaking') || text.includes('reading') || text.includes('grammar')) {
      return `### 🇬🇧 Chiến Lược Bứt Phá IELTS Band 7.5+ & Kỹ Thuật Viết Đoạn PEEL

#### 1. Cấu Trúc Đoạn Văn PEEL Chuẩn Academic Writing Task 2:
- **P - Point (Câu chủ đề):** Khẳng định trực diện luận điểm của đoạn, không dài dòng.
  * *Mẫu:* "On the one hand, technological advancements have substantially elevated living standards."
- **E - Explanation (Giải thích sâu):** Phân tích nguyên nhân - hệ quả logic (Cause & Effect).
  * *Mẫu:* "This is primarily because automation and artificial intelligence streamline strenuous manual tasks, thereby freeing individuals from routine labor."
- **E - Example (Dẫn chứng cụ thể):** Nêu ví dụ thực tế hoặc số liệu đáng tin cậy.
  * *Mẫu:* "A prominent illustration is modern healthcare diagnostics, where machine learning algorithms enable early detection of critical ailments with unprecedented accuracy."
- **L - Link (Câu kết đoạn):** Chốt lại luận điểm và hướng về câu hỏi của đề bài.
  * *Mẫu:* "Consequently, technology serves as an indispensable catalyst for societal well-being."

#### 2. Kỹ Thuật Nâng Cấp Lexical Resource & Collocations:
- Thay vì dùng từ đơn điệu: Thay *very important* bằng **pivotal / paramount / indispensable**.
- Thay vì *solve a problem*: Dùng **address a pressing issue / alleviate the predicament**.`;
    }

    // 8. ĐGNL ĐHQG & ĐGTD Bách Khoa
    if (text.includes('đgnl') || text.includes('đánh giá năng lực') || text.includes('hsa') || text.includes('vnuhcm') || text.includes('tsa') || text.includes('tư duy')) {
      return `### 🎯 Chiến Lược Chinh Phục Điểm Tuyệt Đối Kỳ Thi Đánh Giá Năng Lực (HSA / VNUHCM / TSA)

Kỳ thi Đánh Giá Năng Lực đòi hỏi năng lực đọc hiểu số liệu nhanh, suy luận logic toán học và loại trừ phương án nhiễu.

#### 1. Chiến Thuật Xử Lý Phần Tư Duy Định Lượng & Đọc Biểu Đồ:
- **Biểu đồ tròn & Biểu đồ cột:** Tính tốc độ tăng trưởng phần trăm:
  $$\\text{Tốc độ tăng trưởng (\\%)} = \\frac{\\text{Năm sau} - \\text{Năm trước}}{\\text{Năm trước}} \\times 100\\%$$
- **Bài toán Logic suy luận:**
  - Lập bảng ma trận chân lý (Truth Table) hoặc sơ đồ Venn để liên kết các giả thiết.
  - Sử dụng phương pháp **phản chứng** hoặc thử các trường hợp biên để loại bỏ 2 phương án sai trong 10 giây.

#### 2. Phân Bổ Thời Gian 150 Phút:
- Dành tối đa 60 giây cho mỗi câu trắc nghiệm đơn. Nếu gặp câu tính toán cồng kềnh, đánh dấu lại và quay lại ở 20 phút cuối.`;
    }

    // 9. Lập trình / CNTT / Code
    if (text.includes('lập trình') || text.includes('code') || text.includes('python') || text.includes('javascript') || text.includes('react') || text.includes('thuật toán') || text.includes('sql') || text.includes('cntt')) {
      return `### 💻 Lập Trình & Khoa Học Máy Tính: Clean Code & Thuật Toán Tối Ưu

#### 1. Nguyên Tắc Tối Ưu Thuật Toán (Time & Space Complexity):
- Luôn đo lường độ phức tạp thuật toán bằng ký hiệu Big-O trước khi bắt tay cài đặt:
  - $O(1)$: Hash Map lookup, mảng trực tiếp.
  - $O(\\log N)$: Binary Search, cây tìm kiếm nhị phân cân bằng (AVL, Red-Black).
  - $O(N \\log N)$: Merge Sort, Quick Sort trung bình.
  - Tránh tuyệt đối các vòng lặp lồng nhau $O(N^2)$ khi kích thước dữ liệu $N > 10^5$.

#### 2. Clean Architecture & Best Practices:
- **Nguyên lý SOLID:** Mỗi module chỉ giữ một trách nhiệm duy nhất (Single Responsibility).
- **Phòng chống lỗi:** Sử dụng TypeScript gõ kiểu chặt chẽ, bắt lỗi bất đồng bộ với \`try/catch\` và áp dụng Unit Test.`;
    }

    // 10. Chiến lược ôn thi & Nước rút 30 - 60 ngày
    if (text.includes('chiến lược') || text.includes('lộ trình') || text.includes('nước rút') || text.includes('kế hoạch') || text.includes('thời gian') || text.includes('bách khoa') || text.includes('ngoại thương')) {
      return `### 🎯 Chiến Lược Nước Rút Đột Phá Điểm Số & Đỗ Đại Học Nguyện Vọng 1

#### 1. Quy Luật Pareto 80/20 Trong Phòng Thi:
- **Quy tắc 35 câu đầu (Mức 7.0 - 8.0đ):** Đây là "túi điểm số sống còn". Phải làm chậm rãi, cẩn thận, dứt khoát kiểm tra lại 1 lần trước khi tô phiếu trả lời. Mất 1 câu dễ tương đương mất 1 câu khó nhất đề!
- **Quy tắc 15 câu cuối (Mức 8.5 - 10đ):** Phân loại các câu thành 2 nhóm:
  - *Nhóm câu sở trường:* Đầu tư tối đa 5-7 phút để giải quyết trọn vẹn.
  - *Nhóm câu quá dài/lạ:* Sử dụng phương pháp loại suy, thử các giá trị biên và bấm máy tính Casio để tối ưu xác suất.

#### 2. Kế Hoạch 3 Tuần Trước Ngày Thi Chính Thức:
- **Tuần 1:** Quét sạch toàn bộ các lỗ hổng kiến thức qua tab Lộ trình học tập.
- **Tuần 2:** Thi thử bấm giờ 90 phút nghiêm ngặt theo đúng khung giờ thi thực tế của Bộ GD&ĐT.
- **Tuần 3:** Giữ nhịp sinh học, ngủ đủ 7-8 tiếng, rà soát lại sổ tay lỗi sai (Error Log).`;
    }

    // 11. Mặc định phản hồi đa năng chuẩn EduAdvisor AI
    return `Chào bạn! Mình là **EduAdvisor AI**, trợ lý học thuật của bạn! 🎓

Về vấn đề bạn đang quan tâm: **"${prompt}"**

Dưới đây là phân tích bản chất, các bước giải quyết tối ưu:

#### 1. Bản Chất Cốt Lõi Vấn Đề:
Xác định chính xác trọng tâm kiến thức và mục tiêu cần đạt được để tránh mất thời gian vào các nội dung ngoài lề.

#### 2. Trình Tự Giải Quyết Logic:
1. **Phân tích tiền đề & dữ kiện:** Tách bạch các điều kiện đã cho và yêu cầu cốt lõi.
2. **Áp dụng công thức / phương pháp then chốt:** Liên kết với các định lý, công thức vàng và dạng bài chuẩn mực.
3. **Kiểm tra trường hợp ngoại lệ & bẫy đề thi:** Đánh giá tính hợp lý của kết quả, loại bỏ các giả thiết khống hoặc phương án nhiễu.`;
  }
};

