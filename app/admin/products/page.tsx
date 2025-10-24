import Image from "next/image"

import { ProductForm } from "@/components/admin/product-form"
import { prisma } from "@/lib/prisma"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export default async function AdminProductsPage() {
  if (!prisma) {
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
    )
  }

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      include: {
        category: true,
        featuredImage: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

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
          <ProductForm
            categories={categories.map((category) => ({ id: category.id, name: category.name }))}
          />
        </div>
      </section>

      <section className="rounded-4xl border border-white/10 bg-background/90 p-8 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Collection spotlight</h2>
          <span className="text-xs text-muted-foreground">{products.length} total styles</span>
        </div>
        <div className="mt-6 space-y-4">
          {products.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground">
              No products yet—publish your first handcrafted shawl to showcase it here.
            </p>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="grid gap-6 rounded-3xl border border-white/10 bg-background/70 p-5 shadow-sm transition hover:border-primary/40 hover:bg-primary/5 md:grid-cols-[160px,1fr]"
              >
                <div className="relative hidden overflow-hidden rounded-2xl bg-muted md:block">
                  {product.featuredImage?.url ? (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.alt ?? product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No media
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.category?.name ?? "Uncategorised"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{currencyFormatter.format(Number(product.price))}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.published ? "Published" : "Draft"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
