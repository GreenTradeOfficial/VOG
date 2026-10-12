import React, { useState } from 'react';
import {
  BellRing,
  Plus,
  Trash2,
  Edit,
  Calendar,
  AlertTriangle,
  X,
  Search,
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { Announcement } from '../types';

export const AdminAnnouncementsManager: React.FC = () => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, showToast } =
    useChurch();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('General');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUrgent, setIsUrgent] = useState(false);

  const openModal = (ann?: Announcement) => {
    if (ann) {
      setEditingAnn(ann);
      setTitle(ann.title);
      setMessage(ann.message);
      setCategory(ann.category);
      setDate(ann.date);
      setIsUrgent(Boolean(ann.isUrgent));
    } else {
      setEditingAnn(null);
      setTitle('');
      setMessage('');
      setCategory('General');
      setDate(new Date().toISOString().split('T')[0]);
      setIsUrgent(false);
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Please enter announcement title and notice message', 'info');
      return;
    }

    if (editingAnn) {
      updateAnnouncement({
        ...editingAnn,
        title: title.trim(),
        message: message.trim(),
        category,
        date,
        isUrgent,
      });
      showToast('Announcement updated in church notices!', 'success');
    } else {
      addAnnouncement({
        title: title.trim(),
        message: message.trim(),
        category,
        date,
        isUrgent,
      });
      showToast('Announcement posted to church notices!', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, annTitle: string) => {
    if (window.confirm(`Are you sure you want to delete announcement "${annTitle}"?`)) {
      deleteAnnouncement(id);
    }
  };

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-blue-950 font-serif-church">
            Manage Official Church Announcements ({announcements.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Post ministry reminders, congregation alerts, and official notices across Firestore.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search announcements by title or keyword..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 shadow-2xs"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-medium">
              No announcements found.
            </div>
          ) : (
            filtered.map((ann) => (
              <div
                key={ann.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-950">
                      {ann.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {ann.date}
                    </span>
                    {ann.isUrgent && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center gap-1 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Urgent Alert
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900">{ann.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{ann.message}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openModal(ann)}
                    className="p-2 text-slate-600 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200"
                    title="Edit announcement"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id, ann.title)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-blue-900" />
                <h3 className="text-base font-extrabold text-blue-950">
                  {editingAnn ? 'Edit Church Announcement' : 'Post Church Announcement'}
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
                  Announcement Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Special Communion Service This Sunday"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department / Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Announcement['category'])}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                  >
                    <option value="General">General Church Notice</option>
                    <option value="Youth">Youth Ministry</option>
                    <option value="Men of Grace">Men of Grace</option>
                    <option value="Women of Grace">Women of Grace</option>
                    <option value="Missions">Missions & Evangelism</option>
                    <option value="Choir">Choir & Worship</option>
                    <option value="Leadership">Leadership & Workers</option>
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Announcement Notice Message *
                </label>
                <textarea
                  rows={3.5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Official notification text for congregation..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="annUrgent"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-600"
                />
                <label htmlFor="annUrgent" className="text-xs font-bold text-slate-700">
                  Mark as Urgent Church Alert (displays high-priority red pill)
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
                  {editingAnn ? 'Update Notice' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
