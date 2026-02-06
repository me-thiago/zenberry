"use client"

import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useChatbot } from "@/src/contexts/chatbot-context";

export function MainHero() {
  const { openChatbot } = useChatbot();

  return (
    <section className="relative h-[500px] flex justify-center transition-colors duration-200">
      <div className="container mx-auto mt-20 px-4 text-center">
        <h1 className="max-w-2xl m-auto text-5xl md:text-6xl font-thin text-white mb-6 transition-colors duration-200">
          <span className="font-bold">CDB gummies</span>, the tastiest way to
          wellness.
        </h1>
        <p className="text-lg text-white mt-12 mb-8 max-w-2xl mx-auto transition-colors duration-200">
          <span className="font-bold">Medterra&apos;s CBD gummies</span> are
          carefully crafted with natural ingredients to enhance calmness, sleep,
          energy & more!
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={openChatbot}
            className="bg-white hover:bg-white/80 text-theme-accent-secondary cursor-pointer rounded-full font-semibold text-base"
            aria-label="Ask The Assistant"
          >
            Ask The Assistant
          </Button>
          <Link href="/products">
            <Button
              size="lg"
              variant="default"
              className="group text-theme-accent-secondary cursor-pointer hover:bg-theme-accent-secondary hover:text-theme-accent-primary rounded-full font-semibold text-base pr-1"
              aria-label="Shop Now"
            >
              Shop Now
              <div className="bg-theme-accent-secondary group-hover:bg-white  p-4 flex justify-center items-center rounded-full relative">
                <ArrowDownRight
                  color="white"
                  className="group-hover:stroke-black absolute transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-1"
                />
                <ArrowUpRight
                  color="white"
                  className="group-hover:stroke-black absolute opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                />
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
