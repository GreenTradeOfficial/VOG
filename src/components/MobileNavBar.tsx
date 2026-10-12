import React from 'react';
import { Home, Radio, BookOpen, Calendar, MoreHorizontal } from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { ActiveTab } from '../types';

interface MobileNavBarProps {
  onOpenMore: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({ onOpenMore }) => {
  const { activeTab, setActiveTab, liveConfig } = useChurch();

  const tabs: {
    id: ActiveTab | 'more';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isLiveBadge?: boolean;
    onClick?: () => void;
  }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      onClick: () => setActiveTab('home'),
    },
    {
      id: 'live',
      label: 'Live',
      icon: Radio,
      isLiveBadge: liveConfig.isLive,
      onClick: () => setActiveTab('live'),
    },
    {
      id: 'daily-word',
      label: 'Daily Word',
      icon: BookOpen,
      onClick: () => setActiveTab('daily-word'),
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      onClick: () => setActiveTab('events'),
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreHorizontal,
      onClick: onOpenMore,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)]"
      role="navigation"
      aria-label="Mobile church navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all relative ${
                isSelected
                  ? 'text-blue-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
              aria-current={isSelected ? 'page' : undefined}
            >
              <div className="relative">
                <tab.icon
                  className={`w-5 h-5 transition-transform ${
                    isSelected ? 'scale-110 text-blue-900 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.isLiveBadge && (
                  <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight leading-none ${isSelected ? 'font-bold text-blue-950' : ''}`}>
                {tab.label}
              </span>

              {/* Active Tab Indicator Bar */}
              {isSelected && (
                <span className="absolute bottom-1 w-5 h-0.5 bg-blue-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
