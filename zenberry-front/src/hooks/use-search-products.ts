import { useState, useEffect, useCallback } from "react";
import { Product } from "@/src/types/product";

interface UseSearchProductsResult {
  allProducts: Product[];
  isLoading: boolean;
  error: string | null;
}

// Cache simples em memória (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000;
let cachedProducts: Product[] | null = null;
let cacheTimestamp: number = 0;

export function useSearchProducts(isOpen: boolean): UseSearchProductsResult {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar todos os produtos quando o modal abrir
  useEffect(() => {
    if (!isOpen) return;

    const fetchAllProducts = async () => {
      // Verificar cache
      if (cachedProducts && Date.now() - cacheTimestamp < CACHE_DURATION) {
        setAllProducts(cachedProducts);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Buscar todos os produtos (limite máximo do Shopify é 250)
        const response = await fetch(`/api/products/search?limit=250`);

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const fetchedProducts = data.products || [];

        // Atualizar cache
        cachedProducts = fetchedProducts;
        cacheTimestamp = Date.now();

        setAllProducts(fetchedProducts);
      } catch (err) {
        console.error("Error loading products:", err);
        setError(err instanceof Error ? err.message : "Failed to load products");
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, [isOpen]);

  return {
    allProducts,
    isLoading,
    error,
  };
}

