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
    <div className="max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 bg-white">
      {/* Product Image */}
      <Link
        href={`/products/${p.slug}`}
        className="block relative h-80 bg-gradient-to-br from-amber-600 to-amber-900"
      >
        <Image
          src={p.featuredImageUrl ?? p.gallery?.[0]?.url ?? "/placeholder.svg"}
          alt={p.featuredImageAlt ?? p.gallery?.[0]?.alt ?? p.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-110"
        />
      </Link>

      {/* Product Details */}
      <div className="p-6">
        {/* Product Name */}
        <Link href={`/products/${p.slug}`}>
          <h2 className="text-2xl font-bold mb-2 text-gray-800 hover:text-amber-700 transition-colors">
            {p.title}
          </h2>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex space-x-1">
            <span className="text-amber-600 text-xl transition-transform hover:scale-125">★</span>
            <span className="text-amber-600 text-xl transition-transform hover:scale-125">★</span>
            <span className="text-amber-600 text-xl transition-transform hover:scale-125">★</span>
            <span className="text-amber-600 text-xl transition-transform hover:scale-125">★</span>
            <span className="text-amber-600 text-xl transition-transform hover:scale-125">★</span>
          </div>
          <span className="ml-2 text-sm text-gray-600">({reviewCount} reviews)</span>
        </div>

        {/* Description */}
        <p className="mb-4 leading-relaxed text-gray-700 line-clamp-2">
          {p.description}
        </p>

        {/* Price and Button */}
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-amber-800">
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