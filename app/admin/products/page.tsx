import { ProductForm } from "@/components/admin/product-form"
import { ProductListItem } from "@/components/admin/product-list-item"
import { fetchMediaLibrary } from "@/lib/media"
import { formatCurrency } from "@/lib/currency"
import { prisma } from "@/lib/prisma"

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

  const [categories, products, mediaLibrary] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
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
    fetchMediaLibrary(100),
  ])

  const categoryOptions = categories.map((category) => ({ id: category.id, name: category.name }))
  const mediaOptions = mediaLibrary.map((item) => ({ id: item.id, url: item.url, alt: item.alt }))

  const productsForDisplay = products.map((product) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    price: Number(product.price),
    priceLabel: formatCurrency(product.price),
    inventory: product.inventory,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? null,
    published: product.published,
    featuredImageId: product.featuredImageId ?? null,
    featuredImageUrl: product.featuredImage?.url ?? null,
    featuredImageAlt: product.featuredImage?.alt ?? null,
    galleryMediaIds: product.gallery?.map((item) => item.mediaId) ?? [],
  }))

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
  )
}
