'use client'

import { useActionState } from 'react'
import { updateCategoryAction, type CategoryActionState } from '@/app/admin/categories/actions'
import { Button } from '@/components/ui/button'

const initialState: CategoryActionState = {}

export function CategoryEditForm(props: {
  id: string
  name: string
  summary?: string | null
  featuredImageUrl?: string | null
  featuredImageAlt?: string | null
}) {
  const [state, action, pending] = useActionState<CategoryActionState, FormData>(
    updateCategoryAction,
    initialState
  )

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={props.id} />

      <div className="grid gap-1.5">
        <label className="text-sm">Name</label>
        <input
          name="name"
          defaultValue={props.name}
          required
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm">Summary</label>
        <textarea
          name="summary"
          defaultValue={props.summary ?? ''}
          rows={3}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm">Replace image (optional)</label>
        <input name="featuredImageFile" type="file" accept="image/*" />
        {props.featuredImageUrl && (
          <p className="text-xs text-muted-foreground break-all">Current: {props.featuredImageUrl}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm">Alt text</label>
        <input
          name="featuredImageAlt"
          defaultValue={props.featuredImageAlt ?? ''}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-primary">{state.success}</p>}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}
