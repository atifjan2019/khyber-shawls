"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireUser } from "@/lib/auth"
import { ensurePrismaClient } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"

type ActionState = {
  error?: string
  success?: string
}

async function ensureAdmin() {
  const user = await requireUser({ mustBeAdmin: true })
  if (!user) {
    throw new Error("Only administrators can perform this action.")
  }
  return user
}

const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  summary: z.string().optional(),
  featuredImageUrl: z.string().url().optional(),
})

export async function createCategoryAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await ensureAdmin()

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    summary: formData.get("summary") || undefined,
    featuredImageUrl: formData.get("featuredImageUrl") || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category" }
  }

  let db
  try {
    db = ensurePrismaClient()
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Database configuration missing. Set DATABASE_URL to manage categories.",
    }
  }

  const baseSlug = slugify(parsed.data.name)
  let uniqueSlug = baseSlug
  let attempt = 1
  while (await db.category.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${attempt}`
    attempt += 1
  }

  let featuredImageId: string | undefined
  if (parsed.data.featuredImageUrl) {
    const media = await db.media.create({
      data: {
        url: parsed.data.featuredImageUrl,
        alt: parsed.data.name,
      },
    })
    featuredImageId = media.id
  }

  await db.category.create({
    data: {
      name: parsed.data.name,
      summary: parsed.data.summary,
      slug: uniqueSlug,
      featuredImageId,
    },
  })

  revalidatePath("/admin")
  revalidatePath("/admin/categories")
  revalidatePath("/admin/overview")
  revalidatePath("/")

  return { success: "Category created" }
}

const productSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  price: z.string().transform((value) => Number.parseFloat(value)),
  inventory: z.string().optional(),
  featuredImageUrl: z.string().url().optional(),
  featuredImageAlt: z.string().optional(),
  galleryUrls: z.string().optional(),
  categoryId: z.string().cuid(),
  published: z.string().optional(),
})

export async function createProductAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await ensureAdmin()

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    inventory: formData.get("inventory") || undefined,
    featuredImageUrl: formData.get("featuredImageUrl") || undefined,
    featuredImageAlt: formData.get("featuredImageAlt") || undefined,
    galleryUrls: formData.get("galleryUrls") || undefined,
    categoryId: formData.get("categoryId"),
    published: formData.get("published") || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product" }
  }

  const {
    title,
    description,
    price,
    inventory,
    featuredImageUrl,
    featuredImageAlt,
    galleryUrls,
    categoryId,
    published,
  } = parsed.data

  if (Number.isNaN(price) || price <= 0) {
    return { error: "Please enter a valid price." }
  }

  const inventoryValue = inventory ? Number.parseInt(inventory, 10) : 0
  if (Number.isNaN(inventoryValue) || inventoryValue < 0) {
    return { error: "Inventory must be a positive number." }
  }

  let db
  try {
    db = ensurePrismaClient()
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Database configuration missing. Set DATABASE_URL to manage products.",
    }
  }

  const baseSlug = slugify(title)
  let uniqueSlug = baseSlug
  let attempt = 1
  while (await db.product.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${attempt}`
    attempt += 1
  }

  let featuredImageId: string | undefined
  if (featuredImageUrl) {
    const media = await db.media.create({
      data: {
        url: featuredImageUrl,
        alt: featuredImageAlt || null,
      },
    })
    featuredImageId = media.id
  }

  const product = await db.product.create({
    data: {
      title,
      description,
      price: price.toFixed(2),
      slug: uniqueSlug,
      inventory: inventoryValue,
      categoryId,
      authorId: admin.id,
      published: Boolean(published),
      featuredImageId,
    },
  })

  const galleryList = (galleryUrls ?? "")
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)

  if (galleryList.length > 0) {
    for (const [index, url] of galleryList.entries()) {
      const media = await db.media.create({
        data: {
          url,
          alt: title,
        },
      })

      await db.productMedia.create({
        data: {
          productId: product.id,
          mediaId: media.id,
          position: index,
        },
      })
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/products")
  revalidatePath("/admin/overview")
  revalidatePath("/")

  return { success: "Product created" }
}

const blogSchema = z.object({
  title: z.string().min(4),
  excerpt: z.string().optional(),
  content: z.string().min(20),
  published: z.string().optional(),
})

export async function createBlogPostAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await ensureAdmin()

  const parsed = blogSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content"),
    published: formData.get("published") || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid blog post" }
  }

  let db
  try {
    db = ensurePrismaClient()
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Database configuration missing. Set DATABASE_URL to manage blog posts.",
    }
  }
  const baseSlug = slugify(parsed.data.title)
  let uniqueSlug = baseSlug
  let attempt = 1
  while (await db.blogPost.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${attempt}`
    attempt += 1
  }

  await db.blogPost.create({
    data: {
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      slug: uniqueSlug,
      authorId: admin.id,
      published: Boolean(parsed.data.published),
    },
  })

  revalidatePath("/admin")
  revalidatePath("/admin/journal")

  return { success: "Blog post created" }
}

const orderStatusSchema = z.object({
  orderId: z.string().cuid(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]),
})

export async function updateOrderStatusAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await ensureAdmin()

  const parsed = orderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  })

  if (!parsed.success) {
    return { error: "Invalid order update" }
  }

  let db
  try {
    db = ensurePrismaClient()
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Database configuration missing. Set DATABASE_URL to manage orders.",
    }
  }

  await db.order.update({
    where: { id: parsed.data.orderId },
    data: { status: parsed.data.status },
  })

  revalidatePath("/admin")
  revalidatePath("/admin/orders")

  return { success: "Order updated" }
}

const heroMediaSchema = z.object({
  key: z.string().min(2),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  newBackgroundUrl: z.string().url().optional(),
  newBackgroundAlt: z.string().optional(),
})

export async function upsertHeroMediaAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await ensureAdmin()

  const parsed = heroMediaSchema.safeParse({
    key: formData.get("key"),
    title: (formData.get("title") as string | null) || undefined,
    subtitle: (formData.get("subtitle") as string | null) || undefined,
    description: (formData.get("description") as string | null) || undefined,
    ctaLabel: (formData.get("ctaLabel") as string | null) || undefined,
    ctaHref: (formData.get("ctaHref") as string | null) || undefined,
    newBackgroundUrl: ((formData.get("newBackgroundUrl") as string | null)?.trim() || undefined) ?? undefined,
    newBackgroundAlt: (formData.get("newBackgroundAlt") as string | null)?.trim() || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid hero configuration" }
  }

  let db
  try {
    db = ensurePrismaClient()
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Database configuration missing. Set DATABASE_URL to manage media.",
    }
  }

  const existing = await db.heroMedia.findUnique({ where: { key: parsed.data.key } })

  let backgroundImageId = existing?.backgroundImageId ?? undefined

  if (parsed.data.newBackgroundUrl) {
    const media = await db.media.create({
      data: {
        url: parsed.data.newBackgroundUrl,
        alt: parsed.data.newBackgroundAlt || null,
      },
    })
    backgroundImageId = media.id
  }

  await db.heroMedia.upsert({
    where: { key: parsed.data.key },
    update: {
      title: parsed.data.title ?? null,
      subtitle: parsed.data.subtitle ?? null,
      description: parsed.data.description ?? null,
      ctaLabel: parsed.data.ctaLabel ?? null,
      ctaHref: parsed.data.ctaHref ?? null,
      backgroundImageId: backgroundImageId ?? null,
    },
    create: {
      key: parsed.data.key,
      title: parsed.data.title ?? null,
      subtitle: parsed.data.subtitle ?? null,
      description: parsed.data.description ?? null,
      ctaLabel: parsed.data.ctaLabel ?? null,
      ctaHref: parsed.data.ctaHref ?? null,
      backgroundImageId: backgroundImageId ?? null,
    },
  })

  revalidatePath("/admin/media")
  revalidatePath("/admin/overview")
  revalidatePath("/")

  return { success: "Hero banner updated" }
}
