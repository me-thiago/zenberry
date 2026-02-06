"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductsFilter } from "@/src/components/products/products-filter";
import {
  Product,
  ProductCBDType,
  ProductCategoryType,
  ProductFormatType,
} from "@/src/types/product";
import { ProductsList } from "./products-list";
import { ProductsHeader } from "./products-header";
import { Hero } from "@/src/components/hero/hero";

interface ProductsContentProps {
  products: Product[];
  totalCount: number;
}

export function ProductsContent({
  products,
  totalCount,
}: ProductsContentProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const searchParams = useSearchParams();

  // Get filter values from URL
  const users = useMemo(() => searchParams.getAll("users"), [searchParams]);
  const types = useMemo(
    () => searchParams.getAll("types") as ProductCBDType[],
    [searchParams]
  );
  const categories = useMemo(
    () => searchParams.getAll("categories") as ProductCategoryType[],
    [searchParams]
  );
  const formats = useMemo(
    () => searchParams.getAll("formats") as ProductFormatType[],
    [searchParams]
  );

  // Filter products based on URL params
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by Type (CBD Type)
      if (types.length > 0 && !types.includes(product.cbdType)) {
        return false;
      }

      // Filter by Category
      if (
        categories.length > 0 &&
        !categories.includes(product.productCategory)
      ) {
        return false;
      }

      // Filter by Format
      if (formats.length > 0 && !formats.includes(product.format)) {
        return false;
      }

      // Filter by User (Shopping for)
      // - "Pets" selected: show only products with category "Pet Care"
      // - "Myself/Loved Ones" selected: hide products with category "Pet Care"
      if (users.length > 0) {
        const isPetProduct = product.productCategory === "Pet Care";
        const wantsPets = users.includes("Pets");
        const wantsHuman = users.includes("Myself/Loved Ones");

        // If both are selected, show all products
        if (wantsPets && wantsHuman) {
          return true;
        }

        // If only Pets is selected, show only Pet Care products
        if (wantsPets && !wantsHuman && !isPetProduct) {
          return false;
        }

        // If only Myself/Loved Ones is selected, hide Pet Care products
        if (wantsHuman && !wantsPets && isPetProduct) {
          return false;
        }
      }

      return true;
    });
  }, [products, types, categories, formats, users]);

  return (
    <div className="min-h-screen transition-colors duration-200">
      <Hero title="Products" />

      <div className="w-full bg-background">
        <div className="container mx-auto px-2 py-8">
          <ProductsHeader
            totalCount={filteredProducts.length}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
          <div className="flex gap-6">
            <ProductsFilter
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
            />
            <ProductsList products={filteredProducts} viewMode={viewMode} />
          </div>
        </div>
      </div>
    </div>
  );
}
