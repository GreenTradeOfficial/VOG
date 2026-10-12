import React from 'react';
import { MapPin, Navigation, ExternalLink, Clock, Phone, Mail, Calendar } from 'lucide-react';
import { officialChurchInfo } from '../data/mockData';
import { useChurch } from '../context/ChurchContext';

interface ChurchLocationCardProps {
  className?: string;
  showServices?: boolean;
}

export const ChurchLocationCard: React.FC<ChurchLocationCardProps> = ({
  className = '',
  showServices = true,
}) => {
  const { serviceSchedule } = useChurch();
  const handleGetDirections = () => {
    window.open(officialChurchInfo.googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-700 bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200">
              PHYSICAL SANCTUARY CAMPUS
            </span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-xs text-slate-500 font-semibold">Omagwa, Port Harcourt</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-blue-950 font-serif-church">
            Church Location & Directions
          </h3>
        </div>

        {/* Primary Get Directions Button */}
        <button
          onClick={handleGetDirections}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-red-600/20 active:scale-95 transition-all min-h-[44px]"
        >
          <Navigation className="w-4 h-4 fill-white" />
          <span>Get Directions</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>

      {/* Address Callout */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-blue-50/40 border border-blue-200/80 flex items-start gap-3.5">
        <div className="p-2.5 bg-red-600 text-white rounded-xl shrink-0 shadow-sm">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-950 block">
            OFFICIAL SANCTUARY ADDRESS
          </span>
          <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            {officialChurchInfo.address}
          </p>
          <p className="text-xs text-slate-600 font-medium pt-1">
            Located in Omagwa, Greater Port Harcourt, Rivers State, Nigeria.
          </p>
        </div>
      </div>

      {/* Regular Church Service Times */}
      {showServices && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-900" />
            <span className="text-xs font-black uppercase tracking-wider text-blue-950">
              Regular Church Service Times
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sunday Service */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-950 uppercase tracking-wider">
                  Sunday Service
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                  {serviceSchedule.sundayDay}
                </span>
              </div>
              <p className="text-sm font-extrabold text-blue-950 flex items-center gap-1.5 pt-0.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{serviceSchedule.sundayDisplay}</span>
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {serviceSchedule.descriptionSunday || 'Worship, Communion, High Praise, and Ministry of the Word with Senior Pastor West Somina.'}
              </p>
            </div>

            {/* Thursday Service */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Thursday Service
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  {serviceSchedule.thursdayDay}
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 pt-0.5">
                <Clock className="w-4 h-4 text-red-600 shrink-0" />
                <span>{serviceSchedule.thursdayDisplay}</span>
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {serviceSchedule.descriptionThursday || 'Mid-Week Fellowship, In-depth Scriptural Teaching, and Faith Empowerment.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Accurate Direction Guidance Note (No fake GPS coordinates as required) */}
      <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
        <span>
          💡 <strong>Travel Note:</strong> Tapping <em>"Get Directions"</em> opens Google Maps with the official search query for the sanctuary location in Omagwa, Port Harcourt.
        </span>
      </div>
    </div>
  );
};
