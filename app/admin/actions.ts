"use server"

import { revalidatePath } from "next/cache"
import { promises as fs } from "fs"
import { randomUUID } from "crypto"
import path from "path"
import { z } from "zod"
import type { PrismaClient } from "@prisma/client"

import { requireUser } from "@/lib/auth"
import { ensurePrismaClient } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"

type ActionState = {
  error?: string
  success?: string
}

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024 // 5MB ceiling for admin uploads
const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])

async function ensureAdmin() {
  const user = await requireUser({ mustBeAdmin: true })
  if (!user) {
    throw new Error("Only administrators can perform this action.")
  }
  return user
}

function createUploadFileName(originalName: string): string {
  const uniqueSuffix = randomUUID()
  const extension = path.extname(originalName)
  const baseName = path.basename(originalName, extension)
  const sanitizedBase = baseName.replace(/[^a-zA-Z0-9-_]/g, "_") || "media"
  const safeExtension = extension.replace(/[^a-zA-Z0-9.]/g, "")
  return `${uniqueSuffix}-${sanitizedBase}${safeExtension}`
}

async function persistUploadedMedia(
  db: PrismaClient,
  file: File,
  altText?: string | null
) {
  if (!(file instanceof File)) {
    throw new Error("Invalid file upload payload.")
  }

  if (!ALLOWED_MEDIA_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Use JPG, PNG, WEBP, or GIF.")
  }

  if (file.size === 0) {
    throw new Error("Uploaded file is empty.")
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("File is too large. Limit uploads to 5MB.")
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads")
  await fs.mkdir(uploadDir, { recursive: true })

  const fileName = createUploadFileName(file.name)
  const filePath = path.join(uploadDir, fileName)
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filePath, buffer)

  const media = await db.media.create({
    data: {
      url: `/uploads/${fileName}`,
      alt: altText && altText.length > 0 ? altText : null,
    },
  })

  return media
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
  const featuredImageFile = formData.get("featuredImageFile")
  const featuredImageAlt = (formData.get("featuredImageAlt") as string | null)?.trim() || parsed.data.name

  if (featuredImageFile instanceof File && featuredImageFile.size > 0) {
    try {
      const media = await persistUploadedMedia(db, featuredImageFile, featuredImageAlt)
      featuredImageId = media.id
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload featured image. Try again.",
      }
    }
  } else if (parsed.data.featuredImageUrl) {
    const media = await db.media.create({
      data: {
        url: parsed.data.featuredImageUrl,
        alt: featuredImageAlt,
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
  revalidatePath(`/category/${uniqueSlug}`)

  return { success: "Category created" }
}

const productSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  price: z.string().transform((value) => Number.parseFloat(value)),
  inventory: z.string().optional(),
  featuredImageId: z.string().cuid().optional(),
  categoryId: z.string().cuid(),
  published: z.string().optional(),
})

export async function createProductAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await ensureAdmin()

  const featuredImageIdInput = (() => {
    const raw = formData.get("featuredImageId")
    if (typeof raw !== "string") {
      return undefined
    }
    const trimmed = raw.trim()
    return trimmed.length > 0 ? trimmed : undefined
  })()

  const featuredImageAltInput = (() => {
    const raw = formData.get("featuredImageAlt")
    if (typeof raw !== "string") {
      return undefined
    }
    const trimmed = raw.trim()
    return trimmed.length > 0 ? trimmed : undefined
  })()

  const featuredImageFile = formData.get("featuredImageFile")
  const galleryFileUploads = formData
    .getAll("galleryFiles")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    inventory: formData.get("inventory") || undefined,
    featuredImageId: featuredImageIdInput,
    categoryId: formData.get("categoryId"),
    published: formData.get("published") || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product" }
  }

  const { title, description, price, inventory, featuredImageId, categoryId, published } = parsed.data

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

  let featuredImageIdToUse: string | undefined
  if (featuredImageFile instanceof File && featuredImageFile.size > 0) {
    try {
      const media = await persistUploadedMedia(db, featuredImageFile, featuredImageAltInput ?? title)
      featuredImageIdToUse = media.id
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to upload featured image. Try again.",
      }
    }
  } else if (featuredImageId) {
    const featuredMedia = await db.media.findUnique({ where: { id: featuredImageId } })
    if (!featuredMedia) {
      return { error: "Selected featured image no longer exists." }
    }
    featuredImageIdToUse = featuredMedia.id
  }

  const galleryMediaIds = Array.from(
    new Set(
      formData
        .getAll("galleryMediaIds")
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value): value is string => value.length > 0)
    )
  )

  if (galleryMediaIds.length > 0) {
    const mediaItems = await db.media.findMany({ where: { id: { in: galleryMediaIds } } })
    if (mediaItems.length !== galleryMediaIds.length) {
      return { error: "One or more gallery media selections are invalid." }
    }
  }

  const newGalleryMediaIds: string[] = []
  if (galleryFileUploads.length > 0) {
    for (const file of galleryFileUploads) {
      try {
        const media = await persistUploadedMedia(db, file, `${title} gallery image`)
        newGalleryMediaIds.push(media.id)
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to upload gallery media. Try again.",
        }
      }
    }
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
      featuredImageId: featuredImageIdToUse,
    },
  })

  const finalGalleryMediaIds = [...galleryMediaIds, ...newGalleryMediaIds]

  if (finalGalleryMediaIds.length > 0) {
    await Promise.all(
      finalGalleryMediaIds.map((mediaId, index) =>
        db.productMedia.create({
          data: {
            productId: product.id,
            mediaId,
            position: index,
          },
        })
      )
    )
  }

  revalidatePath("/admin")
  revalidatePath("/admin/products")
  revalidatePath("/admin/overview")
  revalidatePath("/")
  revalidatePath(`/product/${uniqueSlug}`)

  return { success: "Product created" }
}

