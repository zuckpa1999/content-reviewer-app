import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MediaCard from '../components/ui/MediaCard';
import type { MediaEntry } from '../types';

const mockEntry: MediaEntry = {
  id: '1',
  name: 'Breaking Bad',
  imageUrl: '',
  dateWatched: '2026-01-15',
  rating: 4.5,
  thoughts: 'Amazing show',
  type: 'TV Series',
  createdAt: '2026-01-15T10:00:00.000Z',
};

describe('MediaCard', () => {
  it('renders the entry name', () => {
    render(<MediaCard entry={mockEntry} onClick={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
  });

  it('renders the type badge', () => {
    render(<MediaCard entry={mockEntry} onClick={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('TV Series')).toBeInTheDocument();
  });

  it('renders the watched date', () => {
    render(<MediaCard entry={mockEntry} onClick={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument();
  });

  it('calls onClick when the card is clicked', () => {
    const onClick = vi.fn();
    render(<MediaCard entry={mockEntry} onClick={onClick} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('article'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete with the entry id when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<MediaCard entry={mockEntry} onClick={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText('Delete entry'));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('does not call onClick when delete button is clicked', () => {
    const onClick = vi.fn();
    render(<MediaCard entry={mockEntry} onClick={onClick} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Delete entry'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders poster image when imageUrl is provided', () => {
    const entry = { ...mockEntry, imageUrl: 'https://example.com/poster.jpg' };
    render(<MediaCard entry={entry} onClick={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByAltText('Breaking Bad')).toHaveAttribute('src', 'https://example.com/poster.jpg');
  });

  it('applies fallback badge style for custom/unknown type', () => {
    const entry = { ...mockEntry, type: 'Book' };
    render(<MediaCard entry={entry} onClick={vi.fn()} onDelete={vi.fn()} />);
    const badge = screen.getByText('Book');
    expect(badge.className).toContain('bg-dark-700/80');
  });

  it('applies correct badge colour for Movie type', () => {
    const entry = { ...mockEntry, type: 'Movie' };
    render(<MediaCard entry={entry} onClick={vi.fn()} onDelete={vi.fn()} />);
    const badge = screen.getByText('Movie');
    expect(badge.className).toContain('text-blue-300');
  });

  it('applies correct badge colour for Anime type', () => {
    const entry = { ...mockEntry, type: 'Anime' };
    render(<MediaCard entry={entry} onClick={vi.fn()} onDelete={vi.fn()} />);
    const badge = screen.getByText('Anime');
    expect(badge.className).toContain('text-pink-300');
  });
});
