"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { SearchProductCard } from "./search-product-card";
import { SearchSuggestions } from "./search-suggestions";
import { useSearchProducts } from "@/src/hooks/use-search-products";

interface SearchModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function SearchModal({ isOpen, setIsOpen }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { allProducts, isLoading, error } = useSearchProducts(isOpen);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allProducts;
    
    return allProducts.filter((product) => {
      const productName = String(product.name || "").toLowerCase();
      const nameMatch = productName.includes(query);

      const description = String(product.description || "").toLowerCase();
      const descriptionMatch = description.includes(query);
      
      return nameMatch || descriptionMatch;
    });
  }, [allProducts, searchQuery]);

  const handleClose = useCallback(() => setIsOpen(false), [setIsOpen]);

  const handleSuggestionSelect = useCallback((name: string) => {
    setSearchQuery(name);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setIsOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/20 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="backdrop-blur-3xl bg-[#555555]/40 overflow-auto rounded-b-3xl border-b"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto py-8">
          {/* Header with Search */}
          <div className="grid grid-cols-1 md:grid-cols-[25%_auto_15%] xl:grid-cols-[25%_auto_25%] gap-4 mb-8">
            <div className="m-auto">
              <Image
                src={"/logo-zenberry.webp"}
                alt="Zenberry Logo"
                width={150}
                height={100}
              />
            </div>
            <div className="relative md:w-full mx-auto bg-white rounded-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-4 py-6 text-lg rounded-2xl focus:border-primary"
              />
            </div>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-white m-auto"
            >
              Cancelar
            </Button>
          </div>

          {/* Search Results */}
          <div
            className={cn(
              "grid gap-10 items-center mx-auto container px-5",
              !searchQuery.trim() &&
                "md:grid-cols-[220px_auto] xl:grid-cols-[300px_auto]"
            )}
          >
            {/* Suggestions Section */}
            {!searchQuery.trim() && (
              <SearchSuggestions onSelect={handleSuggestionSelect} />
            )}

            {/* Products Grid */}
            <div
              className="overflow-x-auto pb-4 px-2"
              style={{
                scrollbarColor: "gray transparent",
                scrollbarWidth: "thin",
              }}
            >
              <div className="flex gap-4 py-2">
                {isLoading && (
                  <div className="mx-auto my-2 pt-4 text-white">
                    Buscando produtos...
                  </div>
                )}

                {!isLoading && error && (
                  <div className="mx-auto my-2 pt-4 text-white">
                    Erro ao buscar produtos. Tente novamente.
                  </div>
                )}

                {!isLoading && !error && filteredProducts.length > 0 && (
                  <>
                    {filteredProducts.map((product) => (
                      <SearchProductCard
                        key={product.id}
                        product={product}
                        onSelect={handleClose}
                      />
                    ))}
                  </>
                )}

                {!isLoading && !error && searchQuery.trim() && filteredProducts.length === 0 && (
                  <h3 className="mx-auto my-2 pt-4 text-white">
                    Não foi possível encontrar nenhum produto
                  </h3>
                )}

                {!isLoading && !error && !searchQuery.trim() && filteredProducts.length === 0 && allProducts.length === 0 && (
                  <h3 className="mx-auto my-2 pt-4 text-white">
                    Nenhum produto disponível
                  </h3>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
