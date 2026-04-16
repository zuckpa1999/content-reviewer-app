import { MediaEntry, SupabaseEntry, User } from "../types"
import { format } from "date-fns";

export function formatToSupabaseEntry(data: MediaEntry, userId: string) {
    return {
        id: data.id,
        name: data.name,
        image_url: data.imageUrl,
        date_watched: format(new Date(data.dateWatched), 'yyyy-MM-dd'),
        rating: data.rating,
        thoughts: data.thoughts,
        type: data.type,
        created_at: data.createdAt,
        user_id: userId,
    } as SupabaseEntry;
};

export function getUserInitials(user: User): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}

export function countWords(text: string): number {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}
