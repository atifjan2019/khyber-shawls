'use client'

import Image from "next/image"
import Link from "next/link"

import { ProductCard } from "@/components/product-card"
import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import type { SerializedCategory, SerializedProduct } from "@/lib/products"

const heroHighlights = [
  "Free worldwide shipping on orders over $250",
  "Hand-embroidered artisan designs sourced ethically",
  "Ships in 24 hours from our Khyber atelier",
]

type ShopClientProps = {
  products: SerializedProduct[]
  categories: SerializedCategory[]
}

export function ShopClient({ products, categories }: ShopClientProps) {
  const { addItem } = useCart()

  return (
    <div className="space-y-20">
      <section className="grid items-center gap-12 rounded-[2.5rem] border bg-gradient-to-br from-background via-background to-secondary/20 p-10 md:grid-cols-[1.1fr,0.9fr] md:p-16">
        <div className="space-y-8">
          <p className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Winter 2025 collection
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Heirloom Kashmiri shawls crafted to stand the test of time.
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Experience the warmth and elegance of authentic Pashmina sourced
            directly from master artisans in the valleys of Khyber. Each weave
            tells a story of tradition, patience, and artistry.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/category/signature">Explore signature pieces</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/checkout">Checkout now</Link>
            </Button>
          </div>
          <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {heroHighlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-primary/40 blur-3xl" />
          <Image
            src="/hero-shawl.svg"
            alt="Model wearing a handcrafted Khyber shawl"
            width={1200}
            height={630}
            priority
            className="relative z-10 w-full rounded-3xl object-cover shadow-2xl"
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Threads dyed with natural pigments by artisans in the Khyber region.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Shop all shawls</h2>
            <p className="text-muted-foreground">
              Discover our latest releases, lovingly woven in small batches.
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/cart">Review your cart</Link>
          </Button>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <p className="text-muted-foreground">
              New pieces are being prepared. Check back soon or subscribe to our journal.
            </p>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addItem}
              />
            ))
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Browse by category</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="relative h-36 w-full overflow-hidden">
                {category.featuredImageUrl ? (
                  <Image
                    src={category.featuredImageUrl}
                    alt={category.featuredImageAlt ?? `${category.name} collection`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
                    Visual coming soon
                  </div>
                )}
              </div>
              <div className="space-y-2 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {category.productCount} styles
                </p>
                <h3 className="text-lg font-semibold group-hover:text-primary">
                  {category.name}
                </h3>
                {category.summary && (
                  <p className="text-sm text-muted-foreground">
                    {category.summary}
                  </p>
                )}
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Shop collection
                  <span aria-hidden>&rarr;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
