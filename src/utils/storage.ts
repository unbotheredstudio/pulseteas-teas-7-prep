import { UserState, TestResult, LeaderboardUser } from '../types/teas';
import { TEAS_BADGES } from '../data/teasBadges';
import { playHapticFeedback } from './haptics';

const STORAGE_KEY = 'pulseteas_state_v1';

export const INITIAL_USER_STATE: UserState = {
  profile: {
    name: 'Sarah Jenkins',
    email: 'sarah.nurse2026@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1594824813589-324317926c45?w=150&auto=format&fit=crop&q=80',
    targetSchool: 'Johns Hopkins School of Nursing (BSN)',
    examDate: '2026-12-15',
    targetScore: 88,
  },
  subscription: {
    isPremium: false,
    tier: 'free_trial',
    trialStartedAt: Date.now() - 1000 * 60 * 60 * 18, // 18 hours ago
    trialExpiresAt: Date.now() + 1000 * 60 * 60 * (72 - 18), // 3 days total
    autoRenew: true,
  },
  security: {
    mfaEnabled: true,
    mfaMethod: 'authenticator',
    biometricEnabled: false,
    e2eEncrypted: true,
    lastCloudBackup: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    encryptionKeyFingerprint: 'SHA256:7f4a9b...c1e9',
  },
  preferences: {
    darkMode: false,
    hapticsEnabled: true,
    soundEnabled: true,
    pushReminders: true,
    reminderTime: '19:00',
  },
  referral: {
    code: 'PULSE-SJ782',
    friendsReferred: 2,
    creditsEarnedMonths: 2,
  },
  stats: {
    streakDays: 4,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalAnswered: 42,
    totalCorrect: 36,
    studyMinutes: 185,
    todayStudyMinutes: 22,
    dailyMinuteGoal: 30,
    unlockedBadges: ['badge-first-step', 'badge-streak-3'],
    bookmarks: ['sci-003', 'math-002'],
    flashcardStatus: {
      'fc-sci-001': 'mastered',
      'fc-sci-002': 'learning',
      'fc-math-001': 'mastered',
      'fc-math-002': 'learning',
    },
  },
  testHistory: [
    {
      id: 'test-init-08',
      date: 'Today at 10:45 AM',
      timestamp: Date.now() - 3600000 * 3,
      subject: 'science',
      score: 88,
      totalQuestions: 10,
      correctCount: 9,
      timeSpentSeconds: 520,
      passed: true,
      mode: 'practice',
      answers: [],
    },
    {
      id: 'test-init-07',
      date: 'Yesterday at 3:15 PM',
      timestamp: Date.now() - 86400000,
      subject: 'all',
      score: 85,
      totalQuestions: 15,
      correctCount: 13,
      timeSpentSeconds: 780,
      passed: true,
      mode: 'mock_exam',
      answers: [],
    },
    {
      id: 'test-init-06',
      date: '2 days ago',
      timestamp: Date.now() - 86400000 * 2,
      subject: 'math',
      score: 82,
      totalQuestions: 10,
      correctCount: 8,
      timeSpentSeconds: 610,
      passed: true,
      mode: 'practice',
      answers: [],
    },
    {
      id: 'test-init-05',
      date: '4 days ago',
      timestamp: Date.now() - 86400000 * 4,
      subject: 'reading',
      score: 80,
      totalQuestions: 10,
      correctCount: 8,
      timeSpentSeconds: 540,
      passed: true,
      mode: 'practice',
      answers: [],
    },
    {
      id: 'test-init-04',
      date: '6 days ago',
      timestamp: Date.now() - 86400000 * 6,
      subject: 'all',
      score: 76,
      totalQuestions: 20,
      correctCount: 15,
      timeSpentSeconds: 1140,
      passed: true,
      mode: 'mock_exam',
      answers: [],
    },
    {
      id: 'test-init-03',
      date: '8 days ago',
      timestamp: Date.now() - 86400000 * 8,
      subject: 'english',
      score: 72,
      totalQuestions: 10,
      correctCount: 7,
      timeSpentSeconds: 490,
      passed: false,
      mode: 'practice',
      answers: [],
    },
    {
      id: 'test-init-02',
      date: '10 days ago',
      timestamp: Date.now() - 86400000 * 10,
      subject: 'science',
      score: 68,
      totalQuestions: 10,
      correctCount: 7,
      timeSpentSeconds: 580,
      passed: false,
      mode: 'practice',
      answers: [],
    },
    {
      id: 'test-init-01',
      date: '12 days ago',
      timestamp: Date.now() - 86400000 * 12,
      subject: 'all',
      score: 64,
      totalQuestions: 15,
      correctCount: 10,
      timeSpentSeconds: 890,
      passed: false,
      mode: 'mock_exam',
      answers: [],
    },
  ],
};

