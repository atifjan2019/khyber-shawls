import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-center md:text-left">
          <p className="font-medium text-foreground">Khyber Shawls</p>
          <p className="max-w-xl text-balance">
            Each piece is handcrafted in small batches. We honor the artisans of the Khyber region through ethical sourcing and slow fashion.
          </p>
        </div>
        <nav className="flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/shop" className="transition hover:text-foreground">
            Shop
          </Link>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" aria-hidden />
          <Link href="/about" className="transition hover:text-foreground">
            About
          </Link>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" aria-hidden />
          <Link href="/contact" className="transition hover:text-foreground">
            Contact
          </Link>
        </nav>
        <p className="text-center md:text-right">&copy; {new Date().getFullYear()} Khyber Shawls. All rights reserved.</p>
      </div>
    </footer>
  )
}
