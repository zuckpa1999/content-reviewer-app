import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import App from '../App';
import type { MediaEntry } from '../types';

// ── Mock react-hot-toast ──────────────────────────────────────────────────────
// Captures the render function passed to toast() so undo can be tested.
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

// ── Shared fixtures ───────────────────────────────────────────────────────────
const entry1: MediaEntry = {
  id: '1',
  name: 'Breaking Bad',
  imageUrl: '',
  dateWatched: '2026-01-15',
  rating: 5,
  thoughts: 'Best show ever',
  type: 'TV Series',
  createdAt: '2026-01-15T10:00:00.000Z',
};

const entry2: MediaEntry = {
  id: '2',
  name: 'Spirited Away',
  imageUrl: '',
  dateWatched: '2026-01-20',
  rating: 3,
  thoughts: 'Great film',
  type: 'Anime',
  createdAt: '2026-01-20T10:00:00.000Z',
};

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    capturedToastFn = null;
    vi.clearAllMocks();
  });

  // ── Empty state ───────────────────────────────────────────────

  it('shows the empty state when there are no entries', () => {
    render(<App />);
    expect(screen.getByText('Your journal is empty')).toBeInTheDocument();
  });

  it('does not show the stats bar when there are no entries', () => {
    render(<App />);
    expect(screen.queryByText('Total entries')).not.toBeInTheDocument();
  });

  // ── Populated state ───────────────────────────────────────────

  it('renders entries loaded from localStorage', () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry1, entry2]));
    render(<App />);
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('Spirited Away')).toBeInTheDocument();
  });

  it('shows the stats bar when entries exist', () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry1]));
    render(<App />);
    expect(screen.getByText('Total entries')).toBeInTheDocument();
  });

  // ── Search ────────────────────────────────────────────────────

  it('filters entries by search query', async () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry1, entry2]));
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByPlaceholderText('Search titles…'), 'Breaking');
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.queryByText('Spirited Away')).not.toBeInTheDocument();
  });

  it('shows "No results found" when search matches nothing', async () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry1]));
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByPlaceholderText('Search titles…'), 'xyzzy');
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('clears search when the × button is clicked', async () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry1, entry2]));
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByPlaceholderText('Search titles…'), 'Breaking');
    await user.click(screen.getByRole('button', { name: '' })); // × clear button
    expect(screen.getByText('Spirited Away')).toBeInTheDocument();
  });

  // ── Type filter ───────────────────────────────────────────────

  it('filters entries by type', async () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry1, entry2]));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Filter/ }));
    await user.click(screen.getByRole('button', { name: 'Anime' }));
    expect(screen.queryByText('Breaking Bad')).not.toBeInTheDocument();
    expect(screen.getByText('Spirited Away')).toBeInTheDocument();
  });

  it('shows all entries when "All" filter is selected', async () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry1, entry2]));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Filter/ }));
    await user.click(screen.getByRole('button', { name: 'Anime' }));
    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('Spirited Away')).toBeInTheDocument();
  });

  // ── Sorting ───────────────────────────────────────────────────

  it('sorts entries by lowest rating', async () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry1, entry2]));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Filter/ }));
    await user.selectOptions(screen.getByRole('combobox'), 'rating-low');
    const cards = screen.getAllByRole('article');
    expect(within(cards[0]).getByText('Spirited Away')).toBeInTheDocument();
    expect(within(cards[1]).getByText('Breaking Bad')).toBeInTheDocument();
  });

  it('sorts entries alphabetically A→Z', async () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry2, entry1]));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Filter/ }));
    await user.selectOptions(screen.getByRole('combobox'), 'name-az');
    const cards = screen.getAllByRole('article');
    expect(within(cards[0]).getByText('Breaking Bad')).toBeInTheDocument();
    expect(within(cards[1]).getByText('Spirited Away')).toBeInTheDocument();
  });

  // ── Delete & Undo ─────────────────────────────────────────────

  it('removes an entry when its delete button is clicked', () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry1]));
    render(<App />);
    fireEvent.click(screen.getByLabelText('Delete entry'));
    expect(screen.queryByText('Breaking Bad')).not.toBeInTheDocument();
  });

  it('shows the undo toast after deletion', () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry1]));
    render(<App />);
    fireEvent.click(screen.getByLabelText('Delete entry'));
    expect(capturedToastFn).not.toBeNull();
  });

  it('restores the entry when Undo is clicked in the toast', () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry1]));
    render(<App />);
    fireEvent.click(screen.getByLabelText('Delete entry'));
    expect(screen.queryByText('Breaking Bad')).not.toBeInTheDocument();

    // Render the toast content and click Undo
    const toastContent = render(capturedToastFn!({ id: 'mock-id' }));
    fireEvent.click(toastContent.getByText('Undo'));
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
  });

  // ── Add entry ─────────────────────────────────────────────────

  it('opens the add modal when "Add Your First Entry" is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Add Your First Entry' }));
    expect(screen.getByText('Add New Entry')).toBeInTheDocument();
  });

  it('adds a new entry when the form is submitted', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Add Your First Entry' }));
    const dialog = screen.getByRole('dialog');
    await user.type(screen.getByPlaceholderText(/Breaking Bad/), 'Inception');
    await user.click(within(dialog).getByRole('button', { name: 'Add Entry' }));
    expect(screen.getByText('Inception')).toBeInTheDocument();
  });

  // ── Edit entry ────────────────────────────────────────────────

  it('opens the detail modal when a card is clicked', async () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry1]));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('article'));
    expect(screen.getByText('Edit Entry')).toBeInTheDocument();
  });

  it('opens the edit form pre-filled when Edit is clicked in DetailModal', async () => {
    localStorage.setItem('media-journal-v1', JSON.stringify([entry1]));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('article'));
    await user.click(screen.getByText('Edit Entry'));
    expect(screen.getByDisplayValue('Breaking Bad')).toBeInTheDocument();
  });
});
