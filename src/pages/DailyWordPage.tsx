import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Volume2,
  VolumeX,
  Type,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { ShareButtons } from '../components/ShareButtons';
import { DailyLift, DailyDevotion } from '../types';
import { AiBibleAssistantModal } from '../components/AiBibleAssistantModal';

export const DailyWordPage: React.FC = () => {
  const { dailyLifts, dailyDevotions, showToast, trackActivity } = useChurch();

  const [activeSection, setActiveSection] = useState<'lifts' | 'devotions'>('lifts');
  const publishedLifts = dailyLifts.filter((l) => l.status === 'published' || !l.status);
  const publishedDevotions = dailyDevotions.filter((d) => d.status === 'published' || !d.status);
  const [selectedLiftId, setSelectedLiftId] = useState<string>(publishedLifts[0]?.id || '');
  const [selectedDevotionId, setSelectedDevotionId] = useState<string>(publishedDevotions[0]?.id || '');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const currentLift = publishedLifts.find((l) => l.id === selectedLiftId) || publishedLifts[0];
  const currentDevotion = publishedDevotions.find((d) => d.id === selectedDevotionId) || publishedDevotions[0];

  const filteredLifts = publishedLifts.filter((lift) => {
    const matchesCategory = categoryFilter === 'all' || lift.category === categoryFilter;
    const matchesSearch =
      lift.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lift.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lift.scriptureRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredDevotions = publishedDevotions.filter((dev) => {
    return (
      dev.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.devotionalTeaching.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.bibleRef.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const textSizeClasses = {
    normal: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-relaxed',
    xlarge: 'text-lg sm:text-xl leading-relaxed',
  }[fontSize];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Segmented Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              PASTOR’S SPIRITUAL DESK
            </span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-xs text-slate-500 font-medium">Daily Spiritual Nourishment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-serif-church">
            {activeSection === 'lifts' ? 'Daily Lifts & Encouragement' : 'Daily Devotions of Grace'}
          </h1>
        </div>

        {/* Segmented Control */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl max-w-xs">
          <button
            onClick={() => setActiveSection('lifts')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs font-bold rounded-xl transition-all min-h-[40px] ${
              activeSection === 'lifts'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Lifts</span>
          </button>

          <button
            onClick={() => setActiveSection('devotions')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs font-bold rounded-xl transition-all min-h-[40px] ${
              activeSection === 'devotions'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Devotionals</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: DAILY LIFTS */}
      {activeSection === 'lifts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Today's Lift Spotlight (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {currentLift ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                {/* Top Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                      {currentLift.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Published {currentLift.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Simulated Audio Playback */}
                    <button
                      onClick={() => {
                        setIsPlayingAudio(!isPlayingAudio);
                        showToast(
                          isPlayingAudio
                            ? 'Audio encouragement paused'
                            : 'Listening to Pastor’s Daily Lift audio recording 🎧',
                          'info'
                        );
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-colors min-h-[36px] ${
                        isPlayingAudio
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isPlayingAudio ? 'Pause Audio' : `Listen (${currentLift.audioDuration || '2:45'})`}</span>
                    </button>

                    {/* Font Adjuster */}
                    <button
                      onClick={() => {
                        setFontSize((s) => (s === 'normal' ? 'large' : s === 'large' ? 'xlarge' : 'normal'));
                      }}
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Adjust font size"
                    >
                      <Type className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Author */}
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-950 font-serif-church">
                    {currentLift.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    By Pastor West Somina (Senior Pastor) · Vessel of Grace Christian Center
                  </p>
                </div>

                {/* Optional Banner Photo */}
                {currentLift.imageUrl && (
                  <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={currentLift.imageUrl}
                      alt={currentLift.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Bible Verse Quote Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider">
                    <span>Scripture Reference</span>
                    <span className="text-blue-900">· {currentLift.scriptureRef}</span>
                  </div>
                  {currentLift.bibleVerseText && (
                    <p className="text-xs sm:text-sm font-medium text-slate-800 italic leading-relaxed">
                      "{currentLift.bibleVerseText}"
                    </p>
                  )}
                </div>

                {/* Main Message Content */}
                <div className={`${textSizeClasses} text-slate-700 whitespace-pre-line leading-relaxed`}>
                  {currentLift.content}
                </div>

                {/* Optional Daily Prayer Points */}
                {currentLift.prayerPoints && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1.5">
                    <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🙏 Daily Prayer Focus</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-blue-900 whitespace-pre-line leading-relaxed font-medium">
                      {currentLift.prayerPoints}
                    </p>
                  </div>
                )}

                {/* Faith Declaration Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50/50 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Today’s Faith Declaration</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-900 font-semibold italic">
                    "{currentLift.faithDeclaration}"
                  </p>
                </div>

                {/* AI Study Assistance Banner */}
                <div className="p-4 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                      🕊️
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Ask the VOG Bible & Prayer AI</h4>
                      <p className="text-[11px] text-blue-200">
                        Explore {currentLift.scriptureRef} and request personal prayer points.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt(`Explain the spiritual insights of ${currentLift.scriptureRef}: "${currentLift.bibleVerseText || currentLift.title}" and guide me in prayer.`);
                      setIsAiModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-blue-950 text-xs font-bold rounded-xl transition-all self-start sm:self-auto shrink-0 shadow-xs"
                  >
                    Study with Bible AI →
                  </button>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <ShareButtons
                    title={currentLift.title}
                    text={currentLift.content}
                    reference={currentLift.scriptureRef}
                    itemId={currentLift.id}
                    itemType="lift"
                    itemDate={currentLift.date}
                  />

                  <div className="text-xs text-slate-400 font-medium">
                    {currentLift.sharesCount > 0 ? `${currentLift.sharesCount} believers shared` : 'Share with someone today'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
                No Daily Lifts found for this filter.
              </div>
            )}
          </div>

          {/* Previous Lifts Archive Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider">
                  Previous Daily Lifts
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {dailyLifts.length} Messages
                </span>
              </div>

              {/* Search & Category Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by topic, keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['all', 'Encouragement', 'Faith', 'Grace', 'Overcoming', 'Wisdom'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                        categoryFilter === cat
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lifts List */}
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {filteredLifts.map((lift) => {
                  const isSelected = lift.id === selectedLiftId;
                  return (
                    <button
                      key={lift.id}
                      onClick={() => {
                        setSelectedLiftId(lift.id);
                        trackActivity('daily_lift_read', 'Read Daily Lift', lift.title, lift.id);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-900 shadow-sm'
                          : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-bold text-amber-700">{lift.category}</span>
                        <span className="text-slate-400 font-medium">{lift.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {lift.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {lift.scriptureRef} · {lift.content}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DAILY DEVOTIONS */}
      {activeSection === 'devotions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Devotion Reader (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {currentDevotion ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                {/* Devotion Date & Tools */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                      Daily Devotional
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Date: {currentDevotion.date}
                    </span>
                  </div>

                  {/* Font Adjuster */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Reading Size:</span>
                    <button
                      onClick={() => {
                        setFontSize((s) => (s === 'normal' ? 'large' : s === 'large' ? 'xlarge' : 'normal'));
                      }}
                      className="px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      {fontSize.toUpperCase()}
                    </button>
                  </div>
                </div>

                {/* Theme & Reference */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    THEME FOR THE DAY
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-950 font-serif-church">
                    {currentDevotion.theme}
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-blue-900">
                    📖 Bible Anchor: {currentDevotion.bibleRef}
                  </p>
                </div>

                {/* Primary Scripture */}
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs sm:text-sm font-semibold text-slate-800 italic leading-relaxed">
                  "{currentDevotion.bibleVerse}"
                </div>

                {/* In-Depth Devotional Teaching */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    DEVOTIONAL TEACHING & EXPOSITION
                  </h3>
                  <div className={`${textSizeClasses} text-slate-700 whitespace-pre-line space-y-4`}>
                    {currentDevotion.devotionalTeaching}
                  </div>
                </div>

                {/* Prayer of the Day */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <span>Prayer of the Day</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                    "{currentDevotion.prayerOfDay}"
                  </p>
                </div>

                {/* Declaration of Faith */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                    Prophetic Declaration
                  </span>
                  <p className="text-xs sm:text-sm font-semibold italic">
                    "{currentDevotion.faithDeclaration}"
                  </p>
                </div>

                {/* AI Study Assistance Banner for Devotion */}
                <div className="p-4 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                      🕊️
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Ask the VOG Bible & Prayer AI</h4>
                      <p className="text-[11px] text-blue-200">
                        Ask questions about "{currentDevotion.theme}" or explore related scripture teachings.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt(`Explain the biblical teachings in today's devotional: "${currentDevotion.theme}" (${currentDevotion.bibleRef}) and suggest prayer points.`);
                      setIsAiModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-blue-950 text-xs font-bold rounded-xl transition-all self-start sm:self-auto shrink-0 shadow-xs"
                  >
                    Study with Bible AI →
                  </button>
                </div>

                {/* Devotion Footer & Share */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <ShareButtons
                    title={currentDevotion.theme}
                    text={`${currentDevotion.devotionalTeaching}\n\n🙏 Prayer: ${currentDevotion.prayerOfDay}`}
                    reference={currentDevotion.bibleRef}
                    itemId={currentDevotion.id}
                    itemType="devotion"
                    itemDate={currentDevotion.date}
                  />

                  <span className="text-xs text-slate-500 font-semibold">
                    Written by Pastor West Somina · Senior Pastor, VOG
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
                No Devotions found for this date.
              </div>
            )}
          </div>

          {/* Devotions Calendar Archive (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider">
                  Browse by Date
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {dailyDevotions.length} Available
                </span>
              </div>

              {/* Devotions List */}
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredDevotions.map((dev) => {
                  const isSelected = dev.id === selectedDevotionId;
                  return (
                    <button
                      key={dev.id}
                      onClick={() => {
                        setSelectedDevotionId(dev.id);
                        trackActivity('devotional_read', 'Read Daily Devotional', dev.theme, dev.id);
                      }}
                      className={`w-full text-left p-4 rounded-2xl transition-all border ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-900 shadow-sm'
                          : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1 font-semibold text-slate-400">
                        <span className="text-blue-900 font-bold">{dev.date}</span>
                        <span>{dev.bibleRef}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {dev.theme}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        "{dev.bibleVerse}"
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Bible & Prayer Assistant Interactive Modal */}
      <AiBibleAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialPrompt={aiPrompt}
      />
    </div>
  );
};
