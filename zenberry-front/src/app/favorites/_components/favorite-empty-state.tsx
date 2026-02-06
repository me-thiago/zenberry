import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function FavoritesEmptyState() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
      <div className="flex flex-col items-center justify-center py-20">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">
          No favorites yet
        </h2>
        <p className="text-gray-500 mb-6">
          Start adding products to your favorites list
        </p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    </div>
  );
}
