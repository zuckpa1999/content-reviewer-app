import { useState, useEffect, useRef } from 'react';
import { X, ImageIcon, Star, Upload, Link, Plus, Check } from 'lucide-react';
import type { MediaEntry, ContentType } from './types';

interface Props {
  onSave: (entry: Omit<MediaEntry, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  editEntry?: MediaEntry | null;
  customTypes: string[];
  onAddType: (type: string) => void;
  onRemoveType: (type: string) => void;
}

const MAX_CHAR = 100;
const BUILTIN_TYPES = ['Movie', 'TV Series', 'Anime'];

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

const ratingLabels: Record<number, string> = {
  1: 'Shit',
  1.5: 'Bad',
  2: 'Eh',
  2.5: 'Meh',
  3: 'Good',
  3.5: 'Pretty Good',
  4: 'Great',
  4.5: 'I love it',
  5: 'Masterpiece',
};

function getRatingColor(rating: number): string {
  if (rating >= 3.5) return 'text-green-400';
  if (rating >= 2.5) return 'text-yellow-400';
  return 'text-red-400';
}

export default function AddEntryModal({ onSave, onClose, editEntry, customTypes, onAddType, onRemoveType }: Props) {
  const today = new Date().toISOString().split('T')[0];

  const [name, setName] = useState(editEntry?.name ?? '');
  const [imageUrl, setImageUrl] = useState(editEntry?.imageUrl ?? '');
  const [dateWatched, setDate] = useState(editEntry?.dateWatched ?? today);
  const [rating, setRating] = useState(editEntry?.rating ?? 3);
  const [thoughts, setThoughts] = useState(editEntry?.thoughts ?? '');
  const [type, setType] = useState<ContentType>(editEntry?.type ?? 'Movie');
  const [imageError, setImageError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [imageSource, setImageSource] = useState<'url' | 'file'>(
    editEntry?.imageUrl?.startsWith('data:') ? 'file' : 'url'
  );

  const [addingType, setAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const newTypeInputRef = useRef<HTMLInputElement>(null);

  const allTypes = [...BUILTIN_TYPES, ...customTypes];

  const firstInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  //const wordCount = countWords(thoughts);
  const wordsLeft = MAX_CHAR - thoughts.length;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    firstInputRef.current?.focus();
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (addingType) {
          setAddingType(false);
          setNewTypeName('');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, addingType]);

  useEffect(() => {
    if (addingType) newTypeInputRef.current?.focus();
  }, [addingType]);

  const handleConfirmNewType = () => {
    const trimmed = newTypeName.trim();
    if (!trimmed) return;
    if (allTypes.some(t => t.toLowerCase() === trimmed.toLowerCase())) return;
    onAddType(trimmed);
    setType(trimmed);
    setAddingType(false);
    setNewTypeName('');
  };

  const handleRemoveCustomType = (t: string) => {
    onRemoveType(t);
    if (type === t) setType('Movie');
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Title is required.';
    if (!dateWatched) errs.date = 'Date is required.';
    if (thoughts.length > MAX_CHAR) errs.thoughts = `Maximum ${MAX_CHAR} characters allowed.`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // if (!validate()) return;
    onSave({ name: name.trim(), imageUrl, dateWatched, rating, thoughts: thoughts.trim(), type });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setImageError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSourceSwitch = (source: 'url' | 'file') => {
    setImageSource(source);
    setImageUrl('');
    setImageError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleThoughtsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const words = countWords(val);
    if (words > MAX_CHAR) {
      const truncated = val.trim().split(/\s+/).slice(0, MAX_CHAR).join(' ');
      setThoughts(truncated);
    } else {
      setThoughts(val);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className="relative w-full sm:max-w-lg bg-dark-800 sm:rounded-2xl rounded-t-3xl
                      border border-dark-600/50 shadow-2xl overflow-hidden animate-slide-up
                      max-h-[95dvh] sm:max-h-[90vh] flex flex-col">

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-dark-500" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700">
          <h2 id="modal-title" className="text-lg font-bold text-white">
            {editEntry ? 'Edit Entry' : 'Add New Entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-dark-300 hover:text-white hover:bg-dark-700
                       transition-colors focus:outline-none focus:ring-2 focus:ring-accent/60"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-5 py-5 space-y-5">

            {/* Image preview */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-dark-700 border border-dark-600/50">
              {imageUrl && !imageError ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-dark-400">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-sm">Image preview</span>
                </div>
              )}
            </div>

            {/* Image source */}
            <div className="space-y-2">
              <div className="flex rounded-xl overflow-hidden border border-dark-600 bg-dark-700">
                <button
                  type="button"
                  onClick={() => handleSourceSwitch('url')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors
                              ${imageSource === 'url' ? 'bg-accent text-white' : 'text-dark-300 hover:text-white'}`}
                >
                  <Link className="w-3.5 h-3.5" /> URL
                </button>
                <button
                  type="button"
                  onClick={() => handleSourceSwitch('file')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors
                              ${imageSource === 'file' ? 'bg-accent text-white' : 'text-dark-300 hover:text-white'}`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </button>
              </div>

              {imageSource === 'url' ? (
                <input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => { setImageUrl(e.target.value); setImageError(false); }}
                  placeholder="https://example.com/poster.jpg"
                  className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600
                             text-white placeholder:text-dark-400 text-sm
                             focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40
                             transition-colors"
                />
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="fileUpload"
                  />
                  <label
                    htmlFor="fileUpload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl
                               bg-dark-700 border border-dashed border-dark-500 text-dark-300 text-sm
                               hover:border-accent/60 hover:text-white cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {imageUrl ? 'Change image…' : 'Choose image from device…'}
                  </label>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-dark-200">
                Title <span className="text-accent">*</span>
              </label>
              <input
                id="name"
                ref={firstInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Breaking Bad, Your Name…"
                className={`w-full px-4 py-3 rounded-xl bg-dark-700 border text-white placeholder:text-dark-400 text-sm
                            focus:outline-none focus:ring-1 transition-colors
                            ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40' : 'border-dark-600 focus:border-accent/60 focus:ring-accent/40'}`}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-dark-200">Type</label>
              <div className="flex flex-wrap gap-2">
                {allTypes.map((t) => {
                  const isCustom = !BUILTIN_TYPES.includes(t);
                  return (
                    <div key={t} className="relative">
                      <button
                        type="button"
                        onClick={() => setType(t)}
                        className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all duration-150
                                    ${isCustom ? 'pr-7' : ''}
                                    ${type === t
                            ? 'bg-accent text-white border-accent'
                            : 'bg-dark-700 text-dark-300 border-dark-600 hover:border-dark-400 hover:text-dark-100'
                          }`}
                      >
                        {t}
                      </button>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomType(t)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                          aria-label={`Remove ${t}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add type button / inline input */}
                {addingType ? (
                  <div className="flex items-center gap-1">
                    <input
                      ref={newTypeInputRef}
                      type="text"
                      value={newTypeName}
                      onChange={e => setNewTypeName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleConfirmNewType(); } }}
                      placeholder="Type name…"
                      className="py-2 px-3 rounded-xl bg-dark-700 border border-accent/60 text-white text-sm
                                 focus:outline-none focus:ring-1 focus:ring-accent/40 w-28"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmNewType}
                      className="p-2 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors"
                      aria-label="Confirm new type"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddingType(false); setNewTypeName(''); }}
                      className="p-2 rounded-xl bg-dark-700 border border-dark-600 text-dark-300 hover:text-white transition-colors"
                      aria-label="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingType(true)}
                    className="py-2 px-3 rounded-xl text-sm font-medium border border-dashed
                               border-dark-500 text-dark-400 hover:border-dark-300 hover:text-dark-100
                               transition-all duration-150 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add type
                  </button>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="date" className="block text-sm font-medium text-dark-200">
                Date Watched <span className="text-accent">*</span>
              </label>
              <input
                id="date"
                type="date"
                value={dateWatched}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-dark-700 border text-white text-sm
                            focus:outline-none focus:ring-1 transition-colors
                            [color-scheme:dark]
                            ${errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40' : 'border-dark-600 focus:border-accent/60 focus:ring-accent/40'}`}
              />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
            </div>

            {/* Rating slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="rating" className="block text-sm font-medium text-dark-200">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold text-lg leading-none">{rating}</span>
                  <span className="text-dark-400 text-sm">/ 5</span>
                  <span className={`${getRatingColor(rating)} text-sm font-medium`}>{ratingLabels[rating]}</span>
                </div>
              </div>
              <input
                id="rating"
                type="range"
                min={1}
                max={5}
                step={0.5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-xs text-dark-400 px-0.5">
                {[1, 1.5, 2.5, 3.5, 5].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>

            {/* Thoughts */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="thoughts" className="block text-sm font-medium text-dark-200">
                  Thoughts
                </label>
                <span className={`text-xs font-medium tabular-nums ${wordsLeft <= 10 ? 'text-red-400' : 'text-dark-400'}`}>
                  {wordsLeft} / {MAX_CHAR}
                </span>
              </div>
              <textarea
                id="thoughts"
                rows={4}
                value={thoughts}
                onChange={handleThoughtsChange}
                placeholder="Share your thoughts about this content…"
                className={`w-full px-4 py-3 rounded-xl bg-dark-700 border text-white placeholder:text-dark-400 text-sm
                            focus:outline-none focus:ring-1 transition-colors resize-none leading-relaxed
                            ${errors.thoughts ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40' : 'border-dark-600 focus:border-accent/60 focus:ring-accent/40'}`}
              />
              {errors.thoughts && <p className="text-red-400 text-xs">{errors.thoughts}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-dark-700 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-dark-600 text-dark-200 font-medium text-sm
                         hover:bg-dark-700 hover:text-white transition-colors
                         focus:outline-none focus:ring-2 focus:ring-dark-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-accent text-white font-semibold text-sm
                         hover:bg-accent-hover active:scale-95 transition-all
                         focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-dark-800"
            >
              {editEntry ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
