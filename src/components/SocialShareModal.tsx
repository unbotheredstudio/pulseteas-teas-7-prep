import React, { useState } from 'react';
import { X, Check, Copy, Share2, Download, Award, ShieldCheck } from 'lucide-react';
import { Badge, TestResult } from '../types/teas';
import { playHapticFeedback } from '../utils/haptics';

interface SocialShareModalProps {
  badge?: Badge | null;
  testResult?: TestResult | null;
  userName: string;
  onClose: () => void;
  hapticsEnabled: boolean;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  badge,
  testResult,
  userName,
  onClose,
  hapticsEnabled,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const title = badge
    ? `Unlocked "${badge.title}" Digital Badge on PulseTEAS!`
    : testResult
    ? `Passed ATI TEAS 7 Practice Exam with ${testResult.score}%!`
    : 'Studying for the ATI TEAS 7 with PulseTEAS';

  const shareText = badge
    ? `Proud to have earned the "${badge.title}" digital badge on PulseTEAS while preparing for my nursing school entrance exam! #ATITEAS #FutureNurse #PreNursing #PulseTEAS`
    : testResult
    ? `Just passed my ATI TEAS 7 simulated test with an Exemplary score of ${testResult.score}% on PulseTEAS! One step closer to nursing school acceptance. #ATITEAS #NursingSchool #PreNursing`
    : `Preparing for my nursing school entrance exam with PulseTEAS! #ATITEAS #FutureNurse`;

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pulseteas.app';

  const handleCopyLink = () => {
    playHapticFeedback('light', { hapticsEnabled });
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleShareTwitter = () => {
    playHapticFeedback('light', { hapticsEnabled });
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    playHapticFeedback('light', { hapticsEnabled });
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    playHapticFeedback('light', { hapticsEnabled });
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    playHapticFeedback('medium', { hapticsEnabled });
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadCertificate = () => {
    playHapticFeedback('medium', { hapticsEnabled });
    setDownloading(true);
    setTimeout(() => {
      // Create a printable card trigger or download
      window.print();
      setDownloading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Celebrate Milestone
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Share Your Accomplishment
            </h3>
          </div>
          <button
            onClick={() => {
              playHapticFeedback('light', { hapticsEnabled });
              onClose();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Visual Share Card */}
        <div className="p-6 space-y-5">
          {/* Visual Certificate Card Preview */}
          <div
            id="shareable-badge-card"
            className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl border border-slate-700/60 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between text-xs text-teal-300 font-mono tracking-wider">
              <span>ATI TEAS 7 · VERIFIED MASTERY</span>
              <span>PULSETEAS</span>
            </div>

            <div className="my-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20 shrink-0 flex items-center justify-center text-slate-950 font-bold text-2xl">
                {badge ? (
                  <Award className="w-9 h-9 text-slate-950" />
                ) : (
                  <span className="font-mono">{testResult?.score ?? 88}%</span>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400">Recipient</p>
                <h4 className="text-base font-bold text-white truncate">{userName}</h4>
                <p className="text-xs text-teal-300 mt-0.5">
                  {badge ? badge.title : `Passed Exam · ${testResult?.totalQuestions} Questions`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Verified Credential</span>
              </div>
              <span className="font-mono">
                {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Social Media Sharing Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Share to Platform
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Twitter / X */}
              <button
                onClick={handleShareTwitter}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 23.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>X / Twitter</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={handleShareLinkedIn}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0077b5] text-white hover:bg-[#006097] text-xs font-medium transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.738-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span>LinkedIn</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1877F2] text-white hover:bg-[#1464cc] text-xs font-medium transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Text & Link</span>
                </>
              )}
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator ? (
              <button
                onClick={handleNativeShare}
                className="py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            ) : null}

            <button
              onClick={handleDownloadCertificate}
              disabled={downloading}
              className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
              title="Print / Save Certificate as PDF"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Preparing...' : 'PDF Print'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
