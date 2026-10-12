import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Heart,
  BookOpen,
  Sparkles,
  Tv,
  Trash2,
  Share2,
  Copy,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ShareButtons } from '../components/ShareButtons';

export const FavoritesPage: React.FC = () => {
  const {
    favorites,
    toggleFavorite,
    dailyLifts,
    dailyDevotions,
    sermons,
    setActiveTab,
    liveConfig,
    showToast,
    currentUser,
    openAuthModal,
  } = useChurch();

  const [filterType, setFilterType] = useState<'all' | 'lift' | 'devotion' | 'sermon'>('all');

  const filteredFavorites = favorites.filter((fav) => {
    return filterType === 'all' || fav.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              SAVED SPIRITUAL TREASURES
            </span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-xs text-slate-500 font-medium">{favorites.length} Saved</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-serif-church">
            My Saved Favorites
          </h1>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl">
          {[
            { label: 'All', value: 'all' },
            { label: 'Lifts', value: 'lift' },
            { label: 'Devotions', value: 'devotion' },
            { label: 'Sermons', value: 'sermon' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilterType(item.value as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filterType === item.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cloud Sync & Member Account Status Banner */}
      {currentUser ? (
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-950 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Cloud Synced to Firestore for Member:</span>
            <span className="text-emerald-900 font-bold">{currentUser.displayName || currentUser.email}</span>
          </div>
          <button
            onClick={() => setActiveTab('profile')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
          >
            View Faith Activity →
          </button>
        </div>
      ) : (
        <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="text-blue-950 space-y-0.5">
            <div className="font-bold flex items-center gap-1.5">
              <span>Saved on this browser</span>
              <span className="text-[10px] bg-blue-200/60 text-blue-900 px-1.5 py-0.5 rounded font-mono">Guest</span>
            </div>
            <div className="text-[11px] text-blue-800">
              Sign in to sync your spiritual favorites across all devices and keep a personal activity timeline.
            </div>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap"
          >
            Sign In / Join VOG
          </button>
        </div>
      )}

      {/* Official Facebook Link Card */}
      <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-blue-950 font-semibold">
          <span>Official Church Facebook Community:</span>
          <span className="text-blue-800 font-bold">{liveConfig.facebookUrl}</span>
        </div>
        <button
          onClick={() => {
            showToast('Opening official church Facebook page placeholder...', 'info');
            window.open(liveConfig.facebookUrl, '_blank');
          }}
          className="flex items-center gap-1 text-blue-900 font-bold hover:underline"
        >
          <span>Visit Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              No Favorites Saved Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Tap the heart icon on any Daily Lift, Devotional, or Sermon to keep it here for quick access.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('daily-word')}
            className="px-5 py-2.5 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-800"
          >
            Explore Today’s Word
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFavorites.map((fav) => {
            // Find details
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
              const sermon = sermons.find((s) => s.id === fav.id);
              if (sermon) {
                contentText = sermon.summary;
                referenceText = sermon.scripture;
              }
            }

            return (
              <div
                key={fav.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3"
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
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {fav.type === 'lift' ? 'Daily Lift' : fav.type === 'devotion' ? 'Daily Devotion' : 'Sermon'}
                      </span>
                      <span className="text-slate-300 text-xs mx-1.5">·</span>
                      <span className="text-xs text-slate-500 font-medium">{fav.date}</span>
                    </div>
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
                  <h3 className="text-base font-bold text-slate-900 font-serif-church">
                    {fav.title}
                  </h3>
                  {referenceText && (
                    <p className="text-xs font-semibold text-blue-900 mt-0.5">
                      📖 {referenceText}
                    </p>
                  )}
                  {contentText && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {contentText}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
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
  );
};
