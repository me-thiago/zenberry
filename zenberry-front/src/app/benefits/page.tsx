"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { BaseLayout } from "@/src/components/layout/base-layout";
import { Hero } from "@/src/components/hero/hero";
import { BenefitCard } from "./_components/benefit-card";
import { CarouselDots } from "./_components/carousel-dots";
import { BenefitHeroCard } from "./_components/benefit-hero-card";

export const BENEFIT_CARDS = [
  {
    id: 1,
    tags: ["CBD", "THC", "Relief"],
    title: "Daily Relief CBD Isolate Oil",
    features: ["Relief You Can Feel", "Boost You Can Feel", "Safe & Effective"],
    image: "/product-hand.webp",
  },
  {
    id: 2,
    tags: ["CBD", "THC", "Relief"],
    title: "Daily Relief CBD Isolate Oil",
    features: ["Relief You Can Feel", "Boost You Can Feel", "Safe & Effective"],
    image: "/product-hand.webp",
  },
  {
    id: 3,
    tags: ["CBD", "THC", "Relief"],
    title: "Daily Relief CBD Isolate Oil",
    features: ["Relief You Can Feel", "Boost You Can Feel", "Safe & Effective"],
    image: "/product-hand.webp",
  },
  {
    id: 4,
    tags: ["CBD", "THC", "Relief"],
    title: "Daily Relief CBD Isolate Oil",
    features: ["Relief You Can Feel", "Boost You Can Feel", "Safe & Effective"],
    image: "/product-hand.webp",
  },
];

export default function BenefitsPage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const updateIndex = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    updateIndex();
    emblaApi.on("select", updateIndex);
    emblaApi.on("reInit", updateIndex);

    return () => {
      emblaApi.off("select", updateIndex);
      emblaApi.off("reInit", updateIndex);
    };
  }, [emblaApi]);

  const cardsCount = useMemo(() => BENEFIT_CARDS.length, []);

  return (
    <BaseLayout
      config={{
        showHeader: true,
        showFooter: true,
        showHeroCta: true,
        backgroundImage: "/florest-background.webp",
        backgroundImageSize: "small",
      }}
    >
      <div className="min-h-screen transition-colors duration-200">
        {/* Hero Section */}
        <Hero title="Benefits" />

        <div className="w-full bg-background py-16">
          <BenefitHeroCard />

          <section className="py-16 mt-16 bg-theme-bg-primary">
            <div className="px-4">
              {/* Carousel Container */}
              <div className="relative mx-auto">
                {/* Embla Viewport */}
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex pl-4 md:ml-28">
                    {BENEFIT_CARDS.map((card) => (
                      <BenefitCard key={card.id} card={card} />
                    ))}
                  </div>
                </div>

                <CarouselDots
                  count={cardsCount}
                  selectedIndex={selectedIndex}
                  onSelect={scrollTo}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </BaseLayout>
  );
}
