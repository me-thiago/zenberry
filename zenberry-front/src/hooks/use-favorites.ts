"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Product } from "@/src/types/product";

const getFavoritesStorageKey = (userId: string | null) => {
  if (!userId) return null;
  return `zenberry-favorites-${userId}`;
};

export function useFavorites(userId: string | null) {
  const storageKey = useMemo(() => getFavoritesStorageKey(userId), [userId]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load favorites from localStorage when userId changes
  useEffect(() => {
    if (typeof window !== "undefined" && storageKey) {
      try {
        const savedFavorites = localStorage.getItem(storageKey);
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites) as Product[];
          setFavorites(parsedFavorites);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error("Failed to load favorites from localStorage:", error);
        setFavorites([]);
      } finally {
        setIsHydrated(true);
      }
    } else if (!userId) {
      // If no user, clear favorites
      setFavorites([]);
      setIsHydrated(true);
    }
  }, [storageKey, userId]);

  // Save favorites to localStorage whenever it changes (after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined" && storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(favorites));
      } catch (error) {
        console.error("Failed to save favorites to localStorage:", error);
      }
    }
  }, [favorites, isHydrated, storageKey]);

  // Sync favorites across tabs
  useEffect(() => {
    if (typeof window === "undefined" || !storageKey) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        try {
          if (e.newValue) {
            const updatedFavorites = JSON.parse(e.newValue) as Product[];
            setFavorites(updatedFavorites);
          } else {
            setFavorites([]);
          }
        } catch (error) {
          console.error("Failed to sync favorites from other tab:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [storageKey]);

  const addFavorite = useCallback((product: Product) => {
    setFavorites((prevFavorites) => {
      // Check if product is already in favorites
      const exists = prevFavorites.some((fav) => fav.id === product.id);
      if (exists) {
        return prevFavorites;
      }
      return [...prevFavorites, product];
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter((product) => product.id !== id)
    );
  }, []);

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.some((product) => product.id === id);
    },
    [favorites]
  );

  const getFavorites = useCallback(() => {
    return favorites;
  }, [favorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavorites,
    isHydrated,
  };
}

