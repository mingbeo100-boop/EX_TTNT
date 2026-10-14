import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { 
  Copy, 
  Check, 
  Terminal, 
  Lightbulb, 
  AlertTriangle, 
  Search, 
  Zap, 
  Bookmark, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Eye,
  EyeOff,
  BookOpen
} from 'lucide-react';

interface FormattedMessageProps {
  content: string;
}

// Convert common LaTeX math commands to clean unicode if KaTeX fails
function cleanLatexFallback(tex: string): string {
  return tex
    .replace(/\\lambda/g, 'λ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\pi/g, 'π')
    .replace(/\\theta/g, 'θ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\int/g, '∫')
    .replace(/\\sum/g, '∑')
    .replace(/\\infty/g, '∞')
    .replace(/\\approx/g, '≈')
    .replace(/\\ne/g, '≠')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\in/g, '∈')
    .replace(/\\mathbb\{Z\}/g, 'ℤ')
    .replace(/\\mathbb\{R\}/g, 'ℝ')
    .replace(/\\mathbb\{N\}/g, 'ℕ')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\Leftrightarrow/g, '⇔')
    .replace(/\\to/g, '→')
    .replace(/\\cdot/g, '·')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\quad/g, '   ')
    .replace(/\\,/g, ' ')
    .replace(/\\/g, '');
}

