/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChurchProvider, useChurch } from './context/ChurchContext';
import { Header } from './components/Header';
import { MobileNavBar } from './components/MobileNavBar';
import { MoreMenuModal } from './components/MoreMenuModal';
import { ToastContainer } from './components/ToastContainer';
import { HomePage } from './pages/HomePage';
import { LiveServicesPage } from './pages/LiveServicesPage';
import { DailyWordPage } from './pages/DailyWordPage';
import { EventsPage } from './pages/EventsPage';
import { SermonsPage } from './pages/SermonsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { PrayerRequestsPage } from './pages/PrayerRequestsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AboutContactPage } from './pages/AboutContactPage';
import { NotificationSettingsPage } from './pages/NotificationSettingsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AnniversaryPage } from './pages/AnniversaryPage';
import { MemberProfilePage } from './pages/MemberProfilePage';
import { MemberAuthModal } from './components/MemberAuthModal';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { VogLogo } from './components/VogLogo';
import { AiBibleAssistantModal } from './components/AiBibleAssistantModal';
import { HeartHandshake, Radio, BookOpen, Calendar, Shield, ExternalLink, Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    liveConfig,
    isAdminMode,
    isAuthModalOpen,
    closeAuthModal,
    openAuthModal,
    authModalMode,
  } = useChurch();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-blue-900 selection:text-white">
      {/* Toast Feedback Container */}
      <ToastContainer />

      {/* Member Login & Sign Up Modal */}
      <MemberAuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />

      {/* Top Header Bar */}
      <Header
        onOpenMore={() => setIsMoreOpen(true)}
        onOpenAi={() => setIsAiModalOpen(true)}
      />

      {/* Main Responsive Viewport Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 sm:pb-16">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'live' && <LiveServicesPage />}
        {activeTab === 'daily-word' && <DailyWordPage />}
        {activeTab === 'events' && <EventsPage />}
        {activeTab === 'sermons' && <SermonsPage />}
        {activeTab === 'announcements' && <AnnouncementsPage />}
        {activeTab === 'prayer' && <PrayerRequestsPage />}
        {activeTab === 'favorites' && <FavoritesPage />}
        {activeTab === 'about' && <AboutContactPage />}
        {activeTab === 'notifications' && <NotificationSettingsPage />}
        {activeTab === 'anniversary' && <AnniversaryPage />}
        {activeTab === 'profile' && <MemberProfilePage onOpenAuth={(mode) => openAuthModal(mode)} />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Church Footer */}
      <footer className="border-t border-slate-200 bg-white/95 backdrop-blur-sm mt-auto py-8 pb-24 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start sm:items-center gap-3.5">
              <VogLogo size="md" />
              <div>
                <span className="font-extrabold text-blue-950 text-sm sm:text-base tracking-tight block">
                  VESSEL OF GRACE CHRISTIAN CENTER
                </span>
                <span className="text-xs font-bold text-blue-900 block mt-0.5">
                  Senior Pastor: Pastor West Somina
                </span>
                <span className="text-xs text-slate-500 font-medium block mt-0.5">
                  Beside AP (Front) Filling Station, Omagwa, Port Harcourt, Rivers State, Nigeria.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-slate-600">
              <button onClick={() => setActiveTab('home')} className="hover:text-blue-900">Home</button>
              <button
                onClick={() => setActiveTab('anniversary')}
                className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>VOG @ 10</span>
              </button>
              <button onClick={() => setActiveTab('live')} className="hover:text-blue-900">Live Service</button>
              <button onClick={() => setActiveTab('daily-word')} className="hover:text-blue-900">Daily Word</button>
              <button onClick={() => setActiveTab('sermons')} className="hover:text-blue-900">Sermons</button>
              <button onClick={() => setActiveTab('events')} className="hover:text-blue-900">Events</button>
              <button onClick={() => setActiveTab('prayer')} className="hover:text-blue-900">Prayer Request</button>
              <button onClick={() => setActiveTab('about')} className="hover:text-blue-900">About VOG</button>
              {isAdminMode ? (
                <button onClick={() => setActiveTab('admin')} className="text-amber-700 hover:text-amber-900 flex items-center gap-1 font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </button>
              ) : (
                <button onClick={() => setActiveTab('admin')} className="text-slate-500 hover:text-blue-900 flex items-center gap-1 font-medium">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Leadership Portal</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div className="text-center sm:text-left space-y-0.5">
              <p className="font-semibold text-slate-700">
                VESSEL OF GRACE CHRISTIAN CENTER (VOG) · Senior Pastor: Pastor West Somina
              </p>
              <p className="text-[11px] text-slate-500">
                Beside AP (Front) Filling Station, Omagwa, Port Harcourt, Rivers State, Nigeria.
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Beside+AP+Front+Oil+Filling+Station+Omagwa+Port+Harcourt+Rivers+State+Nigeria"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>Get Directions (Google Maps)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-medium">© 2026 Vessel of Grace Christian Center</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Progressive Web App Install & Offline Prompt */}
      <PwaInstallPrompt />

      {/* AI Bible & Prayer Assistant Interactive Modal */}
      <AiBibleAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* Clearly Accessible Floating AI Bible Assistant Launcher */}
      <button
        type="button"
        onClick={() => setIsAiModalOpen(true)}
        className="fixed right-4 bottom-20 sm:bottom-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 hover:from-blue-900 hover:to-indigo-900 text-white rounded-full shadow-xl border border-amber-300/40 transition-all hover:scale-105 active:scale-95 group"
        title="Ask VOG Bible & Prayer Assistant"
      >
        <div className="w-7 h-7 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center font-bold text-sm shadow-xs group-hover:rotate-12 transition-transform">
          🕊️
        </div>
        <div className="text-left hidden xs:block sm:block pr-1">
          <span className="text-xs font-black block leading-tight text-white group-hover:text-amber-300 transition-colors">
            Ask Bible AI
          </span>
          <span className="text-[10px] text-blue-200 block font-medium">
            Scriptures & Prayers
          </span>
        </div>
      </button>

      {/* Fixed Bottom Navigation Bar for Mobile Phones */}
      <MobileNavBar onOpenMore={() => setIsMoreOpen(true)} />

      {/* More Sections Slide-Out Drawer */}
      <MoreMenuModal
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onOpenAi={() => setIsAiModalOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ChurchProvider>
      <MainAppContent />
    </ChurchProvider>
  );
}
