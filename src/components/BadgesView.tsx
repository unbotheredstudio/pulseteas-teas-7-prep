import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Lock,
  Share2,
  CheckCircle2,
  Trophy,
  Flame,
  Shield,
  Layers,
  HeartPulse,
} from 'lucide-react';
import { Badge, UserState } from '../types/teas';
import { TEAS_BADGES } from '../data/teasBadges';
import { playHapticFeedback } from '../utils/haptics';

interface BadgesViewProps {
  userState: UserState;
  onSelectBadge: (badge: Badge) => void;
  onOpenSocialShare: (badge: Badge) => void;
  hapticsEnabled: boolean;
}

export const BadgesView: React.FC<BadgesViewProps> = ({
  userState,
  onSelectBadge,
  onOpenSocialShare,
  hapticsEnabled,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedSet = new Set(userState.stats.unlockedBadges);
  const totalBadges = TEAS_BADGES.length;
  const unlockedCount = userState.stats.unlockedBadges.length;

  const totalXP = TEAS_BADGES.reduce((sum, b) => {
    return unlockedSet.has(b.id) ? sum + b.xp : sum;
  }, 0);

  const filteredBadges = TEAS_BADGES.filter((badge) => {
    const isUnlocked = unlockedSet.has(badge.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Achievement Summary */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white shadow-xl overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
              <Trophy className="w-3.5 h-3.5 text-teal-300" />
              <span>Digital Credentials Cabinet</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Honors & Digital Badges
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
              Earn verified digital credentials as you conquer exams, answer questions, and build unbreakable study habits.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-center">
              <span className="text-2xl font-black font-mono text-teal-300">
                {unlockedCount} / {totalBadges}
              </span>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider mt-0.5">
                Badges Earned
              </p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <span className="text-2xl font-black font-mono text-amber-300">
                {totalXP}
              </span>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider mt-0.5">
                Total XP Earned
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => {
            playHapticFeedback('light', { hapticsEnabled });
            setFilter('all');
          }}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          All Badges ({totalBadges})
        </button>
        <button
          onClick={() => {
            playHapticFeedback('light', { hapticsEnabled });
            setFilter('unlocked');
          }}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'unlocked'
              ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Unlocked ({unlockedCount})
        </button>
        <button
          onClick={() => {
            playHapticFeedback('light', { hapticsEnabled });
            setFilter('locked');
          }}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'locked'
              ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          To Unlock ({totalBadges - unlockedCount})
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const isUnlocked = unlockedSet.has(badge.id);

          return (
            <div
              key={badge.id}
              onClick={() => {
                if (isUnlocked) {
                  playHapticFeedback('medium', { hapticsEnabled });
                  onSelectBadge(badge);
                } else {
                  playHapticFeedback('warning', { hapticsEnabled });
                }
              }}
              className={`relative p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 shadow-sm hover:shadow-md cursor-pointer'
                  : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                {/* Badge Icon & Rarity Tag */}
                <div className="flex items-start justify-between">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform"
                    style={{
                      background: isUnlocked
                        ? `linear-gradient(135deg, ${badge.badgeColor}, #0f172a)`
                        : '#64748b',
                    }}
                  >
                    {isUnlocked ? (
                      <Award className="w-7 h-7" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-300" />
                    )}
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {badge.rarity}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                  +{badge.xp} XP
                </span>

                {isUnlocked ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playHapticFeedback('light', { hapticsEnabled });
                      onOpenSocialShare(badge);
                    }}
                    className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:text-teal-700 font-semibold"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                    {badge.criteria}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
