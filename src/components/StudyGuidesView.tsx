import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Lock,
  Sparkles,
  Clock,
  FileText,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Printer,
  Share2,
} from 'lucide-react';
import { StudyGuide, UserSubscription } from '../types/teas';
import { STUDY_GUIDES } from '../data/studyGuides';
import { playHapticFeedback } from '../utils/haptics';

interface StudyGuidesViewProps {
  subscription: UserSubscription;
  onOpenSubscription: () => void;
  onAwardBadge?: (badgeId: string) => void;
  hapticsEnabled: boolean;
}

export const StudyGuidesView: React.FC<StudyGuidesViewProps> = ({
  subscription,
  onOpenSubscription,
  onAwardBadge,
  hapticsEnabled,
}) => {
  const [selectedGuide, setSelectedGuide] = useState<StudyGuide | null>(null);
  const [exporting, setExporting] = useState(false);

  const hasAccess =
    subscription.isPremium ||
    (subscription.tier === 'free_trial' && Date.now() < subscription.trialExpiresAt);

  const handleSelectGuide = (guide: StudyGuide) => {
    playHapticFeedback('light', { hapticsEnabled });
    setSelectedGuide(guide);
  };

  const handleExportPDF = (guide: StudyGuide) => {
    playHapticFeedback('medium', { hapticsEnabled });
    setExporting(true);

    if (onAwardBadge) {
      onAwardBadge('badge-offline-scholar');
    }

    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* If reading a specific guide */}
      {selectedGuide ? (
        <div className="space-y-6">
          {/* Back Bar & Print Button */}
          <div className="flex items-center justify-between no-print">
            <button
              onClick={() => {
                playHapticFeedback('light', { hapticsEnabled });
                setSelectedGuide(null);
              }}
              className="inline-flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Study Guides</span>
            </button>

            <button
              onClick={() => handleExportPDF(selectedGuide)}
              disabled={exporting}
              className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-teal-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>{exporting ? 'Preparing...' : 'Export to PDF / Print'}</span>
            </button>
          </div>

          {/* Guide Content Document */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
            {/* Document Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2">
                <span>ATI TEAS 7 High-Yield Review</span>
                <span>·</span>
                <span>{selectedGuide.readTime}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {selectedGuide.title}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {selectedGuide.summary}
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {selectedGuide.sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {section.title}
                  </h2>

                  <div className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {section.content.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>

                  {/* High-yield data table if present */}
                  {section.table && (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 my-4">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            {section.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="p-3">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {section.table.rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                            >
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`p-3 text-slate-700 dark:text-slate-300 ${
                                    cIdx === 0 ? 'font-semibold text-slate-900 dark:text-slate-100' : ''
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Key Takeaways */}
                  {section.keyTakeaways && (
                    <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 space-y-2">
                      <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider">
                        High-Yield Clinical Takeaways
                      </h4>
                      <ul className="space-y-1.5 text-xs text-teal-950 dark:text-teal-300">
                        {section.keyTakeaways.map((point, ptIdx) => (
                          <li key={ptIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Print Footer */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 text-center text-xs text-slate-400">
              <p>PulseTEAS · ATI TEAS 7 Prep Platform · Confidential Study Materials for Personal Use</p>
            </div>
          </div>
        </div>
      ) : (
        /* Guides Catalog View */
        <div className="space-y-6">
          {/* Header */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 text-white shadow-xl relative overflow-hidden border border-slate-800">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span>Exclusive Study Guides & Cheat Sheets</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              High-Yield TEAS 7 Guides
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
              Distilled, high-yield summaries created by top-scoring nursing students. Read online or export as clean PDF files for offline study.
            </p>
          </div>

          {/* Catalog Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STUDY_GUIDES.map((guide) => (
              <div
                key={guide.id}
                onClick={() => {
                  if (hasAccess) {
                    handleSelectGuide(guide);
                  } else {
                    playHapticFeedback('warning', { hapticsEnabled });
                    onOpenSubscription();
                  }
                }}
                className={`group cursor-pointer p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  hasAccess
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md'
                    : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      {guide.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{guide.readTime}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {guide.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                    {guide.summary}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                  {hasAccess ? (
                    <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                      <span>Read & Export PDF</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock with Premium Trial</span>
                    </div>
                  )}

                  <span className="text-[11px] text-slate-400">
                    {guide.sections.length} Key Sections
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
