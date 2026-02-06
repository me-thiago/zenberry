"use client";

import Image from "next/image";
import { useState } from "react";
import { Product } from "@/src/types/product";

interface ProductByIdImageGalleryProps {
  product: Product;
}

export function ProductByIdImageGallery({
  product,
}: ProductByIdImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4 grid grid-rows-[75%_25%]">
      {/* Main Image */}
      <div className="relative w-full bg-theme-bg-secondary rounded-lg transition-colors duration-200 border border-theme-text-secondary/20">
        <Image
          src={product.images[selectedImage]}
          alt={product.name}
          fill
          className="object-contain p-4"
          priority
        />
      </div>

      {/* Thumbnail Gallery */}
      <div className="grid grid-cols-4 gap-4">
        {product.images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`bg-theme-bg-secondary rounded-lg flex items-center justify-center text-4xl transition-all duration-200 border-2 ${
              selectedImage === index
                ? "border-theme-accent-secondary"
                : "border-theme-text-secondary/20 hover:border-theme-accent-secondary/50"
            }`}
          >
            <Image
              src={image}
              alt="Zenberry"
              width={100}
              height={35}
              priority
            />
          </button>
        ))}
      </div>
    </div>
  );
}
