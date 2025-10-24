import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  ScrollText,
  MessageCircle,
  Package,
  Image as ImageIcon,
} from "lucide-react"

import { requireUser } from "@/lib/auth"

const navItems = [
  { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/journal", label: "Journal", icon: ScrollText },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/messages", label: "Messages", icon: MessageCircle },
]

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await requireUser({ mustBeAdmin: true })

  if (!user) {
    redirect("/login?callbackUrl=/admin")
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-20 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-24 top-24 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
        <aside className="relative space-y-8 rounded-3xl border border-white/10 bg-gradient-to-b from-background/80 via-background to-background/90 p-8 shadow-xl backdrop-blur">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Control Centre</p>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {user.name ?? user.email}
              </p>
              <p className="text-xs text-muted-foreground">Signed in as {user.role}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage collections, journal stories, and bespoke orders from a single flow.
            </p>
          </div>
          <nav className="space-y-2 text-sm">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-2xl px-4 py-3 font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                >
                  <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-xs text-muted-foreground">
            <p className="font-medium text-primary">Quick tip</p>
            <p className="mt-2">
              Draft content saves automatically. Publish when you are ready—no extra approval flows.
            </p>
          </div>
        </aside>

        <main className="space-y-12">{children}</main>
      </div>
    </div>
  )
}
