'use client'

import { Eye, Phone, Mail, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"

type OrderItem = {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string | null
    slug?: string
  } | null
}

type OrderDetailsDialogProps = {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shippingAddress: string
  notes: string | null
  createdAt: Date
  total: number
  items: OrderItem[]
}

const DELIVERY_FEE = 250

export function OrderDetailsDialog({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  notes,
  createdAt,
  total,
  items,
}: OrderDetailsDialogProps) {
  const subtotal = total - DELIVERY_FEE

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
                <a
                  href={`mailto:${customerEmail}`}
                  className="font-medium break-all text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Mail className="h-3 w-3 inline" />
                  {customerEmail}
                </a>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="text-muted-foreground">Phone:</span>
                {customerPhone ? (
                  <a
                    href={`tel:${customerPhone}`}
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3 inline" />
                    {customerPhone}
                  </a>
                ) : (
                  <span className="font-medium text-muted-foreground">Not provided</span>
                )}
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

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Order Items
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  {item.product?.image && (
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {item.product ? (
                      <Link
                        href={`/products/${item.product.slug || item.product.id}`}
                        className="font-medium text-sm hover:text-primary inline-flex items-center gap-1 group"
                        target="_blank"
                      >
                        {item.product.name}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ) : (
                      <span className="font-medium text-sm text-muted-foreground">
                        Removed product
                      </span>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatCurrency(item.quantity * item.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nationwide Delivery:</span>
                <span className="font-medium">{formatCurrency(DELIVERY_FEE)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t text-base font-semibold">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(total)}</span>
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
