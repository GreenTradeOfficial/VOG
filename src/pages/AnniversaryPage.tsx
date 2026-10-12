import React, { useState, useEffect } from 'react';
import { useChurch } from '../context/ChurchContext';
import { VogLogo } from '../components/VogLogo';
import { ChurchLocationCard } from '../components/ChurchLocationCard';
import { ChurchArtwork } from '../components/ChurchArtwork';
import { FeaturedPastorAndWifeSection } from '../components/FeaturedPastorAndWifeSection';
import { AnniversaryGuestsSection } from '../components/AnniversaryGuestsSection';
import { HlsPlayer } from '../components/HlsPlayer';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Radio,
  Share2,
  Bell,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info,
  Play,
  Heart,
  Volume2,
  CalendarCheck,
  Award,
  Layers,
  Users,
} from 'lucide-react';

export const AnniversaryPage: React.FC = () => {
  const { anniversaryData, updateAnniversaryData, isAdminMode, setActiveTab, showToast, liveConfig } = useChurch();

  // Real-time Live Countdown Clock to October 28, 2026 using an effect hook
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calculateTime = () => {
      // Official target date: October 28, 2026 (00:00:00 local time)
      const target = new Date('2026-10-28T00:00:00').getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Selected schedule tab for mobile
  const [selectedDayTab, setSelectedDayTab] = useState<'day-1' | 'day-2' | 'day-3'>('day-1');
  const [testReminderToast, setTestReminderToast] = useState<string | null>(null);

  // WhatsApp Share Handler
  const handleWhatsAppShare = () => {
    const shareText = `🕊️ *VESSEL OF GRACE CHRISTIAN CENTER (VOG)*\n🎉 *VOG @ 10 — 10TH ANNIVERSARY CELEBRATION*\n*Theme:* "${anniversaryData.theme}"\n🗓️ *Dates:* ${anniversaryData.datesText}\n👤 *Host:* ${anniversaryData.seniorPastor} (Senior Pastor)\n📍 *Location:* ${anniversaryData.location}\n\nJoin us as we celebrate a glorious decade of God's grace and faithfulness in Omagwa, Port Harcourt!`;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    showToast('Opening Facebook sharing for VOG @ 10...', 'info');
    const churchFacebookUrl = anniversaryData.facebookLiveUrl;
    window.open(churchFacebookUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTestReminder = (msg: string) => {
    setTestReminderToast(msg);
    showToast(`Anniversary reminder preview: "${msg}"`, 'info');
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. ANNIVERSARY HERO SECTION (OFFICIAL BANNER DESIGN) */}
      <section className="relative overflow-hidden rounded-3xl bg-white text-slate-900 p-6 sm:p-10 lg:p-14 shadow-xl border-2 border-amber-400/80">
        {/* Subtle celebratory radial light beams */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="annivPageWhiteRay" cx="50%" cy="15%" r="85%">
                <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#EFF6FF" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#F8FAFC" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#annivPageWhiteRay)" />
            {/* Elegant celebratory golden rays */}
            <polygon points="50%,0 42%,100% 58%,100%" fill="#FCD34D" opacity="0.12" />
            <polygon points="50%,0 22%,100% 32%,100%" fill="#93C5FD" opacity="0.08" />
            <polygon points="50%,0 68%,100% 78%,100%" fill="#FCA5A5" opacity="0.08" />
          </svg>
        </div>

        {/* Ambient Halos: Royal Blue, Crimson Red & Polished Gold */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[550px] h-64 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-red-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* Top Official Tricolor Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-900 via-red-600 to-amber-500" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Logo & 10-Year Heraldic Medallion */}
          <div className="relative group">
            {/* Outer golden halo ring */}
            <div className="p-3.5 sm:p-4 bg-white rounded-3xl border-2 border-amber-400 shadow-xl transition-transform duration-500 hover:scale-105">
              <VogLogo size="lg" />
            </div>
            {/* Red & Gold Crown Seal */}
            <div className="absolute -bottom-2.5 -right-2.5 px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 rounded-full text-white text-[10px] font-black tracking-wider uppercase border border-amber-300 shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-200 animate-spin" style={{ animationDuration: '6s' }} />
              <span>10 YEARS</span>
            </div>
          </div>

          <div className="space-y-4 w-full">
            {/* VOG @ 10 Badge & Decade Banner */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white text-xs font-black tracking-widest uppercase shadow-md border border-amber-300/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>VOG @ 10</span>
                <span className="text-amber-300">·</span>
                <span>2016 – 2026</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-blue-950 text-xs font-black tracking-widest uppercase border border-blue-200">
                <Award className="w-3.5 h-3.5 text-blue-900" />
                <span>10 YEARS ANNIVERSARY</span>
              </div>
            </div>

            {/* Church Name & Main Event Title */}
            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-extrabold tracking-widest text-slate-500 uppercase block">
                VESSEL OF GRACE CHRISTIAN CENTER
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-blue-950 font-serif-church uppercase drop-shadow-sm">
                10 Years Anniversary Celebration
              </h1>
            </div>

            {/* OFFICIAL ANNIVERSARY THEME: "ACCESS" PROMINENTLY HIGHLIGHTED */}
            <div className="pt-2 pb-1 w-full flex justify-center">
              <div className="relative group w-full max-w-xl">
                {/* Outer Glow Halo */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400/40 via-red-500/20 to-blue-600/30 blur-lg opacity-75 group-hover:opacity-100 transition duration-1000" />

                {/* Monolithic Centerpiece Card */}
                <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-white via-slate-50 to-blue-50/40 px-6 sm:px-14 py-6 sm:py-7 rounded-3xl border-2 border-amber-400 shadow-xl">
                  {/* Top Gold Ribbon Label */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-[1.5px] bg-gradient-to-r from-transparent to-amber-500" />
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-blue-950">
                      OFFICIAL ANNIVERSARY THEME
                    </span>
                    <span className="w-6 h-[1.5px] bg-gradient-to-l from-transparent to-amber-500" />
                  </div>

                  {/* The Theme "ACCESS" in Majestic Blue with Gold Accent */}
                  <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-widest text-blue-950 font-serif-church drop-shadow-sm select-none py-1">
                    ACCESS
                  </h2>

                  {/* Official Bible Reference Directly Beneath Theme */}
                  <div className="mt-2 flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-red-600 text-white border-2 border-amber-300 shadow-md">
                    <span className="text-amber-300 text-sm font-bold">📖</span>
                    <span className="text-sm sm:text-base font-black tracking-widest text-white uppercase font-sans">
                      1 CORINTHIANS 2:9–10
                    </span>
                  </div>

                  {/* Bottom Golden Accent Divider */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="w-10 sm:w-16 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 rotate-45" />
                    <span className="w-10 sm:w-16 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Official Dates & Church Information Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-700 font-medium pt-1 max-w-4xl">
            {/* Dates Badge */}
            <div className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 rounded-2xl shadow-md border border-blue-900">
              <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="font-extrabold tracking-wide">28 OCTOBER – 1 NOVEMBER 2026</span>
            </div>

            {/* Service Times Badge */}
            <div className="flex items-center gap-2 bg-amber-50 text-amber-950 px-4 py-2 rounded-2xl border-2 border-amber-300 shadow-sm font-bold">
              <Clock className="w-4 h-4 text-red-600 shrink-0" />
              <span>Evening Services: 5:00 PM · Sunday: 8:00 AM</span>
            </div>

            {/* Senior Pastor Host Badge */}
            <div className="flex items-center gap-2 bg-slate-100 text-slate-800 px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-blue-950 font-bold">Senior Pastor:</span>
              <span className="font-semibold text-slate-900">{anniversaryData.seniorPastor}</span>
            </div>

            {/* Sanctuary Location Badge */}
            <div className="flex items-center gap-2 bg-slate-100 text-slate-800 px-4 py-2 rounded-2xl border border-slate-200 shadow-sm text-left">
              <MapPin className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-[11px] sm:text-xs">
                Beside AP (Front) Filling Station, Omagwa, Port Harcourt, Rivers State, Nigeria
              </span>
            </div>
          </div>

          {/* REAL-TIME COUNTDOWN TO OCTOBER 28, 2026 */}
          <div className="w-full max-w-2xl pt-2">
            <div className="p-4 sm:p-6 bg-gradient-to-b from-blue-50/80 via-white to-slate-50 rounded-3xl border-2 border-amber-400 shadow-md space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-blue-100">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-950 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-900" />
                  <span>COUNTDOWN TO 28 OCTOBER 2026</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>REAL-TIME CLOCK</span>
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-4 font-mono">
                {/* Days */}
                <div className="p-2 sm:p-3.5 bg-blue-950 rounded-2xl border-2 border-amber-400 text-center shadow-sm">
                  <span className="text-2xl sm:text-4xl font-black text-amber-300 block tabular-nums drop-shadow-sm">
                    {timeLeft.days}
                  </span>
                  <span className="text-[10px] sm:text-xs font-sans text-blue-100 uppercase tracking-wider font-bold">
                    Days
                  </span>
                </div>

                {/* Hours */}
                <div className="p-2 sm:p-3.5 bg-blue-950 rounded-2xl border border-blue-800 text-center shadow-sm">
                  <span className="text-2xl sm:text-4xl font-black text-white block tabular-nums drop-shadow-sm">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-sans text-blue-200 uppercase tracking-wider font-semibold">
                    Hours
                  </span>
                </div>

                {/* Minutes */}
                <div className="p-2 sm:p-3.5 bg-blue-950 rounded-2xl border border-blue-800 text-center shadow-sm">
                  <span className="text-2xl sm:text-4xl font-black text-white block tabular-nums drop-shadow-sm">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-sans text-blue-200 uppercase tracking-wider font-semibold">
                    Minutes
                  </span>
                </div>

                {/* Seconds */}
                <div className="p-2 sm:p-3.5 bg-red-700 rounded-2xl border-2 border-amber-300 text-center shadow-sm">
                  <span className="text-2xl sm:text-4xl font-black text-white block tabular-nums drop-shadow-sm">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-sans text-red-100 uppercase tracking-wider font-semibold">
                    Seconds
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#schedule-area"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-950 hover:bg-blue-900 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-950/20 border-2 border-amber-400 transition-all active:scale-95 min-h-[46px] uppercase tracking-wider"
            >
              <Calendar className="w-4 h-4 text-amber-300 stroke-[2.5]" />
              <span>VIEW ANNIVERSARY PROGRAM</span>
            </a>

            <a
              href="#guests-area"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm border border-slate-300 shadow transition-all active:scale-95 min-h-[46px] uppercase tracking-wider"
            >
              <Users className="w-4 h-4 text-blue-900" />
              <span>MEET GUESTS & SPEAKERS</span>
            </a>

            <a
              href="#live-area"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-red-700/30 border border-red-500 transition-all active:scale-95 min-h-[46px] uppercase tracking-wider"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>WATCH LIVE STREAM</span>
            </a>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all active:scale-95 min-h-[46px]"
            >
              <Share2 className="w-4 h-4" />
              <span>Share WhatsApp</span>
            </button>

            <button
              onClick={handleFacebookShare}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-700/20 transition-all active:scale-95 min-h-[46px]"
            >
              <span>Share Facebook</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PASTOR WEST SOMINA AND WIFE */}
      <FeaturedPastorAndWifeSection onOpenAdminGuests={() => setActiveTab('admin')} />

      {/* 3. DEDICATED PHOTO GALLERY: MEET OUR GUESTS & SPEAKERS */}
      <div id="guests-area">
        <AnniversaryGuestsSection onOpenAdminGuests={() => setActiveTab('admin')} />
      </div>

      {/* 4. 5-DAY ANNIVERSARY EVENT SCHEDULE (28 OCTOBER – 1 NOVEMBER 2026) */}
      <section id="schedule-area" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                OFFICIAL 5-DAY ITINERARY
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-500 font-semibold">28 OCTOBER – 1 NOVEMBER 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-serif-church">
              Anniversary Program Schedule
            </h2>
          </div>

          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Evening services: <strong>5:00 PM</strong> daily · Sunday Thanksgiving service: <strong>8:00 AM</strong></span>
          </div>
        </div>

        {/* Schedule Cards for 5 Separate Days */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {anniversaryData.schedule.map((day) => (
            <div
              key={day.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Date Header Strip */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 font-extrabold text-xs">
                    {day.date}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {day.isConfirmed ? 'Confirmed' : 'Coming Soon'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 block">
                    {day.dayName}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-serif-church mt-1 leading-snug">
                    {day.dayTitle}
                  </h3>
                </div>

                {/* Time Placeholder */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <Clock className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{day.timePlaceholder}</span>
                </div>

                {/* Day Overview Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {day.description}
                </p>

                {/* Program Outline / Activities (Placeholder list) */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Key Highlights & Activities:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {day.activities.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-900 shrink-0 mt-0.5" />
                        <span className="leading-snug">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Day Card Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Main Sanctuary</span>
                <button
                  onClick={() => {
                    const shareDay = `*VOG @ 10 Celebration*\n📅 *${day.dayName}*\n"${day.dayTitle}"\n📍 Location: Omagwa, Port Harcourt\n⏰ ${day.timePlaceholder}`;
                    if (navigator.share) {
                      navigator.share({ title: day.dayName, text: shareDay });
                    } else {
                      window.open(`https://wa.me/?text=${encodeURIComponent(shareDay)}`, '_blank');
                    }
                  }}
                  className="text-blue-900 hover:text-blue-950 font-bold flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Day</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ANNIVERSARY LIVE STREAMING AREA (SECTION 5) */}
      <section id="live-area" className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {liveConfig.isLive && liveConfig.streamUrl ? (
                <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>LIVE NOW</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700">
                  <Radio className="w-3 h-3 text-slate-400" />
                  <span>BROADCAST STANDBY</span>
                </span>
              )}
              <span className="text-xs text-slate-400 font-medium">28 OCTOBER – 1 NOVEMBER 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-church">
              VOG @ 10 Anniversary Live Broadcast
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('live')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-md transition-all min-h-[40px]"
            >
              <Radio className="w-3.5 h-3.5 text-amber-300" />
              <span>Sanctuary Live Page</span>
            </button>
          </div>
        </div>

        {/* Live Video Player or Standby Card */}
        {liveConfig.isLive && liveConfig.streamUrl ? (
          <HlsPlayer
            streamUrl={liveConfig.streamUrl}
            serviceTitle="VOG @ 10 Anniversary Celebration (ACCESS)"
          />
        ) : (
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-800 flex flex-col justify-between p-6 sm:p-8 text-center text-white">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-amber-300">Theme: ACCESS</span>
              <span>1 Corinthians 2:9–10</span>
            </div>

            <div className="max-w-md mx-auto space-y-2.5 my-auto">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-900/40 border border-blue-700/50 flex items-center justify-center text-blue-300">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif-church">
                The church is not currently broadcasting live. Check the service schedule below for upcoming services.
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Anniversary sessions stream directly in this app: <strong>28 OCTOBER – 1 NOVEMBER 2026</strong>. Evening services 5:00 PM daily (Oct 28–31), Sunday Thanksgiving service 8:00 AM (Nov 1).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
              <span className="text-slate-400 text-[11px]">Beside AP Filling Station, Omagwa · Pastor West Somina</span>
              <button
                onClick={() => setActiveTab('live')}
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow"
              >
                <Radio className="w-3.5 h-3.5 text-amber-300" />
                <span>Go to Live Services Page</span>
              </button>
            </div>
          </div>
        )}

        {/* Broadcasting Notice */}
        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Official Sanctuary Broadcast:</strong> All five days of the 10th Anniversary (Oct 28, 29, 30, 31, and Nov 1, 2026) stream directly inside the VOG application player via the sanctuary IP camera and media server.
          </span>
        </div>
      </section>

      {/* 4. ANNIVERSARY ANNOUNCEMENTS SECTION */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-blue-950 font-serif-church">
              Anniversary Bulletins & Notices
            </h2>
            <p className="text-xs text-slate-500">
              Official updates concerning VOG @ 10 preparations and participation
            </p>
          </div>

          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-bold border border-amber-200">
            {anniversaryData.announcements.length} Notices
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {anniversaryData.announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 hover:bg-blue-50/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                  {ann.badge || 'Bulletin'}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {ann.date}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">
                {ann.title}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 10 YEARS OF GRACE — PHOTO GALLERY & MILESTONES PLACEHOLDER */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
              DECADE OF IMPACT · 2016 TO 2026
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-serif-church">
            10-Year Ministry Milestones & Photo Gallery
          </h2>
          <p className="text-xs text-slate-500">
            Reflecting on God’s grace across the years at Vessel of Grace Christian Center
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {anniversaryData.gallery.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="relative aspect-video sm:aspect-square">
                <ChurchArtwork theme={item.theme} className="w-full h-full group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-bold">
                  {item.year}
                </div>
              </div>

              <div className="p-4 space-y-1">
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-900">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. NOTIFICATION REMINDER PREVIEWS (SECTION 4) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-blue-950 font-serif-church">
            Sample Anniversary Reminder Notifications
          </h2>
          <p className="text-xs text-slate-500">
            Administrators can send these demonstration announcements to alert the congregation as October 28 approaches:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: '🎉 18 Days to VOG @ 10!', text: 'Save the date: 28 OCTOBER – 1 NOVEMBER 2026. Official Theme: ACCESS (1 Corinthians 2:9–10). Prepare your thanksgiving offering!' },
            { title: '🙏 21-Day Anniversary Fast', text: 'Commencing next week: Joining hearts in prayer for our 10th anniversary glory.' },
            { title: '📍 Directions & Travel Guide', text: 'Omagwa sanctuary campus: Beside AP (Front) Filling Station, Omagwa, Port Harcourt.' },
          ].map((sample, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-950 block">
                  {sample.title}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {sample.text}
                </p>
              </div>

              <button
                onClick={() => handleTestReminder(sample.title)}
                className="self-start text-[11px] font-bold text-blue-900 hover:text-blue-950 underline pt-1"
              >
                Test Preview Alarm →
              </button>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 italic pt-1">
          * Real automatic push delivery requires mobile notification services.
        </div>
      </section>

      {/* 7. SANCTUARY LOCATION CARD WITH GET DIRECTIONS */}
      <ChurchLocationCard />
    </div>
  );
};
