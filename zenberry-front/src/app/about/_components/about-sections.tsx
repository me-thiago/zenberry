"use client"

import Image from "next/image";
import { AboutStats } from "./about-stats";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { useChatbot } from "@/src/contexts/chatbot-context";

interface AboutSectionProps {
  title: string;
  paragraphs: string[];
  image: string;
  imageLeft?: boolean;
  showStats?: boolean;
  showActions?: boolean;
}

export function AboutSection({
  title,
  paragraphs,
  image,
  imageLeft = false,
  showStats = false,
}: AboutSectionProps) {
  const { openChatbot } = useChatbot();

  return (
    <section className={`py-16`}>
      <div className="container mx-auto px-4">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto`}
        >
          {imageLeft && (
            <div className="relative h-[500px] rounded-2xl overflow-hidden order-2 lg:order-1">
              <Image src={image} alt={title} fill className="object-cover" />
            </div>
          )}
          <div className={imageLeft ? "order-1 lg:order-2" : ""}>
            <h2 className="text-4xl font-bold text-secondary mb-6">{title}</h2>
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className={`text-gray-700 mb-4 leading-relaxed ${
                  i === paragraphs.length - 1 ? "mb-8" : ""
                }`}
              >
                {p}
              </p>
            ))}
            {showStats && <AboutStats />}
            <div className="flex gap-4">
              <Link href={"/products"}>
                <Button className="bg-secondary hover:bg-secondary/90 text-white">
                  I want it
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={openChatbot}
                className="border-secondary text-secondary hover:text-secondary hover:bg-secondary/30"
              >
                talk to us
              </Button>
            </div>
          </div>
          {!imageLeft && (
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <Image src={image} alt={title} fill className="object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
