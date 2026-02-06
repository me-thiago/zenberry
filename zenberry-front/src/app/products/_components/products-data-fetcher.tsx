import { ProductsContent } from "@/src/app/products/_components/products-content";
import { shopifyQuery } from "@/src/config/shopify";
import { GET_PRODUCTS_QUERY } from "@/src/queries/shopify/get-products-query";
import { ShopifyProductsOperation } from "@/src/types/shopify";
import { GetProductsParams } from "@/src/types/product-api";
import { mapShopifyProductToProduct } from "@/src/mappers/product-mapper";

export interface ProductsDataFetcherProps {
  searchParams: GetProductsParams;
}

export async function ProductsDataFetcher({
  searchParams,
}: ProductsDataFetcherProps) {
  const { products: shopifyProducts } = await shopifyQuery<
    ShopifyProductsOperation["data"],
    ShopifyProductsOperation["variables"]
  >(GET_PRODUCTS_QUERY, { first: 30 });

  if (!shopifyProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
            Error loading products
          </h2>
          <p className="text-theme-text-secondary">
            Could not load products from Shopify.
          </p>
        </div>
      </div>
    );
  }
  const products = shopifyProducts.edges.map(({ node }) =>
    mapShopifyProductToProduct(node)
  );

  return <ProductsContent products={products} totalCount={products.length} />;
}