const updateProductSchema = productSchema.extend({
  productId: z.string().cuid(),
})

export async function updateProductAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await ensureAdmin()

  const featuredImageIdInput = (() => {
    const raw = formData.get("featuredImageId")
    if (typeof raw !== "string") {
      return undefined
    }
    const trimmed = raw.trim()
    return trimmed.length > 0 ? trimmed : undefined
  })()

  const parsed = updateProductSchema.safeParse({
    productId: formData.get("productId"),
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    inventory: formData.get("inventory") || undefined,
    featuredImageId: featuredImageIdInput,
    categoryId: formData.get("categoryId"),
    published: formData.get("published") || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product" }
  }

  const { productId, title, description, price, inventory, featuredImageId, categoryId, published } = parsed.data

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

  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      slug: true,
      gallery: {
        orderBy: { position: "asc" },
        select: { mediaId: true },
      },
    },
  })

  if (!product) {
    return { error: "Product not found." }
  }

  const featuredImageAltInput = (() => {
    const raw = formData.get("featuredImageAlt")
    if (typeof raw !== "string") {
      return undefined
    }
    const trimmed = raw.trim()
    return trimmed.length > 0 ? trimmed : undefined
  })()

  const featuredImageFile = formData.get("featuredImageFile")

  let featuredImageIdToUse: string | null = null
  if (featuredImageFile instanceof File && featuredImageFile.size > 0) {
    try {
      const media = await persistUploadedMedia(db, featuredImageFile, featuredImageAltInput ?? title)
      featuredImageIdToUse = media.id
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to upload featured image. Try again.",
      }
    }
  } else if (featuredImageId) {
    const media = await db.media.findUnique({ where: { id: featuredImageId } })
    if (!media) {
      return { error: "Selected featured image no longer exists." }
    }
    featuredImageIdToUse = media.id
  }

  const galleryMediaIds = Array.from(
    new Set(
      formData
        .getAll("galleryMediaIds")
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value): value is string => value.length > 0)
    )
  )

  if (galleryMediaIds.length > 0) {
    const mediaItems = await db.media.findMany({ where: { id: { in: galleryMediaIds } } })
    if (mediaItems.length !== galleryMediaIds.length) {
      return { error: "One or more gallery media selections are invalid." }
    }
  }

  const galleryFileUploads = formData
    .getAll("galleryFiles")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  const newGalleryMediaIds: string[] = []
  if (galleryFileUploads.length > 0) {
    for (const file of galleryFileUploads) {
      try {
        const media = await persistUploadedMedia(db, file, `${title} gallery image`)
        newGalleryMediaIds.push(media.id)
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to upload gallery media. Try again.",
        }
      }
    }
  }

  const existingGalleryMediaIds = product.gallery?.map((item) => item.mediaId) ?? []

  let finalGalleryMediaIds: string[]
  let shouldReplaceGallery = false

  if (galleryMediaIds.length > 0) {
    finalGalleryMediaIds = [...galleryMediaIds, ...newGalleryMediaIds]
    shouldReplaceGallery = true
  } else if (newGalleryMediaIds.length > 0) {
    finalGalleryMediaIds = [...existingGalleryMediaIds, ...newGalleryMediaIds]
    shouldReplaceGallery = true
  } else {
    finalGalleryMediaIds = existingGalleryMediaIds
  }

  const baseSlug = slugify(title)
  let uniqueSlug = product.slug
  if (baseSlug !== product.slug) {
    uniqueSlug = baseSlug
    let attempt = 1
    while (
      await db.product.findFirst({ where: { slug: uniqueSlug, NOT: { id: productId } } })
    ) {
      uniqueSlug = `${baseSlug}-${attempt}`
      attempt += 1
    }
  }

  await db.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        title,
        description,
        price: price.toFixed(2),
        slug: uniqueSlug,
        inventory: inventoryValue,
        categoryId,
        published: Boolean(published),
        featuredImageId: featuredImageIdToUse,
      },
    })

    if (shouldReplaceGallery) {
      await tx.productMedia.deleteMany({ where: { productId } })

      if (finalGalleryMediaIds.length > 0) {
        await tx.productMedia.createMany({
          data: finalGalleryMediaIds.map((mediaId, index) => ({
            productId,
            mediaId,
            position: index,
          })),
        })
      }
    }
  })

  revalidatePath("/admin")
  revalidatePath("/admin/products")
  revalidatePath("/admin/overview")
  revalidatePath("/")
  revalidatePath(`/product/${uniqueSlug}`)

  return { success: "Product updated" }
}

