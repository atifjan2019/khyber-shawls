'use server'

// Server actions for category CRUD operations
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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

    // SEO fields
    const seoTitle = formData.get('seoTitle')?.toString().trim() || null
    const seoDescription = formData.get('seoDescription')?.toString().trim() || null

    // Intro section fields
    const introTitle = formData.get('introTitle')?.toString().trim()
    const introDescription = formData.get('introDescription')?.toString().trim()
    const introImageFile = formData.get('introImageFile') as File | null
    const introImageAlt = formData.get('introImageAlt')?.toString().trim()

    // Get existing category data to preserve images
    const existing = await prisma.category.findUnique({ 
      where: { id },
      select: { slug: true, sections: true, intro: true }
    })
    
    // Parse existing data
    let existingSections: any[] = []
    try {
      if (existing?.sections) {
        existingSections = JSON.parse(existing.sections)
      }
    } catch (e) {
      console.error('Failed to parse existing sections:', e)
    }

    // Content sections (3 sections)
    const sections = []
    for (let i = 0; i < 3; i++) {
      const title = formData.get(`section${i}Title`)?.toString().trim()
      const description = formData.get(`section${i}Description`)?.toString().trim()
      const imageFile = formData.get(`section${i}ImageFile`) as File | null
      const imageAlt = formData.get(`section${i}ImageAlt`)?.toString().trim()
      
      // Upload section image if provided, otherwise keep existing
      let imageUrl = existingSections[i]?.image?.url || ''
      if (imageFile && imageFile.size > 0) {
        imageUrl = await saveUpload(imageFile)
      }
      
      // Only include section if it has at least a title and description
      if (title && description) {
        sections.push({
          title,
          description,
          image: { url: imageUrl, alt: imageAlt || '' }
        })
      }
    }

    if (!id) return { error: 'Missing category ID' }

    if (!existing) return { error: 'Category not found' }

    // Parse existing intro data
    let existingIntro: any = null
    try {
      if (existing.intro) {
        existingIntro = JSON.parse(existing.intro)
      }
    } catch (e) {
      console.error('Failed to parse existing intro:', e)
    }

    let featuredImageUrl: string | null | undefined = undefined
    if (featuredImageFile && featuredImageFile.size > 0) {
      featuredImageUrl = await saveUpload(featuredImageFile)
    }

    // Build intro JSON
    let introJson = null
    if (introTitle && introDescription) {
      // Upload intro image if provided, otherwise keep existing
      let introImageUrl = existingIntro?.image?.url || ''
      if (introImageFile && introImageFile.size > 0) {
        introImageUrl = await saveUpload(introImageFile)
      }
      
      introJson = JSON.stringify({
        title: introTitle,
        description: introDescription,
        image: { url: introImageUrl, alt: introImageAlt || '' }
      })
    }

    // Build sections JSON (already processed with file uploads above)
    const sectionsJson = sections.length > 0 ? JSON.stringify(sections) : null

    await prisma.category.update({
      where: { id },
      data: {
        name,
        summary,
        featuredImageAlt,
        seoTitle,
        seoDescription,
        intro: introJson,
        sections: sectionsJson,
        ...(featuredImageUrl !== undefined ? { featuredImageUrl } : {}),
      },
    })

    revalidatePath('/admin/categories')
    revalidatePath(`/admin/categories/${id}`)
    revalidatePath(`/category/${existing.slug}`)
    return { success: 'Category updated successfully!' }
  } catch (e: any) {
    return { error: e?.message || 'Failed to update category' }
  }
}

// ---- DELETE ----
export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = formData.get('id')?.toString()
  if (!id) return
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

