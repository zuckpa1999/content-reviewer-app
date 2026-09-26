import { useEffect, useState } from 'react';

export type SplashPhase = 'playing' | 'leaving' | 'done';

/** Guards against replays on StrictMode double-mounts / auth re-renders. */
let hasPlayed = false;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Drives a one-shot intro: plays for `holdMs`, fades for `exitMs`, then unmounts.
 * Total runtime stays inside the 1–3s window; skipped entirely for users who
 * asked for reduced motion.
 */
export function useSplashSequence(holdMs: number, exitMs: number): SplashPhase {
  const [phase, setPhase] = useState<SplashPhase>(() =>
    hasPlayed || prefersReducedMotion() ? 'done' : 'playing'
  );

  useEffect(() => {
    if (phase !== 'playing') return;
    hasPlayed = true;

    const leaveTimer = window.setTimeout(() => setPhase('leaving'), holdMs);
    const doneTimer = window.setTimeout(() => setPhase('done'), holdMs + exitMs);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [phase, holdMs, exitMs]);

  return phase;
}
