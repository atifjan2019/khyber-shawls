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
    <Link href={`/products/${p.slug}`} className="group block cursor-pointer bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm sm:shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <SafeImage
          src={p.featuredImageUrl ?? p.gallery?.[0]?.url ?? "/placeholder.svg"}
          alt={p.featuredImageAlt ?? p.gallery?.[0]?.alt ?? p.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover scale-110 transition-transform duration-500 group-hover:scale-[1.15]"
          style={{ objectPosition: 'center center' }}
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
        {/* Mobile Layout: Title, Reviews, Price stacked */}
        <div className="sm:hidden">
          <h2 className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-tight mb-2">
            {p.title}
          </h2>
          
          {/* Rating Row */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-400 text-sm">★</span>
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {reviewCount} reviews
            </span>
          </div>
          
          {/* Price */}
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(p.price)}
          </span>
        </div>

        {/* Desktop Layout: Title+Price row, Subtitle, Reviews */}
        <div className="hidden sm:block">
          {/* Title and Price Row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-1 leading-tight flex-1">
              {p.title}
            </h2>
            <span className="text-base md:text-lg font-bold text-gray-900 whitespace-nowrap">
              {formatCurrency(p.price)}
            </span>
          </div>

          {/* Subtitle/Description */}
          <p className="text-sm text-gray-500 mb-3 line-clamp-1">
            Handwoven · Premium Quality
          </p>

          {/* Rating Row */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-emerald-500 text-sm md:text-base">★</span>
              ))}
            </div>
            <span className="text-xs md:text-sm text-gray-600">
              {rating.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}