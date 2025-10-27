'use client'

import Image from "next/image"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"
type ProductCardProduct = {
  id: string
  title: string
  description: string
  price: number
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  gallery: Array<{
    id: string
    url: string
    alt: string | null
    position: number
  }>
  categoryName?: string | null
}

type ProductCardProps = {
  product: ProductCardProduct
  onAddToCart: (id: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const imageSource = product.featuredImageUrl ?? product.gallery[0]?.url ?? "/hero-shawl.svg"
  const imageAlt =
    product.featuredImageAlt ?? product.gallery[0]?.alt ?? `${product.title} product image`
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={imageSource}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          {product.categoryName && (
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {product.categoryName}
            </p>
          )}
          <h3 className="mt-2 text-lg font-semibold">{product.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.description}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-base font-semibold">
            {formatCurrency(product.price)}
          </span>
          <Button size="sm" onClick={() => onAddToCart(product.id)}>
            Add to cart
          </Button>
        </div>
      </div>
    </article>
  )
}
