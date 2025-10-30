'use client'

import { useActionState, useEffect, useRef, useState } from "react"
import Image from "next/image"

import { createProductAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"

type ProductFormProps = {
  categories: Array<{ id: string; name: string }>
  product?: {
    featured?: boolean;
    [key: string]: any;
  }
}

const initialState = { error: undefined as string | undefined, success: undefined as string | undefined }

export function ProductForm({ categories, product }: ProductFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [state, formAction, isPending] = useActionState(createProductAction, initialState)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      setFeaturedPreview(null)
      setGalleryPreviews([])
    }
  }, [state.success])

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFeaturedPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const previews: string[] = []
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        previews.push(reader.result as string)
        if (previews.length === files.length) {
          setGalleryPreviews(previews)
        }
      }
      reader.readAsDataURL(file)
    })
  }
  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="product-title">
          Title
        </label>
        <input
          id="product-title"
          name="title"
          required
          placeholder="Aurora Pashmina Shawl"
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="product-description">
          Description
        </label>
        <textarea
          id="product-description"
          name="description"
          rows={4}
          required
          placeholder="Explain the fibres, pattern inspiration, and styling suggestions."
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="product-details">
          Product Details
        </label>
        <textarea
          id="product-details"
          name="details"
          rows={4}
          placeholder="Material, dimensions, origin, certification details (one per line or formatted text)"
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <p className="text-xs text-muted-foreground">Optional - Shows in Details tab</p>
      </div>
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="product-care">
          Care Instructions
        </label>
        <textarea
          id="product-care"
          name="careInstructions"
          rows={4}
          placeholder="Cleaning, storage, handling instructions (one per line or formatted text)"
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <p className="text-xs text-muted-foreground">Optional - Shows in Care tab</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium" htmlFor="product-price">
          Price (PKR)
          <input
            id="product-price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>
        <label className="text-sm font-medium" htmlFor="product-inventory">
          Inventory
          <input
            id="product-inventory"
            name="inventory"
            type="number"
            min="0"
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>
      </div>
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="product-featured-image">
          Featured image
        </label>

        {featuredPreview && (
          <div className="relative h-48 w-full overflow-hidden rounded-md border">
            <Image
              src={featuredPreview}
              alt="Featured image preview"
              fill
              className="object-contain"
            />
          </div>
        )}
 
        <input
          id="product-featured-image-file"
          name="featuredImageFile"
          type="file"
          accept="image/*"
          onChange={handleFeaturedImageChange}
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
        />
        <p className="text-xs text-muted-foreground">
          Or upload directly from your computer. A new library entry is created automatically.
        </p>
        {/* <label className="text-sm font-medium" htmlFor="product-featured-alt">
          Featured image alt text
        </label>
        <input
          id="product-featured-alt"
          name="featuredImageAlt"
          type="text"
          placeholder="Describe the product image for accessibility"
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        /> */}
      </div>
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="product-gallery-files">
          Upload gallery images
        </label>

        {galleryPreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {galleryPreviews.map((preview, index) => (
              <div key={index} className="relative h-32 overflow-hidden rounded-md border">
                <Image
                  src={preview}
                  alt={`Gallery image ${index + 1} preview`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <input
          id="product-gallery-files"
          name="galleryFiles"
          type="file"
          multiple
          accept="image/*"
          onChange={handleGalleryChange}
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
        />
        <p className="text-xs text-muted-foreground">
          Add additional gallery shots by uploading files directly (hold Shift to select multiple).
        </p>
      </div>
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="product-category">
          Category
        </label>
        <select
          id="product-category"
          name="categoryId"
          required
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="product-tags">
          Tags
        </label>
        <input
          id="product-tags"
          name="tags"
          type="text"
          placeholder="Comma-separated tags (e.g. pashmina, winter, luxury)"
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          defaultValue={product?.tags ? product.tags.map((t: any) => t.name ? t.name : t).join(", ") : ""}
        />
        <p className="text-xs text-muted-foreground">Optional - Separate tags with commas</p>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="published" /> Publish product immediately
      </label>
      {/* Removed featured checkbox */}
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-primary">{state.success}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save product"}
      </Button>
    </form>
  )
}
