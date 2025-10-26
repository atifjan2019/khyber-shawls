// /app/admin/categories/page.tsx
import Image from "next/image";
import { CategoryForm } from "@/components/admin/category-form";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

type AnyCategory = any; // keep it loose since schema differs locally

// Try to pick an image URL from common scalar field names
function getCategoryImage(category: AnyCategory) {
  return (
    category?.featuredImageUrl ||
    category?.imageUrl ||
    category?.thumbnailUrl ||
    category?.heroImageUrl ||
    category?.featuredImage ||     // if you happened to store a plain string in this name
    ""
  );
}

function getCategoryAlt(category: AnyCategory) {
  return (
    category?.featuredImageAlt ||
    category?.imageAlt ||
    category?.name ||
    "Category"
  );
}

export default async function AdminCategoriesPage() {
  if (!process.env.DATABASE_URL) {
    return (
      <div className="overflow-hidden rounded-4xl border border-primary/20 bg-gradient-to-br from-background via-background/90 to-primary/10 p-12 shadow-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Database not configured
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Add a valid <code>DATABASE_URL</code> to <code>.env.local</code> and restart the server to manage categories.
        </p>
      </div>
    );
  }

  // IMPORTANT: no include for a non-existent relation
  const categories = await prisma.category.findMany({
    include: { products: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-4xl border border-white/10 bg-background/90 p-8 shadow-lg backdrop-blur">
        <h1 className="text-3xl font-semibold text-foreground">Collections</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Build curated edits to guide clients through your handcrafted pieces.
        </p>
        <div className="mt-8">
          <CategoryForm />
        </div>
      </section>

      <section className="rounded-4xl border border-white/10 bg-background/90 p-8 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Collections at a glance</h2>
          <span className="text-xs text-muted-foreground">{categories.length} total</span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground">
              Start by outlining your first category—everything you add appears instantly.
            </p>
          ) : (
            categories.map((category: AnyCategory) => {
              const url = getCategoryImage(category);
              const alt = getCategoryAlt(category);
              return (
                <div
                  key={category.id}
                  className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-background/70 p-5 shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="relative h-32 overflow-hidden rounded-2xl bg-muted">
                    {url ? (
                      <Image src={url} alt={alt} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        No media
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">{category.name}</p>
                    {category.summary ? (
                      <p className="mt-2 text-xs text-muted-foreground">{category.summary}</p>
                    ) : null}
                  </div>

                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {category.products?.length ?? 0} styles
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
