import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewCount: number;
}

export function StarRating({ rating, reviewCount }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : i < rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-theme-text-secondary/30"
          }`}
        />
      ))}
      <span className="text-xs text-theme-text-secondary ml-1">
        ({reviewCount} Reviews)
      </span>
    </div>
  );
}
