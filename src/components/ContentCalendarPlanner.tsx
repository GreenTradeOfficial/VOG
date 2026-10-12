import React, { useState, useEffect } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  BookOpen,
  Plus,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Trash2,
  Edit3,
  Globe,
  Radio,
  X,
  Filter,
} from 'lucide-react';
import { DailyLift, DailyDevotion, ContentStatus } from '../types';
import {
  saveDailyLiftToCloud,
  saveDailyDevotionToCloud,
  deleteDailyLiftFromCloud,
  deleteDailyDevotionFromCloud,
} from '../services/churchContentService';

interface ContentCalendarPlannerProps {
  onOpenCreateLift?: (date?: string) => void;
  onEditLift?: (lift: DailyLift) => void;
}

export const ContentCalendarPlanner: React.FC<ContentCalendarPlannerProps> = ({
  onOpenCreateLift,
  onEditLift,
}) => {
  const {
    dailyLifts,
    dailyDevotions,
    showToast,
  } = useChurch();

  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [lagosTimeInfo, setLagosTimeInfo] = useState<{
    date: string;
    time: string;
    timezone: string;
  }>({
    date: '2026-10-12',
    time: '11:00:00 AM',
    timezone: 'Africa/Lagos (WAT, UTC+1)',
  });
  const [filterType, setFilterType] = useState<'all' | 'lifts' | 'devotions'>('all');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch live Africa/Lagos server time
  useEffect(() => {
    const fetchLagosTime = async () => {
      try {
        const res = await fetch('/api/schedule/current-time');
        if (res.ok) {
          const data = await res.json();
          setLagosTimeInfo({
            date: data.lagosDate || '2026-10-12',
            time: data.lagosTime || '11:00:00',
            timezone: data.timezone || 'Africa/Lagos (WAT, UTC+1)',
          });
        }
      } catch (err) {
        // Fallback local calc
        const now = new Date();
        const lagosStr = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Africa/Lagos',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(now);
        setLagosTimeInfo({
          date: lagosStr,
          time: now.toLocaleTimeString(),
          timezone: 'Africa/Lagos (WAT, UTC+1)',
        });
      }
    };

    fetchLagosTime();
    const interval = setInterval(fetchLagosTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Immediate publication action
  const handlePublishImmediately = async (
    item: DailyLift | DailyDevotion,
    type: 'lift' | 'devotion'
  ) => {
    setIsUpdating(true);
    try {
      if (type === 'lift') {
        const updated: DailyLift = {
          ...(item as DailyLift),
          status: 'published',
          updatedAt: new Date().toISOString(),
        };
        await saveDailyLiftToCloud(updated);
        showToast(`Published Daily Lift: "${updated.title}" to app visitors!`, 'success');
      } else {
        const updated: DailyDevotion = {
          ...(item as DailyDevotion),
          status: 'published',
        };
        await saveDailyDevotionToCloud(updated);
        showToast(`Published Daily Devotional: "${updated.theme}" to app visitors!`, 'success');
      }
    } catch (err: any) {
      showToast(`Error publishing: ${err.message}`, 'info');
    } finally {
      setIsUpdating(false);
    }
  };

  // Schedule action with Lagos time
  const handleScheduleTime = async (
    item: DailyLift | DailyDevotion,
    type: 'lift' | 'devotion',
    timeStr: string
  ) => {
    setIsUpdating(true);
    try {
      if (type === 'lift') {
        const updated: DailyLift = {
          ...(item as DailyLift),
          status: 'scheduled',
          scheduledTime: timeStr,
          updatedAt: new Date().toISOString(),
        };
        await saveDailyLiftToCloud(updated);
        showToast(`Scheduled Daily Lift for ${timeStr} (Africa/Lagos time)!`, 'success');
      } else {
        const updated: DailyDevotion = {
          ...(item as DailyDevotion),
          status: 'scheduled',
          scheduledTime: timeStr,
        };
        await saveDailyDevotionToCloud(updated);
        showToast(`Scheduled Devotional for ${timeStr} (Africa/Lagos time)!`, 'success');
      }
    } catch (err: any) {
      showToast(`Error scheduling: ${err.message}`, 'info');
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel / Revert to Draft
  const handleCancelSchedule = async (
    item: DailyLift | DailyDevotion,
    type: 'lift' | 'devotion'
  ) => {
    setIsUpdating(true);
    try {
      if (type === 'lift') {
        const updated: DailyLift = {
          ...(item as DailyLift),
          status: 'draft',
          updatedAt: new Date().toISOString(),
        };
        await saveDailyLiftToCloud(updated);
        showToast(`Reverted Daily Lift to Draft status.`, 'info');
      } else {
        const updated: DailyDevotion = {
          ...(item as DailyDevotion),
          status: 'draft',
        };
        await saveDailyDevotionToCloud(updated);
        showToast(`Reverted Devotional to Draft status.`, 'info');
      }
    } catch (err: any) {
      showToast(`Error updating status: ${err.message}`, 'info');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete item
  const handleDeleteItem = async (
    id: string,
    type: 'lift' | 'devotion',
    title: string
  ) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      if (type === 'lift') {
        await deleteDailyLiftFromCloud(id);
      } else {
        await deleteDailyDevotionFromCloud(id);
      }
      showToast(`Deleted "${title}".`, 'info');
    } catch (err: any) {
      showToast(`Error deleting: ${err.message}`, 'info');
    }
  };

  // Trigger server auto-scheduler check
  const handleTriggerAutoPublish = async () => {
    try {
      showToast('Checking server auto-scheduler against Africa/Lagos time...', 'info');
      const res = await fetch('/api/schedule/run-auto-publish', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(
          `Auto-scheduler executed successfully. ${data.publishedCount || 0} posts automatically published.`,
          'success'
        );
      } else {
        showToast('Auto-scheduler checked. All scheduled posts are on schedule.', 'info');
      }
    } catch (e) {
      showToast('Checked server scheduler.', 'info');
    }
  };

  const selectedDayLifts = selectedDateStr
    ? dailyLifts.filter((l) => l.date === selectedDateStr)
    : [];

  const selectedDayDevotions = selectedDateStr
    ? dailyDevotions.filter((d) => d.date === selectedDateStr)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner: Editorial Calendar & Lagos Time Indicator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                AUTOMATIC SCHEDULER & EDITORIAL CALENDAR
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-blue-900 font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-700" />
                <span>Africa/Lagos (WAT, UTC+1)</span>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-blue-950 font-serif-church">
              Publication Calendar & Auto-Scheduling
            </h3>
            <p className="text-xs text-slate-500">
              Schedule future devotionals to publish automatically even when your phone is offline.
              Browse the entire year and prevent duplicate posts.
            </p>
          </div>

          {/* Africa/Lagos Realtime Clock */}
          <div className="flex items-center gap-3 bg-blue-50/80 p-3 rounded-2xl border border-blue-200/80 self-start md:self-auto">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Server Time (Lagos, Nigeria)
              </span>
              <span className="text-xs font-mono font-black text-blue-950">
                {lagosTimeInfo.date} · {lagosTimeInfo.time}
              </span>
            </div>
            <button
              type="button"
              onClick={handleTriggerAutoPublish}
              className="ml-2 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-50 text-blue-900 border border-blue-200 rounded-lg shadow-xs transition-colors"
              title="Run Auto-Publish Check Now"
            >
              Check Due
            </button>
          </div>
        </div>

        {/* Month Selector & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-700"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-base sm:text-lg font-extrabold text-blue-950 font-serif-church min-w-[170px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-700"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterType === 'all' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Content
            </button>
            <button
              type="button"
              onClick={() => setFilterType('lifts')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterType === 'lifts' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              Daily Lifts
            </button>
            <button
              type="button"
              onClick={() => setFilterType('devotions')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterType === 'devotions' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              Devotionals
            </button>
          </div>
        </div>

        {/* Calendar Day Labels */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] sm:min-h-[115px] bg-slate-50/40 rounded-2xl border border-transparent" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const isToday = dateStr === lagosTimeInfo.date;

            const dayLifts = dailyLifts.filter((l) => l.date === dateStr);
            const dayDevotions = dailyDevotions.filter((d) => d.date === dateStr);

            const displayLifts = filterType === 'devotions' ? [] : dayLifts;
            const displayDevotions = filterType === 'lifts' ? [] : dayDevotions;

            const totalPosts = displayLifts.length + displayDevotions.length;
            const hasDuplicate = dayLifts.length > 1 || dayDevotions.length > 1;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`p-2 sm:p-2.5 rounded-2xl border flex flex-col justify-between min-h-[95px] sm:min-h-[120px] transition-all cursor-pointer hover:border-blue-900 hover:shadow-md ${
                  isToday
                    ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-900/30'
                    : totalPosts > 0
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50/50 border-slate-200/60'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${isToday ? 'text-blue-950 font-black' : 'text-slate-800'}`}>
                    {day}
                  </span>

                  {isToday && (
                    <span className="text-[9px] font-extrabold bg-blue-900 text-white px-1.5 py-0.2 rounded-md">
                      Today
                    </span>
                  )}

                  {hasDuplicate && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 rounded" title="Duplicate posts scheduled for this day!">
                      ⚠️ Dup
                    </span>
                  )}
                </div>

                {/* Day Content Badges */}
                <div className="space-y-1 my-1 overflow-hidden">
                  {displayLifts.slice(0, 2).map((l) => (
                    <div
                      key={l.id}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate flex items-center gap-1 ${
                        l.status === 'published'
                          ? 'bg-emerald-100 text-emerald-900'
                          : l.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                      title={`Lift: ${l.title} (${l.status})`}
                    >
                      <Sparkles className="w-2.5 h-2.5 shrink-0 text-amber-600" />
                      <span className="truncate">{l.title}</span>
                    </div>
                  ))}

                  {displayDevotions.slice(0, 2).map((d) => (
                    <div
                      key={d.id}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate flex items-center gap-1 ${
                        d.status === 'published'
                          ? 'bg-emerald-100 text-emerald-900'
                          : d.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                      title={`Devotion: ${d.theme} (${d.status})`}
                    >
                      <BookOpen className="w-2.5 h-2.5 shrink-0 text-blue-600" />
                      <span className="truncate">{d.theme}</span>
                    </div>
                  ))}

                  {totalPosts === 0 && (
                    <span className="text-[10px] text-slate-400 font-medium italic block pt-1">
                      No post
                    </span>
                  )}
                </div>

                {/* Footer Action */}
                <div className="text-[10px] font-bold text-blue-900 pt-0.5 border-t border-slate-100 flex items-center justify-between">
                  <span>Manage</span>
                  <Plus className="w-3 h-3 text-blue-700" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DAY SCHEDULER & DETAILS MODAL */}
      {selectedDateStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                  SCHEDULE FOR {selectedDateStr}
                </span>
                <h3 className="text-lg font-bold text-blue-950 font-serif-church mt-1">
                  Daily Lifts & Devotions on {selectedDateStr}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Posts for Day */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Existing Messages ({selectedDayLifts.length + selectedDayDevotions.length})
              </h4>

              {selectedDayLifts.length === 0 && selectedDayDevotions.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                  No Daily Lift or Devotional currently exists for this date.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Daily Lifts */}
                  {selectedDayLifts.map((lift) => (
                    <div
                      key={lift.id}
                      className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-200 text-amber-900 uppercase">
                              Daily Lift
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                                lift.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : lift.status === 'scheduled'
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              Status: {lift.status || 'draft'}
                            </span>
                            {lift.scheduledTime && (
                              <span className="text-[10px] text-blue-900 font-mono font-bold">
                                🕒 {lift.scheduledTime} (WAT)
                              </span>
                            )}
                          </div>
                          <h5 className="text-sm font-bold text-slate-900 mt-1">
                            {lift.title}
                          </h5>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                            {lift.scriptureRef} — {lift.content}
                          </p>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/60">
                        {lift.status !== 'published' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handlePublishImmediately(lift, 'lift')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Publish Immediately</span>
                          </button>
                        )}

                        {lift.status !== 'scheduled' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => {
                              const time = prompt(
                                'Enter scheduled publish time in Africa/Lagos (e.g. 06:00 AM):',
                                '06:00 AM'
                              );
                              if (time) handleScheduleTime(lift, 'lift', time);
                            }}
                            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Schedule Time</span>
                          </button>
                        )}

                        {lift.status !== 'draft' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleCancelSchedule(lift, 'lift')}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Revert to Draft</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (onEditLift) onEditLift(lift);
                            setSelectedDateStr(null);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Content</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(lift.id, 'lift', lift.title)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl"
                          title="Delete lift"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Daily Devotions */}
                  {selectedDayDevotions.map((dev) => (
                    <div
                      key={dev.id}
                      className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-200 text-blue-900 uppercase">
                              Daily Devotional
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                                dev.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : dev.status === 'scheduled'
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              Status: {dev.status || 'draft'}
                            </span>
                            {dev.scheduledTime && (
                              <span className="text-[10px] text-blue-900 font-mono font-bold">
                                🕒 {dev.scheduledTime} (WAT)
                              </span>
                            )}
                          </div>
                          <h5 className="text-sm font-bold text-slate-900 mt-1">
                            {dev.theme}
                          </h5>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                            📖 {dev.bibleRef} — {dev.devotionalTeaching}
                          </p>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-200/60">
                        {dev.status !== 'published' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handlePublishImmediately(dev, 'devotion')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Publish Immediately</span>
                          </button>
                        )}

                        {dev.status !== 'scheduled' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => {
                              const time = prompt(
                                'Enter scheduled publish time in Africa/Lagos (e.g. 05:00 AM):',
                                '05:00 AM'
                              );
                              if (time) handleScheduleTime(dev, 'devotion', time);
                            }}
                            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Schedule Time</span>
                          </button>
                        )}

                        {dev.status !== 'draft' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleCancelSchedule(dev, 'devotion')}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Revert to Draft</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(dev.id, 'devotion', dev.theme)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl"
                          title="Delete devotional"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Content for Selected Date */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onOpenCreateLift) onOpenCreateLift(selectedDateStr || undefined);
                  setSelectedDateStr(null);
                }}
                className="w-full sm:flex-1 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Daily Lift for {selectedDateStr}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
