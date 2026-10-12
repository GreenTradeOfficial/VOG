import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  HeartHandshake,
  ShieldCheck,
  Send,
  Heart,
  CheckCircle2,
  Sparkles,
  Lock,
  Mic,
  Volume2,
} from 'lucide-react';
import { PrayerRequest } from '../types';
import { VoiceNoteRecorder } from '../components/VoiceNoteRecorder';
import { VoiceNoteUploadResult } from '../services/voiceNoteService';

export const PrayerRequestsPage: React.FC = () => {
  const { addPrayerRequest, showToast } = useChurch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<PrayerRequest['category']>('Healing & Health');
  const [requestText, setRequestText] = useState('');
  const [voiceNoteData, setVoiceNoteData] = useState<VoiceNoteUploadResult | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim() && !voiceNoteData) {
      showToast('Please type your prayer request or record a voice note', 'info');
      return;
    }

    addPrayerRequest({
      name,
      email,
      phone,
      category,
      requestText: requestText.trim() || 'Spoken Prayer Voice Note to Pastoral Team',
      voiceNoteUrl: voiceNoteData?.url,
      voiceNoteStoragePath: voiceNoteData?.storagePath,
      voiceNoteDurationSec: voiceNoteData?.durationSec,
      hasVoiceNote: Boolean(voiceNoteData),
    });

    setIsSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200">
          <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
          <span>PASTORAL INTERCESSION & CARE</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-blue-950 font-serif-church">
          Submit a Prayer Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          "The effective, fervent prayer of a righteous man avails much." (James 5:16).
          Our pastoral intercessory team stands in agreement with you before the throne of grace.
        </p>
      </div>

      {/* Confirmation State */}
      {isSubmitted ? (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 font-serif-church">
              Your Prayer Request Has Been Received
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Beloved, the pastoral team is lifting your request to God in the secret place.
              Stand strong in faith and trust that the answer is already on its way.
            </p>
          </div>

          {voiceNoteData && (
            <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-1.5 font-bold">
                <Volume2 className="w-4 h-4 text-blue-800" />
                <span>Voice Note Transmitted to Pastoral Team ({voiceNoteData.durationSec}s)</span>
              </div>
              {localAudioUrl && (
                <audio controls src={localAudioUrl} className="w-full h-8" />
              )}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 italic max-w-md mx-auto">
            "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and minds in Christ Jesus." — Philippians 4:6-7
          </div>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setRequestText('');
              setVoiceNoteData(null);
              setLocalAudioUrl(null);
            }}
            className="px-6 py-3 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        /* Submission Form */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank to remain anonymous"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prayer Focus / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-900"
                >
                  <option value="Healing & Health">Healing & Divine Health</option>
                  <option value="Family & Marriage">Family & Marriage Restoration</option>
                  <option value="Financial Breakthrough">Financial Breakthrough & Career</option>
                  <option value="Spiritual Growth">Spiritual Growth & Deliverance</option>
                  <option value="Deliverance">Deliverance & Protection</option>
                  <option value="Thanksgiving">Thanksgiving & Praise Report</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="For pastoral follow-up if requested"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +234 803 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            {/* Voice Note Recorder Section */}
            <VoiceNoteRecorder
              category={category}
              onRecorded={(result, audioUrl) => {
                setVoiceNoteData(result);
                setLocalAudioUrl(audioUrl);
                showToast(`Voice note recorded (${result.durationSec}s) and ready to submit!`, 'success');
              }}
              onDiscard={() => {
                setVoiceNoteData(null);
                setLocalAudioUrl(null);
              }}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Prayer Request {voiceNoteData ? '(Optional note)' : '*'}
              </label>
              <textarea
                rows={4}
                required={!voiceNoteData}
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder={
                  voiceNoteData
                    ? 'Optional: Add any additional notes or specific details for the pastor...'
                    : 'Share your burden or prayer point in confidence...'
                }
                className="w-full text-xs p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900"
              />
            </div>

            {/* Strict Privacy Notice as requested */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
              <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-800">
                  Strict Pastoral Privacy & Confidentiality Notice
                </p>
                <p className="text-[11px] leading-relaxed">
                  Your prayer requests and voice notes are handled with absolute spiritual confidentiality.
                  They are never broadcast publicly or shared with third parties.
                  Audio recordings and prayer messages are securely transmitted to the church database, accessible exclusively to Senior Pastor West Somina and the authorized ministerial team.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] min-h-[48px]"
            >
              <Send className="w-4 h-4" />
              <span>
                {voiceNoteData
                  ? 'Submit Prayer Request with Voice Note'
                  : 'Submit Prayer Request'}
              </span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
