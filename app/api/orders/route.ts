import { NextResponse } from "next/server"
import { z } from "zod"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const orderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().min(1),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
})

export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database is not configured. Set DATABASE_URL to enable orders." },
      { status: 500 }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = orderSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order payload" },
      { status: 400 }
    )
  }

  const { customerName, customerEmail, customerPhone, shippingAddress, notes, items } =
    parsed.data

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.id) } },
  })

  if (products.length === 0) {
    return NextResponse.json(
      { error: "No valid products found for this order." },
      { status: 400 }
    )
  }

  const productMap = new Map(products.map((product) => [product.id, product]))

  const orderItems = items
    .map((item) => {
      const product = productMap.get(item.id)
      if (!product) return null
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      }
    })
    .filter(Boolean)

  if (orderItems.length === 0) {
    return NextResponse.json(
      { error: "Products were removed from the catalogue." },
      { status: 400 }
    )
  }

  const totalValue = orderItems.reduce((sum, item) => {
    const price = Number(item!.price)
    return sum + price * item!.quantity
  }, 0)

  const user = await getCurrentUser()

  const order = await prisma.order.create({
    data: {
      customerId: user?.id,
      customerName,
      customerEmail,
      customerPhone: customerPhone ?? null,
      shippingAddress,
      notes: notes ?? null,
      status: "PENDING",
      total: totalValue.toFixed(2),
      items: {
        create: orderItems.map((item) => ({
          productId: item!.productId,
          quantity: item!.quantity,
          price: item!.price,
        })),
      },
    },
  })

  return NextResponse.json({ orderId: order.id })
}
