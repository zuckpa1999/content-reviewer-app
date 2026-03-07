/**
 * flows.test.tsx — Integration Tests (User Journeys)
 *
 * WHAT MAKES THESE "INTEGRATION" TESTS?
 * We render the full <App /> component, which internally mounts AddEntryModal,
 * MediaCard, DetailModal, and calls useLocalStorage — all the real code, no mocks
 * (except for react-hot-toast, which is mocked purely because it renders a DOM
 * portal that jsdom doesn't support cleanly).
 *
 * Compare to unit tests like AddEntryModal.test.tsx:
 *   - Unit:        render(<AddEntryModal onSave={vi.fn()} ... />)  ← isolated, callbacks mocked
 *   - Integration: render(<App />)                                 ← full tree, real interactions
 *
 * TESTING PYRAMID RATIO FOR THIS PROJECT:
 *   Unit tests      ~60%  — fast, many, isolated (existing files)
 *   Integration     ~30%  — user journeys through real component trees (this file + App.test.tsx)
 *   E2E             ~10%  — real browser, critical paths only (cypress/e2e/app.cy.ts)
 */

import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import App from '../App';

// ─────────────────────────────────────────────────────────────────────────────
// Mock AuthContext — flows tests focus on journal behaviour, not auth.
// We mock useAuth to always return a logged-in user so App never shows LoginScreen.
// ─────────────────────────────────────────────────────────────────────────────
vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-1', firstName: 'Test', lastName: 'User', email: 'test@gmail.com', provider: 'google' },
    logout: vi.fn(),
    isLoading: false,
  })),
  getUserInitials: () => 'TU',
}));

// ─────────────────────────────────────────────────────────────────────────────
// Why mock react-hot-toast?
//
// toast() accepts JSX and renders it in a portal attached to document.body.
// In jsdom that technically works, but the dismiss timer fires asynchronously
// in ways that make tests flaky. We mock it so we can:
//   1. Know that toast() was called (delete happened)
//   2. Grab the JSX content it was given (so we can render it and click "Undo")
// ─────────────────────────────────────────────────────────────────────────────
let capturedToastFn: ((t: { id: string }) => ReactElement) | null = null;

vi.mock('react-hot-toast', () => {
  const toast = Object.assign(
    vi.fn((fn: (t: { id: string }) => ReactElement) => {
      capturedToastFn = fn;
      return 'mock-toast-id';
    }),
    {
      success: vi.fn(),
      dismiss: vi.fn(),
    }
  );
  return { default: toast, toast, Toaster: () => null };
});

