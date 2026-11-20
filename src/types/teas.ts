export type Subject = 'science' | 'math' | 'reading' | 'english';

export type SubjectMeta = {
  id: Subject;
  title: string;
  shortTitle: string;
  totalQuestionsTEAS: number;
  timeMinutesTEAS: number;
  color: string;
  accent: string;
  iconName: string;
  subtopics: string[];
};

export interface Question {
  id: string;
  subject: Subject;
  topic: string;
  question: string;
  passage?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  clinicalTip?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Flashcard {
  id: string;
  subject: Subject;
  topic: string;
  front: string;
  back: string;
  clinicalPearl: string;
  category: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  xp: number;
  badgeColor: string;
}

export interface TestResult {
  id: string;
  date: string;
  timestamp: number;
  subject: Subject | 'all';
  score: number; // percentage 0-100
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  passed: boolean; // >= 75%
  mode: 'practice' | 'mock_exam';
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
  }[];
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  targetSchool: string;
  points: number;
  testsPassed: number;
  streakDays: number;
  readinessScore: number;
  isCurrentUser?: boolean;
}

export interface UserSubscription {
  isPremium: boolean;
  tier: 'free_trial' | 'monthly' | 'yearly';
  trialStartedAt: number;
  trialExpiresAt: number;
  autoRenew: boolean;
  renewsAt?: number;
}

export interface StudyGuide {
  id: string;
  title: string;
  subject: Subject;
  readTime: string;
  pagesCount: number;
  summary: string;
  sections: {
    title: string;
    content: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
    keyTakeaways?: string[];
  }[];
}

export interface UserState {
  profile: {
    name: string;
    email: string;
    avatar: string;
    targetSchool: string;
    examDate: string;
    targetScore: number;
  };
  subscription: UserSubscription;
  security: {
    mfaEnabled: boolean;
    mfaMethod: 'sms' | 'authenticator';
    biometricEnabled: boolean;
    e2eEncrypted: boolean;
    lastCloudBackup: string;
    encryptionKeyFingerprint: string;
  };
  preferences: {
    darkMode: boolean;
    hapticsEnabled: boolean;
    soundEnabled: boolean;
    pushReminders: boolean;
    reminderTime: string;
  };
  referral: {
    code: string;
    friendsReferred: number;
    creditsEarnedMonths: number;
  };
  stats: {
    streakDays: number;
    lastActiveDate: string;
    totalAnswered: number;
    totalCorrect: number;
    studyMinutes: number;
    todayStudyMinutes?: number;
    dailyMinuteGoal?: number;
    unlockedBadges: string[]; // badge ids
    bookmarks: string[]; // question ids
    flashcardStatus: Record<string, 'new' | 'learning' | 'mastered'>;
  };
  testHistory: TestResult[];
}
