import React, { useState } from 'react';
import { X, Copy, Check, Users, Gift, Sparkles, Award, ArrowRight, Share2 } from 'lucide-react';
import { UserState } from '../types/teas';
import { playHapticFeedback } from '../utils/haptics';

interface ReferralModalProps {
  userState: UserState;
  onSimulateReferral: () => void;
  onClose: () => void;
  hapticsEnabled: boolean;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  userState,
  onSimulateReferral,
  onClose,
  hapticsEnabled,
}) => {
  const [copied, setCopied] = useState(false);
  const [justSimulated, setJustSimulated] = useState(false);

  const referralCode = userState.referral.code;
  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://pulseteas.app'}?ref=${referralCode}`;
  const count = userState.referral.friendsReferred;

  const handleCopyLink = () => {
    playHapticFeedback('light', { hapticsEnabled });
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleSimulate = () => {
    playHapticFeedback('success', { hapticsEnabled });
    onSimulateReferral();
    setJustSimulated(true);
    setTimeout(() => setJustSimulated(false), 2500);
  };

  const milestones = [
    {
      target: 1,
      reward: '1 Month Free Premium Access ($29.99 Value)',
      badge: 'Peer Ambassador Badge',
      achieved: count >= 1,
    },
    {
      target: 3,
      reward: 'Exclusive ATI TEAS 7 Full Mock Exam Vault',
      badge: 'Community Builder Perk',
      achieved: count >= 3,
    },
    {
      target: 5,
      reward: 'VIP Nursing Admissions Essay Review Guide',
      badge: 'Gold Mentor Status',
      achieved: count >= 5,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Banner */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-br from-teal-800 via-teal-900 to-slate-950 text-white overflow-hidden">
          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled });
              onClose();
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white/10 text-teal-200 border border-white/15 mb-3">
            <Gift className="w-3.5 h-3.5" />
            <span>Give $10, Get 1 Month Free</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">
            Invite Nursing Study Partners
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1.5 max-w-sm">
            Give your friends a 3-day extended trial + 15% discount. For every friend who joins, you earn 1 month of free premium!
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Referral Code Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Your Unique Referral Link</span>
              <span className="text-teal-600 dark:text-teal-400 font-mono">Code: {referralCode}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 bg-transparent border-none text-xs text-slate-700 dark:text-slate-200 font-mono px-2 focus:outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Gamified Referral Tracker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Your Referral Milestones
              </span>
              <span className="text-teal-600 dark:text-teal-400 font-bold font-mono">
                {count} / 5 Friends Invited
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (count / 5) * 100)}%` }}
              />
            </div>

            {/* Milestones list */}
            <div className="space-y-2.5 pt-2">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                    m.achieved
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      m.achieved
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {m.achieved ? <Check className="w-4 h-4" /> : m.target}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {m.target} {m.target === 1 ? 'Friend' : 'Friends'}
                      </h4>
                      {m.achieved && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {m.reward}
                    </p>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                      ★ {m.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulate Friend Referral Action (Great for testing/demoing) */}
          <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-teal-950 dark:text-teal-200">
                Test / Demo Referral System
              </p>
              <p className="text-[11px] text-teal-800 dark:text-teal-300">
                Simulate a friend using your referral code
              </p>
            </div>
            <button
              onClick={handleSimulate}
              className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold transition-all shrink-0 shadow-sm"
            >
              {justSimulated ? 'Joined!' : '+ Simulate Friend'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
