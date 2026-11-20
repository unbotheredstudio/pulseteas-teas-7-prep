import React, { useState } from 'react';
import { Trophy, Medal, Flame, Award, Users, ArrowUpRight, Sparkles, UserPlus } from 'lucide-react';
import { LeaderboardUser } from '../types/teas';
import { playHapticFeedback } from '../utils/haptics';

interface LeaderboardViewProps {
  leaderboard: LeaderboardUser[];
  onOpenReferral: () => void;
  hapticsEnabled: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  leaderboard,
  onOpenReferral,
  hapticsEnabled,
}) => {
  const [filter, setFilter] = useState<'weekly' | 'allTime' | 'cohort'>('weekly');

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md shadow-amber-400/20">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center shadow-md">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
            🥉
          </div>
        );
      default:
        return (
          <span className="w-7 text-center font-mono text-sm font-semibold text-slate-400 dark:text-slate-500">
            #{rank}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-indigo-950 text-white shadow-xl overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
              <Trophy className="w-3.5 h-3.5 text-teal-300" />
              <span>Community Leaderboard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pre-Nursing Scholar Standings
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
              Compete with students preparing for the ATI TEAS 7. Complete practice tests, maintain streaks, and climb the ranks.
            </p>
          </div>

          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled });
              onOpenReferral();
            }}
            className="py-2.5 px-4 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-500/30 text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4 text-teal-300" />
            <span>Challenge Friends</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled });
              setFilter('weekly');
            }}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all ${
              filter === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled });
              setFilter('allTime');
            }}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all ${
              filter === 'allTime'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All-Time High
          </button>
          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled });
              setFilter('cohort');
            }}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all ${
              filter === 'cohort'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            My Target School
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
          <span>Resets every Monday at 00:00 UTC</span>
        </div>
      </div>

      {/* Leaderboard Table / Card List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
        {leaderboard.map((user, index) => {
          const rank = index + 1;
          const isCurrent = user.isCurrentUser;

          return (
            <div
              key={user.id}
              className={`p-4 sm:p-5 flex items-center justify-between gap-3 transition-colors ${
                isCurrent
                  ? 'bg-teal-50/50 dark:bg-teal-950/20 ring-1 ring-inset ring-teal-500/30'
                  : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
              }`}
            >
              {/* Rank & User Info */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="flex items-center justify-center shrink-0">
                  {getRankBadge(rank)}
                </div>

                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    referrerPolicy="no-referrer"
                  />
                  {isCurrent && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-teal-500 rounded-full border-2 border-white dark:border-slate-900" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user.name}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-600 text-white">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user.targetSchool}
                  </p>
                </div>
              </div>

              {/* Stats & Points */}
              <div className="flex items-center gap-4 sm:gap-8 shrink-0 text-right">
                {/* Streak */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-mono">{user.streakDays}d</span>
                </div>

                {/* Readiness Score */}
                <div className="hidden md:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {user.readinessScore}%
                  </p>
                  <p className="text-[10px] text-slate-400">Readiness</p>
                </div>

                {/* Points / XP */}
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-teal-600 dark:text-teal-400 font-mono tabular-nums">
                    {user.points.toLocaleString()} XP
                  </div>
                  <p className="text-[10px] text-slate-400">{user.testsPassed} tests passed</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
