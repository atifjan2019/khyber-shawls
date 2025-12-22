"use client"

import { useActionState, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Pencil, Trash, X } from "lucide-react"

import { deleteProductAction, updateProductAction, deleteProductImageAction, removeFeaturedImageAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"


import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { ImageUpload } from "@/components/admin/image-upload"

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

  // Rich text editor state
  const [description, setDescription] = useState(product.description)
  const [details, setDetails] = useState(product.details || "")
  const [careInstructions, setCareInstructions] = useState(product.careInstructions || "")

  // Image upload state
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(product.featuredImageUrl)
  const [newGalleryImages, setNewGalleryImages] = useState<string[]>([])

  // Reset edit mode
  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    // Reset rich text fields when toggling
    if (!isEditing) {
      setDescription(product.description)
      setDetails(product.details || "")
      setCareInstructions(product.careInstructions || "")
      setFeaturedImageUrl(product.featuredImageUrl)
      setNewGalleryImages([])
    }
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



  return (
    <div className="flex flex-col md:flex-row gap-6 rounded-3xl border border-white/10 bg-white/90 p-[10px] md:p-6 shadow-lg transition-all hover:border-primary/40 hover:shadow-2xl relative">
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
              <RichTextEditor
                content={description}
                onChange={setDescription}
                id={`${product.id}-description`}
              />
              <input type="hidden" name="description" value={description} />
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-medium" htmlFor={`${product.id}-details`}>
                Product Details
              </label>
              <RichTextEditor
                content={details}
                onChange={setDetails}
                id={`${product.id}-details`}
                placeholder="Material, dimensions, origin, certification details"
              />
              <input type="hidden" name="details" value={details} />
              <p className="text-xs text-muted-foreground">Optional - Shows in Details tab</p>
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-medium" htmlFor={`${product.id}-care`}>
                Care Instructions
              </label>
              <RichTextEditor
                content={careInstructions}
                onChange={setCareInstructions}
                id={`${product.id}-care`}
                placeholder="Cleaning, storage, handling instructions"
              />
              <input type="hidden" name="careInstructions" value={careInstructions} />
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
              <label className="text-sm font-medium">Featured image</label>
              <input type="hidden" name="featuredImageUrl" value={featuredImageUrl || ""} />
              <ImageUpload
                value={featuredImageUrl}
                onChange={setFeaturedImageUrl}
                label="Click to upload featured image"
              />
              <p className="text-xs text-muted-foreground">
                This image will act as the main product image.
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
              <label className="text-sm font-medium">Gallery images</label>

              {/* Show current gallery images */}
              <div className="flex flex-wrap gap-2">
                {product.galleryImages?.map((img, idx) => (
                  <div key={`old-${idx}`} className="relative w-20 h-20 rounded-md overflow-hidden border border-white/10 group">
                    <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(img.url)}
                      disabled={removingImageUrl === img.url}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {/* Show newly uploaded gallery images */}
                {newGalleryImages.map((url, idx) => (
                  <div key={`new-${idx}`} className="relative w-20 h-20 rounded-md overflow-hidden border border-blue-500 border-2">
                    <Image src={url} alt="New" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewGalleryImages(prev => prev.filter(u => u !== url))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="size-3" />
                    </button>
                    <input type="hidden" name="galleryImageUrls" value={url} />
                  </div>
                ))}
              </div>

              <p className="text-sm font-medium mt-2">Add more images</p>
              <ImageUpload
                value={null}
                onChange={(url) => {
                  if (url) setNewGalleryImages(prev => [...prev, url])
                }}
                label="Add gallery image (multiple allowed)"
                multiple={true}
              />
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
