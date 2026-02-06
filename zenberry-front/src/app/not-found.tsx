import Link from "next/link";
import { Home, Search } from "lucide-react";
import { BaseLayout } from "@/src/components/layout/base-layout";
import { Button } from "@/src/components/ui/button";
import { BackButton } from "@/src/components/button/back-button";

export default function NotFound() {
  return (
    <BaseLayout
      config={{
        showHeader: true,
        showFooter: false,
        centered: true,
        fullHeight: true,
      }}
    >
      <div className="max-w-2xl w-full text-center bg-theme-bg-primary p-8 rounded-2xl transition-colors duration-200">
        {/* 404 Illustration - Option 1: Minimalist Numbers */}
        <div className="mb-8 relative">
          <div className="text-[200px] font-bold text-theme-accent-secondary/50 leading-none transition-colors duration-200">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-theme-accent-yellow rounded-full flex items-center justify-center transition-colors duration-200">
              <span className="text-6xl">🌿</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-theme-text-primary mb-4 transition-colors duration-200">
          Page Not Found
        </h1>
        <p className="text-lg text-theme-text-secondary mb-8 max-w-md mx-auto transition-colors duration-200">
          Oops! Looks like this page got lost in the clouds. The page
          you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button
              size="lg"
              className="bg-theme-accent-secondary text-white hover:opacity-90 transition-all duration-200 w-full sm:w-auto"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <BackButton />
        </div>

        {/* Search Suggestion */}
        <div className="mt-12 pt-8 border-t border-theme-text-secondary/20">
          <p className="text-sm text-theme-text-secondary mb-4 transition-colors duration-200">
            Looking for something specific?
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="search"
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border border-theme-text-secondary/20 bg-theme-bg-secondary text-theme-text-primary rounded-lg text-sm transition-colors duration-200 placeholder:text-theme-text-secondary/50 focus:outline-none focus:border-theme-accent-secondary"
            />
            <Button className="bg-theme-accent-secondary text-white hover:opacity-90 transition-all duration-200">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Popular Links */}
        <div className="mt-8">
          <p className="text-sm text-theme-text-secondary mb-4 transition-colors duration-200">
            Popular pages:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {["Products", "CBD Oils", "Gummies", "About Us"].map((link) => (
              <Link
                key={link}
                href={`/${link.toLowerCase().replace(" ", "-")}`}
                className="text-sm text-theme-accent-secondary hover:underline transition-colors duration-200"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
