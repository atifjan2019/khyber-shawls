"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import path from "path";
import { mkdir, writeFile, unlink } from "fs/promises";

import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin, getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { sendEmail } from "@/lib/email";
import { OrderStatus } from "@prisma/client";

export type ActionState = { error?: string; success?: string };
export type CategoryActionState =
  | { ok: true; message: string }
  | { ok: false; message: string; issues?: string[] };

// ============================================================================
// PRODUCT ACTIONS
// ============================================================================

const CreateProductInput = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  details: z.string().optional(),
  careInstructions: z.string().optional(),
  price: z.coerce.number().positive(),
  inventory: z.coerce.number().int().min(0).optional().default(0),
  categoryId: z.string().min(1),
  published: z.union([z.literal("on"), z.string()]).optional().nullable(),
  // removed featured
});

export async function createProductAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requireUser();

    const parsed = CreateProductInput.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      details: formData.get("details"),
      careInstructions: formData.get("careInstructions"),
      price: formData.get("price"),
      inventory: formData.get("inventory"),
      categoryId: formData.get("categoryId"),
      published: formData.get("published"),
  // removed featured
    });

    if (!parsed.success) {
      return { error: "Please check all required fields" };
    }

    // Handle featured image file upload
    let featuredImageId: string | null = null;
    const featuredImageFile = formData.get("featuredImageFile") as File | null;
    if (featuredImageFile && featuredImageFile.size > 0) {
      const buffer = Buffer.from(await featuredImageFile.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const safeName = featuredImageFile.name.replace(/\s+/g, "-");
      const filename = `${Date.now()}-${safeName}`;
      const publicUrl = `/uploads/${filename}`;

      await writeFile(path.join(uploadDir, filename), buffer);

      const media = await prisma.media.create({
        data: { url: publicUrl, alt: "" },
      });
      featuredImageId = media.id;
    }

    // Get image URL if featuredImageId exists
    let imageUrl = "";
    if (featuredImageId) {
      const media = await prisma.media.findUnique({ where: { id: featuredImageId } });
      imageUrl = media?.url || "";
    }

    // Handle gallery files - upload and prepare for product_images
    const galleryImages = [];
    const galleryFiles = formData.getAll("galleryFiles") as File[];
    for (let i = 0; i < galleryFiles.length; i++) {
      const file = galleryFiles[i];
      if (!file || file.size === 0) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const safeName = file.name.replace(/\s+/g, "-");
      const filename = `${Date.now()}-${i}-${safeName}`;
      const publicUrl = `/uploads/${filename}`;

      await writeFile(path.join(uploadDir, filename), buffer);

      galleryImages.push({
        id: `img_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`,
        url: publicUrl,
        alt: parsed.data.title,
        position: i,
        updatedAt: new Date(),
      });
    }


    // --- TAGS LOGIC ---
    const tagsRaw = formData.get("tags");
    let tagNames: string[] = [];
    if (typeof tagsRaw === "string") {
      tagNames = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);
    }
    type TagConnect = { id: string };
    let tagConnect: TagConnect[] = [];
    if (tagNames.length > 0) {
      tagConnect = await Promise.all(
        tagNames.map(async (name) => {
          const tag = await prisma.tag.upsert({
            where: { name },
            update: {},
            create: { name },
          });
          return { id: tag.id };
        })
      );
    }

    await prisma.product.create({
      data: {
        name: parsed.data.title,
        description: parsed.data.description,
        details: parsed.data.details || null,
        careInstructions: parsed.data.careInstructions || null,
        price: parsed.data.price,
        image: imageUrl,
        categoryId: parsed.data.categoryId,
        inStock: !!parsed.data.published,
        slug: slugify(parsed.data.title),
        published: !!parsed.data.published,
        product_images: {
          create: galleryImages,
        },
  tags: tagConnect.length > 0 ? { connect: tagConnect } : undefined,
      },
    });

    revalidatePath("/admin/products");
    return { success: "Product created successfully" };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "Failed to create product" };
  }
}

