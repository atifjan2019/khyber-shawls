"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Check, Copy, Pencil, Trash, X } from "lucide-react"

import { deleteMediaAction, updateMediaAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"

type ActionState = { error?: string; success?: string }

export type MediaLibraryItem = {
  id: string
  url: string
  alt: string | null
  uploadedAtLabel: string
  createdAtISO: string
}

const initialActionState: ActionState = { error: undefined, success: undefined }

function MediaCard({ item }: { item: MediaLibraryItem }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await updateMediaAction(prev, formData)
      if (result.success) {
        setIsEditing(false)
        router.refresh()
      }
      return result
    },
    initialActionState
  )
  const [deleteState, deleteAction, isDeleting] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await deleteMediaAction(prev, formData)
      if (result.success) {
        router.refresh()
      }
      return result
    },
    initialActionState
  )

  useEffect(() => {
    if (!copied) return

    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  const handleCopyLink = async () => {
    const origin = window.location.origin
    const link = item.url.startsWith("http") ? item.url : `${origin}${item.url}`

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link)
        setCopied(true)
        return
      }
      throw new Error("Clipboard API unavailable")
    } catch (error) {
      console.warn("Falling back to legacy copy", error)
      try {
        const textarea = document.createElement("textarea")
        textarea.value = link
        textarea.setAttribute("readonly", "")
        textarea.style.position = "absolute"
        textarea.style.left = "-9999px"
        document.body.appendChild(textarea)
        textarea.select()
        const successful = document.execCommand("copy")
        document.body.removeChild(textarea)
        if (!successful) {
          throw new Error("execCommand copy failed")
        }
        setCopied(true)
        return
      } catch (fallbackError) {
        console.error("Failed to copy media link", fallbackError)
        setCopied(false)
      }
    }
  }

  const editButtonLabel = isEditing ? "Cancel" : "Edit details"
  const isExternal = item.url.startsWith("http://") || item.url.startsWith("https://")

  return (
    <li className="overflow-hidden rounded-2xl border border-white/10 bg-background/80 shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-white/5">
        {isExternal ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.alt ?? "Uploaded media"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </>
        ) : (
          <Image
            src={item.url}
            alt={item.alt ?? "Uploaded media"}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="space-y-3 p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-medium text-foreground">{item.alt ?? "No alt text provided"}</p>
            <p className="text-xs text-muted-foreground">Uploaded {item.uploadedAtLabel}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="size-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" /> Copy link
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground break-all">{item.url}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing((value) => !value)}
            className="flex items-center gap-1"
          >
            {isEditing ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
            {editButtonLabel}
          </Button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={item.id} />
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
              disabled={isDeleting}
              onClick={(event) => {
                const confirmed = window.confirm("Delete this media asset? This cannot be undone.")
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

        {isEditing && (
          <form action={formAction} className="space-y-3 rounded-2xl border border-white/10 bg-background/70 p-4">
            <input type="hidden" name="id" value={item.id} />
            <label className="block text-xs font-medium text-foreground" htmlFor={`${item.id}-alt`}>
              Alt text
              <input
                id={`${item.id}-alt`}
                name="alt"
                defaultValue={item.alt ?? ""}
                placeholder="Describe the visual for accessibility"
                className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </label>

            {state.error && <p className="text-xs text-destructive">{state.error}</p>}
            {state.success && <p className="text-xs text-primary">{state.success}</p>}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isPending} size="sm">
                {isPending ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {(deleteState.error || deleteState.success) && (
          <p className={`text-xs ${deleteState.error ? "text-destructive" : "text-primary"}`}>
            {deleteState.error ?? deleteState.success}
          </p>
        )}
      </div>
    </li>
  )
}

export function MediaLibrary({ items }: { items: MediaLibraryItem[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) =>
        new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime()
      ),
    [items]
  )

  const totalPages = Math.ceil(sorted.length / itemsPerPage)
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sorted.slice(startIndex, startIndex + itemsPerPage)
  }, [sorted, currentPage, itemsPerPage])

  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])

  if (sorted.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground">
        Upload your first asset to start building the media library.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paginatedItems.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
