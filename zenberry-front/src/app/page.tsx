import { BaseLayout } from "@/src/components/layout/base-layout";
import { MainHero } from "../components/home/main-hero";
import { QuestionsFormWrapper } from "../components/home/questions-form-wrapper";
import { ProductsSuggestion } from "../components/products/products-suggestion";
import { CategoryCarousel } from "../components/home/category-carousel";
import { FeaturedCbdThc } from "../components/home/featured-cbd-thc";

export default function Home() {
  return (
    <BaseLayout
      config={{
        showHeader: true,
        showHeroCta: true,
        showFooter: true,
        backgroundImage: "/zenberry-product-background.webp",
      }}
    >
      <MainHero />

      <QuestionsFormWrapper />

      {/* Favories Suggestions */}
      <section
        className={"py-16 bg-theme-bg-primary transition-colors duration-200"}
      >
        <div className="container mt-10 mx-auto px-4">
          <ProductsSuggestion title="Zenberry Favorites" collectionHandle="zenberry-favorites" />
        </div>
      </section>

      {/* Hot Suggestions */}
      <section className="py-16 bg-theme-bg-primary transition-colors duration-200">
        <div className="container mx-auto px-4">
          <ProductsSuggestion title="Hot Deals" collectionHandle="hot-deals" />
        </div>
      </section>

      <CategoryCarousel />

      {/* Featured Products */}
      <section className="py-16 bg-theme-bg-primary transition-colors duration-200">
        <div className="container mx-auto px-4">
          <FeaturedCbdThc title="Our featured cbd & thc products" />
        </div>
      </section>
    </BaseLayout>
  );
}
