import { BaseLayout } from "@/src/components/layout/base-layout";
import { Hero } from "@/src/components/hero/hero";
import { AboutContactOptions } from "./_components/about-contact-options";
import { AboutSection } from "./_components/about-sections";
import { AboutSchedule } from "./_components/about-schedule";

export default function AboutPage() {
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
        <Hero title="About Us" />

        <div className="w-full bg-background">
          {/* The Science of Serenity - Image Right */}
          <AboutSection
            title="The Science of Serenity."
            paragraphs={[
              "In a world that never stops, finding your center isn't a luxury but a necessity. At Zenberry, we don't just sell products; we offer science-backed solutions designed to help you thrive.",
              "By fusing USDA-certified organic heritage farming with cutting-edge research, we've created a lineup of products we're proud to share. Natural compounds that help with relaxation and sleeplessness. That's wellness, refined for the ambitious.",
            ]}
            image="/about-us.webp"
            showStats
            imageLeft
          />
          <AboutSection
            title="Designed for the Daily Ritual."
            paragraphs={[
              "True wellness isn't a pill you take, but a ritual you live. Zenberry bridges the gap between therapeutic relief and daily indulgence.",
              "From the refreshing zest of our Tinctures to the restorative power of our Sleep Gummies, we transform routine supplements into moments of pure zen.",
              "We are constantly innovating to ensure that when you reach for Zenberry, you're reaching for the best version of yourself.",
            ]}
            image="/about-us.webp"
          />

          {/* Get In Touch With Our Wellness Experts */}
          <section className="pt-16">
            <div className="container mx-auto px-4 lg:bg-[url('/flower-zen-background.webp')] lg:bg-contain lg:bg-center lg:bg-no-repeat">
              <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-secondary mb-10">
                  Get In Touch With Our Wellness Experts
                </h2>
                <p className="text-secondary text-xl mb-10 mx-auto">
                  Connect with our dedicated team of wellness experts today and
                  unlock personalized guidance tailored to your individual
                  needs, because your journey to well-being matters to us.
                </p>

                <AboutSchedule />
                <AboutContactOptions />
              </div>
            </div>
          </section>
        </div>
      </div>
    </BaseLayout>
  );
}
