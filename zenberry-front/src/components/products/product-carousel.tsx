"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/src/types/product";
import { ProductCardGrid } from "./product-card-grid";

interface ProductCarouselProps {
  products: Product[];
  title: string;
}

export function ProductCarousel({ products, title }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mb-3">
      <h2 className="text-3xl md:text-5xl font-bold text-theme-accent-secondary text-center mb-8 transition-colors duration-200">
        {title}
      </h2>

      <div className="relative">
        {/* Carousel Container */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-[0_0_280px] sm:flex-[0_0_300px] md:flex-[0_0_320px] min-w-0"
              >
                <ProductCardGrid product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows - Desktop only */}
        {canScrollPrev && (
          <button
            onClick={scrollPrev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10 cursor-pointer"
            aria-label="Previous products"
          >
            <ChevronLeft className="w-6 h-6 text-theme-accent-secondary" />
          </button>
        )}
        {canScrollNext && (
          <button
            onClick={scrollNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10 cursor-pointer"
            aria-label="Next products"
          >
            <ChevronRight className="w-6 h-6 text-theme-accent-secondary" />
          </button>
        )}

        {/* Dots Navigation */}
        {scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  index === selectedIndex
                    ? "w-8 bg-theme-accent-secondary"
                    : "w-2 bg-theme-text-secondary/30 hover:bg-theme-text-secondary/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
