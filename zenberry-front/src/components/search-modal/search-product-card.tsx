import Image from "next/image";
import { Product } from "@/src/types/product";
import Link from "next/link";

interface SearchProductCardProps {
  product: Product;
  onSelect: () => void;
}

export function SearchProductCard({
  product,
  onSelect,
}: SearchProductCardProps) {
  return (
    <Link
      href={`/product/${product.id}`}
      onClick={onSelect}
      className="shrink-0 w-48 hover:scale-103 transition-transform"
      aria-label={`Ver detalhes de ${product.name}`}
    >
      <div className="h-full">
        <div className="relative aspect-square">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain rounded-md"
          />
        </div>
        <h3 className="text-sm text-white line-clamp-2 mt-3 mb-1">{product.name}</h3>
        <p className="text-white font-bold">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
