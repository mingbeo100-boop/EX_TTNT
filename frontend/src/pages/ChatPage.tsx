import React, { useState, useEffect, useRef } from 'react';
import { PageType, ChatMessage } from '../types';
import { api } from '../services/api';
import { FormattedMessage } from '../components/FormattedMessage';
import { studySyncService } from '../services/studySyncService';
import { geminiService } from '../services/geminiService';
import { 
  Send, 
  Paperclip, 
  Sparkles, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  PanelLeft, 
  ArrowUp, 
  Volume2, 
  Search, 
  GraduationCap, 
  X, 
  RotateCw,
  Image as ImageIcon,
  BookOpen,
  Atom,
  Languages,
  Compass,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Zap,
  Key,
  Settings,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Pencil,
  ChevronDown
} from 'lucide-react';

interface ChatPageProps {
  initialPrompt?: string;
  onNavigate: (page: PageType, initialPrompt?: string) => void;
}

interface ChatSession {
  id: string;
  title: string;
  subject: string;
  timestamp: string;
  messages: ChatMessage[];
}

interface AiPromptItem {
  id: string;
  category: string;
  subject: string;
  title: string;
  prompt: string;
  icon: React.ElementType;
}

// ============================================================
// KHO CÂU HỎI ĐƯỢC TẠO NÊN NHỜ AI (AI-GENERATED QUESTIONS POOL)
// ============================================================
const AI_QUESTION_POOL: AiPromptItem[] = [
  // Toán học
  {
    id: 'q_math_1',
    category: 'Toán học',
    subject: 'Toán học',
    title: 'Phân biệt đổi biến & từng phần',
    prompt: 'EduAdvisor AI ơi, chỉ mình cách nhận biết nhanh khi nào dùng đổi biến số và khi nào dùng tích phân từng phần trong đề thi trắc nghiệm?',
    icon: BookOpen
  },
  {
    id: 'q_math_2',
    category: 'Toán học',
    subject: 'Toán học',
    title: 'Mẹo cô lập tham số m',
    prompt: 'Làm thế nào để cô lập tham số m nhanh nhất khi giải bài toán khảo sát hàm số bậc ba hoặc bậc bốn?',
    icon: BookOpen
  },
  {
    id: 'q_math_3',
    category: 'Toán học',
    subject: 'Toán học',
    title: 'Cực trị số phức Min - Max 9+',
    prompt: 'Phương pháp hình học giải nhanh bài toán tìm giá trị lớn nhất và nhỏ nhất của môđun số phức |z| dạng đường tròn?',
    icon: BookOpen
  },
  {
    id: 'q_math_4',
    category: 'Toán học',
    subject: 'Toán học',
    title: 'Khoảng cách trong Oxyz 30s',
    prompt: 'Công thức tính nhanh khoảng cách từ một điểm đến mặt phẳng và giữa hai đường thẳng chéo nhau trong không gian Oxyz?',
    icon: BookOpen
  },

  // Vật lý 12
  {
    id: 'q_phy_1',
    category: 'Vật lý 12',
    subject: 'Vật lý 12',
    title: 'Đếm vân cực đại giao thoa',
    prompt: 'Tóm tắt công thức đếm số vân cực đại và cực tiểu trên đoạn nối 2 nguồn sóng cùng pha trong 5 giây.',
    icon: Atom
  },
  {
    id: 'q_phy_2',
    category: 'Vật lý 12',
    subject: 'Vật lý 12',
    title: 'Giản đồ vectơ mạch RLC',
    prompt: 'Mẹo vẽ giản đồ vectơ giải nhanh bài toán mạch RLC nối tiếp có tụ điện C hoặc cuộn cảm L thay đổi để điện áp cực đại.',
    icon: Atom
  },
  {
    id: 'q_phy_3',
    category: 'Vật lý 12',
    subject: 'Vật lý 12',
    title: 'Vòng tròn lượng giác đa trục',
    prompt: 'Cách sử dụng vòng tròn lượng giác để tính nhanh thời gian vật dao động điều hòa từ li độ x1 đến li độ x2.',
    icon: Atom
  },
  {
    id: 'q_phy_4',
    category: 'Vật lý 12',
    subject: 'Vật lý 12',
    title: 'Công suất cực đại Pmax',
    prompt: 'Điều kiện để mạch RLC tiêu thụ công suất cực đại khi R biến thiên và công thức tính nhanh Pmax là gì?',
    icon: Atom
  },

  // Chiến lược ôn thi & Nước rút
  {
    id: 'q_plan_1',
    category: 'Chiến lược ôn thi',
    subject: 'Kế hoạch',
    title: 'Lộ trình nước rút 30 ngày',
    prompt: 'Lập kế hoạch phân bổ thời gian ôn thi nước rút trong 30 ngày cho học sinh Khối A00 nhắm mục tiêu 26 - 28 điểm.',
    icon: Compass
  },
  {
    id: 'q_plan_2',
    category: 'Chiến lược ôn thi',
    subject: 'Kế hoạch',
    title: 'Chiến thuật phòng thi 90 phút',
    prompt: 'Chiến thuật phân bổ thời gian cho đề thi trắc nghiệm 50 câu: Bao nhiêu phút cho 35 câu đầu và xử lý 15 câu cuối như thế nào?',
    icon: Compass
  },
  {
    id: 'q_plan_3',
    category: 'Chiến lược ôn thi',
    subject: 'Kế hoạch',
    title: 'Bí quyết chống mất điểm oan',
    prompt: 'Những cái bẫy đề thi phổ biến nhất khiến học sinh khá giỏi bị mất điểm oan trong đề thi tốt nghiệp THPT Quốc Gia?',
    icon: Compass
  },

  // Tiếng Anh & ĐGNL
  {
    id: 'q_eng_1',
    category: 'Tiếng Anh IELTS',
    subject: 'Tiếng Anh',
    title: 'Cấu trúc thân bài PEEL 7.0+',
    prompt: 'Hướng dẫn cấu trúc một đoạn thân bài PEEL chuẩn mực trong bài thi IELTS Writing Task 2 dạng Discuss Both Views.',
    icon: Languages
  },
  {
    id: 'q_eng_2',
    category: 'Tiếng Anh THPT',
    subject: 'Tiếng Anh',
    title: 'Mẹo phát âm -s và -ed',
    prompt: 'Mẹo nhớ nhanh quy tắc phát âm đuôi -s/es và -ed trong 1 phút để ăn chắc 0.4 điểm trong đề thi tốt nghiệp.',
    icon: Languages
  },
  {
    id: 'q_dgnl_1',
    category: 'ĐGNL ĐHQG',
    subject: 'ĐGNL',
    title: 'Tư duy logic & Đọc biểu đồ',
    prompt: 'Phương pháp giải nhanh các câu hỏi suy luận logic và đọc biểu đồ số liệu trong đề thi Đánh Giá Năng Lực?',
    icon: Sparkles
  }
];

