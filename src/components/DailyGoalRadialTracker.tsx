import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Target,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Flame,
  Settings2,
  Check,
  ChevronDown,
} from 'lucide-react';
import { playHapticFeedback } from '../utils/haptics';

interface DailyGoalRadialTrackerProps {
  todayStudyMinutes: number;
  dailyMinuteGoal: number;
  onUpdateGoal: (newGoal: number) => void;
  onLogMinutes: (minutesToAdd: number) => void;
  hapticsEnabled: boolean;
}

export const DailyGoalRadialTracker: React.FC<DailyGoalRadialTrackerProps> = ({
  todayStudyMinutes,
  dailyMinuteGoal,
  onUpdateGoal,
  onLogMinutes,
  hapticsEnabled,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState(dailyMinuteGoal);

  const goal = dailyMinuteGoal || 30;
  const current = todayStudyMinutes || 0;
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const isCompleted = current >= goal;
  const remainingMinutes = Math.max(0, goal - current);

  // SVG Radial Math
  const radius = 48;
  const circumference = 2 * Math.PI * radius; // ~301.59
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const presets = [15, 30, 45, 60];

  const handleSelectPreset = (newGoal: number) => {
    playHapticFeedback('light', { hapticsEnabled });
    setCustomGoalInput(newGoal);
    onUpdateGoal(newGoal);
    setIsEditingGoal(false);
  };

  const handleSaveCustomGoal = () => {
    playHapticFeedback('medium', { hapticsEnabled });
    const clamped = Math.max(5, Math.min(240, Number(customGoalInput) || 30));
    onUpdateGoal(clamped);
    setIsEditingGoal(false);
  };

  const handleQuickLog = (mins: number) => {
    playHapticFeedback('medium', { hapticsEnabled });
    onLogMinutes(mins);

    // If this log completes the goal, fire confetti!
    if (current + mins >= goal && !isCompleted) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#0d9488', '#10b981', '#f59e0b'],
        });
      } catch {
        // Fallback
      }
      playHapticFeedback('success', { hapticsEnabled });
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        {/* Left side: Radial Progress Ring & Minutes info */}
        <div className="flex items-center gap-5">
          {/* Radial SVG Ring */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="radialProgressGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Background Track Circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />

              {/* Progress Circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={isCompleted ? '#10b981' : 'url(#radialProgressGradient)'}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Ring Metric Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-0.5 animate-in zoom-in duration-300" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Done
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-baseline">
                    <span className="text-xl font-black font-mono text-slate-900 dark:text-slate-100">
                      {current}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">/{goal}m</span>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-teal-600 dark:text-teal-400">
                    {pct}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Goal Description & Motivational Text */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Daily Study Goal</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">· {goal} min target</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {isCompleted
                ? 'Daily Target Accomplished! 🎉'
                : `${remainingMinutes} minutes left to reach today's goal`}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              {isCompleted
                ? 'Great consistency! Hitting your daily target keeps your study momentum alive and solidifies nursing concepts.'
                : 'Consistent daily micro-sessions yield 3x higher retention than weekend cramming on the ATI TEAS 7.'}
            </p>
          </div>
        </div>

        {/* Right side: Quick Log Actions & Goal Settings Trigger */}
        <div className="flex flex-col sm:items-end gap-2.5 w-full sm:w-auto">
          {/* Quick study logging buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Log Time:</span>
            <button
              onClick={() => handleQuickLog(5)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 dark:hover:text-teal-400 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              title="Add 5 minutes of study"
            >
              +5 min
            </button>
            <button
              onClick={() => handleQuickLog(15)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 dark:hover:text-teal-400 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              title="Add 15 minutes of study"
            >
              +15 min
            </button>
            <button
              onClick={() => {
                playHapticFeedback('light', { hapticsEnabled });
                setIsEditingGoal(!isEditingGoal);
              }}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Adjust Daily Goal"
              aria-label="Adjust Goal"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets Bar or Inline Editor */}
          {isEditingGoal && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in duration-150 w-full sm:w-64 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                <span>Select Daily Target</span>
                <span>{customGoalInput} min</span>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSelectPreset(p)}
                    className={`py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
                      goal === p
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-teal-500'
                    }`}
                  >
                    {p}m
                  </button>
                ))}
              </div>

              {/* Slider for custom minutes */}
              <div className="pt-1">
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setIsEditingGoal(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustomGoal}
                  className="py-1 px-3 rounded-lg bg-teal-600 text-white font-semibold text-[11px] hover:bg-teal-700 transition-colors"
                >
                  Save Target
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
