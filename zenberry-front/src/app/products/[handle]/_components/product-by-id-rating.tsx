import { Star } from "lucide-react";

interface ProductByIdRatingProps {
  productRating: number;
  productReviewCount: number;
}

export function ProductByIdRating({
  productRating,
  productReviewCount,
}: ProductByIdRatingProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < Math.floor(productRating)
                ? "fill-theme-accent-yellow text-theme-accent-yellow"
                : "text-theme-text-secondary/30"
            }`}
          />
        ))}
      </div>
      <span className="text-theme-text-secondary transition-colors duration-200">
        {productRating} ({productReviewCount} reviews)
      </span>
    </div>
  );
}
