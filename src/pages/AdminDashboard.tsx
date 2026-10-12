import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Shield,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Tv,
  Calendar,
  BellRing,
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  Copy,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Radio,
  RotateCcw,
  Sliders,
  Send,
  X,
  Layers,
  Info,
  Camera,
  Users,
  Server,
  Terminal,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Wifi,
  Lock,
  Cpu,
  LogOut,
  KeyRound,
  HeartHandshake,
  Crown,
} from 'lucide-react';
import {
  DailyLift,
  DailyDevotion,
  ContentStatus,
  AnniversaryScheduleDay,
  AnniversaryAnnouncement,
  AnniversaryGalleryItem,
} from '../types';
import { AdminGuestManagement } from '../components/AdminGuestManagement';
import { AdminLoginGateway } from '../components/AdminLoginGateway';
import { AdminSermonsManager } from '../components/AdminSermonsManager';
import { AdminEventsManager } from '../components/AdminEventsManager';
import { AdminAnnouncementsManager } from '../components/AdminAnnouncementsManager';
import { AdminPrayersManager } from '../components/AdminPrayersManager';
import { AdminAccessGuide } from '../components/AdminAccessGuide';
import { AdminLeadershipManager } from '../components/AdminLeadershipManager';
import { AdminDailyLiftsManager } from '../components/AdminDailyLiftsManager';
import { analyzeStreamUrl, testStreamSource } from '../utils/streamUtils';
import {
  pollStreamEndpoint,
  determineTrulyActiveBroadcast,
} from '../services/liveStreamService';
import { broadcastChurchNotification } from '../services/fcmNotificationService';
import { ContentCalendarPlanner } from '../components/ContentCalendarPlanner';
import { BulkContentImporter } from '../components/BulkContentImporter';

type AdminTab =
  | 'overview'
  | 'leadership'
  | 'lifts'
  | 'sermons'
  | 'events'
  | 'announcements'
  | 'prayers'
  | 'devotions'
  | 'calendar'
  | 'batch'
  | 'anniversary'
  | 'anniversary-guests'
  | 'live-config'
  | 'access';