// Hàm lấy ngẫu nhiên câu hỏi từ kho AI
const getRandomQuestions = (count = 4, excludeIds: string[] = []): AiPromptItem[] => {
  const filtered = AI_QUESTION_POOL.filter(q => !excludeIds.includes(q.id));
  const pool = filtered.length >= count ? filtered : AI_QUESTION_POOL;
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Gợi ý câu hỏi tiếp theo do AI tự sinh dựa trên ngữ cảnh & có thể đổi mới
const getContextualFollowUps = (lastMessageText: string, refreshSeed = 0): string[] => {
  const text = lastMessageText.toLowerCase();

  // Khi AI hoặc User vừa chào hỏi
  if (text.includes('helo') || text.includes('hello') || text.includes('chào') || text.includes('hi') || text.includes('rất vui')) {
    const greetingSets = [
      [
        'EduAdvisor ơi, chỉ mình cách học tích phân 9+ với! ✨',
        'Làm thế nào để phân bổ thời gian làm đề thi 50 câu trắc nghiệm?',
        'Có mẹo nào giải nhanh mạch RLC không bạn?'
      ],
      [
        'Giải thích giúp mình phương pháp làm bài Writing Task 2.',
        'Kỳ thi Đánh Giá Năng Lực cần ôn những phần nào trọng tâm?',
        'Cách khắc phục tình trạng hay quên công thức khi vào phòng thi?'
      ],
      [
        'Tạo cho mình một lộ trình học tập bứt phá 30 ngày nhé!',
        'Hướng dẫn mình các dạng toán số phức thường gặp.',
        'Mẹo nhớ công thức lượng giác trong 5 phút.'
      ]
    ];
    return greetingSets[refreshSeed % greetingSets.length];
  }

  // Khi đang thảo luận Toán
  if (text.includes('tích phân') || text.includes('hàm ẩn') || text.includes('toán') || text.includes('hàm số')) {
    const mathSets = [
      [
        'Cho mình một ví dụ bài tập tương tự để luyện tập thử nhé?',
        'Có mẹo bấm máy tính Casio để kiểm tra đáp án không?',
        'Những bẫy phổ biến trong đề thi về dạng này là gì?'
      ],
      [
        'Có phương pháp nào giải nhanh hơn cách tự luận thông thường không?',
        'Nếu đổi điều kiện biên thì bài toán biến đổi như thế nào?',
        'Cho mình xin 1 câu trắc nghiệm mức 8+ vận dụng cao có đáp án.'
      ]
    ];
    return mathSets[refreshSeed % mathSets.length];
  }

  // Khi đang thảo luận Vật lý
  if (text.includes('sóng') || text.includes('giao thoa') || text.includes('vật lý') || text.includes('rlc')) {
    const phySets = [
      [
        'Nếu đổi sang hai nguồn ngược pha thì công thức thay đổi ra sao?',
        'Mẹo nhớ công thức này trong 10 giây là gì?',
        'Dấu hiệu nhận biết bài toán này trong đề thi tốt nghiệp là gì?'
      ],
      [
        'Có cách vẽ giản đồ vectơ nhanh cho bài này không?',
        'Khi nào thì xảy ra hiện tượng cộng hưởng trong mạch?',
        'Cho mình ví dụ đề thi thật các năm trước của dạng này.'
      ]
    ];
    return phySets[refreshSeed % phySets.length];
  }

  // Khi đang thảo luận Tiếng Anh
  if (text.includes('ielts') || text.includes('tiếng anh') || text.includes('writing') || text.includes('peel')) {
    const engSets = [
      [
        'Cho mình một đoạn văn mẫu ngắn áp dụng cấu trúc này nhé.',
        'Các từ nối (linking words) đắt giá để tăng điểm Coherence là gì?',
        'Lỗi sai người học hay mắc nhất ở phần này là gì?'
      ],
      [
        'Cách nâng band điểm từ 6.0 lên 7.5 trong phần này?',
        'Phân biệt các thì hay bị nhầm lẫn trong bài thi.',
        'Cho mình danh sách collocations theo chủ đề này.'
      ]
    ];
    return engSets[refreshSeed % engSets.length];
  }

  const defaultSets = [
    [
      'EduAdvisor AI giải thích chi tiết hơn cho mình được không?',
      'Cho mình một bài tập trắc nghiệm vận dụng dạng này nhé!',
      'Làm thế nào để phản xạ nhanh câu này trong phòng thi?'
    ],
    [
      'Có phương pháp hoặc mẹo tư duy nào khác cho câu này không?',
      'Chỉ ra những lỗi sai phổ biến mà học sinh hay mắc phải.',
      'Tóm tắt lại các ý cốt lõi nhất cần nhớ giúp mình.'
    ]
  ];
  return defaultSets[refreshSeed % defaultSets.length];
};

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 'sess_1',
    title: 'Trò chuyện cùng EduAdvisor AI',
    subject: 'Toán học',
    timestamp: 'Hôm nay',
    messages: [
      {
        id: 'msg_1',
        sender: 'user',
        time: '11:40 AM',
        text: 'Chào EduAdvisor AI! Bạn có thể giúp mình những gì trong học tập?'
      },
      {
        id: 'msg_2',
        sender: 'ai',
        time: '11:41 AM',
        text: 'Chào bạn! Mình là **EduAdvisor AI**, cố vấn học thuật và trợ lý học tập thông minh. Mình sẵn sàng đồng hành cùng bạn để:\n\n- 📐 **Giải đáp bài tập & công thức**: Toán học, Vật lý, Hóa học, Sinh học và Tiếng Anh.\n- 💡 **Phương pháp giải nhanh**: Mẹo làm trắc nghiệm 30s, kỹ thuật loại trừ đáp án, bấm máy tính Casio.\n- 🎯 **Lập lộ trình ôn thi**: Phân bổ thời gian nước rút cho kỳ thi THPT Quốc Gia và Đánh Giá Năng Lực.\n- 📸 **Giải bài qua ảnh**: Bạn có thể gửi ảnh đề bài để mình phân tích và hướng dẫn giải từng bước.\n\nHôm nay bạn có câu hỏi hay bài tập nào cần mình hỗ trợ không? Hãy nhắn cho mình nhé! 😊'
      }
    ]
  }
];

