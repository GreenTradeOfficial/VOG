import React, { useState, useRef } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  CheckCircle2,
  AlertCircle,
  Upload,
  Camera,
  Image as ImageIcon,
  FileText,
  Volume2,
  Calendar,
  X,
  Save,
  Radio,
  BookOpen,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { DailyLift, ContentStatus } from '../types';
import { uploadPhotoPermanently, validateImageFile } from '../services/photoStorageService';

export const AdminDailyLiftsManager: React.FC = () => {
  const { dailyLifts, addDailyLift, updateDailyLift, deleteDailyLift, showToast } = useChurch();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal form states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingLift, setEditingLift] = useState<DailyLift | null>(null);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [category, setCategory] = useState<DailyLift['category']>('Encouragement');
  const [scriptureRef, setScriptureRef] = useState<string>('');
  const [bibleVerseText, setBibleVerseText] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [prayerPoints, setPrayerPoints] = useState<string>('');
  const [faithDeclaration, setFaithDeclaration] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [status, setStatus] = useState<ContentStatus>('published');

  // Photo upload states
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Preview Modal
  const [previewLift, setPreviewLift] = useState<DailyLift | null>(null);

  const filteredLifts = dailyLifts.filter((lift) => {
    if (statusFilter !== 'all' && lift.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        lift.title.toLowerCase().includes(q) ||
        lift.content.toLowerCase().includes(q) ||
        lift.scriptureRef.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openAddModal = () => {
    setEditingLift(null);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Encouragement');
    setScriptureRef('');
    setBibleVerseText('');
    setContent('');
    setPrayerPoints('');
    setFaithDeclaration('');
    setImageUrl('');
    setAudioUrl('');
    setAttachmentUrl('');
    setStatus('published');
    setUploadError(null);
    setShowModal(true);
  };

  const openEditModal = (lift: DailyLift) => {
    setEditingLift(lift);
    setTitle(lift.title);
    setDate(lift.date);
    setCategory(lift.category);
    setScriptureRef(lift.scriptureRef || '');
    setBibleVerseText(lift.bibleVerseText || '');
    setContent(lift.content || '');
    setPrayerPoints(lift.prayerPoints || '');
    setFaithDeclaration(lift.faithDeclaration || '');
    setImageUrl(lift.imageUrl || '');
    setAudioUrl(lift.audioUrl || '');
    setAttachmentUrl(lift.attachmentUrl || '');
    setStatus(lift.status);
    setUploadError(null);
    setShowModal(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid image file.');
      showToast(validation.error || 'Invalid file', 'info');
      return;
    }

    try {
      setIsUploading(true);
      setUploadPercent(15);
      setUploadError(null);

      const tag = (title || 'daily-lift').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const res = await uploadPhotoPermanently(file, 'daily-lifts', tag, (pct) =>
        setUploadPercent(pct)
      );

      setImageUrl(res.url);
      setIsUploading(false);
      showToast('Daily Lift image saved to permanent cloud storage!', 'success');
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(err.message || 'Image upload failed.');
      showToast(`Upload note: ${err.message}`, 'info');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = (targetStatus: ContentStatus) => {
    if (!title.trim()) {
      showToast('Please enter a Title or Theme for the Daily Lift', 'info');
      return;
    }
    if (!content.trim()) {
      showToast('Please enter the message or devotional content', 'info');
      return;
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      scriptureRef: scriptureRef.trim() || 'Philippians 4:13',
      bibleVerseText: bibleVerseText.trim(),
      date: date || new Date().toISOString().split('T')[0],
      author: 'Pastor West Somina (Senior Pastor)',
      category,
      faithDeclaration:
        faithDeclaration.trim() ||
        'I declare that God’s grace is sufficient for me and His mercy speaks over my day!',
      prayerPoints: prayerPoints.trim(),
      imageUrl: imageUrl.trim(),
      audioUrl: audioUrl.trim(),
      attachmentUrl: attachmentUrl.trim(),
      status: targetStatus,
    };

    if (editingLift) {
      updateDailyLift({
        ...editingLift,
        ...payload,
      });
      showToast(
        targetStatus === 'published'
          ? 'Daily Lift published to church cloud!'
          : 'Daily Lift draft saved!',
        'success'
      );
    } else {
      addDailyLift(payload);
      showToast(
        targetStatus === 'published'
          ? 'New Daily Lift published to church cloud!'
          : 'New Daily Lift saved as draft!',
        'success'
      );
    }

    setShowModal(false);
  };

  const handleTogglePublish = (lift: DailyLift) => {
    const nextStatus: ContentStatus = lift.status === 'published' ? 'draft' : 'published';
    updateDailyLift({
      ...lift,
      status: nextStatus,
    });
    showToast(
      nextStatus === 'published'
        ? `"${lift.title}" is now published and visible to all users!`
        : `"${lift.title}" moved to drafts (hidden from congregation).`,
      'info'
    );
  };

  const handleDelete = (id: string) => {
    deleteDailyLift(id);
    showToast('Daily Lift entry deleted.', 'info');
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 p-6 rounded-3xl text-white shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-300/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>DAILY PROPHETIC ENCOURAGEMENTS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-serif-church">
            Daily Lift Program Management
          </h2>
          <p className="text-xs text-blue-200/90 max-w-xl leading-relaxed">
            Create, edit, and publish the daily spiritual lifts provided by the Pastor. Draft entries stay hidden until you publish them. All published entries sync to members' devices in real-time.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Lift</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({dailyLifts.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'published'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Published ({dailyLifts.filter((l) => l.status === 'published').length})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'draft'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Drafts ({dailyLifts.filter((l) => l.status === 'draft').length})
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            placeholder="Search title, scripture, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20"
          />
        </div>
      </div>

      {/* Daily Lifts List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredLifts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">
              No Daily Lift entries found.
            </p>
            <p className="text-xs text-slate-400">
              Click "+ New Daily Lift" to write or paste the first encouragement from the pastor.
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-xl"
            >
              Add First Daily Lift
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLifts.map((lift) => {
              const isPub = lift.status === 'published';

              return (
                <div
                  key={lift.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isPub
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isPub ? 'Published' : 'Draft (Unpublished)'}
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {lift.date}
                      </span>
                      <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        {lift.category}
                      </span>
                      {lift.imageUrl && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 flex items-center gap-0.5">
                          <ImageIcon className="w-2.5 h-2.5" /> Photo
                        </span>
                      )}
                      {lift.prayerPoints && (
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          + Prayers
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {lift.title}
                    </h4>

                    {lift.scriptureRef && (
                      <p className="text-xs text-blue-900 font-semibold truncate">
                        📖 {lift.scriptureRef} {lift.bibleVerseText ? `— "${lift.bibleVerseText}"` : ''}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {lift.content}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0 flex-wrap">
                    {/* Toggle Publish / Draft */}
                    <button
                      onClick={() => handleTogglePublish(lift)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                        isPub
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                      title={isPub ? 'Unpublish to draft' : 'Publish to congregation'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isPub ? 'Unpublish' : 'Publish'}</span>
                    </button>

                    {/* Preview Button */}
                    <button
                      onClick={() => setPreviewLift(lift)}
                      className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-xl"
                      title="Preview how members see this"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => {
                        addDailyLift({
                          ...lift,
                          title: `${lift.title} (Copy)`,
                          date: new Date().toISOString().split('T')[0],
                          status: 'draft',
                        });
                        showToast('Duplicated as a new draft!', 'info');
                      }}
                      className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-xl"
                      title="Duplicate as draft"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(lift)}
                      className="p-2 text-blue-900 hover:bg-blue-50 rounded-xl"
                      title="Edit Daily Lift"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteConfirmId(lift.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      title="Delete Daily Lift"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">
                Delete Daily Lift?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove this encouragement? It will be permanently removed from all devices.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewLift && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                MEMBER VIEW PREVIEW
              </span>
              <button onClick={() => setPreviewLift(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewLift.imageUrl && (
              <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={previewLift.imageUrl}
                  alt={previewLift.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>{previewLift.date}</span>
                <span className="text-blue-900">{previewLift.category}</span>
              </div>
              <h3 className="text-lg font-extrabold text-blue-950 font-serif-church">
                {previewLift.title}
              </h3>
              {previewLift.scriptureRef && (
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 text-xs text-amber-950 font-medium">
                  <strong>{previewLift.scriptureRef}</strong>
                  {previewLift.bibleVerseText && <p className="italic mt-0.5">"{previewLift.bibleVerseText}"</p>}
                </div>
              )}
            </div>

            <div className="text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line">
              {previewLift.content}
            </div>

            {previewLift.prayerPoints && (
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/60 space-y-1">
                <h5 className="text-[11px] font-bold text-blue-950 uppercase tracking-wider">
                  🙏 Today's Prayer Focus:
                </h5>
                <p className="text-xs text-blue-900 whitespace-pre-line">
                  {previewLift.prayerPoints}
                </p>
              </div>
            )}

            {previewLift.faithDeclaration && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold">
                ✨ Faith Declaration: "{previewLift.faithDeclaration}"
              </div>
            )}

            <button
              onClick={() => setPreviewLift(null)}
              className="w-full py-2.5 bg-blue-900 text-white font-bold text-xs rounded-xl"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Daily Lift Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-blue-950 font-serif-church">
                    {editingLift ? 'Edit Daily Lift Program' : 'Create Daily Lift Program'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Fields with * are required. You can save as draft or publish immediately.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(status);
              }}
              className="space-y-3.5 text-xs"
            >
              {/* Title / Theme */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Title or Theme *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Walking in the Fullness of Grace"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              {/* Date & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Spiritual Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                  >
                    <option value="Encouragement">Encouragement</option>
                    <option value="Faith">Faith</option>
                    <option value="Grace">Grace</option>
                    <option value="Overcoming">Overcoming</option>
                    <option value="Prayer">Prayer</option>
                    <option value="Wisdom">Wisdom</option>
                  </select>
                </div>
              </div>

              {/* Scripture Reference & Verse */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bible Reference (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Corinthians 2:9–10"
                    value={scriptureRef}
                    onChange={(e) => setScriptureRef(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bible Verse Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eye has not seen, nor ear heard..."
                    value={bibleVerseText}
                    onChange={(e) => setBibleVerseText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>
              </div>

              {/* Main Devotional Content */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Message / Devotional Content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste or write the pastor's daily encouragement here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 leading-relaxed"
                />
              </div>

              {/* Prayer Points */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Prayer Points (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="1. Father, open the heavens of grace over my work today..."
                  value={prayerPoints}
                  onChange={(e) => setPrayerPoints(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 leading-relaxed"
                />
              </div>

              {/* Faith Declaration */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Prophetic Faith Declaration (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. I declare that today brings breakthroughs on every side!"
                  value={faithDeclaration}
                  onChange={(e) => setFaithDeclaration(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              {/* Image / Attachment Upload */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">
                    Optional Banner Photo / Graphic
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[11px] text-red-600 font-bold hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="daily-lift-file-input"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? `Uploading ${uploadPercent}%...` : imageUrl ? 'Replace Photo' : 'Upload Graphic'}</span>
                  </button>

                  <input
                    type="url"
                    placeholder="Or paste image URL"
                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs"
                  />
                </div>

                {imageUrl && (
                  <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                    <img src={imageUrl} alt="Daily Lift Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Audio URL & Attachment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Audio Link / Podcast (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... (mp3 or audio link)"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Study Notes / PDF (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... (PDF or study guide link)"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSave('draft')}
                    className="flex-1 sm:flex-initial px-4 py-2.5 font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave('published')}
                    className="flex-1 sm:flex-initial px-5 py-2.5 font-extrabold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Publish to Congregation</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
