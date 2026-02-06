import { ProductByIdBreadcrumb } from "@/src/app/products/[handle]/_components/product-by-id-breadcrumb";
import { ProductByIdImageGallery } from "@/src/app/products/[handle]/_components/product-by-id-image-gallery";
import { ProductByIdRating } from "@/src/app/products/[handle]/_components/product-by-id-rating";
import { ProductByIdActions } from "@/src/app/products/[handle]/_components/product-by-id-actions";
import { ProductByIdBadges } from "@/src/app/products/[handle]/_components/product-by-id-badges";
import { ProductByIdFeatures } from "@/src/app/products/[handle]/_components/product-by-id-features";
import { ProductByIdPurchaseSection } from "./product-by-id-purchase-section";
import { ProductByIdTabsInfos } from "@/src/app/products/[handle]/_components/product-by-id-tabs-infos";
import { ProductByIdInfoCards } from "@/src/app/products/[handle]/_components/product-by-id-info-cards";
import { ProductByIdComparison } from "@/src/app/products/[handle]/_components/product-by-id-comparison";
import { ProductByIdReviews } from "@/src/app/products/[handle]/_components/product-by-id-reviews";
import { ProductsSuggestion } from "@/src/components/products/products-suggestion";
import { Product } from "@/src/types/product";
import { Hero } from "@/src/components/hero/hero";

interface ProductByIdContentProps {
  product: Product;
}

export function ProductByIdContent({ product }: ProductByIdContentProps) {
  return (
    <div className="min-h-screen transition-colors duration-200">
      <Hero title="Products" />

      <div className="w-full bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 bg-background">
          {/* Breadcrumb */}
          <ProductByIdBreadcrumb />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <ProductByIdImageGallery product={product} />

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title */}
              <div className="flex gap-4 mb-3">
                <h1 className="text-4xl font-bold text-theme-text-primary transition-colors duration-200 flex-1">
                  {product.name}
                </h1>
              </div>

              <div className="flex justify-between items-center border-b border-theme-text-secondary/10 mb-4 pb-3">
                {/* Rating */}
                <ProductByIdRating
                  productRating={product.rating}
                  productReviewCount={product.reviewCount}
                />

                {/* Like & Share Buttons */}
                <ProductByIdActions
                  productName={product.name}
                  productDescription={product.description}
                  product={product}
                />
              </div>

              {/* Badges */}
              <ProductByIdBadges
                productBadges={[
                  product.cbdType,
                  product.productCategory,
                  product.format,
                ]}
              />

              {/* Product Features */}
              <ProductByIdFeatures />

              {/* Product Purchase Section */}
              <ProductByIdPurchaseSection product={product} />

              {/* Product Details Tabs */}
              <ProductByIdTabsInfos product={product} />
            </div>
          </div>

          {/* Info Cards Section */}
          <ProductByIdInfoCards />

          {/* Comparison Table Section */}
          <ProductByIdComparison />

          {/* Reviews Section */}
          <ProductByIdReviews />

          {/* Related Products */}
          <ProductsSuggestion title="Most Wanted" collectionHandle="most-wanted" productHandle={product.handle} />
        </div>
      </div>
    </div>
  );
}
