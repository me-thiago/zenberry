interface BenefitCard {
  id: number;
  title: string;
  tags: string[];
  features: string[];
  image: string;
}

interface BenefitCardProps {
  card: BenefitCard;
}

export function BenefitCard({ card }: BenefitCardProps) {
  return (
    <div
      className="relative flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_25%] h-[450px] md:h-[700px] rounded-2xl overflow-hidden group cursor-grab active:cursor-grabbing mr-6"
      style={{
        backgroundImage: `url(/about-us.webp)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
      aria-label={card.title}
    >
      <div className="relative h-full flex flex-col">
        <div className="relative p-6 backdrop-blur-md border-b border-white/30 text-white">
          <div className="flex gap-2 mb-4">
            {card.tags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-xl font-bold mb-4">{card.title}</h3>
          <ul className="space-y-2">
            {card.features.map((feature, featureIndex) => (
              <li
                key={featureIndex}
                className="flex items-center gap-2 text-sm"
              >
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <button
            className="w-full px-6 py-2.5 bg-white text-secondary rounded-lg font-medium hover:bg-white/90 transition-all shadow-lg"
            aria-label={`Shop ${card.title}`}
          >
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
}
