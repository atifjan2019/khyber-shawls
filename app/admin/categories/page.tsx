import Image from "next/image";
import prisma from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/category-form";
import { CategoryEditForm } from "@/components/admin/category-edit-form";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";

export const runtime = "nodejs";

export default async function AdminCategoriesPage() {
  if (!process.env.DATABASE_URL) {
    return (
      <div className="overflow-hidden rounded-4xl border border-primary/20 bg-gradient-to-br from-background via-background/90 to-primary/10 p-12 shadow-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Database not configured</h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Add a valid <code>DATABASE_URL</code> to <code>.env.local</code> and restart the server to manage categories.
        </p>
      </div>
    );
  }
  console.log('DB URL at runtime:', process.env.DATABASE_URL);

// Raw checks (temporary)
await prisma.$queryRawUnsafe('SELECT 1');
await prisma.$queryRawUnsafe('SELECT COUNT(*) AS c FROM `categories`');


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
            categories.map((c) => {
              const url = c.featuredImageUrl || '';
              const alt = c.featuredImageAlt || c.name || 'Category';

              return (
                <div
                  key={c.id}
                  className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-background/70 p-5 shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="relative h-32 overflow-hidden rounded-2xl bg-muted">
                    {url ? (
                      <Image src={url} alt={alt} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No media</div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    {c.summary ? <p className="mt-2 text-xs text-muted-foreground">{c.summary}</p> : null}
                  </div>

                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {c.products?.length ?? 0} styles
                  </p>

                  <div className="mt-2 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-background/60 p-3">
                      <p className="mb-2 text-xs text-muted-foreground">Edit</p>
                      <CategoryEditForm
                        id={c.id}
                        name={c.name}
                        summary={c.summary}
                        featuredImageUrl={c.featuredImageUrl}
                        featuredImageAlt={c.featuredImageAlt}
                      />
                    </div>

                    <DeleteCategoryButton id={c.id} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
