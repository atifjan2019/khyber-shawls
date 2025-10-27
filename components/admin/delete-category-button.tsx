'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { deleteCategoryAction } from '@/app/admin/categories/actions'

export function DeleteCategoryButton({ id }: { id: string }) {
  const [pending, start] = useTransition()

  return (
    <form
      action={(fd) => start(() => deleteCategoryAction(fd))}
      className="contents"
    >
      <input type="hidden" name="id" value={id} />
      <Button variant="destructive" size="sm" disabled={pending}>
        {pending ? 'Deleting…' : 'Delete'}
      </Button>
    </form>
  )
}
