import type { Product, Category, Media, ProductMedia } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export type SerializedProduct = {
  id: string
  title: string
  description: string
  price: number
  slug: string
  published: boolean
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  gallery: Array<{
    id: string
    url: string
    alt: string | null
    position: number
  }>
  categoryName?: string | null
}

export type SerializedCategory = {
  id: string
  name: string
  slug: string
  summary: string | null
  productCount: number
  featuredImageUrl: string | null
  featuredImageAlt: string | null
}

type ProductWithRelations = Product & {
  category?: Category | null
  featuredImage?: Media | null
  gallery?: Array<ProductMedia & { media: Media }>
}

type CategoryWithRelations = Category & {
  products?: Product[]
  featuredImage?: Media | null
}

function serializeProduct(product: ProductWithRelations): SerializedProduct {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: Number(product.price),
    slug: product.slug,
    published: product.published,
    featuredImageUrl: product.featuredImage?.url ?? null,
    featuredImageAlt: product.featuredImage?.alt ?? null,
    gallery:
      product.gallery?.map((item) => ({
        id: item.media.id,
        url: item.media.url,
        alt: item.media.alt ?? null,
        position: item.position,
      })) ?? [],
    categoryName: product.category?.name ?? null,
  }
}

function serializeCategory(category: CategoryWithRelations): SerializedCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    summary: category.summary ?? null,
    productCount: category.products?.length ?? 0,
    featuredImageUrl: category.featuredImage?.url ?? null,
    featuredImageAlt: category.featuredImage?.alt ?? null,
  }
}

export async function fetchPublishedProducts() {
  if (!prisma) {
    console.warn(
      "[database] DATABASE_URL is not configured. Returning empty product list."
    )
    return []
  }

  const products = await prisma.product.findMany({
    where: { published: true },
    include: {
      category: true,
      featuredImage: true,
      gallery: { include: { media: true }, orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  })

  return products.map(serializeProduct)
}

export async function fetchProductsByCategorySlug(slug: string) {
  if (!prisma) {
    console.warn(
      "[database] DATABASE_URL is not configured. Cannot load category data."
    )
    return null
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { published: true },
        include: {
          category: true,
          featuredImage: true,
          gallery: { include: { media: true }, orderBy: { position: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      },
      featuredImage: true,
    },
  })

  if (!category) return null

  return {
    category: serializeCategory(category),
    products: category.products.map(serializeProduct),
  }
}

export async function fetchCategoriesWithProducts() {
  if (!prisma) {
    console.warn(
      "[database] DATABASE_URL is not configured. Returning empty category list."
    )
    return []
  }

  const categories = await prisma.category.findMany({
    include: { products: true, featuredImage: true },
    orderBy: { name: "asc" },
  })

  return categories.map(serializeCategory)
}

export async function fetchProductSummariesByIds(ids: string[]) {
  if (ids.length === 0) return []
  if (!prisma) {
    return []
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: {
      category: true,
      featuredImage: true,
      gallery: { include: { media: true }, orderBy: { position: "asc" } },
    },
  })

  return products.map(serializeProduct)
}
