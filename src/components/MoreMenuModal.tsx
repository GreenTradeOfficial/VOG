import React from 'react';
import {
  Sparkles,
  BookOpen,
  Tv,
  BellRing,
  HeartHandshake,
  Heart,
  Info,
  Phone,
  Settings,
  Shield,
  RotateCcw,
  X,
  ChevronRight,
  Globe,
  User,
  Activity,
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { ActiveTab } from '../types';
import { VogLogo } from './VogLogo';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAi?: () => void;
}

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  onClose,
  onOpenAi,
}) => {
  const {
    setActiveTab,
    language,
    setLanguage,
    isAdminMode,
    setIsAdminMode,
    resetToDefaults,
    favorites,
    currentUser,
    userProfile,
    openAuthModal,
  } = useChurch();

  if (!isOpen) return null;

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  const menuSections = [
    {
      title: 'Spiritual Growth & Word',
      items: [
        {
          label: '🕊️ VOG Bible & Prayer AI',
          sub: 'Explore scripture, prayer suggestions & faith declarations',
          icon: Sparkles,
          color: 'text-amber-600 bg-amber-50',
          onClick: () => {
            onClose();
            if (onOpenAi) onOpenAi();
          },
        },
        {
          label: 'Daily Lifts Archive',
          sub: 'Spiritual encouragement & faith declarations',
          icon: Sparkles,
          color: 'text-amber-600 bg-amber-50',
          onClick: () => handleSelectTab('daily-word'),
        },
        {
          label: 'Daily Devotions Archive',
          sub: 'In-depth scriptures & daily prayers',
          icon: BookOpen,
          color: 'text-blue-600 bg-blue-50',
          onClick: () => handleSelectTab('daily-word'),
        },
        {
          label: 'Sermons & Teachings',
          sub: 'Sunday messages & mid-week study audio/video',
          icon: Tv,
          color: 'text-indigo-600 bg-indigo-50',
          onClick: () => handleSelectTab('sermons'),
        },
      ],
    },
    {
      title: 'Church Life & Community',
      items: [
        {
          label: 'Announcements',
          sub: 'Official notices, ministry updates & bulletins',
          icon: BellRing,
          color: 'text-emerald-600 bg-emerald-50',
          onClick: () => handleSelectTab('announcements'),
        },
        {
          label: 'Prayer Requests',
          sub: 'Submit confidential pastoral prayer requests',
          icon: HeartHandshake,
          color: 'text-rose-600 bg-rose-50',
          onClick: () => handleSelectTab('prayer'),
        },
        {
          label: `Saved Favorites (${favorites.length})`,
          sub: 'Bookmarked devotions, lifts & sermon notes',
          icon: Heart,
          color: 'text-pink-600 bg-pink-50',
          onClick: () => handleSelectTab('favorites'),
        },
      ],
    },
    {
      title: 'About VOG & Settings',
      items: [
        {
          label: 'About Vessel of Grace',
          sub: 'Mission, vision, leadership & statement of faith',
          icon: Info,
          color: 'text-sky-600 bg-sky-50',
          onClick: () => handleSelectTab('about'),
        },
        {
          label: 'Contact & Campus',
          sub: 'Service times, telephone, email & directions',
          icon: Phone,
          color: 'text-teal-600 bg-teal-50',
          onClick: () => handleSelectTab('about'),
        },
        {
          label: 'Notification Reminders',
          sub: 'Devotion alarms, daily lift alerts & services',
          icon: Settings,
          color: 'text-slate-700 bg-slate-100',
          onClick: () => handleSelectTab('notifications'),
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <VogLogo size="sm" />
            <div>
              <h2 className="text-sm font-extrabold text-blue-950">Vessel of Grace</h2>
              <p className="text-[11px] text-slate-500 font-medium">Digital Church Menu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Member Account / Sign In Quick Bar */}
          {currentUser ? (
            <div
              onClick={() => handleSelectTab('profile')}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white cursor-pointer hover:shadow-md transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 font-extrabold flex items-center justify-center border border-white/20">
                  {userProfile?.displayName?.[0]?.toUpperCase() ||
                    currentUser.displayName?.[0]?.toUpperCase() ||
                    'M'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    {userProfile?.displayName || currentUser.displayName || 'VOG Member'}
                  </div>
                  <div className="text-[11px] text-blue-200">
                    My Account, Favorites & Faith Activity
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-300 group-hover:translate-x-1 transition-transform" />
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-900 text-white">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-950">
                    VOG Member Fellowship
                  </div>
                  <div className="text-[11px] text-blue-800">
                    Sign in to save favorites & activity
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  openAuthModal('login');
                }}
                className="px-3 py-1.5 bg-blue-900 text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-xs"
              >
                Sign In
              </button>
            </div>
          )}

          {/* VOG @ 10th Anniversary Spotlight Card */}
          <div
            onClick={() => handleSelectTab('anniversary')}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#0B2545] via-[#133E87] to-[#0A1128] text-white border-2 border-amber-400/60 shadow-lg cursor-pointer hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-[10px] font-black uppercase tracking-wider text-white border border-amber-300/40 shadow-sm">
                  VOG @ 10 · 10TH ANNIVERSARY
                </span>
                <span className="text-[10px] text-amber-300 font-bold">28 OCTOBER – 1 NOVEMBER 2026</span>
              </div>
              <h3 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors font-serif-church">
                10TH ANNIVERSARY CELEBRATION
              </h3>
              <p className="text-[11px] text-amber-300 font-bold mt-1">
                Official Theme: ACCESS (1 Corinthians 2:9–10) · Pastor West Somina
              </p>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10 text-xs font-bold text-amber-300">
                <span>VIEW ANNIVERSARY PROGRAM</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Language & Admin Bar */}
          <div className="bg-blue-50/80 rounded-2xl p-3 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-900" />
              <span className="text-xs font-semibold text-blue-950">Language / Langue</span>
            </div>
            <div className="flex items-center bg-white rounded-lg p-0.5 border border-blue-200">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                  language === 'en'
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-600 hover:text-blue-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                  language === 'fr'
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-600 hover:text-blue-900'
                }`}
              >
                Français
              </button>
            </div>
          </div>

          {/* Menu Sections */}
          {menuSections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                {sec.title}
              </h3>
              <div className="space-y-1">
                {sec.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group min-h-[48px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${item.color} group-hover:scale-105 transition-transform`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-blue-950">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {item.sub}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Church Staff & Leadership Gateway */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-900" />
              {currentUser && isAdminMode ? 'Pastor & Administrator Portal' : 'Church Personnel & Leadership'}
            </h3>
            {currentUser && isAdminMode ? (
              <button
                onClick={() => {
                  handleSelectTab('admin');
                }}
                className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-500/15 to-amber-500/5 border border-amber-300 rounded-2xl text-left hover:border-amber-400 transition-all min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-xs">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      Open Admin Dashboard
                    </div>
                    <div className="text-[11px] text-amber-900 font-medium">
                      Pastor West Somina & Leadership Portal
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                  Active
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  handleSelectTab('admin');
                }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-2xl text-left hover:border-blue-300 transition-all min-h-[48px] group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-200 group-hover:bg-blue-900 group-hover:text-white text-slate-700 rounded-xl font-bold transition-colors">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-950">
                      Pastoral Staff & Admin Gateway
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Protected access for church administrators
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-slate-200 group-hover:bg-blue-100 group-hover:text-blue-950 text-slate-600 px-2 py-0.5 rounded-full">
                  Sign In
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center space-y-0.5">
          <p className="text-[11px] font-bold text-blue-950">
            VESSEL OF GRACE CHRISTIAN CENTER (VOG)
          </p>
          <p className="text-[10px] text-blue-900 font-semibold">
            Senior Pastor: Pastor West Somina
          </p>
          <p className="text-[9px] text-slate-500">
            Omagwa, Port Harcourt, Rivers State, Nigeria
          </p>
        </div>
      </div>
    </div>
  );
};
