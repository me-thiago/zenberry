interface HeroProps {
  title: string;
}

export function Hero({ title }: HeroProps) {
  // 30vh (bg image) - 64px (top header) - 48px (green nav) = calc(30vh - 112px)
  return (
    <div className="relative h-[calc(30vh-112px)] flex items-center justify-center">
      <h1 className="text-5xl font-mono font-semibold text-center text-white">
        {title}
      </h1>
    </div>
  );
}
