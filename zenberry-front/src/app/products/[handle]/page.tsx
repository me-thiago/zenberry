import { Suspense } from "react";
import { BaseLayout } from "@/src/components/layout/base-layout";
import { ProductByIdDataFetcher } from "@/src/app/products/[handle]/_components/product-by-id-data-fetcher";
import { ProductsLoader } from "../_components/products-loader";

export interface ProductByIdPageProps {
  params: {
    handle: string;
  };
}

export default async function ProductPage({ params }: ProductByIdPageProps) {
  const { handle } = await params;

  return (
    <BaseLayout
      config={{
        showHeader: true,
        showFooter: true,
        showHeroCta: true,
        backgroundImage: "/zenberry-product-background-small.webp",
        backgroundImageSize: "small",
      }}
    >
      <Suspense
        fallback={<ProductsLoader loadingMessage="Loading product..." />}
      >
        <ProductByIdDataFetcher productHandle={handle} />
      </Suspense>
    </BaseLayout>
  );
}
