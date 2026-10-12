import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Sparkles,
  X,
  Send,
  Lock,
  CheckCircle2,
  Heart,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { PrayerRequest } from '../types';
import { getSavedWorshipperName, sendLiveChatMessage } from '../services/liveChatService';

const PRAYER_CATEGORIES: PrayerRequest['category'][] = [
  'Healing & Health',
  'Family & Marriage',
  'Financial Breakthrough',
  'Spiritual Growth',
  'Deliverance',
  'Thanksgiving',
];

export const QuickPrayerFab: React.FC = () => {
  const { addPrayerRequest, showToast, liveConfig } = useChurch();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState<PrayerRequest['category']>('Healing & Health');
  const [requestText, setRequestText] = useState('');
  const [shareToLiveWall, setShareToLiveWall] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize name from saved identity
  useEffect(() => {
    const saved = getSavedWorshipperName();
    if (saved) {
      setName(saved);
    }
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleOpen = () => {
    setIsSuccess(false);
    setRequestText('');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim() || isSubmitting) {
      showToast('Please type your prayer request', 'info');
      return;
    }

    setIsSubmitting(true);
    const finalName = isAnonymous ? 'Anonymous Brethren' : name.trim() || 'Church Member';

    try {
      // 1. Add to church prayer requests
      addPrayerRequest({
        name: finalName,
        category,
        requestText: requestText.trim(),
      });

      // 2. Optional: If user opted in to share on live sanctuary wall as prayer point
      if (shareToLiveWall) {
        try {
          await sendLiveChatMessage({
            userName: finalName,
            message: `[Prayer Request - ${category}]: ${requestText.trim()}`,
            type: 'prayer_point',
          });
        } catch {
          // Non-blocking if live wall fails
        }
      }

      setIsSuccess(true);
      setRequestText('');
    } catch (err) {
      console.error('Failed to submit prayer:', err);
      showToast('Could not submit prayer request. Please try again.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-30 flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white rounded-full shadow-xl shadow-blue-950/30 border border-amber-400/40 hover:border-amber-400 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 group focus:outline-none focus:ring-4 focus:ring-blue-500/40"
        aria-label="Submit Quick Prayer Request"
        title="Submit a Quick Prayer Request"
      >
        <div className="relative">
          <HeartHandshake className="w-5 h-5 text-amber-400 group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
        </div>
        <span className="text-xs sm:text-sm font-bold tracking-wide">
          Quick Prayer
        </span>
      </button>

      {/* QUICK PRAYER MODAL DIALOG */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-prayer-title"
        >
          {/* Backdrop click area */}
          <div className="fixed inset-0" onClick={handleClose} />

          {/* Modal Container */}
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Pastoral Intercession & Care</span>
                </div>
                <h2 id="quick-prayer-title" className="text-xl sm:text-2xl font-extrabold font-serif-church">
                  Quick Prayer Request
                </h2>
                <p className="text-xs text-blue-200/90 leading-relaxed">
                  Submit your request right now without leaving the dashboard. Our pastors and prayer team uphold you before the throne of grace.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-colors"
                aria-label="Close prayer dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {isSuccess ? (
                /* SUCCESS CONFIRMATION STATE */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700 shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900 font-serif-church">
                      Prayer Request Received
                    </h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Your prayer point has been placed before God and committed to our pastoral intercessory team.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-950 italic max-w-sm mx-auto">
                    "And this is the confidence that we have in him, that, if we ask any thing according to his will, he heareth us."
                    <span className="block mt-1 font-bold text-amber-900 not-italic">— 1 John 5:14</span>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                    >
                      Submit Another Prayer
                    </button>
                    <button
                      onClick={handleClose}
                      className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors shadow-sm"
                    >
                      Done (Back to Dashboard)
                    </button>
                  </div>
                </div>
              ) : (
                /* PRAYER SUBMISSION FORM */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category Selector Chips */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Select Prayer Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRAYER_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                            category === cat
                              ? 'bg-blue-900 text-white font-bold shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prayer Text Area */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Your Prayer Point / Request <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {requestText.length} / 500
                      </span>
                    </div>
                    <textarea
                      required
                      rows={4}
                      maxLength={500}
                      value={requestText}
                      onChange={(e) => setRequestText(e.target.value)}
                      placeholder="Briefly describe what you would like prayer for (e.g., Divine healing, family peace, breakthrough at work, spiritual strength)..."
                      className="w-full text-xs p-3.5 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 leading-relaxed bg-slate-50/50"
                      autoFocus
                    />
                  </div>

                  {/* Name & Anonymous Toggle */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        Worshipper Name
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded text-blue-900 focus:ring-blue-900 h-3.5 w-3.5"
                        />
                        <span>Submit Anonymously</span>
                      </label>
                    </div>

                    {!isAnonymous && (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name or first name"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 font-medium"
                      />
                    )}
                  </div>

                  {/* Live Sanctuary Wall broadcast toggle (if broadcast active) */}
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80">
                    <input
                      type="checkbox"
                      id="shareToLiveWall"
                      checked={shareToLiveWall}
                      onChange={(e) => setShareToLiveWall(e.target.checked)}
                      className="mt-0.5 rounded text-blue-900 focus:ring-blue-900 h-4 w-4"
                    />
                    <label htmlFor="shareToLiveWall" className="text-xs text-blue-950 cursor-pointer">
                      <span className="font-bold block">Also broadcast to Sanctuary Live Fellowship Wall</span>
                      <span className="text-[11px] text-blue-800/80">
                        Allows worshippers online during live service to join faith and type "Amen!" in agreement with you.
                      </span>
                    </label>
                  </div>

                  {/* Confidentiality Notice */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Handled in prayer confidence by Pastor West Somina and church intercessors.</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!requestText.trim() || isSubmitting}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Submitting...' : 'Submit Prayer Request'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
