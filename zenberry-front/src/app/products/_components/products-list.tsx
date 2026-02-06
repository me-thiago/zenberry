import { useRouter } from "next/navigation";
import { Product } from "@/src/types/product";
import { Button } from "@/src/components/ui/button";
import { ProductCardGrid } from "../../../components/products/product-card-grid";
import { ProductCardList } from "./product-card-list";
import { useCallback, useMemo } from "react";

interface ProductsListProps {
  products: Product[];
  viewMode: "grid" | "list";
}

export function ProductsList({ products, viewMode }: ProductsListProps) {
  const router = useRouter();
  
  const hasProducts = useMemo(() => products.length > 0, [products.length]);

  const handleClearFilters = useCallback(() => {
    router.push("/products");
  }, [router]);

  return (
    <>
      {hasProducts ? (
        <div className="w-full">
          {viewMode === "grid" ? (
            <div
              className={
                "grid place-items-center gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }
            >
              {products.map((product) => (
                <ProductCardGrid key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={"grid gap-6 grid-cols-1"}>
              {products.map((product) => (
                <ProductCardList key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-theme-text-secondary text-lg mb-4">
            No products found matching your filters
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </>
  );
}
