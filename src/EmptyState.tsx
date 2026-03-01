interface Props {
  onAdd: () => void;
  isFiltered?: boolean;
}

export default function EmptyState({ onAdd, isFiltered }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      </div>

      {isFiltered ? (
        <>
          <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
          <p className="text-dark-400 text-sm max-w-xs">
            Try changing your filters or search query.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-xl font-bold text-white mb-2">Your journal is empty</h3>
          <p className="text-dark-400 text-sm max-w-xs mb-8">
            Start tracking the movies, series, and anime you've watched. Your thoughts deserve a home.
          </p>
          <button
            onClick={onAdd}
            className="px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm
                       hover:bg-accent-hover active:scale-95 transition-all
                       focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-dark-900"
          >
            Add Your First Entry
          </button>
        </>
      )}
    </div>
  );
}
