import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Heart,
  MessageSquare,
  ArrowDown,
  User,
  Trash2,
  Shield,
  Smile,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { LiveChatMessage, LiveChatMessageType } from '../types';
import {
  subscribeToLiveChat,
  sendLiveChatMessage,
  sendQuickAmen,
  deleteLiveChatMessage,
  getSavedWorshipperName,
  saveWorshipperName,
  formatMessageTime,
} from '../services/liveChatService';
import { useChurch } from '../context/ChurchContext';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface LiveChatProps {
  className?: string;
}

export const LiveChat: React.FC<LiveChatProps> = ({ className = '' }) => {
  const { showToast } = useChurch();
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAdminUser(Boolean(user && user.email === 'mehedebaedmond@gmail.com'));
    });
    return unsub;
  }, []);

  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState(getSavedWorshipperName() || '');
  const [isEditingName, setIsEditingName] = useState(!getSavedWorshipperName());
  const [tempName, setTempName] = useState(userName);
  const [activeFilter, setActiveFilter] = useState<'all' | 'amen' | 'prayer_point'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState(false);
  const [selectedType, setSelectedType] = useState<LiveChatMessageType>('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollLockedRef = useRef(true);

  // Quick prayer reactions
  const quickReactions = [
    { label: 'Amen! 🙌', text: 'AMEN & HALLELUJAH! 🙌', type: 'amen' as const },
    { label: 'Hallelujah! 🔥', text: 'HALLELUJAH! The Glory belongs to God! 🔥', type: 'amen' as const },
    { label: 'Praise God! 🕊️', text: 'Praise the Lord for His loving kindness! 🕊️', type: 'praise' as const },
    { label: 'Praying 🙏', text: 'Standing in faith with you in prayer! 🙏', type: 'prayer_point' as const },
  ];

  // Subscribe to Firestore live chat messages
  useEffect(() => {
    setIsConnected(true);
    const unsubscribe = subscribeToLiveChat(
      (newMessages) => {
        setMessages(newMessages);
        setIsConnected(true);

        // Auto-scroll to bottom if user hasn't scrolled up
        if (isAutoScrollLockedRef.current) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 60);
        } else {
          setHasNewMessagesBelow(true);
        }
      },
      (err) => {
        console.warn('Live chat connection interrupted:', err);
        setIsConnected(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Monitor scroll position to determine whether user is looking at history
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 70;
    isAutoScrollLockedRef.current = isNearBottom;

    if (isNearBottom) {
      setHasNewMessagesBelow(false);
    }
  };

  const scrollToBottom = () => {
    isAutoScrollLockedRef.current = true;
    setHasNewMessagesBelow(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveName = (e?: React.FormEvent) => {
    e?.preventDefault();
    const finalName = tempName.trim() || 'Worshipper';
    setUserName(finalName);
    saveWorshipperName(finalName);
    setIsEditingName(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    const currentName = userName.trim() || 'Worshipper';
    const messageToSend = inputText.trim();

    setIsSubmitting(true);
    try {
      await sendLiveChatMessage({
        userName: currentName,
        message: messageToSend,
        type: selectedType,
        isAmen: selectedType === 'amen',
      });

      setInputText('');
      setSelectedType('chat');
      isAutoScrollLockedRef.current = true;
      setHasNewMessagesBelow(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err) {
      console.error('Failed to send live message:', err);
      showToast('Could not send message. Please check internet connection.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReaction = async (reaction: { text: string; type: LiveChatMessageType }) => {
    if (isSubmitting) return;
    const currentName = userName.trim() || 'Worshipper';

    setIsSubmitting(true);
    try {
      await sendQuickAmen(currentName, reaction.text);
      isAutoScrollLockedRef.current = true;
      setHasNewMessagesBelow(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      showToast(`Reaction sent: "${reaction.text.slice(0, 20)}..."`, 'success');
    } catch (err) {
      console.error('Failed to send reaction:', err);
      showToast('Could not send reaction.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteLiveChatMessage(messageId);
      showToast('Message removed by admin.', 'success');
    } catch (err) {
      console.error('Failed to delete message:', err);
      showToast('Failed to delete message.', 'info');
    }
  };

  // Filter messages based on active filter
  const filteredMessages = messages.filter((m) => {
    if (activeFilter === 'amen') return m.isAmen || m.type === 'amen';
    if (activeFilter === 'prayer_point') return m.type === 'prayer_point';
    return true;
  });

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden ${className}`}>
      {/* Chat Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
              Sanctuary Live Chat
            </span>
          </div>

          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
            {messages.length} messages
          </span>
        </div>

        {/* Name pill / edit toggle */}
        <div className="flex items-center gap-1.5">
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Your name"
                className="text-xs px-2 py-1 border border-blue-300 rounded-lg focus:outline-none w-28 bg-white font-medium"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 text-[11px] font-bold bg-blue-900 text-white rounded-lg hover:bg-blue-800"
              >
                Set
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setTempName(userName);
                setIsEditingName(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              title="Click to edit your display name"
            >
              <User className="w-3 h-3 text-blue-800" />
              <span className="max-w-[100px] truncate">{userName || 'Set Name'}</span>
              <span className="text-[9px] text-blue-600 underline">edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Category filter pills */}
      <div className="px-3.5 py-2 border-b border-slate-100 bg-white flex items-center justify-between text-xs gap-1.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('amen')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              activeFilter === 'amen'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Amens 🙌
          </button>
          <button
            onClick={() => setActiveFilter('prayer_point')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              activeFilter === 'prayer_point'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            Prayers 🙏
          </button>
        </div>

        {/* Quick Amen button in header */}
        <button
          onClick={() => handleSendReaction(quickReactions[0])}
          disabled={isSubmitting}
          className="px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1 shrink-0"
        >
          <Sparkles className="w-3 h-3 text-amber-700" />
          <span>Say Amen!</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3.5 space-y-2.5 relative bg-slate-50/40"
      >
        {/* Welcome message pinned */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white text-xs space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-amber-300 text-[11px]">
              <Shield className="w-3.5 h-3.5" />
              Vessel of Grace Sanctuary
            </span>
            <span className="text-[10px] text-blue-200">Official</span>
          </div>
          <p className="text-blue-100 text-[11px] leading-relaxed">
            Welcome to the sanctuary fellowship wall! Type your prayers, amen declarations, and praises to worship together in unity.
          </p>
        </div>

        {/* Empty state */}
        {filteredMessages.length === 0 && (
          <div className="text-center py-8 px-4 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              No {activeFilter !== 'all' ? activeFilter.replace('_', ' ') : ''} messages yet.
            </p>
            <p className="text-[11px] text-slate-400">
              Be the first to share an amen or prayer declaration!
            </p>
          </div>
        )}

        {/* Message Cards */}
        {filteredMessages.map((msg) => {
          const isAmen = msg.isAmen || msg.type === 'amen';
          const isPrayer = msg.type === 'prayer_point';
          const isPraise = msg.type === 'praise';

          return (
            <div
              key={msg.id}
              className={`p-3 rounded-2xl text-xs space-y-1 transition-all group ${
                isAmen
                  ? 'bg-amber-50/90 border border-amber-200/90 text-amber-950 shadow-sm'
                  : isPrayer
                  ? 'bg-indigo-50/80 border border-indigo-200/90 text-indigo-950'
                  : isPraise
                  ? 'bg-emerald-50/80 border border-emerald-200/80 text-emerald-950'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-[11px] ${
                    isAmen ? 'text-amber-900' : isPrayer ? 'text-indigo-900' : 'text-blue-950'
                  }`}>
                    {msg.userName}
                  </span>

                  {msg.isPastorOrAdmin && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-900 text-white">
                      Pastor / Admin
                    </span>
                  )}

                  {isPrayer && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      Prayer Point
                    </span>
                  )}
                  {isPraise && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      Praise
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">
                    {formatMessageTime(msg.createdAt, msg.clientTimestamp)}
                  </span>

                  {/* Admin moderation delete */}
                  {isAdminUser && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete message (Admin)"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <p className={`leading-relaxed text-[11px] break-words ${
                isAmen ? 'font-semibold text-amber-950' : ''
              }`}>
                {msg.message}
              </p>
            </div>
          );
        })}

        <div ref={messagesEndRef} />

        {/* Floating scroll to bottom pill */}
        {hasNewMessagesBelow && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 mx-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-900 text-white text-xs font-semibold shadow-lg hover:bg-blue-800 transition-all z-10 animate-bounce"
          >
            <ArrowDown className="w-3 h-3" />
            <span>New messages below</span>
          </button>
        )}
      </div>

      {/* Quick reaction chips */}
      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Quick:
        </span>
        {quickReactions.map((rx, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendReaction(rx)}
            disabled={isSubmitting}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 transition-colors shrink-0 shadow-2xs disabled:opacity-50"
          >
            {rx.label}
          </button>
        ))}
      </div>

      {/* Message Type Selector Bar */}
      <div className="px-3 pt-2 bg-white flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedType('chat')}
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
            selectedType === 'chat'
              ? 'bg-blue-900 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          General Chat
        </button>
        <button
          type="button"
          onClick={() => setSelectedType('prayer_point')}
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
            selectedType === 'prayer_point'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          🙏 Prayer Point
        </button>
        <button
          type="button"
          onClick={() => setSelectedType('praise')}
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
            selectedType === 'praise'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          ✨ Praise / Testimony
        </button>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-slate-100 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          placeholder={
            selectedType === 'prayer_point'
              ? 'Type your prayer request...'
              : selectedType === 'praise'
              ? 'Share your praise or testimony...'
              : 'Send a prayer point, amen, or praise...'
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isSubmitting}
          maxLength={1000}
          className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 min-h-[44px]"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSubmitting}
          className="p-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm"
          aria-label="Send message"
        >
          <Send className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
        </button>
      </form>
    </div>
  );
};
