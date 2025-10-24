import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

const heroHighlights = [
  "Free worldwide shipping on orders over $250",
  "Hand-embroidered artisan designs sourced ethically",
  "Ships in 24 hours from our Khyber atelier",
]

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-background via-background to-secondary/10">
      <header className="sticky top-0 z-10 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Khyber Shawls
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/collections/new-arrivals">New Arrivals</Link>
            <Link href="/collections/pashmina">Pashmina</Link>
            <Link href="/about">Our Story</Link>
            <Link href="/journal">Journal</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/account">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/cart">View Cart</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-6 pb-24 pt-16">
        <section className="grid items-center gap-16 md:grid-cols-[1.2fr,1fr]">
          <div className="space-y-8">
            <p className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Winter 2025 collection
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Heirloom Kashmiri shawls crafted to stand the test of time.
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Experience the warmth and elegance of authentic Pashmina sourced
              directly from master artisans in the valleys of Khyber. Each
              weave tells a story of tradition, patience, and artistry.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" asChild>
                <Link href="/collections/signature">Shop signature shawls</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/appointments">Book a styling consultation</Link>
              </Button>
            </div>
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {heroHighlights.map((highlight) => (
                <li key={highlight} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-primary/40 blur-3xl" />
            <Image
              src="/hero-shawl.svg"
              alt="Model wearing a handcrafted Khyber shawl"
              width={1200}
              height={630}
              priority
              className="relative z-10 w-full rounded-3xl object-cover shadow-2xl"
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Threads dyed with natural pigments by artisans in the Khyber
              region.
            </p>
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-3">
          {[
            {
              title: "Sustainable sourcing",
              description:
                "We collaborate with co-ops that ensure fair pay and safe working conditions for every artisan involved.",
            },
            {
              title: "Lifetime care",
              description:
                "Complimentary care plan with every purchase, including seasonal cleaning and repairs handled by experts.",
            },
            {
              title: "Express delivery",
              description:
                "Global express shipping with carbon offsets and custom packaging designed to protect delicate fibers.",
            },
          ].map((feature) => (
            <article
              key={feature.title}
              className="space-y-3 rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
