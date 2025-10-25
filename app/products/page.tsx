// app/products/page.tsx
import Link from "next/link";
import Image from "next/image";
import { fetchPublishedProducts } from "@/lib/products";

export const revalidate = 900;

export const metadata = {
  title: "Products | Khybershawls",
  description: "Explore our latest shawls and wraps.",
};

export default async function ProductsIndex() {
  const products = await fetchPublishedProducts();

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Products</h1>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="group">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={p.featuredImageUrl ?? "/placeholder.svg"}
                  alt={p.featuredImageAlt ?? p.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-sm text-muted-foreground">${p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
