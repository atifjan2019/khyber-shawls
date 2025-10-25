'use client'

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/providers/cart-provider"
import type { AuthUser } from "@/lib/auth"

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

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 py-4">

        {/* Left side navigation */}
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

        {/* Centered logo */}
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

        {/* Right side navigation + buttons */}
        <div className="flex items-center justify-end gap-3">
          {/* Right side nav */}
          {/* Cart */}
          <Button size="sm" variant="outline" asChild>
            <Link href="/cart" className="inline-flex items-center gap-2">
              <ShoppingBag className="size-4" aria-hidden="true" />
              <span>Cart</span>
              {isHydrated && itemCount > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>

          {/* User buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={user ? (user.role === "ADMIN" ? "/admin" : "/dashboard") : "/login"}>
                Account
              </Link>
            </Button>
            {!user && (
              <Button size="sm" asChild>
                <Link href="/signup">Create account</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
