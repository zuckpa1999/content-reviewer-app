import { SortOption } from "./types";

export const BUILTIN_TYPES = ['Movie', 'TV Series', 'Anime'];

export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
    { label: 'Newest first', value: 'newest' },
    { label: 'Oldest first', value: 'oldest' },
    { label: 'Highest rated', value: 'rating-high' },
    { label: 'Lowest rated', value: 'rating-low' },
    { label: 'A → Z', value: 'name-az' },
];