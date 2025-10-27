// lib/products.ts
import { prisma } from "@/lib/prisma";

export type SerializedProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  slug: string;
  published: boolean;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  gallery: Array<{ id: string; url: string; alt: string | null; position: number }>;
  categoryName?: string | null;
  categorySlug?: string | null;
};

export type SerializedProductDetail = SerializedProduct & { inventory: number };

export type SerializedCategory = {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  productCount: number;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
};

// -------- Minimal local types to avoid stale @prisma/client ----------
type CategoryLite = {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
};

type ProductWithRelations = {
  id: string;
  name: string;
  description: string;
  price: any;
  image: string;
  inStock: boolean;
  category?: Pick<CategoryLite, "name" | "slug"> | null;
  categoryId: string;
};

type CategoryWithRelations = CategoryLite & {
  products?: Array<ProductWithRelations>;
};
// -------------------------------------------------------------------

type SampleProduct = SerializedProduct & { categorySlug: string; inventory: number };

const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: "sample-men-royal-indigo",
    title: "Royal Indigo Pashmina",
    description: "Handwoven in the Khyber valley using naturally dyed fibres.",
    price: 289,
    slug: "royal-indigo-pashmina",
    published: true,
    featuredImageUrl: "/hero-shawl.svg",
    featuredImageAlt: "Royal indigo pashmina illustration",
    gallery: [{ id: "sample-men-royal-indigo-main", url: "/hero-shawl.svg", alt: "Royal indigo pashmina illustration", position: 0 }],
    categoryName: "Men Shawls",
    categorySlug: "men-shawls",
    inventory: 5,
  },
  {
    id: "sample-women-morning-blush",
    title: "Morning Blush Pashmina",
    description: "Featherlight weave finished with hand-embroidered borders.",
    price: 325,
    slug: "morning-blush-pashmina",
    published: true,
    featuredImageUrl: "/hero-shawl.svg",
    featuredImageAlt: "Morning blush pashmina illustration",
    gallery: [{ id: "sample-women-morning-blush-main", url: "/hero-shawl.svg", alt: "Morning blush pashmina illustration", position: 0 }],
    categoryName: "Women Shawls",
    categorySlug: "women-shawls",
    inventory: 7,
  },
  {
    id: "sample-kids-winter-star",
    title: "Winter Star Wrap",
    description: "A cosy heirloom shawl sized for celebrations with the little ones.",
    price: 180,
    slug: "winter-star-wrap",
    published: true,
    featuredImageUrl: "/hero-shawl.svg",
    featuredImageAlt: "Winter star wrap illustration",
    gallery: [{ id: "sample-kids-winter-star-main", url: "/hero-shawl.svg", alt: "Winter star wrap illustration", position: 0 }],
    categoryName: "Kids Shawls",
    categorySlug: "kids-shawls",
    inventory: 9,
  },
];

const SAMPLE_CATEGORY_BASE: Array<Omit<SerializedCategory, "productCount">> = [
  { id: "sample-category-men", name: "Men Shawls", slug: "men-shawls", summary: "Structured drapes tailored for the modern collector.", featuredImageUrl: "/hero-shawl.svg", featuredImageAlt: "Men's shawl illustration" },
  { id: "sample-category-women", name: "Women Shawls", slug: "women-shawls", summary: "Intricate paisleys and soft hues for elevated evenings.", featuredImageUrl: "/hero-shawl.svg", featuredImageAlt: "Women's shawl illustration" },
  { id: "sample-category-kids", name: "Kids Shawls", slug: "kids-shawls", summary: "Lightweight keepsakes spun for family milestones.", featuredImageUrl: "/hero-shawl.svg", featuredImageAlt: "Kids shawl illustration" },
];

const SAMPLE_CATEGORIES: SerializedCategory[] = SAMPLE_CATEGORY_BASE.map((category) => ({
  ...category,
  productCount: SAMPLE_PRODUCTS.filter((p) => p.categorySlug === category.slug).length,
}));

function stripSampleProduct(sample: SampleProduct): SerializedProduct {
  const { inventory: _inventory, ...rest } = sample;
  void _inventory;
  return rest;
}

