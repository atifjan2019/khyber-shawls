import {
  ArrowUpRight,
  NotebookPen,
  Package2,
  ShoppingBag,
  Sparkles,
  Tag,
} from "lucide-react"

import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/currency"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export default async function AdminOverviewPage() {
  if (!prisma) {
    return (
      <div className="overflow-hidden rounded-4xl border border-primary/20 bg-gradient-to-br from-background via-background/90 to-primary/10 p-12 shadow-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Database not configured
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Add a valid <code>DATABASE_URL</code> to <code>.env.local</code> and restart the
          server to unlock the admin console.
        </p>
      </div>
    )
  }

  const [products, categories, blogPosts, pendingOrders, latestActivity] = await Promise.all([
    prisma.product.count({ where: { published: true } }),
    prisma.category.count(),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        customerName: true,
        createdAt: true,
        total: true,
        status: true,
      },
    }),
  ])

  const metrics = [
    {
      label: "Published styles",
      value: products,
      icon: ShoppingBag,
      accent: "from-emerald-500/20 to-emerald-500/0",
      helper: "Live on the storefront",
    },
    {
      label: "Product categories",
      value: categories,
      icon: Tag,
      accent: "from-sky-500/20 to-sky-500/0",
      helper: "Curated groupings",
    },
    {
      label: "Stories published",
      value: blogPosts,
      icon: NotebookPen,
      accent: "from-amber-400/25 to-amber-400/0",
      helper: "Journal entries live",
    },
    {
      label: "Orders awaiting dispatch",
      value: pendingOrders,
      icon: Package2,
      accent: "from-rose-500/20 to-rose-500/0",
      helper: "Pending fulfilment",
    },
  ]

  return (
    <div className="space-y-10 pb-16">
      <section className="overflow-hidden rounded-4xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/10 p-10 shadow-xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              <Sparkles className="size-3" /> Atelier console
            </span>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
              Craft the Khyber experience with confidence.
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Launch new shawls, share journal stories, and keep bespoke orders flowing—
              every action here mirrors on the storefront instantly.
            </p>
          </div>
          <div className="rounded-3xl border border-primary/20 bg-background/70 p-6 shadow-lg backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Quick actions
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ArrowUpRight className="size-4 text-primary" /> Add a new product in under two minutes.
              </li>
              <li className="flex items-center gap-2">
                <ArrowUpRight className="size-4 text-primary" /> Journal entries auto-save until you publish.
              </li>
              <li className="flex items-center gap-2">
                <ArrowUpRight className="size-4 text-primary" /> Order status changes notify clients immediately.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-background/80 p-6 shadow-md backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${metric.accent}`}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {metric.label}
                  </p>
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-6 text-3xl font-semibold text-foreground">{metric.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{metric.helper}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-4xl border border-white/10 bg-background/90 p-8 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Latest activity</h2>
          <span className="text-xs text-muted-foreground">Last 3 orders</span>
        </div>
        <div className="mt-6 space-y-4">
          {latestActivity.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground">
              Once clients place orders, a live timeline will appear here automatically—no approval steps needed.
            </p>
          ) : (
            latestActivity.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-white/10 bg-background/70 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      #{order.id.slice(0, 8)} · {order.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dateFormatter.format(order.createdAt)} · {order.status}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