const deleteProductSchema = z.object({
  productId: z.string().cuid(),
})

export async function deleteProductAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await ensureAdmin()

  const parsed = deleteProductSchema.safeParse({ productId: formData.get("productId") })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product" }
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

  const { productId } = parsed.data

  const product = await db.product.findUnique({ where: { id: productId }, select: { id: true } })
  if (!product) {
    return { error: "Product not found." }
  }

  const existingOrders = await db.orderItem.count({ where: { productId } })
  if (existingOrders > 0) {
    return { error: "Unable to delete a product that has order history." }
  }

  await db.$transaction(async (tx) => {
    await tx.productMedia.deleteMany({ where: { productId } })
    await tx.product.delete({ where: { id: productId } })
  })

  revalidatePath("/admin")
  revalidatePath("/admin/products")
  revalidatePath("/admin/overview")
  revalidatePath("/")

  return { success: "Product deleted" }
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

export async function uploadMediaAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await ensureAdmin()

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return { error: "Select a media file before uploading." }
  }

  if (!ALLOWED_MEDIA_TYPES.has(file.type)) {
    return { error: "Unsupported file type. Use JPG, PNG, WEBP, or GIF." }
  }

  if (file.size === 0) {
    return { error: "The selected file is empty." }
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return { error: "File is too large. Limit uploads to 5MB." }
  }

  const altInput = (formData.get("alt") ?? "").toString().trim()

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

  const uploadDir = path.join(process.cwd(), "public", "uploads")
  await fs.mkdir(uploadDir, { recursive: true })

  const fileName = createUploadFileName(file.name)
  const relativeUrl = `/uploads/${fileName}`
  const existingMedia = await db.media.findFirst({ where: { url: relativeUrl } })
  if (existingMedia) {
    return { success: "Media uploaded successfully." }
  }

  const filePath = path.join(uploadDir, fileName)
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  await fs.writeFile(filePath, fileBuffer)

  await db.media.create({
    data: {
      url: relativeUrl,
      alt: altInput.length > 0 ? altInput : null,
    },
  })

  revalidatePath("/admin/media")
  revalidatePath("/")

  return { success: "Media uploaded successfully." }
}

const updateMediaSchema = z.object({
  id: z.string().cuid(),
  alt: z.string().max(180).optional(),
})

export async function updateMediaAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await ensureAdmin()

  const parsed = updateMediaSchema.safeParse({
    id: formData.get("id"),
    alt: ((formData.get("alt") ?? "") as string).trim() || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid media update" }
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

  await db.media.update({
    where: { id: parsed.data.id },
    data: { alt: parsed.data.alt ?? null },
  })

  revalidatePath("/admin/media")
  revalidatePath("/")

  return { success: "Media details updated." }
}

const deleteMediaSchema = z.object({
  id: z.string().cuid(),
})

export async function deleteMediaAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await ensureAdmin()

  const parsed = deleteMediaSchema.safeParse({ id: formData.get("id") })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid media selection" }
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

  const media = await db.media.findUnique({ where: { id: parsed.data.id } })
  if (!media) {
    return { error: "Media record not found." }
  }

  const [productUsage, heroUsage, categoryUsage, productFeaturedUsage] = await Promise.all([
    db.productMedia.count({ where: { mediaId: media.id } }),
    db.heroMedia.count({ where: { backgroundImageId: media.id } }),
    db.category.count({ where: { featuredImageId: media.id } }),
    db.product.count({ where: { featuredImageId: media.id } }),
  ])

  if (productUsage + heroUsage + categoryUsage + productFeaturedUsage > 0) {
    return { error: "This media is currently in use. Update dependent content first." }
  }

  if (media.url.startsWith("/uploads/")) {
    const relativePath = media.url.replace(/^\/+/, "")
    const absolutePath = path.join(process.cwd(), "public", relativePath)
    try {
      await fs.unlink(absolutePath)
    } catch (error) {
      console.warn(`Unable to remove media file at ${absolutePath}:`, error)
    }
  }

  await db.media.delete({ where: { id: media.id } })

  revalidatePath("/admin/media")
  revalidatePath("/")

  return { success: "Media deleted." }
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
