import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit,
  Clock,
  MapPin,
  Sparkles,
  X,
  Search,
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { ChurchEvent } from '../types';

export const AdminEventsManager: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, showToast } = useChurch();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ChurchEvent['category']>('Sunday Service');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('8:00 AM – 11:00 AM');
  const [location, setLocation] = useState(
    'Beside AP (Front) Filling Station, Omagwa, Port Harcourt, Rivers State'
  );
  const [description, setDescription] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(false);

  const openModal = (evt?: ChurchEvent) => {
    if (evt) {
      setEditingEvent(evt);
      setTitle(evt.title);
      setCategory(evt.category);
      setDate(evt.date);
      setTime(evt.time);
      setLocation(evt.location);
      setDescription(evt.description);
      setIsHighlighted(Boolean(evt.isHighlighted));
    } else {
      setEditingEvent(null);
      setTitle('');
      setCategory('Sunday Service');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('8:00 AM – 11:00 AM');
      setLocation('Beside AP (Front) Filling Station, Omagwa, Port Harcourt, Rivers State');
      setDescription('');
      setIsHighlighted(false);
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) {
      showToast('Please enter event title and date', 'info');
      return;
    }

    if (editingEvent) {
      updateEvent({
        ...editingEvent,
        title: title.trim(),
        category,
        date,
        time: time.trim(),
        location: location.trim(),
        description: description.trim(),
        isHighlighted,
      });
      showToast('Event updated in church calendar!', 'success');
    } else {
      addEvent({
        title: title.trim(),
        category,
        date,
        time: time.trim(),
        location: location.trim(),
        description: description.trim(),
        isHighlighted,
      });
      showToast('Event scheduled in church calendar!', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, eventTitle: string) => {
    if (window.confirm(`Are you sure you want to delete event "${eventTitle}"?`)) {
      deleteEvent(id);
    }
  };

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-blue-950 font-serif-church">
            Manage Church Events & Programs ({events.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Weekly services, anniversary schedules, and special conferences synced to Firestore.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Church Event</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search events by title or category..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 shadow-2xs"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-medium">
              No events found matching your search.
            </div>
          ) : (
            filtered.map((evt) => (
              <div
                key={evt.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-950">
                      {evt.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {evt.date}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {evt.time}
                    </span>
                    {evt.isHighlighted && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900">{evt.title}</h4>

                  <p className="text-xs text-slate-600 line-clamp-1">{evt.description}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{evt.location}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openModal(evt)}
                    className="p-2 text-slate-600 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200"
                    title="Edit event"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(evt.id, evt.title)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-900" />
                <h3 className="text-base font-extrabold text-blue-950">
                  {editingEvent ? 'Edit Church Event' : 'Schedule New Church Event'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sunday Celebration & Word Encounter"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Event Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ChurchEvent['category'])}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                  >
                    <option value="Sunday Service">Sunday Service</option>
                    <option value="Thursday Service">Thursday Service</option>
                    <option value="Prayer Meeting">Prayer Meeting</option>
                    <option value="Special Program">Special Program</option>
                    <option value="Conference">Conference</option>
                    <option value="Worship Night">Worship Night</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time Description
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 8:00 AM – 11:00 AM"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Details
                </label>
                <textarea
                  rows={2.5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Program overview and invitations..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="evtHighlight"
                  checked={isHighlighted}
                  onChange={(e) => setIsHighlighted(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900"
                />
                <label htmlFor="evtHighlight" className="text-xs font-bold text-slate-700">
                  Highlight as Featured Church Program on Home Dashboard
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-sm"
                >
                  {editingEvent ? 'Update Event' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
