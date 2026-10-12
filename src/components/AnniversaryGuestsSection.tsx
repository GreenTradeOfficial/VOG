import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { AnniversaryGuest, GuestRoleCategory } from '../types';
import {
  Users,
  User,
  Sparkles,
  Award,
  Crown,
  Heart,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  Filter,
  Plus,
  BookOpen,
} from 'lucide-react';

interface AnniversaryGuestsSectionProps {
  className?: string;
  onOpenAdminGuests?: () => void;
}

export const AnniversaryGuestsSection: React.FC<AnniversaryGuestsSectionProps> = ({
  className = '',
  onOpenAdminGuests,
}) => {
  const { anniversaryData, isAdminMode } = useChurch();
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [activeModalGuest, setActiveModalGuest] = useState<AnniversaryGuest | null>(null);

  const guests = anniversaryData.guests || [];

  // Sort by displayOrder
  const sortedGuests = [...guests].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const filteredGuests = sortedGuests.filter((guest) => {
    if (selectedRole === 'all') return true;
    return guest.role.toLowerCase() === selectedRole.toLowerCase();
  });

  // Role styling helper
  const getRoleBadgeStyle = (role: GuestRoleCategory | string) => {
    switch (role) {
      case 'Senior Pastor':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 font-black';
      case "Pastor's Wife":
        return 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-rose-300 font-black';
      case 'Guest Speaker':
        return 'bg-blue-900 text-white border-blue-700 font-bold';
      case 'Visiting Minister':
        return 'bg-indigo-700 text-white border-indigo-500 font-bold';
      case 'Special Guest':
        return 'bg-emerald-700 text-white border-emerald-500 font-bold';
      default:
        return 'bg-slate-700 text-white border-slate-600 font-bold';
    }
  };

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
              MINISTERIAL DAIS & DIGNITARIES
            </span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-xs text-slate-500 font-semibold">VOG @ 10 Celebration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-950 font-serif-church tracking-tight">
            MEET OUR GUESTS & SPEAKERS
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Distinguished ministerial voices, guest speakers, visiting ministers, and special dignitaries joining us to commemorate a decade of supernatural grace.
          </p>
        </div>

        {isAdminMode && onOpenAdminGuests && (
          <button
            onClick={onOpenAdminGuests}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Guest Cards ({guests.length})</span>
          </button>
        )}
      </div>

      {/* Role Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {[
          { id: 'all', label: `All Guests (${guests.length})` },
          { id: 'senior pastor', label: 'Senior Pastor' },
          { id: "pastor's wife", label: "Pastor's Wife" },
          { id: 'guest speaker', label: 'Guest Speakers' },
          { id: 'visiting minister', label: 'Visiting Ministers' },
          { id: 'special guest', label: 'Special Guests' },
          { id: 'other anniversary guest', label: 'Other Guests' },
        ].map((tab) => {
          const isSelected = selectedRole === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedRole(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all text-xs min-h-[38px] ${
                isSelected
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Responsive Gallery Grid: EXACTLY 2 cards per row on mobile, 3-4 on larger screens */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {filteredGuests.map((guest) => {
          const isHost = guest.role === 'Senior Pastor' || guest.role === "Pastor's Wife";
          const hasRealPhoto = Boolean(guest.photoUrl && guest.photoUrl.trim() !== '');

          return (
            <div
              key={guest.id}
              onClick={() => setActiveModalGuest(guest)}
              className={`group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-1 ${
                isHost ? 'ring-2 ring-amber-400/50' : ''
              }`}
            >
              {/* Photo Viewport */}
              <div className="relative aspect-[4/5] bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 overflow-hidden flex items-center justify-center">
                {hasRealPhoto ? (
                  <img
                    src={guest.photoUrl}
                    alt={guest.fullName || guest.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="p-4 sm:p-6 flex flex-col items-center justify-center text-center space-y-2.5">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg border-2 ${
                        isHost
                          ? 'bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 border-white'
                          : guest.role === 'Guest Speaker'
                          ? 'bg-blue-800 text-white border-blue-400'
                          : 'bg-slate-800 text-amber-300 border-slate-600'
                      }`}
                    >
                      {guest.role === 'Senior Pastor' ? (
                        <Crown className="w-7 h-7 stroke-[2.2]" />
                      ) : guest.role === "Pastor's Wife" ? (
                        <Heart className="w-7 h-7 stroke-[2.2]" />
                      ) : (
                        <User className="w-7 h-7 stroke-[2]" />
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-mono text-blue-200 font-semibold line-clamp-1">
                      {isHost ? 'Official Portrait' : 'Photo Pending'}
                    </span>
                  </div>
                )}

                {/* Role Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <span
                    className={`text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md border line-clamp-1 max-w-[90%] ${getRoleBadgeStyle(
                      guest.role
                    )}`}
                  >
                    {guest.role}
                  </span>
                  {isHost && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shadow-sm" />
                  )}
                </div>

                {/* Subtle gradient vignette at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                {/* Order indicator */}
                <span className="absolute bottom-2 right-2.5 text-[9px] text-white/70 font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                  #{guest.displayOrder}
                </span>
              </div>

              {/* Card Meta Content */}
              <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-1 leading-snug">
                    {guest.fullName || guest.name}
                  </h3>

                  {guest.customTitle && (
                    <p className="text-[10px] sm:text-[11px] font-semibold text-amber-700 line-clamp-1">
                      {guest.customTitle}
                    </p>
                  )}

                  {guest.ministry && (
                    <p className="text-[10px] text-slate-500 line-clamp-1 font-medium">
                      {guest.ministry}
                    </p>
                  )}

                  {guest.biography && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed pt-0.5 hidden sm:block">
                      {guest.biography}
                    </p>
                  )}
                </div>

                {/* Quick expand action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-900 font-bold group-hover:text-blue-950">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guest Profile Detail Modal */}
      {activeModalGuest && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="relative aspect-video bg-gradient-to-br from-[#0B2545] via-[#133E87] to-[#0A1128] text-white flex items-center justify-center p-6 overflow-hidden">
              {activeModalGuest.photoUrl ? (
                <img
                  src={activeModalGuest.photoUrl}
                  alt={activeModalGuest.fullName || activeModalGuest.name}
                  className="absolute inset-0 w-full h-full object-cover object-top opacity-60"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300">
                  <User className="w-10 h-10 stroke-[2]" />
                </div>
              )}

              <button
                onClick={() => setActiveModalGuest(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span
                  className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-md border ${getRoleBadgeStyle(
                    activeModalGuest.role
                  )}`}
                >
                  {activeModalGuest.role}
                </span>
                <span className="text-[11px] text-white/90 font-mono">
                  Profile #{activeModalGuest.displayOrder}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-blue-950 font-serif-church">
                  {activeModalGuest.fullName || activeModalGuest.name}
                </h3>
                {activeModalGuest.customTitle && (
                  <p className="text-xs sm:text-sm font-bold text-amber-700 mt-0.5">
                    {activeModalGuest.customTitle}
                  </p>
                )}
                {activeModalGuest.ministry && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {activeModalGuest.ministry}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Ministerial Profile & Introduction
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {activeModalGuest.biography ||
                    'Official biography, profile details, and session participation will be updated by church administration as the anniversary program approaches.'}
                </p>
              </div>

              {!activeModalGuest.photoUrl && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Photo Placeholder:</strong> The administrator can upload the real high-resolution portrait for this profile in the Admin Dashboard.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                VOG @ 10 · 28 OCTOBER – 1 NOVEMBER 2026
              </span>
              <button
                onClick={() => setActiveModalGuest(null)}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
