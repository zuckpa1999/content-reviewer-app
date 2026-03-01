import { format } from 'date-fns';
import { Calendar, Trash2 } from 'lucide-react';
import type { MediaEntry } from './types';
import StarRating from './StarRating';

interface Props {
  entry: MediaEntry;
  onClick: () => void;
  onDelete: (id: string) => void;
}

const typeBadgeColor: Record<string, string> = {
  'Movie':     'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'TV Series': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Anime':     'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

export default function MediaCard({ entry, onClick, onDelete }: Props) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(entry.id);
  };

  return (
    <article
      onClick={onClick}
      className="group relative bg-dark-800 rounded-2xl overflow-hidden border border-dark-600/40
                 cursor-pointer transition-all duration-300
                 hover:border-dark-500/70 hover:shadow-2xl hover:shadow-black/50
                 hover:-translate-y-1 active:scale-[0.98] animate-scale-in"
    >
      {/* Poster Image */}
      <div className="relative overflow-hidden aspect-[2/3] w-full bg-dark-700">
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt={entry.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/95 via-dark-900/20 to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${typeBadgeColor[entry.type] ?? 'bg-dark-700/80 text-dark-200 border-dark-500/40'}`}>
            {entry.type}
          </span>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          aria-label="Delete entry"
          className="absolute top-3 right-3 p-1.5 rounded-full bg-dark-900/70 border border-dark-600/50
                     text-dark-300 opacity-0 group-hover:opacity-100 transition-all duration-200
                     hover:bg-accent/20 hover:text-accent hover:border-accent/40 active:scale-90
                     focus:outline-none focus:ring-2 focus:ring-accent/60"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 mb-2 drop-shadow-md">
            {entry.name}
          </h3>
          <div className="flex items-center justify-between">
            <StarRating rating={entry.rating} size="sm" />
            <div className="flex items-center gap-1 text-dark-300 text-xs">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(entry.dateWatched), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
