"use client";

import { Button } from "@/src/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/src/contexts/cart-context";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    variant: string;
    variantId: string;
    inStock: boolean;
  };
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function AddToCartButton({
  product,
  variant = "default",
  size = "default",
  className = "",
  showIcon = true,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAdd = useCallback(() => {
    if (!product.inStock) {
      toast.error("The product is out of stock!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      addToCart(product);
      setLoading(false);
      toast.success(`${product.name} added to cart!`);
    }, 400);
  }, [addToCart, product]);

  if (!product.inStock) {
    return (
      <Button
        size={size}
        variant="secondary"
        onClick={() => toast("Implement alert function!")}
        className={`${className}`}
      >
        Alert Me
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAdd}
      disabled={loading}
      className={`transition-all duration-200 ${className} ${
        loading ? "opacity-80" : ""
      }`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
          Adding...
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className="w-4 h-4" />}
          Add to Cart
        </>
      )}
    </Button>
  );
}
