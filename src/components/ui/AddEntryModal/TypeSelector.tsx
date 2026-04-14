import { Plus, Check, X } from 'lucide-react';
import type { ContentType } from '../../../types';

interface TypeSelectorProps {
    type: ContentType;
    allTypes: string[];
    builtinTypes: string[];
    addingType: boolean;
    newTypeName: string;
    newTypeInputRef: React.RefObject<HTMLInputElement>;
    onTypeChange: (type: ContentType) => void;
    onRemoveCustomType: (type: string) => void;
    onAddingTypeToggle: (open: boolean) => void;
    onNewTypeNameChange: (name: string) => void;
    onConfirmNewType: () => void;
}

export function TypeSelector({
    type,
    allTypes,
    builtinTypes,
    addingType,
    newTypeName,
    newTypeInputRef,
    onTypeChange,
    onRemoveCustomType,
    onAddingTypeToggle,
    onNewTypeNameChange,
    onConfirmNewType,
}: TypeSelectorProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onConfirmNewType();
        }
    };

    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-dark-200">Type</label>
            <div className="flex flex-wrap gap-2">
                {allTypes.map((t) => {
                    const isCustom = !builtinTypes.includes(t);
                    return (
                        <div key={t} className="relative">
                            <button
                                type="button"
                                onClick={() => onTypeChange(t as ContentType)}
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
                                    onClick={() => onRemoveCustomType(t)}
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
                            onChange={(e) => onNewTypeNameChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type name…"
                            className="py-2 px-3 rounded-xl bg-dark-700 border border-accent/60 text-white text-sm
                         focus:outline-none focus:ring-1 focus:ring-accent/40 w-28"
                        />
                        <button
                            type="button"
                            onClick={onConfirmNewType}
                            className="p-2 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors"
                            aria-label="Confirm new type"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onAddingTypeToggle(false);
                                onNewTypeNameChange('');
                            }}
                            className="p-2 rounded-xl bg-dark-700 border border-dark-600 text-dark-300 hover:text-white transition-colors"
                            aria-label="Cancel"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => onAddingTypeToggle(true)}
                        className="py-2 px-3 rounded-xl text-sm font-medium border border-dashed
                       border-dark-500 text-dark-400 hover:border-dark-300 hover:text-dark-100
                       transition-all duration-150 flex items-center gap-1"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add type
                    </button>
                )}
            </div>
        </div>
    );
}
