import Image from "next/image"

import { CategoryForm } from "@/components/admin/category-form"
import { prisma } from "@/lib/prisma"

export default async function AdminCategoriesPage() {
  if (!prisma) {
    return (
      <div className="overflow-hidden rounded-4xl border border-primary/20 bg-gradient-to-br from-background via-background/90 to-primary/10 p-12 shadow-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Database not configured
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Add a valid <code>DATABASE_URL</code> to <code>.env.local</code> and restart the
          server to manage categories.
        </p>
      </div>
    )
  }

  const categories = await prisma.category.findMany({
    include: { products: true, featuredImage: true },
    orderBy: { name: "asc" },
  })

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
            categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-background/70 p-5 shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="relative h-32 overflow-hidden rounded-2xl bg-muted">
                  {category.featuredImage?.url ? (
                    <Image
                      src={category.featuredImage.url}
                      alt={category.featuredImage.alt ?? category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No media
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{category.name}</p>
                  {category.summary && (
                    <p className="mt-2 text-xs text-muted-foreground">{category.summary}</p>
                  )}
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  {category.products.length} styles
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
