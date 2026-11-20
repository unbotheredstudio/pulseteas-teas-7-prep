import React from 'react';
import {
  Flame,
  Award,
  BookOpen,
  Calculator,
  Languages,
  FlaskConical,
  Play,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Gift,
  Clock,
  TrendingUp,
  FileText,
  Share2,
} from 'lucide-react';
import { UserState, Subject } from '../types/teas';
import { SUBJECT_METAS } from '../data/teasQuestions';
import { TEAS_BADGES } from '../data/teasBadges';
import { playHapticFeedback } from '../utils/haptics';
import { PerformanceTrendsChart } from './PerformanceTrendsChart';
import { DailyGoalRadialTracker } from './DailyGoalRadialTracker';

interface DashboardProps {
  userState: UserState;
  onStartExam: (subject: Subject | 'all', mode: 'practice' | 'mock_exam') => void;
  onNavigateTab: (tab: 'dashboard' | 'flashcards' | 'guides' | 'badges' | 'leaderboard') => void;
  onOpenSubscription: () => void;
  onOpenReferral: () => void;
  onOpenSecurity: () => void;
  onOpenSocialShare: (badge: any) => void;
  onUpdateDailyGoal?: (newGoal: number) => void;
  onLogStudyMinutes?: (minutes: number) => void;
  hapticsEnabled: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userState,
  onStartExam,
  onNavigateTab,
  onOpenSubscription,
  onOpenReferral,
  onOpenSecurity,
  onOpenSocialShare,
  onUpdateDailyGoal,
  onLogStudyMinutes,
  hapticsEnabled,
}) => {
  const { stats, subscription, profile, testHistory, security } = userState;

  // Calculate readiness score from test history
  const averageScore =
    testHistory.length > 0
      ? Math.round(testHistory.reduce((acc, t) => acc + t.score, 0) / testHistory.length)
      : 82;

  const isTrial = subscription.tier === 'free_trial';
  const trialHoursLeft = Math.max(
    0,
    Math.round((subscription.trialExpiresAt - Date.now()) / (1000 * 60 * 60))
  );

  const unlockedBadgesCount = stats.unlockedBadges.length;

  const getSubjectIcon = (sub: Subject) => {
    switch (sub) {
      case 'science':
        return <FlaskConical className="w-5 h-5 text-emerald-500" />;
      case 'math':
        return <Calculator className="w-5 h-5 text-blue-500" />;
      case 'reading':
        return <BookOpen className="w-5 h-5 text-amber-500" />;
      case 'english':
        return <Languages className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 3-Day Free Trial / Subscription Callout Banner */}
      {isTrial && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white shadow-md border border-teal-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  3-Day Free Trial
                </span>
                <span className="text-xs text-slate-300">· {trialHoursLeft}h remaining</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Enjoy full access to mock exams and exclusive printable study guides.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled });
              onOpenSubscription();
            }}
            className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
          >
            <span>Upgrade · $29.99/mo (or 45% off yearly)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero Diagnostic & Readiness Score Strip */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              <span>Goal: {profile.targetSchool}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome back, {profile.name.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Your exam is scheduled in 34 days. Based on your practice performance, your current projected TEAS score is <strong className="text-slate-900 dark:text-slate-100 font-bold">{averageScore}% (Exemplary tier)</strong>.
            </p>
          </div>

          {/* Key Metrics Cluster */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shrink-0 w-full md:w-auto">
            {/* Projected Score */}
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-600 dark:text-teal-400">
                {averageScore}%
              </span>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                Readiness
              </p>
            </div>

            {/* Streak */}
            <div className="text-center border-x border-slate-200 dark:border-slate-700 px-2 sm:px-4">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-extrabold font-mono text-amber-500">
                <Flame className="w-5 h-5 fill-amber-500" />
                <span>{stats.streakDays}</span>
              </div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                Day Streak
              </p>
            </div>

            {/* Badges */}
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-500">
                {unlockedBadgesCount}
              </span>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                Badges
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Row */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playHapticFeedback('medium', { hapticsEnabled });
                onStartExam('all', 'mock_exam');
              }}
              className="flex-1 sm:flex-none py-3 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Full Timed TEAS 7 Mock Exam</span>
            </button>

            <button
              onClick={() => {
                playHapticFeedback('light', { hapticsEnabled });
                onNavigateTab('flashcards');
              }}
              className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Daily Flashcards</span>
            </button>
          </div>

          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled });
              onNavigateTab('guides');
            }}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center justify-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Exclusive Printable Study Guides (PDF)</span>
          </button>
        </div>
      </div>

      {/* Daily Study Goal Radial Tracker */}
      <DailyGoalRadialTracker
        todayStudyMinutes={stats.todayStudyMinutes ?? 22}
        dailyMinuteGoal={stats.dailyMinuteGoal ?? 30}
        onUpdateGoal={(newGoal) => onUpdateDailyGoal?.(newGoal)}
        onLogMinutes={(mins) => onLogStudyMinutes?.(mins)}
        hapticsEnabled={hapticsEnabled}
      />

      {/* Performance Trends Line Chart (Recharts) */}
      <PerformanceTrendsChart
        testHistory={testHistory}
        targetScore={profile.targetScore}
      />

      {/* Four Subject Mastery Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            ATI TEAS 7 Subtests & Diagnostics
          </h2>
          <span className="text-xs text-slate-400">Official Exam Weightings</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['science', 'math', 'reading', 'english'] as Subject[]).map((subj) => {
            const meta = SUBJECT_METAS[subj];

            return (
              <div
                key={subj}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      {getSubjectIcon(subj)}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {meta.totalQuestionsTEAS} Qs · {meta.timeMinutesTEAS}m
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {meta.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {meta.subtopics.join(', ')}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">
                    84% Mastery
                  </span>
                  <button
                    onClick={() => {
                      playHapticFeedback('light', { hapticsEnabled });
                      onStartExam(subj, 'practice');
                    }}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 dark:hover:text-teal-400 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Practice Drill
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Spotlight & Referral Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Badges Showcase */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Unlocked Digital Credentials
              </h3>
            </div>
            <button
              onClick={() => {
                playHapticFeedback('light', { hapticsEnabled });
                onNavigateTab('badges');
              }}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              View All ({TEAS_BADGES.length})
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {TEAS_BADGES.slice(0, 4).map((badge) => {
              const unlocked = stats.unlockedBadges.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  onClick={() => {
                    if (unlocked) {
                      playHapticFeedback('light', { hapticsEnabled });
                      onOpenSocialShare(badge);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-center shrink-0 w-28 cursor-pointer transition-transform ${
                    unlocked
                      ? 'border-teal-500/30 bg-teal-50/30 dark:bg-teal-950/20 hover:scale-105'
                      : 'border-slate-200 dark:border-slate-800 opacity-40'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-white shadow-sm mb-2"
                    style={{
                      background: unlocked
                        ? `linear-gradient(135deg, ${badge.badgeColor}, #0f172a)`
                        : '#94a3b8',
                    }}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                    {badge.title}
                  </h4>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                    +{badge.xp} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gamified Referral Quick Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-900 to-slate-950 text-white shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-teal-300">
              <Gift className="w-3 h-3" />
              <span>Earn Free Premium</span>
            </div>
            <span className="text-xs font-mono text-teal-200">
              {userState.referral.friendsReferred} Invited
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold">Invite a Nursing Friend</h3>
            <p className="text-xs text-teal-100/80 mt-1">
              Give a friend 3 days free trial + 15% discount. Earn 1 free month ($29.99 value) for every friend who prepares with PulseTEAS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playHapticFeedback('light', { hapticsEnabled });
                onOpenReferral();
              }}
              className="py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              Get Invite Link & Code
            </button>
          </div>
        </div>
      </div>

      {/* Security Status Footnote */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>AES-256 E2E Encrypted · Multi-Factor Authentication Active</span>
        </div>
        <button
          onClick={() => {
            playHapticFeedback('light', { hapticsEnabled });
            onOpenSecurity();
          }}
          className="text-teal-600 dark:text-teal-400 hover:underline font-semibold"
        >
          Security & Sync Settings
        </button>
      </div>
    </div>
  );
};
