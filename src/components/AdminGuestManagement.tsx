import React, { useState, useRef } from 'react';
import { useChurch } from '../context/ChurchContext';
import { AnniversaryGuest, GuestRoleCategory } from '../types';
import {
  uploadGuestPhotoToStorage,
  deleteGuestPhotoFromStorage,
} from '../services/anniversaryGuestsService';
import {
  Users,
  User,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Eye,
  Camera,
  CheckCircle2,
  Info,
  X,
  Sparkles,
  Crown,
  Heart,
  Smartphone,
  Monitor,
  AlertTriangle,
  Cloud,
  Database,
  Lock,
  LogIn,
  LogOut,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const AdminGuestManagement: React.FC = () => {
  const {
    anniversaryData,
    addAnniversaryGuest,
    updateAnniversaryGuest,
    deleteAnniversaryGuest,
    reorderAnniversaryGuests,
    currentUser,
    isFirebaseConnected,
    firebaseSyncStatus,
    signInWithGoogleAdmin,
    signOutAdminUser,
    seedInitialGuestsToFirebase,
    showToast,
  } = useChurch();

  const guests = anniversaryData.guests || [];

  // Sort by displayOrder
  const sortedGuests = [...guests].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Modal states
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showStorageGuide, setShowStorageGuide] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'mobile' | 'desktop'>('mobile');

  // Form states
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<GuestRoleCategory>('Guest Speaker');
  const [formCustomTitle, setFormCustomTitle] = useState('');
  const [formMinistry, setFormMinistry] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formPhotoStoragePath, setFormPhotoStoragePath] = useState('');
  const [priorStoragePath, setPriorStoragePath] = useState('');
  const [formOrder, setFormOrder] = useState<number>(guests.length + 1);
  const [formEventDate, setFormEventDate] = useState<string>('');

  // Upload progress states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingGuestId(null);
    setFormName('');
    setFormRole('Guest Speaker');
    setFormCustomTitle('');
    setFormMinistry('');
    setFormBio('');
    setFormPhotoUrl('');
    setFormPhotoStoragePath('');
    setPriorStoragePath('');
    setFormOrder(guests.length + 1);
    setFormEventDate('');
    setUploadErrorMsg(null);
    setUploadPercent(0);
    setIsUploading(false);
    setShowAddEditModal(true);
  };

  const openEditModal = (guest: AnniversaryGuest) => {
    setEditingGuestId(guest.id);
    setFormName(guest.fullName || guest.name || '');
    setFormRole((guest.role as GuestRoleCategory) || 'Guest Speaker');
    setFormCustomTitle(guest.customTitle || '');
    setFormMinistry(guest.ministry || '');
    setFormBio(guest.biography || '');
    setFormPhotoUrl(guest.photoUrl || '');
    setFormPhotoStoragePath(guest.photoStoragePath || '');
    setPriorStoragePath(guest.photoStoragePath || '');
    setFormOrder(guest.displayOrder || 1);
    setFormEventDate(guest.eventOrVisitDate || '');
    setUploadErrorMsg(null);
    setUploadPercent(0);
    setIsUploading(false);
    setShowAddEditModal(true);
  };

  // Real Cloud Photo upload to Firebase Cloud Storage with compression & progress
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (JPG, PNG, WebP)', 'info');
      return;
    }

    if (!currentUser) {
      showToast('Please sign in with Google Admin to upload photographs to Firebase Storage.', 'info');
    }

    setIsUploading(true);
    setUploadPercent(15);
    setUploadErrorMsg(null);

    try {
      const result = await uploadGuestPhotoToStorage(
        file,
        formName || 'anniversary_guest',
        (pct) => setUploadPercent(pct)
      );

      if (priorStoragePath && priorStoragePath !== result.storagePath) {
        deleteGuestPhotoFromStorage(priorStoragePath);
      }

      setFormPhotoUrl(result.downloadUrl);
      setFormPhotoStoragePath(result.storagePath);
      setPriorStoragePath(result.storagePath);
      setIsUploading(false);
      showToast('Photograph saved permanently to Cloud Database!', 'success');
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setIsUploading(false);
      setUploadErrorMsg(err.message || 'Photo upload encountered an issue.');
      showToast(`Upload note: ${err.message}`, 'info');
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName) {
      showToast('Please enter the guest full name', 'info');
      return;
    }

    const payload: Omit<AnniversaryGuest, 'id'> = {
      fullName: cleanName,
      name: cleanName,
      role: formRole,
      customTitle: formCustomTitle.trim(),
      ministry: formMinistry.trim(),
      biography: formBio.trim(),
      photoUrl: formPhotoUrl.trim(),
      photoStoragePath: formPhotoStoragePath.trim(),
      displayOrder: Number(formOrder) || 1,
      eventOrVisitDate: formEventDate.trim(),
      isPublished: true,
    };

    if (editingGuestId) {
      updateAnniversaryGuest(editingGuestId, payload);
    } else {
      addAnniversaryGuest(payload);
    }

    setShowAddEditModal(false);
  };

  // Reorder helpers
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...sortedGuests];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    reorderAnniversaryGuests(items);
    showToast('Display order updated in Cloud Firestore!', 'info');
  };

  const handleMoveDown = (index: number) => {
    if (index === sortedGuests.length - 1) return;
    const items = [...sortedGuests];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    reorderAnniversaryGuests(items);
    showToast('Display order updated in Cloud Firestore!', 'info');
  };

  const handleRemovePhoto = async () => {
    if (formPhotoStoragePath) {
      await deleteGuestPhotoFromStorage(formPhotoStoragePath);
    }
    setFormPhotoUrl('');
    setFormPhotoStoragePath('');
    showToast('Photo removed.', 'info');
  };

  return (
    <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {isFirebaseConnected ? (
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-700" />
                FIRESTORE CONNECTED & VERIFIED
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                <Database className="w-3 h-3 text-slate-500" />
                LOCAL STORAGE ACTIVE (OFFLINE READY)
              </span>
            )}
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-xs text-slate-500 font-semibold">
              {guests.length} Profiles Configured
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-blue-950 font-serif-church">
            Anniversary Guests & Speakers Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isFirebaseConnected
              ? 'Cloud Firestore synchronization is active for anniversary guest records and photo references.'
              : 'Guest profiles and photo data are preserved locally and sync with Cloud Firestore when connection is available.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preview Gallery Button */}
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-blue-900" />
            <span>Preview Gallery</span>
          </button>

          {/* Add Profile Button */}
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Guest Profile</span>
          </button>
        </div>
      </div>

      {/* Cloud & Admin Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Firestore Status Card */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-blue-950">Cloud Firestore</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-blue-900/80 truncate">
                Collection: <span className="font-mono font-semibold">anniversaryGuests</span> · Changes persist permanently
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={seedInitialGuestsToFirebase}
            className="shrink-0 px-2.5 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 text-[11px] font-bold transition-colors"
            title="Seed default anniversary guests to Firestore"
          >
            Sync Defaults
          </button>
        </div>

        {/* Administrator Auth Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">Administrator Security</span>
                {currentUser ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    Preview Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {currentUser
                  ? `Signed in as ${currentUser.email}`
                  : 'Sign in to authenticate cloud uploads & edits'}
              </p>
            </div>
          </div>

          {currentUser ? (
            <button
              type="button"
              onClick={signOutAdminUser}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogleAdmin}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold transition-colors shadow-sm"
            >
              <LogIn className="w-3 h-3 text-amber-300" />
              <span>Sign In as Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Cloud Storage Advisory & Guide Trigger */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Cloud className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Photo Storage:</strong> Uploaded images are sent to Firebase Cloud Storage (<code className="font-mono text-blue-900">clear-pillar-52w8r.firebasestorage.app</code>). Free Spark tier covers 5GB of storage with zero credit card required.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowStorageGuide(true)}
          className="shrink-0 text-[11px] font-bold text-blue-900 hover:text-blue-700 underline flex items-center gap-1"
        >
          <span>View Storage Setup Details</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Guest Profiles List Table / Card View */}
      <div className="space-y-3">
        {sortedGuests.map((guest, index) => {
          const displayName = guest.fullName || guest.name || 'Unnamed Guest';
          const hasPhoto = Boolean(guest.photoUrl && guest.photoUrl.trim() !== '');

          return (
            <div
              key={guest.id}
              className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-900/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Left: Reorder Arrows & Thumbnail & Details */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                {/* Reorder Buttons */}
                <div className="flex sm:flex-col items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                    className="p-1 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                    title="Move profile up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-slate-400 px-1">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    disabled={index === sortedGuests.length - 1}
                    onClick={() => handleMoveDown(index)}
                    className="p-1 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                    title="Move profile down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Photo Thumbnail */}
                <div className="relative w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-300 shadow-sm flex items-center justify-center">
                  {hasPhoto ? (
                    <img
                      src={guest.photoUrl}
                      alt={displayName}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                  {hasPhoto && (
                    <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" title="Cloud photo available" />
                  )}
                </div>

                {/* Details */}
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {displayName}
                    </h4>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                      {guest.role}
                    </span>
                    {hasPhoto ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Cloud Photo</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Placeholder
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-amber-800 font-semibold truncate">
                    {guest.customTitle || guest.role} · {guest.ministry || 'Vessel of Grace'}
                  </p>

                  {guest.eventOrVisitDate && (
                    <p className="text-[11px] text-blue-900 font-bold flex items-center gap-1">
                      <span>📅 {guest.eventOrVisitDate}</span>
                    </p>
                  )}

                  <p className="text-[11px] text-slate-500 truncate max-w-xl">
                    {guest.biography || 'No biography entered yet.'}
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <button
                  type="button"
                  onClick={() => openEditModal(guest)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-900" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove guest profile for "${displayName}" from Firestore and Cloud Storage?`)) {
                      deleteAnniversaryGuest(guest.id, guest.photoStoragePath);
                    }
                  }}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                  title="Delete guest profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {sortedGuests.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">
              No guest profiles configured yet in Cloud Firestore.
            </p>
            <button
              type="button"
              onClick={seedInitialGuestsToFirebase}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Sync Default Church Profiles
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Guest Profile Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif-church">
                {editingGuestId ? 'Edit Guest Profile (Firestore)' : 'Add Anniversary Guest Profile (Firestore)'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddEditModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="space-y-4">
              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Guest Photograph (Firebase Cloud Storage Upload)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="relative w-20 h-24 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-300 shadow-md flex items-center justify-center">
                    {formPhotoUrl ? (
                      <img
                        src={formPhotoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-1">
                        <RefreshCw className="w-5 h-5 animate-spin mb-1 text-amber-300" />
                        <span className="text-[10px] font-bold">{uploadPercent}%</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      className="hidden"
                    />

                    {/* Live Upload Progress */}
                    {isUploading && (
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-900 h-full transition-all duration-300"
                          style={{ width: `${uploadPercent}%` }}
                        />
                      </div>
                    )}

                    {uploadErrorMsg && (
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{uploadErrorMsg}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? `Uploading ${uploadPercent}%...` : 'Upload from Phone/PC'}</span>
                      </button>

                      {formPhotoUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Uploads straight to Firebase Cloud Storage bucket. Stored as permanent download URL.
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Or Direct Cloud/Web Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    placeholder="https://firebasestorage.googleapis.com/... or https://..."
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name (fullName) *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Pastor West Somina or Guest Minister Name"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-900"
                />
              </div>

              {/* Role Category & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role Category *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as GuestRoleCategory)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:border-blue-900 bg-white"
                  >
                    <option value="Senior Pastor">Senior Pastor</option>
                    <option value="Pastor's Wife">Pastor's Wife</option>
                    <option value="Guest Speaker">Guest Speaker</option>
                    <option value="Visiting Minister">Visiting Minister</option>
                    <option value="Special Guest">Special Guest</option>
                    <option value="Other Anniversary Guest">Other Anniversary Guest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Custom Title & Ministry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Title / Role Designation
                  </label>
                  <input
                    type="text"
                    value={formCustomTitle}
                    onChange={(e) => setFormCustomTitle(e.target.value)}
                    placeholder="e.g. Senior Pastor & Host / Keynote Speaker"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Church / Ministry Affiliation
                  </label>
                  <input
                    type="text"
                    value={formMinistry}
                    onChange={(e) => setFormMinistry(e.target.value)}
                    placeholder="e.g. Vessel of Grace Christian Center"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Biography */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Biography / Profile Introduction
                </label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Enter profile biography, ministerial calling, or message for the 10th anniversary..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Event or Visit Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event or Visit Date (Optional)
                </label>
                <input
                  type="text"
                  value={formEventDate}
                  onChange={(e) => setFormEventDate(e.target.value)}
                  placeholder="e.g. Wednesday 28 October 2026 · Anniversary Opening"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                />
                <span className="text-[10px] text-slate-400">
                  Optional visit date or ministry session for guest ministers.
                </span>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{editingGuestId ? 'Save Profile to Firestore' : 'Add Profile to Firestore'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cloud Storage Guide Modal */}
      {showStorageGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-900" />
                <h3 className="text-base font-bold text-slate-900 font-serif-church">
                  Firebase Cloud Storage Information
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStorageGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-medium">
                ✓ <strong>Cost & Billing Notice:</strong> Firebase Cloud Storage operates on the free <strong>Spark Plan</strong> (up to 5GB stored and 1GB daily download free). No billing upgrade or credit card charges are required.
              </div>

              <p>
                <strong>Bucket Target:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-950">clear-pillar-52w8r.firebasestorage.app</code>
              </p>

              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800">Console Activation Steps (if bucket is new):</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                  <li>Visit your Firebase Console for project <code className="text-blue-900 font-bold">clear-pillar-52w8r</code></li>
                  <li>Click <strong>Storage</strong> in the left sidebar</li>
                  <li>Click <strong>Get Started</strong> (Select default location & standard rules)</li>
                  <li>The bucket is immediately ready for church photo uploads!</li>
                </ol>
              </div>

              <p className="text-[11px] text-slate-500">
                Our code in <code className="bg-slate-100 px-1 rounded">storage.rules</code> permits public reading of photos in <code className="bg-slate-100 px-1 rounded">/anniversary-guests/</code> while restricting uploads strictly to authenticated administrators.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowStorageGuide(false)}
                className="px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Gallery Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-700 shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-900/60 border border-blue-500/30 flex items-center justify-center text-amber-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-serif-church">
                    Live Gallery Preview (Firestore Data)
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Exact responsive view as seen by anniversary visitors across devices
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Viewport switch */}
                <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('mobile')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                      previewViewport === 'mobile'
                        ? 'bg-blue-900 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile (2-col)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('desktop')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                      previewViewport === 'desktop'
                        ? 'bg-blue-900 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop (4-col)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900 flex justify-center">
              <div
                className={`w-full transition-all duration-300 ${
                  previewViewport === 'mobile' ? 'max-w-sm bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-2xl' : 'max-w-4xl'
                }`}
              >
                <div className="text-center mb-6 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    VOG @ 10 CELEBRATION
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white font-serif-church">
                    MEET OUR GUESTS & SPEAKERS
                  </h3>
                  <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                    Anointed voices and ministerial dignitaries gathering for 10 years of divine grace.
                  </p>
                </div>

                {/* Grid */}
                <div
                  className={`grid gap-3 sm:gap-4 ${
                    previewViewport === 'mobile'
                      ? 'grid-cols-2'
                      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                  }`}
                >
                  {sortedGuests.map((guest) => {
                    const displayName = guest.fullName || guest.name || 'Unnamed Guest';
                    const isHost = guest.role === 'Senior Pastor' || guest.role === "Pastor's Wife";
                    return (
                      <div
                        key={guest.id}
                        className={`rounded-2xl overflow-hidden border transition-all ${
                          isHost
                            ? 'bg-gradient-to-b from-blue-950 to-slate-900 border-amber-500/50 shadow-lg'
                            : 'bg-slate-800/80 border-slate-700/80 shadow'
                        }`}
                      >
                        <div className="relative aspect-[3/4] bg-slate-950 overflow-hidden flex items-center justify-center">
                          {guest.photoUrl ? (
                            <img
                              src={guest.photoUrl}
                              alt={displayName}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <div className="text-center p-3">
                              <User className="w-10 h-10 text-slate-600 mx-auto mb-1" />
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                                Photo Coming
                              </span>
                            </div>
                          )}

                          <div className="absolute top-2 left-2">
                            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-900/90 text-amber-300 border border-amber-400/30 shadow">
                              {guest.role}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 sm:p-3 text-center space-y-0.5">
                          <h5 className="text-[11px] sm:text-xs font-bold text-white truncate">
                            {displayName}
                          </h5>
                          <p className="text-[9px] text-amber-400/90 font-medium truncate">
                            {guest.customTitle || guest.role}
                          </p>
                          {guest.ministry && (
                            <p className="text-[9px] text-slate-400 truncate">
                              {guest.ministry}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
