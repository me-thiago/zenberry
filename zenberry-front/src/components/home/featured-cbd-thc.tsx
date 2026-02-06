import { FeaturedProductCarousel } from "../products/featured-product-carousel";
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

interface FeaturedCbdThcProps {
  title: string;
}

export async function FeaturedCbdThc({ title }: FeaturedCbdThcProps) {
  const { collection } = await shopifyQuery<
    CollectionResponse,
    { handle: string; first: number }
  >(
    GET_COLLECTION_BY_HANDLE_QUERY,
    {
      handle: "most-wanted",
      first: 50,
    },
    { next: { revalidate: 60 } }
  );

  const products =
    collection?.products.edges.map((edge) =>
      mapShopifyProductToProduct(edge.node)
    ) || [];

  return <FeaturedProductCarousel products={products} title={title} />;
}
