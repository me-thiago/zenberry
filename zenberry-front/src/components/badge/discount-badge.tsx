import { ArrowDown } from "lucide-react";

interface DiscountBadgeProps {
  discountPercentage: number;
  marginLeft?: number;
}

export function DiscountBadge({
  discountPercentage,
  marginLeft = 3,
}: DiscountBadgeProps) {
  return (
    <div
      className={`absolute flex items-center left-${marginLeft} z-10 bg-theme-accent-secondary text-theme-accent-primary text-xs gap-1 px-3 py-1 rounded-full`}
    >
      <ArrowDown width={15} />
      {discountPercentage}% Off
    </div>
  );
}
