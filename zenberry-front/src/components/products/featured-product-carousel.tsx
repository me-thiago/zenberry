"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/src/types/product";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";

interface FeaturedProductCarouselProps {
  products: Product[];
  title: string;
}

export function FeaturedProductCarousel({
  products,
  title,
}: FeaturedProductCarouselProps) {
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
            {products.map((product) => {
              const imageUrl =
                product.images[0] ?? "https://placehold.co/400x400/EEE/31343C";

              return (
                <div
                  key={product.id}
                  className="flex-[0_0_280px] sm:flex-[0_0_300px] md:flex-[0_0_320px] min-w-0"
                >
                  <Card className="p-2 group hover:shadow-lg transition-all duration-200 bg-theme-bg-secondary border-theme-text-secondary/10 h-full flex flex-col">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Image Container */}
                      <Link href={`/products/${product.handle}`}>
                        <div className="relative h-72 min-w-full overflow-hidden rounded-t-lg">
                          {/* Product Image */}
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="p-2 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="p-4 flex flex-col grow">
                        {/* Content that can grow */}
                        <div className="grow">
                          <Link href={`/products/${product.handle}`}>
                            <h3 className="font-semibold text-theme-text-primary group-hover:text-theme-accent-secondary transition-colors duration-200 line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>

                          <p className="text-sm text-theme-text-secondary my-2 line-clamp-2">
                            {product.productCategory || "Natural Supplement"}
                          </p>
                        </div>

                        {/* Action Buttons - Fixed at bottom */}
                        <div className="mt-4">
                          <Link
                            href={`/products/${product.handle}`}
                            className="flex-1"
                          >
                            <Button
                              variant="default"
                              className="w-full hover:bg-theme-accent-primary/70 text-theme-accent-secondary"
                            >
                              View Product
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
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
