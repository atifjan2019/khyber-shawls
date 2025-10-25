'use client'

import { useActionState, useEffect, useRef } from "react"

import { createProductAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"

type ProductFormProps = {
  categories: Array<{ id: string; name: string }>
}

const initialState = { error: undefined as string | undefined, success: undefined as string | undefined }

export function ProductForm({ categories }: ProductFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(createProductAction, initialState)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

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
 
        <input
          id="product-featured-image-file"
          name="featuredImageFile"
          type="file"
          accept="image/*"
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
        <input
          id="product-gallery-files"
          name="galleryFiles"
          type="file"
          multiple
          accept="image/*"
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
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="published" /> Publish product immediately
      </label>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-primary">{state.success}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save product"}
      </Button>
    </form>
  )
}
