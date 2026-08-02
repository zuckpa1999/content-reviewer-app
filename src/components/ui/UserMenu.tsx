import { ChevronDown, LogOut, Share } from "lucide-react";
import type { User } from '../../types';
import { getUserInitials } from "@/utils/util";
import { useState, useRef, useEffect } from "react";

function onShare(sharedUserId: string | null) {
    alert(`her's your shareable link:\n https://content-reviewer-app-git-develop-zuckpa1999s-projects.vercel.app/?sharedUserId=${sharedUserId}`)
    // todo - implement share functionality
    // 1. implement view-only mode in the app (no add/edit/delete)
    //1.1 hide the delete button on the top right on the component
    //1.2 hide the edit button on the bottom right on the component
    //1.3 hide the delete button on the bottom right of the detail modal
    // 1.4 hide the add button(Add Entry) on the top right of the header
    // 2. implement a shareable link that opens the app in view-only mode with the user's entries
    // 3. implement a way to copy the shareable link to the clipboard
};
export default function UserMenu({ user, onLogout, isViewOnly, sharedUserId }: { user: User; onLogout: () => void; isViewOnly: boolean; sharedUserId: string | null }) {

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
                aria-label="Account menu" disabled={isViewOnly}
            >
                <div className="w-7 h-7 rounded-full bg-accent ring-2 ring-accent/25 flex items-center justify-center
                        text-white text-xs font-black select-none flex-shrink-0">
                    {isViewOnly ? "V" : getUserInitials(user)}
                </div>
                {isViewOnly ?
                    <span className="hidden sm:block text-sm font-medium text-dark-100">Viewer Mode</span> :
                    <span className="hidden sm:block text-sm font-medium text-dark-100">{user.firstName}</span>}
                <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-dark-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && !isViewOnly && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-dark-800 rounded-xl border border-dark-700
                        shadow-xl shadow-black/50 overflow-hidden animate-scale-in z-50">
                    <div className="px-4 py-3.5 border-b border-dark-700/80">
                        <p className="text-white text-sm font-semibold">{user.firstName} {user.lastName}</p>
                        <p className="text-dark-400 text-xs mt-0.5 truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                        <button
                            onClick={() => { onShare(sharedUserId) }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-dark-300
                         hover:text-white hover:bg-dark-700 transition-colors text-left"
                        >
                            <Share className="w-4 h-4 flex-shrink-0" />

                            Share
                        </button>
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