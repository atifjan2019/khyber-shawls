// app/page.tsx
import Image from "next/image"
import Link from "next/link"

import { fetchHeroContent } from "@/lib/hero"
import type { SerializedCategory, SerializedProduct } from "@/lib/products"
import { fetchCategoriesWithProducts, fetchPublishedProducts } from "@/lib/products"

export default async function HomePage() {
  const [hero, products, categories] = await Promise.all([
    fetchHeroContent("home-hero"),
    fetchPublishedProducts(),
    fetchCategoriesWithProducts(),
  ])

  return (
    <div className="bg-white">
      {/* ======================= HERO ======================= */}
      <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 isolate overflow-hidden pt-0">
        <div className="absolute inset-0 -z-10">
          {hero.backgroundImageUrl ? (
            <Image
              src={hero.backgroundImageUrl}
              alt={hero.backgroundImageAlt ?? hero.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <Image
              src="/hero/khyber-hero.jpg"
              alt="Khyber Shawls artisan banner"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/55 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
        </div>

        <div className="w-full px-6 py-16 text-center text-white sm:py-24 lg:py-28">
          <div className="mx-auto mb-6 h-10 w-auto">
            {/* <Image
              src="/logo.svg"
              alt="Khyber Shawls"
              width={160}
              height={40}
              className="mx-auto drop-shadow"
            /> */}
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            {hero.title || "Welcome to Khyber Shawls"}
          </h1>
          {hero.subtitle && (
            <p className="mt-3 text-lg text-white/80 sm:text-xl">{hero.subtitle}</p>
          )}
          {hero.description && (
            <p className="mt-6 mx-auto max-w-2xl text-sm text-white/70 sm:text-base">
              {hero.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={hero.ctaHref || "#categories"}
              className="rounded-full bg-amber-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-amber-800"
            >
              {hero.ctaLabel || "Explore Collections"}
            </Link>
            <Link
              href="#categories"
              className="rounded-full bg-white/80 px-6 py-3 text-sm font-medium text-gray-900 transition hover:bg-white"
            >
              Browse Categories
            </Link>
          </div>
        </div>

        <svg
          className="absolute bottom-[-1px] left-0 right-0 -z-10"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
        >
          <path d="M0,40 C300,110 1140,-20 1440,50 L1440,90 L0,90 Z" fill="#f4ede3" />
        </svg>
      </section>

      {/* ======================= CATEGORIES ======================= */}
      <section id="categories" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Curated edits</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
              Shop by mood and moment
            </h2>
          </div>
          <Link
            href="/collections"
            className="rounded-full border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-600 hover:text-white"
          >
            View all collections
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {categories.slice(0, 3).map((category: SerializedCategory, index) => (
            <Link
              href={`/category/${category.slug}`}
              key={category.id}
              className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0">
                <Image
                  src={category.featuredImageUrl ?? "/placeholder.svg"}
                  alt={category.featuredImageAlt ?? `${category.name} category`}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
              </div>
              <div className="relative flex h-72 flex-col justify-end space-y-3 p-6 text-white">
                <span className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold uppercase tracking-[0.3em]">
                  {index + 1}
                </span>
                <h3 className="text-2xl font-semibold">{category.name}</h3>
                {category.summary && (
                  <p className="text-sm text-white/80 line-clamp-3">{category.summary}</p>
                )}
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-gray-900 transition group-hover:bg-white">
                  Explore collection →{" "}
                  <span className="text-[10px] uppercase tracking-[0.4em]">
                    {category.productCount} styles
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-700">
              Atelier picks
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
              Featured shawls for this season
            </h2>
          </div>
          <Link
            href="/collections"
            className="text-sm font-medium text-amber-700 hover:text-amber-800"
          >
            Browse the full atelier →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 6).map((product: SerializedProduct, index) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white via-white/90 to-white/70 p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-200/10 via-transparent to-amber-300/30 opacity-0 transition group-hover:opacity-100" />
              <div className="relative flex flex-col gap-4">
                <div className="relative h-64 overflow-hidden rounded-2xl border border-white/40 bg-white shadow-inner">
                  <Image
                    src={
                      product.featuredImageUrl ??
                      product.gallery?.[0]?.url ??
                      "/placeholder.svg"
                    }
                    alt={
                      product.featuredImageAlt ??
                      product.gallery?.[0]?.alt ??
                      `${product.title ?? "Khyber Shawls product"} image`
                    }
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {product.categoryName ?? "Signature"}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-amber-700">
                    {product.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    ${typeof product.price === "number"
                      ? product.price.toFixed(2)
                      : product.price}
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-xs font-medium text-white transition group-hover:bg-amber-700">
                  View details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
