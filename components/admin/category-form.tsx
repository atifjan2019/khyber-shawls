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
        <label className="text-sm font-medium" htmlFor="category-featured-image">
          Featured image URL
        </label>
        <input
          id="category-featured-image"
          name="featuredImageUrl"
          type="url"
          placeholder="https://res.cloudinary.com/..."
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <p className="text-xs text-muted-foreground">
          Optional hero image for the collection. Saved instantly—no approval workflow.
        </p>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-primary">{state.success}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create category"}
      </Button>
    </form>
  )
}
