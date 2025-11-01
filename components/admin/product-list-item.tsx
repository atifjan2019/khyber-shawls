"use client"

import { useActionState, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Pencil, Trash, X } from "lucide-react"

import { deleteProductAction, updateProductAction, deleteProductImageAction, removeFeaturedImageAction } from "@/app/admin/actions"
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
  details?: string | null
  careInstructions?: string | null
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
  galleryImages?: Array<{ url: string; alt: string | null }>
  tags?: string[]
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
  const [removingImageUrl, setRemovingImageUrl] = useState<string | null>(null)
  
  // Reset edit mode
  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

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

  const handleRemoveGalleryImage = async (imageUrl: string) => {
    if (!window.confirm("Remove this image from the gallery?")) return
    
    setRemovingImageUrl(imageUrl)
    const formData = new FormData()
    formData.append("productId", product.id)
    formData.append("imageUrl", imageUrl)
    
    const result = await deleteProductImageAction(null, formData)
    setRemovingImageUrl(null)
    
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Failed to remove image")
    }
  }

  const handleRemoveFeaturedImage = async () => {
    if (!window.confirm("Remove the featured image?")) return
    
    const formData = new FormData()
    formData.append("productId", product.id)
    
    const result = await removeFeaturedImageAction(null, formData)
    
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Failed to remove featured image")
    }
  }

  const mediaOptions: MediaOption[] = useMemo(
    () =>
      mediaLibrary.map((media) => ({
        id: media.id,
        label: media.alt?.length ? media.alt : media.url,
      })),
    [mediaLibrary]
  )

  return (
    <div className="flex flex-col md:flex-row gap-6 rounded-3xl border border-white/10 bg-white/90 p-6 shadow-lg transition-all hover:border-primary/40 hover:shadow-2xl relative">
      <div className="relative w-full max-w-[140px] aspect-square overflow-hidden rounded-2xl bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-200">
        {product.featuredImageUrl ? (
          <Image
            src={product.featuredImageUrl}
            alt={product.featuredImageAlt ?? product.title}
            fill
            className="object-cover"
            sizes="140px"
          />
        ) : (
          <span className="text-xs text-gray-400">No image</span>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-900 truncate">{product.title}</p>
            <p className="text-xs text-gray-500 truncate">
              {product.categoryName ?? "Uncategorised"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-sm">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-primary font-bold text-sm">
              {product.priceLabel}
            </span>
            <span className={`text-xs ${product.published ? "text-green-600" : "text-gray-400"}`}>
              {product.published ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-700 line-clamp-2 mt-1">{product.description}</p>


  <div className="flex flex-wrap items-center gap-2 mt-2">
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="flex items-center gap-1"
  onClick={handleEditToggle}
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
            {/* Tags input/select */}
            <div className="grid gap-3">
              <label className="text-sm font-medium" htmlFor={`${product.id}-tags`}>
                Tags
              </label>
              <input
                id={`${product.id}-tags`}
                name="tags"
                type="text"
                defaultValue={product.tags ? product.tags.join(", ") : ""}
                placeholder="e.g. wool, winter, luxury"
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              <p className="text-xs text-muted-foreground">Comma-separated (e.g. wool, winter, luxury)</p>
            </div>
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
            <div className="grid gap-3">
              <label className="text-sm font-medium" htmlFor={`${product.id}-details`}>
                Product Details
              </label>
              <textarea
                id={`${product.id}-details`}
                name="details"
                defaultValue={product.details || ""}
                rows={3}
                placeholder="Material, dimensions, origin, certification details"
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              <p className="text-xs text-muted-foreground">Optional - Shows in Details tab</p>
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-medium" htmlFor={`${product.id}-care`}>
                Care Instructions
              </label>
              <textarea
                id={`${product.id}-care`}
                name="careInstructions"
                defaultValue={product.careInstructions || ""}
                rows={3}
                placeholder="Cleaning, storage, handling instructions"
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              <p className="text-xs text-muted-foreground">Optional - Shows in Care tab</p>
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
              
              {/* Show current featured image preview */}
              {product.featuredImageUrl && (
                <div className="relative w-32 h-32 rounded-md overflow-hidden border border-white/10 group">
                  <Image
                    src={product.featuredImageUrl}
                    alt={product.featuredImageAlt ?? "Current featured image"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <p className="text-xs text-white truncate">Current</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFeaturedImage}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                    title="Remove featured image"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}
              
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
              
              {/* Show current gallery images */}
              {product.galleryImages && product.galleryImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.galleryImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="relative w-20 h-20 rounded-md overflow-hidden border border-white/10 group"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt ?? `Gallery image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(img.url)}
                        disabled={removingImageUrl === img.url}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90 disabled:opacity-50"
                        title="Remove image"
                      >
                        {removingImageUrl === img.url ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <X className="size-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
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
