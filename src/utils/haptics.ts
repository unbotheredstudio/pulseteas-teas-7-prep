/**
 * Tactile Haptic & Audio Feedback Engine
 * Provides subtle physical vibration on supported mobile devices and synthetic audio clicks.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const playHapticFeedback = (
  type: 'light' | 'medium' | 'success' | 'warning' | 'error' = 'light',
  options?: { hapticsEnabled?: boolean; soundEnabled?: boolean }
) => {
  const hapticsEnabled = options?.hapticsEnabled ?? true;
  const soundEnabled = options?.soundEnabled ?? true;

  // 1. Physical Device Vibration
  if (hapticsEnabled && typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(12);
          break;
        case 'medium':
          navigator.vibrate(28);
          break;
        case 'success':
          navigator.vibrate([20, 40, 30, 40, 50]);
          break;
        case 'warning':
          navigator.vibrate([35, 30, 35]);
          break;
        case 'error':
          navigator.vibrate([50, 40, 50, 40, 60]);
          break;
      }
    } catch {
      // Ignore vibration error
    }
  }

  // 2. Subtle Micro Web Audio synthesis
  if (soundEnabled && typeof window !== 'undefined') {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'light') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.06); // C#
        osc.frequency.setValueAtTime(659.25, now + 0.12); // E
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'error') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // Audio playback fails gracefully
    }
  }
};
