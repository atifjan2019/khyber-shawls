"use client"

import { useActionState } from "react"

import { uploadMediaAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"

const initialState = {
  error: undefined as string | undefined,
  success: undefined as string | undefined,
}

export function MediaUploadForm() {
  const [state, formAction, isPending] = useActionState(uploadMediaAction, initialState)

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-3xl border border-dashed border-primary/30 bg-background/70 p-6 shadow-sm"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Upload new media</h3>
        <p className="text-xs text-muted-foreground">
          Images are stored in the public uploads folder and become available immediately across the site.
        </p>
      </div>

      <label className="block text-sm font-medium text-foreground" htmlFor="media-file">
        Media file
        <input
          id="media-file"
          name="file"
          type="file"
          accept="image/*"
          required
          className="mt-2 w-full cursor-pointer rounded-md border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
        />
      </label>

      <label className="block text-sm font-medium text-foreground" htmlFor="media-alt">
        Alt text (optional)
        <input
          id="media-alt"
          name="alt"
          type="text"
          placeholder="Describe the visual for accessibility"
          className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </label>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-primary">{state.success}</p>}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Uploading…" : "Upload media"}
      </Button>
    </form>
  )
}
