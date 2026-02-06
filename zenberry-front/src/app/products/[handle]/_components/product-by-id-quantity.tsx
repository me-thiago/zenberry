"use client";

import { useCallback, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "../../../../components/ui/button";

export function ProductByIdQuantity() {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = useCallback(
    (delta: number) => {
      setQuantity(Math.max(1, quantity + delta));
    },
    [quantity]
  );

  return (
    <div className="flex items-baseline gap-3">
      <span className="text-xl text-theme-accent-secondary transition-colors duration-200">
        Amount:
      </span>
      <div className="flex items-center border border-theme-text-secondary/20 rounded-lg bg-theme-bg-secondary transition-colors duration-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleQuantityChange(-1)}
          className="text-theme-text-primary hover:text-theme-accent-secondary"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="w-12 text-center text-theme-text-primary font-medium transition-colors duration-200">
          {quantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleQuantityChange(1)}
          className="text-theme-text-primary hover:text-theme-accent-secondary"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
