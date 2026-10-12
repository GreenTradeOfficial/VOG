import React, { useState, useEffect, useRef } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  User,
  Upload,
  Camera,
  CheckCircle2,
  Trash2,
  Edit3,
  Plus,
  Crown,
  Heart,
  Save,
  X,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ChurchLeader } from '../types';
import {
  subscribeToChurchLeadership,
  saveChurchLeaderToFirestore,
  deleteChurchLeaderFromFirestore,
  initialLeadership,
} from '../services/churchLeadershipService';
import { uploadPhotoPermanently, validateImageFile } from '../services/photoStorageService';

export const AdminLeadershipManager: React.FC = () => {
  const { showToast } = useChurch();
  const [leaders, setLeaders] = useState<ChurchLeader[]>(initialLeadership);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit / Modal State
  const [editingLeader, setEditingLeader] = useState<ChurchLeader | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<string>('Global Union Pastor');
  const [title, setTitle] = useState<string>('');
  const [biography, setBiography] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isPublished, setIsPublished] = useState<boolean>(true);

  // Upload progress
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToChurchLeadership(
      (items) => {
        setLeaders(items);
        setLoading(false);
      },
      (err) => {
        console.warn('Leadership subscription notice:', err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const openEditModal = (leader?: ChurchLeader) => {
    if (leader) {
      setEditingLeader(leader);
      setFullName(leader.fullName);
      setRole(leader.role);
      setTitle(leader.title || '');
      setBiography(leader.biography || '');
      setPhotoUrl(leader.photoUrl || '');
      setDisplayOrder(leader.displayOrder || 1);
      setIsPublished(leader.isPublished !== false);
    } else {
      setEditingLeader(null);
      setFullName('');
      setRole('Associate Pastor');
      setTitle('');
      setBiography('');
      setPhotoUrl('');
      setDisplayOrder(leaders.length + 1);
      setIsPublished(true);
    }
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid image file.');
      showToast(validation.error || 'Invalid image', 'info');
      return;
    }

    try {
      setIsUploading(true);
      setUploadPercent(10);
      setUploadError(null);

      const leaderTag = (fullName || 'pastor').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const res = await uploadPhotoPermanently(
        file,
        'church-leadership',
        leaderTag,
        (pct) => setUploadPercent(pct)
      );

      setPhotoUrl(res.url);
      setIsUploading(false);
      showToast('Portrait photo successfully processed and saved permanently!', 'success');
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(err.message || 'Failed to process image.');
      showToast(`Upload notice: ${err.message}`, 'info');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Please enter the pastor/leader full name', 'info');
      return;
    }

    const leaderId = editingLeader ? editingLeader.id : 'leader-' + Date.now();
    const updatedLeader: ChurchLeader = {
      id: leaderId,
      fullName: fullName.trim(),
      role: role.trim(),
      title: title.trim(),
      biography: biography.trim(),
      photoUrl: photoUrl.trim(),
      displayOrder: Number(displayOrder) || 1,
      isPublished,
    };

    try {
      await saveChurchLeaderToFirestore(updatedLeader);
      showToast(
        `Profile for ${updatedLeader.fullName} saved permanently to Cloud Database!`,
        'success'
      );
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(`Save error: ${err.message}`, 'info');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteChurchLeaderFromFirestore(id);
      showToast('Leadership profile removed', 'info');
      setDeleteConfirmId(null);
    } catch (err: any) {
      showToast(`Delete error: ${err.message}`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 p-6 rounded-3xl text-white shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-300/30">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>PASTORAL APOSTOLIC OVERSIGHT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-serif-church">
            Pastors & Church Leadership
          </h2>
          <p className="text-xs text-blue-200/90 max-w-xl leading-relaxed">
            Manage the official profiles and permanent portraits for the <strong>Global Union Pastor</strong> and his wife, the <strong>Co-Lead Pastor</strong>. Photos and biographies persist to the cloud database and display across all members’ phones.
          </p>
        </div>

        <button
          onClick={() => openEditModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pastoral Leader</span>
        </button>
      </div>

      {/* Leadership Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {leaders.map((leader) => {
          const isLead = leader.role.toLowerCase().includes('global') || leader.role.toLowerCase().includes('senior') || leader.id === 'lead-pastor';
          const isCoLead = leader.role.toLowerCase().includes('co-lead') || leader.role.toLowerCase().includes('wife') || leader.id === 'co-lead-pastor';

          return (
            <div
              key={leader.id}
              className={`bg-white rounded-3xl border ${
                isLead
                  ? 'border-amber-300 shadow-md ring-1 ring-amber-200'
                  : isCoLead
                  ? 'border-blue-200 shadow-sm'
                  : 'border-slate-200 shadow-sm'
              } p-5 flex flex-col justify-between gap-4 transition-all`}
            >
              <div className="flex items-start gap-4">
                {/* Portrait Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center">
                    {leader.photoUrl ? (
                      <img
                        src={leader.photoUrl}
                        alt={leader.fullName}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          // Fallback on broken image
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                        <User className="w-8 h-8 mb-1 text-slate-300" />
                        <span className="text-[10px] font-semibold">No Photo</span>
                      </div>
                    )}
                  </div>
                  {isLead && (
                    <span className="absolute -top-1.5 -right-1.5 p-1 bg-amber-400 text-blue-950 rounded-full shadow">
                      <Crown className="w-3 h-3" />
                    </span>
                  )}
                  {isCoLead && (
                    <span className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 text-white rounded-full shadow">
                      <Heart className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isLead
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : isCoLead
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-900 border border-blue-200'
                      }`}
                    >
                      {leader.role}
                    </span>
                    {!leader.isPublished && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        Draft / Hidden
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-blue-950 truncate">
                    {leader.fullName}
                  </h3>

                  {leader.title && (
                    <p className="text-xs font-semibold text-slate-600 truncate">
                      {leader.title}
                    </p>
                  )}

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed pt-1">
                    {leader.biography || 'No biography entered yet.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-400">
                  Display Order: <strong>#{leader.displayOrder}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(leader)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-950 font-bold rounded-xl transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(leader.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
                Delete Pastoral Profile?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove this profile from the church app? This action cannot be undone.
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

      {/* Edit / Create Leader Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-900 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-blue-950 font-serif-church">
                    {editingLeader ? 'Edit Pastor / Leader Profile' : 'Add Pastoral Leader'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Portrait and information will sync to the cloud database
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Photo Upload Box */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Official Portrait Photo (Permanent Cloud Sync)
                </label>

                <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300 flex items-center justify-center relative">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-400" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                        {uploadPercent}%
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoSelect}
                      className="hidden"
                      id="pastor-photo-file-input"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{photoUrl ? 'Replace Photo' : 'Upload Portrait'}</span>
                      </button>

                      {photoUrl && (
                        <button
                          type="button"
                          onClick={() => setPhotoUrl('')}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-tight">
                      Select photo from camera or gallery. Image is compressed and saved to permanent cloud database storage so all phone users can see it.
                    </p>

                    {uploadError && (
                      <p className="text-[11px] text-red-600 font-medium">
                        {uploadError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Direct Image URL input as alternative */}
                <div className="mt-2">
                  <input
                    type="url"
                    placeholder="Or enter direct image URL (https://...)"
                    value={photoUrl.startsWith('data:') ? '' : photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900/20 text-xs"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pastor West Somina"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              {/* Role & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Role Category
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                  >
                    <option value="Global Union Pastor">Global Union Pastor (Lead Pastor)</option>
                    <option value="Co-Lead Pastor">Co-Lead Pastor (Pastor's Wife)</option>
                    <option value="Associate Pastor">Associate Pastor</option>
                    <option value="Resident Pastor">Resident Pastor</option>
                    <option value="Minister">Minister of the Gospel</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Custom Title / Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Pastor & Founder"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>
              </div>

              {/* Biography */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Biography & Ministry Background
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter pastoral biography, calling, and ministry vision..."
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 leading-relaxed"
                />
              </div>

              {/* Display Order & Visibility */}
              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 text-blue-900 rounded border-slate-300"
                    />
                    <span className="font-bold text-slate-800">
                      Visible on Public App
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 font-extrabold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Save Profile to Cloud</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
