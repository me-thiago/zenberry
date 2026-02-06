import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Product } from "@/src/types/product";
import { AddToCartButton } from "@/src/components/button/add-to-cart-button";

interface FavoriteProductCardProps {
  product: Product;
  onRemove: (id: string) => void;
}

export function FavoriteProductCard({
  product,
  onRemove,
}: FavoriteProductCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-48 h-48 md:h-auto bg-gray-100 shrink-0">
          <Link href={`/product/${product.id}`}>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-4"
            />
          </Link>
        </div>
        <div className="flex-1 p-4 md:p-6">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <Link href={`/product/${product.id}`}>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {product.format}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {product.cbdType}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {product.productCategory}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  <span className="text-theme-accent-tertiary">★</span>
                  <span className="text-sm font-medium ml-1">
                    {product.rating}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                      {product.discount && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">
                          -{product.discount}%
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onRemove(product.id)}
                  className="border-red-200 hover:bg-red-50 hover:border-red-300"
                  aria-label={`Remove ${product.name} from favorites`}
                >
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </Button>
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
                  className="text-white hover:bg-theme-accent-secondary/70"
                  showIcon={true}
                />
                <Link
                  href={`/product/${product.id}`}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    className="w-full sm:w-auto hover:bg-theme-accent-primary/70"
                    aria-label={`View details of ${product.name}`}
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
