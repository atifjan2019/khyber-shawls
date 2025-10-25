"use client"

import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/providers/cart-provider"

type Props = {
  productId: string
}

export function AddToCartButton({ productId }: Props) {
  const { addItem } = useCart()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      size="lg"
      className="w-full sm:w-auto"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          addItem(productId, 1)
        })
      }}
    >
      {isPending ? "Adding…" : "Add to cart"}
    </Button>
  )
}
