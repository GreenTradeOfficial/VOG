import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Share2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Bell,
} from 'lucide-react';
import { ChurchEvent } from '../types';
import { ChurchLocationCard } from '../components/ChurchLocationCard';
import { officialChurchInfo } from '../data/mockData';

export const EventsPage: React.FC = () => {
  const { events, addEvent, isAdminMode, showToast } = useChurch();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New event form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ChurchEvent['category']>('Sunday Service');
  const [date, setDate] = useState('2026-10-18');
  const [time, setTime] = useState('09:00 AM');
  const [location, setLocation] = useState(officialChurchInfo.address);
  const [description, setDescription] = useState('');

  const filteredEvents = events.filter((evt) => {
    return categoryFilter === 'all' || evt.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      showToast('Please provide an event title and date', 'info');
      return;
    }

    addEvent({
      title: title.trim(),
      category,
      date,
      time: time.trim() || '10:00 AM',
      location: location.trim() || 'Church Sanctuary (Demo)',
      description: description.trim() || 'All are warmly invited to fellowship and praise.',
    });

    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  // Calendar days generation for October 2026 (starts on Thursday Oct 1, 31 days)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              CHURCH CALENDAR & ACTIVITIES
            </span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-xs text-slate-500 font-medium">Demonstration Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-serif-church">
            Events & Church Programs
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode switcher */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month View
            </button>
          </div>

          {isAdminMode && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-800"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Demonstration Notice */}
      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Sample Demonstration Events:</strong> Church activities, prayer vigils, and conferences displayed here are realistic sample demonstration entries for the presentation. Official dates and physical sanctuary addresses will be confirmed by church leadership.
        </span>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['all', 'Sunday', 'Thursday', 'Prayer', 'Conference', 'Worship'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors min-h-[36px] ${
              categoryFilter === cat
                ? 'bg-blue-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Activities' : cat}
          </button>
        ))}
      </div>

      {/* MONTH VIEW CALENDAR */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 font-serif-church">
              {selectedMonth}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedMonth('September 2026')}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setSelectedMonth('November 2026')}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 py-1">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset for Thu start (4 days) */}
            <div className="aspect-square bg-slate-50/50 rounded-xl" />
            <div className="aspect-square bg-slate-50/50 rounded-xl" />
            <div className="aspect-square bg-slate-50/50 rounded-xl" />
            <div className="aspect-square bg-slate-50/50 rounded-xl" />

            {daysInMonth.map((day) => {
              const dayStr = `2026-10-${day.toString().padStart(2, '0')}`;
              const dayEvents = events.filter((e) => e.date === dayStr);
              const isToday = day === 10;

              return (
                <div
                  key={day}
                  className={`min-h-[70px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                    isToday
                      ? 'bg-blue-50/80 border-blue-900 shadow-sm'
                      : dayEvents.length > 0
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${isToday ? 'text-blue-900 font-extrabold' : 'text-slate-700'}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[9px] bg-blue-900 text-white font-bold px-1 rounded">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayEvents.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => showToast(`${e.title} at ${e.time}`, 'info')}
                        className="text-[9px] sm:text-[10px] font-bold truncate bg-blue-900 text-white px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-800"
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    {evt.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>{evt.date}</span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {evt.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {evt.description}
                </p>

                <div className="space-y-1.5 pt-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-900 shrink-0" />
                    <span className="font-semibold">{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => showToast(`Reminder added for ${evt.title}! 🔔`, 'success')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-900 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors min-h-[40px]"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Set Church Reminder</span>
                </button>

                <button
                  onClick={() => {
                    const shareText = `*VESSEL OF GRACE CHRISTIAN CENTER*\n📅 *${evt.title}*\n🗓️ ${evt.date} at ${evt.time}\n📍 ${evt.location}\n\n${evt.description}`;
                    if (navigator.share) {
                      navigator.share({ title: evt.title, text: shareText });
                    } else {
                      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                    }
                  }}
                  className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title="Share event"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sanctuary Location & Directions Card */}
      <ChurchLocationCard />

      {/* Add Event Modal for Admin */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Schedule Church Event</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Breakthrough Worship Night"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Sunday Service">Sunday Service</option>
                    <option value="Thursday Service">Thursday Service</option>
                    <option value="Prayer Meeting">Prayer Meeting</option>
                    <option value="Special Program">Special Program</option>
                    <option value="Conference">Conference</option>
                    <option value="Worship Night">Worship Night</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 06:30 PM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of the service or church activity..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-900 rounded-xl hover:bg-blue-800"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
