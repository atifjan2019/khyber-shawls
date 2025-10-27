'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Toast } from "@/components/ui/toast"

const CartContext = createContext<CartContextValue | undefined>(undefined)

const STORAGE_KEY = "khyber-shawls-cart"

export type CartItem = {
  id: string
  quantity: number
}

export type CartContextValue = {
  items: CartItem[]
  addItem: (id: string, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  isHydrated: boolean
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to parse cart from storage", error)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, isHydrated])

  const showToastWithMessage = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }, [])

  const addItem = useCallback((id: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === id)
      if (existing) {
        return prev.map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { id, quantity }]
    })
    showToastWithMessage("Item added to cart")
  }, [showToastWithMessage])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      isHydrated,
    }),
    [addItem, clearCart, isHydrated, items, removeItem, updateQuantity]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}