function serializeProduct(product: ProductWithRelations): SerializedProduct {
  // Generate a slug from the name if needed (since schema doesn't have slug)
  const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  return {
    id: product.id,
    title: product.name,
    description: product.description,
    price: Number(product.price),
    slug: slug,
    published: product.inStock,
    featuredImageUrl: product.image || null,
    featuredImageAlt: product.name || null,
    gallery: [],
    categoryName: product.category?.name ?? null,
    categorySlug: product.category?.slug ?? null,
  };
}

function serializeCategory(category: CategoryWithRelations): SerializedCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    summary: category.summary ?? null,
    productCount: category.products?.length ?? 0,
    featuredImageUrl: (category as any).featuredImageUrl ?? null,
    featuredImageAlt: (category as any).featuredImageAlt ?? null,
  };
}

export async function fetchPublishedProducts() {
  if (!prisma) {
    console.warn("[database] DATABASE_URL is not configured. Returning sample product list.");
    return SAMPLE_PRODUCTS.filter((p) => p.published).map(stripSampleProduct);
  }

  const products = await prisma.product.findMany({
    where: { inStock: true },
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map(serializeProduct);
}

export async function fetchProductsByCategorySlug(slug: string) {
  if (!slug) {
    console.warn("[products] fetchProductsByCategorySlug called without a slug. Returning null.");
    return null;
  }

  if (!prisma) {
    console.warn("[database] DATABASE_URL is not configured. Serving sample category data.");
    const category = SAMPLE_CATEGORIES.find((c) => c.slug === slug);
    if (!category) return null;

    const products = SAMPLE_PRODUCTS.filter((p) => p.categorySlug === slug).map(stripSampleProduct);

    return { category: { ...category, productCount: products.length }, products };
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { inStock: true },
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
      },
      // NOTE: Category has URL/ALT columns, not a Media relation—do not include featuredImage here
    },
  });

  if (!category) return null;

  const serializedCategory = serializeCategory(category as unknown as CategoryWithRelations);
  const serializedProducts = (category.products as unknown as ProductWithRelations[]).map(serializeProduct);

  return {
    category: { ...serializedCategory, productCount: serializedProducts.length },
    products: serializedProducts,
  };
}

export async function fetchCategoriesWithProducts() {
  if (!prisma) {
    console.warn("[database] DATABASE_URL is not configured. Returning sample category list.");
    return SAMPLE_CATEGORIES.map((c) => ({ ...c }));
  }

  const categories = await prisma.category.findMany({
    include: {
      products: { where: { inStock: true } },
    },
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) {
    console.warn("[database] No categories found in database. Falling back to sample categories.");
    return SAMPLE_CATEGORIES.map((c) => ({ ...c }));
  }

  const serialized = (categories as unknown as CategoryWithRelations[]).map(serializeCategory);

  if (serialized.every((c) => c.productCount === 0)) {
    console.warn("[database] Categories exist but contain no products. Augmenting counts with sample data.");
    return serialized.map((c) => {
      const fallback = SAMPLE_PRODUCTS.filter((p) => p.categorySlug === c.slug);
      return fallback.length ? { ...c, productCount: fallback.length } : c;
    });
  }

  return serialized;
}

export async function fetchProductSummariesByIds(ids: string[]) {
  if (ids.length === 0) return [];
  if (!prisma) {
    return SAMPLE_PRODUCTS.filter((p) => ids.includes(p.id)).map(stripSampleProduct);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: {
      category: true,
    },
  });

  return (products as unknown as ProductWithRelations[]).map(serializeProduct);
}

export async function fetchProductBySlug(slug: string): Promise<SerializedProductDetail | null> {
  if (!slug) {
    console.warn("[products] fetchProductBySlug called without a slug. Returning null.");
    return null;
  }

  if (!prisma) {
    console.warn("[database] DATABASE_URL is not configured. Serving sample product detail.");
    const sample = SAMPLE_PRODUCTS.find((p) => p.slug === slug);
    if (!sample) return null;
    const base = stripSampleProduct(sample);
    return { ...base, inventory: sample.inventory };
  }

  // Since we don't have a slug field, we need to find all products and filter by slug
  // This is not ideal but necessary given the schema constraints
  const products = await prisma.product.findMany({
    where: { inStock: true },
    include: {
      category: true,
    },
  });

  // Find the product that matches the slug (slug is generated from name)
  const product = products.find(p => {
    const productSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return productSlug === slug;
  });

  if (!product) return null;

  // Return with inventory set to 0 since the schema doesn't have this field
  return { ...(serializeProduct(product as unknown as ProductWithRelations)), inventory: 0 };
}
