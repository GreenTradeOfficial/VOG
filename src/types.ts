export type ContentStatus = 'published' | 'scheduled' | 'draft';

export interface DailyLift {
  id: string;
  title: string;
  content: string;
  scriptureRef: string;
  bibleVerseText: string;
  date: string; // YYYY-MM-DD
  author: string;
  category: 'Encouragement' | 'Faith' | 'Grace' | 'Overcoming' | 'Prayer' | 'Wisdom';
  audioDuration?: string;
  faithDeclaration: string;
  sharesCount: number;
  status: ContentStatus;
  scheduledTime?: string;
  prayerPoints?: string;
  imageUrl?: string;
  audioUrl?: string;
  attachmentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChurchLeader {
  id: string;
  fullName: string;
  role: 'Global Union Pastor' | 'Co-Lead Pastor' | 'Associate Pastor' | 'Minister' | string;
  title: string;
  biography: string;
  photoUrl?: string;
  photoStoragePath?: string;
  displayOrder: number;
  isPublished: boolean;
  updatedAt?: string;
}

export interface DailyDevotion {
  id: string;
  date: string; // YYYY-MM-DD
  theme: string;
  bibleVerse: string;
  bibleRef: string;
  devotionalTeaching: string; // Multi-paragraph teaching
  prayerOfDay: string;
  faithDeclaration: string;
  author: string;
  status: ContentStatus;
  scheduledTime?: string;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  serviceType: 'Sunday Celebration' | 'Thursday Service' | 'Special Miracle Service' | 'Grace Conference' | 'Youth Ignite';
  scripture: string;
  videoUrl?: string;
  duration: string;
  summary: string;
  notes: string[];
}

export interface ChurchEvent {
  id: string;
  title: string;
  category: 'Sunday Service' | 'Thursday Service' | 'Prayer Meeting' | 'Special Program' | 'Conference' | 'Worship Night';
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  description: string;
  isHighlighted?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string; // YYYY-MM-DD
  category: 'General' | 'Youth' | 'Men of Grace' | 'Women of Grace' | 'Missions' | 'Choir' | 'Leadership';
  isUrgent?: boolean;
}

export interface PrayerRequest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  category: 'Healing & Health' | 'Family & Marriage' | 'Financial Breakthrough' | 'Spiritual Growth' | 'Deliverance' | 'Thanksgiving';
  requestText: string;
  date: string;
  status: 'received' | 'praying' | 'answered';
  userId?: string;
  createdAt?: string;
  voiceNoteUrl?: string;
  voiceNoteStoragePath?: string;
  voiceNoteDurationSec?: number;
  hasVoiceNote?: boolean;
}

export interface LiveStreamConfig {
  isLive: boolean;
  title: string;
  serviceName: string;
  streamUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  currentPreacher: string;
  nextServiceTime: string;
  viewerCount?: number;
  streamType?: 'auto' | 'facebook' | 'youtube' | 'independent_hls' | 'independent_webrtc' | 'direct';
  independentStreamServerUrl?: string; // Future VOG RTMP/HLS server URL (e.g. https://stream.vogcenter.org/live/service.m3u8)
  validationStatus?: 'verified_active' | 'verified_ended' | 'unavailable' | 'unverified' | 'offline';
  statusMessage?: string;
  isReceivingData?: boolean;
  lastActiveAt?: string | null;
}

export interface ChurchServiceSchedule {
  sundayDay: string; // 'Every Sunday'
  sundayStartTime: string; // '8:00 AM'
  sundayEndTime: string; // '11:00 AM'
  sundayDisplay: string; // 'Sundays, 8:00 AM – 11:00 AM'
  thursdayDay: string; // 'Every Thursday'
  thursdayStartTime: string; // '5:00 PM'
  thursdayDisplay: string; // 'Thursdays, from 5:00 PM'
  descriptionSunday?: string;
  descriptionThursday?: string;
}

export interface NotificationPreferences {
  morningDevotion: boolean;
  morningDevotionTime: string;
  dailyLift: boolean;
  dailyLiftTime: string;
  churchServices: boolean;
  specialEvents: boolean;
  browserPermissionSimulated: boolean;
}

export interface AnniversaryScheduleDay {
  id: string;
  date: string; // '2026-10-28' | '2026-10-29' | '2026-10-30'
  dayName: string; // 'October 28, 2026', etc.
  dayTitle: string;
  timePlaceholder: string; // e.g. 'Evening Session (Time: Coming Soon)'
  description: string;
  activities: string[];
  isConfirmed: boolean;
}

export interface AnniversaryAnnouncement {
  id: string;
  title: string;
  date: string;
  content: string;
  badge?: string;
}

export interface AnniversaryGalleryItem {
  id: string;
  year: string;
  title: string;
  description: string;
  theme: 'worship' | 'fellowship' | 'communion' | 'cross' | 'dawn';
}

export type GuestRoleCategory =
  | 'Senior Pastor'
  | "Pastor's Wife"
  | 'Guest Speaker'
  | 'Visiting Minister'
  | 'Special Guest'
  | 'Other Anniversary Guest';

export interface AnniversaryGuest {
  id: string;
  fullName: string;
  name?: string; // Backwards compatible alias
  role: GuestRoleCategory | string;
  customTitle?: string;
  ministry?: string;
  biography?: string;
  photoUrl?: string; // Firebase Cloud Storage download URL or permanent Cloud Database photo
  photoStoragePath?: string; // Firebase Cloud Storage object path
  displayOrder: number;
  eventOrVisitDate?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnniversaryData {
  title: string;
  subtitle: string;
  theme: string;
  bibleReference?: string;
  datesText: string;
  seniorPastor: string;
  location: string;
  targetDate: string; // '2026-10-28T09:00:00'
  liveStreamPlaceholderUrl: string;
  facebookLiveUrl: string;
  youtubeLiveUrl: string;
  isLiveActive: boolean;
  schedule: AnniversaryScheduleDay[];
  announcements: AnniversaryAnnouncement[];
  gallery: AnniversaryGalleryItem[];
  guests: AnniversaryGuest[];
  featuredLeadershipIntro?: string;
}

export type ActiveTab =
  | 'home'
  | 'live'
  | 'daily-word'
  | 'events'
  | 'more'
  | 'sermons'
  | 'announcements'
  | 'prayer'
  | 'favorites'
  | 'about'
  | 'notifications'
  | 'admin'
  | 'anniversary'
  | 'profile';

export type LiveChatMessageType = 'chat' | 'amen' | 'prayer_point' | 'praise';

export interface LiveChatMessage {
  id: string;
  userName: string;
  message: string;
  type: LiveChatMessageType;
  isAmen?: boolean;
  createdAt?: any;
  clientTimestamp?: number;
  userId?: string;
  isPastorOrAdmin?: boolean;
}

export type MemberRole = 'member' | 'leader' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: MemberRole;
  phoneNumber?: string;
  photoURL?: string;
  memberSince?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MemberActivityType =
  | 'login'
  | 'favorite_added'
  | 'favorite_removed'
  | 'sermon_listen'
  | 'prayer_submitted'
  | 'daily_lift_read'
  | 'devotional_read';

export interface MemberActivityItem {
  id: string;
  userId: string;
  type: MemberActivityType;
  title: string;
  description?: string;
  referenceId?: string;
  createdAt: string; // ISO string
  timestampMs?: number;
}
