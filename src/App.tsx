import { useState, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, Search, SlidersHorizontal, X, Film, Sparkles } from 'lucide-react';
import type { MediaEntry, ContentType, SortOption } from './types';
import { useLocalStorage } from './useLocalStorage';
import MediaCard from './MediaCard';
import AddEntryModal from './AddEntryModal';
import DetailModal from './DetailModal';
import EmptyState from './EmptyState';

const BUILTIN_TYPES = ['Movie', 'TV Series', 'Anime'];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest first',   value: 'newest' },
  { label: 'Oldest first',   value: 'oldest' },
  { label: 'Highest rated',  value: 'rating-high' },
  { label: 'Lowest rated',   value: 'rating-low' },
  { label: 'A → Z',          value: 'name-az' },
];

export default function App() {
  const [entries, setEntries]             = useLocalStorage<MediaEntry[]>('media-journal-v1', []);
  const [customTypes, setCustomTypes]     = useLocalStorage<string[]>('media-journal-custom-types', []);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [editEntry, setEditEntry]         = useState<MediaEntry | null>(null);
  const [viewEntry, setViewEntry]         = useState<MediaEntry | null>(null);
  const [search, setSearch]               = useState('');
  const [filterType, setFilterType]       = useState<ContentType | 'All'>('All');
  const [sortBy, setSortBy]               = useState<SortOption>('newest');
  const [showFilters, setShowFilters]     = useState(false);

  const allTypes = useMemo(() => [...BUILTIN_TYPES, ...customTypes], [customTypes]);

  const filterTypes = useMemo(() => [
    { label: 'All', value: 'All' as const },
    ...allTypes.map(t => ({ label: t, value: t })),
  ], [allTypes]);

  /* ── Derived data ─────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let result = [...entries];

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(e => e.name.toLowerCase().includes(q));
    }

    // Type filter
    if (filterType !== 'All') {
      result = result.filter(e => e.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rating-high': return b.rating - a.rating;
        case 'rating-low':  return a.rating - b.rating;
        case 'name-az':     return a.name.localeCompare(b.name);
        default:            return 0;
      }
    });

    return result;
  }, [entries, search, filterType, sortBy]);

  const stats = useMemo(() => ({
    total: entries.length,
    avgRating: entries.length
      ? (entries.reduce((s, e) => s + e.rating, 0) / entries.length).toFixed(1)
      : '—',
  }), [entries]);

  /* ── Handlers ─────────────────────────────────────────────────── */
  const handleSave = (data: Omit<MediaEntry, 'id' | 'createdAt'>) => {
    if (editEntry) {
      setEntries(prev => prev.map(e =>
        e.id === editEntry.id ? { ...e, ...data } : e
      ));
      toast.success('Entry updated!');
      setEditEntry(null);
      setShowAddModal(false);
      if (viewEntry?.id === editEntry.id) {
        setViewEntry({ ...editEntry, ...data });
      }
    } else {
      const newEntry: MediaEntry = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setEntries(prev => [newEntry, ...prev]);
      toast.success('Entry added!');
      setShowAddModal(false);
    }
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    toast.success('Entry deleted');
    if (viewEntry?.id === id) setViewEntry(null);
  };

  const handleEdit = (entry: MediaEntry) => {
    setEditEntry(entry);
    setViewEntry(null);
    setShowAddModal(true);
  };

  const handleAddType = (type: string) => setCustomTypes(prev => [...prev, type]);
  const handleRemoveType = (type: string) => setCustomTypes(prev => prev.filter(t => t !== type));

  const openAdd = () => {
    setEditEntry(null);
    setShowAddModal(true);
  };

  const isFiltered = search.trim() !== '' || filterType !== 'All';

  return (
    <div className="min-h-dvh bg-dark-900">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#262626',
            color: '#d4d4d4',
            border: '1px solid #404040',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#e50914', secondary: '#fff' } },
        }}
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-dark-900/90 backdrop-blur-md border-b border-dark-700/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Film className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
              </div>
              <span className="font-black text-white text-lg tracking-tight">
                Media<span className="text-accent">Vault</span>
              </span>
            </div>

            {/* Add button */}
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-semibold text-sm
                         hover:bg-accent-hover active:scale-95 transition-all
                         focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-dark-900"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Entry</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">

        {/* ── Stats bar ────────────────────────────────────────── */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:gap-4 py-5 border-b border-dark-700/40">
            {[
              { label: 'Total',  value: stats.total,     icon: <Sparkles className="w-3.5 h-3.5" /> },
              { label: 'Avg ★',  value: stats.avgRating, icon: null },
            ].map(s => (
              <div key={s.label} className="bg-dark-800 rounded-xl p-3 sm:p-4 border border-dark-700/50 text-center">
                <div className="flex items-center justify-center gap-1 text-dark-400 text-xs mb-1">
                  {s.icon}
                  <span>{s.label}</span>
                </div>
                <p className="text-white font-bold text-lg sm:text-xl">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Search + Filter bar ──────────────────────────────── */}
        <div className="py-4 space-y-3">
          <div className="flex gap-2">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search titles…"
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-dark-800 border border-dark-700
                           text-white placeholder:text-dark-500 text-sm
                           focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(p => !p)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all
                          focus:outline-none focus:ring-2 focus:ring-accent/40
                          ${showFilters
                            ? 'bg-accent/10 border-accent/40 text-accent'
                            : 'bg-dark-800 border-dark-700 text-dark-300 hover:text-white hover:border-dark-600'
                          }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="space-y-3 animate-fade-in">
              {/* Type pills */}
              <div className="flex gap-2 flex-wrap">
                {filterTypes.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilterType(f.value)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all
                                ${filterType === f.value
                                  ? 'bg-accent text-white border-accent'
                                  : 'bg-dark-800 text-dark-300 border-dark-700 hover:text-white hover:border-dark-500'
                                }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Sort select */}
              <div className="flex items-center gap-2">
                <span className="text-dark-400 text-sm whitespace-nowrap">Sort by</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-dark-800 border border-dark-700
                             text-white text-sm focus:outline-none focus:border-accent/60 cursor-pointer
                             [color-scheme:dark]"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Result count */}
          {entries.length > 0 && (
            <p className="text-dark-500 text-xs">
              {isFiltered
                ? `${filtered.length} of ${entries.length} entries`
                : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`
              }
            </p>
          )}
        </div>

        {/* ── Content grid ─────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filtered.map(entry => (
              <MediaCard
                key={entry.id}
                entry={entry}
                onClick={() => setViewEntry(entry)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState onAdd={openAdd} isFiltered={isFiltered} />
        )}
      </main>

      {/* ── Modals ────────────────────────────────────────────── */}
      {showAddModal && (
        <AddEntryModal
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditEntry(null); }}
          editEntry={editEntry}
          customTypes={customTypes}
          onAddType={handleAddType}
          onRemoveType={handleRemoveType}
        />
      )}

      {viewEntry && (
        <DetailModal
          entry={viewEntry}
          onClose={() => setViewEntry(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
