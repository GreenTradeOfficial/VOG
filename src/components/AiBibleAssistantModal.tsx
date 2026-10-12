import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  BookOpen,
  Heart,
  X,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  MessageSquare,
  Compass,
  ArrowRight,
  Shield,
  Bot,
} from 'lucide-react';
import { VogLogo } from './VogLogo';
import { askAiBibleAssistant, AiChatMessage } from '../services/aiAssistantService';

interface AiBibleAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const QUICK_PROMPTS = [
  '🕊️ Guide me in praying for healing & strength',
  '📖 Explain 1 Corinthians 2:9–10 (Theme: ACCESS)',
  '💼 Faith declaration for work & financial breakthrough',
  '🛡️ Scripture verses for overcoming fear and anxiety',
  '✨ What does the Gospel teach about walking in Grace?',
];

export const AiBibleAssistantModal: React.FC<AiBibleAssistantModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      content: `Grace and peace to you in the name of our Lord Jesus Christ! 🕊️

I am the **VOG Bible & Prayer Assistant** for Vessel of Grace Christian Center. I am here to help you:
- Explore and understand Scripture passages
- Craft scripture-grounded prayer points and declarations
- Discover biblical principles of grace, faith, and dominion

*How can I assist your study or prayer life today?*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const [input, setInput] = useState<string>(initialPrompt);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInput(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: AiChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await askAiBibleAssistant(text, messages);

      const aiMessage: AiChatMessage = {
        id: 'ai-' + Date.now(),
        role: 'model',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: res.modelUsed,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Could not connect to the Bible Assistant. Please check connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to render markdown-like scripture quote boxes
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-2 leading-relaxed text-xs sm:text-sm">
        {lines.map((line, idx) => {
          if (line.startsWith('>')) {
            // Scripture quotation block
            const cleanQuote = line.replace(/^>\s*/, '');
            return (
              <div
                key={idx}
                className="my-1.5 p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-amber-950 font-serif italic text-xs sm:text-sm"
              >
                {cleanQuote}
              </div>
            );
          }

          if (line.startsWith('### ') || line.startsWith('## ')) {
            return (
              <h4 key={idx} className="font-extrabold text-blue-950 text-sm mt-2 mb-1">
                {line.replace(/^#+\s*/, '')}
              </h4>
            );
          }

          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-2">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span>{line.replace(/^[-*]\s*/, '')}</span>
              </div>
            );
          }

          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          return <p key={idx}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[92vh] max-h-[800px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold font-serif-church">
                  VOG Bible & Prayer Assistant
                </h3>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-300/30 rounded-full">
                  AI Companion
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Scripture insights, prayer suggestions & Christian study guidance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-blue-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pastoral Disclaimer Banner */}
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2 shrink-0">
          <Shield className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="leading-tight">
            <strong>Pastoral Note:</strong> This is an AI study tool, not a human pastor. It does not replace personal pastoral counseling from Senior Pastor West Somina and VOG leadership.
          </p>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-sm space-y-2 ${
                    isUser
                      ? 'bg-blue-900 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75 pb-1 border-b border-current/10">
                    <span className="font-bold">
                      {isUser ? 'You' : 'VOG Bible Guide'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div>{renderMessageContent(msg.content)}</div>

                  {!isUser && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[10px] text-slate-400">
                      <span>Powered by secure VOG AI backend</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 text-blue-900 hover:text-blue-700 font-semibold px-2 py-0.5 rounded hover:bg-slate-100 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-2 text-xs text-slate-600">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-900" />
                <span>Searching Scripture and formulating prayer points...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-bold">Connection Note</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        {messages.length <= 3 && (
          <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Compass className="w-3 h-3" /> Prompts:
            </span>
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 text-xs font-medium transition-colors border border-slate-200 shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about a Bible verse, prayer request, or Christian teaching..."
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 resize-none max-h-28"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white rounded-2xl shadow-lg transition-all active:scale-95 shrink-0 flex items-center justify-center"
              title="Send question to Bible Assistant"
            >
              <Send className="w-5 h-5 text-amber-400" />
            </button>
          </form>

          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Press Enter to send (Shift+Enter for newline)</span>
            <span>Vessel of Grace Christian Center</span>
          </div>
        </div>
      </div>
    </div>
  );
};
