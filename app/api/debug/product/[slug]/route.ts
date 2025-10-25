// app/api/debug/product/[slug]/route.ts
import { NextResponse, NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  context: { params?: { slug?: string } }
) {
  let slug = context.params?.slug

  if (!slug) {
    const segments = request.nextUrl.pathname.split("/").filter(Boolean)
    slug = segments.at(-1)
  }

  if (!slug) {
    return NextResponse.json({
      ok: false,
      path: request.nextUrl.pathname,
      error: "Missing slug parameter.",
    })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        published: true,
        categoryId: true,
      },
    })

    return NextResponse.json({
      ok: Boolean(product),
      slug,
      product,
    })
  } catch (error) {
    console.error("/api/debug/product error", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
