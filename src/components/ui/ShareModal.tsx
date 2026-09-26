import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  sharedUserId: string | null;
  onClose: () => void;
}

export default function ShareModal({ sharedUserId, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const link = `${window.location.origin}/?sharedUserId=${sharedUserId}`;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy link');
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
      aria-labelledby="share-title"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-dark-800 rounded-2xl border border-dark-600/50
                      shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700/80">
          <h2 id="share-title" className="text-white text-base font-semibold">Share this list</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-dark-300 hover:text-white hover:bg-dark-700 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-accent/60"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-dark-400 text-sm mb-3">
            Anyone with this link can view your list in read-only mode.
          </p>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              readOnly
              value={link}
              onFocus={(e) => e.target.select()}
              className="flex-1 min-w-0 bg-dark-900 border border-dark-600/60 rounded-xl px-3 py-2.5
                         text-sm text-dark-100 truncate focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium
                         hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40
                         flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
