// components/product-card.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
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
    <div className="w-full rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-2xl transition-all duration-300 hover:shadow-xl md:hover:scale-105 bg-white">
      {/* Product Image */}
      <Link
        href={`/products/${p.slug}`}
        className="block relative h-48 sm:h-56 md:h-64 lg:h-80 bg-gradient-to-br from-amber-600 to-amber-900"
      >
        <Image
          src={p.featuredImageUrl ?? p.gallery?.[0]?.url ?? "/placeholder.svg"}
          alt={p.featuredImageAlt ?? p.gallery?.[0]?.alt ?? p.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-110"
        />
      </Link>

      {/* Product Details */}
      <div className="p-3 sm:p-4 md:p-6">
        {/* Stock Badge */}
        <div className="mb-2 md:mb-3">
          {p.inStock ? (
            <span className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-semibold bg-green-100 text-green-800">
              ✓ In Stock
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-semibold bg-red-100 text-red-800">
              Out of Stock
            </span>
          )}
        </div>

        {/* Product Name */}
        <Link href={`/products/${p.slug}`}>
          <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold mb-1 md:mb-2 text-gray-800 hover:text-amber-700 transition-colors line-clamp-2">
            {p.title}
          </h2>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-2 md:mb-3">
          <div className="flex space-x-0.5 md:space-x-1">
            <span className="text-amber-600 text-xs md:text-base lg:text-xl">★</span>
            <span className="text-amber-600 text-xs md:text-base lg:text-xl">★</span>
            <span className="text-amber-600 text-xs md:text-base lg:text-xl">★</span>
            <span className="text-amber-600 text-xs md:text-base lg:text-xl">★</span>
            <span className="text-amber-600 text-xs md:text-base lg:text-xl">★</span>
          </div>
          <span className="ml-1 md:ml-2 text-[10px] md:text-xs lg:text-sm text-gray-600">({reviewCount})</span>
        </div>

        {/* Description - Hidden on mobile */}
        <p className="hidden sm:block mb-3 md:mb-4 leading-relaxed text-xs md:text-sm text-gray-700 line-clamp-2">
          {p.description}
        </p>

        {/* Price and Button */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-amber-800">
            {formatCurrency(p.price)}
          </span>
          <div onClick={(e) => e.stopPropagation()}>
            <AddToCartButton productId={p.id} />
          </div>
        </div>
      </div>
    </div>
  );
}