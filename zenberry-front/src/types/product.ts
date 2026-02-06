export type ProductUser = "Myself/Loved Ones" | "Pets";

// CBD Type options from Shopify metafield
export type ProductCBDType =
  | "Full Spectrum Organic"
  | "Broad Spectrum"
  | "CBD Isolate (THC-Free)"
  | "Full Spectrum Organic (Non-Decarbed)"
  | "Full Spectrum";

// Category options from Shopify metafield
export type ProductCategoryType =
  | "Daily Balance"
  | "Daily Wellness"
  | "Relaxation"
  | "Science Wellness"
  | "Sleep Support"
  | "Social & Mood"
  | "Pet Care"
  | "Beauty & Skincare"
  | "Pain & Recovery";

// Format options from Shopify productType
export type ProductFormatType =
  | "Tincture"
  | "CBD Gummies"
  | "Treats"
  | "Softgels"
  | "Serum"
  | "Lotion"
  | "Cream"
  | "Cooling Gel";

export interface Product {
  id: string;
  variantId: string;
  handle: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured?: boolean;
  ingredients: string[];
  howToUse: string;
  buttonText?: string;
  productBenefit?: string;
  // Filter fields from Shopify
  cbdType: ProductCBDType;
  productCategory: ProductCategoryType;
  format: ProductFormatType;
  // Additional metafields from Shopify
  cbdAmount?: string;
  concentration?: string;
  carrier?: string;
  productUse?: string;
  productIngredients?: string;
  thcAmount?: string;
  quantity?: string;
  tags?: string[];
}
