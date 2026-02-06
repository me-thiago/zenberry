"use client";

import { useCallback, useEffect, useState } from "react";
import { BaseLayout } from "@/src/components/layout/base-layout";
import { Hero } from "@/src/components/hero/hero";
import { FavoritesEmptyState } from "./_components/favorite-empty-state";
import { FavoriteProductCard } from "./_components/favorite-product-card";
import { useFavorites } from "@/src/hooks/use-favorites";
import { Product } from "@/src/types/product";
import { toast } from "sonner";
import { useAuthContext } from "@/src/contexts/auth-context";

export default function FavoritesPage() {
  const { customer } = useAuthContext();
  const { favorites: favoritesFromHook, removeFavorite: removeFavoriteFromHook, isHydrated } = useFavorites(customer?.id ?? null);
  const [favorites, setFavorites] = useState<Product[]>([]);

  // Initialize favorites from hook when hydrated and sync when favorites change
  useEffect(() => {
    if (isHydrated) {
      setFavorites(favoritesFromHook);
    }
  }, [isHydrated, favoritesFromHook]);

  const removeFavorite = useCallback((id: string) => {
    removeFavoriteFromHook(id);
    toast("Removed from favorites");
  }, [removeFavoriteFromHook]);

  return (
    <BaseLayout
      config={{
        showHeader: true,
        showFooter: true,
        showHeroCta: true,
        backgroundImage: "/zenberry-product-background-small.webp",
        backgroundImageSize: "small",
      }}
    >
      <div className="min-h-screen transition-colors duration-200">
        <Hero title="Favorites" />

        <div className="w-full bg-background">
          {favorites.length === 0 ? (
            <FavoritesEmptyState />
          ) : (
            <div className="container mx-auto px-4 py-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
                <p className="text-gray-600" aria-live="polite">
                  {favorites.length} {favorites.length === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="space-y-4">
                {favorites.map((product) => (
                  <FavoriteProductCard
                    key={product.id}
                    product={product}
                    onRemove={removeFavorite}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
}
