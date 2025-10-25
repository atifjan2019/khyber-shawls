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
  categorySlug?: string | null
}

export type SerializedProductDetail = SerializedProduct & {
  inventory: number
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

type SampleProduct = SerializedProduct & {
  categorySlug: string
  inventory: number
}

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
    gallery: [
      {
        id: "sample-men-royal-indigo-main",
        url: "/hero-shawl.svg",
        alt: "Royal indigo pashmina illustration",
        position: 0,
      },
    ],
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
    gallery: [
      {
        id: "sample-women-morning-blush-main",
        url: "/hero-shawl.svg",
        alt: "Morning blush pashmina illustration",
        position: 0,
      },
    ],
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
    gallery: [
      {
        id: "sample-kids-winter-star-main",
        url: "/hero-shawl.svg",
        alt: "Winter star wrap illustration",
        position: 0,
      },
    ],
    categoryName: "Kids Shawls",
    categorySlug: "kids-shawls",
    inventory: 9,
  },
]

const SAMPLE_CATEGORY_BASE: Array<Omit<SerializedCategory, "productCount">> = [
  {
    id: "sample-category-men",
    name: "Men Shawls",
    slug: "men-shawls",
    summary: "Structured drapes tailored for the modern collector.",
    featuredImageUrl: "/hero-shawl.svg",
    featuredImageAlt: "Men's shawl illustration",
  },
  {
    id: "sample-category-women",
    name: "Women Shawls",
    slug: "women-shawls",
    summary: "Intricate paisleys and soft hues for elevated evenings.",
    featuredImageUrl: "/hero-shawl.svg",
    featuredImageAlt: "Women's shawl illustration",
  },
  {
    id: "sample-category-kids",
    name: "Kids Shawls",
    slug: "kids-shawls",
    summary: "Lightweight keepsakes spun for family milestones.",
    featuredImageUrl: "/hero-shawl.svg",
    featuredImageAlt: "Kids shawl illustration",
  },
]

const SAMPLE_CATEGORIES: SerializedCategory[] = SAMPLE_CATEGORY_BASE.map((category) => ({
  ...category,
  productCount: SAMPLE_PRODUCTS.filter((product) => product.categorySlug === category.slug).length,
}))

function stripSampleProduct(sample: SampleProduct): SerializedProduct {
  const { inventory: _inventory, ...rest } = sample
  void _inventory
  return rest
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
    categorySlug: product.category?.slug ?? null,
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
      "[database] DATABASE_URL is not configured. Returning sample product list."
    )
    return SAMPLE_PRODUCTS.filter((product) => product.published).map(stripSampleProduct)
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
  if (!slug) {
    console.warn("[products] fetchProductsByCategorySlug called without a slug. Returning null.")
    return null
  }

  if (!prisma) {
    console.warn(
      "[database] DATABASE_URL is not configured. Serving sample category data."
    )
    const category = SAMPLE_CATEGORIES.find((item) => item.slug === slug)
    if (!category) {
      return null
    }

    const products = SAMPLE_PRODUCTS.filter(
      (product) => product.categorySlug === slug
    ).map(stripSampleProduct)

    return {
      category: {
        ...category,
        productCount: products.length,
      },
      products,
    }
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

  if (!category) {
    return null
  }

  const serializedCategory = serializeCategory(category)
  const serializedProducts = category.products.map(serializeProduct)

  return {
    category: {
      ...serializedCategory,
      productCount: serializedProducts.length,
    },
    products: serializedProducts,
  }
}

export async function fetchCategoriesWithProducts() {
  if (!prisma) {
    console.warn(
      "[database] DATABASE_URL is not configured. Returning sample category list."
    )
    return SAMPLE_CATEGORIES.map((category) => ({ ...category }))
  }

  const categories = await prisma.category.findMany({
    include: { products: true, featuredImage: true },
    orderBy: { name: "asc" },
  })

  if (categories.length === 0) {
    console.warn(
      "[database] No categories found in database. Falling back to sample categories."
    )
    return SAMPLE_CATEGORIES.map((category) => ({ ...category }))
  }

  const serialized = categories.map(serializeCategory)

  if (serialized.every((category) => category.productCount === 0)) {
    console.warn(
      "[database] Categories exist but contain no products. Augmenting counts with sample data."
    )
    return serialized.map((category) => {
      const fallbackProducts = SAMPLE_PRODUCTS.filter(
        (product) => product.categorySlug === category.slug
      )
      if (fallbackProducts.length === 0) {
        return category
      }

      return {
        ...category,
        productCount: fallbackProducts.length,
      }
    })
  }

  return serialized
}

export async function fetchProductSummariesByIds(ids: string[]) {
  if (ids.length === 0) return []
  if (!prisma) {
    return SAMPLE_PRODUCTS.filter((product) => ids.includes(product.id)).map(
      stripSampleProduct
    )
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

export async function fetchProductBySlug(slug: string): Promise<SerializedProductDetail | null> {
  if (!slug) {
    console.warn("[products] fetchProductBySlug called without a slug. Returning null.")
    return null
  }

  if (!prisma) {
    console.warn(
      "[database] DATABASE_URL is not configured. Serving sample product detail."
    )
    const sample = SAMPLE_PRODUCTS.find((product) => product.slug === slug)
    if (!sample) {
      return null
    }

    const baseProduct = stripSampleProduct(sample)

    return {
      ...baseProduct,
      inventory: sample.inventory,
    }
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      featuredImage: true,
      gallery: { include: { media: true }, orderBy: { position: "asc" } },
    },
  })

  if (!product || !product.published) {
    return null
  }

  return {
    ...serializeProduct(product),
    inventory: product.inventory,
  }
}
