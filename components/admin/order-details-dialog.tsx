'use client'

import { Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type OrderDetailsDialogProps = {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shippingAddress: string
  notes: string | null
  createdAt: Date
}

export function OrderDetailsDialog({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  notes,
  createdAt,
}: OrderDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="inline-flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          <span>View Details</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Complete checkout information for order #{orderId.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Customer Information
            </h3>
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium break-all">{customerEmail}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{customerPhone || "Not provided"}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="text-muted-foreground">Order Date:</span>
                <span className="font-medium">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Shipping Address
            </h3>
            <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap">
              {shippingAddress}
            </div>
          </div>

          {/* Order Notes */}
          {notes && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                Order Notes
              </h3>
              <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap">
                {notes}
              </div>
            </div>
          )}

          {!notes && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                Order Notes
              </h3>
              <p className="text-sm text-muted-foreground italic">No notes provided</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
