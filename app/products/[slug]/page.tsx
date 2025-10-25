export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ShieldCheck, Truck, Sparkles, HeartHandshake } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductGallery from "@/components/ProductGallery";

/* -------------------------- CONFIG / HELPERS -------------------------- */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://khybershawls.com";

function formatPrice(value: unknown) {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return "£0.00";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(amount);
}

async function loadProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      featuredImage: true,
      gallery: { include: { media: true }, orderBy: { position: "asc" } },
    },
  });
}

/* ------------------------------ METADATA ----------------------------- */

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) return {};

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      published: true,
      featuredImage: { select: { url: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  if (!product || !product.published) return {};

  const title = `${product.title} | Khyber Shawls`;
  const description =
    product.description?.slice(0, 155) ??
    "Discover handcrafted Kashmiri shawls curated by Khyber Shawls.";
  const canonical = `${SITE_URL}/products/${slug}`;
  const ogImages: { url: string }[] | undefined = product.featuredImage?.url
    ? [{ url: product.featuredImage.url }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
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
  };
}

/* ------------------------------ PAGE ------------------------------ */

export default async function ProductPage(props: PageProps) {
  const { slug } = await props.params;
  if (!slug) notFound();

  const product = await loadProduct(slug);
  if (!product || !product.published) notFound();

  const galleryItems = product.gallery?.length ? product.gallery : [];
  const mainImageUrl =
    product.featuredImage?.url ?? galleryItems?.[0]?.media.url ?? "/placeholder.svg";
  const mainImageAlt =
    product.featuredImage?.alt ?? galleryItems?.[0]?.media.alt ?? product.title;

  // Related (same category)
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
    take: 8,
  });

  /* --------------------------- JSON-LD (SEO) --------------------------- */

  const productLD = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: [mainImageUrl],
    description: product.description,
    brand: "Khyber Shawls",
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: Number(product.price ?? 0),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/products/${product.slug}`,
    },
  };

  const breadcrumbLD = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/products` },
      ...(product.category
        ? [{ "@type": "ListItem", position: 3, name: product.category.name, item: `${SITE_URL}/category/${product.category.slug}` }]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 4 : 3,
        name: product.title,
        item: `${SITE_URL}/products/${product.slug}`,
      },
    ],
  };

  const faqs = [
    {
      q: "Is this authentic pashmina?",
      a: "Yes. Each piece includes a certification from our Kashmir atelier and is inspected before dispatch.",
    },
    {
      q: "How do I care for my shawl?",
      a: "Dry clean only on a delicate wool program. Store in the included muslin pouch. Avoid direct sunlight and perfumes.",
    },
    {
      q: "What is your return policy?",
      a: "Complimentary returns within 30 days in original condition. We also offer exchanges for alternate colourways.",
    },
  ];

  const faqLD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  /* ---------------------- Sales/Trust Messaging ---------------------- */

  const trustSignals = [
    {
      icon: Truck,
      title: "Express worldwide shipping",
      description: "Dispatched from Kashmir within 48 hours. Fully insured delivery.",
    },
    {
      icon: ShieldCheck,
      title: "Authenticity guaranteed",
      description: "Certificate of origin and lifetime authenticity support.",
    },
    {
      icon: CheckCircle2,
      title: "30-day complimentary returns",
      description: "Free returns or exchanges on alternate colourways.",
    },
  ];

  const highlights = [
    "Hand-loomed Grade-A pashmina fibres",
    "Naturally dyed palette, atelier embroidery",
    "Featherlight weave for effortless drape",
  ];

  const care = [
    "Dry clean only (delicate wool program)",
    "Store folded in breathable muslin pouch",
    "Avoid direct sunlight & perfume contact",
  ];

  /* ------------------------------ UI ------------------------------ */

  return (
    <main className="w-full px-6 py-10 lg:py-14">
      <div className="mx-auto w-full max-w-[1300px] space-y-16">
        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLD) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLD) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLD) }} />

        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
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
        </nav>

        {/* Top Grid: [gallery left] | [buy box right] */}
        <div className="grid gap-8 md:gap-10 md:grid-cols-[minmax(0,1.2fr),0.8fr]">
          {/* VISUALS (thumb rail + main image) */}
          <section>
            <ProductGallery
              main={{ url: mainImageUrl, alt: mainImageAlt }}
              items={galleryItems}
              title={product.title}
            />

            {/* Highlights */}
            <section className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-background/70 p-6 lg:p-8 backdrop-blur">
              <header className="space-y-2">
                <p className="inline-flex items-center gap-2 rounded-full bg-amber-700/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                  <Sparkles className="size-3" /> Atelier highlights
                </p>
                <h2 className="text-xl font-semibold text-foreground">Crafted to turn moments into heirlooms</h2>
              </header>
              <ul className="grid gap-3 sm:grid-cols-2">
                {highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 rounded-2xl border border-muted-foreground/20 bg-background/70 p-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-amber-700" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Care */}
            <section className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Care & preservation</h3>
              <ul className="grid gap-3 rounded-3xl border border-muted-foreground/20 bg-background/60 p-6 text-sm text-muted-foreground">
                {care.map((c) => (
                  <li key={c} className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-700" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* FAQ */}
            <section className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Questions</h3>
              <div className="rounded-3xl border border-white/10 bg-background/70 p-2">
                {faqs.map((f) => (
                  <details key={f.q} className="group border-b border-white/10 px-4 py-3 last:border-none">
                    <summary className="cursor-pointer list-none text-sm font-medium text-foreground hover:text-amber-700">
                      {f.q}
                    </summary>
                    <div className="pt-2 text-sm text-muted-foreground">{f.a}</div>
                  </details>
                ))}
              </div>
            </section>
          </section>

          {/* BUY BOX (sticky right) */}
          <aside className="md:sticky md:top-24 h-fit">
            <div className="space-y-8 rounded-3xl border border-white/10 bg-background/70 p-6 lg:p-8 shadow-xl backdrop-blur">
              <header className="space-y-2">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-700">
                  {product.category?.name ?? "Khyber Shawls"}
                </p>
                <h1 className="text-3xl font-semibold text-foreground lg:text-[2.4rem]">{product.title}</h1>
                <p className="text-2xl font-medium text-amber-700">{formatPrice(product.price)}</p>
              </header>

              {product.description && (
                <p className="text-sm leading-7 text-muted-foreground line-clamp-7">
                  {product.description}
                </p>
              )}

              {/* Action */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
                  aria-label="Add to cart"
                >
                  Add to cart
                </button>
                <Link
                  href="/contact"
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-amber-700 px-6 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-700 hover:text-white"
                >
                  Speak with a stylist
                </Link>
              </div>

              {/* Trust */}
              <div className="space-y-4 rounded-2xl border border-muted-foreground/20 bg-background/80 p-5">
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

              {/* Bespoke CTA */}
              <div className="rounded-2xl border border-amber-700/30 bg-amber-700/10 p-5 text-sm text-amber-900">
                <p className="font-semibold uppercase tracking-[0.2em] text-xs text-amber-700">
                  Bespoke weave service
                </p>
                <p className="mt-2 leading-6">
                  Prefer a custom colourway or monogram? Our atelier can weave a signature piece in 6–8 weeks.
                </p>
                <Link
                  href="/contact"
                  className="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-[0.25em] text-amber-700 hover:text-amber-800"
                >
                  Request a commission
                </Link>
              </div>

              {/* Concierge */}
              <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-background/60 p-5 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <HeartHandshake className="size-4 text-amber-700" />
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Collectors concierge</p>
                    <p className="text-muted-foreground">
                      WhatsApp our stylists for live gifting & styling advice.
                    </p>
                  </div>
                </div>
                <Link href="/contact" className="text-xs font-semibold text-amber-700 hover:underline">
                  Say hello
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* RELATED */}
        {related.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">You may also like</h2>
                <p className="text-sm text-muted-foreground">Complimentary pieces from the same atelier.</p>
              </div>
              <Link href="/products" className="text-sm font-medium text-amber-700 hover:underline">
                View all
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
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
                      sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:640px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
