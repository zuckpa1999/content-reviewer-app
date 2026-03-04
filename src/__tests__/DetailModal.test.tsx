import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DetailModal from '../DetailModal';
import type { MediaEntry } from '../types';

const mockEntry: MediaEntry = {
  id: '1',
  name: 'Spirited Away',
  imageUrl: '',
  dateWatched: '2026-01-15',
  rating: 5,
  thoughts: 'Absolute masterpiece.',
  type: 'Anime',
  createdAt: '2026-01-15T10:00:00.000Z',
};

describe('DetailModal', () => {
  it('renders the entry title', () => {
    render(<DetailModal entry={mockEntry} onClose={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Spirited Away')).toBeInTheDocument();
  });

  it('renders the type badge', () => {
    render(<DetailModal entry={mockEntry} onClose={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Anime')).toBeInTheDocument();
  });

  it('renders the thoughts', () => {
    render(<DetailModal entry={mockEntry} onClose={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Absolute masterpiece.')).toBeInTheDocument();
  });

  it('shows "No thoughts recorded." when thoughts is empty', () => {
    const entry = { ...mockEntry, thoughts: '' };
    render(<DetailModal entry={entry} onClose={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('No thoughts recorded.')).toBeInTheDocument();
  });

  it('renders the watched date in full format', () => {
    render(<DetailModal entry={mockEntry} onClose={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('January 15, 2026')).toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<DetailModal entry={mockEntry} onClose={onClose} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<DetailModal entry={mockEntry} onClose={onClose} onEdit={vi.fn()} onDelete={vi.fn()} />);
    // The backdrop is the first .absolute.inset-0 div
    fireEvent.click(document.querySelector('.absolute.inset-0.bg-black\\/80')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit with the entry when Edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<DetailModal entry={mockEntry} onClose={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByText('Edit Entry'));
    expect(onEdit).toHaveBeenCalledWith(mockEntry);
  });

  it('calls onDelete and onClose when Delete button is clicked', () => {
    const onDelete = vi.fn();
    const onClose = vi.fn();
    render(<DetailModal entry={mockEntry} onClose={onClose} onEdit={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith('1');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies fallback badge style for custom type', () => {
    const entry = { ...mockEntry, type: 'Book' };
    render(<DetailModal entry={entry} onClose={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    const badge = screen.getByText('Book');
    expect(badge.className).toContain('bg-dark-700');
  });
});
