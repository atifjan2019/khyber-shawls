
'use client'

import Image from "next/image"
import Link from "next/link"

import { ProductCard } from "@/components/product-card"
import { useCart } from "@/components/providers/cart-provider"
import type { SerializedProduct } from "@/lib/products"

type CategoryViewProps = {
  categoryName: string
  categoryBlurb: string
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  products: SerializedProduct[]
}

export function CategoryView({
  categoryName,
  categoryBlurb,
  featuredImageUrl,
  featuredImageAlt,
  products,
}: CategoryViewProps) {
  const { addItem } = useCart()

  return (
    <div className="space-y-10">
      <div className="grid gap-8 rounded-3xl border bg-card/50 p-8 shadow-sm md:grid-cols-[1.2fr,1fr] md:p-12">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Curated selection
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {categoryName}
          </h1>
          {categoryBlurb && (
            <p className="max-w-2xl text-muted-foreground">{categoryBlurb}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>Showing {products.length} piece(s)</span>
            <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:inline" />
            <Link
              href="/"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Back to all shawls
            </Link>
          </div>
        </div>
        <div className="relative hidden overflow-hidden rounded-3xl bg-muted md:block">
          {featuredImageUrl ? (
            <Image
              src={featuredImageUrl}
              alt={featuredImageAlt ?? `${categoryName} hero image`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Collection hero coming soon
            </div>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
          No pieces are available in this category yet.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}
