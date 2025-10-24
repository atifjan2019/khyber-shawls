import Link from "next/link"
import { redirect } from "next/navigation"
import { MessageCircle, Package2, Sparkles } from "lucide-react"

import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export default async function DashboardPage() {
  if (!prisma) {
    return (
      <div className="overflow-hidden rounded-4xl border border-primary/20 bg-gradient-to-br from-background via-background/90 to-primary/10 p-12 shadow-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Database not configured
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Add a valid <code>DATABASE_URL</code> in <code>.env.local</code> and restart the
          server to view your personal order history and conversations.
        </p>
      </div>
    )
  }

  const user = await requireUser()

  if (!user) {
    redirect("/login?callbackUrl=/dashboard")
  }

  if (user.role === "ADMIN") {
    redirect("/admin")
  }

  const [orders, contactEntries] = await Promise.all([
    prisma.order.findMany({
      where: { customerId: user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ])

  const fulfilledOrders = orders.filter((order) => order.status === "COMPLETED").length

  return (
    <div className="space-y-12 pb-16">
      <section className="overflow-hidden rounded-4xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/10 p-10 shadow-xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              <Sparkles className="size-3" /> Atelier client lounge
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
              Welcome back, {user.name ?? user.email}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Track the journey of your bespoke shawls, follow up on styling messages, and
              preview what’s shipping next—all without extra approvals.
            </p>
          </div>
          <div className="rounded-3xl border border-primary/20 bg-background/70 p-6 text-sm text-muted-foreground shadow-lg backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Snapshot
            </p>
            <div className="mt-4 grid gap-4 text-sm text-foreground sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-background/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Total orders
                </p>
                <p className="mt-3 text-2xl font-semibold text-primary">{orders.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-background/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Delivered treasures
                </p>
                <p className="mt-3 text-2xl font-semibold text-primary">
                  {fulfilledOrders}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)] xl:gap-12">
        <div className="rounded-4xl border border-white/10 bg-background/90 p-8 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <Package2 className="size-5 text-primary" /> Order history
              </h2>
              <p className="text-sm text-muted-foreground">
                Every order is approved automatically—no extra steps from you.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              Explore new arrivals
            </Link>
          </div>

          <div className="mt-8 space-y-4">
            {orders.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground">
                You haven’t placed an order yet. Discover handcrafted shawls in the shop—once
                you check out, your order timeline will appear here instantly.
              </p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl border border-white/10 bg-background/70 p-5 shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dateFormatter.format(order.createdAt)} · {order.status}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {currencyFormatter.format(Number(order.total))}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                    {order.items.map((item) => (
                      <p key={item.id}>
                        {item.quantity} × {item.product?.title ?? "Classic shawl"}
                      </p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-4xl border border-white/10 bg-background/90 p-8 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <MessageCircle className="size-5 text-primary" /> Atelier conversations
            </h2>
            <span className="text-xs text-muted-foreground">
              {contactEntries.length} latest messages
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {contactEntries.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground">
                Reach out through the contact form for styling guidance or bespoke requests—
                your messages will live here for easy follow-up.
              </p>
            ) : (
              contactEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-3xl border border-white/10 bg-background/70 p-5 shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">You wrote</p>
                      <p className="text-xs text-muted-foreground">
                        {dateFormatter.format(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line">
                    {entry.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
