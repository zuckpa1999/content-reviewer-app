interface ThoughtsSectionProps {
  thoughts: string;
  wordsLeft: number;
  maxWords: number;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ThoughtsSection({
  thoughts,
  wordsLeft,
  maxWords,
  error,
  onChange,
}: ThoughtsSectionProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor="thoughts" className="block text-sm font-medium text-dark-200">
          Thoughts
        </label>
        <span className={`text-xs font-medium tabular-nums ${wordsLeft <= 10 ? 'text-red-400' : 'text-dark-400'}`}>
          {wordsLeft} / {maxWords}
        </span>
      </div>
      <textarea
        id="thoughts"
        rows={4}
        value={thoughts}
        onChange={onChange}
        placeholder="Share your thoughts about this content…"
        className={`w-full px-4 py-3 rounded-xl bg-dark-700 border text-white placeholder:text-dark-400 text-sm
                    focus:outline-none focus:ring-1 transition-colors resize-none leading-relaxed
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40' : 'border-dark-600 focus:border-accent/60 focus:ring-accent/40'}`}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
