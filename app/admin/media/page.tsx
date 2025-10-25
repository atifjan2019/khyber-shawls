import { HeroMediaForm } from "@/components/admin/hero-media-form"
import { MediaLibrary } from "@/components/admin/media-library"
import { MediaUploadForm } from "@/components/admin/media-upload-form"
import { HERO_CONFIGS, fetchAllHeroContent } from "@/lib/hero"
import { fetchMediaLibrary } from "@/lib/media"

function createMediaUrlKey(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) {
    return ""
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed)
      const normalizedPath = parsed.pathname.replace(/^\/+/g, "/") || "/"
      return normalizedPath.toLowerCase()
    } catch {
      return trimmed.toLowerCase()
    }
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  return withLeadingSlash.replace(/\/+/g, "/").toLowerCase()
}

const uploadedAtFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export default async function AdminMediaPage() {
  const [heroes, mediaLibrary] = await Promise.all([
    fetchAllHeroContent(),
    fetchMediaLibrary(24),
  ])
  const heroMap = new Map(heroes.map((hero) => [hero.key, hero]))
  const uniqueMedia = [] as typeof mediaLibrary
  const seenUrls = new Set<string>()
  for (const item of mediaLibrary) {
    const urlKey = createMediaUrlKey(item.url)
    if (seenUrls.has(urlKey)) {
      continue
    }
    seenUrls.add(urlKey)
    uniqueMedia.push(item)
  }

  const mediaLibraryItems = uniqueMedia.map((item) => ({
    id: item.id,
    url: item.url,
    alt: item.alt,
    uploadedAtLabel: uploadedAtFormatter.format(item.createdAt),
    createdAtISO: item.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-4xl border border-white/10 bg-background/90 p-8 shadow-lg backdrop-blur">
        <h1 className="text-3xl font-semibold text-foreground">Media Library</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update hero banners and supporting copy. Use the three panels below to prepare up to three homepage hero rotations. All changes publish instantly—no backup approvals required.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.5fr),minmax(0,1fr)]">
        <MediaUploadForm />
        <div className="space-y-4 rounded-3xl border border-white/10 bg-background/90 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Recent uploads</h3>
              <p className="text-xs text-muted-foreground">Newest files appear first.</p>
            </div>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              {mediaLibraryItems.length} assets
            </span>
          </div>

          <MediaLibrary items={mediaLibraryItems} />
        </div>
      </section>

      <div className="grid gap-8">
        {HERO_CONFIGS.map((config) => (
          <HeroMediaForm
            key={config.key}
            heading={config.label}
            heroKey={config.key}
            initial={{
              title: heroMap.get(config.key)?.title ?? "",
              subtitle: heroMap.get(config.key)?.subtitle ?? "",
              description: heroMap.get(config.key)?.description ?? "",
              ctaLabel: heroMap.get(config.key)?.ctaLabel ?? "",
              ctaHref: heroMap.get(config.key)?.ctaHref ?? "",
              backgroundImageUrl: heroMap.get(config.key)?.backgroundImageUrl ?? null,
              backgroundImageAlt: heroMap.get(config.key)?.backgroundImageAlt ?? null,
            }}
          />
        ))}
      </div>
    </div>
  )
}
