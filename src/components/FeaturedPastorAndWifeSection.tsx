import React, { useState, useEffect, useRef } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Camera,
  Heart,
  Crown,
  Upload,
  User,
  CheckCircle2,
} from 'lucide-react';
import {
  subscribeToChurchLeadership,
  saveChurchLeaderToFirestore,
  initialLeadership,
} from '../services/churchLeadershipService';
import { uploadPhotoPermanently, validateImageFile } from '../services/photoStorageService';
import { ChurchLeader } from '../types';

interface FeaturedPastorAndWifeSectionProps {
  className?: string;
  onOpenAdminGuests?: () => void;
}

export const FeaturedPastorAndWifeSection: React.FC<FeaturedPastorAndWifeSectionProps> = ({
  className = '',
  onOpenAdminGuests,
}) => {
  const { anniversaryData, updateAnniversaryGuest, isAdminMode, showToast } = useChurch();

  const [leaders, setLeaders] = useState<ChurchLeader[]>(initialLeadership);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToChurchLeadership((items) => {
      if (items && items.length > 0) {
        setLeaders(items);
      }
    });
    return () => unsub();
  }, []);

  const leadPastor = leaders.find(
    (l) =>
      l.id === 'lead-pastor' ||
      l.role.toLowerCase().includes('global') ||
      l.role.toLowerCase().includes('senior')
  ) || initialLeadership[0];

  const coLeadPastor = leaders.find(
    (l) =>
      l.id === 'co-lead-pastor' ||
      l.role.toLowerCase().includes('co-lead') ||
      l.role.toLowerCase().includes('wife')
  ) || initialLeadership[1];

  const pastorFileInputRef = useRef<HTMLInputElement>(null);
  const wifeFileInputRef = useRef<HTMLInputElement>(null);

  // Cloud photo upload helper that saves directly to Cloud Database
  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetLeader: ChurchLeader,
    guestIdFallback: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid file', 'info');
      return;
    }

    try {
      setIsUploading(true);
      showToast(`Uploading portrait for ${targetLeader.fullName} to Cloud Database...`, 'info');
      const res = await uploadPhotoPermanently(
        file,
        'church-leadership',
        targetLeader.id
      );

      const updatedLeader: ChurchLeader = {
        ...targetLeader,
        photoUrl: res.url,
      };

      // Save to leadership collection
      await saveChurchLeaderToFirestore(updatedLeader);

      // Also sync to anniversary guests if present
      updateAnniversaryGuest(guestIdFallback, {
        fullName: targetLeader.fullName,
        photoUrl: res.url,
      });

      setIsUploading(false);
      showToast(
        `Portrait for ${targetLeader.fullName} saved permanently to Cloud Database!`,
        'success'
      );
    } catch (err: any) {
      setIsUploading(false);
      showToast(`Upload error: ${err.message}`, 'info');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2545] via-[#102A4E] to-[#0A1128] text-white p-6 sm:p-8 lg:p-10 border-2 border-amber-400/50 shadow-2xl space-y-8 ${className}`}
    >
      {/* Decorative divine glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-amber-400/25">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white text-xs font-black tracking-widest uppercase border border-amber-300/40 shadow-sm">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>PASTORAL APOSTOLIC OVERSIGHT</span>
            <span className="text-amber-300">·</span>
            <span>VESSEL OF GRACE (VOG)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-serif-church tracking-tight">
            {leadPastor.fullName} & {coLeadPastor.fullName}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed font-medium">
            {anniversaryData.featuredLeadershipIntro ||
              'Celebrating God’s extraordinary grace, apostolic leadership, and relentless faith under our spiritual parents, the Global Union Pastor and his wife, the Co-Lead Pastor.'}
          </p>
        </div>

        {isAdminMode && onOpenAdminGuests && (
          <button
            onClick={onOpenAdminGuests}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 whitespace-nowrap min-h-[40px]"
          >
            <Camera className="w-4 h-4" />
            <span>Manage Leadership Photos</span>
          </button>
        )}
      </div>

      {/* Side-by-Side Dual Portrait Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* CARD 1: GLOBAL UNION PASTOR (LEAD PASTOR) */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-amber-400/40 p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-amber-400/70 transition-all shadow-xl">
          <div className="space-y-5">
            {/* Top Identity Tag */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400 text-slate-950 border border-amber-300 shadow-sm flex items-center gap-1.5">
                <Crown className="w-3 h-3" />
                <span>{leadPastor.role}</span>
              </span>
              <span className="text-[11px] text-blue-200 font-semibold">
                Lead Pastor & Spiritual Father
              </span>
            </div>

            {/* Photo Container */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-b from-[#133E87] to-[#0A1128] border-2 border-amber-300/40 flex items-center justify-center group shadow-inner">
              {leadPastor.photoUrl ? (
                <img
                  src={leadPastor.photoUrl}
                  alt={leadPastor.fullName}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-blue-950 flex items-center justify-center shadow-2xl border-2 border-white/50">
                    <User className="w-10 h-10 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-black text-amber-300 font-serif-church block tracking-wide">
                      {leadPastor.fullName.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-blue-200 font-medium block">
                      {leadPastor.role} · Vessel of Grace Christian Center
                    </span>
                  </div>
                  <span className="inline-block text-[10px] text-blue-200/80 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                    Official Portrait Placeholder (Upload in Admin)
                  </span>
                </div>
              )}

              {/* Upload Overlay Button for Quick Editing */}
              {isAdminMode && (
                <div className="absolute bottom-3 right-3">
                  <input
                    type="file"
                    ref={pastorFileInputRef}
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, leadPastor, 'guest-1')}
                    className="hidden"
                  />
                  <button
                    onClick={() => pastorFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md border border-white/30 shadow-lg transition-all"
                    title="Upload real photograph of Global Union Pastor"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Real Photo'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white font-serif-church">
                {leadPastor.fullName}
              </h3>
              <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                {leadPastor.title || 'Lead Pastor & Founder'} · Vessel of Grace Christian Center
              </p>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed pt-1">
                {leadPastor.biography ||
                  'Servant of God and visionary leader of Vessel of Grace Christian Center, proclaiming the uncompromised gospel of grace, apostolic power, and generational transformation in Omagwa, Port Harcourt, and globally.'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-blue-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Host & Presiding Minister</span>
            </span>
            <span className="text-amber-300 font-mono text-[11px]">VOG</span>
          </div>
        </div>

        {/* CARD 2: CO-LEAD PASTOR (PASTOR'S WIFE) */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-amber-400/40 p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-amber-400/70 transition-all shadow-xl">
          <div className="space-y-5">
            {/* Top Identity Tag */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-300 shadow-sm flex items-center gap-1.5">
                <Heart className="w-3 h-3 fill-white" />
                <span>{coLeadPastor.role}</span>
              </span>
              <span className="text-[11px] text-blue-200 font-semibold">
                Co-Lead Pastor & Spiritual Mother
              </span>
            </div>

            {/* Photo Container */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-b from-[#133E87] to-[#0A1128] border-2 border-amber-300/40 flex items-center justify-center group shadow-inner">
              {coLeadPastor.photoUrl ? (
                <img
                  src={coLeadPastor.photoUrl}
                  alt={coLeadPastor.fullName}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-400 to-amber-200 text-rose-950 flex items-center justify-center shadow-2xl border-2 border-white/50">
                    <User className="w-10 h-10 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-black text-rose-200 font-serif-church block tracking-wide">
                      {coLeadPastor.fullName.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-blue-200 font-medium block">
                      {coLeadPastor.role} · Vessel of Grace Christian Center
                    </span>
                  </div>
                  <span className="inline-block text-[10px] text-blue-200/80 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                    Official Portrait Placeholder (Upload in Admin)
                  </span>
                </div>
              )}

              {/* Upload Overlay Button for Quick Editing */}
              {isAdminMode && (
                <div className="absolute bottom-3 right-3">
                  <input
                    type="file"
                    ref={wifeFileInputRef}
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, coLeadPastor, 'guest-2')}
                    className="hidden"
                  />
                  <button
                    onClick={() => wifeFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md border border-white/30 shadow-lg transition-all"
                    title="Upload real photograph of Co-Lead Pastor"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Real Photo'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white font-serif-church">
                {coLeadPastor.fullName}
              </h3>
              <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                {coLeadPastor.title || 'Co-Lead Pastor & Spiritual Mother'} · Vessel of Grace Christian Center
              </p>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed pt-1">
                {coLeadPastor.biography ||
                  'Spiritual mother, intercessor, and pillar of virtue partnering with the Global Union Pastor in apostolic ministry, leadership, and kingdom advancement.'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-blue-200">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Co-Host & Mother of Grace</span>
            </span>
            <span className="text-amber-300 font-mono text-[11px]">VOG</span>
          </div>
        </div>
      </div>
    </section>
  );
};
