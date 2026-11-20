import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Share2, Sparkles, Award, Shield, CheckCircle2 } from 'lucide-react';
import { Badge } from '../types/teas';
import { playHapticFeedback } from '../utils/haptics';

interface BadgeModalProps {
  badge: Badge;
  onClose: () => void;
  onShare: (badge: Badge) => void;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  badge,
  onClose,
  onShare,
  hapticsEnabled,
  soundEnabled,
}) => {
  useEffect(() => {
    // Fire celebratory confetti explosion
    playHapticFeedback('success', { hapticsEnabled, soundEnabled });
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#059669', '#3b82f6', '#f59e0b', '#8b5cf6'],
      });
    } catch {
      // Confetti fallback
    }
  }, [hapticsEnabled, soundEnabled]);

  const getRarityBadge = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      case 'Epic':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-700';
      case 'Rare':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-center p-6 relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={() => {
            playHapticFeedback('light', { hapticsEnabled });
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Achievement Unlocked</span>
        </div>

        {/* Badge Avatar Graphic */}
        <div className="relative mx-auto my-3 w-28 h-28 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-3xl opacity-20 blur-xl animate-pulse"
            style={{ backgroundColor: badge.badgeColor }}
          />
          <div
            className="relative w-24 h-24 rounded-3xl p-1 shadow-xl flex items-center justify-center text-white"
            style={{
              background: `linear-gradient(135deg, ${badge.badgeColor}, #0f172a)`,
              boxShadow: `0 10px 25px -5px ${badge.badgeColor}40`,
            }}
          >
            <Award className="w-12 h-12" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
          {badge.title}
        </h3>

        <div className="flex items-center justify-center gap-2 my-2.5">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getRarityBadge(badge.rarity)}`}>
            {badge.rarity}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            +{badge.xp} XP
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 px-2 mt-1 mb-5">
          {badge.description}
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 mb-6 text-left border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-200">Unlocked Criteria: </span>
            <span>{badge.criteria}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled });
              onShare(badge);
            }}
            className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Achievement</span>
          </button>

          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled });
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            Continue Studying
          </button>
        </div>
      </div>
    </div>
  );
};
