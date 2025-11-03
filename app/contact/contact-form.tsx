'use client'

import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"

export function ContactForm() {
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
  )
}
