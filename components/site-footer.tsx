export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Khyber Shawls. All rights reserved.</p>
        <p className="max-w-xl text-balance">
          Each piece is handcrafted in small batches. We honor the artisans of
          the Khyber region through ethical sourcing and slow fashion.
        </p>
      </div>
    </footer>
  )
}
