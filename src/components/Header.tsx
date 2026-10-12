import React from 'react';
import { VogLogo } from './VogLogo';
import { useChurch } from '../context/ChurchContext';
import { Radio, Shield, Menu, Heart, User } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  onOpenMore: () => void;
  onOpenAi?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMore, onOpenAi }) => {
  const {
    activeTab,
    setActiveTab,
    liveConfig,
    isAdminMode,
    setIsAdminMode,
    favorites,
    currentUser,
    userProfile,
    openAuthModal,
  } = useChurch();

  const navLinks: { label: string; tab: ActiveTab; isSpecial?: boolean }[] = [
    { label: 'Home', tab: 'home' },
    { label: 'VOG @ 10', tab: 'anniversary', isSpecial: true },
    { label: 'Live Service', tab: 'live' },
    { label: 'Daily Word', tab: 'daily-word' },
    { label: 'Events', tab: 'events' },
    { label: 'Sermons', tab: 'sermons' },
    { label: 'Announcements', tab: 'announcements' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark & Official Emblem */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer shrink-0 select-none group"
        >
          <VogLogo size="sm" allowReplaceModal={isAdminMode} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-blue-950 tracking-tight text-sm sm:text-base group-hover:text-blue-800 transition-colors">
                VESSEL OF GRACE
              </span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                VOG
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 tracking-wide uppercase">
              Christian Center
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links for Desktop */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
          {navLinks.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 flex items-center gap-1.5 ${
                  item.isSpecial
                    ? isActive
                      ? 'text-amber-700 border-amber-500 font-extrabold'
                      : 'text-amber-800 font-bold border-transparent hover:text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/70'
                    : isActive
                    ? 'text-blue-900 border-blue-900 font-bold'
                    : 'border-transparent hover:text-blue-950 hover:border-slate-300'
                }`}
              >
                <span>{item.label}</span>
                {item.isSpecial && (
                  <span className="text-[9px] uppercase px-1 py-0.2 bg-red-600 text-white rounded font-extrabold">
                    10YRS
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Live CTA, Favorites, Admin, More) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Member Profile or Login Button */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all min-h-[40px] ${
                activeTab === 'profile'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                  : 'bg-blue-50/80 text-blue-950 border-blue-200 hover:bg-blue-100'
              }`}
              title={`Member Account: ${userProfile?.displayName || currentUser.displayName || currentUser.email}`}
            >
              <div className="w-5 h-5 rounded-full bg-blue-900 text-amber-300 text-[10px] flex items-center justify-center font-black">
                {userProfile?.displayName?.[0]?.toUpperCase() ||
                  currentUser.displayName?.[0]?.toUpperCase() ||
                  'M'}
              </div>
              <span className="hidden md:inline max-w-[90px] truncate">
                {userProfile?.displayName?.split(' ')[0] ||
                  currentUser.displayName?.split(' ')[0] ||
                  'Member'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-blue-950 hover:bg-slate-50 text-xs font-bold transition-all min-h-[40px]"
              title="Member Login & Sign Up"
            >
              <User className="w-3.5 h-3.5 text-blue-900" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* VOG Bible & Prayer AI Assistant Button */}
          {onOpenAi && (
            <button
              onClick={onOpenAi}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-950 text-xs font-bold transition-all min-h-[40px] shadow-2xs"
              title="VOG Bible & Prayer AI Assistant"
            >
              <span className="text-sm">🕊️</span>
              <span className="hidden md:inline">Bible AI</span>
            </button>
          )}

          {/* Quick Favorites Shortcut */}
          <button
            onClick={() => setActiveTab('favorites')}
            className={`p-2 rounded-xl border transition-colors relative min-h-[40px] min-w-[40px] flex items-center justify-center ${
              activeTab === 'favorites'
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Saved Favorites"
            aria-label="Favorites"
          >
            <Heart className="w-4 h-4" />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Verified Church Administrator Portal Shortcut (Shown only when logged in as verified admin) */}
          {currentUser && isAdminMode && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all min-h-[40px] ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-amber-100/90 text-amber-950 border-amber-300 hover:bg-amber-200'
              }`}
              title="Church Pastoral & Admin Portal"
            >
              <Shield className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Primary Action: WATCH LIVE button with red highlight only when stream is truly active & receiving data */}
          {(() => {
            const isTrulyActive = Boolean(
              liveConfig.isLive &&
              liveConfig.streamUrl?.trim() &&
              (liveConfig.isReceivingData || liveConfig.validationStatus === 'verified_active')
            );

            return (
              <button
                onClick={() => setActiveTab('live')}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm min-h-[40px] whitespace-nowrap ${
                  isTrulyActive
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/25 ring-2 ring-red-400/50'
                    : 'bg-blue-900 text-white hover:bg-blue-800'
                }`}
              >
                {isTrulyActive ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                ) : null}
                <Radio className={`w-3.5 h-3.5 ${isTrulyActive ? 'animate-pulse' : ''}`} />
                <span>{isTrulyActive ? 'WATCH LIVE' : 'SERVICES'}</span>
              </button>
            );
          })()}

          {/* More Drawer Hamburger for mobile/quick access */}
          <button
            onClick={onOpenMore}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="All Church Services & Menu"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
