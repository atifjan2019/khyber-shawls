import { NextResponse } from "next/server"
import { z } from "zod"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type ProductItem = {
  id: string;
  price: number | string | bigint;
  inventory: number;
};

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

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order payload", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    notes,
    items,
  } = parsed.data;

  if (!prisma) {
    return NextResponse.json(
      { error: "Database is not configured. Set DATABASE_URL to enable orders." },
      { status: 500 }
    );
  }

  try {
    const order = await prisma.$transaction(async (tx: any) => {
      // Get products and check inventory
      const products = await tx.product.findMany({
        where: { 
          id: { in: items.map((item: any) => item.id) },
          inventory: { gt: 0 }
        },
        select: {
          id: true,
          price: true,
          inventory: true,
        },
      });

      if (products.length === 0) {
        throw new Error("No products in stock for this order.");
      }

      // Create a map for quick product lookup
      const productMap = new Map(
        products.map((p: ProductItem) => [p.id, p])
      );

      // Validate inventory and create order items
      const orderItems = items
        .map((item: any) => {
          const product = productMap.get(item.id) as ProductItem | undefined;
          if (!product || product.inventory < item.quantity) {
            return null;
          }
          return {
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
          };
        })
        .filter((item: any): item is { productId: string; quantity: number; price: number | string | bigint } => item !== null);

      if (orderItems.length === 0) {
        throw new Error("Products are out of stock or were removed from the catalogue.");
      }

      // Calculate total
      const totalValue = orderItems.reduce((sum: number, item: any) => {
        return sum + Number(item.price) * item.quantity;
      }, 0);

      const user = await getCurrentUser();

      // Create order
      const order = await tx.order.create({
        data: {
          userId: user?.id,
          customerName,
          customerEmail,
          customerPhone: customerPhone ?? null,
          shippingAddress,
          notes: notes ?? null,
          status: "PENDING",
          total: totalValue,
          items: {
            create: orderItems,
          },
        },
      });

      // Update inventory
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity
            }
          }
        });
      }

      return order;
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("[orders]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    );
  }
}