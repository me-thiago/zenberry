import { Heart, MapPin, Truck } from "lucide-react";

export function ProductByIdFeatures() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-theme-text-primary">
        <Heart className="w-4 h-4 text-theme-accent-secondary" />
        <span>Relief You Can Feel</span>
      </div>
      <div className="w-px h-4 bg-theme-text-secondary/20"></div>
      <div className="flex items-center gap-2 text-sm font-semibold text-theme-text-primary">
        <Truck className="w-4 h-4 text-theme-accent-secondary" />
        <span>Natural Comfort</span>
      </div>
      <div className="w-px h-4 bg-theme-text-secondary/20"></div>
      <div className="flex items-center gap-2 text-sm font-semibold text-theme-text-primary">
        <MapPin className="w-4 h-4 text-theme-accent-secondary" />
        <span>Personalized Dosing</span>
      </div>
    </div>
  );
}
