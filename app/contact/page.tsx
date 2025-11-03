import { FormEvent } from "react"
import prisma from "@/lib/prisma"
import { ContactForm } from "./contact-form"

export const runtime = "nodejs"

export default async function ContactPage() {
  // Fetch settings from database
  const settings = await prisma.settings.findFirst()

  const contactInfo = {
    phone: settings?.contactPhone || "+92 91 324 5678",
    email: settings?.contactEmail || "hello@khybershawls.com",
    address: settings?.contactAddress || "Khyber Shawls Studio\nUniversity Town, Peshawar, Khyber Pakhtunkhwa\nPakistan"
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr,1fr]">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Contact the atelier</h1>
        <p className="text-muted-foreground">
          Share your queries, bespoke requests, or wholesale interests. We respond within one business day.
        </p>
        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <h2 className="text-lg font-semibold">Visit us</h2>
          <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">
            {contactInfo.address}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Phone: <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="font-medium text-primary">{contactInfo.phone}</a>
            <br />
            Email:{" "}
            <a href={`mailto:${contactInfo.email}`} className="font-medium text-primary">
              {contactInfo.email}
            </a>
          </p>
        </div>
      </div>

      <ContactForm />
    </div>
  )
}
