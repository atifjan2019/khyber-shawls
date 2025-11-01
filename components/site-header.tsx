'use client'

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, LogOut, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/providers/cart-provider"
import type { AuthUser } from "@/lib/auth"
import { AdminDropdown } from "@/components/admin/admin-dropdown"

// 👇 import your server action
import { logout } from "@/app/(auth)/actions"

const staticNav = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const secondaryNav = [
  { href: "/faq", label: "FAQ" },
  { href: "/policies/shipping", label: "Shipping" },
  { href: "/policies/returns", label: "Returns" },
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms", label: "Terms" },
]

type Category = {
  id: string
  name: string
  slug: string
}

type SiteHeaderProps = {
  user: AuthUser | null
  categories: Category[]
}

export function SiteHeader({ user, categories }: SiteHeaderProps) {
  const pathname = usePathname()
  const { itemCount, isHydrated } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const accountHref =
    user ? (user.role === "ADMIN" ? "/admin/products" : "/dashboard") : "/khyberopen"

  // Build dynamic navigation from categories
  const categoryNav = categories.map((cat) => ({
    href: `/category/${cat.slug}`,
    label: cat.name,
  }))

  // Combine category navigation with static navigation for mobile
  const primaryNav = [...categoryNav, ...staticNav]

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 py-3 sm:py-4">

        {/* Left: Mobile menu button + Desktop nav */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="size-5 sm:size-6" />
            ) : (
              <Menu className="size-5 sm:size-6" />
            )}
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {categoryNav.map((link) => {
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
            {staticNav.map((link) => {
              const isActive = pathname?.startsWith(link.href)
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
        <Link href="/" className="flex items-center justify-center justify-self-center" onClick={closeMobileMenu}>
          <Image
            src="/logo.png"
            alt="Khyber Shawls logo"
            width={180}
            height={60}
            className="h-10 sm:h-12 w-auto"
            priority
          />
        </Link>

        {/* Right: cart + account + logout */}
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {/* Cart */}
          <Button size="sm" variant="outline" asChild>
            <Link href="/cart" className="inline-flex items-center gap-2" onClick={closeMobileMenu}>
              <ShoppingBag className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cart</span>
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
          <div className="hidden md:flex items-center gap-2">
            {user?.role === "ADMIN" ? (
              <AdminDropdown />
            ) : null}

            {user ? (
              // ✅ Proper server-action logout (works for USER and ADMIN)
              <form action={logout}>
                <Button size="sm" type="submit" variant="destructive" className="inline-flex items-center gap-1.5">
                  <LogOut className="size-4" aria-hidden="true" />
                  <span>Logout</span>
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Drawer - Opens from RIGHT, covers 50% width, full height */}
      <div
        className={`fixed top-0 right-0 h-screen w-[50vw] bg-white z-[70] shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-amber-700">
            <span className="text-base sm:text-lg font-bold text-white">Menu</span>
            <button
              onClick={closeMobileMenu}
              className="p-2 hover:bg-amber-800 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="size-5 sm:size-6 text-white" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Primary Navigation */}
            <nav className="p-4 sm:p-6 space-y-1">
              <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Shop
              </p>
              {primaryNav.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === link.href
                    : pathname?.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`block px-4 py-3.5 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? "bg-amber-700 text-white"
                        : "text-gray-700 hover:bg-amber-50 active:bg-amber-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Secondary Navigation */}
            <nav className="px-4 sm:px-6 pb-6 space-y-1 border-t pt-4">
              <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Information
              </p>
              {secondaryNav.map((link) => {
                const isActive = pathname?.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-amber-100 text-amber-900"
                        : "text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* User Section */}
            {user && (
              <div className="px-4 sm:px-6 pb-6 border-t pt-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                  Account
                </p>
                <div className="space-y-2">
                  {user.role === "ADMIN" && (
                    <>
                      <Link
                        href="/admin"
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                      <Link
                        href="/admin/products"
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        Products
                      </Link>
                    </>
                  )}
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
