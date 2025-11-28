// components/product-card.tsx
"use client";

import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { formatCurrency } from "@/lib/currency";
import { AddToCartButton } from "./product/add-to-cart-button";
import type { SerializedProduct } from "@/lib/products";

type Props = {
  product: SerializedProduct;
};

// Generate a random review count between 50 and 250
function getRandomReviewCount(productId: string): number {
  // Use product ID to generate consistent random number for each product
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 50 + (hash % 201); // Returns number between 50 and 250
}

export function ProductCard({ product: p }: Props) {
  const reviewCount = getRandomReviewCount(p.id);

  return (
    <div className="w-full rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-md sm:shadow-lg md:shadow-2xl transition-all duration-300 hover:shadow-xl md:hover:scale-105 bg-white">
      {/* Product Image */}
      <Link
        href={`/products/${p.slug}`}
        className="block relative h-52 sm:h-56 md:h-64 lg:h-80 bg-gradient-to-br from-amber-600 to-amber-900"
      >
        <SafeImage
          src={p.featuredImageUrl ?? p.gallery?.[0]?.url ?? "/placeholder.svg"}
          alt={p.featuredImageAlt ?? p.gallery?.[0]?.alt ?? p.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-110"
        />
      </Link>

      {/* Product Details */}
      <div className="p-3 sm:p-3 md:p-4 lg:p-6">
        {/* Stock Badge */}
        <div className="mb-2 sm:mb-2 md:mb-3">
          {p.inStock ? (
            <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-semibold bg-green-100 text-green-800">
              ✓ In Stock
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-semibold bg-red-100 text-red-800">
              Out of Stock
            </span>
          )}
        </div>

        {/* Product Name */}
        <Link href={`/products/${p.slug}`}>
          <h2 className="text-base sm:text-base md:text-xl lg:text-2xl font-bold mb-2 md:mb-2 text-gray-800 hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
            {p.title}
          </h2>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-2 sm:mb-2 md:mb-3">
          <div className="flex space-x-0.5 md:space-x-1">
            <span className="text-amber-600 text-sm md:text-base lg:text-xl">★</span>
            <span className="text-amber-600 text-sm md:text-base lg:text-xl">★</span>
            <span className="text-amber-600 text-sm md:text-base lg:text-xl">★</span>
            <span className="text-amber-600 text-sm md:text-base lg:text-xl">★</span>
            <span className="text-amber-600 text-sm md:text-base lg:text-xl">★</span>
          </div>
          <span className="ml-1 md:ml-2 text-[11px] md:text-xs lg:text-sm text-gray-600">({reviewCount})</span>
        </div>

        {/* Price and Button */}
        <div className="flex items-center justify-between gap-2 mt-3">
          <span className="text-lg sm:text-lg md:text-xl lg:text-2xl font-bold text-amber-800">
            {formatCurrency(p.price)}
          </span>
          {/* Hide Add to Cart button on mobile - user can add from product detail page */}
          <div onClick={(e) => e.stopPropagation()} className="hidden sm:block">
            <AddToCartButton productId={p.id} />
          </div>
        </div>
      </div>
    </div>
  );
}