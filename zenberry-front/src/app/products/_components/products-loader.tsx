interface ProductsLoaderProps {
  loadingMessage?: string;
}

export function ProductsLoader({ loadingMessage }: ProductsLoaderProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      role="status"
      aria-label="Loading products"
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-accent-secondary mx-auto mb-4"></div>
        <p className="text-theme-text-secondary">
          {loadingMessage || "Loading products..."}
        </p>
      </div>
    </div>
  );
}