export const MOCK_LEADERBOARD: LeaderboardUser[] = [
  {
    id: 'lb-1',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    targetSchool: 'UCLA School of Nursing',
    points: 3450,
    testsPassed: 14,
    streakDays: 18,
    readinessScore: 94,
  },
  {
    id: 'lb-2',
    name: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    targetSchool: 'Duke University ABSN',
    points: 3120,
    testsPassed: 12,
    streakDays: 14,
    readinessScore: 91,
  },
  {
    id: 'lb-3',
    name: 'Sarah Jenkins', // current user
    avatar: 'https://images.unsplash.com/photo-1594824813589-324317926c45?w=120&auto=format&fit=crop&q=80',
    targetSchool: 'Johns Hopkins (BSN)',
    points: 2480,
    testsPassed: 9,
    streakDays: 4,
    readinessScore: 85,
    isCurrentUser: true,
  },
  {
    id: 'lb-4',
    name: 'Aisha Al-Mansoor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    targetSchool: 'Emory University BSN',
    points: 2290,
    testsPassed: 8,
    streakDays: 9,
    readinessScore: 84,
  },
  {
    id: 'lb-5',
    name: 'Jordan Rivera',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    targetSchool: 'NYU Rory Meyers Nursing',
    points: 1980,
    testsPassed: 7,
    streakDays: 6,
    readinessScore: 81,
  },
  {
    id: 'lb-6',
    name: 'Brittany O\'Connor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    targetSchool: 'Penn Nursing',
    points: 1740,
    testsPassed: 6,
    streakDays: 5,
    readinessScore: 79,
  },
  {
    id: 'lb-7',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    targetSchool: 'UT Austin BSN',
    points: 1510,
    testsPassed: 5,
    streakDays: 3,
    readinessScore: 78,
  },
];

export function loadUserState(): UserState {
  if (typeof window === 'undefined') return INITIAL_USER_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_USER_STATE;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_USER_STATE, ...parsed };
  } catch {
    return INITIAL_USER_STATE;
  }
}

export function saveUserState(state: UserState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to local storage', err);
  }
}

/**
 * Check criteria and return any newly unlocked badges
 */
export function evaluateBadgeUnlocks(
  state: UserState,
  latestTest?: TestResult
): { updatedState: UserState; newlyUnlocked: string[] } {
  const currentBadges = new Set(state.stats.unlockedBadges);
  const newlyUnlocked: string[] = [];

  // Check First Step
  if (state.testHistory.length > 0 && !currentBadges.has('badge-first-step')) {
    newlyUnlocked.push('badge-first-step');
    currentBadges.add('badge-first-step');
  }

  // Check TEAS Passer
  const hasPassed = state.testHistory.some((t) => t.passed) || (latestTest && latestTest.passed);
  if (hasPassed && !currentBadges.has('badge-teas-passer')) {
    newlyUnlocked.push('badge-teas-passer');
    currentBadges.add('badge-teas-passer');
  }

  // Check Exemplary Scholar (Score >= 90%)
  const hasExemplary = state.testHistory.some((t) => t.score >= 90) || (latestTest && latestTest.score >= 90);
  if (hasExemplary && !currentBadges.has('badge-exemplary-scholar')) {
    newlyUnlocked.push('badge-exemplary-scholar');
    currentBadges.add('badge-exemplary-scholar');
  }

  // Check 3-day streak
  if (state.stats.streakDays >= 3 && !currentBadges.has('badge-streak-3')) {
    newlyUnlocked.push('badge-streak-3');
    currentBadges.add('badge-streak-3');
  }

  // Check 7-day streak
  if (state.stats.streakDays >= 7 && !currentBadges.has('badge-streak-7')) {
    newlyUnlocked.push('badge-streak-7');
    currentBadges.add('badge-streak-7');
  }

  // Check Century Club (100+ questions)
  if (state.stats.totalAnswered >= 100 && !currentBadges.has('badge-century-club')) {
    newlyUnlocked.push('badge-century-club');
    currentBadges.add('badge-century-club');
  }

  // Check Flashcard Virtuoso (10+ mastered)
  const masteredCount = Object.values(state.stats.flashcardStatus).filter((s) => s === 'mastered').length;
  if (masteredCount >= 10 && !currentBadges.has('badge-flashcard-virtuoso')) {
    newlyUnlocked.push('badge-flashcard-virtuoso');
    currentBadges.add('badge-flashcard-virtuoso');
  }

  // Check Security badge
  if (state.security.mfaEnabled && state.security.e2eEncrypted && !currentBadges.has('badge-iron-clad-security')) {
    newlyUnlocked.push('badge-iron-clad-security');
    currentBadges.add('badge-iron-clad-security');
  }

  // Check Ambassador badge
  if (state.referral.friendsReferred >= 1 && !currentBadges.has('badge-ambassador')) {
    newlyUnlocked.push('badge-ambassador');
    currentBadges.add('badge-ambassador');
  }

  if (newlyUnlocked.length > 0) {
    playHapticFeedback('success', {
      hapticsEnabled: state.preferences.hapticsEnabled,
      soundEnabled: state.preferences.soundEnabled,
    });
  }

  const updatedState: UserState = {
    ...state,
    stats: {
      ...state.stats,
      unlockedBadges: Array.from(currentBadges),
    },
  };

  saveUserState(updatedState);
  return { updatedState, newlyUnlocked };
}
