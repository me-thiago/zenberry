import { shopifyQuery } from "@/src/config/shopify";
import { GET_PRODUCTS_QUERY } from "@/src/queries/shopify/get-products-query";
import { ShopifyProductsOperation } from "@/src/types/shopify";
import { mapShopifyProductToProduct } from "@/src/mappers/product-mapper";
import { QuestionsForm } from "./questions-form";

export async function QuestionsFormWrapper() {
  const { products: shopifyProducts } = await shopifyQuery<
    ShopifyProductsOperation["data"],
    ShopifyProductsOperation["variables"]
  >(GET_PRODUCTS_QUERY, { first: 50 }, { next: { revalidate: 60 } });

  const products = shopifyProducts?.edges.map(({ node }) =>
    mapShopifyProductToProduct(node)
  ) || [];

  return <QuestionsForm products={products} />;
}
