import { HeroMediaForm } from "@/components/admin/hero-media-form"
import { HERO_CONFIGS, fetchAllHeroContent } from "@/lib/hero"

export default async function AdminMediaPage() {
  const heroes = await fetchAllHeroContent()
  const heroMap = new Map(heroes.map((hero) => [hero.key, hero]))

  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-4xl border border-white/10 bg-background/90 p-8 shadow-lg backdrop-blur">
        <h1 className="text-3xl font-semibold text-foreground">Media Library</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update hero banners and supporting copy. All changes publish instantly—no backup approvals required.
        </p>
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
              backgroundImageId: heroMap.get(config.key)?.backgroundImageId ?? null,
            }}
          />
        ))}
      </div>
    </div>
  )
}
