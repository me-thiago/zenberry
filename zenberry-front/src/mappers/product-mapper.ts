import {
  Product,
  ProductCBDType,
  ProductCategoryType,
  ProductFormatType,
} from "../types/product";
import { ShopifyProduct } from "../types/shopify";

function getMetafieldValue(
  metafields: ShopifyProduct["metafields"],
  key: string
): string | undefined {
  const field = metafields?.find((m) => m?.key === key);
  return field?.value;
}

export function mapShopifyProductToProduct(
  shopifyProduct: ShopifyProduct
): Product {
  const images =
    shopifyProduct.images?.edges?.map(({ node }) => node.url) || [];
  if (images.length === 0 && shopifyProduct.featuredImage?.url) {
    images.push(shopifyProduct.featuredImage.url);
  }

  const metafields = shopifyProduct.metafields;

  return {
    id: shopifyProduct.id,
    variantId: shopifyProduct.variants?.edges[0]?.node.id || "",
    handle: shopifyProduct.handle,
    name: shopifyProduct.title || "",
    description: shopifyProduct.description || "",
    price: parseFloat(
      shopifyProduct.priceRange?.minVariantPrice?.amount || "0"
    ),
    images: images,
    inStock: shopifyProduct.variants?.edges[0]?.node?.availableForSale ?? false,
    howToUse: getMetafieldValue(metafields, "productuse") || "",
    ingredients: getMetafieldValue(metafields, "productingredients")?.split(",").map(i => i.trim()).filter(Boolean) || [],
    originalPrice:
      parseFloat(shopifyProduct.variants?.edges[0]?.node?.price?.amount || "0") +
      10,
    rating: 4.5,
    reviewCount: 10,
    productBenefit: shopifyProduct.productBenefit?.value,
    tags: shopifyProduct.tags || [],
    // Filter fields from Shopify
    cbdType: (getMetafieldValue(metafields, "productcbdtype") ||
      "Full Spectrum") as ProductCBDType,
    productCategory: (getMetafieldValue(metafields, "productcategory") ||
      "Daily Balance") as ProductCategoryType,
    format: (shopifyProduct.productType || "Tincture") as ProductFormatType,
    // Additional metafields
    cbdAmount: getMetafieldValue(metafields, "productcbd"),
    concentration: getMetafieldValue(metafields, "productconcentration"),
    carrier: getMetafieldValue(metafields, "productcarrier"),
    productUse: getMetafieldValue(metafields, "productuse"),
    productIngredients: getMetafieldValue(metafields, "productingredients"),
    thcAmount: getMetafieldValue(metafields, "productthc"),
    quantity: getMetafieldValue(metafields, "productquantity"),
  };
}
