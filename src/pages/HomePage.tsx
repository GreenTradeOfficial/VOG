import React from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Radio,
  BookOpen,
  Sparkles,
  Tv,
  Calendar,
  HeartHandshake,
  ArrowRight,
  Clock,
  MapPin,
  Volume2,
  CalendarCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ShareButtons } from '../components/ShareButtons';
import { ChurchArtwork } from '../components/ChurchArtwork';
import { PastorWestSominaSection } from '../components/PastorWestSominaSection';
import { ChurchLocationCard } from '../components/ChurchLocationCard';
import { AnniversaryBanner } from '../components/AnniversaryBanner';
import { QuickPrayerFab } from '../components/QuickPrayerFab';
import { officialChurchInfo } from '../data/mockData';

export const HomePage: React.FC = () => {
  const {
    setActiveTab,
    liveConfig,
    dailyLifts,
    dailyDevotions,
    events,
    announcements,
    sermons,
    serviceSchedule,
    showToast,
  } = useChurch();

  const todayStr = '2026-10-10'; // Matching our demo date
  const todaysLift = dailyLifts.find((l) => l.date === todayStr) || dailyLifts[0];
  const todaysDevotion = dailyDevotions.find((d) => d.date === todayStr) || dailyDevotions[0];
  const upcomingEvents = events.slice(0, 3);
  const recentAnnouncements = announcements.slice(0, 2);
  const recentSermons = sermons.slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. 10TH ANNIVERSARY CELEBRATION HERO BANNER */}
      <AnniversaryBanner />

      {/* 2. CHURCH WELCOME HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B2545] via-[#133E87] to-[#0A1128] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-900/60">
        {/* Subtle Stained Glass & Light Beam Background Pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="sacredGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="1.5" fill="#FCD34D" />
                <path d="M 0 30 L 60 30 M 30 0 L 30 60" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sacredGrid)" />
          </svg>
        </div>

        {/* Ambient Gold Halo */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          {/* Demonstration Preview Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-medium text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Official Church Mobile App · Demonstration Prototype</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif-church">
            Welcome to Vessel of Grace Christian Center
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-blue-100/90 font-medium max-w-2xl leading-relaxed">
            Stay Connected. Grow in Faith. Experience God’s Grace.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            {(() => {
              const isTrulyActive = Boolean(
                liveConfig.isLive &&
                liveConfig.streamUrl?.trim() &&
                (liveConfig.isReceivingData || liveConfig.validationStatus === 'verified_active')
              );

              return (
                <button
                  onClick={() => setActiveTab('live')}
                  className="flex items-center gap-2.5 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-red-600/30 active:scale-95 transition-all min-h-[48px]"
                >
                  <Radio className={`w-5 h-5 ${isTrulyActive ? 'animate-pulse' : ''}`} />
                  <span>WATCH LIVE SERVICE</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-md font-bold uppercase tracking-wider ${
                    isTrulyActive ? 'bg-red-800 text-white animate-pulse' : 'bg-black/30 text-slate-200'
                  }`}>
                    {isTrulyActive ? 'LIVE NOW' : 'SERVICES'}
                  </span>
                </button>
              );
            })()}

            <button
              onClick={() => setActiveTab('daily-word')}
              className="flex items-center gap-2 px-5 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-sm rounded-2xl backdrop-blur-md border border-white/20 active:scale-95 transition-all min-h-[48px]"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Today’s Spiritual Food</span>
            </button>
          </div>

          {/* Next Service Times Ribbon */}
          <div className="pt-4 flex flex-wrap items-center gap-3 text-xs text-blue-100 border-t border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Service Times:</span>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/15">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white">{serviceSchedule.sundayDisplay}</span>
            </div>
            <span className="text-white/30 hidden sm:inline">·</span>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/15">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white">{serviceSchedule.thursdayDisplay}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REGULAR CHURCH SERVICE TIMES (Mobile-Optimized Focus) */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                REGULAR CHURCH SERVICES
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-500 font-medium">Omagwa, Port Harcourt</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-blue-950 font-serif-church">
              Official Service Schedule
            </h2>
          </div>

          <button
            onClick={() => setActiveTab('live')}
            className="self-start sm:self-auto text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1 min-h-[36px]"
          >
            <span>Live Broadcast Area</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sunday Service Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-900 text-white rounded-xl shadow-sm">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-blue-950 uppercase tracking-wider">
                    Sunday Service
                  </h3>
                  <span className="text-xs text-blue-700 font-bold">
                    {serviceSchedule.sundayDay}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-900 text-white shadow-sm">
                Main Service
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-inner">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Official Time:
              </span>
              <p className="text-base sm:text-lg font-black text-blue-950 mt-0.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{serviceSchedule.sundayDisplay}</span>
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {serviceSchedule.descriptionSunday || 'Worship, Communion, High Praise, and Ministry of the Word with Senior Pastor West Somina.'}
            </p>
          </div>

          {/* Thursday Service Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-600 text-white rounded-xl shadow-sm">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-950 uppercase tracking-wider">
                    Thursday Service
                  </h3>
                  <span className="text-xs text-amber-800 font-bold">
                    {serviceSchedule.thursdayDay}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-600 text-white shadow-sm">
                Mid-Week Service
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-inner">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Official Time:
              </span>
              <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600 shrink-0" />
                <span>{serviceSchedule.thursdayDisplay}</span>
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {serviceSchedule.descriptionThursday || 'Mid-Week Fellowship, In-depth Scriptural Teaching, and Faith Empowerment.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. QUICK ACCESS BUTTONS GRID (Clean Ergonomics) */}
      <section>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Watch Live', icon: Radio, tab: 'live', color: 'text-red-600 bg-red-50 border-red-100' },
            { label: 'Daily Lifts', icon: Sparkles, tab: 'daily-word', color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { label: 'Devotional', icon: BookOpen, tab: 'daily-word', color: 'text-blue-600 bg-blue-50 border-blue-100' },
            { label: 'Sermons', icon: Tv, tab: 'sermons', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { label: 'Events', icon: Calendar, tab: 'events', color: 'text-teal-600 bg-teal-50 border-teal-100' },
            { label: 'Prayer Help', icon: HeartHandshake, tab: 'prayer', color: 'text-rose-600 bg-rose-50 border-rose-100' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(item.tab as any)}
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-900/30 hover:shadow-md transition-all active:scale-95 group text-center min-h-[72px]"
            >
              <div className={`p-2.5 rounded-xl ${item.color} mb-1.5 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. TODAY'S SPIRITUAL HIGHLIGHTS: DAILY LIFT & DAILY DEVOTION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A: TODAY'S MESSAGE / DAILY LIFT */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-200/60">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    TODAY’S DAILY LIFT
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    By Pastor West Somina · {todaysLift.date}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  showToast('Playing simulated audio message of encouragement...', 'info');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                title="Listen to Pastor's Audio Lift"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{todaysLift.audioDuration || '2:45'}</span>
              </button>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 font-serif-church">
                {todaysLift.title}
              </h4>
              <p className="text-xs font-semibold text-blue-900 mt-0.5">
                📖 {todaysLift.scriptureRef}
              </p>
            </div>

            {/* Bible Verse Quote */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 italic">
              "{todaysLift.bibleVerseText}"
            </div>

            {/* Lift Message Content */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
              {todaysLift.content}
            </p>

            {/* Declaration of Faith */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
              <p className="text-[11px] font-bold text-amber-900">
                Faith Declaration:
              </p>
              <p className="text-xs text-amber-800 font-medium italic">
                {todaysLift.faithDeclaration}
              </p>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <ShareButtons
              title={todaysLift.title}
              text={todaysLift.content}
              reference={todaysLift.scriptureRef}
              itemId={todaysLift.id}
              itemType="lift"
              itemDate={todaysLift.date}
            />

            <button
              onClick={() => setActiveTab('daily-word')}
              className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1 min-h-[44px]"
            >
              <span>Full Archive</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card B: TODAY'S DAILY DEVOTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-900 border border-blue-200/60">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    TODAY’S DAILY DEVOTION
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    In-Depth Word & Prayer · {todaysDevotion.date}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full">
                Word of Life
              </span>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 font-serif-church">
                {todaysDevotion.theme}
              </h4>
              <p className="text-xs font-semibold text-blue-900 mt-0.5">
                📖 {todaysDevotion.bibleRef}
              </p>
            </div>

            {/* Scripture Anchor */}
            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-slate-800 italic">
              "{todaysDevotion.bibleVerse}"
            </div>

            {/* Teaching Excerpt */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
              {todaysDevotion.devotionalTeaching}
            </p>

            {/* Today's Prayer Callout */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-bold text-blue-950">
                Prayer of the Day:
              </p>
              <p className="text-xs text-slate-700 italic line-clamp-2">
                {todaysDevotion.prayerOfDay}
              </p>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <ShareButtons
              title={todaysDevotion.theme}
              text={`${todaysDevotion.devotionalTeaching.slice(0, 240)}...\n\n🙏 Prayer: ${todaysDevotion.prayerOfDay}`}
              reference={todaysDevotion.bibleRef}
              itemId={todaysDevotion.id}
              itemType="devotion"
              itemDate={todaysDevotion.date}
            />

            <button
              onClick={() => setActiveTab('daily-word')}
              className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1 min-h-[44px]"
            >
              <span>Read Devotional</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. SENIOR PASTOR INTRODUCTION (Pastor West Somina) */}
      <PastorWestSominaSection />

      {/* 5. UPCOMING CHURCH ACTIVITIES (EVENTS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-blue-950 font-serif-church">
              Upcoming Church Activities
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Join us for fellowship, communion, prayer and conferences
            </p>
          </div>
          <button
            onClick={() => setActiveTab('events')}
            className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1"
          >
            <span>Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {evt.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-blue-900">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>{evt.date}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {evt.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {evt.description}
                </p>

                <div className="space-y-1 pt-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => showToast(`Reminder saved for ${evt.title}!`, 'success')}
                  className="text-xs font-semibold text-blue-900 hover:text-blue-950"
                >
                  + Add Reminder
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LATEST ANNOUNCEMENTS & RECENT SERMONS SPLIT */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements Preview */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-blue-950 font-serif-church">
              Latest Announcements
            </h2>
            <button
              onClick={() => setActiveTab('announcements')}
              className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-blue-50/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    ann.isUrgent ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {ann.isUrgent ? 'Urgent Notice' : ann.category}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {ann.date}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {ann.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {ann.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sermons Preview */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-blue-950 font-serif-church">
              Recent Sermons & Teachings
            </h2>
            <button
              onClick={() => setActiveTab('sermons')}
              className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1"
            >
              <span>Sermon Archive</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentSermons.map((sermon) => (
              <div
                key={sermon.id}
                onClick={() => setActiveTab('sermons')}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
              >
                <div className="w-20 h-14 shrink-0 rounded-xl overflow-hidden relative">
                  <ChurchArtwork
                    theme={sermon.serviceType.includes('Sunday') ? 'worship' : 'sermon'}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                      <div className="w-0 h-0 border-t-3 border-t-transparent border-b-3 border-b-transparent border-l-5 border-l-blue-900 ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-amber-700 block">
                    {sermon.serviceType} · {sermon.duration}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-900">
                    {sermon.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {sermon.speaker} · {sermon.scripture}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CHURCH SANCTUARY LOCATION & DIRECTIONS */}
      <ChurchLocationCard />

      {/* 7. PASTORAL CONFIDENTIAL PRAYER BANNER */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-amber-300 font-semibold">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Pastoral Care & Intercession</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif-church">
            Need Prayer or Going Through a Trial?
          </h3>
          <p className="text-xs sm:text-sm text-blue-200/90 max-w-xl">
            Our pastoral team and intercessors hold regular prayers for the church family.
            Submit your confidential request to be upheld in prayer.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('prayer')}
          className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-95 shrink-0 whitespace-nowrap min-h-[48px]"
        >
          Submit Prayer Request
        </button>
      </section>

      {/* 7. PROTOTYPE NOTICE FOOTER NOTE */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
          <Info className="w-4 h-4" />
          <span>VESSEL OF GRACE CHRISTIAN CENTER — Interactive Prototype Preview</span>
        </div>
        <p className="text-[11px] text-amber-800">
          Prepared for church leadership review. Demonstrates mobile navigation, daily devotional publishing, live stream integration, sermons, and administrative controls.
        </p>
      </div>

      {/* QUICK PRAYER FLOATING ACTION BUTTON & MODAL */}
      <QuickPrayerFab />
    </div>
  );
};
