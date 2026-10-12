import React, { useState, useEffect } from 'react';
import { useChurch } from '../context/ChurchContext';
import { Sparkles, BookOpen, Heart, Radio, Camera, Check, Crown, Upload } from 'lucide-react';
import { VogLogo } from './VogLogo';
import {
  subscribeToChurchLeadership,
  saveChurchLeaderToFirestore,
  initialLeadership,
} from '../services/churchLeadershipService';
import { uploadPhotoPermanently, validateImageFile } from '../services/photoStorageService';
import { ChurchLeader } from '../types';

interface PastorWestSominaSectionProps {
  className?: string;
  compact?: boolean;
}

export const PastorWestSominaSection: React.FC<PastorWestSominaSectionProps> = ({
  className = '',
  compact = false,
}) => {
  const { setActiveTab, showToast, isAdminMode } = useChurch();
  const [leadPastor, setLeadPastor] = useState<ChurchLeader>(initialLeadership[0]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToChurchLeadership((leaders) => {
      const found = leaders.find(
        (l) =>
          l.id === 'lead-pastor' ||
          l.role.toLowerCase().includes('global') ||
          l.role.toLowerCase().includes('senior')
      );
      if (found) setLeadPastor(found);
    });
    return () => unsub();
  }, []);

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customPhotoInput.trim()) {
      try {
        const updated: ChurchLeader = {
          ...leadPastor,
          photoUrl: customPhotoInput.trim(),
        };
        await saveChurchLeaderToFirestore(updated);
        setLeadPastor(updated);
        showToast('Pastor portrait URL updated in Cloud Database!', 'success');
        setShowPhotoModal(false);
        setCustomPhotoInput('');
      } catch (err: any) {
        showToast(`Save error: ${err.message}`, 'info');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const val = validateImageFile(file);
    if (!val.valid) {
      showToast(val.error || 'Invalid file', 'info');
      return;
    }

    try {
      setIsUploading(true);
      showToast('Uploading Pastor portrait to cloud database...', 'info');
      const res = await uploadPhotoPermanently(file, 'church-leadership', 'lead-pastor');
      const updated: ChurchLeader = {
        ...leadPastor,
        photoUrl: res.url,
      };
      await saveChurchLeaderToFirestore(updated);
      setLeadPastor(updated);
      setIsUploading(false);
      showToast('Pastor portrait saved permanently & visible to all phones!', 'success');
      setShowPhotoModal(false);
    } catch (err: any) {
      setIsUploading(false);
      showToast(`Upload error: ${err.message}`, 'info');
    }
  };

  const pastorPhotoUrl = leadPastor.photoUrl;

  return (
    <section className={`bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden ${className}`}>
      {/* Decorative Ambient Background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-100/50 via-amber-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-red-50/40 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Portrait */}
        <div className="lg:col-span-5 flex flex-col items-center text-center">
          <div className="relative group">
            {/* Elegant Outer Ring with Royal Blue and Gold Accent */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-blue-900/10 border-2 border-amber-400/50 bg-gradient-to-b from-slate-100 to-slate-200 relative flex items-center justify-center">
              {pastorPhotoUrl ? (
                <img
                  src={pastorPhotoUrl}
                  alt={`${leadPastor.fullName} - ${leadPastor.role}`}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                /* High-fidelity Vector Representation of Pastor West Somina */
                <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100">
                  <svg
                    viewBox="0 0 240 240"
                    className="w-full h-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <radialGradient id="haloLight" cx="50%" cy="30%" r="60%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="70%" stopColor="#EFF6FF" />
                        <stop offset="100%" stopColor="#DBEAFE" />
                      </radialGradient>
                      <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8D5524" />
                        <stop offset="100%" stopColor="#663A15" />
                      </linearGradient>
                      <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="50%" stopColor="#F8FAFC" />
                        <stop offset="100%" stopColor="#E2E8F0" />
                      </linearGradient>
                      <linearGradient id="royalTie" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1E3A8A" />
                        <stop offset="100%" stopColor="#0F172A" />
                      </linearGradient>
                    </defs>

                    <rect width="240" height="240" fill="url(#haloLight)" />
                    <circle cx="120" cy="88" r="42" fill="url(#skinGrad)" />
                    <path
                      d="M78 82 C78 52, 162 52, 162 82 C162 70, 150 56, 120 56 C90 56, 78 70, 78 82 Z"
                      fill="#1E293B"
                    />
                    <path
                      d="M60 240 L72 152 L96 158 L120 180 L144 158 L168 152 L180 240 Z"
                      fill="url(#suitGrad)"
                      stroke="#CBD5E1"
                      strokeWidth="1.5"
                    />
                    <path d="M106 150 L120 178 L134 150 Z" fill="#FFFFFF" />
                    <path d="M116 156 L120 205 L124 205 L124 156 Z" fill="url(#royalTie)" />
                    <circle cx="118" cy="120" r="1.5" fill="#EF4444" />
                    <path
                      d="M80 240 L120 176 L160 240 Z"
                      fill="#0B2545"
                      fillOpacity="0.08"
                    />
                  </svg>
                </div>
              )}

              {/* Gold Official Badge */}
              <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-1.5 rounded-full shadow-lg">
                <Crown className="w-4 h-4" />
              </div>
            </div>

            {/* Change / Upload Button for Admin */}
            {isAdminMode && (
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="absolute bottom-2 right-2 p-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-full shadow-xl border-2 border-white transition-transform active:scale-95 flex items-center justify-center"
                title="Change or upload pastor photograph"
              >
                <Camera className="w-4 h-4 text-amber-300" />
              </button>
            )}
          </div>

          <div className="mt-4 space-y-0.5">
            <h3 className="text-lg font-extrabold text-blue-950 font-serif-church">
              {leadPastor.fullName}
            </h3>
            <span className="text-[11px] font-extrabold text-amber-600 uppercase tracking-widest block">
              {leadPastor.role}
            </span>
            <p className="text-xs text-slate-500 font-medium">
              {leadPastor.title || 'Lead Pastor & Founder, VOG'}
            </p>
          </div>
        </div>

        {/* Right Column: Pastor's Introduction & Message */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                SPIRITUAL OVERSIGHT & LEADERSHIP
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-500 font-semibold">Vessel of Grace (VOG)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-950 font-serif-church">
              Meet {leadPastor.fullName}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-blue-900">
              {leadPastor.role} · Vessel of Grace Christian Center
            </p>
          </div>

          {/* Pastor's Personal Welcome Quote / Biography */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-100 text-xs sm:text-sm text-slate-700 leading-relaxed italic space-y-2">
            <p>
              "{leadPastor.biography || 'I welcome you with the love of Christ to Vessel of Grace Christian Center. In this sanctuary, we believe that no matter where you are in life’s journey, God’s abundant grace has the power to elevate, restore, and preserve you.'}"
            </p>
            <p>
              "We are called to raise a people of faith, power, and distinction in Omagwa, Port Harcourt, and across the nations."
            </p>
          </div>

          {/* Ministry Pillars Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="font-extrabold text-blue-950 block">Uncompromising Word</span>
              <span className="text-[11px] text-slate-500">Systematic biblical teaching & truth</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="font-extrabold text-amber-800 block">Supernatural Grace</span>
              <span className="text-[11px] text-slate-500">Empowerment for daily victory</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="font-extrabold text-red-700 block">Loving Community</span>
              <span className="text-[11px] text-slate-500">Fellowship rooted in Christ</span>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('daily-word')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors min-h-[42px]"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Read Pastor's Daily Lifts</span>
            </button>

            <button
              onClick={() => setActiveTab('sermons')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-950 font-bold text-xs rounded-xl border border-slate-300 shadow-sm transition-colors min-h-[42px]"
            >
              <BookOpen className="w-4 h-4 text-blue-900" />
              <span>Sermon Archives</span>
            </button>

            <button
              onClick={() => setActiveTab('prayer')}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-900 font-bold text-xs rounded-xl border border-red-200 transition-colors min-h-[42px]"
            >
              <Heart className="w-4 h-4 text-red-600" />
              <span>Request Prayer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {leadPastor.fullName} Portrait (Cloud Storage)
              </h3>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Upload the official portrait photo of the pastor. It will be permanently stored in Cloud Firestore and visible to all phone users.
            </p>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. Upload from Camera or Device Gallery
                </label>
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl bg-blue-50/50 cursor-pointer transition-colors">
                  <Upload className="w-6 h-6 text-blue-900 mb-1" />
                  <span className="text-xs font-bold text-blue-950">
                    {isUploading ? 'Uploading to cloud...' : 'Choose Photo File'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, or WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                  <span className="bg-white px-2">OR</span>
                </div>
              </div>

              <form onSubmit={handleSavePhoto} className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  2. Enter Direct Photo Web Link
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={customPhotoInput}
                  onChange={(e) => setCustomPhotoInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition-colors"
                >
                  Save Photo URL to Cloud
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
