import React from 'react';
import { useChurch } from '../context/ChurchContext';
import { VogLogo } from './VogLogo';
import { Calendar, Sparkles, ArrowRight, MapPin, Clock, BookOpen, Radio } from 'lucide-react';

interface AnniversaryBannerProps {
  className?: string;
}

export const AnniversaryBanner: React.FC<AnniversaryBannerProps> = ({ className = '' }) => {
  const { setActiveTab, anniversaryData, liveConfig } = useChurch();

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-white text-slate-900 shadow-xl border-2 border-amber-400/70 p-6 sm:p-8 lg:p-10 ${className}`}
    >
      {/* Elegant subtle radiant rays & decorative background accents */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bannerWhiteRay" cx="50%" cy="20%" r="90%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#EFF6FF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bannerWhiteRay)" />
          {/* Subtle gold celebratory rays */}
          <polygon points="50%,0 45%,100% 55%,100%" fill="#FCD34D" opacity="0.12" />
          <polygon points="50%,0 20%,100% 30%,100%" fill="#93C5FD" opacity="0.08" />
          <polygon points="50%,0 70%,100% 80%,100%" fill="#FCA5A5" opacity="0.08" />
        </svg>
      </div>

      {/* Subtle Gold & Blue Glow Halos */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />

      {/* Top Gold & Red Accent Ribbon Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-900 via-red-600 to-amber-500" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Left Side: Official VOG Logo & Anniversary Typography */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 w-full lg:w-auto">
          {/* Official VOG Logo with Golden Border & 10Yrs Medallion */}
          <div className="relative shrink-0">
            <div className="p-3 bg-white rounded-3xl border-2 border-amber-400 shadow-lg group">
              <VogLogo size="lg" />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow border border-amber-300 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-200" />
              <span>10 YEARS</span>
            </div>
          </div>

          <div className="space-y-3 max-w-xl">
            {/* VOG @ 10 Badge & Church Identity */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white text-xs font-black tracking-widest uppercase shadow-sm border border-amber-300/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>VOG @ 10</span>
              </div>

              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-950 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                10 YEARS ANNIVERSARY
              </span>

              {liveConfig.isLive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>LIVE NOW</span>
                </span>
              )}
            </div>

            {/* Event Title */}
            <div>
              <span className="text-[11px] font-extrabold tracking-widest text-slate-500 uppercase block">
                VESSEL OF GRACE CHRISTIAN CENTER
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-blue-950 font-serif-church uppercase">
                10 Years Anniversary Celebration
              </h2>
            </div>

            {/* Prominent Theme: ACCESS & Bible Reference: 1 CORINTHIANS 2:9–10 */}
            <div className="pt-0.5 pb-0.5">
              <div className="inline-flex flex-col sm:flex-row items-center sm:items-baseline gap-2.5 bg-gradient-to-r from-blue-50 via-amber-50/50 to-red-50/40 p-2.5 px-4 rounded-2xl border-2 border-amber-400 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-blue-950">
                    OFFICIAL THEME:
                  </span>
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-widest text-blue-950 font-serif-church drop-shadow-sm">
                    ACCESS
                  </span>
                </div>

                {/* Bible reference placed directly beside or beneath the theme */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-xl shadow-sm text-xs sm:text-sm font-black tracking-wider uppercase border border-amber-300">
                  <BookOpen className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>1 CORINTHIANS 2:9–10</span>
                </div>
              </div>
            </div>

            {/* Dates, Service Times, and Venue Location */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-1.5 bg-blue-900 text-white px-3 py-1.5 rounded-xl font-bold shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>28 OCTOBER – 1 NOVEMBER 2026</span>
              </div>

              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-950 px-3 py-1.5 rounded-xl font-bold border border-amber-300">
                <Clock className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Evening: 5:00 PM · Sunday: 8:00 AM</span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl font-semibold border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Beside AP (Front) Filling Station, Omagwa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: CTA Button and Host Senior Pastor */}
        <div className="shrink-0 flex flex-col items-center sm:items-end lg:items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('anniversary')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 hover:from-blue-900 hover:to-blue-800 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-950/20 border-2 border-amber-400 transition-all active:scale-95 min-h-[50px] uppercase tracking-wider group"
          >
            <span>VIEW ANNIVERSARY PROGRAM</span>
            <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
          </button>

          <div className="text-center sm:text-right lg:text-center text-xs text-slate-600">
            <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Host Minister
            </span>
            <span className="font-bold text-blue-950">
              Pastor West Somina
            </span>{' '}
            <span className="text-slate-500 text-[11px]">(Senior Pastor)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
