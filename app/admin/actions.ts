"use server";

import { z } from "zod";
import path from "path";
import { mkdir, writeFile, unlink } from "fs/promises";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { ensurePrismaClient } from "@/lib/prisma";

/* ───────────────────────────────────────────────
   Shared helpers & types
   ─────────────────────────────────────────────── */

export type MediaActionState = { error?: string; success?: string };
export type CategoryActionState =
  | { ok: true; message: string }
  | { ok: false; message: string; issues?: string[] };

const asNumberIfPossible = (v: string) => (/^\d+$/.test(v) ? Number(v) : v);

/* ───────────────────────────────────────────────
   CATEGORY: create
   ─────────────────────────────────────────────── */

const CategoryInput = z.object({
  name: z.string().min(1),
  summary: z.string().optional().nullable(),
  featuredImageUrl: z.string().url().optional().nullable(),
});

export async function createCategoryAction(
  _prev: CategoryActionState | null,
  formData: FormData
): Promise<CategoryActionState> {
  const user = await requireUser();
  if (!user) return { ok: false, message: "Unauthorized" };

  const parsed = CategoryInput.safeParse({
    name: formData.get("name"),
    summary: formData.get("summary"),
    featuredImageUrl: formData.get("featuredImageUrl"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid input",
      issues: parsed.error.issues.map((i) => i.message),
    };
  }

  const db = ensurePrismaClient();
  const data: Record<string, any> = {
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
  };
  if (parsed.data.summary) data.summary = parsed.data.summary;
  if (parsed.data.featuredImageUrl)
    data.featuredImageUrl = parsed.data.featuredImageUrl;

  try {
    await db.category.create({ data });
    return { ok: true, message: "Category created" };
  } catch (err: any) {
    return { ok: false, message: "Failed to create category", issues: [String(err?.message ?? err)] };
  }
}

/* ───────────────────────────────────────────────
   PRODUCT: create / update / delete
   ─────────────────────────────────────────────── */

const CreateProductInput = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  inventory: z.coerce.number().int().min(0).optional().default(0),
  categoryId: z.string().min(1),
  published: z.union([z.literal("on"), z.string()]).optional().nullable(),
});

export async function createProductAction(
  _prev: MediaActionState | null,
  formData: FormData
): Promise<MediaActionState> {
  const user = await requireUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateProductInput.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    inventory: formData.get("inventory"),
    categoryId: formData.get("categoryId"),
    published: formData.get("published"),
  });
  if (!parsed.success) return { error: "Please check the form fields and try again." };

  const db = ensurePrismaClient();
  const data: Record<string, any> = {
    title: parsed.data.title,
    description: parsed.data.description,
    price: parsed.data.price,
    inventory: parsed.data.inventory ?? 0,
    slug: slugify(parsed.data.title),
    categoryId: parsed.data.categoryId,
    published: !!parsed.data.published,
  };

  try {
    await db.product.create({ data });
    return { success: "Product saved" };
  } catch (e: any) {
    return { error: `Failed to save product: ${String(e?.message ?? e)}` };
  }
}

const UpdateProductInput = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().optional(),
  inventory: z.coerce.number().int().optional(),
  categoryId: z.string().optional(),
  published: z.union([z.boolean(), z.string()]).optional(),
});

export async function updateProductAction(
  _prev: MediaActionState | null,
  formData: FormData
): Promise<MediaActionState> {
  const user = await requireUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateProductInput.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    inventory: formData.get("inventory"),
    categoryId: formData.get("categoryId"),
    published: formData.get("published"),
  });
  if (!parsed.success) return { error: "Invalid update data" };

  const db = ensurePrismaClient();

  try {
    const { id, ...rest } = parsed.data;
    const data: Record<string, unknown> = {};
    for (const key of Object.keys(rest) as (keyof typeof rest)[]) {
      const value = rest[key];
      if (value !== undefined && value !== "") {
        data[key] = key === "published" ? value === "true" || value === true : value;
      }
    }
    await db.product.update({ where: { id }, data });
    return { success: "Product updated" };
  } catch (e: any) {
    return { error: `Failed to update: ${String(e.message ?? e)}` };
  }
}

const DeleteProductInput = z.object({ id: z.string().min(1) });

export async function deleteProductAction(
  _prev: MediaActionState | null,
  formData: FormData
): Promise<MediaActionState> {
  const user = await requireUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = DeleteProductInput.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { error: "Invalid product id" };

  const db = ensurePrismaClient();
  try {
    await db.product.update({
      where: { id: parsed.data.id },
      data: { deletedAt: new Date() },
    });
    return { success: "Product deleted" };
  } catch (e: any) {
    return { error: `Failed to delete: ${String(e.message ?? e)}` };
  }
}

/* ───────────────────────────────────────────────
   HERO MEDIA: upsert  ✅ PERSIST TO DB
   ─────────────────────────────────────────────── */

const HeroUpsertInput = z.object({
  key: z.string().min(1), // e.g. "home"
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
  ctaHref: z.string().optional().nullable(),
  backgroundImageUrl: z.string().url().optional().nullable(),
  backgroundImageAlt: z.string().optional().nullable(),
});

