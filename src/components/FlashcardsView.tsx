import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  HelpCircle,
  Volume2,
} from 'lucide-react';
import { Flashcard, Subject, UserState } from '../types/teas';
import { TEAS_FLASHCARDS } from '../data/teasFlashcards';
import { playHapticFeedback } from '../utils/haptics';

interface FlashcardsViewProps {
  userState: UserState;
  onUpdateFlashcardStatus: (cardId: string, status: 'new' | 'learning' | 'mastered') => void;
  hapticsEnabled: boolean;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  userState,
  onUpdateFlashcardStatus,
  hapticsEnabled,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsList, setCardsList] = useState<Flashcard[]>(TEAS_FLASHCARDS);

  // Filter cards based on subject
  useEffect(() => {
    let filtered = TEAS_FLASHCARDS;
    if (selectedSubject !== 'all') {
      filtered = TEAS_FLASHCARDS.filter((c) => c.subject === selectedSubject);
    }
    setCardsList(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedSubject]);

  const currentCard = cardsList[currentIndex] || cardsList[0];
  const cardStatus = currentCard ? userState.stats.flashcardStatus[currentCard.id] || 'new' : 'new';

  const masteredCount = Object.values(userState.stats.flashcardStatus).filter(
    (s) => s === 'mastered'
  ).length;

  const handleFlip = () => {
    playHapticFeedback('light', { hapticsEnabled });
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    playHapticFeedback('light', { hapticsEnabled });
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cardsList.length);
  };

  const handlePrevious = () => {
    playHapticFeedback('light', { hapticsEnabled });
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cardsList.length) % cardsList.length);
  };

  const handleMarkStatus = (status: 'learning' | 'mastered') => {
    if (!currentCard) return;
    playHapticFeedback(status === 'mastered' ? 'success' : 'medium', { hapticsEnabled });
    onUpdateFlashcardStatus(currentCard.id, status);
    // Auto advance to next card after short delay
    setTimeout(() => {
      handleNext();
    }, 280);
  };

  const handleShuffle = () => {
    playHapticFeedback('medium', { hapticsEnabled });
    const shuffled = [...cardsList].sort(() => Math.random() - 0.5);
    setCardsList(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === '1') {
        handleMarkStatus('learning');
      } else if (e.key === '2') {
        handleMarkStatus('mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Subject Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSubject === 'all'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Subjects
          </button>
          <button
            onClick={() => setSelectedSubject('science')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSubject === 'science'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Science & A&P
          </button>
          <button
            onClick={() => setSelectedSubject('math')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSubject === 'math'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Mathematics
          </button>
          <button
            onClick={() => setSelectedSubject('reading')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSubject === 'reading'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Reading
          </button>
          <button
            onClick={() => setSelectedSubject('english')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSubject === 'english'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            English
          </button>
        </div>

        {/* Mastered Metric & Shuffle */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">
            {masteredCount} Mastered
          </span>
          <button
            onClick={handleShuffle}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Shuffle deck"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Counter & Topic Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-mono">
          Card {currentIndex + 1} of {cardsList.length}
        </span>
        <span className="font-semibold text-teal-600 dark:text-teal-400">
          {currentCard?.topic}
        </span>
      </div>

      {/* Interactive 3D Flip Card */}
      <div
        onClick={handleFlip}
        className="cursor-pointer min-h-[340px] sm:min-h-[380px] rounded-3xl p-6 sm:p-10 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg hover:border-teal-500/80 transition-all flex flex-col justify-between relative select-none"
      >
        {/* Top Card Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              {currentCard?.subject.toUpperCase()} · {currentCard?.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                cardStatus === 'mastered'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : cardStatus === 'learning'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {cardStatus}
            </span>
          </div>
        </div>

        {/* Card Body (Front vs Back) */}
        <div className="my-auto py-6 text-center">
          {!isFlipped ? (
            <div className="space-y-4">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Question / Prompt
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug whitespace-pre-line max-w-xl mx-auto">
                {currentCard?.front}
              </h3>
              <p className="text-xs text-teal-600 dark:text-teal-400 pt-3">
                Tap card or press Space to reveal answer
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-left sm:text-center animate-in fade-in duration-200">
              <span className="text-xs uppercase font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
                Answer & Clinical Explanation
              </span>
              <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed max-w-xl mx-auto">
                {currentCard?.back}
              </p>
              {currentCard?.clinicalPearl && (
                <div className="mt-4 p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 text-xs text-left border border-teal-200/60 dark:border-teal-800/40">
                  <span className="font-bold">Clinical Pearl / Mnemonic: </span>
                  <span>{currentCard.clinicalPearl}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
          <span className="flex items-center gap-1">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Click to flip</span>
          </span>
          <span className="hidden sm:inline font-mono text-[11px]">
            Shortcuts: [Space] Flip · [1] Learning · [2] Mastered
          </span>
        </div>
      </div>

      {/* Bottom Rating & Navigation Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrevious}
          className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={() => handleMarkStatus('learning')}
            className="flex-1 py-3 px-4 rounded-2xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100/60 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Still Learning [1]</span>
          </button>

          <button
            onClick={() => handleMarkStatus('mastered')}
            className="flex-1 py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mastered [2]</span>
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          aria-label="Next card"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
