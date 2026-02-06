import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function OrdersEmptyState() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center py-20">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">
          No orders found
        </h2>
        <p className="text-gray-500 mb-6">
          You haven't placed any orders in this period yet
        </p>
        <Link href="/products">
          <Button>Explore Products</Button>
        </Link>
      </div>
    </div>
  );
}
