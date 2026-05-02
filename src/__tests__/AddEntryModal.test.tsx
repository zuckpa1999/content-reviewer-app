import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddEntryModal from '../components/ui/AddEntryModal';
import type { MediaEntry } from '../types';

const defaultProps = {
  onSave: vi.fn(),
  onClose: vi.fn(),
  editEntry: null,
  customTypes: [],
  onAddType: vi.fn(),
  onRemoveType: vi.fn(),
};

const mockEntry: MediaEntry = {
  id: '1',
  name: 'Your Name',
  imageUrl: '',
  dateWatched: '2026-01-15',
  rating: 4,
  thoughts: 'Beautiful film',
  type: 'Anime',
  createdAt: '2026-01-15T10:00:00.000Z',
};


describe('AddEntryModal', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Validation ────────────────────────────────────────────────

  it('shows validation error when title is empty on submit', async () => {
    const user = userEvent.setup();
    render(<AddEntryModal {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: 'Add Entry' }));
    expect(screen.getByText('Title is required.')).toBeInTheDocument();
  });

  it('does not call onSave when title is empty', async () => {
    const user = userEvent.setup();
    render(<AddEntryModal {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: 'Add Entry' }));
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  // ── Valid submit ──────────────────────────────────────────────

  it('calls onSave with correct data on valid submit', async () => {
    const user = userEvent.setup();
    render(<AddEntryModal {...defaultProps} />);
    await user.type(screen.getByPlaceholderText(/Breaking Bad/), 'Inception');
    await user.click(screen.getByRole('button', { name: 'Add Entry' }));
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Inception', type: 'Movie' })
    );
  });

  it('trims whitespace from title before saving', async () => {
    const user = userEvent.setup();
    render(<AddEntryModal {...defaultProps} />);
    await user.type(screen.getByPlaceholderText(/Breaking Bad/), '  Inception  ');
    await user.click(screen.getByRole('button', { name: 'Add Entry' }));
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Inception' })
    );
  });

  // ── Edit mode ─────────────────────────────────────────────────

  it('pre-fills title when editEntry is provided', () => {
    render(<AddEntryModal {...defaultProps} editEntry={mockEntry} />);
    expect(screen.getByDisplayValue('Your Name')).toBeInTheDocument();
  });

  it('pre-selects the correct type in edit mode', () => {
    render(<AddEntryModal {...defaultProps} editEntry={mockEntry} />);
    const animeBtn = screen.getByRole('button', { name: 'Anime' });
    expect(animeBtn.className).toContain('bg-accent');
  });

  it('shows "Save Changes" button in edit mode', () => {
    render(<AddEntryModal {...defaultProps} editEntry={mockEntry} />);
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  // ── Type selector ─────────────────────────────────────────────

  it('renders all three built-in types', () => {
    render(<AddEntryModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Movie' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'TV Series' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anime' })).toBeInTheDocument();
  });

  it('renders custom types as selectable buttons', () => {
    render(<AddEntryModal {...defaultProps} customTypes={['Book', 'Podcast']} />);
    expect(screen.getByRole('button', { name: 'Book' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Podcast' })).toBeInTheDocument();
  });

  it('selects a type when its button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddEntryModal {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: 'Anime' }));
    expect(screen.getByRole('button', { name: 'Anime' }).className).toContain('bg-accent');
  });

  // ── Add custom type ────────────────────────────────────────────

  it('reveals input when "+ Add type" is clicked', async () => {
    const user = userEvent.setup();
    render(<AddEntryModal {...defaultProps} />);
    await user.click(screen.getByText('Add type'));
    expect(screen.getByPlaceholderText('Type name…')).toBeInTheDocument();
  });

  it('calls onAddType with the new type name on Enter', async () => {
    const user = userEvent.setup();
    render(<AddEntryModal {...defaultProps} />);
    await user.click(screen.getByText('Add type'));
    await user.type(screen.getByPlaceholderText('Type name…'), 'Book');
    await user.keyboard('{Enter}');
    expect(defaultProps.onAddType).toHaveBeenCalledWith('Book');
  });

  it('calls onAddType when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddEntryModal {...defaultProps} />);
    await user.click(screen.getByText('Add type'));
    await user.type(screen.getByPlaceholderText('Type name…'), 'Podcast');
    await user.click(screen.getByLabelText('Confirm new type'));
    expect(defaultProps.onAddType).toHaveBeenCalledWith('Podcast');
  });

  it('does not call onAddType for an empty name', async () => {
    const user = userEvent.setup();
    render(<AddEntryModal {...defaultProps} />);
    await user.click(screen.getByText('Add type'));
    await user.keyboard('{Enter}');
    expect(defaultProps.onAddType).not.toHaveBeenCalled();
  });

  it('does not call onAddType for a duplicate custom type', async () => {
    const user = userEvent.setup();
    render(<AddEntryModal {...defaultProps} customTypes={['Book']} />);
    await user.click(screen.getByText('Add type'));
    await user.type(screen.getByPlaceholderText('Type name…'), 'Book');
    await user.keyboard('{Enter}');
    expect(defaultProps.onAddType).not.toHaveBeenCalled();
  });

  it('does not call onAddType for a duplicate built-in type', async () => {
    const user = userEvent.setup();
    render(<AddEntryModal {...defaultProps} />);
    await user.click(screen.getByText('Add type'));
    await user.type(screen.getByPlaceholderText('Type name…'), 'Movie');
    await user.keyboard('{Enter}');
    expect(defaultProps.onAddType).not.toHaveBeenCalled();
  });

  // ── Remove custom type ─────────────────────────────────────────

  it('calls onRemoveType when × is clicked on a custom type', async () => {
    const user = userEvent.setup();
    render(<AddEntryModal {...defaultProps} customTypes={['Book']} />);
    await user.click(screen.getByLabelText('Remove Book'));
    expect(defaultProps.onRemoveType).toHaveBeenCalledWith('Book');
  });

  it('does not show remove button on built-in types', () => {
    render(<AddEntryModal {...defaultProps} />);
    expect(screen.queryByLabelText('Remove Movie')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Remove Anime')).not.toBeInTheDocument();
  });

  // ── Escape behaviour ──────────────────────────────────────────

  it('calls onClose when Escape is pressed (not in add-type mode)', () => {
    render(<AddEntryModal {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('cancels add-type input on Escape without closing the modal', async () => {
    const user = userEvent.setup();
    render(<AddEntryModal {...defaultProps} />);
    await user.click(screen.getByText('Add type'));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText('Type name…')).not.toBeInTheDocument();
  });
});
