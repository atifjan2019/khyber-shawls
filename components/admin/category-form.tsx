'use client'

import { useActionState, useEffect, useRef } from "react"

import { createCategoryAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"

const initialState = { error: undefined as string | undefined, success: undefined as string | undefined }

export function CategoryForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(createCategoryAction, initialState)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="category-name">
          Category name
        </label>
        <input
          id="category-name"
          name="name"
          required
          placeholder="Heritage Looms"
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="category-summary">
          Summary
        </label>
        <textarea
          id="category-summary"
          name="summary"
          rows={3}
          placeholder="Describe what makes this category distinct."
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="category-featured-image-file">
          Upload featured image
        </label>
        <input
          id="category-featured-image-file"
          name="featuredImageFile"
          type="file"
          accept="image/*"
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
        />
        <p className="text-xs text-muted-foreground">
          Optional hero image for the collection. Uploading creates a new media entry automatically.
        </p>
        <label className="text-sm font-medium" htmlFor="category-featured-alt">
          Featured image alt text
        </label>
        <input
          id="category-featured-alt"
          name="featuredImageAlt"
          type="text"
          placeholder="Describe the collection imagery"
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-primary">{state.success}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create category"}
      </Button>
    </form>
  )
}
