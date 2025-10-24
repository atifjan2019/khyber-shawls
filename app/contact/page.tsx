'use client'

import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    }

    setIsSubmitting(true)
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to submit")
        setSubmitted(true)
        event.currentTarget.reset()
      })
      .catch(() => {
        alert("We could not send your message. Please try again shortly.")
      })
      .finally(() => setIsSubmitting(false))
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
          <p className="mt-3 text-sm text-muted-foreground">
            Khyber Shawls Studio
            <br />
            University Town, Peshawar, Khyber Pakhtunkhwa
            <br />
            Pakistan
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Phone: <a href="tel:+92913245678" className="font-medium text-primary">+92 91 324 5678</a>
            <br />
            Email:{" "}
            <a href="mailto:hello@khybershawls.com" className="font-medium text-primary">
              hello@khybershawls.com
            </a>
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border bg-card p-8 shadow-sm"
      >
        <div>
          <h2 className="text-xl font-semibold">Send a message</h2>
          <p className="text-sm text-muted-foreground">
            All fields are required so we can tailor a response for you.
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Your name
          <input
            type="text"
            name="name"
            required
            placeholder="Amina Khan"
            className="rounded-md border bg-background px-3 py-2 text-base outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Email address
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="rounded-md border bg-background px-3 py-2 text-base outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          How can we help?
          <textarea
            name="message"
            rows={4}
            required
            placeholder="Share styling needs, delivery timelines, or custom requests."
            className="rounded-md border bg-background px-3 py-2 text-base outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>

        {submitted && (
          <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            Thank you! We received your message and will respond soon.
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
      </form>
    </div>
  )
}