const UpdateProductInput = z.object({
  productId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  details: z.string().optional(),
  careInstructions: z.string().optional(),
  price: z.coerce.number().positive(),
  inventory: z.coerce.number().int().min(0),
  categoryId: z.string().min(1),
  published: z.union([z.literal("on"), z.boolean(), z.string()]).optional(),
  // removed featured
});

export async function updateProductAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireUser();

    const parsed = UpdateProductInput.safeParse({
      productId: formData.get("productId"),
      title: formData.get("title"),
      description: formData.get("description"),
      details: formData.get("details"),
      careInstructions: formData.get("careInstructions"),
      price: formData.get("price"),
      inventory: formData.get("inventory"),
      categoryId: formData.get("categoryId"),
      published: formData.get("published"),
  // removed featured
    });

    // --- TAGS LOGIC ---
    // Get tags from form, parse comma-separated, trim, filter empty
    const tagsRaw = formData.get("tags");
    let tagNames: string[] = [];
    if (typeof tagsRaw === "string") {
      tagNames = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);
    }

    // Upsert tags and collect their IDs
    type TagConnect = { id: string };
    let tagConnect: TagConnect[] = [];
    if (tagNames.length > 0) {
      tagConnect = await Promise.all(
        tagNames.map(async (name) => {
          const tag = await prisma.tag.upsert({
            where: { name },
            update: {},
            create: { name },
          });
          return { id: tag.id };
        })
      );
    }

    if (!parsed.success) {
      console.error("Validation errors:", parsed.error.issues);
      return { error: "Invalid product data: " + parsed.error.issues.map((e: any) => e.message).join(", ") };
    }

    // Handle featured image file upload
    let featuredImageId: string | null = null;
    const featuredImageFile = formData.get("featuredImageFile") as File | null;
    if (featuredImageFile && featuredImageFile.size > 0) {
      const buffer = Buffer.from(await featuredImageFile.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const safeName = featuredImageFile.name.replace(/\s+/g, "-");
      const filename = `${Date.now()}-${safeName}`;
      const publicUrl = `/uploads/${filename}`;

      await writeFile(path.join(uploadDir, filename), buffer);

      const media = await prisma.media.create({
        data: { url: publicUrl, alt: "" },
      });
      featuredImageId = media.id;
    }

    // Handle gallery files
    const galleryFiles = formData.getAll("galleryFiles") as File[];
    if (galleryFiles.length > 0 && galleryFiles[0].size > 0) {
      const galleryImages = [];
        for (let i = 0; i < galleryFiles.length; i++) {
          const file = galleryFiles[i];
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        const safeName = file.name.replace(/\s+/g, "-");
        const filename = `${Date.now()}-${safeName}`;
        const publicUrl = `/uploads/${filename}`;
        await writeFile(path.join(uploadDir, filename), buffer);
        galleryImages.push({ 
          id: `img_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          url: publicUrl, 
          alt: parsed.data.title,
            position: i,
          updatedAt: new Date()
        });
      }
      
      await prisma.product.update({
        where: { id: parsed.data.productId },
        data: {
          product_images: {
            create: galleryImages,
          },
        },
      });
    }

    // Get image URL if featuredImageId exists
    let imageUrl = undefined;
    if (featuredImageId) {
      const media = await prisma.media.findUnique({ where: { id: featuredImageId } });
      imageUrl = media?.url || "";
    }

    const isPublished = parsed.data.published === "on" || parsed.data.published === "true" || parsed.data.published === true;
    
    await prisma.product.update({
      where: { id: parsed.data.productId },
      data: {
        name: parsed.data.title,
        description: parsed.data.description,
        details: parsed.data.details || null,
        careInstructions: parsed.data.careInstructions || null,
        price: parsed.data.price,
        categoryId: parsed.data.categoryId,
        published: isPublished,
        inStock: isPublished,
  // removed featured
        ...(imageUrl !== undefined && { image: imageUrl }),
        // Replace tags completely instead of connecting on top of existing ones
        tags: { set: tagConnect },
      },
    });

    revalidatePath("/admin/products");
    return { success: "Product updated successfully" };
  } catch (error) {
    console.error("Error updating product:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { error: "Failed to update product: " + errorMessage };
  }
}

const DeleteProductInput = z.object({ productId: z.string().min(1) });

export async function deleteProductAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireUser();

    const parsed = DeleteProductInput.safeParse({
      productId: formData.get("productId"),
    });

    if (!parsed.success) {
      return { error: "Invalid product ID" };
    }

    // Product model doesn't have deletedAt field, so we use delete instead
    await prisma.product.delete({
      where: { id: parsed.data.productId },
    });

    revalidatePath("/admin/products");
    return { success: "Product deleted" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: "Failed to delete product" };
  }
}

const DeleteProductImageInput = z.object({
  productId: z.string().min(1),
  imageUrl: z.string().min(1),
});

export async function deleteProductImageAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireUser();

    const parsed = DeleteProductImageInput.safeParse({
      productId: formData.get("productId"),
      imageUrl: formData.get("imageUrl"),
    });

    if (!parsed.success) {
      return { error: "Invalid input" };
    }

    const { productId, imageUrl } = parsed.data;

    // Delete the gallery image from product_images table
    await prisma.product_images.deleteMany({
      where: {
        productId,
        url: imageUrl,
      },
    });

    revalidatePath("/admin/products");
    return { success: "Image removed" };
  } catch (error) {
    console.error("Error deleting product image:", error);
    return { error: "Failed to delete image" };
  }
}

const RemoveFeaturedImageInput = z.object({
  productId: z.string().min(1),
});

export async function removeFeaturedImageAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireUser();

    const parsed = RemoveFeaturedImageInput.safeParse({
      productId: formData.get("productId"),
    });

    if (!parsed.success) {
      return { error: "Invalid product ID" };
    }

    // Clear the featured image field (set to empty string since image field is required)
    await prisma.product.update({
      where: { id: parsed.data.productId },
      data: {
        image: "",
      },
    });

    revalidatePath("/admin/products");
    return { success: "Featured image removed" };
  } catch (error) {
    console.error("Error removing featured image:", error);
    return { error: "Failed to remove featured image" };
  }
}

// ============================================================================
// CATEGORY ACTIONS
// ============================================================================

const CategoryInput = z.object({
  name: z.string().min(1),
  summary: z.string().optional().nullable(),
});

export async function createCategoryAction(
  _prev: CategoryActionState | null,
  formData: FormData
): Promise<CategoryActionState> {
  try {
    await requireUser();

    const parsed = CategoryInput.safeParse({
      name: formData.get("name"),
      summary: formData.get("summary"),
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: "Invalid input",
        issues: parsed.error.issues.map((i) => i.message),
      };
    }

    // Handle featured image file
    let featuredImageId: string | null = null;
    const imageFile = formData.get("featuredImageFile") as File | null;
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const safeName = imageFile.name.replace(/\s+/g, "-");
      const filename = `${Date.now()}-${safeName}`;
      const publicUrl = `/uploads/${filename}`;

      await writeFile(path.join(uploadDir, filename), buffer);

      const media = await prisma.media.create({
        data: { url: publicUrl, alt: formData.get("featuredImageAlt") as string || "" },
      });
      featuredImageId = media.id;
    }

    await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        summary: parsed.data.summary || null,
        ...(featuredImageId && {
          featuredImageUrl: (await prisma.media.findUnique({ where: { id: featuredImageId } }))?.url || null,
          featuredImageAlt: formData.get("featuredImageAlt") as string || null,
        }),
      },
    });

    revalidatePath("/admin/categories");
    return { ok: true, message: "Category created" };
  } catch (err: any) {
    console.error("Error creating category:", err);
    return {
      ok: false,
      message: "Failed to create category",
      issues: [String(err?.message ?? err)],
    };
  }
}

// ============================================================================
// BLOG ACTIONS
// ============================================================================

const BlogInput = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  image: z.string().optional(),
  published: z.union([z.literal("on"), z.string()]).optional(),
});

export async function createBlogPostAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requireUser();

    const parsed = BlogInput.safeParse({
      title: formData.get("title"),
      slug: formData.get("slug") || slugify(formData.get("title") as string),
      content: formData.get("content"),
      excerpt: formData.get("excerpt"),
      image: formData.get("image"),
      published: formData.get("published"),
    });

    if (!parsed.success) {
      return { error: "Please fill in all required fields" };
    }

    await prisma.blogPost.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        content: parsed.data.content,
        excerpt: parsed.data.excerpt || null,
        image: parsed.data.image || null,
        published: !!parsed.data.published,
        authorId: user.id,
      },
    });

    revalidatePath("/admin/journal");
    revalidatePath("/blog");
    return { success: "Blog post published" };
  } catch (error) {
    console.error("Error creating blog post:", error);
    return { error: "Failed to create blog post" };
  }
}

// ============================================================================
// HERO MEDIA ACTIONS
// ============================================================================

const HeroInput = z.object({
  heroKey: z.string().min(1),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  backgroundImageUrl: z.string().url().optional(),
  backgroundImageAlt: z.string().optional(),
});

export async function upsertHeroMediaAction(
  _prev: CategoryActionState | null,
  formData: FormData
): Promise<CategoryActionState> {
  try {
    await requireAdmin();

    const parsed = HeroInput.safeParse({
      heroKey: formData.get("heroKey"),
      title: formData.get("title"),
      subtitle: formData.get("subtitle"),
      description: formData.get("description"),
      ctaLabel: formData.get("ctaLabel"),
      ctaHref: formData.get("ctaHref"),
      backgroundImageUrl: formData.get("backgroundImageUrl"),
      backgroundImageAlt: formData.get("backgroundImageAlt"),
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: "Invalid hero data",
        issues: parsed.error.issues.map((i) => i.message),
      };
    }

    // Handle background image
    let backgroundImageId: string | null = null;
    if (parsed.data.backgroundImageUrl) {
      const existing = await prisma.media.findFirst({
        where: { url: parsed.data.backgroundImageUrl },
      });

      if (existing) {
        backgroundImageId = existing.id;
      } else {
        const media = await prisma.media.create({
          data: {
            url: parsed.data.backgroundImageUrl,
            alt: parsed.data.backgroundImageAlt || null,
          },
        });
        backgroundImageId = media.id;
      }
    }

    await prisma.heroMedia.upsert({
      where: { key: parsed.data.heroKey },
      update: {
        title: parsed.data.title || "",
        subtitle: parsed.data.subtitle || null,
        description: parsed.data.description || null,
        ctaLabel: parsed.data.ctaLabel || null,
        ctaHref: parsed.data.ctaHref || null,
        ...(backgroundImageId && { backgroundImageId }),
      },
      create: {
        key: parsed.data.heroKey,
        title: parsed.data.title || "",
        subtitle: parsed.data.subtitle || null,
        description: parsed.data.description || null,
        ctaLabel: parsed.data.ctaLabel || null,
        ctaHref: parsed.data.ctaHref || null,
        ...(backgroundImageId && { backgroundImageId }),
      },
    });

    revalidatePath("/admin/media");
    revalidatePath("/");
    return { ok: true, message: "Hero banner saved" };
  } catch (error: any) {
    console.error("Error upserting hero media:", error);
    return { ok: false, message: `Failed to save hero banner: ${error.message}` };
  }
}

// ============================================================================
// ORDER ACTIONS
// ============================================================================

export async function updateOrderStatusAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const orderId = formData.get("orderId") as string;
    const status = formData.get("status") as OrderStatus;
    console.log(`updateOrderStatusAction called with orderId=${orderId}, status=${status}`);
    if (!orderId || !status) {
      return { error: "Missing order ID or status" };
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status },
    });

    // Send email to customer
    try {
      await sendEmail({
        to: updatedOrder.customerEmail,
        subject: `Your order status has been updated to ${status}`,
        html: `
          <h1>Order Status Updated</h1>
          <p>Hi ${updatedOrder.customerName},</p>
          <p>The status of your order #${orderId} has been updated to: <strong>${status}</strong>.</p>
          <p>Thank you for shopping with us!</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send order status update email:", error);
      // Do not block the response for email errors
    }

    revalidatePath("/admin/orders");
    return { success: "Order updated" };
  } catch (error) {
    console.error("Error updating order:", error);
    return { error: "Failed to update order" };
  }
}

// ============================================================================
// MEDIA ACTIONS
// ============================================================================

export async function uploadMediaAction(
  formData: FormData
): Promise<ActionState> {
  console.log("uploadMediaAction called");
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("uploadMediaAction: user not authenticated");
      return { error: "Authentication required" };
    }

    const files = formData.getAll("file") as File[];
    const alt = formData.get("alt") as string;
    console.log(`uploadMediaAction: received ${files.length} files`);


    if (!files || files.length === 0) {
      return { error: "No files provided" };
    }

    // Filter out empty files
    const validFiles = files.filter(file => file && file.size > 0);
    
    if (validFiles.length === 0) {
      return { error: "No valid files to upload" };
    }

    // Limit to 100 files
    if (validFiles.length > 100) {
      return { error: "Maximum 100 files allowed per upload" };
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    
    let uploadedCount = 0;
    const errors: string[] = [];

    console.log(`uploadMediaAction: starting upload of ${validFiles.length} files`);
    // Upload files sequentially to avoid overwhelming the server
    for (const file of validFiles) {
      try {
        console.log(`uploadMediaAction: uploading ${file.name}`);
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = file.name.replace(/\s+/g, "-");
        // Add timestamp and random number to avoid collisions when uploading multiple files at once
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${safeName}`;
        const publicUrl = `/uploads/${filename}`;

        await writeFile(path.join(uploadDir, filename), buffer);

        await prisma.media.create({
          data: { url: publicUrl, alt: alt || file.name },
        });
        
        uploadedCount++;
        console.log(`uploadMediaAction: successfully uploaded ${file.name}`);
      } catch (error) {
        errors.push(file.name);
        console.error(`Error uploading ${file.name}:`, error);
      }
    }

    console.log("uploadMediaAction: finished uploading files");
    revalidatePath("/admin/media");
    
    if (errors.length > 0) {
      return { 
        error: `Uploaded ${uploadedCount} files, but failed to upload: ${errors.join(", ")}` 
      };
    }
    
    return { success: `${uploadedCount} file${uploadedCount === 1 ? '' : 's'} uploaded successfully` };
  } catch (error) {
    console.error("Error in uploadMediaAction:", error);
    return { error: "Upload failed due to an unexpected error." };
  }
}

export async function updateMediaAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireUser();

    const id = formData.get("id") as string;
    const alt = formData.get("alt") as string;

    if (!id) {
      return { error: "No media ID provided" };
    }

    await prisma.media.update({
      where: { id },
      data: { alt: alt || null },
    });

    revalidatePath("/admin/media");
    return { success: "Media updated" };
  } catch (error) {
    console.error("Error updating media:", error);
    return { error: "Failed to update media" };
  }
}

export async function deleteMediaAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireUser();

    const id = formData.get("id") as string;

    if (!id) {
      return { error: "No media ID provided" };
    }

    const media = await prisma.media.findUnique({ where: { id } });

    if (!media) {
      return { error: "Media not found" };
    }

    await prisma.media.delete({ where: { id } });

    // Delete file from disk
    if (media.url.startsWith("/uploads/")) {
      try {
        await unlink(path.join(process.cwd(), "public", media.url));
      } catch {
        // File might not exist, ignore
      }
    }

    revalidatePath("/admin/media");
    return { success: "Media deleted" };
  } catch (error) {
    console.error("Error deleting media:", error);
    return { error: "Failed to delete media" };
  }
}