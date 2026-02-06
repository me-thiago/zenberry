interface ProductByIdPriceProps {
  productOriginalPrice?: number;
  productPrice: number;
}

export function ProductByIdPrice({
  productOriginalPrice,
  productPrice,
}: ProductByIdPriceProps) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-xl text-theme-accent-secondary transition-colors duration-200">
        Price:
      </span>
      {productOriginalPrice && (
        <span className="text-xl text-theme-text-secondary line-through transition-colors duration-200">
          ${productOriginalPrice}
        </span>
      )}
      <span className="text-4xl font-bold text-theme-accent-secondary transition-colors duration-200">
        ${productPrice}
      </span>
    </div>
  );
}
