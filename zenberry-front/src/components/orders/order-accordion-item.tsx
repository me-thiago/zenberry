"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { Package } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";
import { Order } from "@/src/types/order";
import { createCheckoutFromCart } from "@/src/services/server/cart-service";
import { toast } from "sonner";

interface OrderAccordionItemProps {
  order: Order;
}

export function OrderAccordionItem({ order }: OrderAccordionItemProps) {
  const [isPending, startTransition] = useTransition();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const handleBuyAgain = (variantId: string, quantity: number = 1) => {
    startTransition(async () => {
      try {
        await createCheckoutFromCart([
          {
            variantId,
            quantity,
          },
        ]);
      } catch (error) {
        console.error("Checkout error:", error);
        toast.error("Failed to proceed to checkout. Please try again.");
      }
    });
  };

  return (
    <AccordionItem
      value={order.id}
      className="bg-card rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full pr-4 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Order #{order.id}</p>
              <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:ml-auto">
            <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              {order.status}
            </span>
            <span className="text-lg font-bold">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 sm:px-6 pb-4">
        <div className="space-y-4 pt-2">
          {/* Order Info */}
          {order.paymentMethod && (
            <div className="flex flex-col md:flex-row mb-6 pb-4 border-b text-secondary text-sm gap-2">
              {order.paymentMethod && (
                <span className="font-medium">
                  Payment:{" "}
                  <span className="font-normal">{order.paymentMethod}</span>
                </span>
              )}
              <span className="md:ml-auto cursor-pointer hover:underline">
                View Proof of Delivery
              </span>
            </div>
          )}

          {/* Order Products */}
          {order.products.map((product) => (
            <div
              key={product.id}
              className="flex flex-wrap gap-4 p-4 border rounded-lg"
            >
              <div className="relative w-24 h-24 bg-gray-100 rounded shrink-0">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Link href={`product/${product.handle}`}>
                  <h4 className="font-semibold mb-2 text-secondary">
                    {product.name}
                  </h4>
                </Link>
                {product.description && (
                  <p className="text-sm text-secondary mb-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-theme-accent-tertiary">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="text-sm text-secondary">
                    {product.reviewCount} reviews
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <Link href={`/products/${product.handle}`}>
                  <Button className="bg-secondary hover:bg-secondary/80 text-white w-full sm:w-auto">
                    View Details
                  </Button>
                </Link>
                <Button
                  onClick={() => handleBuyAgain(product.variantId, 1)}
                  disabled={isPending}
                  className={`bg-primary hover:bg-primary/70 text-secondary w-full sm:w-auto ${
                    isPending ? "opacity-80" : ""
                  }`}
                >
                  {isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-secondary border-t-transparent mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Buy Again"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
