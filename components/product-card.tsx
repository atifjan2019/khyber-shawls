// components/product-card.tsx
"use client";

import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { formatCurrency } from "@/lib/currency";
import type { SerializedProduct } from "@/lib/products";

type Props = {
  product: SerializedProduct;
};

// Generate a random review count between 50 and 250
function getRandomReviewCount(productId: string): number {
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 50 + (hash % 201);
}

// Generate a random rating between 4.5 and 5.0
function getRandomRating(productId: string): number {
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 4.5 + (hash % 6) / 10;
}

export function ProductCard({ product: p }: Props) {
  const reviewCount = getRandomReviewCount(p.id);
  const rating = getRandomRating(p.id);

  return (
    <Link href={`/products/${p.slug}`} className="group block bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm sm:shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <SafeImage
          src={p.featuredImageUrl ?? p.gallery?.[0]?.url ?? "/placeholder.svg"}
          alt={p.featuredImageAlt ?? p.gallery?.[0]?.alt ?? p.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Stock Badge */}
        {p.inStock ? (
          <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-emerald-500 text-white text-[8px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm">
            In Stock
          </div>
        ) : (
          <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-red-500 text-white text-[8px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm">
            Sold Out
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 sm:p-4 md:p-5">
        {/* Title and Price Row */}
        <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1 sm:mb-2">
          <h2 className="text-[11px] sm:text-base md:text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-1 leading-tight flex-1">
            {p.title}
          </h2>
          <span className="text-[11px] sm:text-base md:text-lg font-bold text-gray-900 whitespace-nowrap">
            {formatCurrency(p.price)}
          </span>
        </div>

        {/* Subtitle/Description */}
        <p className="text-[9px] sm:text-sm text-gray-500 mb-1.5 sm:mb-3 line-clamp-1">
          Handwoven · Premium Quality
        </p>

        {/* Rating Row */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-emerald-500 text-[10px] sm:text-sm md:text-base">★</span>
            ))}
          </div>
          <span className="text-[9px] sm:text-xs md:text-sm text-gray-600">
            {rating.toFixed(1)} ({reviewCount} reviews)
          </span>
        </div>
      </div>
    </Link>
  );
}