import React, { useState, useEffect } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  User as UserIcon,
  Shield,
  Heart,
  Activity,
  Calendar,
  Mail,
  Phone,
  LogOut,
  Edit3,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Tv,
  Trash2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Flame,
  Radio,
  Share2,
} from 'lucide-react';
import { ShareButtons } from '../components/ShareButtons';
import { MemberActivityItem, UserProfile } from '../types';
import {
  logoutMember,
  updateMemberProfileData,
  subscribeToMemberActivity,
  logMemberActivity,
} from '../services/memberAuthService';

interface MemberProfilePageProps {
  onOpenAuth: (mode?: 'login' | 'signup') => void;
}

export const MemberProfilePage: React.FC<MemberProfilePageProps> = ({ onOpenAuth }) => {
  const {
    currentUser,
    userProfile,
    favorites,
    toggleFavorite,
    dailyLifts,
    dailyDevotions,
    sermons,
    setActiveTab,
    showToast,
    isAdminMode,
  } = useChurch();

  const [activeSubTab, setActiveSubTab] = useState<'favorites' | 'activity' | 'profile'>('favorites');
  const [favoriteFilter, setFavoriteFilter] = useState<'all' | 'lift' | 'devotion' | 'sermon'>('all');
  const [activities, setActivities] = useState<MemberActivityItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Subscribe to real-time activity feed
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToMemberActivity(currentUser.uid, (feed) => {
      setActivities(feed);
    });
    return () => unsub();
  }, [currentUser]);

  // Sync edit form with current profile
  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.displayName || currentUser?.displayName || '');
      setEditPhone(userProfile.phoneNumber || '');
    } else if (currentUser) {
      setEditName(currentUser.displayName || '');
      setEditPhone('');
    }
  }, [userProfile, currentUser]);

  const handleSignOut = async () => {
    try {
      await logoutMember();
      showToast('You have been signed out safely.', 'info');
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingProfile(true);
    try {
      await updateMemberProfileData(currentUser.uid, {
        displayName: editName.trim(),
        phoneNumber: editPhone.trim(),
      });
      showToast('Member profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update failed:', err);
      showToast('Could not save profile changes.', 'info');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // If visitor (not signed in), render attractive Member Portal Welcome
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div className="bg-gradient-to-br from-[#0B2545] via-[#133E87] to-[#0A1128] text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-blue-900/60 text-center space-y-5">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20 shadow-inner">
            <UserIcon className="w-8 h-8 text-amber-300" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VOG Member Fellowship</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif-church">
              Connect, Save Favorites & Track Your Faith
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-md mx-auto leading-relaxed">
              Sign in with your email or Google account to bookmark Daily Lifts, keep sermon notes, and preserve your spiritual journey across all your devices.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-blue-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:bg-blue-50 transition-all active:scale-95"
            >
              Sign In to Member Account
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              Create Free Member Profile
            </button>
          </div>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl w-fit">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Cloud Favorites</h3>
            <p className="text-xs text-slate-500">
              Save devotions and sermons to revisit anytime on mobile or desktop.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl w-fit">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Activity History</h3>
            <p className="text-xs text-slate-500">
              Keep a timeline of teachings explored, prayers made, and messages heard.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Pastoral Care</h3>
            <p className="text-xs text-slate-500">
              Direct and confidential communication with church leaders and intercessors.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filter favorites
  const filteredFavorites = favorites.filter((fav) => {
    return favoriteFilter === 'all' || fav.type === favoriteFilter;
  });

  const memberDisplayName =
    userProfile?.displayName || currentUser.displayName || 'VOG Church Member';
  const memberEmail = userProfile?.email || currentUser.email || '';
  const memberInitials = memberDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* 1. MEMBER PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-[#0B2545] via-[#133E87] to-[#0A1128] relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isAdminMode && (
              <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-full text-xs font-black tracking-wide flex items-center gap-1.5 shadow-sm">
                <Shield className="w-3.5 h-3.5" />
                <span>CHURCH ADMINISTRATOR</span>
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12">
          {/* Avatar & Info */}
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-amber-300 font-extrabold text-2xl flex items-center justify-center border-4 border-white shadow-md relative overflow-hidden">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={memberDisplayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{memberInitials || 'VG'}</span>
              )}
            </div>

            <div className="space-y-0.5 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-blue-950 font-serif-church">
                  {memberDisplayName}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  Active Member
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {memberEmail}
                </span>
                {userProfile?.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {userProfile.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Edit Profile Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* In-place Profile Editor Form */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="mx-6 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in"
          >
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Update Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Display Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Telephone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+234 ..."
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900 font-medium"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-4 py-1.5 bg-blue-900 text-white text-xs font-bold rounded-lg hover:bg-blue-800 disabled:opacity-60"
              >
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. STATS & SUMMARY PILLS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div
          onClick={() => setActiveSubTab('favorites')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeSubTab === 'favorites'
              ? 'bg-rose-50/80 border-rose-200 shadow-xs ring-2 ring-rose-300/40'
              : 'bg-white border-slate-200 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Saved Favorites</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {favorites.length}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            Cloud Synced with Firestore
          </span>
        </div>

        <div
          onClick={() => setActiveSubTab('activity')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeSubTab === 'activity'
              ? 'bg-blue-50/80 border-blue-200 shadow-xs ring-2 ring-blue-300/40'
              : 'bg-white border-slate-200 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Tracked Activities</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {activities.length}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            Faith Journey Milestones
          </span>
        </div>

        <div className="p-4 rounded-2xl border bg-white border-slate-200 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Cloud Sync Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-emerald-700 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected & Verified</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block truncate mt-0.5">
            UID: {currentUser.uid.slice(0, 10)}...
          </span>
        </div>
      </div>

      {/* 3. TABS SWITCHER */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('favorites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'favorites'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Saved Spiritual Favorites ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'activity'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>My Faith Journey & Activity ({activities.length})</span>
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      {activeSubTab === 'favorites' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
              {[
                { label: 'All', value: 'all' },
                { label: 'Daily Lifts', value: 'lift' },
                { label: 'Devotions', value: 'devotion' },
                { label: 'Sermons', value: 'sermon' },
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setFavoriteFilter(pill.value as any)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    favoriteFilter === pill.value
                      ? 'bg-white text-blue-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-medium">
              {filteredFavorites.length} item{filteredFavorites.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredFavorites.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No Favorites Saved in This Category
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Bookmark teachings, devotions, or sermons from the Daily Word and Sermons sections to keep them synchronized across your devices.
              </p>
              <button
                onClick={() => setActiveTab('daily-word')}
                className="px-5 py-2.5 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition-colors"
              >
                Browse Today’s Word
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFavorites.map((fav) => {
                let contentText = '';
                let referenceText = '';

                if (fav.type === 'lift') {
                  const lift = dailyLifts.find((l) => l.id === fav.id);
                  if (lift) {
                    contentText = lift.content;
                    referenceText = lift.scriptureRef;
                  }
                } else if (fav.type === 'devotion') {
                  const dev = dailyDevotions.find((d) => d.id === fav.id);
                  if (dev) {
                    contentText = dev.devotionalTeaching;
                    referenceText = dev.bibleRef;
                  }
                } else if (fav.type === 'sermon') {
                  const s = sermons.find((item) => item.id === fav.id);
                  if (s) {
                    contentText = s.summary;
                    referenceText = s.scripture;
                  }
                }

                return (
                  <div
                    key={fav.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {fav.type === 'lift' && (
                          <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                            <Sparkles className="w-4 h-4" />
                          </span>
                        )}
                        {fav.type === 'devotion' && (
                          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-900">
                            <BookOpen className="w-4 h-4" />
                          </span>
                        )}
                        {fav.type === 'sermon' && (
                          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                            <Tv className="w-4 h-4" />
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {fav.type === 'lift'
                            ? 'Daily Lift'
                            : fav.type === 'devotion'
                            ? 'Daily Devotion'
                            : 'Sermon'}
                        </span>
                        <span className="text-slate-300 text-xs">·</span>
                        <span className="text-xs text-slate-500 font-medium">{fav.date}</span>
                      </div>

                      <button
                        onClick={() => toggleFavorite(fav.id, fav.type, fav.title, fav.date)}
                        className="p-1.5 text-rose-500 hover:text-slate-400 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 font-serif-church">
                        {fav.title}
                      </h4>
                      {referenceText && (
                        <p className="text-xs font-semibold text-blue-900 mt-0.5">
                          📖 {referenceText}
                        </p>
                      )}
                      {contentText && (
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                          {contentText}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <ShareButtons
                        title={fav.title}
                        text={contentText}
                        reference={referenceText}
                        showFavorite={false}
                      />

                      <button
                        onClick={() => {
                          if (fav.type === 'sermon') setActiveTab('sermons');
                          else setActiveTab('daily-word');
                        }}
                        className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1"
                      >
                        <span>Open Full</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recent Activity & Spiritual Milestones
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Synced to your member account
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                No Activity Logged Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                As you read daily devotionals, bookmark favorites, submit prayer requests, or listen to sermons, your faith journey activity will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm divide-y divide-slate-100">
              {activities.map((item) => {
                const dateObj = new Date(item.createdAt);
                const formattedTime = !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Recent';

                let iconNode = <Activity className="w-4 h-4 text-blue-600" />;
                let iconBg = 'bg-blue-50';

                if (item.type === 'login') {
                  iconNode = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                  iconBg = 'bg-emerald-50';
                } else if (item.type === 'favorite_added') {
                  iconNode = <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
                  iconBg = 'bg-rose-50';
                } else if (item.type === 'favorite_removed') {
                  iconNode = <Trash2 className="w-4 h-4 text-slate-500" />;
                  iconBg = 'bg-slate-100';
                } else if (item.type === 'prayer_submitted') {
                  iconNode = <Sparkles className="w-4 h-4 text-amber-600" />;
                  iconBg = 'bg-amber-50';
                } else if (item.type === 'sermon_listen') {
                  iconNode = <Tv className="w-4 h-4 text-indigo-600" />;
                  iconBg = 'bg-indigo-50';
                }

                return (
                  <div
                    key={item.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5"
                  >
                    <div className={`p-2 rounded-xl ${iconBg} shrink-0 mt-0.5`}>
                      {iconNode}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {formattedTime}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
