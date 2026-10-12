import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Tv,
  Play,
  Search,
  Clock,
  User,
  BookOpen,
  FileText,
  Share2,
  Heart,
  Plus,
  X,
  Volume2,
} from 'lucide-react';
import { ChurchArtwork } from '../components/ChurchArtwork';
import { Sermon } from '../types';

export const SermonsPage: React.FC = () => {
  const {
    sermons,
    addSermon,
    isAdminMode,
    toggleFavorite,
    isFavorite,
    showToast,
    trackActivity,
  } = useChurch();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New sermon form state
  const [newTitle, setNewTitle] = useState('');
  const [newSpeaker, setNewSpeaker] = useState('Pastor West Somina (Senior Pastor)');
  const [newServiceType, setNewServiceType] = useState<Sermon['serviceType']>('Sunday Celebration');
  const [newScripture, setNewScripture] = useState('');
  const [newDuration, setNewDuration] = useState('48:00');
  const [newSummary, setNewSummary] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const filteredSermons = sermons.filter((sermon) => {
    const matchesCategory =
      categoryFilter === 'all' || sermon.serviceType.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesSearch =
      sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sermon.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sermon.scripture.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateSermon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newScripture.trim()) {
      showToast('Please enter sermon title and scripture reference', 'info');
      return;
    }

    addSermon({
      title: newTitle.trim(),
      speaker: newSpeaker.trim(),
      serviceType: newServiceType,
      scripture: newScripture.trim(),
      duration: newDuration.trim() || '45:00',
      summary: newSummary.trim() || 'Message summary will be added by media ministry.',
      notes: [
        'Main points and scriptures recorded during live service.',
        'Study questions for home cell fellowship.',
      ],
      videoUrl: newVideoUrl.trim() || undefined,
      date: new Date().toISOString().split('T')[0],
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewScripture('');
    setNewSummary('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              WORD MEDIA ARCHIVE
            </span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-xs text-slate-500 font-medium">Sermons & Bible Teachings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-serif-church">
            Sermons & Teachings
          </h1>
        </div>

        {isAdminMode && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Sermon</span>
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by sermon title, preacher, or scripture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900"
          />
        </div>

        {/* Category Pills (Interactive Filter Controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: 'All Sermons', value: 'all' },
            { label: 'Sunday Celebration', value: 'Sunday' },
            { label: 'Thursday Service', value: 'Thursday' },
            { label: 'Special Services', value: 'Special' },
            { label: 'Youth Ignite', value: 'Youth' },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors min-h-[36px] ${
                categoryFilter === cat.value
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sermons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSermons.map((sermon) => {
          const isFav = isFavorite(sermon.id);

          return (
            <div
              key={sermon.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Media Thumbnail */}
              <div
                className="relative aspect-video cursor-pointer overflow-hidden"
                onClick={() => {
                  setSelectedSermon(sermon);
                  trackActivity(
                    'sermon_listen',
                    'Listened to Sermon',
                    `${sermon.title} (${sermon.speaker})`,
                    sermon.id
                  );
                }}
              >
                <ChurchArtwork
                  theme={sermon.serviceType.includes('Sunday') ? 'worship' : 'sermon'}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/95 text-blue-900 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-blue-900 ml-0.5" />
                  </div>
                </div>

                <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-extrabold text-amber-300 tracking-wider">
                  {sermon.serviceType}
                </div>

                <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/70 rounded-md text-[10px] font-mono text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-300" />
                  <span>{sermon.duration}</span>
                </div>
              </div>

              {/* Sermon Content Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>{sermon.date}</span>
                    <span className="font-semibold text-blue-900">📖 {sermon.scripture}</span>
                  </div>

                  <h3
                    onClick={() => setSelectedSermon(sermon)}
                    className="text-base font-bold text-slate-900 hover:text-blue-900 transition-colors cursor-pointer leading-snug line-clamp-2"
                  >
                    {sermon.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {sermon.summary}
                  </p>
                </div>

                {/* Preacher & Actions Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold truncate max-w-[180px]">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{sermon.speaker}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleFavorite(sermon.id, 'sermon', sermon.title, sermon.date)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title={isFav ? 'Remove favorite' : 'Bookmark sermon'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600 text-rose-600' : ''}`} />
                    </button>

                    <button
                      onClick={() => setSelectedSermon(sermon)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs rounded-xl transition-colors"
                    >
                      Watch & Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sermon Detail Modal with Media Player Simulator & Sermon Notes */}
      {selectedSermon && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
            {/* Video Player Box */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <ChurchArtwork
                theme={selectedSermon.serviceType.includes('Sunday') ? 'worship' : 'sermon'}
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="p-4 rounded-full bg-red-600 text-white shadow-2xl animate-pulse">
                  <Play className="w-8 h-8 fill-white ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                <span className="font-mono bg-black/60 px-2 py-0.5 rounded">
                  00:00 / {selectedSermon.duration}
                </span>
                <span className="bg-blue-900/80 px-2.5 py-0.5 rounded font-bold">
                  {selectedSermon.serviceType}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-7 space-y-5 max-h-[60vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
                    <span>{selectedSermon.date}</span>
                    <span>·</span>
                    <span className="text-blue-900">{selectedSermon.speaker}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-blue-950 font-serif-church">
                    {selectedSermon.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedSermon(null)}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scripture Anchor */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs sm:text-sm font-semibold text-blue-950">
                📖 Scripture Reading: {selectedSermon.scripture}
              </div>

              {/* Message Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Message Overview
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedSermon.summary}
                </p>
              </div>

              {/* Sermon Key Points / Study Notes */}
              {selectedSermon.notes && selectedSermon.notes.length > 0 && (
                <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-blue-900" />
                    <span>Sermon Study Notes & Key Points</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {selectedSermon.notes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-900 mt-1.5 shrink-0" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      toggleFavorite(selectedSermon.id, 'sermon', selectedSermon.title, selectedSermon.date);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Bookmark Sermon</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast('Sermon study notes copied to clipboard!', 'success');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span>Copy Notes</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedSermon(null)}
                  className="px-5 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Sermon Modal for Admin */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Sermon to Archive</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSermon} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sermon Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Walking in Divine Favor"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Speaker *</label>
                  <input
                    type="text"
                    required
                    value={newSpeaker}
                    onChange={(e) => setNewSpeaker(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type</label>
                  <select
                    value={newServiceType}
                    onChange={(e) => setNewServiceType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Sunday Celebration">Sunday Celebration</option>
                    <option value="Thursday Service">Thursday Service</option>
                    <option value="Special Miracle Service">Special Miracle Service</option>
                    <option value="Grace Conference">Grace Conference</option>
                    <option value="Youth Ignite">Youth Ignite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scripture *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Romans 8:28"
                    value={newScripture}
                    onChange={(e) => setNewScripture(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 50:15"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Summary / Message Notes</label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Key teachings and takeaways from the sermon..."
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
                  Save Sermon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
