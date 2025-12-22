'use client'

import { useActionState } from "react"

import { updateOrderStatusAction } from "@/app/admin/actions"

const initialState = { error: undefined as string | undefined, success: undefined as string | undefined }

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const [state, formAction, isPending] = useActionState(updateOrderStatusAction, initialState)

  if (typeof window !== "undefined" && state.success) {
    // refresh to show the latest status after a successful update
    window.location.reload()
  }

  return (
    <form action={formAction} className="flex items-center gap-2 text-sm">
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="status"
        defaultValue={currentStatus}
        disabled={isPending}
        className="rounded-md border bg-background px-2 py-1 text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <option value="PENDING">Pending</option>
        <option value="PROCESSING">Processing</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-primary/40 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/10"
      >
        {isPending ? "Saving" : "Update"}
      </button>
      {state.error && <span className="text-xs text-destructive">{state.error}</span>}
      {state.success && <span className="text-xs text-primary">Saved</span>}
    </form>
  )
}
