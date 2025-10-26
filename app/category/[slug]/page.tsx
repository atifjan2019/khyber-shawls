// app/category/[slug]/page.tsx
import { notFound } from "next/navigation";
import { fetchProductsByCategorySlug } from "@/lib/products";
import { CategoryView } from "./view";

export const runtime = "nodejs";

type PageProps = { params: { slug: string } };

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = params;
  if (!slug) notFound();

  const data = await fetchProductsByCategorySlug(slug);
  if (!data) notFound();

  return (
    <CategoryView
      categoryName={data.category.name}
      categoryBlurb={data.category.summary ?? ""}
      featuredImageUrl={data.category.featuredImageUrl}
      featuredImageAlt={data.category.featuredImageAlt}
      products={data.products}
    />
  );
}
