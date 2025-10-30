// app/products/[slug]/page.tsx
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2, ShieldCheck, Truck } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/currency"
import { fetchProductBySlug } from "@/lib/products"
import { ProductGalleryTabs } from "@/components/product/product-gallery-tabs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://khybershawls.com"

type PageProps = { params: { slug?: string } | Promise<{ slug?: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams =
    typeof (params as unknown as Promise<unknown>)?.then === "function"
      ? await (params as Promise<{ slug?: string }>)
      : (params as { slug?: string })

  const slug = resolvedParams?.slug ?? ""
  if (!slug) return {}

  const product = await fetchProductBySlug(slug)

  if (!product || !product.published) {
    return {}
  }

  const title = `${product.title} | Khyber Shawls`
  const description =
    product.description?.slice(0, 155) ??
    "Discover handcrafted Kashmiri shawls curated by Khyber Shawls."
  const canonical = `${SITE_URL}/products/${slug}`
  const ogImages = product.featuredImageUrl ? [{ url: product.featuredImageUrl }] : undefined

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages?.[0]?.url,
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams =
    typeof (params as unknown as Promise<unknown>)?.then === "function"
      ? await (params as Promise<{ slug?: string }>)
      : (params as { slug?: string })

  const slug = typeof resolvedParams?.slug === "string" ? decodeURIComponent(resolvedParams.slug) : ""
  if (!slug) {
    notFound()
  }

  const product = await fetchProductBySlug(slug)

  if (!product) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Product unavailable</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn’t locate a product with the slug
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">{slug}</code>.
          Double-check the URL or explore our current collections below.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center rounded-full bg-amber-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-amber-800"
          >
            Browse collections
          </Link>
        </div>
      </main>
    )
  }

  if (!product.published) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Coming soon</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This handcrafted piece is currently offline while we style the collection. Please check back shortly or contact us for a private viewing.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/products"
            className="rounded-full border border-amber-700 px-6 py-3 text-sm font-medium text-amber-700 transition hover:bg-amber-700 hover:text-white"
          >
            Explore other shawls
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-amber-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-amber-800"
          >
            Notify me
          </Link>
        </div>
      </main>
    )
  }

  const galleryItems = product.gallery ?? []
  const mainImageUrl = product.featuredImageUrl ?? "/placeholder.svg"
  const mainImageAlt = product.featuredImageAlt ?? product.title

  // Fetch related products - find by category slug
  const related: any[] = []
  if (product.categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: product.categorySlug },
      include: {
        products: {
          where: {
            published: true,
            id: { not: product.id },
          },
          take: 4,
          include: { product_images: true, category: true },
        },
      },
    })
    
    related.push(...(category?.products || []).map(p => ({
      id: p.id,
      title: p.name,
      slug: p.slug,
      price: p.price,
      featuredImage: { url: p.image, alt: p.name },
    })))
  }

  const productLD = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: [mainImageUrl, ...galleryItems.map(i => i.url)],
    description: product.description,
    brand: "Khyber Shawls",
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: Number(product.price ?? 0),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/products/${slug}`,
    },
  }

  const trustSignals = [
    {
      iconName: "truck" as const,
      title: "Express nationwide shipping",
      description: "Secure delivery across Pakistan within 2-4 business days.",
    },
    {
      iconName: "shield" as const,
      title: "Authenticity guaranteed",
      description: "Each shawl ships with provenance certification and lifetime support.",
    },
    {
      iconName: "check" as const,
      title: "30-day easy returns",
      description: "Complimentary exchanges to help you find the perfect colourway.",
    },
  ]

  return (
    <main className="w-full px-6 py-10">
      <div className="mx-auto w-full max-w-[1600px]">
        <ProductGalleryTabs
          mainImageUrl={mainImageUrl}
          mainImageAlt={mainImageAlt}
          galleryItems={galleryItems}
          productTitle={product.title}
          productDescription={product.description}
          productDetails={product.details}
          careInstructions={product.careInstructions}
          categoryName={product.categoryName ?? null}
          formattedPrice={formatCurrency(product.price)}
          trustSignals={trustSignals}
          categorySlug={product.categorySlug ?? null}
          slug={slug}
        />
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-12 max-w-[1600px] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">You may also like</h2>
              <p className="text-sm text-muted-foreground">Curated directly from the same atelier.</p>
            </div>
            <Link href="/products" className="text-sm font-medium text-amber-700 hover:underline">
              View all
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className="group space-y-3 rounded-3xl border border-white/10 bg-background/70 p-4 transition hover:border-amber-700/40 hover:bg-amber-700/5"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
                  <Image
                    src={item.featuredImage?.url ?? "/placeholder.svg"}
                    alt={item.featuredImage?.alt ?? item.title}
                    fill
                    sizes="(min-width:1024px) 20vw, (min-width:640px) 30vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLD) }} />
    </main>
  )
}