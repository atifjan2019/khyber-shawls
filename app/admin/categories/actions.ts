'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import path from 'path'
import fs from 'fs/promises'

// ---- Shared Type ----
export type CategoryActionState = {
  success?: string
  error?: string
}

// ---- Helper for Saving Upload ----
export async function saveUpload(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  const filePath = path.join(uploadDir, file.name)
  await fs.writeFile(filePath, buffer)
  return `/uploads/${file.name}`
}

// ---- CREATE ----
export async function createCategoryAction(
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  try {
    const name = formData.get('name')?.toString().trim()
    const summary = formData.get('summary')?.toString().trim() || null
    const featuredImageFile = formData.get('featuredImageFile') as File | null
    const featuredImageAlt = formData.get('featuredImageAlt')?.toString().trim() || null

    if (!name) return { error: 'Name is required' }

    let featuredImageUrl: string | null = null
    if (featuredImageFile && featuredImageFile.size > 0) {
      featuredImageUrl = await saveUpload(featuredImageFile)
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    await prisma.category.create({
      data: { name, slug, summary, featuredImageUrl, featuredImageAlt },
    })

    revalidatePath('/admin/categories')
    return { success: 'Category created' }
  } catch (e: any) {
    return { error: e?.message || 'Failed to create category' }
  }
}

// ---- UPDATE ----
export async function updateCategoryAction(
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  try {
    const id = formData.get('id')?.toString()
    const name = formData.get('name')?.toString().trim()
    const summary = formData.get('summary')?.toString().trim() || null
    const featuredImageFile = formData.get('featuredImageFile') as File | null
    const featuredImageAlt = formData.get('featuredImageAlt')?.toString().trim() || null

    if (!id) return { error: 'Missing category ID' }

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) return { error: 'Category not found' }

    let featuredImageUrl: string | null | undefined = undefined
    if (featuredImageFile && featuredImageFile.size > 0) {
      featuredImageUrl = await saveUpload(featuredImageFile)
    }

    await prisma.category.update({
      where: { id },
      data: {
        name,
        summary,
        featuredImageAlt,
        ...(featuredImageUrl !== undefined ? { featuredImageUrl } : {}),
      },
    })

    revalidatePath('/admin/categories')
    return { success: 'Category updated' }
  } catch (e: any) {
    return { error: e?.message || 'Failed to update category' }
  }
}

// ---- DELETE ----
// /app/admin/categories/actions.ts
export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = formData.get('id')?.toString()
  if (!id) return
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
  // <- return nothing
}

