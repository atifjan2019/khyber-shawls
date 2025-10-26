// app/admin/products/page.tsx
import { ProductForm } from "@/components/admin/product-form";
import { ProductListItem } from "@/components/admin/product-list-item";
import { fetchMediaLibrary } from "@/lib/media";
import { formatCurrency } from "@/lib/currency";
import prisma from "@/lib/prisma"; // ✅ default import (singleton)

export const runtime = "nodejs";

type CategoryOption = { id: string; name: string };
type MediaOption = { id: string; url: string; alt: string | null };

// Match (or be compatible with) what ProductListItem expects.
// Key change: `description` is now always a string.
type AdminProductRow = {
  id: string;
  title: string;
  description: string; // ✅ coerced to string
  price: number;
  priceLabel: string;
  inventory: number;
  categoryId: string;
  categoryName: string | null;
  published: boolean;
  featuredImageId: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  galleryMediaIds: string[];
};

// Helpers
const toStringOr = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : v == null ? fallback : String(v);

export default async function AdminProductsPage() {
  if (!process.env.DATABASE_URL) {
    return (
      <div className="overflow-hidden rounded-4xl border border-primary/20 bg-gradient-to-br from-background via-background/90 to-primary/10 p-12 shadow-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Database not configured
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Add a valid <code>DATABASE_URL</code> to <code>.env.local</code> and restart the
          server to manage products.
        </p>
      </div>
    );
  }

  const [categories, products, mediaLibrary] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        featuredImage: true,
        gallery: {
          include: { media: true },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    // You had fetchMediaLibrary(100). The stub in /lib/media.ts ignores args,
    // so this is fine either way.
    fetchMediaLibrary(),
  ]);

  const categoryOptions: CategoryOption[] = categories.map((c: { id: string; name: string }) => ({
    id: c.id,
    name: c.name,
  }));

  // ✅ Normalize media IDs to guaranteed strings to satisfy MediaOption
  const mediaOptions: MediaOption[] = (mediaLibrary ?? [])
    .map((m: any) => ({
      id: toStringOr(m?.id ?? m?.url), // fall back to URL if id missing
      url: toStringOr(m?.url),
      alt: m?.alt ?? null,
    }))
    .filter((m) => m.id && m.url); // keep only valid entries

  // ✅ Ensure description is a string (not null) to satisfy ProductListItem prop type
  const productsForDisplay: AdminProductRow[] = products.map((p: any) => ({
    id: p.id,
    title: toStringOr(p.title),
    description: toStringOr(p.description, ""), // ← fix: never null
    price: Number(p.price),
    priceLabel: formatCurrency(p.price),
    inventory: Number(p.inventory ?? 0),
    categoryId: toStringOr(p.categoryId ?? ""),
    categoryName: p.category?.name ?? null,
    published: !!p.published,
    featuredImageId: p.featuredImageId ?? null,
    featuredImageUrl: p.featuredImage?.url ?? null,
    featuredImageAlt: p.featuredImage?.alt ?? null,
    galleryMediaIds: Array.isArray(p.gallery)
      ? p.gallery
          .map((g: { mediaId?: string; media?: { id?: string } }) => toStringOr(g?.mediaId ?? g?.media?.id ?? ""))
          .filter(Boolean)
      : [],
  }));

  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-4xl border border-white/10 bg-background/90 p-8 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground">
              Launch new shawls, wraps, and accessories—all changes publish instantly.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <ProductForm categories={categoryOptions} />
        </div>
      </section>

      <section className="rounded-4xl border border-white/10 bg-background/90 p-8 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Collection spotlight</h2>
          <span className="text-xs text-muted-foreground">{productsForDisplay.length} total styles</span>
        </div>
        <div className="mt-6 space-y-4">
          {productsForDisplay.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground">
              No products yet—publish your first handcrafted shawl to showcase it here.
            </p>
          ) : (
            productsForDisplay.map((product) => (
              <ProductListItem
                key={product.id}
                product={product}              
                categories={categoryOptions}
                mediaLibrary={mediaOptions}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
