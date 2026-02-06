"use client";

import { Button } from "@/src/components/ui/button";
import { useTransition } from "react";
import { createCheckoutFromCart } from "@/src/services/server/cart-service";
import { toast } from "sonner";
import { useProtectedAction } from "@/src/hooks/use-protected-action";

interface BuyNowButtonProps {
  product: {
    id: string;
    name: string;
    variantId: string;
    inStock: boolean;
  };
  quantity?: number;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function BuyNowButton({
  product,
  quantity = 1,
  variant = "default",
  size = "default",
  className = "",
}: BuyNowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const executeProtectedAction = useProtectedAction();

  const handleBuyNow = () => {
    if (!product.inStock) {
      toast.error("Product is out of stock!");
      return;
    }

    startTransition(async () => {
      try {
        await executeProtectedAction(async () => {
          await createCheckoutFromCart([
            {
              variantId: product.variantId,
              quantity,
            },
          ]);
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to proceed to checkout";
        console.error("Checkout error:", error);
        toast.error(errorMessage);
      }
    });
  };

  if (!product.inStock) {
    return (
      <Button
        disabled
        size={size}
        variant="ghost"
        className={`opacity-50 cursor-not-allowed bg-[#d3d3d3] ${className}`}
      >
        Out of Stock
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleBuyNow}
      disabled={isPending}
      className={`transition-all duration-200 ${className} ${
        isPending ? "opacity-80" : ""
      }`}
    >
      {isPending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
          Processing...
        </>
      ) : (
        "Buy Now"
      )}
    </Button>
  );
}
