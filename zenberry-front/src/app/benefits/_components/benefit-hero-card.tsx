import { Heart, Leaf, TestTube } from "lucide-react";
import Image from "next/image";

export function BenefitHeroCard() {
  return (
    <section
      aria-label="Zenberry Innovation Highlight"
      className="container mx-auto mb-16"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <Image
          src="/product.webp"
          alt="Innovating for a brighter tomorrow"
          fill
          priority
          className="object-cover"
        />
        <div className="relative p-6 md:p-8 h-full max-w-[500px] backdrop-blur-md border border-white/30 rounded-xl flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo-zenberry.webp"
                alt="Zenberry logo"
                width={150}
                height={70}
                className="object-cover"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
              innovating for a<br />
              brighter tomorrow.
            </h2>
            <p className="text-sm md:text-base text-white/90 max-w-md leading-relaxed">
              Driven by innovation, our team continually pushes boundaries to
              introduce groundbreaking products that cater to diverse needs.
              Whether we&apos;re formulating new solutions or unlocking the
              potential of revolutionary botanicals, our focus remains on
              enriching lives and spreading joy.
            </p>
          </div>
          <div className="flex items-center gap-6 md:gap-8 mt-6">
            <div className="text-center">
              <Leaf className="h-6 w-6 mx-auto mb-1 text-white" />
              <p className="text-xs text-white/80">Relief You Can Feel</p>
            </div>
            <div className="text-center">
              <TestTube className="h-6 w-6 mx-auto mb-1 text-white" />
              <p className="text-xs text-white/80">Natural Comfort</p>
            </div>
            <div className="text-center">
              <Heart className="h-6 w-6 mx-auto mb-1 text-white" />
              <p className="text-xs text-white/80">Personalized Dosing</p>
            </div>
          </div>
          <button
            className="mt-6 px-6 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-all"
            aria-label="Shop Zenberry"
          >
            Shop Zenberry
          </button>
        </div>
      </div>
    </section>
  );
}
