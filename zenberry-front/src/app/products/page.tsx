import { Suspense } from "react";
import { BaseLayout } from "@/src/components/layout/base-layout";
import { ProductsDataFetcher } from "@/src/app/products/_components/products-data-fetcher";
import { GetProductsParams } from "@/src/types/product-api";
import { ProductsLoader } from "./_components/products-loader";

// Revalidar a cada 60 segundos (ISR - Incremental Static Regeneration)
export const revalidate = 60;

export interface ProductsPageProps {
  searchParams: GetProductsParams;
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <BaseLayout
      config={{
        showHeader: true,
        showFooter: true,
        showHeroCta: false,
        backgroundImage: "/zenberry-product-background-small.webp",
        backgroundImageSize: "small",
      }}
    >
      <Suspense fallback={<ProductsLoader />}>
        <ProductsDataFetcher searchParams={searchParams} />
      </Suspense>
    </BaseLayout>
  );
}
