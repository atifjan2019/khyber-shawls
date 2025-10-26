"use client"

import { useActionState } from "react"

import { upsertHeroMediaAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"

type CategoryActionState = { ok: boolean; message: string; issues?: string[] }
const initialState: CategoryActionState = { ok: false, message: "" }

export type HeroMediaFormProps = {
  heading: string
  heroKey: string
  initial: {
    title: string
    subtitle: string
    description: string
    ctaLabel: string
    ctaHref: string
    backgroundImageUrl: string | null
    backgroundImageAlt: string | null
    backgroundImageId?: string | null
  }
}

export function HeroMediaForm({ heading, heroKey, initial }: HeroMediaFormProps) {
  const [state, formAction, isPending] = useActionState(upsertHeroMediaAction, initialState)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-white/10 bg-background/90 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{heading}</h3>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Key: {heroKey}</p>
        </div>
        <input type="hidden" name="heroKey" value={heroKey} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-medium" htmlFor={`${heroKey}-title`}>
          Headline
          <input
            id={`${heroKey}-title`}
            name="title"
            defaultValue={initial.title}
            placeholder="Discover the art of Kashmiri craftsmanship"
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>
        <label className="text-sm font-medium" htmlFor={`${heroKey}-subtitle`}>
          Subtitle
          <input
            id={`${heroKey}-subtitle`}
            name="subtitle"
            defaultValue={initial.subtitle}
            placeholder="Each shawl tells a story"
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>
      </div>

      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor={`${heroKey}-description`}>
          Description
          <textarea
            id={`${heroKey}-description`}
            name="description"
            defaultValue={initial.description}
            rows={3}
            placeholder="Share the story or value proposition for this banner."
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-medium" htmlFor={`${heroKey}-cta-label`}>
          Call to action label
          <input
            id={`${heroKey}-cta-label`}
            name="ctaLabel"
            defaultValue={initial.ctaLabel}
            placeholder="Explore collections"
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>
        <label className="text-sm font-medium" htmlFor={`${heroKey}-cta-href`}>
          Call to action link
          <input
            id={`${heroKey}-cta-href`}
            name="ctaHref"
            defaultValue={initial.ctaHref}
            placeholder="/category/signature"
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-medium" htmlFor={`${heroKey}-background-url`}>
          Background image URL
          <input
            id={`${heroKey}-background-url`}
            name="backgroundImageUrl"
            defaultValue={initial.backgroundImageUrl ?? ""}
            placeholder="https://res.cloudinary.com/..."
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>
        <label className="text-sm font-medium" htmlFor={`${heroKey}-background-alt`}>
          Background image alt text
          <input
            id={`${heroKey}-background-alt`}
            name="backgroundImageAlt"
            defaultValue={initial.backgroundImageAlt ?? ""}
            placeholder="Hero imagery description"
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>
      </div>

      {!state.ok && state.message && <p className="text-sm text-destructive">{state.message}</p>}
      {state.ok && state.message && <p className="text-sm text-primary">{state.message}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save hero banner"}
      </Button>

    </form>
  )
}
