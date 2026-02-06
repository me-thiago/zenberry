interface CarouselDotsProps {
  count: number;
  selectedIndex: number;
  onSelect: (i: number) => void;
}

export function CarouselDots({
  count,
  selectedIndex,
  onSelect,
}: CarouselDotsProps) {
  return (
    <div className="flex justify-center gap-2 mt-8">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`h-2 rounded-full transition-all ${
            index === selectedIndex
              ? "w-8 bg-theme-accent-secondary"
              : "w-2 bg-theme-text-secondary/30 hover:bg-theme-text-secondary/50"
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}
