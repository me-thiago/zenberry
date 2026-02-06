import { Badge } from "../../../../components/ui/badge";

interface ProductIdBadgesProps {
  productBadges: string[];
}

export function ProductByIdBadges({ productBadges }: ProductIdBadgesProps) {
  return (
    <div className="flex flex-wrap justify-start gap-3 mb-3">
      {productBadges &&
        productBadges.map((badge) => (
          <Badge
            key={badge}
            className="bg-theme-accent-secondary text-base font-thin text-white mb-3"
          >
            {badge}
          </Badge>
        ))}
    </div>
  );
}
