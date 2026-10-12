import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  BellRing,
  AlertTriangle,
  Plus,
  Trash2,
  Share2,
  Calendar,
  X,
  MessageSquare,
} from 'lucide-react';
import { Announcement } from '../types';

export const AnnouncementsPage: React.FC = () => {
  const { announcements, addAnnouncement, deleteAnnouncement, isAdminMode, showToast } = useChurch();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New announcement form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('General');
  const [isUrgent, setIsUrgent] = useState(false);

  const filteredAnnouncements = announcements.filter((ann) => {
    return categoryFilter === 'all' || ann.category === categoryFilter;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Please enter an announcement title and message', 'info');
      return;
    }

    addAnnouncement({
      title: title.trim(),
      message: message.trim(),
      category,
      isUrgent,
      date: new Date().toISOString().split('T')[0],
    });

    setShowAddModal(false);
    setTitle('');
    setMessage('');
    setIsUrgent(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              OFFICIAL CHURCH BULLETINS
            </span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-xs text-slate-500 font-medium">Verified Information</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-serif-church">
            Announcements & Bulletins
          </h1>
        </div>

        {isAdminMode && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-800 shadow-sm min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['all', 'General', 'Youth', 'Men of Grace', 'Women of Grace', 'Missions', 'Choir', 'Leadership'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors min-h-[36px] ${
              categoryFilter === cat
                ? 'bg-blue-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Bulletins' : cat}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white rounded-3xl p-6 border transition-all shadow-sm hover:shadow-md ${
              ann.isUrgent
                ? 'border-red-300 ring-1 ring-red-200/50'
                : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {ann.isUrgent ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-extrabold uppercase tracking-wide">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    <span>Important Bulletin</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-900 text-[10px] font-bold uppercase tracking-wider">
                    {ann.category}
                  </span>
                )}
                <span className="text-xs text-slate-400 font-medium">
                  {ann.date}
                </span>
              </div>

              {isAdminMode && (
                <button
                  onClick={() => {
                    if (window.confirm('Delete this announcement from prototype?')) {
                      deleteAnnouncement(ann.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg self-end sm:self-auto"
                  title="Delete announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {ann.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {ann.message}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Official Vessel of Grace Communication</span>

              <button
                onClick={() => {
                  const shareText = `📢 *VESSEL OF GRACE CHRISTIAN CENTER*\n*${ann.title}*\n\n${ann.message}`;
                  if (navigator.share) {
                    navigator.share({ title: ann.title, text: shareText });
                  } else {
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                  }
                }}
                className="flex items-center gap-1.5 text-blue-900 font-bold hover:text-blue-950 p-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Notice</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Post Church Announcement</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Thanksgiving Service"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ministry Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="General">General</option>
                  <option value="Youth">Youth</option>
                  <option value="Men of Grace">Men of Grace</option>
                  <option value="Women of Grace">Women of Grace</option>
                  <option value="Missions">Missions</option>
                  <option value="Choir">Choir</option>
                  <option value="Leadership">Leadership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detailed announcement for the congregation..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentCheck"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded text-red-600"
                />
                <label htmlFor="urgentCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Mark as Urgent Notice (Red highlighted banner)
                </label>
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
                  Post Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
