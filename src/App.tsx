/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  loadUserState,
  saveUserState,
  evaluateBadgeUnlocks,
  MOCK_LEADERBOARD,
} from './utils/storage';
import { UserState, Subject, TestResult, Badge, UserSubscription } from './types/teas';
import { TEAS_BADGES } from './data/teasBadges';
import { Navigation, NavTab } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { FlashcardsView } from './components/FlashcardsView';
import { StudyGuidesView } from './components/StudyGuidesView';
import { BadgesView } from './components/BadgesView';
import { LeaderboardView } from './components/LeaderboardView';
import { QuizView } from './components/QuizView';
import { BadgeModal } from './components/BadgeModal';
import { SocialShareModal } from './components/SocialShareModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { ReferralModal } from './components/ReferralModal';
import { SecurityAndSettingsModal } from './components/SecurityAndSettingsModal';
import { playHapticFeedback } from './utils/haptics';
import { Bell, Check, ShieldAlert, X } from 'lucide-react';

export default function App() {
  const [userState, setUserState] = useState<UserState>(() => loadUserState());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Test mode state
  const [activeTestConfig, setActiveTestConfig] = useState<{
    active: boolean;
    subject: Subject | 'all';
    mode: 'practice' | 'mock_exam';
  }>({
    active: false,
    subject: 'all',
    mode: 'mock_exam',
  });

  // Modals state
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showNoReturnModal, setShowNoReturnModal] = useState(false);
  const [celebrationBadge, setCelebrationBadge] = useState<Badge | null>(null);
  const [socialSharePayload, setSocialSharePayload] = useState<{
    badge?: Badge | null;
    testResult?: TestResult | null;
  } | null>(null);

  // In-app push notification toast simulator
  const [notificationToast, setNotificationToast] = useState<{
    title: string;
    body: string;
  } | null>(null);

  // Sync state to local storage
  useEffect(() => {
    saveUserState(userState);
  }, [userState]);

  // Sync Dark mode to document.documentElement
  useEffect(() => {
    if (userState.preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userState.preferences.darkMode]);

  const handleToggleDarkMode = () => {
    const nextDark = !userState.preferences.darkMode;
    playHapticFeedback('light', { hapticsEnabled: userState.preferences.hapticsEnabled });
    setUserState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        darkMode: nextDark,
      },
    }));
  };

  // Start Exam
  const handleStartExam = (subject: Subject | 'all', mode: 'practice' | 'mock_exam') => {
    setActiveTestConfig({
      active: true,
      subject,
      mode,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When a test completes
  const handleFinishTest = (result: TestResult) => {
    setUserState((prev) => {
      const updatedHistory = [result, ...prev.testHistory];
      const updatedState: UserState = {
        ...prev,
        stats: {
          ...prev.stats,
          totalAnswered: prev.stats.totalAnswered + result.totalQuestions,
          totalCorrect: prev.stats.totalCorrect + result.correctCount,
          studyMinutes: prev.stats.studyMinutes + Math.round(result.timeSpentSeconds / 60),
        },
        testHistory: updatedHistory,
      };

      const { updatedState: evaluatedState, newlyUnlocked } = evaluateBadgeUnlocks(
        updatedState,
        result
      );

      // If newly unlocked badges, trigger celebration modal for first new badge
      if (newlyUnlocked.length > 0) {
        const firstBadgeObj = TEAS_BADGES.find((b) => b.id === newlyUnlocked[0]);
        if (firstBadgeObj) {
          setTimeout(() => {
            setCelebrationBadge(firstBadgeObj);
          }, 600);
        }
      } else if (result.passed) {
        // If passed without new badge, prompt social share celebration option!
        setTimeout(() => {
          setSocialSharePayload({ testResult: result });
        }, 800);
      }

      return evaluatedState;
    });
  };

  // Update flashcard status
  const handleUpdateFlashcardStatus = (cardId: string, status: 'new' | 'learning' | 'mastered') => {
    setUserState((prev) => {
      const updated = {
        ...prev,
        stats: {
          ...prev.stats,
          flashcardStatus: {
            ...prev.stats.flashcardStatus,
            [cardId]: status,
          },
        },
      };

      const { updatedState, newlyUnlocked } = evaluateBadgeUnlocks(updated);
      if (newlyUnlocked.length > 0) {
        const firstBadgeObj = TEAS_BADGES.find((b) => b.id === newlyUnlocked[0]);
        if (firstBadgeObj) {
          setCelebrationBadge(firstBadgeObj);
        }
      }
      return updatedState;
    });
  };

  // Update subscription
  const handleUpdateSubscription = (newSub: UserSubscription) => {
    setUserState((prev) => ({
      ...prev,
      subscription: newSub,
    }));
  };

  // Simulate friend referral
  const handleSimulateReferral = () => {
    setUserState((prev) => {
      const updated: UserState = {
        ...prev,
        referral: {
          ...prev.referral,
          friendsReferred: prev.referral.friendsReferred + 1,
          creditsEarnedMonths: prev.referral.creditsEarnedMonths + 1,
        },
      };

      const { updatedState, newlyUnlocked } = evaluateBadgeUnlocks(updated);
      if (newlyUnlocked.length > 0) {
        const firstBadgeObj = TEAS_BADGES.find((b) => b.id === newlyUnlocked[0]);
        if (firstBadgeObj) {
          setCelebrationBadge(firstBadgeObj);
        }
      }
      return updatedState;
    });
  };

  // Award manual badge (e.g. Offline Scholar)
  const handleAwardBadge = (badgeId: string) => {
    setUserState((prev) => {
      if (prev.stats.unlockedBadges.includes(badgeId)) return prev;
      const updated: UserState = {
        ...prev,
        stats: {
          ...prev.stats,
          unlockedBadges: [...prev.stats.unlockedBadges, badgeId],
        },
      };
      const badgeObj = TEAS_BADGES.find((b) => b.id === badgeId);
      if (badgeObj) {
        setCelebrationBadge(badgeObj);
      }
      return updated;
    });
  };

  // Trigger push reminder alert
  const handleTriggerNotification = (title: string, body: string) => {
    setNotificationToast({ title, body });
    setTimeout(() => {
      setNotificationToast(null);
    }, 5000);
  };

  const handleUpdateDailyGoal = (newGoal: number) => {
    setUserState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        dailyMinuteGoal: newGoal,
      },
    }));
  };

  const handleLogStudyMinutes = (minutes: number) => {
    setUserState((prev) => {
      const currentToday = prev.stats.todayStudyMinutes ?? 0;
      const updatedToday = currentToday + minutes;
      const updatedTotal = prev.stats.studyMinutes + minutes;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          todayStudyMinutes: updatedToday,
          studyMinutes: updatedTotal,
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 pb-20 md:pb-12">
      {/* Push Notification In-App Toast Alert */}
      {notificationToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-teal-500/30 flex items-start gap-3 animate-in slide-in-from-top duration-300 no-print">
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {notificationToast.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
              {notificationToast.body}
            </p>
          </div>
          <button
            onClick={() => setNotificationToast(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Mobile Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setActiveTestConfig({ active: false, subject: 'all', mode: 'mock_exam' });
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        subscription={userState.subscription}
        darkMode={userState.preferences.darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenSubscription={() => setShowSubscriptionModal(true)}
        onOpenReferral={() => setShowReferralModal(true)}
        onOpenSecurity={() => setShowSecurityModal(true)}
        hapticsEnabled={userState.preferences.hapticsEnabled}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTestConfig.active ? (
          <QuizView
            initialSubject={activeTestConfig.subject}
            mode={activeTestConfig.mode}
            onFinishTest={handleFinishTest}
            onExit={() => {
              setActiveTestConfig({ active: false, subject: 'all', mode: 'mock_exam' });
            }}
            hapticsEnabled={userState.preferences.hapticsEnabled}
            soundEnabled={userState.preferences.soundEnabled}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                userState={userState}
                onStartExam={handleStartExam}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenSubscription={() => setShowSubscriptionModal(true)}
                onOpenReferral={() => setShowReferralModal(true)}
                onOpenSecurity={() => setShowSecurityModal(true)}
                onOpenSocialShare={(badge) => setSocialSharePayload({ badge })}
                onUpdateDailyGoal={handleUpdateDailyGoal}
                onLogStudyMinutes={handleLogStudyMinutes}
                hapticsEnabled={userState.preferences.hapticsEnabled}
              />
            )}

            {currentTab === 'flashcards' && (
              <FlashcardsView
                userState={userState}
                onUpdateFlashcardStatus={handleUpdateFlashcardStatus}
                hapticsEnabled={userState.preferences.hapticsEnabled}
              />
            )}

            {currentTab === 'guides' && (
              <StudyGuidesView
                subscription={userState.subscription}
                onOpenSubscription={() => setShowSubscriptionModal(true)}
                onAwardBadge={handleAwardBadge}
                hapticsEnabled={userState.preferences.hapticsEnabled}
              />
            )}

            {currentTab === 'badges' && (
              <BadgesView
                userState={userState}
                onSelectBadge={(badge) => setCelebrationBadge(badge)}
                onOpenSocialShare={(badge) => setSocialSharePayload({ badge })}
                hapticsEnabled={userState.preferences.hapticsEnabled}
              />
            )}

            {currentTab === 'leaderboard' && (
              <LeaderboardView
                leaderboard={MOCK_LEADERBOARD}
                onOpenReferral={() => setShowReferralModal(true)}
                hapticsEnabled={userState.preferences.hapticsEnabled}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} PulseTEAS. Not affiliated with or endorsed by ATI (Assessment Technologies Institute, LLC).
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSecurityModal(true)}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              AES-256 Security & Encryption
            </button>
            <button
              onClick={() => setShowReferralModal(true)}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Referral Program
            </button>
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Pricing ($29.99/mo)
            </button>
            <button
              onClick={() => {
                playHapticFeedback('light', { hapticsEnabled: userState.preferences.hapticsEnabled });
                setShowNoReturnModal(true);
              }}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              No Return Policy
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {showSubscriptionModal && (
        <SubscriptionModal
          subscription={userState.subscription}
          onUpdateSubscription={handleUpdateSubscription}
          onClose={() => setShowSubscriptionModal(false)}
          hapticsEnabled={userState.preferences.hapticsEnabled}
        />
      )}

      {showReferralModal && (
        <ReferralModal
          userState={userState}
          onSimulateReferral={handleSimulateReferral}
          onClose={() => setShowReferralModal(false)}
          hapticsEnabled={userState.preferences.hapticsEnabled}
        />
      )}

      {showSecurityModal && (
        <SecurityAndSettingsModal
          userState={userState}
          onUpdateState={(newState) => setUserState(newState)}
          onClose={() => setShowSecurityModal(false)}
          onTriggerNotification={handleTriggerNotification}
        />
      )}

      {celebrationBadge && (
        <BadgeModal
          badge={celebrationBadge}
          onClose={() => setCelebrationBadge(null)}
          onShare={(b) => {
            setCelebrationBadge(null);
            setSocialSharePayload({ badge: b });
          }}
          hapticsEnabled={userState.preferences.hapticsEnabled}
          soundEnabled={userState.preferences.soundEnabled}
        />
      )}

      {socialSharePayload && (
        <SocialShareModal
          badge={socialSharePayload.badge}
          testResult={socialSharePayload.testResult}
          userName={userState.profile.name}
          onClose={() => setSocialSharePayload(null)}
          hapticsEnabled={userState.preferences.hapticsEnabled}
        />
      )}

      {showNoReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="no-return-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="no-return-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                    No Return &amp; Final Sale Policy
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Digital Study Subscriptions &amp; PDF Guides
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNoReturnModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                All PulseTEAS digital subscription purchases ($29.99/month and $199.99/year plans) are{' '}
                <strong className="text-slate-900 dark:text-slate-100">final sale with no returns or refunds</strong>{' '}
                once payment is authorized and digital exam materials, flashcards, and downloadable PDF study guides are unlocked.
              </p>
              <p>
                New students receive a <strong className="text-slate-900 dark:text-slate-100">3-day free trial</strong> to evaluate all features at $0.00 before purchasing. You may cancel future recurring renewals anytime prior to your next billing date.
              </p>
            </div>

            <button
              onClick={() => {
                playHapticFeedback('light', { hapticsEnabled: userState.preferences.hapticsEnabled });
                setShowNoReturnModal(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