export const AdminDashboard: React.FC = () => {
  const {
    dailyLifts,
    addDailyLift,
    updateDailyLift,
    deleteDailyLift,
    dailyDevotions,
    addDailyDevotion,
    updateDailyDevotion,
    deleteDailyDevotion,
    sermons,
    events,
    announcements,
    prayerRequests,
    liveConfig,
    updateLiveConfig,
    anniversaryData,
    updateAnniversaryData,
    serviceSchedule,
    updateServiceSchedule,
    currentUser,
    isAdminMode,
    signOutAdminUser,
    showToast,
  } = useChurch();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Strict Server-Side Access Control: Unauthenticated visitors or non-admin members are blocked
  if (!currentUser) {
    return <AdminLoginGateway />;
  }

  if (currentUser && !isAdminMode) {
    return <AdminLoginGateway isUnauthorizedMember={true} />;
  }

  // Calendar View States
  const [calendarView, setCalendarView] = useState<'day' | 'month' | 'year'>('month');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-10-10');

  // Lift Form Modal State
  const [showLiftModal, setShowLiftModal] = useState(false);
  const [editingLift, setEditingLift] = useState<DailyLift | null>(null);
  const [liftTitle, setLiftTitle] = useState('');
  const [liftContent, setLiftContent] = useState('');
  const [liftScriptureRef, setLiftScriptureRef] = useState('');
  const [liftBibleVerseText, setLiftBibleVerseText] = useState('');
  const [liftDate, setLiftDate] = useState('2026-10-12');
  const [liftCategory, setLiftCategory] = useState<DailyLift['category']>('Encouragement');
  const [liftDeclaration, setLiftDeclaration] = useState('');
  const [liftStatus, setLiftStatus] = useState<ContentStatus>('published');
  const [liftScheduledTime, setLiftScheduledTime] = useState('06:00 AM');

  // Devotion Form Modal State
  const [showDevotionModal, setShowDevotionModal] = useState(false);
  const [editingDevotion, setEditingDevotion] = useState<DailyDevotion | null>(null);
  const [devTheme, setDevTheme] = useState('');
  const [devBibleRef, setDevBibleRef] = useState('');
  const [devBibleVerse, setDevBibleVerse] = useState('');
  const [devTeaching, setDevTeaching] = useState('');
  const [devPrayer, setDevPrayer] = useState('');
  const [devDeclaration, setDevDeclaration] = useState('');
  const [devDate, setDevDate] = useState('2026-10-12');
  const [devStatus, setDevStatus] = useState<ContentStatus>('published');

  // Preview Modal
  const [previewContent, setPreviewContent] = useState<{
    title: string;
    date: string;
    type: string;
    text: string;
    meta?: string;
  } | null>(null);

  // Batch Devotion Generator State
  const [batchThemePrefix, setBatchThemePrefix] = useState('Walking in the Spirit: Part');
  const [batchStartDate, setBatchStartDate] = useState('2026-10-15');
  const [batchDaysCount, setBatchDaysCount] = useState(7);

  // VOG @ 10 Anniversary Admin States
  const [annivTheme, setAnnivTheme] = useState(anniversaryData.theme);
  const [annivDatesText, setAnnivDatesText] = useState(anniversaryData.datesText);
  const [annivPastor, setAnnivPastor] = useState(anniversaryData.seniorPastor);
  const [annivLocation, setAnnivLocation] = useState(anniversaryData.location);
  const [annivYoutubeUrl, setAnnivYoutubeUrl] = useState(anniversaryData.youtubeLiveUrl);
  const [annivFacebookUrl, setAnnivFacebookUrl] = useState(anniversaryData.facebookLiveUrl);
  const [annivTargetDate, setAnnivTargetDate] = useState(anniversaryData.targetDate);
  const [annivIsLive, setAnnivIsLive] = useState(anniversaryData.isLiveActive);
  const [annivReminderText, setAnnivReminderText] = useState(
    '🎉 Join us 28 OCTOBER – 1 NOVEMBER 2026 for the VOG @ 10 Anniversary Celebration! Official Theme: ACCESS (1 Corinthians 2:9–10). Location: Beside AP (Front) Filling Station, Omagwa, Port Harcourt!'
  );

  // Anniversary Announcement Modal State
  const [showAnnivAnnModal, setShowAnnivAnnModal] = useState(false);
  const [editingAnnivAnn, setEditingAnnivAnn] = useState<AnniversaryAnnouncement | null>(null);
  const [annivAnnTitle, setAnnivAnnTitle] = useState('');
  const [annivAnnContent, setAnnivAnnContent] = useState('');
  const [annivAnnBadge, setAnnivAnnBadge] = useState('Official Notice');
  const [annivAnnDate, setAnnivAnnDate] = useState('2026-10-10');

  // Day Schedule Modal State
  const [showDayModal, setShowDayModal] = useState(false);
  const [editingDay, setEditingDay] = useState<AnniversaryScheduleDay | null>(null);
  const [dayTitle, setDayTitle] = useState('');
  const [dayTimePlaceholder, setDayTimePlaceholder] = useState('');
  const [dayDescription, setDayDescription] = useState('');
  const [dayActivities, setDayActivities] = useState<string[]>([]);
  const [dayIsConfirmed, setDayIsConfirmed] = useState(false);
  const [newActivityText, setNewActivityText] = useState('');

  // Gallery Modal State
  const [showGalModal, setShowGalModal] = useState(false);
  const [galYear, setGalYear] = useState('2026');
  const [galTitle, setGalTitle] = useState('');
  const [galDesc, setGalDesc] = useState('');
  const [galTheme, setGalTheme] = useState<AnniversaryGalleryItem['theme']>('worship');

  // Regular Church Service Times Admin States
  const [adminSundayDisplay, setAdminSundayDisplay] = useState(serviceSchedule.sundayDisplay);
  const [adminThursdayDisplay, setAdminThursdayDisplay] = useState(serviceSchedule.thursdayDisplay);
  const [adminSundayDesc, setAdminSundayDesc] = useState(serviceSchedule.descriptionSunday || '');
  const [adminThursdayDesc, setAdminThursdayDesc] = useState(serviceSchedule.descriptionThursday || '');

  // Independent Live Stream Admin States
  const [adminStreamUrl, setAdminStreamUrl] = useState(liveConfig.streamUrl || '');
  const [adminStreamTitle, setAdminStreamTitle] = useState(liveConfig.title);
  const [adminPreacher, setAdminPreacher] = useState(liveConfig.currentPreacher);
  const [adminIsLive, setAdminIsLive] = useState(liveConfig.isLive);
  const [adminTestResult, setAdminTestResult] = useState<{
    tested: boolean;
    isAvailable: boolean;
    message: string;
    details?: string;
  } | null>(null);
  const [isAdminTesting, setIsAdminTesting] = useState(false);
  const [showAdminSetupGuide, setShowAdminSetupGuide] = useState(false);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  // Sync state if liveConfig changes
  React.useEffect(() => {
    setAdminStreamUrl(liveConfig.streamUrl || '');
    setAdminStreamTitle(liveConfig.title);
    setAdminPreacher(liveConfig.currentPreacher);
    setAdminIsLive(liveConfig.isLive);
  }, [liveConfig]);

  const handleTestAdminStream = async () => {
    setIsAdminTesting(true);
    setAdminTestResult(null);
    try {
      const poll = await pollStreamEndpoint(adminStreamUrl);
      setAdminTestResult({
        tested: true,
        isAvailable: poll.isReceivingData,
        message: poll.message,
        details: poll.details || (poll.segmentCount ? `${poll.segmentCount} video segment(s) detected.` : undefined),
      });
    } catch {
      setAdminTestResult({
        tested: true,
        isAvailable: false,
        message: 'Could not test stream connection.',
        details: 'Verify internet connection and ensure your MediaMTX server has HTTPS and CORS enabled.',
      });
    } finally {
      setIsAdminTesting(false);
    }
  };

  const handleSaveLiveStreamConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = adminStreamUrl.trim();
    if (cleanUrl) {
      const check = analyzeStreamUrl(cleanUrl);
      if (!check.isValid) {
        showToast(check.error || 'Please enter a valid stream URL.', 'info');
        return;
      }
    }
    const isReceiving = Boolean(adminTestResult?.isAvailable);
    updateLiveConfig({
      streamUrl: cleanUrl,
      title: adminStreamTitle.trim(),
      currentPreacher: adminPreacher.trim(),
      streamType: 'independent_hls',
      isLive: adminIsLive,
      isReceivingData: adminIsLive ? isReceiving : false,
      validationStatus: adminIsLive ? (isReceiving ? 'verified_active' : 'unverified') : 'offline',
      statusMessage: adminIsLive
        ? (isReceiving ? 'LIVE NOW: Sanctuary service is streaming directly inside VOG.' : 'Broadcast active. Waiting for video data from sanctuary camera.')
        : 'The church is not currently broadcasting live. Check the service schedule below for upcoming services.',
    });
    showToast('Live stream configuration saved and synchronized to cloud!', 'success');
  };

  const copyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2500);
    showToast('Copied to clipboard!', 'info');
  };

  const handleSaveServiceSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    updateServiceSchedule({
      sundayDisplay: adminSundayDisplay.trim(),
      thursdayDisplay: adminThursdayDisplay.trim(),
      descriptionSunday: adminSundayDesc.trim(),
      descriptionThursday: adminThursdayDesc.trim(),
    });
    updateLiveConfig({
      nextServiceTime: `${adminSundayDisplay.trim()} | ${adminThursdayDisplay.trim()}`,
    });
    showToast('Regular church service schedule updated successfully!', 'success');
  };

  const handleSaveGeneralAnniversary = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnniversaryData({
      theme: annivTheme.trim(),
      datesText: annivDatesText.trim(),
      seniorPastor: annivPastor.trim(),
      location: annivLocation.trim(),
      youtubeLiveUrl: annivYoutubeUrl.trim(),
      facebookLiveUrl: annivFacebookUrl.trim(),
      targetDate: annivTargetDate.trim(),
      isLiveActive: annivIsLive,
    });
    showToast('Anniversary core details updated!', 'success');
  };

  const openAnnivAnnModal = (ann?: AnniversaryAnnouncement) => {
    if (ann) {
      setEditingAnnivAnn(ann);
      setAnnivAnnTitle(ann.title);
      setAnnivAnnContent(ann.content);
      setAnnivAnnBadge(ann.badge || 'Official Notice');
      setAnnivAnnDate(ann.date);
    } else {
      setEditingAnnivAnn(null);
      setAnnivAnnTitle('');
      setAnnivAnnContent('');
      setAnnivAnnBadge('Official Notice');
      setAnnivAnnDate('2026-10-10');
    }
    setShowAnnivAnnModal(true);
  };

  const handleSaveAnnivAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annivAnnTitle.trim() || !annivAnnContent.trim()) {
      showToast('Please enter announcement title and content', 'info');
      return;
    }

    let updatedList: AnniversaryAnnouncement[];
    if (editingAnnivAnn) {
      updatedList = anniversaryData.announcements.map((a) =>
        a.id === editingAnnivAnn.id
          ? {
              ...a,
              title: annivAnnTitle.trim(),
              content: annivAnnContent.trim(),
              badge: annivAnnBadge.trim(),
              date: annivAnnDate,
            }
          : a
      );
    } else {
      const newAnn: AnniversaryAnnouncement = {
        id: 'anniv-ann-' + Date.now(),
        title: annivAnnTitle.trim(),
        content: annivAnnContent.trim(),
        badge: annivAnnBadge.trim(),
        date: annivAnnDate,
      };
      updatedList = [newAnn, ...anniversaryData.announcements];
    }

    updateAnniversaryData({ announcements: updatedList });
    setShowAnnivAnnModal(false);
    showToast('Anniversary notice saved!', 'success');
  };

  const handleDeleteAnnivAnnouncement = (id: string) => {
    const updatedList = anniversaryData.announcements.filter((a) => a.id !== id);
    updateAnniversaryData({ announcements: updatedList });
    showToast('Anniversary notice removed', 'info');
  };

  const openDayModal = (day: AnniversaryScheduleDay) => {
    setEditingDay(day);
    setDayTitle(day.dayTitle);
    setDayTimePlaceholder(day.timePlaceholder);
    setDayDescription(day.description);
    setDayActivities([...day.activities]);
    setDayIsConfirmed(day.isConfirmed);
    setNewActivityText('');
    setShowDayModal(true);
  };

  const handleAddDayActivity = () => {
    if (!newActivityText.trim()) return;
    setDayActivities((prev) => [...prev, newActivityText.trim()]);
    setNewActivityText('');
  };

  const handleRemoveDayActivity = (idx: number) => {
    setDayActivities((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveDaySchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;

    const updatedSchedule = anniversaryData.schedule.map((d) =>
      d.id === editingDay.id
        ? {
            ...d,
            dayTitle: dayTitle.trim(),
            timePlaceholder: dayTimePlaceholder.trim(),
            description: dayDescription.trim(),
            activities: dayActivities,
            isConfirmed: dayIsConfirmed,
          }
        : d
    );

    updateAnniversaryData({ schedule: updatedSchedule });
    setShowDayModal(false);
    showToast(`Schedule for ${editingDay.dayName} updated!`, 'success');
  };

  const handleSaveGalItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galTitle.trim() || !galDesc.trim()) {
      showToast('Please provide milestone title and description', 'info');
      return;
    }

    const newItem: AnniversaryGalleryItem = {
      id: 'gal-' + Date.now(),
      year: galYear.trim() || '2026',
      title: galTitle.trim(),
      description: galDesc.trim(),
      theme: galTheme,
    };

    updateAnniversaryData({ gallery: [...anniversaryData.gallery, newItem] });
    setShowGalModal(false);
    setGalTitle('');
    setGalDesc('');
    showToast('10-Year ministry milestone added!', 'success');
  };

  const handleDeleteGalItem = (id: string) => {
    const updatedGallery = anniversaryData.gallery.filter((g) => g.id !== id);
    updateAnniversaryData({ gallery: updatedGallery });
    showToast('Milestone memory removed', 'info');
  };

  const handleBroadcastReminderPreview = async () => {
    if (!annivReminderText.trim()) return;
    showToast('Broadcasting notification to church members...', 'info');
    const res = await broadcastChurchNotification(
      'VOG 10th Anniversary Celebration',
      annivReminderText,
      'announcements',
      currentUser?.email || 'mehedebaedmond@gmail.com',
      '/'
    );
    if (res.success) {
      showToast(`📢 Push Notification Dispatched: "${annivReminderText}"`, 'success');
    } else {
      showToast(`📢 Reminder Notification Broadcasted: "${annivReminderText}"`, 'info');
    }
  };

  // Open Lift Modal for Create or Edit
  const openLiftModal = (lift?: DailyLift) => {
    if (lift) {
      setEditingLift(lift);
      setLiftTitle(lift.title);
      setLiftContent(lift.content);
      setLiftScriptureRef(lift.scriptureRef);
      setLiftBibleVerseText(lift.bibleVerseText);
      setLiftDate(lift.date);
      setLiftCategory(lift.category);
      setLiftDeclaration(lift.faithDeclaration);
      setLiftStatus(lift.status);
      setLiftScheduledTime(lift.scheduledTime || '06:00 AM');
    } else {
      setEditingLift(null);
      setLiftTitle('');
      setLiftContent('');
      setLiftScriptureRef('');
      setLiftBibleVerseText('');
      setLiftDate(new Date().toISOString().split('T')[0]);
      setLiftCategory('Encouragement');
      setLiftDeclaration('');
      setLiftStatus('published');
      setLiftScheduledTime('06:00 AM');
    }
    setShowLiftModal(true);
  };

  const handleSaveLift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liftTitle.trim() || !liftContent.trim()) {
      showToast('Please enter title and content', 'info');
      return;
    }

    if (editingLift) {
      updateDailyLift({
        ...editingLift,
        title: liftTitle.trim(),
        content: liftContent.trim(),
        scriptureRef: liftScriptureRef.trim() || 'Psalm 23:1',
        bibleVerseText: liftBibleVerseText.trim() || 'The Lord is my Shepherd, I lack nothing.',
        date: liftDate,
        category: liftCategory,
        faithDeclaration: liftDeclaration.trim() || 'I declare the peace and grace of God over my life today!',
        status: liftStatus,
        scheduledTime: liftScheduledTime,
      });
    } else {
      addDailyLift({
        title: liftTitle.trim(),
        content: liftContent.trim(),
        scriptureRef: liftScriptureRef.trim() || 'Psalm 23:1',
        bibleVerseText: liftBibleVerseText.trim() || 'The Lord is my Shepherd, I lack nothing.',
        date: liftDate,
        author: 'Pastor West Somina (Senior Pastor)',
        category: liftCategory,
        faithDeclaration: liftDeclaration.trim() || 'I declare divine victory and peace in Jesus’ Name!',
        status: liftStatus,
        scheduledTime: liftScheduledTime,
      });
    }
    setShowLiftModal(false);
  };

  // Open Devotion Modal for Create or Edit
  const openDevotionModal = (dev?: DailyDevotion) => {
    if (dev) {
      setEditingDevotion(dev);
      setDevTheme(dev.theme);
      setDevBibleRef(dev.bibleRef);
      setDevBibleVerse(dev.bibleVerse);
      setDevTeaching(dev.devotionalTeaching);
      setDevPrayer(dev.prayerOfDay);
      setDevDeclaration(dev.faithDeclaration);
      setDevDate(dev.date);
      setDevStatus(dev.status);
    } else {
      setEditingDevotion(null);
      setDevTheme('');
      setDevBibleRef('');
      setDevBibleVerse('');
      setDevTeaching('');
      setDevPrayer('');
      setDevDeclaration('');
      setDevDate(new Date().toISOString().split('T')[0]);
      setDevStatus('published');
    }
    setShowDevotionModal(true);
  };

  const handleSaveDevotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devTheme.trim() || !devTeaching.trim()) {
      showToast('Please enter theme and devotional teaching', 'info');
      return;
    }

    if (editingDevotion) {
      updateDailyDevotion({
        ...editingDevotion,
        theme: devTheme.trim(),
        bibleRef: devBibleRef.trim() || 'Romans 8:31',
        bibleVerse: devBibleVerse.trim() || 'If God is for us, who can be against us?',
        devotionalTeaching: devTeaching.trim(),
        prayerOfDay: devPrayer.trim() || 'Lord, thank You for Your unending grace.',
        faithDeclaration: devDeclaration.trim() || 'I am more than a conqueror through Christ Jesus!',
        date: devDate,
        status: devStatus,
      });
    } else {
      addDailyDevotion({
        theme: devTheme.trim(),
        bibleRef: devBibleRef.trim() || 'Romans 8:31',
        bibleVerse: devBibleVerse.trim() || 'If God is for us, who can be against us?',
        devotionalTeaching: devTeaching.trim(),
        prayerOfDay: devPrayer.trim() || 'Lord, thank You for Your unending grace.',
        faithDeclaration: devDeclaration.trim() || 'I am more than a conqueror through Christ Jesus!',
        date: devDate,
        author: 'Pastor West Somina - Senior Pastor',
        status: devStatus,
      });
    }
    setShowDevotionModal(false);
  };

  // Batch Planner Action
  const handleGenerateBatchDevotions = () => {
    const start = new Date(batchStartDate);
    let countCreated = 0;

    for (let i = 0; i < batchDaysCount; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // Check if devotion already exists
      const exists = dailyDevotions.some((x) => x.date === dateStr);
      if (!exists) {
        addDailyDevotion({
          theme: `${batchThemePrefix} ${i + 1} - Divine Guidance`,
          bibleRef: `Proverbs 3:${5 + (i % 5)}`,
          bibleVerse: 'Trust in the Lord with all your heart and lean not on your own understanding.',
          devotionalTeaching: `Day ${i + 1} of our journey into the Spirit. Walking with God requires daily surrender of our personal plans to His perfect timing. As a chosen vessel, allow His wisdom to lead every step of your work, your family, and your spiritual assignments.\n\nTake time today to meditate on His presence and quiet every distraction.`,
          prayerOfDay: 'Father, order my steps in Your Word. Lead me by Your Holy Spirit and let Your will be done in my life today. Amen.',
          faithDeclaration: 'My steps are ordered by the Lord. I will not stumble or walk in darkness!',
          date: dateStr,
          author: 'Pastor West Somina - Senior Pastor',
          status: 'scheduled',
          scheduledTime: '05:30 AM',
        });
        countCreated++;
      }
    }

    showToast(`Batch generated ${countCreated} daily devotionals in schedule!`, 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] via-[#133E87] to-[#0A1128] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold font-serif-church">
                  VOG Pastoral & Administration Portal
                </h1>
                <span className="text-[10px] font-black bg-emerald-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  Authorized
                </span>
              </div>
              <p className="text-xs text-blue-200/90 font-medium">
                Vessel of Grace Christian Center · Senior Pastor West Somina · Cloud Database Connected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                Logged in Administrator
              </p>
              <p className="text-xs text-white font-mono font-bold truncate max-w-[220px]">
                {currentUser?.email}
              </p>
            </div>
            <button
              onClick={() => signOutAdminUser()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-sm"
              title="Sign out of administrative session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'leadership', label: 'Pastors & Leadership', icon: Crown, isSpecial: true },
          { id: 'lifts', label: `Daily Lifts (${dailyLifts.length})`, icon: Sparkles },
          { id: 'anniversary-guests', label: `Guest Ministers (${anniversaryData.guests?.length || 0})`, icon: Users },
          { id: 'sermons', label: `Sermons (${sermons.length})`, icon: Tv },
          { id: 'events', label: `Events (${events.length})`, icon: Calendar },
          { id: 'announcements', label: `Notices (${announcements.length})`, icon: BellRing },
          { id: 'prayers', label: `Prayers (${prayerRequests.length})`, icon: HeartHandshake },
          { id: 'devotions', label: `Daily Devotions (${dailyDevotions.length})`, icon: BookOpen },
          { id: 'anniversary', label: 'VOG @ 10 Anniversary', icon: Sparkles, isSpecial: true },
          { id: 'calendar', label: 'Editorial Calendar (Lagos Time)', icon: CalendarDays },
          { id: 'batch', label: 'Bulk Importer & Inspector', icon: Layers },
          { id: 'live-config', label: 'Sanctuary Broadcast', icon: Radio },
          { id: 'access', label: 'Admin Security', icon: KeyRound },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all min-h-[40px] ${
                isSelected
                  ? tab.isSpecial
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                    : 'bg-blue-900 text-white shadow-sm'
                  : tab.isSpecial
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-bold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${tab.isSpecial ? 'text-amber-500' : ''}`} />
              <span>{tab.label}</span>
              {tab.isSpecial && (
                <span className="text-[9px] px-1 py-0.2 bg-red-600 text-white rounded font-extrabold uppercase">
                  10 Yrs
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Daily Lifts
              </span>
              <div className="text-2xl font-extrabold text-blue-950 font-mono">
                {dailyLifts.length}
              </div>
              <p className="text-[11px] text-amber-700 font-semibold">
                {dailyLifts.filter((l) => l.status === 'scheduled').length} Scheduled Posts
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Daily Devotions
              </span>
              <div className="text-2xl font-extrabold text-blue-950 font-mono">
                {dailyDevotions.length}
              </div>
              <p className="text-[11px] text-blue-700 font-semibold">
                {dailyDevotions.filter((d) => d.status === 'scheduled').length} Prepared in Advance
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Sermons in Library
              </span>
              <div className="text-2xl font-extrabold text-blue-950 font-mono">
                {sermons.length}
              </div>
              <p className="text-[11px] text-indigo-700 font-semibold">
                Available for Online Replay
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Upcoming Events
              </span>
              <div className="text-2xl font-extrabold text-blue-950 font-mono">
                {events.length}
              </div>
              <p className="text-[11px] text-teal-700 font-semibold">
                Active Church Calendar
              </p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-blue-950 font-serif-church">
              Quick Administrative Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => openLiftModal()}
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all text-left"
              >
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Create Daily Lift</h4>
                  <p className="text-[11px] text-slate-500">Draft or schedule encouragement</p>
                </div>
              </button>

              <button
                onClick={() => openDevotionModal()}
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left"
              >
                <div className="p-2.5 bg-blue-100 text-blue-900 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Create Devotional</h4>
                  <p className="text-[11px] text-slate-500">Add scriptural teaching & prayer</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('batch')}
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-left"
              >
                <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Batch Plan Month</h4>
                  <p className="text-[11px] text-slate-500">Pre-fill 7 or 30 days of messages</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SERMONS TAB */}
      {activeTab === 'sermons' && <AdminSermonsManager />}

      {/* EVENTS TAB */}
      {activeTab === 'events' && <AdminEventsManager />}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && <AdminAnnouncementsManager />}

      {/* PRAYER REQUESTS TAB */}
      {activeTab === 'prayers' && <AdminPrayersManager />}

      {/* ACCESS & SECURITY ROSTER TAB */}
      {activeTab === 'access' && <AdminAccessGuide />}

      {/* PASTORS & CHURCH LEADERSHIP TAB */}
      {activeTab === 'leadership' && <AdminLeadershipManager />}

      {/* 2. MANAGE DAILY LIFTS TAB */}
      {activeTab === 'lifts' && <AdminDailyLiftsManager />}

      {/* 3. MANAGE DAILY DEVOTIONS TAB */}
      {activeTab === 'devotions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-blue-950 font-serif-church">
              Daily Devotions Manager ({dailyDevotions.length})
            </h3>
            <button
              onClick={() => openDevotionModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-800"
            >
              <Plus className="w-4 h-4" />
              <span>New Devotional</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {dailyDevotions.map((dev) => (
                <div key={dev.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        dev.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {dev.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {dev.date}
                      </span>
                      <span className="text-xs text-blue-900 font-semibold">
                        · 📖 {dev.bibleRef}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {dev.theme}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      "{dev.bibleVerse}"
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={() => setPreviewContent({
                        title: dev.theme,
                        date: dev.date,
                        type: 'Daily Devotion',
                        text: `📖 ${dev.bibleRef}: "${dev.bibleVerse}"\n\n${dev.devotionalTeaching}\n\n🙏 Prayer: ${dev.prayerOfDay}`,
                      })}
                      className="p-2 text-slate-500 hover:text-blue-900 rounded-lg hover:bg-slate-100"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openDevotionModal(dev)}
                      className="p-2 text-slate-500 hover:text-blue-900 rounded-lg hover:bg-slate-100"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete Devotional "${dev.theme}"?`)) {
                          deleteDailyDevotion(dev.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. CONTENT CALENDAR & SCHEDULE TAB */}
      {activeTab === 'calendar' && (
        <ContentCalendarPlanner
          onOpenCreateLift={(date) => {
            if (date) setLiftDate(date);
            setEditingLift(null);
            openLiftModal();
          }}
          onEditLift={(lift) => {
            setEditingLift(lift);
            openLiftModal();
          }}
        />
      )}

      {/* 5. BULK CONTENT IMPORTER & INSPECTOR TAB */}
      {activeTab === 'batch' && <BulkContentImporter />}

      {/* 6. LIVE BROADCAST CONFIGURATION TAB */}
      {activeTab === 'live-config' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  INDEPENDENT STREAMING
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cloud Synced</span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-blue-950 font-serif-church">
                Sanctuary Live Broadcast Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Direct HLS stream feed from sanctuary IP camera and MediaMTX server.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAdminSetupGuide(!showAdminSetupGuide)}
              className="text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto min-h-[38px]"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-700" />
              <span>{showAdminSetupGuide ? 'Hide Setup Guide' : 'Equipment Setup Guide'}</span>
              {showAdminSetupGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Practical Equipment Setup Guide (Expandable) */}
          {showAdminSetupGuide && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white text-xs space-y-3.5 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" />
                  <span>Church Hardware & Streaming Guide</span>
                </span>
                <span className="text-[10px] text-slate-400">IP Camera + Laptop + Router</span>
              </div>

              {/* Step 1 */}
              <div className="space-y-1">
                <p className="font-bold text-slate-200 text-[11px]">1. Sanctuary IP Camera (RTSP Stream):</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Mount the IP camera in the church sanctuary and connect it to the church Wi-Fi or Ethernet router. Locate its local IP address (e.g. <code>192.168.1.120</code>). The camera’s RTSP video feed URL is usually:
                </p>
                <div className="bg-black/60 p-2 rounded-lg font-mono text-[10px] text-emerald-400 flex items-center justify-between">
                  <span>rtsp://admin:password@192.168.1.120:554/stream1</span>
                  <button
                    type="button"
                    onClick={() => copyCode('rtsp://admin:password@192.168.1.120:554/stream1', 'rtsp_admin')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedCodeKey === 'rtsp_admin' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-1">
                <p className="font-bold text-slate-200 text-[11px]">2. MediaMTX Streaming Server on Laptop:</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Download MediaMTX (open-source streaming server) on the church laptop. In <code>mediamtx.yml</code> under <code>paths</code>, configure:
                </p>
                <div className="bg-black/60 p-2.5 rounded-lg font-mono text-[10px] text-amber-300 whitespace-pre leading-relaxed relative">
                  {`paths:
  sanctuary:
    source: rtsp://admin:password@192.168.1.120:554/stream1
    sourceOnDemand: no
    hlsAlwaysRemux: yes`}
                  <button
                    type="button"
                    onClick={() =>
                      copyCode(
                        `paths:\n  sanctuary:\n    source: rtsp://admin:password@192.168.1.120:554/stream1\n    sourceOnDemand: no\n    hlsAlwaysRemux: yes`,
                        'mediamtx_admin'
                      )
                    }
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                  >
                    {copiedCodeKey === 'mediamtx_admin' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-1">
                <p className="font-bold text-slate-200 text-[11px]">3. Expose Publicly Over HTTPS (Cloudflare Tunnel):</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Modern web browsers block insecure HTTP streams on HTTPS websites. Run Cloudflare Tunnel on the laptop to get a secure public HTTPS endpoint:
                </p>
                <div className="bg-black/60 p-2 rounded-lg font-mono text-[10px] text-cyan-300 flex items-center justify-between">
                  <span>cloudflared tunnel --url http://localhost:8888</span>
                  <button
                    type="button"
                    onClick={() => copyCode('cloudflared tunnel --url http://localhost:8888', 'tunnel_admin')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedCodeKey === 'tunnel_admin' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Paste the generated public HTTPS URL below (e.g. <code>https://&lt;subdomain&gt;.trycloudflare.com/sanctuary/index.m3u8</code>).
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveLiveStreamConfig} className="space-y-5">
            {/* Live Service Broadcast Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Broadcast Live Status
                </span>
                <span className="text-[11px] text-slate-500">
                  Switch ON when church service is actively broadcasting. When OFF, viewers see the service schedule standby screen.
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={adminIsLive}
                  onChange={(e) => setAdminIsLive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            {/* Broadcast Service Title & Preacher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Broadcast Title
                </label>
                <input
                  type="text"
                  value={adminStreamTitle}
                  onChange={(e) => setAdminStreamTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  placeholder="VOG Sanctuary Live Broadcast"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Preacher
                </label>
                <input
                  type="text"
                  value={adminPreacher}
                  onChange={(e) => setAdminPreacher(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  placeholder="Pastor West Somina (Senior Pastor)"
                />
              </div>
            </div>

            {/* Public HLS Stream URL Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Public HTTPS HLS Stream URL (.m3u8) *
                </label>
                <button
                  type="button"
                  onClick={handleTestAdminStream}
                  disabled={isAdminTesting || !adminStreamUrl.trim()}
                  className="text-[11px] font-bold text-blue-900 hover:text-blue-700 underline flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isAdminTesting ? 'animate-spin' : ''}`} />
                  <span>Test Stream Connectivity</span>
                </button>
              </div>
              <input
                type="text"
                value={adminStreamUrl}
                onChange={(e) => {
                  setAdminStreamUrl(e.target.value);
                  setAdminTestResult(null);
                }}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px]"
                placeholder="https://your-tunnel.trycloudflare.com/sanctuary/index.m3u8"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Must begin with https:// for web browser security. Accessible to worshippers outside church Wi-Fi.
              </span>
            </div>

            {/* Test Result Diagnostic */}
            {adminTestResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  adminTestResult.isAvailable
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {adminTestResult.isAvailable ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{adminTestResult.isAvailable ? 'Stream Online & Reachable' : 'Stream Test Diagnostic'}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{adminTestResult.message}</p>
                {adminTestResult.details && (
                  <p className="text-[10px] text-slate-600 border-t border-slate-200/50 pt-1 mt-1 leading-relaxed">
                    <strong>Details:</strong> {adminTestResult.details}
                  </p>
                )}
              </div>
            )}

            {/* Real-time Stream URL Analysis for Admin */}
            {(() => {
              const streamCheck = analyzeStreamUrl(adminStreamUrl);
              return (
                <div className="p-4 rounded-2xl border text-xs space-y-2 bg-slate-50 border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Active Stream Diagnosis:
                    </span>
                    <span className="font-bold text-blue-900 text-xs px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-200">
                      {streamCheck.label}
                    </span>
                  </div>

                  {streamCheck.error && (
                    <div className="flex items-start gap-1.5 text-rose-700 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <span>{streamCheck.error}</span>
                    </div>
                  )}

                  {streamCheck.warning && (
                    <div className="flex items-start gap-1.5 text-amber-800 font-medium">
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                      <span>{streamCheck.warning}</span>
                    </div>
                  )}

                  {streamCheck.adminGuidance && (
                    <p className="text-[11px] text-slate-600 pt-1 leading-relaxed border-t border-slate-200/60">
                      <strong>Guidance:</strong> {streamCheck.adminGuidance}
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Social Channel Links (Optional) */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Facebook Page Link (Optional)
                </label>
                <input
                  type="text"
                  value={liveConfig.facebookUrl}
                  onChange={(e) => updateLiveConfig({ facebookUrl: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px]"
                  placeholder="https://facebook.com/vesselofgrace"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  YouTube Channel Link (Optional)
                </label>
                <input
                  type="text"
                  value={liveConfig.youtubeUrl}
                  onChange={(e) => updateLiveConfig({ youtubeUrl: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  placeholder="https://youtube.com/@vesselofgrace"
                />
              </div>
            </div>

            {/* Submit & Persistence Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cloud Synced across all visitors & devices</span>
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 min-h-[42px]"
              >
                Save Stream Configuration
              </button>
            </div>
          </form>

          {/* Regular Church Service Times Editor */}
          <form onSubmit={handleSaveServiceSchedule} className="pt-6 border-t border-slate-200 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-blue-950 font-serif-church">
                  Regular Church Service Schedule
                </h4>
                <p className="text-xs text-slate-500">
                  Configure Sunday and Thursday service days, times, and descriptions displayed on Home, Services, and Location cards.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sunday Service Time Display *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminSundayDisplay}
                    onChange={(e) => setAdminSundayDisplay(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-900"
                    placeholder="Sundays, 8:00 AM – 11:00 AM"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Format: "Sundays, 8:00 AM – 11:00 AM"
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thursday Service Time Display *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminThursdayDisplay}
                    onChange={(e) => setAdminThursdayDisplay(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-900"
                    placeholder="Thursdays, from 5:00 PM"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Format: "Thursdays, from 5:00 PM" (No Wednesday service)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sunday Service Description
                </label>
                <input
                  type="text"
                  value={adminSundayDesc}
                  onChange={(e) => setAdminSundayDesc(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  placeholder="Worship, Communion, High Praise, and Ministry of the Word with Senior Pastor West Somina."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Thursday Service Description
                </label>
                <input
                  type="text"
                  value={adminThursdayDesc}
                  onChange={(e) => setAdminThursdayDesc(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  placeholder="Mid-Week Fellowship, In-depth Scriptural Teaching, and Faith Empowerment."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Save Regular Service Times
                </button>
              </div>
            </form>
          </div>
        )}

      {/* 7. VOG @ 10 ANNIVERSARY ADMINISTRATION TAB (SECTION 6) */}
      {activeTab === 'anniversary' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B2545] via-[#133E87] to-[#0A1128] text-white border-2 border-amber-400/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-widest uppercase border border-amber-300/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>VOG @ 10 MILESTONE ADMIN PORTAL</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-serif-church">
                10th Anniversary Celebration Control Center
              </h2>
              <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
                Configure event dates, 5-day program schedules (28 OCTOBER – 1 NOVEMBER 2026), service times, announcements, live broadcast links, and photo milestones.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
              <span className="text-[11px] text-amber-300 font-bold">
                Host: {anniversaryData.seniorPastor}
              </span>
              <span className="text-[11px] text-blue-200">
                Omagwa, Port Harcourt, Rivers State
              </span>
            </div>
          </div>

          {/* Section 1: Core Anniversary Information Form */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-blue-950 font-serif-church">
                  1. Core Event Information & Venue
                </h3>
                <p className="text-xs text-slate-500">
                  Official church details displayed across the banner, page, and sharing cards
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                VOG @ 10
              </span>
            </div>

            <form onSubmit={handleSaveGeneralAnniversary} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Anniversary Theme *
                  </label>
                  <input
                    type="text"
                    required
                    value={annivTheme}
                    onChange={(e) => setAnnivTheme(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-900"
                    placeholder="ACCESS"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Event Dates Display *
                  </label>
                  <input
                    type="text"
                    required
                    value={annivDatesText}
                    onChange={(e) => setAnnivDatesText(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-900"
                    placeholder="28 OCTOBER – 1 NOVEMBER 2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Host Senior Pastor *
                  </label>
                  <input
                    type="text"
                    required
                    value={annivPastor}
                    onChange={(e) => setAnnivPastor(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-900"
                    placeholder="Pastor West Somina"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Countdown Target ISO Date
                  </label>
                  <input
                    type="text"
                    required
                    value={annivTargetDate}
                    onChange={(e) => setAnnivTargetDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px]"
                    placeholder="2026-10-28T09:00:00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Church Location / Venue Address *
                </label>
                <input
                  type="text"
                  required
                  value={annivLocation}
                  onChange={(e) => setAnnivLocation(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-900"
                  placeholder="Beside AP (Front) Filling Station, Omagwa, Port Harcourt, Rivers State, Nigeria"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Save Core Event Info
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Anniversary Guests & Speakers Photo Management */}
          <AdminGuestManagement />

          {/* Section 3: Live Stream & Social Video Links */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-blue-950 font-serif-church">
                  2. Live-Stream Video Links & Broadcast Toggle
                </h3>
                <p className="text-xs text-slate-500">
                  Configure streaming URLs and switch the anniversary stream status
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const newStatus = !annivIsLive;
                  setAnnivIsLive(newStatus);
                  updateAnniversaryData({ isLiveActive: newStatus });
                  showToast(newStatus ? 'Anniversary broadcast marked LIVE!' : 'Anniversary broadcast offline', 'info');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  annivIsLive
                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{annivIsLive ? 'BROADCAST IS LIVE' : 'STREAM OFFLINE (SCHEDULED)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  YouTube Live Channel / Stream URL
                </label>
                <input
                  type="text"
                  value={annivYoutubeUrl}
                  onChange={(e) => setAnnivYoutubeUrl(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  placeholder="https://youtube.com/@vesselofgrace"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Facebook Live URL
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const officialFb = 'https://www.facebook.com/share/v/1MYZauetQx/?mibextid=wwXIfr';
                      setAnnivFacebookUrl(officialFb);
                      setAnnivIsLive(true);
                      updateAnniversaryData({
                        facebookLiveUrl: officialFb,
                        liveStreamPlaceholderUrl: officialFb,
                        isLiveActive: true,
                      });
                      showToast('Connected official Facebook Live stream link!', 'success');
                    }}
                    className="text-[11px] font-bold text-blue-900 hover:text-blue-700 underline"
                  >
                    Paste Live Link
                  </button>
                </div>
                <input
                  type="text"
                  value={annivFacebookUrl}
                  onChange={(e) => setAnnivFacebookUrl(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px]"
                  placeholder="https://www.facebook.com/share/v/1MYZauetQx/?mibextid=wwXIfr"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  updateAnniversaryData({
                    youtubeLiveUrl: annivYoutubeUrl.trim(),
                    facebookLiveUrl: annivFacebookUrl.trim(),
                    liveStreamPlaceholderUrl: annivFacebookUrl.trim(),
                  });
                  showToast('Streaming URLs updated!', 'success');
                }}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Save Streaming Links
              </button>
            </div>
          </div>

          {/* Section 3: Daily Event Schedules (5 Days: 28 OCTOBER – 1 NOVEMBER 2026) */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-blue-950 font-serif-church">
                  3. Daily Event Schedules (28 OCTOBER – 1 NOVEMBER 2026)
                </h3>
                <p className="text-xs text-slate-500">
                  Evening services: 5:00 PM daily (Oct 28–31) · Sunday service: 8:00 AM (Nov 1). Edit program activities and times.
                </p>
              </div>

              <span className="text-xs text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 font-semibold self-start sm:self-auto">
                {anniversaryData.schedule.length} Dedicated Days Configured (28 OCT – 1 NOV 2026)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {anniversaryData.schedule.map((day) => (
                <div
                  key={day.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4 hover:border-blue-900/40 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-blue-900 bg-blue-100/70 px-2.5 py-0.5 rounded-lg">
                        {day.date}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        day.isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {day.isConfirmed ? 'Confirmed' : 'Coming Soon'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {day.dayTitle}
                      </h4>
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{day.timePlaceholder}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {day.description}
                    </p>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Activities ({day.activities.length}):
                      </span>
                      <ul className="text-[11px] text-slate-600 space-y-1">
                        {day.activities.slice(0, 3).map((act, i) => (
                          <li key={i} className="truncate">• {act}</li>
                        ))}
                        {day.activities.length > 3 && (
                          <li className="text-[10px] text-slate-400 italic">
                            + {day.activities.length - 3} more activities...
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openDayModal(day)}
                    className="w-full py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-900" />
                    <span>Edit Day Schedule</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Anniversary Bulletins & Announcements */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-blue-950 font-serif-church">
                  4. Anniversary Bulletins & Announcements
                </h3>
                <p className="text-xs text-slate-500">
                  Notices displayed on the VOG @ 10 anniversary page
                </p>
              </div>

              <button
                type="button"
                onClick={() => openAnnivAnnModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Anniversary Notice</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {anniversaryData.announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                        {ann.badge || 'Bulletin'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {ann.date}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">
                      {ann.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openAnnivAnnModal(ann)}
                      className="p-1.5 text-slate-600 hover:text-blue-900 rounded-lg hover:bg-slate-200/60 transition-colors"
                      title="Edit Notice"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnivAnnouncement(ann.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: 10-Year Ministry Milestones & Photo Gallery */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-blue-950 font-serif-church">
                  5. 10-Year Ministry Milestones & Gallery Cards
                </h3>
                <p className="text-xs text-slate-500">
                  Visual milestone reflections celebrating a decade of God's faithfulness
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowGalModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Milestone</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {anniversaryData.gallery.map((g) => (
                <div
                  key={g.id}
                  className="p-3 rounded-2xl border border-slate-200 bg-white space-y-1.5 flex flex-col justify-between shadow-sm relative group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {g.year}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteGalItem(g.id)}
                        className="text-slate-300 hover:text-red-600 p-1"
                        title="Remove milestone"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {g.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {g.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Anniversary Push Reminder Notification Simulator */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl shadow-lg space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
                <BellRing className="w-3.5 h-3.5" />
                <span>Congregation Push Reminder Simulator</span>
              </div>
              <h3 className="text-lg font-bold font-serif-church">
                Test Anniversary Reminder Broadcast
              </h3>
              <p className="text-xs text-blue-200/90 max-w-2xl">
                Prepare and test reminder push notifications for upcoming celebration dates. (Demonstration feature: simulates push message dispatch in UI).
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-blue-200">
                Reminder Announcement Message:
              </label>
              <textarea
                rows={2}
                value={annivReminderText}
                onChange={(e) => setAnnivReminderText(e.target.value)}
                className="w-full text-xs p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/60 focus:bg-white/15"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-amber-300/80 italic">
                * Real automatic mobile push delivery requires configuration of notification services.
              </span>

              <button
                type="button"
                onClick={handleBroadcastReminderPreview}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Test Notification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANNIVERSARY GUESTS & SPEAKERS TAB VIEW */}
      {activeTab === 'anniversary-guests' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B2545] via-[#133E87] to-[#0A1128] text-white border-2 border-amber-400/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-black tracking-widest uppercase border border-amber-300/40">
                <Camera className="w-3.5 h-3.5 text-amber-300" />
                <span>GUESTS & SPEAKERS PHOTO MANAGEMENT</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-serif-church">
                Anniversary Guest Profiles & Photos
              </h2>
              <p className="text-xs text-blue-200/90 max-w-xl">
                Upload portraits, manage titles, adjust display order, and preview the 2-per-row mobile and desktop gallery layout before presentation.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('anniversary')}
              className="self-start md:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors"
            >
              ← Back to Anniversary Central
            </button>
          </div>

          <AdminGuestManagement />
        </div>
      )}

      {/* LIFT MODAL */}
      {showLiftModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingLift ? 'Edit Daily Lift' : 'Create Daily Lift Encouragement'}
              </h3>
              <button onClick={() => setShowLiftModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLift} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Walking in Divine Favor"
                  value={liftTitle}
                  onChange={(e) => setLiftTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={liftDate}
                    onChange={(e) => setLiftDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={liftCategory}
                    onChange={(e) => setLiftCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Encouragement">Encouragement</option>
                    <option value="Faith">Faith</option>
                    <option value="Grace">Grace</option>
                    <option value="Overcoming">Overcoming</option>
                    <option value="Prayer">Prayer</option>
                    <option value="Wisdom">Wisdom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scripture Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Philippians 4:13"
                    value={liftScriptureRef}
                    onChange={(e) => setLiftScriptureRef(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Publication Status</label>
                  <select
                    value={liftStatus}
                    onChange={(e) => setLiftStatus(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bible Verse Quote</label>
                <input
                  type="text"
                  placeholder="e.g. I can do all things through Christ who strengthens me."
                  value={liftBibleVerseText}
                  onChange={(e) => setLiftBibleVerseText(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content *</label>
                <textarea
                  rows={4}
                  required
                  value={liftContent}
                  onChange={(e) => setLiftContent(e.target.value)}
                  placeholder="Pastor's message of encouragement to the church..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Faith Declaration</label>
                <input
                  type="text"
                  placeholder="e.g. I declare that by His stripes I am healed and preserved!"
                  value={liftDeclaration}
                  onChange={(e) => setLiftDeclaration(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLiftModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-900 rounded-xl"
                >
                  Save Daily Lift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEVOTION MODAL */}
      {showDevotionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingDevotion ? 'Edit Daily Devotional' : 'Create Daily Devotional'}
              </h3>
              <button onClick={() => setShowDevotionModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDevotion} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Theme *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Power of Unshakable Faith"
                  value={devTheme}
                  onChange={(e) => setDevTheme(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={devDate}
                    onChange={(e) => setDevDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scripture Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Hebrews 11:1"
                    value={devBibleRef}
                    onChange={(e) => setDevBibleRef(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bible Verse</label>
                <input
                  type="text"
                  placeholder="e.g. Now faith is confidence in what we hope for..."
                  value={devBibleVerse}
                  onChange={(e) => setDevBibleVerse(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Devotional Teaching (Exposition) *</label>
                <textarea
                  rows={4}
                  required
                  value={devTeaching}
                  onChange={(e) => setDevTeaching(e.target.value)}
                  placeholder="Detailed spiritual teaching for the day..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prayer of the Day</label>
                <input
                  type="text"
                  placeholder="e.g. Lord, strengthen my inner man by Your Spirit..."
                  value={devPrayer}
                  onChange={(e) => setDevPrayer(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDevotionModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-900 rounded-xl"
                >
                  Save Devotional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Content Modal */}
      {previewContent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                {previewContent.type}
              </span>
              <button onClick={() => setPreviewContent(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="text-lg font-bold text-slate-900 font-serif-church">
                {previewContent.title}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Scheduled for {previewContent.date}
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
                {previewContent.text}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setPreviewContent(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-900 rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANNIVERSARY ANNOUNCEMENT MODAL */}
      {showAnnivAnnModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-serif-church">
                {editingAnnivAnn ? 'Edit Anniversary Notice' : 'Add Anniversary Notice'}
              </h3>
              <button onClick={() => setShowAnnivAnnModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnivAnnouncement} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anniversary Thanksgiving Offering & Attire"
                  value={annivAnnTitle}
                  onChange={(e) => setAnnivAnnTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. Official Notice, Spiritual Prep"
                    value={annivAnnBadge}
                    onChange={(e) => setAnnivAnnBadge(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={annivAnnDate}
                    onChange={(e) => setAnnivAnnDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide full details for the church congregation..."
                  value={annivAnnContent}
                  onChange={(e) => setAnnivAnnContent(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAnnivAnnModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-900 rounded-xl"
                >
                  Save Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANNIVERSARY DAY SCHEDULE MODAL */}
      {showDayModal && editingDay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  {editingDay.date}
                </span>
                <h3 className="text-base font-bold text-slate-900 font-serif-church mt-1">
                  Edit Schedule: {editingDay.dayName}
                </h3>
              </div>
              <button onClick={() => setShowDayModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDaySchedule} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program Day Title *
                </label>
                <input
                  type="text"
                  required
                  value={dayTitle}
                  onChange={(e) => setDayTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  placeholder="e.g. Opening Night of Praise, Thanksgiving & Testimonies"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Time / Session Timing *
                  </label>
                  <input
                    type="text"
                    required
                    value={dayTimePlaceholder}
                    onChange={(e) => setDayTimePlaceholder(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                    placeholder="e.g. Evening Session · 05:30 PM (Coming Soon)"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={dayIsConfirmed}
                      onChange={(e) => setDayIsConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-900 focus:ring-0"
                    />
                    <span>Mark as Confirmed (removes Coming Soon)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Session Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={dayDescription}
                  onChange={(e) => setDayDescription(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                  placeholder="Brief spiritual overview of this day's itinerary..."
                />
              </div>

              {/* Activities Checklist */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  Key Activities / Itinerary Highlights:
                </label>

                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {dayActivities.map((act, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200 text-xs">
                      <span className="truncate">• {act}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDayActivity(idx)}
                        className="text-slate-400 hover:text-red-600 p-0.5"
                        title="Remove activity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {dayActivities.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic text-center py-1">
                      No activities added yet. Add one below.
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newActivityText}
                    onChange={(e) => setNewActivityText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDayActivity();
                      }
                    }}
                    placeholder="Add an activity (e.g. Choir ministration, cake cutting)..."
                    className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddDayActivity}
                    className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDayModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-900 rounded-xl"
                >
                  Save Day Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANNIVERSARY GALLERY MILESTONE MODAL */}
      {showGalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-serif-church">
                Add 10-Year Ministry Milestone
              </h3>
              <button onClick={() => setShowGalModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGalItem} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Milestone Year *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026, 2023"
                    value={galYear}
                    onChange={(e) => setGalYear(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Visual Theme</label>
                  <select
                    value={galTheme}
                    onChange={(e) => setGalTheme(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="worship">Worship</option>
                    <option value="fellowship">Fellowship</option>
                    <option value="communion">Communion</option>
                    <option value="cross">Cross & Grace</option>
                    <option value="dawn">Dawn & Breakthrough</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Milestone Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Campus Dedication & Community Outreach"
                  value={galTitle}
                  onChange={(e) => setGalTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe this milestone memory in the life of VOG..."
                  value={galDesc}
                  onChange={(e) => setGalDesc(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGalModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-900 rounded-xl"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
