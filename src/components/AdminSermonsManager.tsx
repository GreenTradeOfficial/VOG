import React, { useState } from 'react';
import {
  Tv,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Calendar,
  User,
  Clock,
  BookOpen,
  Search,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { Sermon } from '../types';

export const AdminSermonsManager: React.FC = () => {
  const { sermons, addSermon, updateSermon, deleteSermon, showToast } = useChurch();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('Pastor West Somina');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState<Sermon['serviceType']>('Sunday Celebration');
  const [scripture, setScripture] = useState('');
  const [duration, setDuration] = useState('1h 15m');
  const [summary, setSummary] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [notesText, setNotesText] = useState('');

  const openModal = (sermon?: Sermon) => {
    if (sermon) {
      setEditingSermon(sermon);
      setTitle(sermon.title);
      setSpeaker(sermon.speaker);
      setDate(sermon.date);
      setServiceType(sermon.serviceType);
      setScripture(sermon.scripture);
      setDuration(sermon.duration);
      setSummary(sermon.summary);
      setVideoUrl(sermon.videoUrl || '');
      setNotesText(sermon.notes ? sermon.notes.join('\n') : '');
    } else {
      setEditingSermon(null);
      setTitle('');
      setSpeaker('Pastor West Somina');
      setDate(new Date().toISOString().split('T')[0]);
      setServiceType('Sunday Celebration');
      setScripture('1 Corinthians 2:9–10');
      setDuration('1h 15m');
      setSummary('');
      setVideoUrl('');
      setNotesText('');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !speaker.trim()) {
      showToast('Please enter sermon title and preacher name', 'info');
      return;
    }

    const notesList = notesText
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (editingSermon) {
      updateSermon({
        ...editingSermon,
        title: title.trim(),
        speaker: speaker.trim(),
        date,
        serviceType,
        scripture: scripture.trim() || 'John 1:16',
        duration: duration.trim() || '1h 15m',
        summary: summary.trim(),
        videoUrl: videoUrl.trim() || undefined,
        notes: notesList,
      });
      showToast('Sermon updated in church cloud library!', 'success');
    } else {
      addSermon({
        title: title.trim(),
        speaker: speaker.trim(),
        date,
        serviceType,
        scripture: scripture.trim() || 'John 1:16',
        duration: duration.trim() || '1h 15m',
        summary: summary.trim(),
        videoUrl: videoUrl.trim() || undefined,
        notes: notesList,
      });
      showToast('Sermon published to church cloud library!', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, sermonTitle: string) => {
    if (window.confirm(`Are you sure you want to delete sermon "${sermonTitle}"?`)) {
      deleteSermon(id);
    }
  };

  const filtered = sermons.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scripture.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-blue-950 font-serif-church">
            Manage Church Sermons Archive ({sermons.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Published recordings & sermon study notes synced across Firestore.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sermon Recording</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by sermon title, preacher, or scripture passage..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 shadow-2xs"
        />
      </div>

      {/* Sermons List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-medium">
              No sermons found matching your search.
            </div>
          ) : (
            filtered.map((sermon) => (
              <div
                key={sermon.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-950">
                      {sermon.serviceType}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {sermon.date}
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.2 rounded border border-amber-200/60">
                      {sermon.scripture}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900">
                    {sermon.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    <strong className="text-blue-950">{sermon.speaker}</strong> · {sermon.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openModal(sermon)}
                    className="p-2 text-slate-600 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200"
                    title="Edit sermon"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sermon.id, sermon.title)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                    title="Delete sermon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sermon Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-blue-900" />
                <h3 className="text-base font-extrabold text-blue-950">
                  {editingSermon ? 'Edit Sermon Recording' : 'Publish New Sermon Recording'}
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
                  Sermon Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Access into the Deep Things of God"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preacher / Minister *
                  </label>
                  <input
                    type="text"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Service Date *
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
                    Service Type
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as Sermon['serviceType'])}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                  >
                    <option value="Sunday Celebration">Sunday Celebration</option>
                    <option value="Thursday Service">Thursday Service</option>
                    <option value="Special Miracle Service">Special Miracle Service</option>
                    <option value="Grace Conference">Grace Conference</option>
                    <option value="Youth Ignite">Youth Ignite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Scripture Passage
                  </label>
                  <input
                    type="text"
                    value={scripture}
                    onChange={(e) => setScripture(e.target.value)}
                    placeholder="e.g. 1 Corinthians 2:9–10"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 1h 15m"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Video URL (YouTube/Facebook/HLS)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://facebook.com/... or https://youtu.be/..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sermon Message Summary
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Key spiritual takeaways and foundational teachings from this message..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Study Notes & Key Points (One per line)
                </label>
                <textarea
                  rows={3}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="1. Grace gives you direct access to God's deep mysteries&#10;2. The Holy Spirit searches the deep things of God&#10;3. Faith unlocks what eye has not seen"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                />
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
                  {editingSermon ? 'Update Sermon' : 'Publish Sermon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
