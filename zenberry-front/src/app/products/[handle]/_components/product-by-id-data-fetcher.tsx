import { ProductByIdContent } from "./product-by-id-content";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { shopifyQuery } from "@/src/config/shopify";
import { GET_PRODUCT_BY_HANDLE_QUERY } from "@/src/queries/shopify/get-product-by-handle-query";
import { ShopifyProductByHandleOperation } from "@/src/types/shopify";
import { mapShopifyProductToProduct } from "@/src/mappers/product-mapper";

interface ProductByIdDataFetcherProps {
  productHandle: string;
}

export async function ProductByIdDataFetcher({
  productHandle,
}: ProductByIdDataFetcherProps) {
  const { product: shopifyProduct } = await shopifyQuery<
    ShopifyProductByHandleOperation["data"],
    ShopifyProductByHandleOperation["variables"]
  >(GET_PRODUCT_BY_HANDLE_QUERY, { handle: productHandle }, { next: { revalidate: 60 } });

  if (!shopifyProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-3xl font-bold text-theme-text-primary mb-4">
            Product not found
          </h2>
          <p className="text-theme-text-secondary mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/products">
            <Button className="bg-theme-accent-primary text-theme-text-primary hover:bg-theme-accent-primary/80">
              Browse All Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const product = mapShopifyProductToProduct(shopifyProduct);

  return <ProductByIdContent product={product} />;
}
