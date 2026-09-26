import type { CSSProperties } from 'react';
import { Film } from 'lucide-react';
import { useSplashSequence } from '../../hooks/useSplashSequence';

const HOLD_MS = 1600;
const EXIT_MS = 500;

/**
 * Every measurement in the strip derives from one number — how tall the gate
 * is. A 35mm frame is roughly 1.37:1 and carries four sprocket holes, so the
 * perforations and frame lines stay in proportion at any screen size instead
 * of being fixed pixel counts tuned for one phone.
 */
const gateVars = {
  '--band-h': 'clamp(160px, 22dvh, 260px)',
  '--rail-h': 'calc(var(--band-h) * 0.13)',
  '--frame-h': 'calc(var(--band-h) - var(--rail-h) * 2)',
  '--frame-w': 'calc(var(--frame-h) * 1.37)',
  '--sprocket': 'calc(var(--frame-w) / 4)',
} as CSSProperties;

/** Perforated edge of a film strip, running past the gate. */
function SprocketRail({ edge }: { edge: 'top' | 'bottom' }) {
  return (
    <div
      className={`absolute inset-x-0 ${edge === 'top' ? 'top-0' : 'bottom-0'} overflow-hidden bg-dark-700`}
      style={{ height: 'var(--rail-h)' }}
    >
      <div
        className="absolute left-0 w-[200%] animate-film-run"
        style={{
          top: 'calc(var(--rail-h) * 0.22)',
          bottom: 'calc(var(--rail-h) * 0.22)',
          backgroundImage:
            'repeating-linear-gradient(90deg, #050505 0 calc(var(--sprocket) * 0.36), transparent calc(var(--sprocket) * 0.36) var(--sprocket))',
        }}
      />
    </div>
  );
}

/**
 * One full-viewport copy of the scene. Both halves of the gate render it and
 * clip to their own half, so the two line up as a single continuous image
 * until they separate.
 */
function GateScene({ leaving }: { leaving: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-dark-900">
      <div className="flex-1" />

      <div
        className="relative overflow-hidden border-y border-dark-700/70 bg-dark-950"
        style={{ ...gateVars, height: 'var(--band-h)' }}
      >
        <SprocketRail edge="top" />
        <SprocketRail edge="bottom" />

        {/* Frame lines streaming past */}
        <div
          className="absolute left-0 w-[200%] animate-film-run"
          style={{
            top: 'var(--rail-h)',
            bottom: 'var(--rail-h)',
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0 calc(var(--frame-w) - 2px), rgba(64,64,64,0.5) calc(var(--frame-w) - 2px) var(--frame-w))',
          }}
        />

        {/* Projector light leak */}
        <div
          className="absolute inset-y-0 left-0 w-1/4 animate-light-leak"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(229,9,20,0.25), transparent)',
          }}
        />

        {/* The MediaVault frame settles in the gate, and clears out before the
            gate opens so it never smears across the login card behind it. */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`flex items-center gap-3 ${leaving ? 'animate-frame-out' : 'animate-frame-settle'}`}>
            <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-accent shadow-lg shadow-accent/30
                            flex items-center justify-center">
              <Film className="text-white w-[22px] h-[22px] md:w-7 md:h-7" />
            </div>
            <span className="font-black text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
              Media<span className="text-accent">Vault</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1" />
    </div>
  );
}

/**
 * Intro: a film strip runs through the projector gate and decelerates onto the
 * MediaVault frame, then the gate opens — the strip tearing along the centre
 * line as both halves slide clear — to reveal the app.
 */
export default function SplashScreen() {
  const phase = useSplashSequence(HOLD_MS, EXIT_MS);
  if (phase === 'done') return null;

  const leaving = phase === 'leaving';

  return (
    <div aria-hidden="true" className="fixed inset-0 z-[100] flex flex-col pointer-events-none">
      <div className={`relative flex-1 overflow-hidden ${leaving ? 'animate-gate-up' : ''}`}>
        <div className="absolute inset-x-0 top-0 h-dvh">
          <GateScene leaving={leaving} />
        </div>
      </div>

      <div className={`relative flex-1 overflow-hidden ${leaving ? 'animate-gate-down' : ''}`}>
        <div className="absolute inset-x-0 bottom-0 h-dvh">
          <GateScene leaving={leaving} />
        </div>
      </div>
    </div>
  );
}
