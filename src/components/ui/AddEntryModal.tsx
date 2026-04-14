import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { MediaEntry, ContentType } from '../../types';
import { countWords } from '@/utils/util';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ImageSection } from './AddEntryModal/ImageSection';
import { TypeSelector } from './AddEntryModal/TypeSelector';
import { RatingSection } from './AddEntryModal/RatingSection';
import { ThoughtsSection } from './AddEntryModal/ThoughtsSection';
import { useTextArea } from '@/hooks/useTextArea';

interface Props {
  onSave: (entry: MediaEntry) => void;
  onClose: () => void;
  editEntry?: MediaEntry | null;
  customTypes: string[];
  onAddType: (type: string) => void;
  onRemoveType: (type: string) => void;
}

const THOUGHTS_MAX_WORDS = 100;
const BUILTIN_CONTENT_TYPES: ContentType[] = ['Movie', 'TV Series', 'Anime'];

export default function AddEntryModal({ onSave, onClose, editEntry, customTypes, onAddType, onRemoveType }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState(editEntry?.name ?? '');
  const [dateWatched, setDate] = useState(editEntry?.dateWatched ?? today);
  const [rating, setRating] = useState(editEntry?.rating ?? 3);
  const [type, setType] = useState<ContentType>(editEntry?.type ?? 'Movie');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    imageUrl,
    imageError,
    imageSource,
    fileInputRef,
    handleFileUpload,
    handleImageUrlChange,
    switchSource: handleSourceSwitch,
  } = useImageUpload({
    initialImageUrl: editEntry?.imageUrl ?? '',
    initialIsFile: editEntry?.imageUrl?.startsWith('data:') ?? false,
  });

  const {
    thoughts,
    wordsLeft,
    handleThoughtsChange,
  } = useTextArea({
    initialThoughts: editEntry?.thoughts ?? '',
    maxWords: THOUGHTS_MAX_WORDS,
  })

  const [addingType, setAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const newTypeInputRef = useRef<HTMLInputElement>(null);
  const allTypes = [...BUILTIN_CONTENT_TYPES, ...customTypes];
  const firstInputRef = useRef<HTMLInputElement>(null);

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
    if (countWords(thoughts) > THOUGHTS_MAX_WORDS) errs.thoughts = `Maximum ${THOUGHTS_MAX_WORDS} words allowed.`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ name: name.trim(), imageUrl, dateWatched, rating, thoughts: thoughts.trim(), type, createdAt: editEntry?.createdAt ?? new Date().toISOString(), id: editEntry?.id ?? '' });
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

            {/* Image section */}
            <ImageSection
              imageUrl={imageUrl}
              imageError={imageError}
              imageSource={imageSource}
              fileInputRef={fileInputRef}
              onImageUrlChange={handleImageUrlChange}
              onFileUpload={handleFileUpload}
              onSourceSwitch={handleSourceSwitch}
            />

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

            {/* Type selector */}
            <TypeSelector
              type={type}
              allTypes={allTypes}
              builtinTypes={BUILTIN_CONTENT_TYPES}
              addingType={addingType}
              newTypeName={newTypeName}
              newTypeInputRef={newTypeInputRef}
              onTypeChange={setType}
              onRemoveCustomType={handleRemoveCustomType}
              onAddingTypeToggle={setAddingType}
              onNewTypeNameChange={setNewTypeName}
              onConfirmNewType={handleConfirmNewType}
            />

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
            <RatingSection
              rating={rating}
              onRatingChange={setRating}
            />

            <ThoughtsSection
              thoughts={thoughts}
              wordsLeft={wordsLeft}
              maxWords={THOUGHTS_MAX_WORDS}
              error={errors.thoughts}
              onChange={handleThoughtsChange}
            />
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

// todo - refactor. the file is too big and has too many responsibilities. split into smaller components and use context for shared state like types.
