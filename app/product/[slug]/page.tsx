import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { fetchCategoriesWithProducts, fetchProductBySlug, fetchPublishedProducts } from "@/lib/products"

type PageProps = {
  params: { slug: string }
}

export default async function ProductPage({ params }: PageProps) {
  const product = await fetchProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const [categories, products] = await Promise.all([
    fetchCategoriesWithProducts(),
    fetchPublishedProducts(),
  ])

  const related = products
    .filter((item) => item.slug !== product.slug && item.categoryName === product.categoryName)
    .slice(0, 4)

  return (
    <div className="space-y-20 bg-gradient-to-b from-white via-[#faf7f2] to-[#f4ede3] pb-20">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-16 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="relative overflow-hidden rounded-3xl border bg-white shadow-lg">
            <Image
              src={product.featuredImageUrl ?? product.gallery[0]?.url ?? "/placeholder.svg"}
              alt={product.featuredImageAlt ?? product.gallery[0]?.alt ?? product.title}
              width={900}
              height={900}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          {product.gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {product.gallery.slice(0, 4).map((media) => (
                <div key={media.id} className="relative overflow-hidden rounded-xl border bg-white shadow-sm">
                  <Image
                    src={media.url}
                    alt={media.alt ?? product.title}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6 rounded-3xl border border-white/20 bg-white/90 p-8 shadow-xl backdrop-blur">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-700">
              {product.categoryName ?? "Limited Edition"}
            </p>
            <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">{product.title}</h1>
            <p className="text-sm text-muted-foreground">
              Crafted in limited batches — {product.inventory > 0 ? `${product.inventory} in stock` : "preorders available"}.
            </p>
          </div>

          <p className="text-lg leading-relaxed text-gray-700">{product.description}</p>

          <p className="text-2xl font-semibold text-gray-900">
            ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
          </p>

          <AddToCartButton productId={product.id} />

          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Handcrafted assurance</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-amber-800">
              <li>Ethically sourced Pashmina fibres</li>
              <li>Worldwide express delivery with custom packaging</li>
              <li>Complimentary care guide and seasonal upkeep</li>
            </ul>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">Complete the look</h2>
            <Link href="/collections" className="text-sm font-medium text-amber-700 hover:text-amber-800">
              View full collection
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={item.featuredImageUrl ?? item.gallery[0]?.url ?? "/placeholder.svg"}
                    alt={item.featuredImageAlt ?? item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {item.categoryName ?? "Featured"}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-amber-700">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-700">
                    ${typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-semibold text-gray-900">Explore more categories</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {categories.slice(0, 3).map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white p-6 shadow hover:-translate-y-1 hover:border-amber-200"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {category.productCount} styles
              </p>
              <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-amber-700">
                {category.name}
              </h3>
              {category.summary && (
                <p className="mt-2 text-sm text-gray-600">{category.summary}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