// ─────────────────────────────────────────────────────────────────────────────
// beforeEach runs BEFORE every single `it` block in this describe.
// Clearing localStorage here prevents state from leaking between tests —
// e.g. entries added in test 1 shouldn't show up in test 2.
// vi.clearAllMocks() resets call counts on vi.fn() mocks.
// ─────────────────────────────────────────────────────────────────────────────
describe('User flows (integration)', () => {
  beforeEach(() => {
    localStorage.clear();
    capturedToastFn = null;
    vi.clearAllMocks();
  });

  // ── Flow 1: Add a new entry ────────────────────────────────────────────────
  //
  // User story: "I open the app, click Add, fill in a title, submit — and I
  // see the entry appear in my journal."
  //
  // This tests App + AddEntryModal + MediaCard + useLocalStorage all at once.
  // If the modal's onSave callback is wired up wrong, or the entry isn't passed
  // down to MediaCard correctly, this test will catch it.
  //
  it('user can add a new entry and see it appear in the grid', async () => {
    // userEvent.setup() creates a virtual user that fires realistic browser events
    // (pointerdown, focus, keydown, input, keyup, pointerup, click — in that order).
    // Always call setup() BEFORE render() so the event queue is ready.
    const user = userEvent.setup();

    // Mounting <App /> renders the full component tree into a fake DOM (jsdom).
    render(<App />);

    // screen.getByRole() is the #1 recommended query.
    // It finds elements by their implicit ARIA role — the same way screen readers do.
    // { name: /text/ } matches the accessible name (button label, aria-label, etc.)
    // Using a regex /.../ instead of a string means partial match (no exact required).
    await user.click(screen.getByRole('button', { name: /Add Your First Entry/ }));

    // The modal is now open. Find the title input by its placeholder text.
    // user.type() simulates real keypresses — fires input events for every character.
    await user.type(screen.getByPlaceholderText(/Breaking Bad/), 'Parasite');

    // within() scopes all queries to a specific container.
    // We use it here because "Add Entry" appears as both the header button
    // AND the modal submit button — within(dialog) targets only the modal.
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Add Entry' }));

    // The modal should be gone and the entry should be visible.
    // toBeInTheDocument() asserts the element is present in the DOM.
    expect(screen.getByText('Parasite')).toBeInTheDocument();

    // Also verify the full persistence chain: the hook actually wrote to localStorage.
    // JSON.parse + ! (non-null assertion) because getItem() returns string | null.
    const stored = JSON.parse(localStorage.getItem('media-journal-v1')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Parasite');
  });

  // ── Flow 2: Add → click card → edit ───────────────────────────────────────
  //
  // User story: "I click a card, see its details, click Edit, change the title,
  // save — and the card in the grid shows the new title."
  //
  // This is a multi-step modal chain:
  //   MediaCard click → DetailModal opens → Edit clicked → AddEntryModal opens
  //   pre-filled → Save → card updates
  //
  it('user can edit an existing entry through the detail modal', async () => {
    // Seeding localStorage directly is faster than going through the Add flow.
    // We do this often in integration tests when the "setup" state isn't what we're
    // testing — we just need a known starting point.
    localStorage.setItem('media-journal-v1', JSON.stringify([{
      id: '1',
      name: 'Interstellar',
      type: 'Movie',
      rating: 4,
      thoughts: '',
      imageUrl: '',
      dateWatched: '2026-01-01',
      createdAt: '2026-01-01T00:00:00.000Z',
    }]));

    const user = userEvent.setup();
    render(<App />);

    // Click the card. MediaCard renders with role="article".
    await user.click(screen.getByRole('article'));

    // DetailModal is open. Find and click Edit Entry.
    await user.click(screen.getByRole('button', { name: 'Edit Entry' }));

    // AddEntryModal is now open in edit mode, title pre-filled.
    // getByDisplayValue() finds an input/select/textarea by its CURRENT value.
    const titleInput = screen.getByDisplayValue('Interstellar');

    // user.clear() empties the field (fires select-all + delete events).
    // user.type() then types the new value character by character.
    await user.clear(titleInput);
    await user.type(titleInput, 'Interstellar (re-watched)');

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    // Updated name is in the grid; old name is gone.
    expect(screen.getByText('Interstellar (re-watched)')).toBeInTheDocument();

    // queryByText() returns null instead of throwing when the element is absent.
    // ALWAYS use queryBy* (not getBy*) when asserting something is NOT in the DOM.
    expect(screen.queryByText('Interstellar')).not.toBeInTheDocument();
  });

  // ── Flow 3: Delete → Undo ─────────────────────────────────────────────────
  //
  // User story: "I accidentally delete an entry and can undo it."
  //
  // The undo mechanism works by passing JSX to toast(). Because toast() is mocked,
  // we capture that JSX in capturedToastFn, then render it manually so we can
  // find and click the Undo button.
  //
  it('user can undo a deletion', () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([{
      id: '1',
      name: 'Arrival',
      type: 'Movie',
      rating: 5,
      thoughts: '',
      imageUrl: '',
      dateWatched: '2026-01-01',
      createdAt: '2026-01-01T00:00:00.000Z',
    }]));

    render(<App />);

    // getByLabelText() finds elements by their aria-label attribute.
    // It's how we reach icon-only buttons that have no visible text.
    //
    // We use fireEvent.click() here (not .click() or userEvent).
    // Why? fireEvent wraps the event in React's act() automatically, so React
    // flushes all state updates synchronously before the next line runs.
    // Raw .click() (native DOM) skips act(), causing the "not wrapped in act()"
    // warning and a race where the DOM hasn't updated yet.
    fireEvent.click(screen.getByLabelText('Delete entry'));

    // Entry should be gone immediately.
    expect(screen.queryByText('Arrival')).not.toBeInTheDocument();

    // capturedToastFn is the function the app passed to toast().
    // We call it with a fake toast object { id: 'mock-id' } to get back the JSX,
    // then render that JSX so we can interact with the Undo button inside it.
    const toastContent = render(capturedToastFn!({ id: 'mock-id' }));
    fireEvent.click(toastContent.getByText('Undo'));

    // Entry should be restored.
    expect(screen.getByText('Arrival')).toBeInTheDocument();
  });

  // ── Flow 4: Search + type filter combined ─────────────────────────────────
  //
  // User story: "I filter by Anime, then search for 'Your' — only Anime entries
  // matching 'Your' should remain."
  //
  // This tests that two independent state values (filterType + search) both feed
  // into the same derived `filtered` array correctly at the same time.
  //
  it('user can combine search and type filter to narrow results', async () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([
      { id: '1', name: 'Your Name',           type: 'Anime', rating: 5, thoughts: '', imageUrl: '', dateWatched: '2026-01-01', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '2', name: 'Weathering With You', type: 'Anime', rating: 4, thoughts: '', imageUrl: '', dateWatched: '2026-01-02', createdAt: '2026-01-02T00:00:00.000Z' },
      { id: '3', name: 'Your Lie in April',   type: 'Anime', rating: 5, thoughts: '', imageUrl: '', dateWatched: '2026-01-03', createdAt: '2026-01-03T00:00:00.000Z' },
      { id: '4', name: 'Your Name (movie)',   type: 'Movie', rating: 5, thoughts: '', imageUrl: '', dateWatched: '2026-01-04', createdAt: '2026-01-04T00:00:00.000Z' },
    ]));

    const user = userEvent.setup();
    render(<App />);

    // Open the filter panel and select Anime.
    await user.click(screen.getByRole('button', { name: /Filter/ }));
    await user.click(screen.getByRole('button', { name: 'Anime' }));

    // Also type in the search box to narrow further.
    await user.type(screen.getByPlaceholderText('Search titles…'), 'Your');

    // ✓ Matches search AND is Anime
    expect(screen.getByText('Your Name')).toBeInTheDocument();
    expect(screen.getByText('Your Lie in April')).toBeInTheDocument();

    // ✗ Is Anime but doesn't match search
    expect(screen.queryByText('Weathering With You')).not.toBeInTheDocument();

    // ✗ Matches search but wrong type (Movie not Anime)
    expect(screen.queryByText('Your Name (movie)')).not.toBeInTheDocument();
  });

  // ── Flow 5: Add a custom type and use it ──────────────────────────────────
  //
  // User story: "I add a custom 'Manga' type, select it, create an entry —
  // and the entry is saved with that type."
  //
  // This tests the customTypes localStorage key alongside the entries key —
  // two separate storage values that need to cooperate.
  //
  it('user can add a custom type and create an entry with it', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Add Your First Entry/ }));

    // "+ Add type" reveals a small inline input inside the modal.
    await user.click(screen.getByText('Add type'));
    await user.type(screen.getByPlaceholderText('Type name…'), 'Manga');

    // user.keyboard() fires raw keyboard events.
    // Special key names go inside curly braces: {Enter}, {Escape}, {Tab}, etc.
    await user.keyboard('{Enter}');

    // The new type button should be rendered and selectable.
    const mangaBtn = screen.getByRole('button', { name: 'Manga' });
    expect(mangaBtn).toBeInTheDocument();
    await user.click(mangaBtn);

    // Fill title and submit.
    await user.type(screen.getByPlaceholderText(/Breaking Bad/), 'Berserk');
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Add Entry' }));

    // Entry appears in the grid.
    expect(screen.getByText('Berserk')).toBeInTheDocument();

    // The custom types list was persisted to its own key.
    const customTypes = JSON.parse(localStorage.getItem('media-journal-custom-types')!);
    expect(customTypes).toContain('Manga');
  });
});
