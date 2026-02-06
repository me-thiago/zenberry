import { Separator } from "@/src/components/ui/separator";
import { Button } from "@/src/components/ui/button";
import { ArrowRight, UserCheck } from "lucide-react";
import { createCheckoutFromCart } from "@/src/services/server/cart-service";
import { useCart } from "@/src/contexts/cart-context";
import { useAuthContext } from "@/src/contexts/auth-context";
import { useState, useTransition } from "react";
import { useProtectedAction } from "@/src/hooks/use-protected-action";

interface CartFooterProps {
  cartCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  onContinueShopping: () => void;
}

export function CartFooter({
  cartCount,
  subtotal,
  shipping,
  tax,
  total,
  onContinueShopping,
}: CartFooterProps) {
  const { cartItems } = useCart();
  const { isAuthenticated, customer } = useAuthContext();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const executeProtectedAction = useProtectedAction();

  const handleCheckout = () => {
    setError(null);
    
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    startTransition(async () => {
      try {
        const lineItems = cartItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
        }));

        await executeProtectedAction(async () => {
          await createCheckoutFromCart(lineItems);
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Checkout failed";
        setError(errorMessage);
      }
    });
  };

  return (
    <div className="border-t border-theme-text-secondary/10">
      {/* Order Summary */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between text-sm text-theme-text-secondary">
          <span>Subtotal ({cartCount} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm text-theme-text-secondary">
          <span>Shipping</span>
          <span>
            {shipping === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex justify-between text-sm text-theme-text-secondary">
          <span>Tax (8%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <Separator className="bg-theme-text-secondary/20" />

        <div className="flex justify-between text-lg font-bold text-theme-text-primary">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 pb-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Authenticated User Info */}
      {isAuthenticated && customer && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <UserCheck className="w-4 h-4 text-green-600" />
            <div className="flex-1">
              <p className="text-xs font-medium text-green-800">
                Logged in as {customer.firstName} {customer.lastName}
              </p>
              <p className="text-xs text-green-600">{customer.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Buttons */}
      <div className="p-4 space-y-3">
        <Button
          size="lg"
          className="w-full bg-theme-accent-primary text-theme-accent-secondary hover:opacity-90 transition-all duration-200"
          onClick={handleCheckout}
          disabled={isPending || cartItems.length === 0}
        >
          {isPending ? "Processing..." : "Checkout"}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="w-full text-theme-accent-primary hover:bg-theme-accent-secondary/70"
          onClick={onContinueShopping}
          disabled={isPending}
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
