// app/product/[slug]/page.tsx
// This runs on Node.js (needed for Prisma)
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug ?? "";

  // 1. Query your database
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      featuredImage: true,
      gallery: {
        include: { media: true },
        orderBy: { position: "asc" },
      },
    },
  });

  // 2. Handle not found products
  if (!product) return notFound();

  // 3. Debug view (you can replace with your UI later)
  return (
    <main style={{ padding: 24 }}>
      <h1>Product Debug</h1>
      <pre
        style={{
          background: "#f6f6f6",
          padding: 16,
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        {JSON.stringify(
          {
            id: product.id,
            title: product.title,
            slug: product.slug,
            price: product.price,
            category: product.category?.name,
            published: product.published,
            galleryCount: product.gallery?.length ?? 0,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}
