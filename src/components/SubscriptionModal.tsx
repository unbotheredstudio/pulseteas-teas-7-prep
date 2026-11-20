import React, { useState, useMemo } from 'react';
import {
  X,
  Check,
  Sparkles,
  Shield,
  Lock,
  Clock,
  ArrowRight,
  CreditCard,
  Tag,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Wifi,
} from 'lucide-react';
import { UserSubscription } from '../types/teas';
import { playHapticFeedback } from '../utils/haptics';

interface SubscriptionModalProps {
  subscription: UserSubscription;
  onUpdateSubscription: (newSub: UserSubscription) => void;
  onClose: () => void;
  hapticsEnabled: boolean;
}

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic';

function detectCardBrand(num: string): CardBrand {
  const clean = num.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
  if (/^3[47]/.test(clean)) return 'amex';
  if (/^(6011|65)/.test(clean)) return 'discover';
  return 'generic';
}

function validateLuhn(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 13) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  subscription,
  onUpdateSubscription,
  onClose,
  hapticsEnabled,
}) => {
  const [step, setStep] = useState<'plans' | 'checkout' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Card input states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardZip, setCardZip] = useState('');
  const [cardholderName, setCardholderName] = useState('Sarah Jenkins');

  // Input touched states for validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Promo discount
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscountPct, setAppliedDiscountPct] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // No Return policy acknowledgment
  const [noReturnAcknowledged, setNoReturnAcknowledged] = useState(false);
  const [noReturnError, setNoReturnError] = useState(false);

  // Order Receipt
  const [receiptData, setReceiptData] = useState<{
    txId: string;
    amount: string;
    planName: string;
    date: string;
  } | null>(null);

  // Pricing math:
  // Monthly: $29.99/mo -> $359.88/year
  // Yearly: $199.99/yr -> $16.66/month equivalent
  // Savings: $359.88 - $199.99 = $159.89/year (44.4% ~45% OFF)
  const monthlyAnnualCost = 29.99 * 12; // 359.88
  const yearlyCost = 199.99;
  const annualSavingsDollars = monthlyAnnualCost - yearlyCost; // 159.89
  const monthlyEquivalent = yearlyCost / 12; // 16.66

  const basePrice = selectedPlan === 'yearly' ? yearlyCost : 29.99;
  const discountAmount = appliedDiscountPct > 0 ? (basePrice * appliedDiscountPct) / 100 : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const isTrialActive =
    subscription.tier === 'free_trial' && Date.now() < subscription.trialExpiresAt;

  const trialHoursRemaining = Math.max(
    0,
    Math.round((subscription.trialExpiresAt - Date.now()) / (1000 * 60 * 60))
  );

  // Detect brand
  const cardBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

  // Live validation calculations
  const validation = useMemo(() => {
    const rawNumber = cardNumber.replace(/\D/g, '');
    const isAmex = cardBrand === 'amex';
    const requiredLength = isAmex ? 15 : 16;
    const isNumberComplete = rawNumber.length === requiredLength;
    const isNumberValid = isNumberComplete && validateLuhn(rawNumber);

    // Expiry validation
    let isExpiryValid = false;
    let expiryError: string | null = null;
    if (cardExpiry.length === 5 && cardExpiry.includes('/')) {
      const [mStr, yStr] = cardExpiry.split('/');
      const month = parseInt(mStr, 10);
      const year = parseInt(`20${yStr}`, 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (month < 1 || month > 12) {
        expiryError = 'Invalid month (01-12)';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        expiryError = 'Card is expired';
      } else {
        isExpiryValid = true;
      }
    } else if (cardExpiry.length > 0 && cardExpiry.length < 5) {
      expiryError = 'Use MM/YY format';
    }

    // CVC validation
    const rawCvc = cardCvc.replace(/\D/g, '');
    const isCvcValid = isAmex ? rawCvc.length === 4 : rawCvc.length === 3;

    // Zip validation
    const isZipValid = cardZip.trim().length >= 5;

    // Name validation
    const isNameValid = cardholderName.trim().length >= 3;

    const allValid = isNumberValid && isExpiryValid && isCvcValid && isZipValid && isNameValid;

    return {
      rawNumber,
      isNumberComplete,
      isNumberValid,
      isExpiryValid,
      expiryError,
      isCvcValid,
      isZipValid,
      isNameValid,
      allValid,
    };
  }, [cardNumber, cardExpiry, cardCvc, cardZip, cardholderName, cardBrand]);

  // Format Card Number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Format MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  // Autofill Stripe Test Card
  const handleAutofillTestCard = () => {
    playHapticFeedback('light', { hapticsEnabled });
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    setCardZip('21205');
    setCardholderName('Sarah Jenkins');
    setTouched({
      number: true,
      expiry: true,
      cvc: true,
      zip: true,
      name: true,
    });
  };

  // Apply Promo Code
  const handleApplyPromo = () => {
    playHapticFeedback('light', { hapticsEnabled });
    const code = promoCode.trim().toUpperCase();
    if (code === 'NURSE15' || code === 'FUTUREBSN') {
      setAppliedDiscountPct(15);
      setPromoMessage('Promo code applied: 15% discount!');
    } else if (code === 'TEASPASS') {
      setAppliedDiscountPct(20);
      setPromoMessage('Promo code applied: 20% discount!');
    } else {
      setPromoMessage('Invalid promo code. Try "NURSE15"');
    }
  };

  // Process Checkout
  const handleProcessCheckout = () => {
    if (paymentMethod === 'card' && !validation.allValid) {
      playHapticFeedback('warning', { hapticsEnabled });
      setTouched({
        number: true,
        expiry: true,
        cvc: true,
        zip: true,
        name: true,
      });
      return;
    }

    if (!noReturnAcknowledged) {
      playHapticFeedback('warning', { hapticsEnabled });
      setNoReturnError(true);
      return;
    }

    playHapticFeedback('medium', { hapticsEnabled });
    setIsProcessing(true);

    setTimeout(() => {
      const updated: UserSubscription = {
        isPremium: true,
        tier: selectedPlan,
        trialStartedAt: subscription.trialStartedAt,
        trialExpiresAt: subscription.trialExpiresAt,
        autoRenew: true,
        renewsAt: Date.now() + (selectedPlan === 'yearly' ? 365 * 86400000 : 30 * 86400000),
      };

      onUpdateSubscription(updated);
      setIsProcessing(false);
      setReceiptData({
        txId: `ch_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        amount: `$${finalPrice.toFixed(2)}`,
        planName: selectedPlan === 'yearly' ? 'Annual Pass ($199.99/yr)' : 'Monthly Flex ($29.99/mo)',
        date: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      });
      setStep('success');
      playHapticFeedback('success', { hapticsEnabled });
    }, 1200);
  };

  const handleStartFreeTrial = () => {
    playHapticFeedback('medium', { hapticsEnabled });
    setIsProcessing(true);

    setTimeout(() => {
      const updated: UserSubscription = {
        isPremium: true,
        tier: 'free_trial',
        trialStartedAt: Date.now(),
        trialExpiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
        autoRenew: true,
      };

      onUpdateSubscription(updated);
      setIsProcessing(false);
      setReceiptData({
        txId: `trial_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        amount: '$0.00 (3-Day Free Trial)',
        planName: '3-Day Free Trial (All Access)',
        date: new Date().toLocaleDateString(),
      });
      setStep('success');
      playHapticFeedback('success', { hapticsEnabled });
    }, 600);
  };

  const renderBrandBadge = () => {
    switch (cardBrand) {
      case 'visa':
        return (
          <span className="font-extrabold italic tracking-wider text-blue-400 font-sans text-sm">
            VISA
          </span>
        );
      case 'mastercard':
        return (
          <div className="flex items-center -space-x-1.5">
            <span className="w-4 h-4 rounded-full bg-rose-500 opacity-90 inline-block" />
            <span className="w-4 h-4 rounded-full bg-amber-400 opacity-90 inline-block" />
          </div>
        );
      case 'amex':
        return (
          <span className="font-extrabold tracking-tight text-teal-300 font-mono text-xs px-1 border border-teal-300/40 rounded">
            AMEX
          </span>
        );
      case 'discover':
        return (
          <span className="font-bold text-orange-400 font-sans text-xs">
            DISCOVER
          </span>
        );
      default:
        return <CreditCard className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Banner */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

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

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ATI TEAS 7 Pass Guarantee</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {step === 'checkout'
              ? 'Complete Your Subscription'
              : step === 'success'
              ? 'Payment Authorized'
              : 'Choose Your Preparation Plan'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
            {step === 'checkout'
              ? 'Enter your card details with instant validation and 256-bit SSL encryption.'
              : step === 'success'
              ? 'Thank you! Your transaction is verified and full premium access is unlocked.'
              : 'Save 45% with the Annual Pass or select the flexible monthly membership.'}
          </p>

          {isTrialActive && step === 'plans' && (
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-teal-200">
              <Clock className="w-4 h-4 text-teal-300 shrink-0" />
              <span>
                <strong>3-Day Free Trial Active:</strong> {trialHoursRemaining} hours remaining.
              </span>
            </div>
          )}
        </div>

        {/* STEP 1: PLANS OVERVIEW WITH DETAILED COMPARISON */}
        {step === 'plans' && (
          <div className="p-6 sm:p-7 space-y-6">
            {/* Side-by-side Pricing Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monthly Plan */}
              <div
                onClick={() => {
                  playHapticFeedback('light', { hapticsEnabled });
                  setSelectedPlan('monthly');
                }}
                className={`cursor-pointer relative p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                  selectedPlan === 'monthly'
                    ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 shadow-md ring-1 ring-teal-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Monthly Flex
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedPlan === 'monthly'
                          ? 'border-teal-600 bg-teal-600'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {selectedPlan === 'monthly' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                      $29.99
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> / month</span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Billed $29.99 monthly. Cancel anytime with 1 click.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
                  $359.88 total over 12 months
                </div>
              </div>

              {/* Yearly Plan (Best Value with Explicit Savings Calculation) */}
              <div
                onClick={() => {
                  playHapticFeedback('light', { hapticsEnabled });
                  setSelectedPlan('yearly');
                }}
                className={`cursor-pointer relative p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                  selectedPlan === 'yearly'
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 shadow-md ring-1 ring-teal-500/40'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                {/* Save 45% Badge */}
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  <span>Save 45% · Best Value</span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Annual Pass
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedPlan === 'yearly'
                          ? 'border-teal-600 bg-teal-600'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {selectedPlan === 'yearly' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                      $199.99
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> / year</span>
                  </div>

                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                    Just ${monthlyEquivalent.toFixed(2)}/month equivalent
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-between">
                  <span>Save $159.89 vs monthly!</span>
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                    5+ Months Free
                  </span>
                </div>
              </div>
            </div>

            {/* Clear Yearly Discount Comparison Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-950 dark:text-teal-200">
                    Annual Pass Discount Breakdown
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                    45% OFF
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Monthly: <span className="line-through text-slate-400 font-mono">$359.88/yr</span>{' '}
                  ➔ Annual: <strong className="text-teal-700 dark:text-teal-300 font-mono">$199.99/yr</strong>{' '}
                  (Instant <strong className="text-emerald-600 dark:text-emerald-400 font-mono">$159.89 savings</strong>).
                </p>
              </div>

              <div className="hidden sm:block text-right shrink-0">
                <span className="text-xs text-slate-400">Equivalent to</span>
                <div className="text-sm font-extrabold text-teal-700 dark:text-teal-300 font-mono">
                  $16.66 / mo
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  playHapticFeedback('light', { hapticsEnabled });
                  setStep('checkout');
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-teal-600/25 transition-all"
              >
                <span>
                  Proceed to Checkout ({selectedPlan === 'yearly' ? '$199.99 / yr (Save 45%)' : '$29.99 / mo'})
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!isTrialActive &&
                subscription.tier !== 'yearly' &&
                subscription.tier !== 'monthly' && (
                  <button
                    onClick={handleStartFreeTrial}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 rounded-xl border border-teal-600/30 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-xs font-semibold transition-colors"
                  >
                    Start 3-Day Free Trial (No charge today)
                  </button>
                )}

              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-teal-500" />
                  <span>Stripe Verified 256-Bit SSL</span>
                </span>
                <span>·</span>
                <span>All Sales Final · No Returns or Refunds</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MODERN CREDIT CARD FORM WITH LIVE FIELD VALIDATION */}
        {step === 'checkout' && (
          <div className="p-6 sm:p-7 space-y-5">
            {/* Back button & order recap */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  playHapticFeedback('light', { hapticsEnabled });
                  setStep('plans');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Plan</span>
              </button>
              <div className="text-right">
                <span className="text-xs text-slate-400">
                  {selectedPlan === 'yearly' ? 'Annual Pass: ' : 'Monthly Flex: '}
                </span>
                <span className="text-base font-extrabold font-mono text-teal-600 dark:text-teal-400">
                  ${finalPrice.toFixed(2)}
                </span>
                {selectedPlan === 'yearly' && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-1.5">
                    (Saved $159.89)
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Visual Credit Card Mockup */}
            <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl border border-slate-700/60 overflow-hidden select-none">
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                {/* EMV Chip & Contactless */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded-lg bg-gradient-to-tr from-amber-200 to-amber-400 border border-amber-500/40 p-1 flex items-center justify-center shadow-sm">
                    <div className="w-full h-full border border-amber-600/30 rounded flex items-center justify-center">
                      <div className="w-4 h-2 border-t border-b border-amber-700/40" />
                    </div>
                  </div>
                  <Wifi className="w-4 h-4 text-slate-400 rotate-90" />
                </div>

                {/* Card Brand */}
                <div className="h-6 flex items-center">{renderBrandBadge()}</div>
              </div>

              {/* Live Formatted Card Number */}
              <div className="my-5">
                <p className="font-mono text-lg sm:text-xl tracking-widest text-slate-100">
                  {cardNumber || '•••• •••• •••• ••••'}
                </p>
              </div>

              {/* Cardholder Name & Expiry */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                    Cardholder
                  </span>
                  <p className="font-semibold text-slate-200 uppercase truncate max-w-[180px]">
                    {cardholderName || 'YOUR NAME'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                    Expires
                  </span>
                  <p className="font-mono font-semibold text-slate-200">
                    {cardExpiry || 'MM/YY'}
                  </p>
                </div>
              </div>
            </div>

            {/* Input Form Fields with Live Validation */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Card Details
                </label>
                <button
                  type="button"
                  onClick={handleAutofillTestCard}
                  className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <span>⚡ Autofill Stripe Test Card</span>
                </button>
              </div>

              {/* Card Number Input with Live Brand & Luhn Feedback */}
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    onBlur={() => setTouched((prev) => ({ ...prev, number: true }))}
                    maxLength={19}
                    className={`w-full py-2.5 pl-10 pr-10 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none transition-colors ${
                      touched.number && !validation.isNumberValid
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                        : validation.isNumberValid
                        ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-teal-500'
                    }`}
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
                    {validation.isNumberValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : touched.number && validation.rawNumber.length > 0 ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : null}
                  </div>
                </div>

                {touched.number && !validation.isNumberValid && validation.rawNumber.length > 0 && (
                  <p className="text-[11px] text-rose-500">
                    {validation.rawNumber.length < 15
                      ? 'Incomplete card number (16 digits required)'
                      : 'Invalid card number checksum (Luhn check failed)'}
                  </p>
                )}
              </div>

              {/* Expiration, CVC, Zip with Live Field Validation */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Expiry */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      onBlur={() => setTouched((prev) => ({ ...prev, expiry: true }))}
                      maxLength={5}
                      className={`w-full py-2.5 px-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs text-center focus:outline-none transition-colors ${
                        touched.expiry && !validation.isExpiryValid
                          ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                          : validation.isExpiryValid
                          ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-teal-500'
                      }`}
                    />
                    {validation.isExpiryValid && (
                      <Check className="w-3.5 h-3.5 text-emerald-500 absolute right-2 top-3 pointer-events-none" />
                    )}
                  </div>
                  {touched.expiry && validation.expiryError && (
                    <p className="text-[10px] text-rose-500 truncate">{validation.expiryError}</p>
                  )}
                </div>

                {/* CVC */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={cardBrand === 'amex' ? '4-digit CVC' : 'CVC'}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      onBlur={() => setTouched((prev) => ({ ...prev, cvc: true }))}
                      maxLength={4}
                      className={`w-full py-2.5 px-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs text-center focus:outline-none transition-colors ${
                        touched.cvc && !validation.isCvcValid
                          ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                          : validation.isCvcValid
                          ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-teal-500'
                      }`}
                    />
                    {validation.isCvcValid && (
                      <Check className="w-3.5 h-3.5 text-emerald-500 absolute right-2 top-3 pointer-events-none" />
                    )}
                  </div>
                  {touched.cvc && !validation.isCvcValid && (
                    <p className="text-[10px] text-rose-500 truncate">3 digits required</p>
                  )}
                </div>

                {/* ZIP */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={cardZip}
                      onChange={(e) => setCardZip(e.target.value.slice(0, 10))}
                      onBlur={() => setTouched((prev) => ({ ...prev, zip: true }))}
                      className={`w-full py-2.5 px-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs text-center focus:outline-none transition-colors ${
                        touched.zip && !validation.isZipValid
                          ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                          : validation.isZipValid
                          ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-teal-500'
                      }`}
                    />
                    {validation.isZipValid && (
                      <Check className="w-3.5 h-3.5 text-emerald-500 absolute right-2 top-3 pointer-events-none" />
                    )}
                  </div>
                  {touched.zip && !validation.isZipValid && (
                    <p className="text-[10px] text-rose-500 truncate">5-digit zip</p>
                  )}
                </div>
              </div>

              {/* Cardholder name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                  Name on Card
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                    className={`w-full py-2.5 px-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none transition-colors ${
                      touched.name && !validation.isNameValid
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-teal-500'
                    }`}
                  />
                  {validation.isNameValid && (
                    <Check className="w-3.5 h-3.5 text-emerald-500 absolute right-3 top-3 pointer-events-none" />
                  )}
                </div>
              </div>
            </div>

            {/* Promo Code Drawer */}
            <div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Coupon code (try NURSE15)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full py-2 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p
                  className={`text-[11px] mt-1 font-medium ${
                    appliedDiscountPct > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-500'
                  }`}
                >
                  {promoMessage}
                </p>
              )}
            </div>

            {/* No Return Policy Acknowledgment */}
            <div
              className={`p-3.5 rounded-2xl border transition-colors ${
                noReturnError && !noReturnAcknowledged
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-400'
                  : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/50'
              }`}
            >
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={noReturnAcknowledged}
                  onChange={(e) => {
                    playHapticFeedback('light', { hapticsEnabled });
                    setNoReturnAcknowledged(e.target.checked);
                    if (e.target.checked) setNoReturnError(false);
                  }}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 shrink-0 cursor-pointer accent-teal-600"
                />
                <div className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    No Return Policy:{' '}
                  </span>
                  <span>
                    I understand all digital subscription purchases are final and non-refundable (no returns once study guides, mock exams, and flashcards are accessed). Future renewals can be canceled anytime.
                  </span>
                </div>
              </label>
              {noReturnError && !noReturnAcknowledged && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1.5 pl-6">
                  Please acknowledge the No Return Policy before completing payment.
                </p>
              )}
            </div>

            {/* Pay Button */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={handleProcessCheckout}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-teal-600/25 transition-all disabled:opacity-60"
              >
                {isProcessing ? (
                  <span>Verifying via Stripe...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ${finalPrice.toFixed(2)} & Activate Access</span>
                  </>
                )}
              </button>

              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-teal-500" />
                  <span>Stripe PCI-DSS Level 1 Encrypted</span>
                </span>
                <span>·</span>
                <span>No Returns · All Sales Final</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT RECEIPT & SUCCESS */}
        {step === 'success' && receiptData && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Subscription Active!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your payment was authorized and your account is upgraded with unlimited study access.
              </p>
            </div>

            {/* Digital Order Receipt */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span>Transaction Ref</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold">
                  {receiptData.txId}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Plan</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold">
                  {receiptData.planName}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Amount Charged</span>
                <span className="text-teal-600 dark:text-teal-400 font-bold">
                  {receiptData.amount}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Billing Date</span>
                <span className="text-slate-900 dark:text-slate-200">{receiptData.date}</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Return Policy</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  Final Sale · No Returns
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playHapticFeedback('light', { hapticsEnabled });
                onClose();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              Start Studying with Full Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
