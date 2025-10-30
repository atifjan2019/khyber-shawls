import Image from "next/image"
import Link from "next/link"

import { fetchCategoriesWithProducts, fetchPublishedProducts } from "@/lib/products"
import { formatCurrency } from "@/lib/currency"

export default async function CollectionsPage() {
  const [categories, products] = await Promise.all([
    fetchCategoriesWithProducts(),
    fetchPublishedProducts(),
  ])

  const spotlight = products.slice(0, 6)

  return (
    <div className="space-y-20 bg-gradient-to-b from-white via-[#faf7f2] to-[#f4ede3] pb-24">
      <section className="relative isolate left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-900 via-amber-700 to-black" />
        <div className="mx-auto max-w-[1600px] px-6 py-24 text-center text-white sm:py-32">
          <p className="text-xs uppercase tracking-[0.3em] text-white/80">
            Curated by the atelier
          </p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Signature Collections</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-white/75 sm:text-base">
            Explore heritage embroideries, contemporary silhouettes, and limited-edition colourways—handpicked for every season.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6">
        <h2 className="text-2xl font-semibold text-gray-900">Shop by story</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white shadow transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0">
                <Image
                  src={category.featuredImageUrl ?? "/placeholder.svg"}
                  alt={category.featuredImageAlt ?? category.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
              </div>
              <div className="relative flex h-64 flex-col justify-end space-y-3 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                  {category.productCount} styles
                </p>
                <h3 className="text-xl font-semibold">{category.name}</h3>
                {category.summary && (
                  <p className="text-sm text-white/80">{category.summary}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Atelier favourites
          </h2>
          <Link href="/about" className="text-sm font-medium text-amber-700 hover:text-amber-800">
            Learn about our craftsmanship
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spotlight.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src={product.featuredImageUrl ?? "/placeholder.svg"}
                  alt={product.featuredImageAlt ?? product.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {product.categoryName ?? "Signature"}
                </p>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-700">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-700">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