export const ChatPage: React.FC<ChatPageProps> = ({ initialPrompt = '', onNavigate }) => {
  const user = api.getUser();
  const storageKey = `eduadvisor_${user?.id || 'guest'}_clean_gemini_chat_sessions_v5`;

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SESSIONS;
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'sess_1';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Toán học');
  const [inputText, setInputText] = useState(initialPrompt);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  // Gemini API Key State & Modal
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => geminiService.hasApiKey());
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(() => geminiService.getApiKey());
  const [selectedModel, setSelectedModel] = useState<string>(() => geminiService.getSelectedModel());
  const [keySavedToast, setKeySavedToast] = useState<string | null>(null);

  // Danh sách câu hỏi gợi ý do AI tự sinh & có thể tự làm mới
  const [aiQuestions, setAiQuestions] = useState<AiPromptItem[]>(() => getRandomQuestions(4));
  const [isRefreshingPrompts, setIsRefreshingPrompts] = useState(false);

  // Bộ câu hỏi gợi ý tiếp theo trong đoạn chat hiện tại
  const [followUpRefreshCount, setFollowUpRefreshCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const handleScroll = () => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!atBottom);
  };

  const handleEditMessage = (text: string) => {
    setInputText(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  // Lắng nghe thay đổi API Key
  useEffect(() => {
    const handleKeyUpdate = () => {
      setHasApiKey(geminiService.hasApiKey());
    };
    window.addEventListener('gemini_api_key_updated', handleKeyUpdate);
    return () => window.removeEventListener('gemini_api_key_updated', handleKeyUpdate);
  }, []);

  // Lưu sessions
  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
  };

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(false);
    }
  }, [activeSessionId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages.length]);

  // Hỗ trợ khi điều hướng từ trang khác với initialPrompt
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInputText(initialPrompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialPrompt]);

  // Tự động nhận diện intent từ trang lộ trình
  useEffect(() => {
    const intent = studySyncService.getNavigationIntent();
    if (intent) {
      const prompt = intent.initialPrompt || (intent.topicTitle ? `Chào EduAdvisor AI! Mình muốn được hướng dẫn giải các dạng bài trọng tâm về chuyên đề: ${intent.topicTitle} (${intent.subject || 'Toán học'}).` : '');
      if (prompt) {
        setInputText(prompt);
        if (intent.subject) setSelectedSubject(intent.subject);
        if (textareaRef.current) textareaRef.current.focus();
      }
    }
  }, []);

  // Tự động co giãn textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Làm mới câu hỏi AI (Tự đổi bộ câu hỏi mới)
  const handleRefreshAiQuestions = () => {
    setIsRefreshingPrompts(true);
    setTimeout(() => {
      const excludeIds = aiQuestions.map(q => q.id);
      setAiQuestions(getRandomQuestions(4, excludeIds));
      setIsRefreshingPrompts(false);
    }, 250);
  };

  // Tạo đoạn chat mới
  const handleNewChat = () => {
    const newId = 'sess_' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'Đoạn chat mới',
      subject: selectedSubject,
      timestamp: 'Vừa xong',
      messages: []
    };
    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setActiveSessionId(newId);
    setInputText('');
    setAttachedImage(null);
    handleRefreshAiQuestions();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Xóa đoạn chat
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    if (filtered.length === 0) {
      const empty: ChatSession = {
        id: 'sess_' + Date.now(),
        title: 'Đoạn chat mới',
        subject: 'Toán học',
        timestamp: 'Vừa xong',
        messages: []
      };
      saveSessions([empty]);
      setActiveSessionId(empty.id);
    } else {
      saveSessions(filtered);
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
    }
  };

  // Tải ảnh lên
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Lưu API Key
  const handleSaveApiKey = () => {
    geminiService.setApiKey(tempApiKey);
    geminiService.setSelectedModel(selectedModel);
    setHasApiKey(!!tempApiKey.trim());
    setShowApiKeyModal(false);
    setKeySavedToast('✨ Đã lưu cấu hình Google Gemini API thành công!');
    setTimeout(() => setKeySavedToast(null), 3000);
  };

  // GỬI TIN NHẮN: GỌI GOOGLE GEMINI API THỰC SỰ
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content && !attachedImage) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: content,
      ...(attachedImage && {
        homeworkAttachment: {
          title: 'Ảnh đề bài đính kèm',
          ocrText: 'Đang gửi ảnh sang EduAdvisor Vision...',
          confidence: '99%'
        }
      })
    };

    const currentImg = attachedImage;
    setInputText('');
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const isFirstMessage = activeSession.messages.length === 0;
    const updatedTitle = isFirstMessage 
      ? (content.slice(0, 32) + (content.length > 32 ? '...' : '')) 
      : activeSession.title;

    const updatedSessionMessages = [...activeSession.messages, userMsg];
    const updatedSessions = sessions.map(s => 
      s.id === activeSessionId ? { ...s, title: updatedTitle, messages: updatedSessionMessages } : s
    );
    saveSessions(updatedSessions);

    // AI Response Placeholder
    setIsStreaming(true);
    const aiMsgId = 'ai_' + (Date.now() + 1);
    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: ''
    };

    setSessions(prev => prev.map(s => 
      s.id === activeSessionId ? { ...s, messages: [...updatedSessionMessages, aiPlaceholder] } : s
    ));

    try {
      // GỌI TRỰC TIẾP GOOGLE GEMINI API
      const result = await geminiService.sendMessage({
        prompt: content,
        conversationHistory: updatedSessionMessages.map(m => ({
          sender: m.sender as 'user' | 'ai',
          text: m.text
        })),
        subject: selectedSubject,
        attachedImageBase64: currentImg
      });

      const responseText = result.text;

      setSessions(prev => prev.map(s => {
        if (s.id !== activeSessionId) return s;
        const newMsgs = s.messages.map(m => m.id === aiMsgId ? { ...m, text: responseText } : m);
        return { ...s, messages: newMsgs };
      }));
    } catch (err) {
      const fallbackText = geminiService.getSmartGeminiFallback(content, selectedSubject);
      setSessions(prev => prev.map(s => {
        if (s.id !== activeSessionId) return s;
        const newMsgs = s.messages.map(m => m.id === aiMsgId ? { ...m, text: fallbackText } : m);
        return { ...s, messages: newMsgs };
      }));
    } finally {
      setIsStreaming(false);

      // Cập nhật số giờ học
      const u = api.getUser();
      if (u?.profile) {
        u.profile.study_hours = +(Number(u.profile.study_hours || 0) + 0.1).toFixed(1);
        api.setUser(u);
      }
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#$`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full w-full bg-white text-slate-800 font-sans overflow-hidden select-text">
      
      {/* Toast thông báo */}
      {keySavedToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{keySavedToast}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. LEFT SIDEBAR (Clean Slate Theme matching Navbar)          */}
      {/* ============================================================ */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64 sm:w-72' : 'w-0'
        } transition-all duration-300 ease-in-out border-r border-slate-200/90 bg-slate-50/80 flex flex-col shrink-0 overflow-hidden relative`}
      >
        {/* Top: New Chat Button & Collapse */}
        <div className="p-3 border-b border-slate-200/80 flex items-center gap-2 bg-slate-50">
          <button
            onClick={handleNewChat}
            className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-white hover:bg-slate-100/80 border border-slate-200 text-slate-800 font-semibold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Cuộc trò chuyện mới</span>
          </button>
          
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Đóng thanh bên"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Search Chat History */}
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white focus:bg-white text-xs border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 shadow-xs"
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Gần đây
          </div>
          {filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="truncate flex-1 pr-2">
                  <p className="truncate font-medium">{session.title}</p>
                </div>

                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-all cursor-pointer"
                  title="Xóa đoạn chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom User Profile */}
        <div className="p-3 border-t border-slate-200/80 flex items-center justify-between bg-slate-100/70">
          <div 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img 
              src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
              alt="User" 
              className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-xs"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                {user?.full_name || 'Học viên'}
              </p>
              <span className="text-[10px] text-slate-500">Xem hồ sơ</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
            title="Vào Dashboard"
          >
            <GraduationCap className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN CHAT AREA (EduAdvisor White & Slate Theme)          */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-white relative">
        
        {/* Top Header - Matches Navbar styling */}
        <header className="h-14 border-b border-slate-200/80 px-4 flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Mở thanh bên"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* EduAdvisor Logo & Status */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-base tracking-tight">
                  EduAdvisor <span className="text-blue-600 font-extrabold">AI</span>
                </span>
              </div>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center gap-1.5 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>EduAdvisor Live • Tự động trả lời</span>
              </span>
            </div>
          </div>

          {/* Header Controls: Clean Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Bắt đầu đoạn chat mới"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Đoạn chat mới</span>
            </button>
          </div>
        </header>

        {/* Message Stream Container */}
        <div 
          ref={chatScrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth bg-white relative"
        >
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Empty State: Chào mừng cùng EduAdvisor AI */}
            {messages.length === 0 && (
              <div className="py-12 sm:py-20 flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Xin chào, {user?.full_name ? user.full_name.split(' ').pop() : 'bạn'}
                  </span>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-medium text-slate-700">
                  Tôi là EduAdvisor AI, tôi có thể hỗ trợ gì cho bạn hôm nay?
                </h2>

                {/* Header thanh làm mới câu hỏi */}
                <div className="w-full flex items-center justify-between pt-2 px-1 text-xs">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Gợi ý câu hỏi bắt đầu:</span>
                  </span>

                  <button
                    onClick={handleRefreshAiQuestions}
                    disabled={isRefreshingPrompts}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-blue-700 font-semibold text-[11px] transition-all cursor-pointer border border-slate-200 active:scale-95 shadow-xs"
                    title="Đổi sang 4 câu hỏi mới"
                  >
                    <RotateCw className={`w-3 h-3 ${isRefreshingPrompts ? 'animate-spin' : ''}`} />
                    <span>Đổi câu hỏi khác</span>
                  </button>
                </div>

                {/* 4 Prompt Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                  {aiQuestions.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSendMessage(item.prompt)}
                        className="p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/90 hover:border-blue-300 transition-all text-left flex flex-col justify-between group cursor-pointer shadow-xs hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md border border-blue-200/60">
                            {item.category}
                          </span>
                          <IconComp className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-600 mb-1 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.prompt}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Render Messages */}
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';

              return (
                <div key={msg.id} className="space-y-2">
                  <div 
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                  >
                    {/* User Message (Pill on Right with Copy/Edit icons under it) */}
                    {isUser ? (
                      <div className="flex flex-col items-end space-y-1.5 max-w-[85%] sm:max-w-[75%]">
                        <div className="bg-slate-800 text-white px-5 py-3 rounded-3xl text-sm sm:text-base leading-relaxed space-y-2 shadow-sm">
                          {msg.homeworkAttachment && (
                            <div className="p-2 rounded-2xl bg-slate-900 border border-slate-700 text-xs flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-sky-400" />
                              <span className="font-semibold text-sky-200">{msg.homeworkAttachment.title}</span>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>

                        {/* Copy & Edit utility buttons under User Bubble */}
                        <div className="flex items-center gap-2 pr-2 pt-0.5 text-slate-400">
                          <button
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Sao chép câu hỏi"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditMessage(msg.text)}
                            className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Chỉnh sửa câu hỏi"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* EduAdvisor AI Response (Flows directly on clean white background) */
                      <div className="flex gap-3.5 items-start w-full">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
                          <GraduationCap className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-3">
                          {msg.text ? (
                            <FormattedMessage content={msg.text} />
                          ) : (
                            <div className="flex items-center gap-2.5 py-2 text-sm text-slate-500">
                              <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                              <span className="animate-pulse font-medium">EduAdvisor đang suy nghĩ...</span>
                            </div>
                          )}

                          {/* Action buttons under response */}
                          {msg.text && (
                            <div className="pt-2 flex items-center gap-3 text-slate-500 text-xs">
                              <button
                                onClick={() => handleCopy(msg.text, msg.id)}
                                className="hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-100"
                                title="Sao chép câu trả lời"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-[11px] text-emerald-600 font-medium">Đã chép</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span className="text-[11px]">Sao chép</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleSpeak(msg.text)}
                                className="hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-100"
                                title="Đọc to câu trả lời"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Đọc to</span>
                              </button>

                              <button
                                onClick={() => handleSendMessage(messages[index - 1]?.text || 'Giải thích thêm')}
                                className="hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-100"
                                title="Tạo lại câu trả lời"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Tạo lại</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Scroll to Bottom Button */}
        {showScrollBottom && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={() => scrollToBottom(true)}
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shadow-lg cursor-pointer transition-all active:scale-95"
              title="Cuộn xuống dưới"
            >
              <ChevronDown className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. BOTTOM FLOATING DOCK (Clean White Capsule Style)           */}
        {/* ============================================================ */}
        <footer className="p-4 bg-gradient-to-t from-white via-white/95 to-transparent shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            
            {/* Image Preview Chip if attached */}
            {attachedImage && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs mb-1">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium">Đã đính kèm ảnh đề bài</span>
                <button 
                  onClick={() => setAttachedImage(null)}
                  className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input Capsule Bar */}
            <div className="relative flex items-end gap-2 bg-white border border-slate-300 shadow-lg shadow-slate-200/50 rounded-[28px] p-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              
              {/* File Attachment Button */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageSelect} 
                accept="image/*" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
                title="Đính kèm ảnh đề thi / bài tập"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Text Input Area */}
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="Hỏi EduAdvisor bất kỳ điều gì..."
                className="flex-1 max-h-40 py-2 px-1 text-sm sm:text-base bg-transparent text-slate-900 border-0 focus:outline-none resize-none placeholder:text-slate-400 leading-relaxed"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={(!inputText.trim() && !attachedImage) || isStreaming}
                className={`p-2 rounded-full transition-all shrink-0 cursor-pointer ${
                  (inputText.trim() || attachedImage) && !isStreaming
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                title="Gửi tin nhắn (Enter)"
              >
                <ArrowUp className="w-4 h-4 font-bold" />
              </button>
            </div>

            {/* Minimal Disclaimer */}
            <p className="text-[11px] text-center text-slate-400">
              EduAdvisor AI có thể mắc sai sót nhỏ. Hãy kiểm tra lại các công thức và đáp án bài thi quan trọng.
            </p>
          </div>
        </footer>

      </main>

      {/* ============================================================ */}
      {/* 4. MODAL CẤU HÌNH EDUADVISOR AI ENGINE                       */}
      {/* ============================================================ */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Cấu hình EduAdvisor AI
                  </h3>
                  <span className="text-[11px] text-slate-500">Đã nối sẵn với Google Gemini API Engine</span>
                </div>
              </div>

              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  API Key (Google AI Studio)
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Dán mã API Key của bạn vào đây..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono shadow-xs"
                />
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Chưa có API Key?</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Lấy mã tại Google AI Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô hình AI sử dụng</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
                >
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Phản hồi tức thì, mượt mà)</option>
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Thông minh, toàn diện)</option>
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash (Chuyên sâu toán & lập trình)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 text-[11px] leading-relaxed">
                💡 <strong>Tự động kết nối:</strong> Hệ thống đã cài sẵn khóa API Google AI Studio của bạn. Trợ lý luôn tự động kết nối và phản hồi trực tiếp.
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {tempApiKey ? (
                <button
                  type="button"
                  onClick={() => {
                    geminiService.clearApiKey();
                    setTempApiKey('');
                    setHasApiKey(false);
                    setShowApiKeyModal(false);
                    setKeySavedToast('Đã đặt lại khóa API mặc định.');
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Đặt lại mặc định
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  Lưu & Áp Dụng
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
