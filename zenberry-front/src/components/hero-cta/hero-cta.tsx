import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function HeroCta() {
  return (
    <section
      className="relative w-full aspect-16/18 sm:aspect-16/14 md:aspect-16/8 xl:max-h-[700px] overflow-hidden"
      style={{
        backgroundImage: "url('/hero-cta-background.webp')",
        backgroundSize: `cover`,
        backgroundRepeat: `no-repeat`,
        backgroundPosition: `center`,
      }}
    >
      {/* Gradient Overlay - Black from bottom */}
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-center p-6 md:p-10 lg:p-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Support your wellness,{" "}
            <span className="font-normal">
              enhance enjoyment, live elevated.
            </span>
          </h2>
          <p className="text-white text-base md:text-lg my-6 max-w-2xl">
            Join the movement of those who refuse to compromise on their mind
            and body. Experience the synergy of American-grown hemp and
            functional science.
          </p>
          <Link href="/products">
            <Button className="bg-theme-accent-primary hover:bg-theme-accent-primary/90 text-black font-semibold px-6 py-3 rounded-full flex items-center gap-2 group">
              Shop now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
