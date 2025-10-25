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
  LogOut,
} from "lucide-react"

import { requireUser } from "@/lib/auth"
import { LogoutButton } from "@/components/logout-button"

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
    <div className="relative mx-auto w-full max-w-6xl space-y-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-20 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-24 top-24 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-background/85 via-background to-background/90 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Control Centre</p>
            <p className="text-lg font-semibold text-foreground">{user.name ?? user.email}</p>
            <p className="text-xs text-muted-foreground">Signed in as {user.role}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
              Drafts auto-save • Publish when ready
            </div>
            <LogoutButton>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary hover:text-primary-foreground">
                <LogOut className="size-3" /> Sign out
              </span>
            </LogoutButton>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/80 px-4 py-2 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      <main className="space-y-12">{children}</main>
    </div>
  )
}