function renderMath(tex: string, displayMode: boolean = false): React.ReactNode {
  const cleanTex = tex.trim();
  if (!cleanTex) return null;

  try {
    const html = katex.renderToString(cleanTex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true
    });

    if (displayMode) {
      return (
        <div 
          className="my-3 py-2.5 px-3.5 rounded-2xl bg-slate-900 text-sky-200 border border-slate-800 shadow-xs overflow-x-auto text-center font-mono text-xs sm:text-sm scrollbar-thin scrollbar-thumb-slate-700"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    return (
      <span 
        className="inline-block px-1 py-0.5 font-mono text-blue-700 font-semibold align-baseline text-[11px] sm:text-xs"
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    );
  } catch {
    const fallback = cleanLatexFallback(cleanTex);
    return displayMode ? (
      <div className="my-2.5 p-2.5 rounded-2xl bg-slate-900 text-amber-300 font-mono text-xs sm:text-sm text-center border border-slate-800">
        {fallback}
      </div>
    ) : (
      <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[11px] sm:text-xs font-semibold">
        {fallback}
      </span>
    );
  }
}

function parseInlineFormatting(text: string): React.ReactNode[] {
  // Regex: matches block math $$...$$, inline math $...$, code `...`, bold **...**, italic *...*
  const regex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$|`[^`]+?`|\*\*[^*]+?\*\*|\*[^*]+?\*)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Block math $$...$$ inside inline text
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const tex = part.slice(2, -2).trim();
      return <React.Fragment key={idx}>{renderMath(tex, true)}</React.Fragment>;
    }

    // Inline math $...$
    if (part.startsWith('$') && part.endsWith('$')) {
      const tex = part.slice(1, -1).trim();
      return <React.Fragment key={idx}>{renderMath(tex, false)}</React.Fragment>;
    }

    // Inline code `...`
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1);
      return (
        <code key={idx} className="bg-slate-100 text-blue-700 font-mono text-[11px] sm:text-xs px-2 py-0.5 rounded-md border border-slate-200 font-medium mx-0.5">
          {code}
        </code>
      );
    }

    // Bold **...**
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={idx} className="font-semibold text-slate-900">{parseInlineFormatting(boldText)}</strong>;
    }

    // Italic *...*
    if (part.startsWith('*') && part.endsWith('*')) {
      const italicText = part.slice(1, -1);
      return <em key={idx} className="italic text-slate-600">{italicText}</em>;
    }

    return <span key={idx} className="text-slate-800">{part}</span>;
  });
}

// Code Block Component with Copy feature
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-slate-700/80 overflow-hidden bg-slate-900 shadow-md">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-800/90 border-b border-slate-700 text-[11px] text-slate-300 font-mono">
        <span className="flex items-center gap-1.5 font-semibold text-sky-400">
          <Terminal className="w-3.5 h-3.5" />
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Đã sao chép' : 'Sao chép'}
        </button>
      </div>
      <pre className="p-3.5 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
        {code}
      </pre>
    </div>
  );
};

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content }) => {
  const [collapsedSteps, setCollapsedSteps] = useState<Record<string, boolean>>({});
  const [showSummaryOnly, setShowSummaryOnly] = useState(false);
  const [allCollapsed, setAllCollapsed] = useState(false);

  if (!content) return null;

  try {
    // 1. Pre-process multi-line code blocks and multi-line block math
    const blocks: Array<{ 
      type: 'code' | 'math' | 'text'; 
      lang?: string; 
      content: string;
      isStepHeader?: boolean;
      stepNum?: string;
      stepTitle?: string;
      parentStepNum?: string | null;
    }> = [];
    const lines = content.split('\n');
    let inCodeBlock = false;
    let codeLang = '';
    let codeBuffer: string[] = [];

    let inMathBlock = false;
    let mathBuffer: string[] = [];

    let currentStepNum: string | null = null;
    const detectedSteps: Array<{ num: string; title: string }> = [];
    let extractedSummary = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check code block ```
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          blocks.push({ type: 'code', lang: codeLang, content: codeBuffer.join('\n'), parentStepNum: currentStepNum });
          inCodeBlock = false;
          codeLang = '';
          codeBuffer = [];
        } else {
          inCodeBlock = true;
          codeLang = trimmed.slice(3).trim();
          codeBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Check standalone multi-line $$ block
      if (trimmed === '$$') {
        if (inMathBlock) {
          blocks.push({ type: 'math', content: mathBuffer.join('\n'), parentStepNum: currentStepNum });
          inMathBlock = false;
          mathBuffer = [];
        } else {
          inMathBlock = true;
          mathBuffer = [];
        }
        continue;
      }

      // Check single-line $$...$$
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 2) {
        blocks.push({ type: 'math', content: trimmed.slice(2, -2).trim(), parentStepNum: currentStepNum });
        continue;
      }

      if (inMathBlock) {
        mathBuffer.push(line);
        continue;
      }

      // Detect step header
      const stepMatch = trimmed.match(/^(?:###\s*)?(?:\*\*)?(Bước|Step)\s*(\d+)[:\.]?(?:\*\*)?\s*(.*)$/i);
      if (stepMatch) {
        currentStepNum = stepMatch[2];
        const cleanTitle = stepMatch[3] ? stepMatch[3].replace(/^\*\*|\*\*$/g, '').trim() : '';
        detectedSteps.push({ num: currentStepNum, title: cleanTitle });
        blocks.push({
          type: 'text',
          content: line,
          isStepHeader: true,
          stepNum: currentStepNum,
          stepTitle: cleanTitle,
          parentStepNum: currentStepNum
        });
        continue;
      }

      // Extract quick summary candidate if not already found
      if (!extractedSummary && (trimmed.startsWith('💡') || trimmed.startsWith('🎯') || /^(?:Phương pháp|Tóm tắt|Ý tưởng|Nhận xét)[:\-]/i.test(trimmed))) {
        extractedSummary = trimmed.replace(/^[\s💡🎯*\-]+/, '').replace(/^(?:Phương pháp|Tóm tắt|Ý tưởng|Nhận xét)[:\-]/i, '').trim();
      }

      // Regular line
      blocks.push({ type: 'text', content: line, parentStepNum: currentStepNum });
    }

    // Flush unclosed buffers during streaming
    if (inCodeBlock && codeBuffer.length > 0) {
      blocks.push({ type: 'code', lang: codeLang, content: codeBuffer.join('\n'), parentStepNum: currentStepNum });
    }
    if (inMathBlock && mathBuffer.length > 0) {
      blocks.push({ type: 'math', content: mathBuffer.join('\n'), parentStepNum: currentStepNum });
    }

    // Toggle collapse for all detected steps
    const handleToggleAll = () => {
      const nextState = !allCollapsed;
      setAllCollapsed(nextState);
      const newMap: Record<string, boolean> = {};
      detectedSteps.forEach(s => {
        newMap[s.num] = nextState;
      });
      setCollapsedSteps(newMap);
    };

    // Toggle single step collapse
    const handleToggleStep = (num: string) => {
      setCollapsedSteps(prev => ({
        ...prev,
        [num]: !prev[num]
      }));
    };

    return (
      <div className="space-y-3 font-sans text-slate-800 text-sm sm:text-base leading-relaxed antialiased">
        {/* Step Navigation & Quick Takeaway Toolbar (Only if response has steps) */}
        {detectedSteps.length > 1 && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs mb-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Quy trình giải {detectedSteps.length} bước</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowSummaryOnly(!showSummaryOnly)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 ${
                    showSummaryOnly 
                      ? 'bg-amber-600 text-white shadow-xs' 
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>{showSummaryOnly ? 'Xem đầy đủ' : 'Tóm tắt 15s'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold text-[11px] transition-colors shadow-xs"
                >
                  {allCollapsed ? 'Mở rộng tất cả' : 'Thu gọn các bước'}
                </button>
              </div>
            </div>

            {/* Quick Summary Takeaway Card */}
            {(showSummaryOnly || extractedSummary) && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cốt lõi phương pháp:</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {extractedSummary || 'Nắm vững bản chất phương pháp, khử ẩn bằng đối xứng và áp dụng tích phân từng phần để tối ưu thời gian giải.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* If user selected Show Summary Only, hide long body */}
        {!showSummaryOnly && blocks.map((block, bIdx) => {
          // If this block belongs to a collapsed step, hide it unless it is the step header itself!
          if (block.parentStepNum && !block.isStepHeader && collapsedSteps[block.parentStepNum]) {
            return null;
          }

          if (block.type === 'code') {
            return <CodeBlock key={bIdx} language={block.lang || 'python'} code={block.content} />;
          }

          if (block.type === 'math') {
            return <React.Fragment key={bIdx}>{renderMath(block.content, true)}</React.Fragment>;
          }

          const line = block.content;
          const trimmed = line.trim();

          if (!trimmed) {
            return <div key={bIdx} className="h-1.5" />;
          }

          // Step header rendering with collapsible button
          if (block.isStepHeader && block.stepNum) {
            const isStepCollapsed = !!collapsedSteps[block.stepNum];

            return (
              <div 
                key={bIdx} 
                onClick={() => handleToggleStep(block.stepNum!)}
                className="my-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 shadow-xs cursor-pointer select-none transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[11px] shadow-xs tracking-wide">
                      BƯỚC {block.stepNum}
                    </span>
                    {block.stepTitle && (
                      <span className="font-bold text-xs sm:text-sm text-slate-900 font-sans">
                        {parseInlineFormatting(block.stepTitle)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                    <span>{isStepCollapsed ? 'Mở chi tiết' : 'Thu gọn'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isStepCollapsed ? '' : 'rotate-180'}`} />
                  </div>
                </div>
              </div>
            );
          }

          // Special highlight tags: "Lưu ý:", "Bẫy đề thi:", "Công thức:", "Phương pháp giải:"
          if (trimmed.match(/^(?:\*\*)?(Lưu ý quan trọng|Bẫy đề thi|Bẫy cần tránh|Sai lầm thường gặp|Mẹo giải nhanh|Phương pháp cốt lõi|Ghi nhớ|Công thức chốt)(?:\*\*)?[:\-]/i)) {
            const labelMatch = trimmed.match(/^(?:\*\*)?([^:\-]+)(?:\*\*)?[:\-]\s*(.*)$/);
            const label = labelMatch ? labelMatch[1].trim() : 'Lưu ý';
            const body = labelMatch ? labelMatch[2].trim() : '';
            const isTrap = /bẫy|sai lầm/i.test(label);
            const isFormula = /công thức|mẹo/i.test(label);

            return (
              <div 
                key={bIdx} 
                className={`my-3 p-3.5 rounded-2xl border flex items-start gap-3 shadow-xs ${
                  isTrap 
                    ? 'bg-amber-50 border-amber-200 text-amber-950' 
                    : isFormula
                    ? 'bg-purple-50 border-purple-200 text-purple-950'
                    : 'bg-blue-50 border-blue-200 text-blue-950'
                }`}
              >
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 mt-0.5 tracking-wider ${
                  isTrap ? 'bg-amber-100 text-amber-800 border border-amber-300' : isFormula ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  {label}
                </span>
                <div className="flex-1 font-medium leading-relaxed text-xs sm:text-sm text-slate-800">
                  {parseInlineFormatting(body)}
                </div>
              </div>
            );
          }

          // Horizontal rule
          if (trimmed === '---' || trimmed === '***') {
            return <hr key={bIdx} className="my-3 border-t border-slate-200" />;
          }

          // Header 1 (# ...)
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={bIdx} className="text-lg sm:text-xl font-bold text-slate-900 mt-5 mb-2.5 pb-2 border-b border-slate-200 font-sans tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{parseInlineFormatting(trimmed.slice(2))}</span>
              </h1>
            );
          }

          // Header 2 (## ...)
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={bIdx} className="text-base sm:text-lg font-bold text-slate-900 mt-4 mb-2 flex items-center gap-2 font-sans">
                <span className="w-1.5 h-4 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full inline-block shrink-0" />
                <span className="text-slate-900">{parseInlineFormatting(trimmed.slice(3))}</span>
              </h2>
            );
          }

          // Header 3 (### ...) - Gemini Section Style
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={bIdx} className="text-base sm:text-lg font-bold text-slate-900 mt-4 mb-2 flex items-center gap-2 font-sans">
                <span>{parseInlineFormatting(trimmed.slice(4))}</span>
              </h3>
            );
          }

          // Callout card (starts with 💡, ⚠️, 🔍, ⚡, 📌, 🎯)
          const calloutMatches = ['💡', '⚠️', '🔍', '⚡', '📌', '🎯'];
          const matchedCallout = calloutMatches.find(c => trimmed.startsWith(c));
          if (matchedCallout) {
            const rest = trimmed.slice(matchedCallout.length).trim();
            const isWarning = matchedCallout === '⚠️';
            const isIdea = matchedCallout === '💡';
            const isZap = matchedCallout === '⚡';
            const isTarget = matchedCallout === '🎯';

            return (
              <div 
                key={bIdx} 
                className={`my-3 p-3.5 rounded-2xl border flex items-start gap-3 shadow-xs ${
                  isWarning 
                    ? 'bg-amber-50 border-amber-200 text-amber-950' 
                    : isIdea 
                    ? 'bg-blue-50 border-blue-200 text-blue-950'
                    : isZap
                    ? 'bg-purple-50 border-purple-200 text-purple-950'
                    : isTarget
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span className="text-lg shrink-0 leading-none mt-0.5">
                  {matchedCallout}
                </span>
                <div className="flex-1 font-medium leading-relaxed text-xs sm:text-sm text-slate-800">
                  {parseInlineFormatting(rest)}
                </div>
              </div>
            );
          }

          // Numbered list (1. , 2. , 1) , 2) )
          const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
          if (numMatch) {
            const num = numMatch[1];
            const rest = numMatch[2];
            return (
              <div key={bIdx} className="flex items-start gap-3 pl-1 py-1 group">
                <span className="text-blue-600 font-bold text-sm shrink-0 min-w-[1.2rem]">
                  {num}.
                </span>
                <div className="flex-1 leading-relaxed text-slate-800">
                  {parseInlineFormatting(rest)}
                </div>
              </div>
            );
          }

          // Bullet list (- , * , • , ◦ ) - Exact Google Gemini Style with ◦
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ') || trimmed.startsWith('◦ ')) {
            const bulletContent = trimmed.replace(/^[-*•◦]\s+/, '');
            return (
              <div key={bIdx} className="flex items-start gap-3 pl-1 py-1">
                <span className="text-blue-600 font-bold text-sm leading-snug shrink-0 select-none">◦</span>
                <div className="flex-1 leading-relaxed text-slate-800">
                  {parseInlineFormatting(bulletContent)}
                </div>
              </div>
            );
          }

          // Blockquote (> ...)
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={bIdx} className="border-l-4 border-blue-500 pl-4 py-2.5 my-2.5 bg-blue-50/60 rounded-r-2xl text-slate-700 italic text-xs sm:text-sm leading-relaxed">
                {parseInlineFormatting(trimmed.slice(2))}
              </blockquote>
            );
          }

          // Regular paragraph
          return (
            <div key={bIdx} className="leading-relaxed text-slate-800 py-1">
              {parseInlineFormatting(line)}
            </div>
          );
        })}
      </div>
    );
  } catch (err) {
    console.error('FormattedMessage rendering fallback:', err);
    return (
      <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 leading-relaxed">
        {content}
      </div>
    );
  }
};

export default FormattedMessage;
