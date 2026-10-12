import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DailyLift,
  DailyDevotion,
  Sermon,
  ChurchEvent,
  Announcement,
  PrayerRequest,
  LiveStreamConfig,
  NotificationPreferences,
  ActiveTab,
  AnniversaryData,
  AnniversaryGuest,
  ChurchServiceSchedule,
  UserProfile,
  MemberActivityType,
} from '../types';
import {
  initialDailyLifts,
  initialDailyDevotions,
  initialSermons,
  initialEvents,
  initialAnnouncements,
  initialLiveStreamConfig,
  initialNotificationPrefs,
  initialAnniversaryData,
  initialServiceSchedule,
} from '../data/mockData';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  auth,
  googleAuthProvider,
  testFirestoreConnection,
} from '../lib/firebase';
import {
  subscribeToAnniversaryGuests,
  addAnniversaryGuestToFirestore,
  updateAnniversaryGuestInFirestore,
  deleteAnniversaryGuestFromFirestore,
  batchReorderAnniversaryGuests,
} from '../services/anniversaryGuestsService';
import {
  persistLiveConfigToFirestore,
  subscribeToLiveConfigFromFirestore,
  determineTrulyActiveBroadcast,
} from '../services/liveStreamService';
import {
  isUserAuthorizedAdmin,
  checkIfUserIsAdmin,
  fetchMemberProfile,
  subscribeToMemberFavorites,
  saveMemberFavoriteToCloud,
  removeMemberFavoriteFromCloud,
  batchSyncLocalFavoritesToCloud,
  logMemberActivity,
} from '../services/memberAuthService';
import {
  subscribeToSermons,
  subscribeToEvents,
  subscribeToAnnouncements,
  subscribeToDailyLifts,
  subscribeToDailyDevotions,
  subscribeToPrayerRequests,
  saveSermonToCloud,
  deleteSermonFromCloud,
  saveEventToCloud,
  deleteEventFromCloud,
  saveAnnouncementToCloud,
  deleteAnnouncementFromCloud,
  saveDailyLiftToCloud,
  deleteDailyLiftFromCloud,
  saveDailyDevotionToCloud,
  deleteDailyDevotionFromCloud,
  savePrayerRequestToCloud,
  updatePrayerRequestStatusInCloud,
  deletePrayerRequestFromCloud,
} from '../services/churchContentService';
import { subscribeToForegroundFCM } from '../services/fcmNotificationService';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'prayer';
}

interface FavoriteItem {
  id: string;
  type: 'lift' | 'devotion' | 'sermon';
  title: string;
  date: string;
}

