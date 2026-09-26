import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/** Fresh module graph per test — the sequence hook only ever plays once. */
const loadSplash = async () => (await import('../components/ui/SplashScreen')).default;

const mockReducedMotion = (reduce: boolean) => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('SplashScreen', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    mockReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders on first mount and removes itself within three seconds', async () => {
    const SplashScreen = await loadSplash();
    const { container } = render(<SplashScreen />);

    expect(container.firstChild).not.toBeNull();

    act(() => { vi.advanceTimersByTime(1000); });
    expect(container.firstChild).not.toBeNull();

    act(() => { vi.advanceTimersByTime(2000); });
    expect(container.firstChild).toBeNull();
  });

  it('does not replay on a later mount within the same page load', async () => {
    const SplashScreen = await loadSplash();

    const first = render(<SplashScreen />);
    act(() => { vi.advanceTimersByTime(3000); });
    first.unmount();

    const { container } = render(<SplashScreen />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when the user asks for reduced motion', async () => {
    mockReducedMotion(true);
    const SplashScreen = await loadSplash();

    const { container } = render(<SplashScreen />);
    expect(container.firstChild).toBeNull();
  });

  it('is hidden from assistive technology while it plays', async () => {
    const SplashScreen = await loadSplash();
    const { container } = render(<SplashScreen />);

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
