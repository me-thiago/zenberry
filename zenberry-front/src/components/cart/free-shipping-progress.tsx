interface FreeShippingProgressProps {
  subtotal: number;
}

export function FreeShippingProgress({ subtotal }: FreeShippingProgressProps) {
  return (
    <div className="p-4 bg-theme-bg-secondary border-b border-theme-text-secondary/10">
      <div className="text-sm text-theme-text-secondary mb-2">
        You are{" "}
        <span className="font-semibold text-theme-accent-secondary">
          ${(50 - subtotal).toFixed(2)}
        </span>{" "}
        away from{" "}
        <span className="font-semibold text-green-600">FREE SHIPPING!</span>
      </div>
      <div className="w-full bg-theme-text-secondary/20 rounded-full h-2">
        <div
          className="bg-theme-accent-secondary h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
