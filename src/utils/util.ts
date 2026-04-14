import { MediaEntry, SupabaseEntry } from "@/types"
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
        user_id: userId ,
    } as SupabaseEntry;
};