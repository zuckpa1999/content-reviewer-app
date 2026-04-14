import { Star } from 'lucide-react';

interface RatingSectionProps {
    rating: number;
    onRatingChange: (rating: number) => void;
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

export function RatingSection({
    rating,
    onRatingChange,
}: RatingSectionProps) {
    return (
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
                onChange={(e) => onRatingChange(Number(e.target.value))}
                className="w-full accent-red-600"
            />
            <div className="flex justify-between text-xs text-dark-400 px-0.5">
                {[1, 1.5, 2.5, 3.5, 5].map(n => <span key={n}>{n}</span>)}
            </div>
        </div>
    );
}