interface ChurchContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;

  dailyLifts: DailyLift[];
  dailyDevotions: DailyDevotion[];
  sermons: Sermon[];
  events: ChurchEvent[];
  announcements: Announcement[];
  prayerRequests: PrayerRequest[];
  liveConfig: LiveStreamConfig;
  notificationPrefs: NotificationPreferences;
  favorites: FavoriteItem[];
  customLogoUrl: string | null;
  setCustomLogoUrl: (url: string | null) => void;

  anniversaryData: AnniversaryData;
  updateAnniversaryData: (data: Partial<AnniversaryData>) => void;
  addAnniversaryGuest: (guest: Omit<AnniversaryGuest, 'id'>) => void;
  updateAnniversaryGuest: (id: string, updated: Partial<AnniversaryGuest>) => void;
  deleteAnniversaryGuest: (id: string, photoStoragePath?: string) => void;
  reorderAnniversaryGuests: (guests: AnniversaryGuest[]) => void;
  addAnniversaryGuestAsync: (guest: Omit<AnniversaryGuest, 'id'>) => Promise<string>;
  updateAnniversaryGuestAsync: (id: string, updated: Partial<AnniversaryGuest>) => Promise<void>;
  deleteAnniversaryGuestAsync: (id: string, photoStoragePath?: string) => Promise<void>;

  currentUser: User | null;
  userProfile: UserProfile | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  trackActivity: (type: MemberActivityType, title: string, description?: string, referenceId?: string) => void;

  isFirebaseConnected: boolean;
  firebaseSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  firebaseErrorMessage: string | null;
  signInWithGoogleAdmin: () => Promise<void>;
  signOutAdminUser: () => Promise<void>;
  seedInitialGuestsToFirebase: () => Promise<void>;

  serviceSchedule: ChurchServiceSchedule;
  updateServiceSchedule: (schedule: Partial<ChurchServiceSchedule>) => void;

  toggleFavorite: (id: string, type: 'lift' | 'devotion' | 'sermon', title: string, date: string) => void;
  isFavorite: (id: string) => boolean;
  addPrayerRequest: (req: {
    name: string;
    email?: string;
    phone?: string;
    category: PrayerRequest['category'];
    requestText: string;
    voiceNoteUrl?: string;
    voiceNoteStoragePath?: string;
    voiceNoteDurationSec?: number;
    hasVoiceNote?: boolean;
  }) => void;
  updatePrayerRequestStatus: (id: string, status: PrayerRequest['status']) => void;
  deletePrayerRequest: (id: string) => void;
  
  // Content operations
  addDailyLift: (lift: Omit<DailyLift, 'id' | 'sharesCount'>) => void;
  updateDailyLift: (lift: DailyLift) => void;
  deleteDailyLift: (id: string) => void;
  
  addDailyDevotion: (dev: Omit<DailyDevotion, 'id'>) => void;
  updateDailyDevotion: (dev: DailyDevotion) => void;
  deleteDailyDevotion: (id: string) => void;

  addSermon: (sermon: Omit<Sermon, 'id'>) => void;
  updateSermon: (sermon: Sermon) => void;
  deleteSermon: (id: string) => void;

  addEvent: (event: Omit<ChurchEvent, 'id'>) => void;
  updateEvent: (event: ChurchEvent) => void;
  deleteEvent: (id: string) => void;

  addAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
  updateAnnouncement: (ann: Announcement) => void;
  deleteAnnouncement: (id: string) => void;

  updateLiveConfig: (config: Partial<LiveStreamConfig>) => void;
  verifyTrulyActiveBroadcast: () => Promise<boolean>;
  updateNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void;
  resetToDefaults: () => void;

  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'prayer') => void;
  removeToast: (id: string) => void;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Firebase Auth and Member Profile States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const trackActivity = (type: MemberActivityType, title: string, description?: string, referenceId?: string) => {
    if (currentUser) {
      logMemberActivity(currentUser.uid, type, title, description, referenceId).catch(() => {});
    }
  };
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('syncing');
  const [firebaseErrorMessage, setFirebaseErrorMessage] = useState<string | null>(null);

  // State with localStorage persistence
  const [dailyLifts, setDailyLifts] = useState<DailyLift[]>(() => {
    try {
      const saved = localStorage.getItem('vog_daily_lifts');
      return saved ? JSON.parse(saved) : initialDailyLifts;
    } catch {
      return initialDailyLifts;
    }
  });

  const [dailyDevotions, setDailyDevotions] = useState<DailyDevotion[]>(() => {
    try {
      const saved = localStorage.getItem('vog_daily_devotions');
      return saved ? JSON.parse(saved) : initialDailyDevotions;
    } catch {
      return initialDailyDevotions;
    }
  });

  const [sermons, setSermons] = useState<Sermon[]>(() => {
    try {
      const saved = localStorage.getItem('vog_sermons');
      return saved ? JSON.parse(saved) : initialSermons;
    } catch {
      return initialSermons;
    }
  });

  const [events, setEvents] = useState<ChurchEvent[]>(() => {
    try {
      const saved = localStorage.getItem('vog_events');
      return saved ? JSON.parse(saved) : initialEvents;
    } catch {
      return initialEvents;
    }
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('vog_announcements');
      return saved ? JSON.parse(saved) : initialAnnouncements;
    } catch {
      return initialAnnouncements;
    }
  });

  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(() => {
    try {
      const saved = localStorage.getItem('vog_prayer_requests');
      return saved ? JSON.parse(saved) : [
        {
          id: 'prayer-demo-1',
          name: 'Sister Mary K.',
          category: 'Healing & Health',
          requestText: 'Praying for full recovery from recent surgery and divine strength.',
          date: '2026-10-09',
          status: 'praying',
        },
        {
          id: 'prayer-demo-2',
          name: 'Brother David O.',
          category: 'Financial Breakthrough',
          requestText: 'Believing God for open business doors and new employment favor.',
          date: '2026-10-08',
          status: 'answered',
        }
      ];
    } catch {
      return [];
    }
  });

  const [liveConfig, setLiveConfig] = useState<LiveStreamConfig>(() => {
    try {
      const saved = localStorage.getItem('vog_live_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean up legacy Facebook links or placeholders
        if (
          !parsed.streamUrl ||
          parsed.streamUrl.includes('dQw4w9WgXcQ') ||
          parsed.streamUrl.includes('1MYZauetQx') ||
          parsed.streamUrl.includes('1398818399092145') ||
          parsed.streamUrl.includes('facebook.com/share')
        ) {
          return {
            ...parsed,
            streamUrl: parsed.independentStreamServerUrl || '',
            streamType: 'independent_hls',
            isLive: false,
            validationStatus: 'offline',
          };
        }
        return {
          ...parsed,
          streamType: parsed.streamType || 'independent_hls',
        };
      }
      return initialLiveStreamConfig;
    } catch {
      return initialLiveStreamConfig;
    }
  });

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('vog_notif_prefs');
      return saved ? JSON.parse(saved) : initialNotificationPrefs;
    } catch {
      return initialNotificationPrefs;
    }
  });

  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const saved = localStorage.getItem('vog_favorites');
      return saved ? JSON.parse(saved) : [
        { id: 'lift-1', type: 'lift', title: 'The Unfailing Compassion of God', date: '2026-10-10' },
        { id: 'dev-1', type: 'devotion', title: 'Walking in the Fullness of Grace', date: '2026-10-10' }
      ];
    } catch {
      return [];
    }
  });

  const [anniversaryData, setAnniversaryData] = useState<AnniversaryData>(() => {
    try {
      const saved = localStorage.getItem('vog_anniversary_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasGuests = Array.isArray(parsed.guests) && parsed.guests.length > 0;
        const needsUpdate =
          parsed.theme !== 'ACCESS' ||
          parsed.bibleReference !== '1 CORINTHIANS 2:9–10' ||
          parsed.datesText !== '28 OCTOBER – 1 NOVEMBER 2026' ||
          !Array.isArray(parsed.schedule) ||
          parsed.schedule.length < 5 ||
          !parsed.facebookLiveUrl?.includes('1MYZauetQx') ||
          parsed.location?.includes('Behind') ||
          !hasGuests;

        if (needsUpdate) {
          return {
            ...parsed,
            title: 'VOG @ 10 — 10 Years Anniversary Celebration',
            subtitle: '10 YEARS ANNIVERSARY',
            theme: 'ACCESS',
            bibleReference: '1 CORINTHIANS 2:9–10',
            datesText: '28 OCTOBER – 1 NOVEMBER 2026',
            location: 'Beside AP (Front) Filling Station, Omagwa, Port Harcourt, Rivers State, Nigeria',
            facebookLiveUrl: 'https://www.facebook.com/share/v/1MYZauetQx/?mibextid=wwXIfr',
            liveStreamPlaceholderUrl: 'https://www.facebook.com/share/v/1MYZauetQx/?mibextid=wwXIfr',
            isLiveActive: true,
            schedule: (Array.isArray(parsed.schedule) && parsed.schedule.length === 5)
              ? parsed.schedule
              : initialAnniversaryData.schedule,
            guests: hasGuests ? parsed.guests : initialAnniversaryData.guests,
            featuredLeadershipIntro:
              parsed.featuredLeadershipIntro || initialAnniversaryData.featuredLeadershipIntro,
          };
        }
        return parsed;
      }
      return initialAnniversaryData;
    } catch {
      return initialAnniversaryData;
    }
  });

  useEffect(() => {
    try { localStorage.setItem('vog_anniversary_data', JSON.stringify(anniversaryData)); } catch {}
  }, [anniversaryData]);

  // Firebase Cloud Boot, Auth Listener & Realtime Sync Effect
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsFirebaseConnected(connected);
      if (!connected) setFirebaseSyncStatus('offline');
    });

    let unsubscribeFavorites: (() => void) | null = null;
    let unsubscribePrayers: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (unsubscribeFavorites) {
        unsubscribeFavorites();
        unsubscribeFavorites = null;
      }
      if (unsubscribePrayers) {
        unsubscribePrayers();
        unsubscribePrayers = null;
      }

      if (user) {
        // Asynchronously check admin privileges via email & /admins/{uid} Firestore record
        checkIfUserIsAdmin(user).then((isAdmin) => {
          setIsAdminMode(isAdmin);
          if (isAdmin) {
            unsubscribePrayers = subscribeToPrayerRequests(true, user.uid, (cloudPrayers) => {
              if (cloudPrayers && cloudPrayers.length > 0) {
                setPrayerRequests(cloudPrayers);
              }
            });
          }
        });

        // Fetch or prepare member profile
        fetchMemberProfile(user.uid).then((prof) => {
          if (prof) {
            setUserProfile(prof);
          } else {
            const fallbackProf: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'VOG Church Member',
              role: isUserAuthorizedAdmin(user) ? 'admin' : 'member',
              memberSince: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };
            setUserProfile(fallbackProf);
          }
        });

        // Listen to member favorites in Firestore
        unsubscribeFavorites = subscribeToMemberFavorites(user.uid, (cloudFavs) => {
          if (cloudFavs && cloudFavs.length > 0) {
            setFavorites((prev) => {
              const map = new Map<string, FavoriteItem>();
              prev.forEach((f) => map.set(f.id, f));
              cloudFavs.forEach((f) => map.set(f.id, f));
              return Array.from(map.values());
            });
          } else {
            setFavorites((curr) => {
              if (curr && curr.length > 0) {
                batchSyncLocalFavoritesToCloud(user.uid, curr).catch(() => {});
              }
              return curr;
            });
          }
        });
      } else {
        setUserProfile(null);
        setIsAdminMode(false);
      }
    });

    // Real-time Firestore content subscriptions
    const unsubGuests = subscribeToAnniversaryGuests(
      (firestoreGuests) => {
        setIsFirebaseConnected(true);
        setFirebaseSyncStatus('synced');
        setFirebaseErrorMessage(null);
        if (firestoreGuests && firestoreGuests.length > 0) {
          setAnniversaryData((prev) => ({
            ...prev,
            guests: firestoreGuests,
          }));
        }
      },
      (err) => {
        console.warn('Realtime guest sync note:', err.message);
        setFirebaseSyncStatus('offline');
        setFirebaseErrorMessage(err.message);
      }
    );

    const unsubSermons = subscribeToSermons((items) => {
      if (items && items.length > 0) setSermons(items);
    });

    const unsubEvents = subscribeToEvents((items) => {
      if (items && items.length > 0) setEvents(items);
    });

    const unsubAnnouncements = subscribeToAnnouncements((items) => {
      if (items && items.length > 0) setAnnouncements(items);
    });

    const unsubLifts = subscribeToDailyLifts((items) => {
      if (items && items.length > 0) setDailyLifts(items);
    });

    const unsubDevotions = subscribeToDailyDevotions((items) => {
      if (items && items.length > 0) setDailyDevotions(items);
    });

    const unsubFCM = subscribeToForegroundFCM((payload) => {
      showToast(`🔔 ${payload.title}: ${payload.body}`, 'info');
    });

    return () => {
      unsubscribeAuth();
      unsubGuests();
      unsubSermons();
      unsubEvents();
      unsubAnnouncements();
      unsubLifts();
      unsubDevotions();
      unsubFCM();
      if (unsubscribeFavorites) unsubscribeFavorites();
      if (unsubscribePrayers) unsubscribePrayers();
    };
  }, []);

  const [serviceSchedule, setServiceSchedule] = useState<ChurchServiceSchedule>(() => {
    try {
      const saved = localStorage.getItem('vog_service_schedule');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.sundayDisplay !== 'Sundays, 8:00 AM – 11:00 AM' ||
          parsed.thursdayDisplay !== 'Thursdays, from 5:00 PM'
        ) {
          return {
            ...parsed,
            sundayDay: 'Every Sunday',
            sundayStartTime: '8:00 AM',
            sundayEndTime: '11:00 AM',
            sundayDisplay: 'Sundays, 8:00 AM – 11:00 AM',
            thursdayDay: 'Every Thursday',
            thursdayStartTime: '5:00 PM',
            thursdayDisplay: 'Thursdays, from 5:00 PM',
          };
        }
        return parsed;
      }
      return initialServiceSchedule;
    } catch {
      return initialServiceSchedule;
    }
  });

  useEffect(() => {
    try { localStorage.setItem('vog_service_schedule', JSON.stringify(serviceSchedule)); } catch {}
  }, [serviceSchedule]);

  const updateServiceSchedule = (updated: Partial<ChurchServiceSchedule>) => {
    setServiceSchedule((prev) => ({ ...prev, ...updated }));
  };

  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('vog_custom_logo');
    } catch {
      return null;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try { localStorage.setItem('vog_daily_lifts', JSON.stringify(dailyLifts)); } catch {}
  }, [dailyLifts]);

  useEffect(() => {
    try { localStorage.setItem('vog_daily_devotions', JSON.stringify(dailyDevotions)); } catch {}
  }, [dailyDevotions]);

  useEffect(() => {
    try { localStorage.setItem('vog_sermons', JSON.stringify(sermons)); } catch {}
  }, [sermons]);

  useEffect(() => {
    try { localStorage.setItem('vog_events', JSON.stringify(events)); } catch {}
  }, [events]);

  useEffect(() => {
    try { localStorage.setItem('vog_announcements', JSON.stringify(announcements)); } catch {}
  }, [announcements]);

  useEffect(() => {
    try { localStorage.setItem('vog_prayer_requests', JSON.stringify(prayerRequests)); } catch {}
  }, [prayerRequests]);

  useEffect(() => {
    try { localStorage.setItem('vog_live_config', JSON.stringify(liveConfig)); } catch {}
  }, [liveConfig]);

  // Real-time synchronization of Live Stream config from Firestore across all devices
  useEffect(() => {
    const unsub = subscribeToLiveConfigFromFirestore((cloudConfig) => {
      setLiveConfig((prev) => ({
        ...prev,
        ...cloudConfig,
      }));
    });
    return () => unsub();
  }, []);

  // Periodic Telemetry Polling:
  // When broadcasting is toggled live, poll the stream endpoint every 25 seconds
  // to verify whether the broadcast is genuinely active and receiving video data.
  useEffect(() => {
    if (!liveConfig.isLive || !liveConfig.streamUrl) {
      return;
    }

    let isMounted = true;

    const runTelemetryCheck = async () => {
      try {
        const check = await determineTrulyActiveBroadcast(liveConfig);
        if (isMounted) {
          setLiveConfig((prev) => {
            if (prev.isReceivingData === check.isReceivingData &&
                prev.validationStatus === (check.isTrulyActive ? 'verified_active' : 'unavailable')) {
              return prev;
            }
            return {
              ...prev,
              isReceivingData: check.isReceivingData,
              validationStatus: check.isTrulyActive ? 'verified_active' : (prev.isLive ? 'unavailable' : 'offline'),
              statusMessage: check.statusMessage,
            };
          });
        }
      } catch {}
    };

    // Initial check on mount/streamUrl change
    runTelemetryCheck();

    // Poll every 25 seconds during active broadcast
    const interval = setInterval(runTelemetryCheck, 25000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [liveConfig.isLive, liveConfig.streamUrl]);

  useEffect(() => {
    try { localStorage.setItem('vog_notif_prefs', JSON.stringify(notificationPrefs)); } catch {}
  }, [notificationPrefs]);

  useEffect(() => {
    try { localStorage.setItem('vog_favorites', JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  useEffect(() => {
    try {
      if (customLogoUrl) {
        localStorage.setItem('vog_custom_logo', customLogoUrl);
      } else {
        localStorage.removeItem('vog_custom_logo');
      }
    } catch {}
  }, [customLogoUrl]);

  // Toast notifications helper
  const showToast = (message: string, type: 'success' | 'info' | 'prayer' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.some((f) => f.id === id);
  };

  const toggleFavorite = (id: string, type: 'lift' | 'devotion' | 'sermon', title: string, date: string) => {
    const exists = favorites.some((f) => f.id === id);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.id !== id));
      showToast('Removed from your Favorites', 'info');
      if (currentUser) {
        removeMemberFavoriteFromCloud(currentUser.uid, id).catch(() => {});
        logMemberActivity(currentUser.uid, 'favorite_removed', 'Removed from Favorites', title, id).catch(() => {});
      }
    } else {
      const newItem = { id, type, title, date };
      setFavorites((prev) => [...prev, newItem]);
      showToast('Saved to your Favorites ❤️', 'success');
      if (currentUser) {
        saveMemberFavoriteToCloud(currentUser.uid, newItem).catch(() => {});
        logMemberActivity(
          currentUser.uid,
          'favorite_added',
          'Saved to Favorites',
          `${type.toUpperCase()}: ${title}`,
          id
        ).catch(() => {});
      }
    }
  };

  const addPrayerRequest = (req: {
    name: string;
    email?: string;
    phone?: string;
    category: PrayerRequest['category'];
    requestText: string;
    voiceNoteUrl?: string;
    voiceNoteStoragePath?: string;
    voiceNoteDurationSec?: number;
    hasVoiceNote?: boolean;
  }) => {
    const newReq: PrayerRequest = {
      id: 'prayer-' + Date.now(),
      name: req.name.trim() || 'Anonymous Brethren',
      email: req.email?.trim(),
      phone: req.phone?.trim(),
      category: req.category,
      requestText: req.requestText.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'received',
      userId: currentUser?.uid,
      voiceNoteUrl: req.voiceNoteUrl,
      voiceNoteStoragePath: req.voiceNoteStoragePath,
      voiceNoteDurationSec: req.voiceNoteDurationSec,
      hasVoiceNote: Boolean(req.hasVoiceNote || req.voiceNoteUrl),
    };
    setPrayerRequests((prev) => [newReq, ...prev]);
    savePrayerRequestToCloud(newReq).catch((err) => console.warn('Prayer save to cloud note:', err));
    showToast(
      req.voiceNoteUrl
        ? 'Your prayer request & voice note have been received in confidentiality 🙏'
        : 'Your prayer request has been received with spiritual love & prayer 🙏',
      'prayer'
    );
    if (currentUser) {
      logMemberActivity(
        currentUser.uid,
        'prayer_submitted',
        'Prayer Request Submitted',
        `Category: ${req.category} · "${req.requestText.slice(0, 50)}..."`
      ).catch(() => {});
    }
  };

  const updatePrayerRequestStatus = (id: string, status: PrayerRequest['status']) => {
    setPrayerRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    updatePrayerRequestStatusInCloud(id, status).catch(() => {});
    showToast(`Prayer request marked as ${status}`, 'success');
  };

  const deletePrayerRequest = (id: string) => {
    setPrayerRequests((prev) => prev.filter((r) => r.id !== id));
    deletePrayerRequestFromCloud(id).catch(() => {});
    showToast('Prayer request deleted', 'info');
  };

  const addDailyLift = (lift: Omit<DailyLift, 'id' | 'sharesCount'>) => {
    const newLift: DailyLift = {
      ...lift,
      id: 'lift-' + Date.now(),
      sharesCount: 0,
    };
    setDailyLifts((prev) => [newLift, ...prev]);
    saveDailyLiftToCloud(newLift).catch(() => {});
    showToast('Daily Lift published to church cloud!');
  };

  const updateDailyLift = (updated: DailyLift) => {
    setDailyLifts((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    saveDailyLiftToCloud(updated).catch(() => {});
    showToast('Daily Lift updated in church cloud!');
  };

  const deleteDailyLift = (id: string) => {
    setDailyLifts((prev) => prev.filter((l) => l.id !== id));
    deleteDailyLiftFromCloud(id).catch(() => {});
    showToast('Daily Lift removed', 'info');
  };

  const addDailyDevotion = (dev: Omit<DailyDevotion, 'id'>) => {
    const newDev: DailyDevotion = {
      ...dev,
      id: 'dev-' + Date.now(),
    };
    setDailyDevotions((prev) => [newDev, ...prev]);
    saveDailyDevotionToCloud(newDev).catch(() => {});
    showToast('Daily Devotional published to church cloud!');
  };

  const updateDailyDevotion = (updated: DailyDevotion) => {
    setDailyDevotions((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    saveDailyDevotionToCloud(updated).catch(() => {});
    showToast('Devotional updated in church cloud!');
  };

  const deleteDailyDevotion = (id: string) => {
    setDailyDevotions((prev) => prev.filter((d) => d.id !== id));
    deleteDailyDevotionFromCloud(id).catch(() => {});
    showToast('Devotional removed from cloud', 'info');
  };

  const addSermon = (sermon: Omit<Sermon, 'id'>) => {
    const newSermon: Sermon = {
      ...sermon,
      id: 'sermon-' + Date.now(),
    };
    setSermons((prev) => [newSermon, ...prev]);
    saveSermonToCloud(newSermon).catch(() => {});
    showToast('Sermon published to church archive!');
  };

  const updateSermon = (updated: Sermon) => {
    setSermons((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    saveSermonToCloud(updated).catch(() => {});
    showToast('Sermon updated in cloud archive!');
  };

  const deleteSermon = (id: string) => {
    setSermons((prev) => prev.filter((s) => s.id !== id));
    deleteSermonFromCloud(id).catch(() => {});
    showToast('Sermon removed from archive', 'info');
  };

  const addEvent = (event: Omit<ChurchEvent, 'id'>) => {
    const newEvent: ChurchEvent = {
      ...event,
      id: 'event-' + Date.now(),
    };
    setEvents((prev) => [newEvent, ...prev]);
    saveEventToCloud(newEvent).catch(() => {});
    showToast('Event published to church calendar!');
  };

  const updateEvent = (updated: ChurchEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    saveEventToCloud(updated).catch(() => {});
    showToast('Event updated in church calendar!');
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    deleteEventFromCloud(id).catch(() => {});
    showToast('Event deleted from calendar', 'info');
  };

  const addAnnouncement = (ann: Omit<Announcement, 'id'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: 'ann-' + Date.now(),
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    saveAnnouncementToCloud(newAnn).catch(() => {});
    showToast('Announcement posted to church notices!');
  };

  const updateAnnouncement = (updated: Announcement) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    saveAnnouncementToCloud(updated).catch(() => {});
    showToast('Announcement updated!');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    deleteAnnouncementFromCloud(id).catch(() => {});
    showToast('Announcement removed', 'info');
  };

  const verifyTrulyActiveBroadcast = async (): Promise<boolean> => {
    try {
      const result = await determineTrulyActiveBroadcast(liveConfig);
      setLiveConfig((prev) => {
        const next: LiveStreamConfig = {
          ...prev,
          isReceivingData: result.isReceivingData,
          validationStatus: result.isTrulyActive ? 'verified_active' : (prev.isLive ? 'unavailable' : 'offline'),
          statusMessage: result.statusMessage,
        };
        try { localStorage.setItem('vog_live_config', JSON.stringify(next)); } catch {}
        return next;
      });
      return result.isTrulyActive;
    } catch {
      return false;
    }
  };

  const updateLiveConfig = (config: Partial<LiveStreamConfig>) => {
    setLiveConfig((prev) => {
      const updated = { ...prev, ...config };
      try {
        localStorage.setItem('vog_live_config', JSON.stringify(updated));
      } catch {}
      persistLiveConfigToFirestore(updated).catch(() => {});
      return updated;
    });
    showToast('Live stream settings updated!');
  };

  const updateNotificationPrefs = (prefs: Partial<NotificationPreferences>) => {
    setNotificationPrefs((prev) => ({ ...prev, ...prefs }));
    showToast('Notification preferences saved!');
  };

  const updateAnniversaryData = (updated: Partial<AnniversaryData>) => {
    setAnniversaryData((prev) => ({ ...prev, ...updated }));
    showToast('Anniversary celebration details updated!');
  };

  const signInWithGoogleAdmin = async () => {
    try {
      setFirebaseSyncStatus('syncing');
      const res = await signInWithPopup(auth, googleAuthProvider);
      setCurrentUser(res.user);
      const isAuthAdmin = await checkIfUserIsAdmin(res.user);
      if (isAuthAdmin) {
        setIsAdminMode(true);
        showToast(`Welcome Administrator: ${res.user.displayName || res.user.email}!`, 'success');
      } else {
        setIsAdminMode(false);
        showToast(
          `Signed in as member (${res.user.email}). Account does not possess administrative privileges.`,
          'info'
        );
      }
    } catch (err: any) {
      console.error('Google Sign-in note:', err);
      showToast(`Sign-in note: ${err.message}`, 'info');
    }
  };

  const signOutAdminUser = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAdminMode(false);
      setActiveTab('home');
      showToast('Signed out of Administrator session.', 'info');
    } catch (err: any) {
      console.error('Sign-out note:', err);
    }
  };

  const addAnniversaryGuestAsync = async (guest: Omit<AnniversaryGuest, 'id'>): Promise<string> => {
    try {
      setFirebaseSyncStatus('syncing');
      const docId = await addAnniversaryGuestToFirestore(guest);
      setFirebaseSyncStatus('synced');
      showToast(`Saved profile for "${guest.fullName || guest.name}" to Cloud Firestore!`, 'success');
      return docId;
    } catch (err: any) {
      console.warn('Direct Firestore save note, updating local state:', err);
      const fallbackId = `guest-${Date.now()}`;
      setAnniversaryData((prev) => ({
        ...prev,
        guests: [...(prev.guests || []), { ...guest, id: fallbackId }],
      }));
      showToast(`Saved profile: "${guest.fullName || guest.name}"`, 'success');
      return fallbackId;
    }
  };

  const addAnniversaryGuest = (guest: Omit<AnniversaryGuest, 'id'>) => {
    addAnniversaryGuestAsync(guest);
  };

  const updateAnniversaryGuestAsync = async (id: string, updated: Partial<AnniversaryGuest>): Promise<void> => {
    try {
      setFirebaseSyncStatus('syncing');
      await updateAnniversaryGuestInFirestore(id, updated);
      setFirebaseSyncStatus('synced');
      showToast('Guest profile updated in Cloud Firestore!', 'success');
    } catch (err: any) {
      console.warn('Firestore update note, updating locally:', err);
      setAnniversaryData((prev) => ({
        ...prev,
        guests: (prev.guests || []).map((g) => (g.id === id ? { ...g, ...updated } : g)),
      }));
      showToast('Guest profile updated successfully!', 'success');
    }
  };

  const updateAnniversaryGuest = (id: string, updated: Partial<AnniversaryGuest>) => {
    updateAnniversaryGuestAsync(id, updated);
  };

  const deleteAnniversaryGuestAsync = async (id: string, photoStoragePath?: string): Promise<void> => {
    try {
      setFirebaseSyncStatus('syncing');
      await deleteAnniversaryGuestFromFirestore(id, photoStoragePath);
      setFirebaseSyncStatus('synced');
      showToast('Guest profile removed from Cloud Firestore.', 'info');
    } catch (err: any) {
      console.warn('Firestore delete note, removing locally:', err);
      setAnniversaryData((prev) => ({
        ...prev,
        guests: (prev.guests || []).filter((g) => g.id !== id),
      }));
      showToast('Guest profile removed.', 'info');
    }
  };

  const deleteAnniversaryGuest = (id: string, photoStoragePath?: string) => {
    deleteAnniversaryGuestAsync(id, photoStoragePath);
  };

  const reorderAnniversaryGuests = async (reordered: AnniversaryGuest[]) => {
    const withUpdatedOrder = reordered.map((g, index) => ({
      ...g,
      displayOrder: index + 1,
    }));
    setAnniversaryData((prev) => ({
      ...prev,
      guests: withUpdatedOrder,
    }));
    try {
      await batchReorderAnniversaryGuests(withUpdatedOrder);
      setFirebaseSyncStatus('synced');
    } catch (err) {
      console.warn('Batch order saved in local state');
    }
  };

  const seedInitialGuestsToFirebase = async () => {
    try {
      setFirebaseSyncStatus('syncing');
      for (const g of initialAnniversaryData.guests) {
        await addAnniversaryGuestToFirestore({
          fullName: g.fullName || g.name || '',
          name: g.fullName || g.name || '',
          role: g.role,
          customTitle: g.customTitle || '',
          ministry: g.ministry || '',
          biography: g.biography || '',
          photoUrl: g.photoUrl || '',
          photoStoragePath: g.photoStoragePath || '',
          displayOrder: g.displayOrder,
          isPublished: true,
        });
      }
      setFirebaseSyncStatus('synced');
      showToast('Default church guests seeded to Cloud Firestore successfully!', 'success');
    } catch (err: any) {
      console.error('Failed to seed profiles to Firestore:', err);
      showToast(`Seeding notice: ${err.message}`, 'info');
    }
  };

  const resetToDefaults = () => {
    setDailyLifts(initialDailyLifts);
    setDailyDevotions(initialDailyDevotions);
    setSermons(initialSermons);
    setEvents(initialEvents);
    setAnnouncements(initialAnnouncements);
    setLiveConfig(initialLiveStreamConfig);
    setNotificationPrefs(initialNotificationPrefs);
    setAnniversaryData(initialAnniversaryData);
    setServiceSchedule(initialServiceSchedule);
    setCustomLogoUrl(null);
    localStorage.clear();
    showToast('Prototype reset to initial church demonstration data', 'info');
  };

  return (
    <ChurchContext.Provider
      value={{
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        isAdminMode,
        setIsAdminMode,
        dailyLifts,
        dailyDevotions,
        sermons,
        events,
        announcements,
        prayerRequests,
        liveConfig,
        notificationPrefs,
        favorites,
        customLogoUrl,
        setCustomLogoUrl,
        anniversaryData,
        updateAnniversaryData,
        addAnniversaryGuest,
        updateAnniversaryGuest,
        deleteAnniversaryGuest,
        reorderAnniversaryGuests,
        addAnniversaryGuestAsync,
        updateAnniversaryGuestAsync,
        deleteAnniversaryGuestAsync,
        currentUser,
        userProfile,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        trackActivity,
        isFirebaseConnected,
        firebaseSyncStatus,
        firebaseErrorMessage,
        signInWithGoogleAdmin,
        signOutAdminUser,
        seedInitialGuestsToFirebase,
        serviceSchedule,
        updateServiceSchedule,
        toggleFavorite,
        isFavorite,
        addPrayerRequest,
        updatePrayerRequestStatus,
        deletePrayerRequest,
        addDailyLift,
        updateDailyLift,
        deleteDailyLift,
        addDailyDevotion,
        updateDailyDevotion,
        deleteDailyDevotion,
        addSermon,
        updateSermon,
        deleteSermon,
        addEvent,
        updateEvent,
        deleteEvent,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        updateLiveConfig,
        verifyTrulyActiveBroadcast,
        updateNotificationPrefs,
        resetToDefaults,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
};

export const useChurch = () => {
  const context = useContext(ChurchContext);
  if (!context) {
    throw new Error('useChurch must be used within a ChurchProvider');
  }
  return context;
};