export async function upsertHeroMediaAction(
  _prev: CategoryActionState | null,
  formData: FormData
): Promise<CategoryActionState> {
  const user = await requireUser();
  if (!user) return { ok: false, message: "Unauthorized" };

  const parsed = HeroUpsertInput.safeParse({
    key: formData.get("heroKey") ?? formData.get("key"),
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

  const db = ensurePrismaClient();

  // Link/ensure Media if a backgroundImageUrl was provided
  let backgroundImageId: string | null = null;
  if (parsed.data.backgroundImageUrl) {
    const existing = await db.media.findFirst({
      where: { url: parsed.data.backgroundImageUrl },
      select: { id: true },
    });
    if (existing) {
      backgroundImageId = existing.id;
      // Optionally update alt if supplied
      if (parsed.data.backgroundImageAlt !== undefined) {
        await db.media.update({
          where: { id: existing.id },
          data: { alt: parsed.data.backgroundImageAlt ?? null },
        });
      }
    } else {
      const created = await db.media.create({
        data: {
          url: parsed.data.backgroundImageUrl,
          alt: parsed.data.backgroundImageAlt ?? null,
        },
        select: { id: true },
      });
      backgroundImageId = created.id;
    }
  }

  // Upsert hero by key
  await db.heroMedia.upsert({
    where: { key: parsed.data.key },
    update: {
      title: parsed.data.title ?? null,
      subtitle: parsed.data.subtitle ?? null,
      description: parsed.data.description ?? null,
      ctaLabel: parsed.data.ctaLabel ?? null,
      ctaHref: parsed.data.ctaHref ?? null,
      backgroundImageId,
    },
    create: {
      key: parsed.data.key,
      title: parsed.data.title ?? null,
      subtitle: parsed.data.subtitle ?? null,
      description: parsed.data.description ?? null,
      ctaLabel: parsed.data.ctaLabel ?? null,
      ctaHref: parsed.data.ctaHref ?? null,
      backgroundImageId,
    },
  });

  // Revalidate the admin page and homepage
  revalidatePath("/admin/media");
  revalidatePath("/");

  return { ok: true, message: "Hero banner saved" };
}

/* ───────────────────────────────────────────────
   MEDIA: upload / update / delete
   ─────────────────────────────────────────────── */

const UploadMediaInput = z.object({
  file: z.instanceof(File),
  alt: z.string().optional().nullable(),
});

export async function uploadMediaAction(
  _prev: MediaActionState | null,
  formData: FormData
): Promise<MediaActionState> {
  const user = await requireUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UploadMediaInput.safeParse({
    file: formData.get("file"),
    alt: formData.get("alt"),
  });
  if (!parsed.success) return { error: "Invalid upload data" };

  const db = ensurePrismaClient();

  try {
    const buffer = Buffer.from(await parsed.data.file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const safeName = parsed.data.file.name.replace(/\s+/g, "-");
    const filename = `${Date.now()}-${safeName}`;
    const filePathPublic = `/uploads/${filename}`;
    const filePathFs = path.join(uploadDir, filename);

    await writeFile(filePathFs, buffer);

    await db.media.create({
      data: {
        url: filePathPublic,
        alt: parsed.data.alt ?? null,
      },
    });

    revalidatePath("/admin/media");
    return { success: "File uploaded successfully" };
  } catch (e: any) {
    console.error(e);
    return { error: "Upload failed. Please try again." };
  }
}

const UpdateMediaInput = z.object({
  id: z.string().min(1),
  url: z.string().url().optional().nullable(),
  alt: z.string().optional().nullable(),
  width: z.coerce.number().optional().nullable(),
  height: z.coerce.number().optional().nullable(),
});

export async function updateMediaAction(
  _prev: MediaActionState | null,
  formData: FormData
): Promise<MediaActionState> {
  const user = await requireUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateMediaInput.safeParse({
    id: formData.get("id"),
    url: formData.get("url"),
    alt: formData.get("alt"),
    width: formData.get("width"),
    height: formData.get("height"),
  });
  if (!parsed.success) return { error: "Invalid media data" };

  const db = ensurePrismaClient();

  try {
    const { id, ...rest } = parsed.data;
    const data: any = {};
    if (rest.url !== undefined) data.url = rest.url ?? null;
    if (rest.alt !== undefined) data.alt = rest.alt ?? null;

    await db.media.update({ where: { id }, data });
    revalidatePath("/admin/media");
    return { success: "Media updated" };
  } catch (e: any) {
    return { error: `Failed to update media: ${String(e?.message ?? e)}` };
  }
}

const DeleteMediaInput = z.object({
  id: z.string().min(1),
});

export async function deleteMediaAction(
  _prev: MediaActionState | null,
  formData: FormData
): Promise<MediaActionState> {
  const user = await requireUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = DeleteMediaInput.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { error: "Invalid media id" };

  const db = ensurePrismaClient();

  try {
    const media = await db.media.findUnique({ where: { id: parsed.data.id } });
    if (!media) return { error: "Media not found" };

    await db.media.delete({ where: { id: parsed.data.id } });

    if (media.url && media.url.startsWith("/uploads/")) {
      const fsPath = path.join(process.cwd(), "public", media.url);
      try {
        await unlink(fsPath);
      } catch {
        // ignore
      }
    }

    revalidatePath("/admin/media");
    return { success: "Media deleted" };
  } catch (e: any) {
    return { error: `Failed to delete media: ${String(e?.message ?? e)}` };
  }
}
