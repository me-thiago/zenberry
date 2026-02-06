"use client";

import { ProductByIdPrice } from "./product-by-id-price";
import { ProductByIdQuantity } from "./product-by-id-quantity";
import { AddToCartButton } from "@/src/components/button/add-to-cart-button";
import { BuyNowButton } from "@/src/components/button/buy-now-button";
import { ProductByIdShipping } from "./product-by-id-shipping";
import { Product } from "@/src/types/product";

interface ProductByIdPurchaseSectionProps {
  product: Product;
}

export function ProductByIdPurchaseSection({
  product,
}: ProductByIdPurchaseSectionProps) {
  return (
    <>
      <ProductByIdPrice
        productOriginalPrice={product.originalPrice}
        productPrice={product.price}
      />
      {!product.inStock ? (
        <div className="text-red-600 font-semibold text-2xl my-8">Product Unavailable</div>
      ) : (
        <ProductByIdQuantity />
      )}

      <div className="grid grid-cols-2 gap-3">
        <BuyNowButton
          product={{
            id: product.id,
            name: product.name,
            variantId: product.variantId,
            inStock: product.inStock,
          }}
          quantity={1}
          className="w-full h-12 text-lg hover:bg-theme-accent-primary/70 text-theme-accent-secondary"
        />

        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            variant: "Variant 1",
            variantId: product.variantId,
            inStock: product.inStock,
          }}
          variant="secondary"
          className="w-full h-12 text-lg text-white hover:bg-theme-accent-secondary/70"
          showIcon={true}
        />
      </div>

      <ProductByIdShipping />
    </>
  );
}
