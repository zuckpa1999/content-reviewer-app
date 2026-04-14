import { useState, useMemo, useRef, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, Search, SlidersHorizontal, X, Film, Sparkles, LogOut, ChevronDown } from 'lucide-react';
import type { MediaEntry, ContentType, SortOption, SupabaseEntry } from './types';
import { useLocalStorage } from './useLocalStorage';
import { useAuth, getUserInitials } from './AuthContext';
import type { User } from './AuthContext';
import MediaCard from './MediaCard';
import AddEntryModal from './AddEntryModal';
import DetailModal from './DetailModal';
import EmptyState from './EmptyState';
import LoginScreen from './LoginScreen';
import { initialData } from './initialData';
import { supabase } from '../supabaseClient';
import { formatToSupabaseEntry } from './lib/supabase/util';
function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-dark-800
                   transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
        aria-label="Account menu"
      >
        <div className="w-7 h-7 rounded-full bg-accent ring-2 ring-accent/25 flex items-center justify-center
                        text-white text-xs font-black select-none flex-shrink-0">
          {getUserInitials(user)}
        </div>
        <span className="hidden sm:block text-sm font-medium text-dark-100">{user.firstName}</span>
        <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-dark-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-dark-800 rounded-xl border border-dark-700
                        shadow-xl shadow-black/50 overflow-hidden animate-scale-in z-50">
          <div className="px-4 py-3.5 border-b border-dark-700/80">
            <p className="text-white text-sm font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-dark-400 text-xs mt-0.5 truncate">{user.email}</p>
          </div>
          <div className="p-1.5">
            <button
              onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-dark-300
                         hover:text-white hover:bg-dark-700 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const BUILTIN_TYPES = ['Movie', 'TV Series', 'Anime'];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Highest rated', value: 'rating-high' },
  { label: 'Lowest rated', value: 'rating-low' },
  { label: 'A → Z', value: 'name-az' },
];

export default function App() {
  const { user, logout } = useAuth();
  const [entries, setEntries] = useLocalStorage<MediaEntry[]>('media-journal-v1', initialData);
  const [customTypes, setCustomTypes] = useLocalStorage<string[]>('media-journal-custom-types', []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEntry, setEditEntry] = useState<MediaEntry | null>(null);
  const [viewEntry, setViewEntry] = useState<MediaEntry | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const allTypes = useMemo(() => [...BUILTIN_TYPES, ...customTypes], [customTypes]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('media_entries').select('*');
      if (error) {
        console.error('Error fetching data:', error);
      }

      if (data && data) {
        console.log("data", data);

        const formattedData = data.map((entry: SupabaseEntry) => ({
          id: entry.id,
          name: entry.name,
          imageUrl: entry.image_url,
          dateWatched: entry.date_watched,
          rating: entry.rating,
          thoughts: entry.thoughts,
          type: entry.type,
          createdAt: entry.created_at,
        }));
        setEntries(formattedData as MediaEntry[]);
      }
    };
    fetchData();
  }, []);

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
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rating-high': return b.rating - a.rating;
        case 'rating-low': return a.rating - b.rating;
        case 'name-az': return a.name.localeCompare(b.name);
        default: return 0;
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
  const handleSave = async (data: MediaEntry) => {
    if (editEntry) {
      setEntries(prev => prev.map(e =>
        e.id === editEntry.id ? { ...e, ...data } : e
      ));

      const response = await supabase.from('media_entries')
        .update(formatToSupabaseEntry(data, user?.id || '')).eq('id', editEntry.id);

      if (response.success) {
        toast.success('Entry updated!');
        setEditEntry(null);
        setShowAddModal(false);
      } else {
        console.error('Error updating entry:', response.error);
        toast.error(response.error.name);
      }

      if (viewEntry?.id === editEntry.id) {
        setViewEntry({ ...editEntry, ...data });
      }
    } else {
      const newEntry: MediaEntry = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      console.log("newEntry", newEntry);
      const response = await supabase.from('media_entries').insert(formatToSupabaseEntry(newEntry, user?.id || ''));
      if (response.success) {
        setEntries(prev => [newEntry, ...prev]);
        toast.success('Entry added!');
        setShowAddModal(false);
      } else {
        console.error('Error adding entry:', response.error);
        toast.error(response.error.name);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const idx = entries.findIndex(e => e.id === id);
    const deleted = entries[idx];

    setEntries(prev => prev.filter(e => e.id !== id));
    if (viewEntry?.id === id) setViewEntry(null);

    const restore = () => {
      setEntries(curr => {
        const next = [...curr];
        next.splice(idx, 0, deleted);
        return next;
      });
    };

    const response = await supabase.from('media_entries').delete().eq('id', id);
    if (response.success) {
      toast((t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Entry deleted</span>
          <button
            onClick={() => { restore(); toast.dismiss(t.id); }}
            style={{
              background: '#e50914',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Undo
          </button>
        </div>
      ), { duration: 5000 });
    } else {
      console.error('Error deleting entry:', response.error);
      toast.error(response.error.name);
    }
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

  // Auth gate — placed after all hooks so Rules of Hooks are satisfied
  if (!user) return <LoginScreen />;

  const isFiltered = search.trim() !== '' || filterType !== 'All';

  const bigBanner = [
    { label: 'Total entries', value: stats.total, icon: <Film className="w-4 h-4" /> },
    { label: 'Average rating', value: stats.avgRating, icon: <Sparkles className="w-4 h-4" /> },
  ];

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

            {/* Right side: Add button + user */}
            <div className="flex items-center gap-3">
              <button
                onClick={openAdd}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-semibold text-sm
                           hover:bg-accent-hover active:scale-95 transition-all
                           focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-dark-900"
              >
                <Plus className="w-4 h-4" />
                <span>Add Entry</span>
              </button>
              <UserMenu user={user} onLogout={logout} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">

        {/* ── Stats bar ────────────────────────────────────────── */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:gap-4 py-5 border-b border-dark-700/40">
            {bigBanner.map(s => (
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
                  aria-label="Clear search"
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

      {/* ── Mobile FAB ────────────────────────────────────────── */}
      <div className="sm:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={openAdd}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-accent text-white
                     shadow-lg shadow-accent/40 hover:bg-accent-hover active:scale-95 transition-all
                     focus:outline-none focus:ring-2 focus:ring-accent/60"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
