"use client"

import { useActionState, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Pencil, Trash, X } from "lucide-react"

import { deleteProductAction, updateProductAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"

type ActionState = { error?: string; success?: string }

type MediaOption = {
  id: string
  label: string
}

type ProductData = {
  id: string
  title: string
  description: string
  price: number
  priceLabel: string
  inventory: number
  categoryId: string
  categoryName?: string | null
  published: boolean
  featuredImageId: string | null
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  galleryMediaIds: string[]
}

type ProductListItemProps = {
  product: ProductData
  categories: Array<{ id: string; name: string }>
  mediaLibrary: Array<{ id: string; url: string; alt: string | null }>
}

const initialState: ActionState = { error: undefined, success: undefined }

export function ProductListItem({ product, categories, mediaLibrary }: ProductListItemProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  const [updateState, updateAction, isUpdating] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await updateProductAction(prev, formData)
      if (result.success) {
        setIsEditing(false)
        router.refresh()
      }
      return result
    },
    initialState
  )

  const [deleteState, deleteAction, isDeleting] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await deleteProductAction(prev, formData)
      if (result.success) {
        router.refresh()
      }
      return result
    },
    initialState
  )

  const mediaOptions: MediaOption[] = useMemo(
    () =>
      mediaLibrary.map((media) => ({
        id: media.id,
        label: media.alt?.length ? media.alt : media.url,
      })),
    [mediaLibrary]
  )

  return (
    <div className="grid gap-6 rounded-3xl border border-white/10 bg-background/70 p-5 shadow-sm transition hover:border-primary/40 hover:bg-primary/5 md:grid-cols-[160px,1fr]">
      <div className="relative hidden overflow-hidden rounded-2xl bg-muted md:block">
        {product.featuredImageUrl ? (
          <Image
            src={product.featuredImageUrl}
            alt={product.featuredImageAlt ?? product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No media
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-foreground">{product.title}</p>
            <p className="text-xs text-muted-foreground">
              {product.categoryName ?? "Uncategorised"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-sm">
            <p>{product.priceLabel}</p>
            <p className="text-xs text-muted-foreground">
              {product.published ? "Published" : "Draft"} · {product.inventory} in stock
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setIsEditing((value) => !value)}
          >
            {isEditing ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          <form action={deleteAction}>
            <input type="hidden" name="productId" value={product.id} />
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
              disabled={isDeleting}
              onClick={(event) => {
                const confirmed = window.confirm(
                  `Delete "${product.title}"? This action cannot be undone.`
                )
                if (!confirmed) {
                  event.preventDefault()
                  event.stopPropagation()
                }
              }}
            >
              <Trash className="size-3.5" />
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </form>
        </div>

        {(deleteState.error || deleteState.success) && (
          <p className={`text-xs ${deleteState.error ? "text-destructive" : "text-primary"}`}>
            {deleteState.error ?? deleteState.success}
          </p>
        )}

        {isEditing && (
          <form
            action={updateAction}
            className="space-y-4 rounded-2xl border border-white/10 bg-background/80 p-4"
          >
            <input type="hidden" name="productId" value={product.id} />
            <div className="grid gap-3">
              <label className="text-sm font-medium" htmlFor={`${product.id}-title`}>
                Title
              </label>
              <input
                id={`${product.id}-title`}
                name="title"
                defaultValue={product.title}
                required
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-medium" htmlFor={`${product.id}-description`}>
                Description
              </label>
              <textarea
                id={`${product.id}-description`}
                name="description"
                defaultValue={product.description}
                rows={3}
                required
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium" htmlFor={`${product.id}-price`}>
                Price (PKR)
                <input
                  id={`${product.id}-price`}
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.price}
                  required
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </label>
              <label className="text-sm font-medium" htmlFor={`${product.id}-inventory`}>
                Inventory
                <input
                  id={`${product.id}-inventory`}
                  name="inventory"
                  type="number"
                  min="0"
                  defaultValue={product.inventory}
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </label>
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-medium" htmlFor={`${product.id}-category`}>
                Category
              </label>
              <select
                id={`${product.id}-category`}
                name="categoryId"
                defaultValue={product.categoryId}
                required
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-medium" htmlFor={`${product.id}-featured`}>
                Featured image
              </label>
              <select
                id={`${product.id}-featured`}
                name="featuredImageId"
                defaultValue={product.featuredImageId ?? ""}
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {mediaOptions.map((media) => (
                  <option key={media.id} value={media.id}>
                    {media.label}
                  </option>
                ))}
                </select>
              <input
                id={`${product.id}-featured-file`}
                name="featuredImageFile"
                type="file"
                accept="image/*"
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground">
                Uploading a new file replaces the featured image and saves it to the media library.
              </p>
              <label className="text-sm font-medium" htmlFor={`${product.id}-featured-alt`}>
                Featured image alt text
              </label>
              <input
                id={`${product.id}-featured-alt`}
                name="featuredImageAlt"
                type="text"
                defaultValue={product.featuredImageAlt ?? ""}
                placeholder="Describe the product image for accessibility"
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-medium" htmlFor={`${product.id}-gallery-files`}>
                Upload gallery images
              </label>
              <input
                id={`${product.id}-gallery-files`}
                name="galleryFiles"
                type="file"
                multiple
                accept="image/*"
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground">
                Additional uploads are appended to the gallery and saved in the media library.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="published" defaultChecked={product.published} />
              Publish product
            </label>

            {updateState.error && <p className="text-sm text-destructive">{updateState.error}</p>}
            {updateState.success && <p className="text-sm text-primary">{updateState.success}</p>}

            <Button type="submit" disabled={isUpdating} size="sm">
              {isUpdating ? "Saving…" : "Save changes"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
