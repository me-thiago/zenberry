import Image from "next/image";
import { ArrowDown, Minus, Plus, X } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { CartItem as CartItemType } from "@/src/contexts/cart-context";

interface CartItemProps {
  item: CartItemType;
  updateQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
}

export function CartItem({
  item,
  updateQuantity,
  removeFromCart,
}: CartItemProps) {
  return (
    <div className="flex gap-4 p-4 rounded-lg border border-theme-text-secondary/10">
      <Image
        src={item.image}
        alt="Product Image"
        width={100}
        height={40}
        className="rounded-lg flex items-center justify-center text-2xl shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-sm font-semibold text-theme-text-primary line-clamp-2">
            {item.name}
          </h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFromCart(item.id)}
            className="text-theme-text-secondary hover:text-red-500 h-6 w-6 shrink-0"
            aria-label={`Remove ${item.name} from cart`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-theme-text-secondary mb-2">{item.variant}</p>
        {!item.inStock && (
          <Badge
            variant="default"
            className="mb-2 text-xs bg-theme-accent-secondary text-theme-accent-primary"
          >
            <ArrowDown width={10} height={10} />
            15% Off
          </Badge>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-theme-text-secondary/20 rounded-md bg-theme-bg-primary">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="h-8 w-8 text-theme-text-primary hover:text-theme-accent-secondary disabled:opacity-50"
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium text-theme-text-primary">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="h-8 w-8 text-theme-text-primary hover:text-theme-accent-secondary"
              aria-label={`Increase quantity of ${item.name}`}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-theme-text-primary">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
            <div className="text-xs text-theme-text-secondary">
              ${item.price.toFixed(2)} each
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
