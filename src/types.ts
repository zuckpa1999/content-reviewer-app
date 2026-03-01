export type ContentType = string;

export interface MediaEntry {
  id: string;
  name: string;
  imageUrl: string;
  dateWatched: string;   // ISO date string YYYY-MM-DD
  rating: number;        // 1–5
  thoughts: string;
  type: ContentType;
  createdAt: string;     // ISO timestamp
}

export type SortOption = 'newest' | 'oldest' | 'rating-high' | 'rating-low' | 'name-az';
