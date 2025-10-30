'use client'

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/providers/cart-provider"
import type { AuthUser } from "@/lib/auth"
import { AdminDropdown } from "@/components/admin/admin-dropdown"

// 👇 import your server action
import { logout } from "@/app/(auth)/actions"

const primaryNav = [
  { href: "/category/men-shawls", label: "Men Shawls" },
  { href: "/category/women-shawls", label: "Women Shawls" },
  { href: "/category/kids-shawls", label: "Kids Shawls" },
]

type SiteHeaderProps = {
  user: AuthUser | null
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const pathname = usePathname()
  const { itemCount, isHydrated } = useCart()

  const accountHref =
    user ? (user.role === "ADMIN" ? "/admin/products" : "/dashboard") : "/login"

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-6 py-4">

        {/* Left: primary nav */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            {primaryNav.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === link.href
                  : pathname?.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Center: logo */}
        <Link href="/" className="flex items-center justify-center justify-self-center">
          <Image
            src="/logo.png"
            alt="Khyber Shawls logo"
            width={180}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </Link>

        {/* Right: cart + account + logout */}
        <div className="flex items-center justify-end gap-3">
          {/* Cart */}
          <Button size="sm" variant="outline" asChild>
            <Link href="/cart" className="inline-flex items-center gap-2">
              <ShoppingBag className="size-4" aria-hidden="true" />
              <span>Cart</span>
              {isHydrated && itemCount > 0 && (
                <span
                  aria-label={`${itemCount} items in cart`}
                  className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground"
                >
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Account + Logout */}
          <div className="flex items-center gap-2">
            {user?.role === "ADMIN" ? (
              <AdminDropdown />
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href={accountHref}>
                  {user ? "Account" : "Login"}
                </Link>
              </Button>
            )}

            {!user ? (
              <Button size="sm" asChild>
                <Link href="/signup">Create account</Link>
              </Button>
            ) : (
              // ✅ Proper server-action logout (works for USER and ADMIN)
              <form action={logout}>
                <Button size="sm" type="submit" variant="destructive" className="inline-flex items-center gap-1.5">
                  <LogOut className="size-4" aria-hidden="true" />
                  <span>Logout</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
