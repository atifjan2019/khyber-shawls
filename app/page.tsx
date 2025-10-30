// app/page.tsx
import Image from "next/image"
import Link from "next/link"

import { HeroCarousel } from "@/components/hero-carousel"
import { fetchAllHeroContent } from "@/lib/hero"
import { fetchCategoriesWithProducts, fetchPublishedProducts } from "@/lib/products"
import { formatCurrency } from "@/lib/currency";
import { FromTheJournal } from "@/components/from-the-journal";
import { fetchLatestPosts, SerializedPost } from "@/lib/journal";
import { Testimonials } from "@/components/testimonials";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const [heroSlides, products, categories] = await Promise.all([
    fetchAllHeroContent(),
    fetchPublishedProducts(),
    fetchCategoriesWithProducts(),
  ]);

  // Featured, Men, Women, Kids logic
  const featuredProducts = products.filter((p) => (p as any).featured === true);
  // Shawls with the 'Featured' tag
  const tagFeaturedProducts = products.filter((p) => Array.isArray((p as any).tags) && (p as any).tags.includes('Featured'));
  const menCategory = categories.find((c) => c.slug.toLowerCase().includes("men"));
  const womenCategory = categories.find((c) => c.slug.toLowerCase().includes("women"));
  const kidsCategory = categories.find((c) => c.slug.toLowerCase().includes("kid"));
  const menProducts = menCategory ? products.filter((p) => p.categorySlug === menCategory.slug) : [];
  const womenProducts = womenCategory ? products.filter((p) => p.categorySlug === womenCategory.slug) : [];
  const kidsProducts = kidsCategory ? products.filter((p) => p.categorySlug === kidsCategory.slug) : [];
  const newArrivals = products.slice(0, 6);


  return (
    <div className="bg-white">
      {/* ======================= HERO ======================= */}
      <HeroCarousel slides={heroSlides} fallbackImage="/hero/khyber-hero.jpg" />

      {/* ======================= FEATURED PRODUCTS ======================= */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-6 py-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-amber-800">Featured Shawls</h2>
            <p className="mt-2 text-lg text-gray-700 font-medium">"Hand-selected creations woven from pure heritage and luxury."</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/products" className="px-8 py-3 rounded-full bg-amber-700 text-white font-bold text-lg hover:bg-amber-100 hover:text-amber-900 transition">View All Shawls</Link>
          </div>
        </section>
      )}

      {/* ======================= SHOP BY CATEGORY (3 Main Blocks) ======================= */}
      <section className="mx-auto max-w-[1600px] px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[{cat: menCategory, label: "Men Shawls", desc: "Classic, bold textures."}, {cat: womenCategory, label: "Women Shawls", desc: "Graceful, premium designs."}, {cat: kidsCategory, label: "Kids Shawls", desc: "Soft, lightweight comfort."}].map(({cat, label, desc}, idx) => cat && (
          <Link key={cat.id} href={`/category/${cat.slug}`} className="relative group rounded-3xl overflow-hidden min-h-[220px] flex flex-col justify-end shadow-lg">
            <div className="absolute inset-0 w-full h-full">
              <Image src={cat.featuredImageUrl ?? "/placeholder.svg"} alt={cat.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition" />
            </div>
            <div className="relative z-10 p-6 flex flex-col items-start">
              <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{label}</h3>
              <p className="text-base text-white/90 mb-4 drop-shadow">{desc}</p>
              <span className="px-6 py-2 rounded-full bg-amber-700 text-white font-semibold text-lg shadow mt-2">Shop Now</span>
            </div>
          </Link>
        ))}
      </section>

      {/* ======================= FEATURED TAG SHAWLS ======================= */}
      {tagFeaturedProducts.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-6 py-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-amber-800">Featured Products</h2>
            <p className="mt-2 text-lg text-gray-700 font-medium">"Best"</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tagFeaturedProducts.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ======================= MEN SHAWLS ======================= */}
      {menCategory && menProducts.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-6 py-16">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-700">For Him</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900">Men's Shawls</h2>
            </div>
            <Link href={`/category/${menCategory.slug}`} className="text-sm font-medium text-amber-700 hover:text-amber-800">
              Explore →
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {menProducts.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ======================= WOMEN SHAWLS ======================= */}
      {womenCategory && womenProducts.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-6 py-16">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-700">For Her</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900">Women's Shawls</h2>
            </div>
            <Link href={`/category/${womenCategory.slug}`} className="text-sm font-medium text-amber-700 hover:text-amber-800">
              Explore →
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {womenProducts.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ======================= KIDS SHAWLS ======================= */}
      {kidsCategory && kidsProducts.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-6 py-16">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-700">For Kids</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900">Kids' Shawls</h2>
            </div>
            <Link href={`/category/${kidsCategory.slug}`} className="text-sm font-medium text-amber-700 hover:text-amber-800">
              Explore →
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {kidsProducts.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ======================= WHY KHYBER SHAWLS (Trust & Craft) ======================= */}
      <section className="bg-[#f4ede3] py-20">
        <div className="mx-auto max-w-3xl text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-amber-800 mb-4">Authenticity Woven in Every Thread</h2>
          <p className="text-lg text-gray-700 mb-6">Each shawl is handmade with pure wool and passion — crafted in Peshawar, designed for elegance, and trusted by families across Pakistan. Feel the warmth of heritage with Khyber Shawls.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          <div className="flex flex-col items-center">
            <span className="text-4xl">✅</span>
            <span className="mt-2 text-base font-semibold text-amber-800">100% Pure Wool</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl">🧵</span>
            <span className="mt-2 text-base font-semibold text-amber-800">Handmade Craftsmanship</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl">🚚</span>
            <span className="mt-2 text-base font-semibold text-amber-800">Nationwide Express Delivery</span>
          </div>
        </div>
        <div className="flex justify-center">
          <Link href="/products" className="px-8 py-3 rounded-full bg-amber-700 text-white font-bold text-lg hover:bg-amber-100 hover:text-amber-900 transition">Shop Authentic Now</Link>
        </div>
      </section>

      {/* ======================= CUSTOMER REVIEWS / SOCIAL PROOF ======================= */}
      <section className="mx-auto max-w-[1000px] px-6 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-amber-800 text-center mb-8">Loved by Our Customers</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Example reviews, replace with dynamic if available */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
            <Image src="/avatars/aisha.jpg" alt="Aisha" width={64} height={64} className="rounded-full mb-3" />
            <div className="flex gap-1 mb-2">{Array(5).fill(0).map((_,i) => <span key={i}>★</span>)}</div>
            <p className="text-lg font-semibold text-amber-800 text-center mb-2">"The softest shawl I've ever owned — worth every rupee."</p>
            <span className="text-sm text-gray-700">Aisha, Lahore</span>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
            <Image src="/avatars/david.jpg" alt="David" width={64} height={64} className="rounded-full mb-3" />
            <div className="flex gap-1 mb-2">{Array(5).fill(0).map((_,i) => <span key={i}>★</span>)}</div>
            <p className="text-lg font-semibold text-amber-800 text-center mb-2">"Incredible quality and fast delivery. My family loves them!"</p>
            <span className="text-sm text-gray-700">David, Islamabad</span>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
            <Image src="/avatars/fatima.jpg" alt="Fatima" width={64} height={64} className="rounded-full mb-3" />
            <div className="flex gap-1 mb-2">{Array(5).fill(0).map((_,i) => <span key={i}>★</span>)}</div>
            <p className="text-lg font-semibold text-amber-800 text-center mb-2">"Beautifully made, soft, and so warm. Highly recommend!"</p>
            <span className="text-sm text-gray-700">Fatima, Karachi</span>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/reviews" className="text-amber-700 font-semibold hover:underline">See More Reviews</Link>
        </div>
      </section>

      {/* ======================= FINAL CALL TO ACTION ======================= */}
      <section className="relative py-20 flex flex-col items-center justify-center bg-[url('/uploads/1761561828519-1.avif')] bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg">Wrap Yourself in Heritage Today</h2>
          <Link href="/products" className="px-10 py-4 rounded-full bg-amber-700 text-white font-bold text-2xl hover:bg-amber-100 hover:text-amber-900 transition">Shop Now →</Link>
        </div>
      </section>
    </div>
  )
}
