import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    const existingSubscriber = await prisma.newsletter.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingSubscriber) {
      if (existingSubscriber.unsubscribed) {
        // Resubscribe if previously unsubscribed
        await prisma.newsletter.update({
          where: { email: normalizedEmail },
          data: { 
            unsubscribed: false,
            updatedAt: new Date(),
          },
        })
        return NextResponse.json({ 
          message: "Welcome back! You've been resubscribed to our newsletter." 
        })
      }
      return NextResponse.json(
        { error: "This email is already subscribed" },
        { status: 400 }
      )
    }

    // Create new subscriber
    await prisma.newsletter.create({
      data: {
        email: normalizedEmail,
      },
    })

    return NextResponse.json({ 
      message: "Thank you for subscribing! Check your email for confirmation." 
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    )
  }
}
