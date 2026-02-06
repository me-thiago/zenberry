"use client"

import { Heart, Share2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Product } from "@/src/types/product";
import { useFavorites } from "@/src/hooks/use-favorites";
import { useAuthContext } from "@/src/contexts/auth-context";

interface ProductByIdActionsProps {
  productName: string;
  productDescription: string;
  product: Product;
}

export function ProductByIdActions({
  productName,
  productDescription,
  product,
}: ProductByIdActionsProps) {
  const { customer, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const { favorites, isFavorite, addFavorite, removeFavorite, isHydrated } = useFavorites(customer?.id ?? null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (isHydrated) {
      setIsLiked(isFavorite(product.id));
    }
  }, [isHydrated, favorites, isFavorite, product.id]);

  const handleLike = useCallback(() => {
    if (isLiked) {
      removeFavorite(product.id);
      toast("Removed from favorites");
      setIsLiked((prev) => !prev);
    } else {
      // Verificar se o usuário está autenticado antes de adicionar aos favoritos
      if (!isAuthenticated) {
        toast.error("You need to be logged in to add to favorites");
        router.push("/auth");
        return;
      }
      addFavorite(product);
      toast("Added to favorites");
      setIsLiked((prev) => !prev);
    }
  }, [isLiked, product, addFavorite, removeFavorite, isAuthenticated, router]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: productName,
          text: productDescription,
          url: window.location.href,
        })
        .catch(() => {
          navigator.clipboard.writeText(window.location.href);
          toast("Link copied to clipboard!");
        });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard!");
    }
  }, [productName, productDescription]);

  return (
    <div className="flex gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={handleLike}
        aria-label={
          isLiked ? "Remove from favorites" : "Add to favorites"
        }
        className={`hover:bg-theme-bg-secondary ${
          isLiked ? "text-red-500" : "text-theme-text-secondary"
        }`}
      >
        <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500" : ""}`} />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleShare}
        aria-label="Share product"
        disabled={!navigator.share && !navigator.clipboard}
        className="hover:bg-theme-bg-secondary text-theme-text-secondary"
      >
        <Share2 className="w-5 h-5" />
      </Button>
    </div>
  );
}
