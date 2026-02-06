"use client";

import { useCallback, useEffect, useMemo } from "react";
import { X, ShoppingCart } from "lucide-react";
import { useCart } from "@/src/contexts/cart-context";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { CartItem } from "./cart-item";
import { FreeShippingProgress } from "./free-shipping-progress";
import { CartFooter } from "./cart-footer";

export function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartCount,
    cartTotal,
  } = useCart();

  const { subtotal, shipping, tax, total } = useMemo(() => {
    const subtotal = cartTotal;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [cartTotal]);

  const handleClose = useCallback(() => setIsCartOpen(false), [setIsCartOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        aria-label="Fechar carrinho"
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-theme-bg-primary z-50 shadow-xl transition-transform duration-300 transform translate-x-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-theme-text-secondary/10">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-theme-accent-secondary" />
              <h2 className="text-xl font-bold text-theme-text-primary">
                Your Cart
              </h2>
              <Badge
                variant="secondary"
                className="bg-theme-accent-secondary text-white"
              >
                {cartCount}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
              className="text-theme-text-secondary hover:text-theme-text-primary"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Free Shipping Progress */}
          {shipping > 0 && <FreeShippingProgress subtotal={subtotal} />}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
                  Your cart is empty
                </h3>
                <p className="text-theme-text-secondary mb-6">
                  Add your favorite items to your cart
                </p>
                <Button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-theme-accent-secondary text-white hover:opacity-90"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer - Order Summary & Checkout */}
          {cartItems.length > 0 && (
            <CartFooter
              cartCount={cartCount}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              onContinueShopping={handleClose}
            />
          )}
        </div>
      </div>
    </>
  );
}
