import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { fetchProductBySlug, fetchPublishedProducts } from "@/lib/products"
import { slugify } from "@/lib/slugify"

export const revalidate = 60 // revalidate every 60s (ISR)

type PageProps = {
  params: { slug: string }
}

export async function generateStaticParams() {
  const products = await fetchPublishedProducts()
  return products.map((p) => ({ slug: p.slug }))
}

export default async function ProductPage({ params }: PageProps) {
  // 🧠 1. Get the product
  const product = await fetchProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const categorySlug =
    product.categorySlug ??
    (product.categoryName ? slugify(product.categoryName) : null)

  const mainImageUrl =
    product.featuredImageUrl ??
    product.gallery[0]?.url ??
    "/hero-shawl.svg"
  const mainImageAlt =
    product.featuredImageAlt ??
    product.gallery[0]?.alt ??
    product.title

  // 🧠 2. Get related categories & products
  const products = await fetchPublishedProducts()

  const related = products
    .filter(
      (item) =>
        item.slug !== product.slug &&
        (item.categorySlug ?? item.categoryName) ===
          (product.categorySlug ?? product.categoryName)
    )
    .slice(0, 4)

  // 🧠 3. Return JSX
  return (
    <div className="space-y-10 pb-20">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <Image
              src={mainImageUrl}
              alt={mainImageAlt}
              width={600}
              height={600}
              className="w-full h-auto rounded-md object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-semibold mb-4">{product.title}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>
            <p className="text-xl font-medium mb-4">
              £
              {typeof product.price === "number"
                ? product.price.toFixed(2)
                : product.price}
            </p>

            <AddToCartButton productId={product.id} />

            {product.categoryName && (
              <p className="mt-6 text-sm text-gray-500">
                Category:{" "}
                {categorySlug ? (
                  <Link
                    href={`/category/${categorySlug}`}
                    className="underline"
                  >
                    {product.categoryName}
                  </Link>
                ) : (
                  product.categoryName
                )}
              </p>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-semibold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                className="block border rounded-md overflow-hidden hover:shadow-md"
              >
                {item.featuredImageUrl && (
                  <Image
                    src={item.featuredImageUrl}
                    alt={item.featuredImageAlt || item.title}
                    width={400}
                    height={400}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-600">
                    £
                    {typeof item.price === "number"
                      ? item.price.toFixed(2)
                      : item.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
