import { Film } from 'lucide-react';
import { useSplashSequence } from '../../hooks/useSplashSequence';

const HOLD_MS = 1600;
const EXIT_MS = 500;

/** Perforated edge of a film strip, running past the gate. */
function SprocketRail({ edge }: { edge: 'top' | 'bottom' }) {
  return (
    <div className={`absolute inset-x-0 ${edge === 'top' ? 'top-0' : 'bottom-0'} h-6 overflow-hidden bg-dark-700`}>
      <div
        className="absolute inset-y-[5px] left-0 w-[200%] animate-film-run"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #050505 0 16px, transparent 16px 44px)',
        }}
      />
    </div>
  );
}

/**
 * Intro: a film strip runs through the projector gate and decelerates onto the
 * MediaVault frame, then the gate opens — panels sliding away top and bottom —
 * to reveal the app.
 */
export default function SplashScreen() {
  const phase = useSplashSequence(HOLD_MS, EXIT_MS);
  if (phase === 'done') return null;

  const leaving = phase === 'leaving';

  return (
    <div aria-hidden="true" className="fixed inset-0 z-[100] flex flex-col pointer-events-none">
      {/* Upper gate panel */}
      <div className={`flex-1 bg-dark-900 ${leaving ? 'animate-gate-up' : ''}`} />

      {/* The gate */}
      <div
        className={`relative h-40 sm:h-48 overflow-hidden border-y border-dark-700/70 bg-dark-950
                    ${leaving ? 'animate-gate-collapse' : ''}`}
      >
        <SprocketRail edge="top" />
        <SprocketRail edge="bottom" />

        {/* Frame dividers streaming past */}
        <div
          className="absolute left-0 top-6 bottom-6 w-[200%] animate-film-run"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0 158px, rgba(64,64,64,0.5) 158px 160px)',
          }}
        />

        {/* Projector light leak */}
        <div
          className="absolute inset-y-0 left-0 w-1/4 animate-light-leak"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(229,9,20,0.25), transparent)',
          }}
        />

        {/* The MediaVault frame settles in the gate */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-3 animate-frame-settle">
            <div className="w-11 h-11 rounded-xl bg-accent shadow-lg shadow-accent/30 flex items-center justify-center">
              <Film className="text-white" style={{ width: '22px', height: '22px' }} />
            </div>
            <span className="font-black text-white text-3xl sm:text-4xl tracking-tight">
              Media<span className="text-accent">Vault</span>
            </span>
          </div>
        </div>
      </div>

      {/* Lower gate panel */}
      <div className={`flex-1 bg-dark-900 ${leaving ? 'animate-gate-down' : ''}`} />
    </div>
  );
}
