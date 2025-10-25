// app/products/[slug]/page.tsx
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2, ShieldCheck, Truck } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/currency"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://khybershawls.com"

async function loadProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      featuredImage: true,
      gallery: { include: { media: true }, orderBy: { position: "asc" } },
    },
  })
}

type PageProps = { params: { slug?: string } | Promise<{ slug?: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams =
    typeof (params as unknown as Promise<unknown>)?.then === "function"
      ? await (params as Promise<{ slug?: string }>)
      : (params as { slug?: string })

  const slug = resolvedParams?.slug ?? ""
  if (!slug) return {}

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      published: true,
      featuredImage: { select: { url: true } },
    },
  })

  if (!product || !product.published) {
    return {}
  }

  const title = `${product.title} | Khyber Shawls`
  const description =
    product.description?.slice(0, 155) ??
    "Discover handcrafted Kashmiri shawls curated by Khyber Shawls."
  const canonical = `${SITE_URL}/products/${slug}`
  const ogImages = product.featuredImage?.url ? [{ url: product.featuredImage.url }] : undefined

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

  const product = await loadProduct(slug)

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

  const galleryItems = product.gallery?.length ? product.gallery : []
  const mainImageUrl =
    product.featuredImage?.url ?? galleryItems?.[0]?.media.url ?? "/placeholder.svg"
  const mainImageAlt =
    product.featuredImage?.alt ?? galleryItems?.[0]?.media.alt ?? product.title

  const related = await prisma.product.findMany({
    where: {
      published: true,
      categoryId: product.categoryId ?? undefined,
      id: { not: product.id },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      featuredImage: { select: { url: true, alt: true } },
    },
    take: 4,
  })

  const productLD = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: [mainImageUrl],
    description: product.description,
    brand: "Khyber Shawls",
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: Number(product.price ?? 0),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/products/${product.slug}`,
    },
  }

  const trustSignals = [
    {
      icon: Truck,
      title: "Express nationwide shipping",
      description: "Secure delivery across Pakistan within 2-4 business days.",
    },
    {
      icon: ShieldCheck,
      title: "Authenticity guaranteed",
      description: "Each shawl ships with provenance certification and lifetime support.",
    },
    {
      icon: CheckCircle2,
      title: "30-day easy returns",
      description: "Complimentary exchanges to help you find the perfect colourway.",
    },
  ]

  return (
    <main className="w-full px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        <section className="flex-1 space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-muted">
            <Image
              src={mainImageUrl}
              alt={mainImageAlt}
              fill
              sizes="(min-width:1280px) 55vw, (min-width:1024px) 50vw, 100vw"
              priority
              className="object-cover"
            />
          </div>

          {galleryItems.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {galleryItems.slice(1, 6).map((item) => (
                <div
                  key={item.id}
                  className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10"
                >
                  <Image
                    src={item.media.url}
                    alt={item.media.alt ?? product.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="w-full rounded-3xl border border-white/10 bg-background/70 p-6 shadow-xl backdrop-blur lg:max-w-sm">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-700">
              {product.category?.name ?? "Signature Collection"}
            </p>
            <h1 className="text-3xl font-semibold text-foreground lg:text-[2.2rem]">
              {product.title}
            </h1>
            <p className="text-2xl font-medium text-amber-700">{formatCurrency(product.price)}</p>
          </header>

          {product.description && (
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <button className="w-full rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-800">
              Add to cart
            </button>
            <button className="w-full rounded-full border border-amber-700 px-6 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-700 hover:text-white">
              Buy it now
            </button>
          </div>

          <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-background/80 p-5">
            {trustSignals.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 text-amber-700" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <nav className="mt-6 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-foreground">Products</Link>
              {product.category && (
                <>
                  <span>/</span>
                  <Link href={`/category/${product.category.slug}`} className="hover:text-foreground">
                    {product.category.name}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-foreground font-medium">{product.title}</span>
            </div>
          </nav>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-12 max-w-[1200px] space-y-6">
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
