import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { z } from "zod"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(5),
})

export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database is not configured. Set DATABASE_URL to enable contact form." },
      { status: 500 }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = contactSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const user = await getCurrentUser()

    await prisma.contact_entry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      userId: user?.id,
    },
  })

  revalidatePath("/admin/messages")

  return NextResponse.json({ ok: true })
}
