"use client"

import { useTransition, useState } from "react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/providers/cart-provider"

type Props = {
  productId: string
}

export function AddToCartButton({ productId }: Props) {
  const { addItem } = useCart()
  const [isPending, startTransition] = useTransition()
  const [showAdded, setShowAdded] = useState(false)

  const handleClick = () => {
    startTransition(() => {
      addItem(productId, 1)
      setShowAdded(true)
      setTimeout(() => setShowAdded(false), 1500)
    })
  }

  return (
    <Button
      size="lg"
      className="px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl bg-amber-700 hover:bg-amber-800 text-white"
      disabled={isPending}
      onClick={handleClick}
    >
      {showAdded ? "✓ Added!" : isPending ? "Adding…" : "Add to Cart"}
    </Button>
  )
}
