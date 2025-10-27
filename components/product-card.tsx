// components/product-card.tsx
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/currency";
import { AddToCartButton } from "./product/add-to-cart-button";
import type { SerializedProduct } from "@/lib/products";

type Props = {
  product: SerializedProduct;
};

export function ProductCard({ product: p }: Props) {
  return (
    <div className="group relative flex flex-col rounded-3xl overflow-hidden bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl">
      <Link href={`/products/${p.slug}`} className="flex-grow">
        <div className="relative h-64">
          <Image
            src={p.featuredImageUrl ?? p.gallery?.[0]?.url ?? "/placeholder.svg"}
            alt={p.featuredImageAlt ?? p.gallery?.[0]?.alt ?? p.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500">
            {p.categoryName ?? "Signature"}
          </p>
          <h3 className="mt-1 font-semibold text-gray-800">
            {p.title}
          </h3>
          <p className="mt-2 text-lg font-bold text-amber-700">
            {formatCurrency(p.price)}
          </p>
        </div>
      </Link>
      <div className="p-4 pt-0">
        <AddToCartButton productId={p.id} />
      </div>
    </div>
  );
}