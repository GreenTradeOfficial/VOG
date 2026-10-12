import React, { useState, useEffect } from 'react';
import { Download, WifiOff, X, Check, Smartphone, Sparkles } from 'lucide-react';
import { VogLogo } from './VogLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('vog_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showOfflineToast, setShowOfflineToast] = useState<boolean>(false);

  useEffect(() => {
    // Check if already installed in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Capture beforeinstallprompt event on Android Chrome / Chromium
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Online/Offline tracking
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('vog_pwa_dismissed', 'true');
    } catch {}
  };

  return (
    <>
      {/* Offline Alert Pill */}
      {showOfflineToast && !isOnline && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-900/90 backdrop-blur-md text-amber-100 rounded-full text-xs font-semibold shadow-lg border border-amber-700/60 flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
          <WifiOff className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>Offline Mode — Cached devotionals & sermons available</span>
          <button
            onClick={() => setShowOfflineToast(false)}
            className="ml-1 p-0.5 hover:bg-amber-800 rounded-full"
            aria-label="Dismiss offline banner"
          >
            <X className="w-3 h-3 text-amber-300" />
          </button>
        </div>
      )}

      {/* PWA In-App Install Banner for Android & Mobile Web */}
      {deferredPrompt && !isDismissed && !isInstalled && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 max-w-lg mx-auto z-40 bg-gradient-to-r from-[#0B2545] to-[#133E87] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border-2 border-amber-400/40 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900/80 border border-amber-400/50 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
                <VogLogo size="sm" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-extrabold text-white">
                    Install VOG Church App
                  </h4>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400 text-blue-950">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-blue-100/90 font-medium line-clamp-1 mt-0.5">
                  Add to home screen for fast Android access & offline daily devotionals.
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
              aria-label="Dismiss installation banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs text-blue-200 hover:text-white font-medium"
            >
              Not now
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-950" />
              <span>Install App</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
