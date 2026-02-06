import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/src/components/ui/card";
import { Product } from "@/src/types/product";
import { BuyNowButton } from "../button/buy-now-button";
import { AddToCartButton } from "@/src/components/button/add-to-cart-button";
import { DiscountBadge } from "../badge/discount-badge";
import { StarRating } from "../star-rating/star-rating";

interface ProductCardGridProps {
  product: Product;
}

export function ProductCardGrid({ product }: ProductCardGridProps) {
  const discountPercentage = 10;
  const imageUrl =
    product.images[0] ?? "https://placehold.co/400x400/EEE/31343C";

  return (
    <Card className="group h-full flex flex-col w-full max-w-sm p-0 hover:shadow-lg transition-all duration-200 bg-theme-bg-secondary">
      <CardContent className="flex p-0 flex-col h-full">
        {/* Image Container */}
        <Link href={`/products/${product.handle}`}>
          <div className="relative aspect-square min-w-full overflow-hidden rounded-t-lg">
            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <div className="mt-3">
                <DiscountBadge discountPercentage={discountPercentage} />
              </div>
            )}

            {/* Product Image */}
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-3 flex flex-col grow">
          {/* Content that can grow */}
          <div className="grow">
            <Link href={`/products/${product.handle}`}>
              <h3 className="font-semibold text-theme-text-primary group-hover:text-theme-accent-secondary transition-colors duration-200 line-clamp-2">
                {product.name}
              </h3>
            </Link>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-theme-text-secondary">Price:</span>
              <span className="text-lg font-bold text-theme-text-primary">
                ${product.price.toFixed(2)}
              </span>
            </div>

            {/* Rating - Static for now as it's not in the Shopify Product type */}
            <StarRating rating={4.5} reviewCount={0} />
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="grid grid-cols-2 gap-1 mt-auto">
            <BuyNowButton
              product={{
                id: product.id,
                name: product.name,
                variantId: product.variantId,
                inStock: product.inStock,
              }}
              className="hover:bg-theme-accent-primary/70 text-theme-accent-secondary"
            />
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: imageUrl,
                variant: "variant",
                variantId: product.variantId,
                inStock: product.inStock,
              }}
              variant="secondary"
              className="text-white hover:bg-theme-accent-secondary/70"
              showIcon={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
