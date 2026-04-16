/**
 * app.cy.ts — E2E Tests (Cypress)
 *
 * WHAT MAKES THESE "E2E" TESTS?
 * Cypress launches a real Chromium browser, navigates to http://localhost:5173,
 * and controls it just like a human would. Everything is real:
 *   - Real DOM rendering (including CSS)
 *   - Real localStorage (survives cy.reload())
 *   - Real network requests
 *   - Real browser events
 *
 * THE KEY THING INTEGRATION TESTS CAN'T DO:
 * Simulate a page reload. jsdom is reset every time you call render().
 * In Cypress, cy.reload() actually refreshes the browser tab — so you can
 * prove that data genuinely persisted to localStorage and was read back.
 *
 * TESTING PYRAMID — WHY ONLY 4 TESTS HERE?
 * E2E tests are:
 *   - Slow   (each test boots a browser tab, ~1-3s per test vs ~10ms for unit)
 *   - Fragile (CSS changes, animation delays, selector drift can break them)
 *   - Hard to debug (failures produce a video, not a stack trace)
 *
 * Rule: only E2E-test things that genuinely REQUIRE a real browser.
 * Everything else → unit or integration test.
 */

describe('MediaVault', () => {
  // ─────────────────────────────────────────────────────────────────────────
  // beforeEach in Cypress is identical in concept to Vitest's beforeEach.
  // It runs before every `it` block in this describe.
  //
  // cy.clearLocalStorage() wipes the browser's real localStorage, so each
  // test starts with an empty journal — no data leaking between tests.
  //
  // cy.visit('/') navigates to baseUrl + '/' = http://localhost:5173/
  // The app must be running (npm run dev) for this to work.
  // ─────────────────────────────────────────────────────────────────────────
  beforeEach(() => {
    cy.clearLocalStorage();
    // Ensure the app starts in a truly empty state.
    // `useLocalStorage(..., initialData)` falls back to `initialData` when the key
    // doesn't exist; seeding [] makes the EmptyState button deterministic.
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('media-journal-v1', JSON.stringify([]));
        win.localStorage.setItem('media-journal-custom-types', JSON.stringify([]));
      },
    });
  });

  // ── E2E 1: App loads correctly ────────────────────────────────────────────
  //
  // The simplest possible test: does the app even boot?
  // If Vite is broken, or the component crashes on mount, this fails immediately.
  // A "smoke test" — named after the practice of powering on a circuit board
  // and checking if smoke appears.
  //
  // cy.contains('text') searches the entire page for an element containing that
  // text. It's roughly equivalent to screen.getByText() in RTL.
  //
  // it('shows the empty state when there are no entries', () => {
  //   cy.contains('Your journal is empty').should('exist');
  // });

  // ── E2E 2: Add entry + REAL localStorage persistence ─────────────────────
  //
  // This is the most valuable E2E test in this file.
  // An integration test already covers "add entry → appears in grid".
  // What ONLY an E2E test can cover is: does the entry survive a page reload?
  //
  // In jsdom (integration tests), every render() call is a fresh environment.
  // There's no concept of "reload". Here, cy.reload() does a real browser
  // refresh — React re-mounts, useLocalStorage reads from the real browser
  // localStorage, and the entry should reappear.
  //
  it('adds an entry and it persists after a page reload', () => {
    // cy.contains('button', 'text') finds a <button> element containing 'text'.
    // This is like screen.getByRole('button', { name: /text/ }) in RTL.
    cy.contains('button', 'Add Your First Entry').click();

    // cy.get() accepts any CSS selector.
    // [placeholder*="text"] means: any element whose placeholder CONTAINS "text".
    // The * is the CSS "substring" attribute selector — equivalent to /Breaking Bad/i in RTL.
    cy.get('input[placeholder*="Breaking Bad"]').type('Parasite');

    // The dialog contains two "Add Entry" buttons — one in the App header,
    // one as the form submit. We scope with [role="dialog"] to target only the modal.
    // Cypress chains are like jQuery: cy.get(...).contains(...).click()
    cy.get('[role="dialog"]').contains('button', 'Add Entry').click();

    // Entry should now be in the grid.
    cy.contains('Parasite').should('exist');

    // ── The test no integration test can replicate ──
    cy.reload();

    // After a real browser reload, useLocalStorage re-reads from real localStorage.
    // If the write in useLocalStorage.ts failed, or if we used sessionStorage
    // instead, this assertion would fail.
    cy.contains('Parasite').should('exist');
  });

  // ── E2E 3: Delete → undo button appears ───────────────────────────────────
  //
  // We can't easily test the full undo interaction in Cypress (the toast has a
  // 5s timer and dismisses itself). But we CAN verify the toast UI appears at
  // all — which confirms the delete path is wired up correctly end-to-end.
  //
  // New concept: seeding data via cy.window() instead of going through the UI.
  // For setup state that isn't what we're testing, going through the UI is slow
  // and adds noise. cy.window() gives us the real browser's window object.
  //
  it('shows an Undo button in the toast after deleting an entry', () => {
    // cy.window().then(win => { ... }) gives access to the real browser window.
    // We use it to pre-populate localStorage before visiting the page,
    // so we don't have to go through the Add UI just to set up the test.
    cy.window().then(win => {
      win.localStorage.setItem('media-journal-v1', JSON.stringify([{
        id: '1',
        name: 'The Godfather',
        type: 'Movie',
        rating: 5,
        thoughts: '',
        imageUrl: '',
        dateWatched: '2026-01-01',
        createdAt: '2026-01-01T00:00:00.000Z',
      }]));
    });

    // Reload so React picks up the seeded localStorage data.
    cy.reload();
    cy.contains('The Godfather').should('exist');

    // [aria-label="Delete entry"] targets the element with that exact aria-label.
    // It's the CSS equivalent of screen.getByLabelText('Delete entry') in RTL.
    cy.get('[aria-label="Delete entry"]').click();

    // The toast should appear. contains('button', 'Undo') finds a button with text "Undo".
    cy.contains('button', 'Undo').should('exist');
  });

  // ── E2E 4: Search filters entries in the real browser ─────────────────────
  //
  // We already have an integration test for search. So why test it here too?
  // Integration tests run in jsdom — they don't test whether React state updates
  // cause the right DOM re-renders in a real browser paint cycle.
  // This is a lightweight sanity check that the search feature works end-to-end.
  //
  it('filters entries as the user types in the search box', () => {
    cy.window().then(win => {
      win.localStorage.setItem('media-journal-v1', JSON.stringify([
        { id: '1', name: 'Dune', type: 'Movie', rating: 4, thoughts: '', imageUrl: '', dateWatched: '2026-01-01', createdAt: '2026-01-01T00:00:00.000Z' },
        { id: '2', name: 'Dune Part Two', type: 'Movie', rating: 5, thoughts: '', imageUrl: '', dateWatched: '2026-01-02', createdAt: '2026-01-02T00:00:00.000Z' },
        { id: '3', name: 'Oppenheimer', type: 'Movie', rating: 5, thoughts: '', imageUrl: '', dateWatched: '2026-01-03', createdAt: '2026-01-03T00:00:00.000Z' },
      ]));
    });

    cy.reload();

    // [placeholder*="titles"] matches the search input (placeholder="Search titles…").
    // .type() in Cypress fires real keyboard events, just like userEvent.type() in RTL.
    cy.get('input[placeholder*="titles"]').type('Dune');

    // .should('exist') and .should('not.exist') are Cypress's assertion methods.
    // They're equivalent to toBeInTheDocument() / not.toBeInTheDocument() in RTL.
    // Cypress automatically retries these for up to 4 seconds — great for async UI.
    cy.contains('Dune').should('exist');
    cy.contains('Dune Part Two').should('exist');
    cy.contains('Oppenheimer').should('not.exist');
  });
});
