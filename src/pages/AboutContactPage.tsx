import React from 'react';
import { useChurch } from '../context/ChurchContext';
import { VogLogo } from '../components/VogLogo';
import { ChurchLocationCard } from '../components/ChurchLocationCard';
import { PastorWestSominaSection } from '../components/PastorWestSominaSection';
import { officialChurchInfo } from '../data/mockData';
import {
  MapPin,
  Phone,
  Mail,
  Share2,
  Clock,
  Heart,
  Navigation,
  ExternalLink,
  Shield,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export const AboutContactPage: React.FC = () => {
  const { liveConfig, showToast } = useChurch();

  const handleGetDirections = () => {
    window.open(officialChurchInfo.googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* 1. CHURCH PROFILE HEADER WITH OFFICIAL EMBLEM */}
      <section className="bg-gradient-to-br from-[#0B2545] via-[#133E87] to-[#0A1128] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-900 text-center space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
            <VogLogo size="xl" allowReplaceModal={true} />
          </div>

          <div>
            <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-widest bg-white/15 px-3.5 py-1 rounded-full border border-white/20">
              OFFICIAL CHURCH IDENTITY
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-2.5 font-serif-church">
              VESSEL OF GRACE CHRISTIAN CENTER
            </h1>
            <p className="text-sm sm:text-base font-bold text-amber-300 mt-1 uppercase tracking-wider">
              VOG · Omagwa, Port Harcourt, Nigeria
            </p>
          </div>

          <p className="text-xs sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-medium">
            "Stay Connected. Grow in Faith. Experience God’s Grace."
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-200 border border-white/15">
              Senior Pastor: <strong>Pastor West Somina</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-200 border border-white/15">
              Rivers State, Nigeria
            </span>
          </div>
        </div>
      </section>

      {/* 2. WELCOMING INTRODUCTION & PASTOR WEST SOMINA */}
      <PastorWestSominaSection />

      {/* 3. ABOUT THE CHURCH: VISION & MISSION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-900 rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-blue-950 font-serif-church">
              Our Divine Vision
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To be a glorious global vessel through which God’s transformative grace, righteousness,
            and power are dispensed to heal nations and raise uncompromising disciples of Christ
            in Omagwa, Port Harcourt, and around the world.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-blue-950 font-serif-church">
              Our Core Mission
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Preaching the Gospel of Grace with boldness, discipling believers systematically in the Word,
            demonstrating Christ-centered compassion, and equipping every member to walk in supernatural dominion.
          </p>
        </div>
      </section>

      {/* 4. PHYSICAL SANCTUARY LOCATION & GET DIRECTIONS */}
      <ChurchLocationCard />

      {/* 5. CONTACT & OFFICIAL COMMUNICATION CHANNELS */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-bold text-blue-950 font-serif-church">
            Contact & Ministry Secretariat
          </h2>
          <p className="text-xs text-slate-500">
            Reach out to Vessel of Grace Christian Center for inquiries, counseling, and giving.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>Sanctuary Address</span>
            </div>
            <p className="text-xs text-slate-800 font-bold">
              {officialChurchInfo.address}
            </p>
            <p className="text-[11px] text-slate-500">
              Omagwa, Port Harcourt, Rivers State, Nigeria
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Pastoral Helpline / Secretariat</span>
            </div>
            <p className="text-xs text-slate-800 font-medium">
              [Church Secretariat & Pastoral Office Phone Placeholder]
            </p>
            <p className="text-[11px] text-slate-500">
              Available for prayer appointments and counseling
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Official Email</span>
            </div>
            <p className="text-xs text-slate-800 font-medium">
              [contact@vesselofgrace.org / info@vogchurch.org Placeholder]
            </p>
            <p className="text-[11px] text-slate-500">
              Official church correspondence
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Share2 className="w-4 h-4 text-indigo-600" />
              <span>Online Channels</span>
            </div>
            <p className="text-xs text-slate-800 font-medium">
              Facebook: {liveConfig.facebookUrl}
            </p>
            <p className="text-xs text-slate-800 font-medium">
              YouTube: {liveConfig.youtubeUrl}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
