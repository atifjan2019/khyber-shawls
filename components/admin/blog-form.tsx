'use client'

import { useActionState, useEffect, useRef } from "react"

import { createBlogPostAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"

const initialState = { error: undefined as string | undefined, success: undefined as string | undefined }

export function BlogForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(createBlogPostAction, initialState)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="blog-title">
          Title
        </label>
        <input
          id="blog-title"
          name="title"
          required
          placeholder="Behind the craftsmanship"
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="blog-excerpt">
          Excerpt
        </label>
        <textarea
          id="blog-excerpt"
          name="excerpt"
          rows={2}
          placeholder="A short summary that appears in listings."
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="blog-content">
          Body content
        </label>
        <textarea
          id="blog-content"
          name="content"
          rows={6}
          required
          placeholder="Write the story behind a recent piece, artisan, or tradition."
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="published" /> Publish immediately
      </label>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-primary">{state.success}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Publishing…" : "Publish entry"}
      </Button>
    </form>
  )
}
