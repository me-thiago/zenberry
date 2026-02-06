import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/src/components/ui/card";
import { BuyNowButton } from "@/src/components/button/buy-now-button";
import { AddToCartButton } from "@/src/components/button/add-to-cart-button";
import { DiscountBadge } from "@/src/components/badge/discount-badge";
import { StarRating } from "@/src/components/star-rating/star-rating";
import { Product } from "@/src/types/product";

interface ProductCardListProps {
  product: Product;
}

export function ProductCardList({ product }: ProductCardListProps) {
  const discountPercentage = 10;
  const imageUrl =
    product.images[0] ?? "https://placehold.co/400x400/EEE/31343C";

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-theme-bg-secondary border-theme-text-secondary/10">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Image Container */}
          <Link
            href={`/products/${product.handle}`}
            className="relative w-full sm:w-48 shrink-0"
            aria-label={`Ver detalhes de ${product.name}`}
          >
            <div className="relative aspect-square max-h-48 m-auto overflow-hidden rounded-l-lg">
              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <DiscountBadge
                  discountPercentage={discountPercentage}
                  marginLeft={3}
                />
              )}

              {/* Product Image */}
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain max-h-48 p-4 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>

          {/* Product Info */}
          <div className="flex flex-col grow p-4 sm:py-4 sm:pr-4 sm:pl-0">
            <div className="flex flex-col sm:flex-row gap-4 h-full">
              {/* Left Section - Product Details */}
              <div className="grow">
                <Link href={`/products/${product.handle}`}>
                  <h3 className="font-semibold text-lg text-theme-text-primary mb-2 group-hover:text-theme-accent-secondary transition-colors duration-200 line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                {/* Description (optional - se tiver) */}
                <p className="text-sm text-theme-text-secondary line-clamp-2 mb-3">
                  {product.description}
                </p>

                {/* Rating - Static for now */}
                <StarRating rating={4.5} reviewCount={0} />
              </div>

              {/* Right Section - Price & Actions */}
              <div className="flex flex-col justify-between items-end sm:w-48 shrink-0">
                {/* Price */}
                <div className="text-right mb-4">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <span className="text-2xl font-bold text-theme-text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 w-full">
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
                      variant: "Variant 1",
                      variantId: product.variantId,
                      inStock: product.inStock,
                    }}
                    variant="secondary"
                    className="w-full text-white hover:bg-theme-accent-secondary/70"
                    showIcon={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
