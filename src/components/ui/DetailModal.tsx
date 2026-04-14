import { useEffect } from 'react';
import { X, Calendar, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { MediaEntry } from '../../types';
import StarRating from './StarRating';

interface Props {
  entry: MediaEntry;
  onClose: () => void;
  onEdit: (entry: MediaEntry) => void;
  onDelete: (id: string) => void;
}

const typeBadgeColor: Record<string, string> = {
  'Movie': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'TV Series': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Anime': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

const ratingLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Poor', color: 'text-red-400' },
  2: { label: 'Fair', color: 'text-orange-400' },
  3: { label: 'Good', color: 'text-yellow-400' },
  4: { label: 'Great', color: 'text-lime-400' },
  5: { label: 'Masterpiece', color: 'text-green-400' },
};

export default function DetailModal({ entry, onClose, onEdit, onDelete }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDelete = () => {
    onDelete(entry.id);
    onClose();
  };

  const ratingInfo = ratingLabels[entry.rating] ?? ratingLabels[3];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
      aria-labelledby="detail-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-dark-800 sm:rounded-2xl rounded-t-3xl
                      border border-dark-600/50 shadow-2xl overflow-hidden animate-slide-up
                      max-h-[95dvh] sm:max-h-[90vh] flex flex-col">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-dark-500" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">

          {/* Hero image */}
          <div className="relative w-full aspect-video bg-dark-900">
            {entry.imageUrl ? (
              <img
                src={entry.imageUrl}
                alt={entry.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-dark-500">
                <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
            )}
            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-dark-800/10 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-dark-900/70 border border-dark-600/50
                         text-dark-300 hover:text-white hover:bg-dark-800 transition-all
                         focus:outline-none focus:ring-2 focus:ring-accent/60"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 pb-2 -mt-4 relative">

            {/* Type badge */}
            <div className="mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeBadgeColor[entry.type] ?? 'bg-dark-700 text-dark-300 border-dark-600'}`}>
                {entry.type}
              </span>
            </div>

            {/* Title */}
            <h2 id="detail-title" className="text-2xl font-black text-white leading-tight mb-4">
              {entry.name}
            </h2>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Rating */}
              <div className="bg-dark-700/60 rounded-xl p-3.5 border border-dark-600/40">
                <p className="text-dark-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Rating</p>
                <StarRating rating={entry.rating} size="md" />
                <p className={`text-sm font-semibold mt-1 ${ratingInfo.color}`}>
                  {entry.rating}/5 — {ratingInfo.label}
                </p>
              </div>

              {/* Date */}
              <div className="bg-dark-700/60 rounded-xl p-3.5 border border-dark-600/40">
                <p className="text-dark-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Watched</p>
                <div className="flex items-center gap-1.5 text-white">
                  <Calendar className="w-4 h-4 text-dark-400" />
                  <span className="text-sm font-semibold">
                    {format(new Date(entry.dateWatched), 'MMMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Thoughts */}
            {entry.thoughts ? (
              <div className="mb-5">
                <p className="text-dark-400 text-xs font-medium mb-2 uppercase tracking-wide">My Thoughts</p>
                <p className="text-dark-100 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.thoughts}
                </p>
              </div>
            ) : (
              <div className="mb-5">
                <p className="text-dark-500 text-sm italic">No thoughts recorded.</p>
              </div>
            )}

            {/* Added on */}
            <p className="text-dark-500 text-xs mb-5">
              Added {format(new Date(entry.createdAt), 'MMM d, yyyy · h:mm a')}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-dark-700 flex gap-3">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-accent border-dark-600 text-dark-300 font-medium text-sm
                       hover:bg-accent-hover text-white
                      focus:outline-none focus:ring-2 focus:ring-red-500/40"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={() => onEdit(entry)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-dark-700 text-white font-medium text-sm
                       hover:bg-dark-600 transition-colors border border-dark-600
                       focus:outline-none focus:ring-2 focus:ring-dark-400"
          >
            <Edit2 className="w-4 h-4" />
            Edit Entry
          </button>
        </div>
      </div>
    </div>
  );
}
