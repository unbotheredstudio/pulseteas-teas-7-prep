import React from 'react';
import {
  LayoutDashboard,
  Layers,
  FileText,
  Award,
  Trophy,
  Shield,
  Sparkles,
  Moon,
  Sun,
  Gift,
} from 'lucide-react';
import { UserSubscription } from '../types/teas';
import { playHapticFeedback } from '../utils/haptics';

export type NavTab = 'dashboard' | 'flashcards' | 'guides' | 'badges' | 'leaderboard';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  subscription: UserSubscription;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSubscription: () => void;
  onOpenReferral: () => void;
  onOpenSecurity: () => void;
  hapticsEnabled: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  subscription,
  darkMode,
  onToggleDarkMode,
  onOpenSubscription,
  onOpenReferral,
  onOpenSecurity,
  hapticsEnabled,
}) => {
  const isPremiumOrTrial =
    subscription.isPremium ||
    (subscription.tier === 'free_trial' && Date.now() < subscription.trialExpiresAt);

  const handleNavClick = (tab: NavTab) => {
    playHapticFeedback('light', { hapticsEnabled });
    onSelectTab(tab);
  };

  return (
    <>
      {/* Desktop Top Navigation Bar (Zone 1: Wordmark, Zone 2: Nav Links, Zone 3: Primary Action) */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2 text-left shrink-0 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-teal-600/20 group-hover:bg-teal-500 transition-colors">
              P
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
              PulseTEAS
            </span>
          </button>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'dashboard'
                  ? 'text-teal-600 dark:text-teal-400 font-bold border-b-2 border-teal-600 py-4'
                  : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNavClick('flashcards')}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'flashcards'
                  ? 'text-teal-600 dark:text-teal-400 font-bold border-b-2 border-teal-600 py-4'
                  : ''
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => handleNavClick('guides')}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'guides'
                  ? 'text-teal-600 dark:text-teal-400 font-bold border-b-2 border-teal-600 py-4'
                  : ''
              }`}
            >
              Study Guides (PDF)
            </button>
            <button
              onClick={() => handleNavClick('badges')}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'badges'
                  ? 'text-teal-600 dark:text-teal-400 font-bold border-b-2 border-teal-600 py-4'
                  : ''
              }`}
            >
              Honors & Badges
            </button>
            <button
              onClick={() => handleNavClick('leaderboard')}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'leaderboard'
                  ? 'text-teal-600 dark:text-teal-400 font-bold border-b-2 border-teal-600 py-4'
                  : ''
              }`}
            >
              Leaderboard
            </button>
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Referral Trigger */}
            <button
              onClick={() => {
                playHapticFeedback('light', { hapticsEnabled });
                onOpenReferral();
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refer Friends & Earn Free Month"
              aria-label="Refer Friends"
            >
              <Gift className="w-4 h-4 text-amber-500" />
            </button>

            {/* Security Trigger */}
            <button
              onClick={() => {
                playHapticFeedback('light', { hapticsEnabled });
                onOpenSecurity();
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Security & Cloud Sync"
              aria-label="Security Settings"
            >
              <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </button>

            {/* Dark Mode Quick Toggle */}
            <button
              onClick={() => {
                playHapticFeedback('light', { hapticsEnabled });
                onToggleDarkMode();
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Subscription CTA button */}
            <button
              onClick={() => {
                playHapticFeedback('medium', { hapticsEnabled });
                onOpenSubscription();
              }}
              className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition-all whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isPremiumOrTrial ? 'Trial / Premium' : 'Upgrade · $29.99'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Fixed bottom-0 for natural thumb zone reach) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 no-print">
        <div className="grid grid-cols-5 items-center h-16 px-1 max-w-md mx-auto">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              currentTab === 'dashboard'
                ? 'text-teal-600 dark:text-teal-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Home</span>
          </button>

          <button
            onClick={() => handleNavClick('flashcards')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              currentTab === 'flashcards'
                ? 'text-teal-600 dark:text-teal-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Cards</span>
          </button>

          <button
            onClick={() => handleNavClick('guides')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              currentTab === 'guides'
                ? 'text-teal-600 dark:text-teal-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Guides</span>
          </button>

          <button
            onClick={() => handleNavClick('badges')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              currentTab === 'badges'
                ? 'text-teal-600 dark:text-teal-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Award className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Badges</span>
          </button>

          <button
            onClick={() => handleNavClick('leaderboard')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              currentTab === 'leaderboard'
                ? 'text-teal-600 dark:text-teal-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Ranks</span>
          </button>
        </div>
      </div>
    </>
  );
};
