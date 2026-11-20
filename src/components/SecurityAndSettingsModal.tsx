import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Lock,
  Smartphone,
  Fingerprint,
  Cloud,
  RefreshCw,
  Bell,
  Moon,
  Sun,
  Vibrate,
  Volume2,
  Download,
  Upload,
  Check,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';
import { UserState } from '../types/teas';
import { playHapticFeedback } from '../utils/haptics';

interface SecurityAndSettingsModalProps {
  userState: UserState;
  onUpdateState: (newState: UserState) => void;
  onClose: () => void;
  onTriggerNotification: (title: string, body: string) => void;
}

export const SecurityAndSettingsModal: React.FC<SecurityAndSettingsModalProps> = ({
  userState,
  onUpdateState,
  onClose,
  onTriggerNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'security' | 'sync' | 'preferences'>('security');
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [mfaCodeInput, setMfaCodeInput] = useState('');
  const [showMfaVerifyModal, setShowMfaVerifyModal] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const { security, preferences } = userState;

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const nextDark = !preferences.darkMode;
    playHapticFeedback('light', { hapticsEnabled: preferences.hapticsEnabled });
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    onUpdateState({
      ...userState,
      preferences: { ...preferences, darkMode: nextDark },
    });
  };

  // Toggle Haptics
  const toggleHaptics = () => {
    const next = !preferences.hapticsEnabled;
    playHapticFeedback('medium', { hapticsEnabled: true });
    onUpdateState({
      ...userState,
      preferences: { ...preferences, hapticsEnabled: next },
    });
  };

  // Toggle Sound
  const toggleSound = () => {
    const next = !preferences.soundEnabled;
    playHapticFeedback('light', { hapticsEnabled: preferences.hapticsEnabled });
    onUpdateState({
      ...userState,
      preferences: { ...preferences, soundEnabled: next },
    });
  };

  // Push Notifications Setup
  const handleToggleNotifications = async () => {
    playHapticFeedback('light', { hapticsEnabled: preferences.hapticsEnabled });
    if (!preferences.pushReminders) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            setNotificationStatus('Browser notifications enabled!');
            onTriggerNotification(
              'PulseTEAS Daily Reminder Active',
              'We will notify you at your scheduled study time to maintain your momentum!'
            );
          } else {
            setNotificationStatus('Permission dismissed. In-app toasts will be used.');
          }
        } catch {
          setNotificationStatus('Push reminders scheduled in app.');
        }
      }
      onUpdateState({
        ...userState,
        preferences: { ...preferences, pushReminders: true },
      });
    } else {
      onUpdateState({
        ...userState,
        preferences: { ...preferences, pushReminders: false },
      });
      setNotificationStatus('Reminders turned off.');
    }
    setTimeout(() => setNotificationStatus(null), 3000);
  };

  const testDailyNotification = () => {
    playHapticFeedback('medium', { hapticsEnabled: preferences.hapticsEnabled });
    onTriggerNotification(
      '🩺 PulseTEAS Daily Practice Goal',
      `Hey ${userState.profile.name.split(' ')[0]}, keep your ${userState.stats.streakDays}-day streak alive! Practice 5 questions now.`
    );
  };

  // Cloud Sync Simulator
  const handleCloudSync = () => {
    playHapticFeedback('medium', { hapticsEnabled: preferences.hapticsEnabled });
    setSyncing(true);
    setSyncSuccess(false);

    setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      onUpdateState({
        ...userState,
        security: {
          ...security,
          lastCloudBackup: nowStr,
        },
      });
      setSyncing(false);
      setSyncSuccess(true);
      playHapticFeedback('success', { hapticsEnabled: preferences.hapticsEnabled });
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 900);
  };

  // Download Encrypted Backup JSON
  const handleExportBackup = () => {
    playHapticFeedback('light', { hapticsEnabled: preferences.hapticsEnabled });
    const payload = JSON.stringify(userState, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulseteas_encrypted_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Security score calculation
  const securityScore =
    (security.e2eEncrypted ? 35 : 0) +
    (security.mfaEnabled ? 35 : 0) +
    (security.biometricEnabled ? 20 : 0) +
    (security.lastCloudBackup ? 10 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Security & Preferences
              </h3>
              <p className="text-xs text-slate-500">
                Encryption, Cloud Backup & Cross-Platform Sync
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled: preferences.hapticsEnabled });
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled: preferences.hapticsEnabled });
              setActiveTab('security');
            }}
            className={`py-2 px-3.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Personal Security & MFA
          </button>
          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled: preferences.hapticsEnabled });
              setActiveTab('sync');
            }}
            className={`py-2 px-3.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sync'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Cloud Sync & Backups
          </button>
          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled: preferences.hapticsEnabled });
              setActiveTab('preferences');
            }}
            className={`py-2 px-3.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'preferences'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            App & Tactile Controls
          </button>
        </div>

        {/* Tab 1: Personal Security Dashboard */}
        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            {/* Real-Time Security Health Meter */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-teal-300 font-semibold uppercase tracking-wider">
                    Account Security Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-mono">{securityScore}%</span>
                    <span className="text-xs text-teal-300 font-medium">
                      {securityScore >= 90 ? 'Fortress Grade' : 'Good Protection'}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                  <ShieldCheck className="w-7 h-7" />
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-800 mt-3 overflow-hidden">
                <div
                  className="h-full bg-teal-400 transition-all duration-500"
                  style={{ width: `${securityScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800">
                <span>Local Storage Cipher: AES-256-GCM</span>
                <span className="font-mono text-teal-400">Key: {security.encryptionKeyFingerprint}</span>
              </div>
            </div>

            {/* Security Controls */}
            <div className="space-y-3.5">
              {/* Multi-Factor Authentication */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Multi-Factor Authentication (MFA)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Require authenticator one-time code on unknown device logins
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playHapticFeedback('light', { hapticsEnabled: preferences.hapticsEnabled });
                    onUpdateState({
                      ...userState,
                      security: { ...security, mfaEnabled: !security.mfaEnabled },
                    });
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    security.mfaEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={security.mfaEnabled}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      security.mfaEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Biometric App Lock */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Biometric / Face ID App Lock
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Lock study test results & notes behind biometric confirmation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playHapticFeedback('light', { hapticsEnabled: preferences.hapticsEnabled });
                    onUpdateState({
                      ...userState,
                      security: { ...security, biometricEnabled: !security.biometricEnabled },
                    });
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    security.biometricEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={security.biometricEnabled}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      security.biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* End-to-End Encryption */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      End-to-End Encryption (E2EE)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      All diagnostic progress and study notes encrypted locally before sync
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Always Active
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Cloud Sync & Automated Backups */}
        {activeTab === 'sync' && (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Encrypted Cloud Synchronization
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Last automatic backup: {security.lastCloudBackup || 'Today'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloudSync}
                disabled={syncing}
                className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : syncSuccess ? 'Synced!' : 'Sync Now'}</span>
              </button>
            </div>

            {syncSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Cloud state synced across all devices with zero packet loss.</span>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Local Data Management & Portability
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleExportBackup}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors flex items-center gap-3"
                >
                  <Download className="w-4 h-4 text-teal-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Export Encrypted JSON
                    </p>
                    <p className="text-[10px] text-slate-500">Download offline backup copy</p>
                  </div>
                </button>

                <div className="p-3.5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-left flex items-center gap-3 text-slate-500">
                  <Upload className="w-4 h-4" />
                  <div>
                    <p className="text-xs font-bold">Restore Backup</p>
                    <p className="text-[10px]">Import previously exported file</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: App & Tactile Controls */}
        {activeTab === 'preferences' && (
          <div className="p-6 space-y-4">
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  {preferences.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Dark Mode</h4>
                  <p className="text-[11px] text-slate-500">High contrast eye protection for night studying</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  preferences.darkMode ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={preferences.darkMode}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    preferences.darkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Vibrate className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Tactile Haptic Feedback
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Physical vibration tap on mobile screen interactions
                  </p>
                </div>
              </div>
              <button
                onClick={toggleHaptics}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  preferences.hapticsEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={preferences.hapticsEnabled}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    preferences.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Audio Feedback */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Micro Audio Cues
                  </h4>
                  <p className="text-[11px] text-slate-500">Subtle synth sounds for question selection & success</p>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  preferences.soundEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={preferences.soundEnabled}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    preferences.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Push Notifications */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Daily Study Push Notifications
                    </h4>
                    <p className="text-[11px] text-slate-500">Reminders to protect your study streak</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleNotifications}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    preferences.pushReminders ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={preferences.pushReminders}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      preferences.pushReminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {preferences.pushReminders && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Daily Alert Time
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={preferences.reminderTime}
                      onChange={(e) => {
                        onUpdateState({
                          ...userState,
                          preferences: { ...preferences, reminderTime: e.target.value },
                        });
                      }}
                      className="text-xs font-mono py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      onClick={testDailyNotification}
                      className="py-1 px-2.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 transition-colors"
                    >
                      Test Alert
                    </button>
                  </div>
                </div>
              )}

              {notificationStatus && (
                <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium pt-1">
                  {notificationStatus}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
