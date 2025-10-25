// app/page.tsx
import Image from "next/image"
import Link from "next/link"

import { HeroCarousel } from "@/components/hero-carousel"
import { fetchAllHeroContent } from "@/lib/hero"
import { fetchCategoriesWithProducts, fetchPublishedProducts } from "@/lib/products"
import { formatCurrency } from "@/lib/currency"

export default async function HomePage() {
  const [heroSlides, products, categories] = await Promise.all([
    fetchAllHeroContent(),
    fetchPublishedProducts(),
    fetchCategoriesWithProducts(),
  ])

  const homeHeroSlides = heroSlides.filter((slide) =>
    slide.key.startsWith("home-hero")
  )

  return (
    <div className="bg-white">
      {/* ======================= HERO ======================= */}
      <HeroCarousel slides={homeHeroSlides} fallbackImage="/hero/khyber-hero.jpg" />

           {/* ======================= BEST SELLERS ======================= */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Editor’s Choice</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900">Best Sellers</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-amber-700 hover:text-amber-800">
            View all →
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group rounded-3xl overflow-hidden bg-white shadow hover:shadow-lg transition"
            >
              <div className="relative h-64">
                <Image
                  src={p.featuredImageUrl ?? p.gallery?.[0]?.url ?? "/placeholder.svg"}
                  alt={p.featuredImageAlt ?? p.gallery?.[0]?.alt ?? p.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute bottom-3 right-3 rounded-full bg-amber-700/95 px-3 py-1 text-xs text-white">
                  {formatCurrency(p.price)}
                </span>
              </div>
              <div className="p-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">
                  {p.categoryName ?? "Signature"}
                </p>
                <h3 className="mt-1 text-base font-semibold text-gray-900 group-hover:text-amber-700">
                  {p.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ======================= BRAND / EDITORIAL INTRO ======================= */}
      <section className="mx-auto max-w-6xl px-6 pb-6">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr] items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Pashmina Shawls — Heritage Craft Meets Modern Style
            </h2>
            <p className="mt-4 text-gray-700 leading-relaxed">
              Our shawls are hand-woven with carefully selected fibres and finished with natural dyes.
              The result is a drape that feels featherlight yet enduring — designed for celebrations,
              seasons, and the stories you’ll carry forward.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              From timeless solids to intricate borders, each piece is editioned and finished by artisans
              using techniques passed down through generations.
            </p>
          </div>
          <div className="relative h-72 overflow-hidden rounded-3xl">
            <Image
              src="/hero/atelier-story.jpg"
              alt="Atelier craftsmanship"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* ======================= NEW ARRIVALS ======================= */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Just In</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900">New Arrivals</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-amber-700 hover:text-amber-800">
            Shop new →
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products
            .slice(0, 12)
            .sort((a, b) => (a.id < b.id ? 1 : -1)) // simple pseudo "new" order
            .slice(0, 8)
            .map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group rounded-3xl overflow-hidden bg-white shadow hover:shadow-lg transition"
              >
                <div className="relative h-64">
                  <Image
                    src={p.featuredImageUrl ?? p.gallery?.[0]?.url ?? "/placeholder.svg"}
                    alt={p.featuredImageAlt ?? p.gallery?.[0]?.alt ?? p.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">
                    {p.categoryName ?? "Signature"}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-gray-900 group-hover:text-amber-700">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{formatCurrency(p.price)}</p>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* ======================= WHY KHYBER IS THE BEST ======================= */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="relative rounded-3xl overflow-hidden h-80">
            <Image
              src="/hero/khyber-hero.jpg"
              alt="Why Khyber is the best"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Why Khyber</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900">
              The Best of Pashmina Craft
            </h2>
            <p className="mt-4 text-gray-700 leading-relaxed">
              We combine premium fibres, natural dyeing, and slow finishing to create modern heirlooms.
              Our editioned drops keep each design rare and special.
            </p>
            <ul className="mt-4 grid gap-3 text-gray-700 text-sm">
              <li>• Premium fibres & natural pigments</li>
              <li>• Hand-woven motifs & finished embroidery</li>
              <li>• Editioned releases to preserve rarity</li>
              <li>• Traceable provenance with each piece</li>
            </ul>
            <Link
              href="/about"
              className="inline-block mt-6 rounded-full bg-amber-700 px-5 py-3 text-sm font-medium text-white hover:bg-amber-800 transition"
            >
              Discover our values
            </Link>
          </div>
        </div>
      </section>

      {/* ======================= FEATURES OF KHYBER SHAWLS ======================= */}
      <section className="bg-[#f4ede3]/50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 text-center">
            Features of Khyber Shawls
          </h2>
          <p className="mt-3 text-center text-gray-700 max-w-2xl mx-auto">
            Crafted to last a lifetime — soft on the skin, strong in structure, and timeless in style.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Pure Pashmina Weave", d: "Featherlight drape with enduring structure." },
              { t: "Natural Dye Palette", d: "Pigments from walnut, saffron, and madder roots." },
              { t: "Editioned Designs", d: "Limited quantities to preserve rarity and value." },
              { t: "Provenance Certificate", d: "Trace fibres back to artisan cooperatives." },
            ].map((f) => (
              <div
                key={f.t}
                className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-amber-700">{f.t}</h3>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= WOMEN’S EDIT (OPTIONAL) ======================= */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-700">For Her</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900">Women’s Edit</h2>
          </div>
          <Link href="/category/women-shawls" className="text-sm font-medium text-amber-700 hover:text-amber-800">
            Explore →
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories
            .filter((c) => c.slug.includes("women"))
            .slice(0, 1)
            .flatMap((c) =>
              products.filter((p) => p.categoryName === c.name).slice(0, 8)
            )
            .map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group rounded-3xl overflow-hidden bg-white shadow hover:shadow-lg transition"
              >
                <div className="relative h-64">
                  <Image
                    src={p.featuredImageUrl ?? p.gallery?.[0]?.url ?? "/placeholder.svg"}
                    alt={p.featuredImageAlt ?? p.gallery?.[0]?.alt ?? p.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">
                    {p.categoryName ?? "Signature"}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-gray-900 group-hover:text-amber-700">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{formatCurrency(p.price)}</p>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* ======================= PROMISE / WARRANTY ======================= */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-amber-600 to-amber-700 text-white p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Khyber Care Promise</h2>
          <p className="mt-2 text-white/90 max-w-2xl mx-auto">
            Complimentary steaming & mending for one year. Guidance for seasonal storage. Help when you need it.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-full bg-white/15 px-4 py-2">Fast Support</span>
            <span className="rounded-full bg-white/15 px-4 py-2">Care Tips Included</span>
            <span className="rounded-full bg-white/15 px-4 py-2">Hassle-free Returns</span>
          </div>
        </div>
      </section>

      {/* ======================= ALL PRODUCTS (TEASER) ======================= */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-700">All Styles</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900">Explore the Atelier</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-amber-700 hover:text-amber-800">
            View all →
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 12).map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group rounded-3xl overflow-hidden bg-white shadow hover:shadow-lg transition"
            >
              <div className="relative h-64">
                <Image
                  src={p.featuredImageUrl ?? p.gallery?.[0]?.url ?? "/placeholder.svg"}
                  alt={p.featuredImageAlt ?? p.gallery?.[0]?.alt ?? p.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">
                  {p.categoryName ?? "Signature"}
                </p>
                <h3 className="mt-1 text-base font-semibold text-gray-900 group-hover:text-amber-700">
                  {p.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{formatCurrency(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
