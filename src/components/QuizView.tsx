import React, { useState, useEffect } from 'react';
import {
  Timer,
  Flag,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Award,
  Share2,
  Sparkles,
  Lightbulb,
  Check,
  X,
  Strikethrough,
  AlertCircle,
} from 'lucide-react';
import { Question, Subject, TestResult } from '../types/teas';
import { TEAS_QUESTIONS, SUBJECT_METAS } from '../data/teasQuestions';
import { playHapticFeedback } from '../utils/haptics';

interface QuizViewProps {
  initialSubject?: Subject | 'all';
  mode: 'practice' | 'mock_exam';
  onFinishTest: (result: TestResult) => void;
  onExit: () => void;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
}

export const QuizView: React.FC<QuizViewProps> = ({
  initialSubject = 'all',
  mode,
  onFinishTest,
  onExit,
  hapticsEnabled,
  soundEnabled,
}) => {
  // Filter questions for test
  const [questions, setQuestions] = useState<Question[]>(() => {
    let pool = TEAS_QUESTIONS;
    if (initialSubject !== 'all') {
      pool = TEAS_QUESTIONS.filter((q) => q.subject === initialSubject);
    }
    // Shuffle and pick 10 questions for drill, or all questions for mock exam
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return mode === 'mock_exam' ? shuffled : shuffled.slice(0, 10);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<number, Set<number>>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showInstantRationale, setShowInstantRationale] = useState(mode === 'practice');
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(
    mode === 'mock_exam' ? 60 * 60 : 20 * 60 // 60 min for mock, 20 for practice
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Timer countdown
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const currentQ = questions[currentIndex];
  const userSelectedOption = selectedAnswers[currentIndex];
  const currentEliminations = eliminatedOptions[currentIndex] || new Set();
  const isFlagged = flaggedQuestions.has(currentIndex);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (optIndex: number) => {
    if (currentEliminations.has(optIndex)) return; // Can't select eliminated option unless toggled off
    playHapticFeedback('light', { hapticsEnabled, soundEnabled });
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIndex,
    }));
  };

  const handleToggleEliminate = (e: React.MouseEvent, optIndex: number) => {
    e.stopPropagation();
    playHapticFeedback('light', { hapticsEnabled, soundEnabled });
    const current = new Set(eliminatedOptions[currentIndex] || []);
    if (current.has(optIndex)) {
      current.delete(optIndex);
    } else {
      current.add(optIndex);
      // If user had this selected, unselect it
      if (userSelectedOption === optIndex) {
        const copy = { ...selectedAnswers };
        delete copy[currentIndex];
        setSelectedAnswers(copy);
      }
    }
    setEliminatedOptions((prev) => ({
      ...prev,
      [currentIndex]: current,
    }));
  };

  const handleToggleFlag = () => {
    playHapticFeedback('light', { hapticsEnabled, soundEnabled });
    const nextFlags = new Set(flaggedQuestions);
    if (nextFlags.has(currentIndex)) {
      nextFlags.delete(currentIndex);
    } else {
      nextFlags.add(currentIndex);
    }
    setFlaggedQuestions(nextFlags);
  };

  const handleNext = () => {
    playHapticFeedback('light', { hapticsEnabled, soundEnabled });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    playHapticFeedback('light', { hapticsEnabled, soundEnabled });
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinishTest = () => {
    playHapticFeedback('medium', { hapticsEnabled, soundEnabled });

    // Calculate score
    let correctCount = 0;
    const answers = questions.map((q, idx) => {
      const selected = selectedAnswers[idx] ?? -1;
      const isCorrect = selected === q.correctOptionIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        selectedOption: selected,
        isCorrect,
      };
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    const passed = scorePct >= 75; // TEAS 7 passing threshold benchmark

    const result: TestResult = {
      id: `test-${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: Date.now(),
      subject: initialSubject,
      score: scorePct,
      totalQuestions: questions.length,
      correctCount,
      timeSpentSeconds: (mode === 'mock_exam' ? 3600 : 1200) - timeRemainingSeconds,
      passed,
      mode,
      answers,
    };

    setTestResult(result);
    setIsCompleted(true);
    onFinishTest(result);
  };

  // If completed, render the full diagnostic score report and rationale breakdown
  if (isCompleted && testResult) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Scorecard Hero */}
        <div
          className={`p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border ${
            testResult.passed
              ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-emerald-800'
              : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-900 border-rose-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white/10 mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>
                  {testResult.mode === 'mock_exam' ? 'Simulated Mock Exam' : 'Practice Drill'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {testResult.passed ? '🎉 Congratulations, You Passed!' : 'Study Review Needed'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
                {testResult.passed
                  ? `Your score of ${testResult.score}% meets the competitive ATI TEAS 7 admission cutoff (≥75%). Keep up this strong momentum!`
                  : `Your score of ${testResult.score}% is below the 75% cutoff. Review the rationales below and retake to master weak areas.`}
              </p>
            </div>

            {/* Score Ring / Pill */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[130px] text-center">
              <span className="text-4xl font-black font-mono tracking-tight">
                {testResult.score}%
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 mt-1">
                {testResult.passed ? 'Exemplary / Proficient' : 'Developing'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
                {testResult.correctCount} / {testResult.totalQuestions} Correct
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled, soundEnabled });
              onExit();
            }}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled, soundEnabled });
              // Reset and restart
              setSelectedAnswers({});
              setEliminatedOptions({});
              setFlaggedQuestions(new Set());
              setCurrentIndex(0);
              setIsCompleted(false);
              setTimeRemainingSeconds(mode === 'mock_exam' ? 3600 : 1200);
            }}
            className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Test</span>
          </button>
        </div>

        {/* Question-by-Question Review with Rationales */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Comprehensive Answer Explanations & Rationales
          </h3>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const selected = selectedAnswers[idx] ?? -1;
              const isCorrect = selected === q.correctOptionIndex;

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    isCorrect
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      Question {idx + 1} · {q.topic}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>{isCorrect ? 'Correct' : 'Missed'}</span>
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                    {q.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-2 mt-4">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctOptionIndex;
                      const wasSelectedByUser = optIdx === selected;

                      let style =
                        'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                      if (isOptionCorrect) {
                        style =
                          'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-semibold';
                      } else if (wasSelectedByUser && !isOptionCorrect) {
                        style =
                          'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${style}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px]">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isOptionCorrect && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Correct Answer
                            </span>
                          )}
                          {wasSelectedByUser && !isOptionCorrect && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Rationale Box */}
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Clinical / Academic Rationale</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {q.explanation}
                    </p>

                    {q.clinicalTip && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-teal-700 dark:text-teal-300 font-medium">
                        <strong>Clinical Tip: </strong>
                        <span>{q.clinicalTip}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Test Header Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled, soundEnabled });
              onExit();
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Quit
          </button>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Timer & Flag */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleFlag}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isFlagged
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500' : ''}`} />
            <span className="hidden sm:inline">{isFlagged ? 'Flagged' : 'Flag'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
            <Timer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>

          <button
            onClick={handleFinishTest}
            className="py-1.5 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
          >
            Finish Test
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            {currentQ.subject.toUpperCase()} · {currentQ.topic}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-2 leading-relaxed">
            {currentQ.question}
          </h2>

          {currentQ.passage && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic border border-slate-200 dark:border-slate-700/60">
              "{currentQ.passage}"
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, optIndex) => {
            const isEliminated = currentEliminations.has(optIndex);
            const isSelected = userSelectedOption === optIndex;

            return (
              <div
                key={optIndex}
                onClick={() => handleSelectOption(optIndex)}
                className={`group cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isEliminated
                    ? 'opacity-40 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 line-through text-slate-400'
                    : isSelected
                    ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 text-teal-950 dark:text-teal-100 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 text-slate-500'
                    }`}
                  >
                    {String.fromCharCode(65 + optIndex)}
                  </div>
                  <span className="text-sm font-medium leading-normal">{opt}</span>
                </div>

                {/* Strike-Through Elimination Button (Nursing Exam Tactic) */}
                <button
                  type="button"
                  onClick={(e) => handleToggleEliminate(e, optIndex)}
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 ${
                    isEliminated ? 'text-amber-500' : ''
                  }`}
                  title={isEliminated ? 'Restore option' : 'Eliminate option'}
                >
                  <Strikethrough className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Instant Study Rationale (If enabled in Practice Mode) */}
        {showInstantRationale && userSelectedOption !== undefined && (
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 text-xs space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Clinical Rationale</span>
              </span>
              <span
                className={`font-bold uppercase tracking-wider ${
                  userSelectedOption === currentQ.correctOptionIndex
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {userSelectedOption === currentQ.correctOptionIndex ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="py-3 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors disabled:opacity-40"
        >
          Previous
        </button>

        {/* Quick jump dot indicators */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-xs px-2">
          {questions.map((_, idx) => {
            const answered = selectedAnswers[idx] !== undefined;
            const flagged = flaggedQuestions.has(idx);
            const isCur = idx === currentIndex;

            return (
              <button
                key={idx}
                onClick={() => {
                  playHapticFeedback('light', { hapticsEnabled, soundEnabled });
                  setCurrentIndex(idx);
                }}
                className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center transition-all ${
                  isCur
                    ? 'ring-2 ring-teal-500 bg-teal-600 text-white'
                    : flagged
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 border border-amber-300'
                    : answered
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="py-3 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-teal-600/20"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinishTest}
            className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-600/20"
          >
            Submit Exam
          </button>
        )}
      </div>
    </div>
  );
};
