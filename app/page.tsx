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
    <div className="bg-gradient-to-b from-white via-[#faf7f2] to-[#f4ede3]">
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
      <section id="categories" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold mb-10 text-gray-900 text-center">Shop by Category</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.map((category: SerializedCategory) => (
            <Link
              href={`/category/${category.slug}`}
              key={category.id}
              className="group rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative w-full aspect-square">
                <Image
                  src={category.featuredImageUrl ?? "/placeholder.svg"}
                  alt={category.featuredImageAlt ?? `${category.name} category`}
                  fill
                  sizes="(max-width:768px) 50vw, (max-width:1024px) 25vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-gray-900 font-medium group-hover:text-amber-700">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ======================= FEATURED PRODUCTS ======================= */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-semibold mb-10 text-gray-900 text-center">Featured Shawls</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.slice(0, 8).map((product: SerializedProduct) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="relative w-full aspect-square overflow-hidden rounded-t-xl">
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
                  sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-amber-700">
                  {product.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {product.categoryName ?? "Uncategorised"}
                </p>
                <p className="mt-2 text-lg font-medium text-gray-800">
                  {typeof product.price === "number"
                    ? `$${product.price.toFixed(2)}`
                    : product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
