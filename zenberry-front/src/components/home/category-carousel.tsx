"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useChatbot } from "@/src/contexts/chatbot-context";

const CATEGORIES = [
  {
    id: 1,
    title: "Balance My Mood",
    category: "Daily Balance",
    categoryTag: "balance",
    image: "/ice-breakers/Daily Balance.webp",
    prompt:
      "I'm looking for something to help me maintain emotional balance and mental clarity throughout my busy days. What can you recommend from Zenberry's daily wellness products?",
  },
  {
    id: 2,
    title: "Stay Sharp & Focused",
    category: "Daily Wellness",
    categoryTag: "focus",
    image: "/ice-breakers/Daily Welness.webp",
    prompt:
      "I need to stay focused and productive at work without the jitters from coffee. Can Zenberry help me maintain consistent energy and mental clarity?",
  },
  {
    id: 3,
    title: "Find My Calm",
    category: "Relaxation",
    categoryTag: "calm",
    image: "/ice-breakers/Relaxation.webp",
    prompt:
      "I struggle with anxiety and stress, and I need something that helps me relax without making me feel foggy or out of it. What pure CBD options do you have?",
  },
  {
    id: 4,
    title: "Sleep Better Tonight",
    category: "Sleep Support",
    categoryTag: "sleep",
    image: "/ice-breakers/Deep Sleep.webp",
    prompt:
      "I've been having trouble falling asleep and staying asleep through the night. What's the best Zenberry product to help me get deep, restorative rest?",
  },
  {
    id: 5,
    title: "Feel More Social",
    category: "Social & Mood",
    categoryTag: "social",
    image: "/ice-breakers/Social Mood.webp",
    prompt:
      "I get anxious in social situations and it holds me back. Is there something that can help me feel more confident and present without being too intense?",
  },
  {
    id: 6,
    title: "Optimize My Health",
    category: "Science Wellness",
    categoryTag: "science",
    image: "/ice-breakers/Science.webp",
    prompt:
      "I'm into biohacking and want the most advanced, research-backed CBD product. What makes Zenberry's science line different from regular CBD?",
  },
  {
    id: 7,
    title: "Relieve My Pain",
    category: "Pain & Recovery",
    categoryTag: "pain",
    image: "/ice-breakers/Pain-Recovery.webp",
    prompt:
      "I deal with chronic joint pain and muscle soreness that affects my daily activities. What topical solutions can provide real relief without pills?",
  },
  {
    id: 8,
    title: "Glow Naturally",
    category: "Beauty & Skincare",
    categoryTag: "beauty",
    image: "/ice-breakers/Beauty-Skincare.webp",
    prompt:
      "I want to reduce signs of aging and achieve healthier, more radiant skin naturally. How does CBD work in skincare, and what should I try?",
  },
  {
    id: 9,
    title: "Help My Pet",
    category: "Pet Care",
    categoryTag: "pet",
    image: "/ice-breakers/Pet Care.webp",
    bgPosition: "center 25%",
    prompt:
      "My dog struggles with anxiety during storms and has joint stiffness from aging. What's safe and effective for pets, and how do I know what dose to give?",
  },
];

export function CategoryCarousel() {
  const { openChatbotWithMessage } = useChatbot();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

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

  return (
    <section className="py-16 bg-theme-bg-primary">
      <div className="px-4">
        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-bold text-theme-accent-secondary text-center mb-12">
          Not sure where to start?
        </h2>

        {/* Carousel Container */}
        <div className="relative mx-auto">
          {/* Embla Viewport */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex pl-4 md:ml-28">
              {CATEGORIES.map((category, index) => (
                <div
                  key={category.id}
                  onClick={() => openChatbotWithMessage(category.prompt, category.categoryTag)}
                  className={`relative flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_40%] h-[300px] md:h-[400px] rounded-2xl overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform ${
                    index !== CATEGORIES.length - 1 ? "mr-3 md:mr-6" : ""
                  }`}
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-no-repeat bg-[#024653]"
                    style={{
                      backgroundImage: `url('${category.image}')`,
                      backgroundPosition: category.bgPosition || "center",
                    }}
                  >
                    {/* Teal Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-[#024653]/80 via-[#024653]/30 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-6">
                    <div className="text-white">
                      <span className="text-sm opacity-80 mb-1 block">
                        {category.category}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-semibold">
                        {category.title}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows - Desktop only */}
          <button
            onClick={scrollPrev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-theme-accent-secondary" />
          </button>
          <button
            onClick={scrollNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-theme-accent-secondary" />
          </button>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {CATEGORIES.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? "w-8 bg-theme-accent-secondary"
                    : "w-2 bg-theme-text-secondary/30 hover:bg-theme-text-secondary/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
