import React, { useState, useEffect } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Bell,
  Clock,
  Sparkles,
  BookOpen,
  Calendar,
  Radio,
  CheckCircle2,
  Info,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Send,
} from 'lucide-react';
import { VogLogo } from '../components/VogLogo';
import {
  isFCMSupported,
  getNotificationPermissionStatus,
  registerPushNotifications,
} from '../services/fcmNotificationService';

export const NotificationSettingsPage: React.FC = () => {
  const { notificationPrefs, updateNotificationPrefs, currentUser, showToast } = useChurch();

  const [fcmSupported, setFcmSupported] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [pushRegistered, setPushRegistered] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vog_push_enabled') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTestPreview, setActiveTestPreview] = useState<{
    title: string;
    body: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    isFCMSupported().then(setFcmSupported);
    setPermissionStatus(getNotificationPermissionStatus());
  }, []);

  const handleEnablePush = async () => {
    setIsRegistering(true);
    const result = await registerPushNotifications({
      userId: currentUser?.uid,
      email: currentUser?.email,
      preferences: notificationPrefs,
    });
    setIsRegistering(false);

    setPermissionStatus(getNotificationPermissionStatus());
    if (result.success) {
      setPushRegistered(true);
      showToast('🎉 Push notifications enabled! You will receive church alerts on this device.', 'success');
      // Trigger a native welcome notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('🕊️ Vessel of Grace Christian Center', {
            body: 'Push alerts successfully activated for services, devotionals, and announcements!',
            icon: '/pwa-192x192.png',
            badge: '/favicon.svg',
          });
        } catch {}
      }
    } else {
      showToast(result.error || 'Could not enable push notifications.', 'info');
    }
  };

  const handleTestNotification = (type: 'devotion' | 'lift' | 'service') => {
    let preview = {
      title: '🕊️ VOG Morning Devotion Ready',
      body: 'Today’s theme: Walking in the Fullness of Grace. Tap to read & pray.',
      time: 'Just now',
    };

    if (type === 'lift') {
      preview = {
        title: '✨ Pastor’s Daily Lift',
        body: '“The Unfailing Compassion of God” — New mercies are yours this morning!',
        time: 'Just now',
      };
    } else if (type === 'service') {
      preview = {
        title: '🔴 Sunday Celebration Starting in 15 mins!',
        body: 'Vessel of Grace Live Sanctuary Broadcast is warming up. Join fellowship!',
        time: 'Just now',
      };
    }

    setActiveTestPreview(preview);

    // If native push permission is already granted, also trigger a real system alert
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(preview.title, {
          body: preview.body,
          icon: '/pwa-192x192.png',
          badge: '/favicon.svg',
        });
      } catch {}
    }

    showToast(`Test alert triggered: "${preview.title}"`, 'info');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            CHURCH ALERTS & REMINDERS
          </span>
          <span className="text-slate-400 text-xs">·</span>
          <span className="text-xs text-slate-500 font-medium">Firebase Cloud Messaging</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-serif-church">
          Notification Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Receive real-time push alerts on your phone or computer for upcoming services, urgent announcements, and daily devotionals.
        </p>
      </div>

      {/* FCM Push Notification Device Registration Banner */}
      <div className="p-5 bg-gradient-to-r from-blue-950 to-blue-900 rounded-3xl text-white shadow-md border border-blue-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-blue-800/80 rounded-2xl border border-blue-700/60 shrink-0">
              <Bell className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Device Push Notifications
                </h3>
                {pushRegistered && permissionStatus === 'granted' ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Setup Needed
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200/90 mt-0.5 leading-relaxed">
                Connect this device to receive lock-screen reminders even when the app is closed.
              </p>
            </div>
          </div>

          <div className="sm:shrink-0">
            {pushRegistered && permissionStatus === 'granted' ? (
              <button
                onClick={handleEnablePush}
                disabled={isRegistering}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isRegistering ? 'Syncing...' : 'Connected (Tap to Re-sync)'}
              </button>
            ) : (
              <button
                onClick={handleEnablePush}
                disabled={isRegistering || !fcmSupported}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Smartphone className="w-4 h-4 text-blue-950" />
                {isRegistering ? 'Connecting...' : 'Enable Lock Screen Alerts'}
              </button>
            )}
          </div>
        </div>

        {/* Status Line */}
        <div className="pt-3 border-t border-blue-800/80 flex flex-wrap items-center justify-between text-[11px] text-blue-200/80 gap-2">
          <span>Browser Permission: <strong className="text-white capitalize">{permissionStatus}</strong></span>
          <span>FCM Support: <strong className="text-white">{fcmSupported ? 'Supported' : 'Not Supported'}</strong></span>
          <span>Account: <strong className="text-white">{currentUser?.email || 'Guest Member'}</strong></span>
        </div>
      </div>

      {/* Preferences Cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Morning Devotion Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl mt-0.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Morning Devotion Reminder
              </h3>
              <p className="text-xs text-slate-500">
                Daily spiritual nourishment and scriptures for sunrise prayer.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <input
              type="time"
              value={notificationPrefs.morningDevotionTime}
              onChange={(e) => updateNotificationPrefs({ morningDevotionTime: e.target.value })}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
            />
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPrefs.morningDevotion}
                onChange={(e) => updateNotificationPrefs({ morningDevotion: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
            </label>
          </div>
        </div>

        {/* Pastor's Daily Lift Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pastor's Daily Lift
              </h3>
              <p className="text-xs text-slate-500">
                Mid-day prophetic encouragement and inspirational boosts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <input
              type="time"
              value={notificationPrefs.dailyLiftTime}
              onChange={(e) => updateNotificationPrefs({ dailyLiftTime: e.target.value })}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
            />
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPrefs.dailyLift}
                onChange={(e) => updateNotificationPrefs({ dailyLift: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        </div>

        {/* Church Services Alert */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl mt-0.5">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Church Services & Live Broadcasts
              </h3>
              <p className="text-xs text-slate-500">
                Alerts 15 minutes before Sunday Services, Mid-Week Digging Deep, and Faith Clinic.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer self-end sm:self-auto">
            <input
              type="checkbox"
              checked={notificationPrefs.churchServices}
              onChange={(e) => updateNotificationPrefs({ churchServices: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {/* Special Events Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl mt-0.5">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Announcements, Vigils & Special Conferences
              </h3>
              <p className="text-xs text-slate-500">
                Church-wide announcements, 10th anniversary updates, and prayer alerts.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer self-end sm:self-auto">
            <input
              type="checkbox"
              checked={notificationPrefs.specialEvents}
              onChange={(e) => updateNotificationPrefs({ specialEvents: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-700"></div>
          </label>
        </div>
      </div>

      {/* INTERACTIVE SAMPLE NOTIFICATION PREVIEWS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-serif-church">
            Test Sample Smartphone Notification Previews
          </h2>
          <p className="text-xs text-slate-500">
            Click to test how notifications appear on your mobile phone and desktop:
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleTestNotification('devotion')}
            className="px-4 py-2 bg-blue-50 text-blue-900 font-bold text-xs rounded-xl hover:bg-blue-100 transition-colors"
          >
            Preview Morning Devotion Alert
          </button>
          <button
            onClick={() => handleTestNotification('lift')}
            className="px-4 py-2 bg-amber-50 text-amber-800 font-bold text-xs rounded-xl hover:bg-amber-100 transition-colors"
          >
            Preview Daily Lift Alert
          </button>
          <button
            onClick={() => handleTestNotification('service')}
            className="px-4 py-2 bg-red-50 text-red-700 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors"
          >
            Preview Live Service Alert
          </button>
        </div>

        {/* Realistic Mobile Push Toast Simulator */}
        {activeTestPreview && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700 flex items-start gap-3.5 animate-in slide-in-from-top-2 duration-200">
            <div className="shrink-0 mt-0.5">
              <VogLogo size="xs" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-amber-400">VESSEL OF GRACE (VOG)</span>
                <span>{activeTestPreview.time}</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-0.5">
                {activeTestPreview.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {activeTestPreview.body}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
