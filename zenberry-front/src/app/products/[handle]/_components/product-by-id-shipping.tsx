"use client"

import { useState } from "react";
import { MapPin, Truck } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";

export function ProductByIdShipping() {
  const [zipCode, setZipCode] = useState("");

  return (
    <div className="mt-6 p-4 bg-theme-bg-secondary rounded-lg border border-theme-text-secondary/10">
      <div className="flex items-start gap-3 mb-3">
        <Truck className="w-5 h-5 text-theme-accent-secondary mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-theme-text-primary mb-1">
            Free shipping on orders $75+ Or All Autoship Orders.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-secondary" />
          <Input
            type="text"
            placeholder="Enter ZIP code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="pl-10 bg-white border-theme-text-secondary/20"
            maxLength={5}
          />
        </div>
        <Button
          variant="secondary"
          className="border-theme-accent-primary text-white"
        >
          Check
        </Button>
      </div>
    </div>
  );
}
