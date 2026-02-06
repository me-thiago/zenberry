/**
 * Types for Shopify Storefront API
 * These types are not exhaustive, but cover the most common use cases for products, variants, cart, and collections.
 */

export type ShopifyImage = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type ShopifyProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
  image: ShopifyImage;
};

export type ShopifyPrice = {
  amount: string;
  currencyCode: string;
};

export type ShopifyPriceRange = {
  minVariantPrice: ShopifyPrice;
  maxVariantPrice: ShopifyPrice;
};

export type ShopifyMetafield = {
  key: string;
  namespace: string;
  value: string;
};

export type ShopifyMetaobjectField = {
  key: string;
  value: string;
};

export type ShopifyMetaobject = {
  id: string;
  type: string;
  fields: ShopifyMetaobjectField[];
};

export type ShopifyProductMetafield = {
  key: string;
  value: string;
} | null;

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  priceRange: ShopifyPriceRange;
  category: string;
  productType: string;
  vendor: string;
  featuredImage: ShopifyImage;
  images: {
    edges: { node: ShopifyImage }[];
  };
  variants: {
    edges: { node: ShopifyProductVariant }[];
  };
  productBenefit?: {
    value: string;
  };
  ingredients?: {
    references: {
      edges: { node: ShopifyMetaobject }[];
    };
  };
  metafields?: ShopifyProductMetafield[];
};

export type ShopifyCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage;
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          product: {
            title: string;
          };
        };
      };
    }[];
  };
  buyerIdentity?: {
    email?: string;
  };
};

export type ShopifyProductsOperation = {
  data: {
    products: {
      edges: { node: ShopifyProduct }[];
    };
  };
  variables: {
    first: number;
  };
};

export type ShopifyProductByHandleOperation = {
  data: {
    product: ShopifyProduct;
  };
  variables: {
    handle: string;
  };
};

export type ShopifyCollectionsOperation = {
  data: {
    collections: {
      edges: { node: ShopifyCollection }[];
    };
  };
  variables: {
    first: number;
  };
};

export type ShopifyCreateCartOperation = {
  data: {
    cartCreate: {
      cart: ShopifyCart;
    };
  };
  variables: {
    input: {
      lines: {
        merchandiseId: string;
        quantity: number;
      }[];
    };
  };
};

export type ShopifyAddToCartOperation = {
  data: {
    cartLinesAdd: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type ShopifySearchProductsOperation = {
  data: {
    products: {
      edges: { node: ShopifyProduct }[];
    };
  };
  variables: {
    first: number;
    query?: string;
  };
};
