import { ProductCarousel } from "./product-carousel";
import { GET_COLLECTION_BY_HANDLE_QUERY } from "@/src/queries/shopify/get-collection-by-handle-query";
import { shopifyQuery } from "@/src/config/shopify";
import { ShopifyProduct } from "@/src/types/shopify";
import { mapShopifyProductToProduct } from "@/src/mappers/product-mapper";

interface CollectionResponse {
  collection: {
    id: string;
    handle: string;
    title: string;
    description: string;
    products: {
      edges: { node: ShopifyProduct }[];
    };
  };
}

interface ProductsSuggestionProps {
  title: string;
  collectionHandle: string;
  productHandle?: string;
}

export async function ProductsSuggestion({
  title,
  collectionHandle,
  productHandle,
}: ProductsSuggestionProps) {
  const { collection } = await shopifyQuery<
    CollectionResponse,
    { handle: string; first: number }
  >(
    GET_COLLECTION_BY_HANDLE_QUERY,
    {
      handle: collectionHandle,
      first: 50,
    },
    { next: { revalidate: 60 } }
  );

  let products =
    collection?.products.edges.map((edge) =>
      mapShopifyProductToProduct(edge.node)
    ) || [];

  if (productHandle) {
    products = products.filter((product) => product.handle !== productHandle);
  }

  return <ProductCarousel products={products} title={title} />;
}
