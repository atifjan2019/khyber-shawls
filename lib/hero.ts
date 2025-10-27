// /lib/hero.ts
import prisma from "@/lib/prisma"

export const HERO_CONFIGS = [
  { key: "home",      label: "Hero 1" },
  { key: "editorial", label: "Hero 2" },
  { key: "seasonal",  label: "Hero 3" },
] as const

export type HeroKey = (typeof HERO_CONFIGS)[number]["key"]

export type HeroRecord = {
  key: HeroKey
  title: string | null
  subtitle: string | null
  description: string | null
  ctaLabel: string | null
  ctaHref: string | null
  backgroundImageUrl: string | null
  backgroundImageAlt: string | null
}

export async function fetchAllHeroContent(): Promise<HeroRecord[]> {
  const rows = await prisma.heroMedia.findMany({
    include: { backgroundImage: true },
  })

  const map = new Map<string, HeroRecord>()
  for (const r of rows) {
    map.set(r.key, {
      key: r.key as HeroKey,
      title: r.title ?? null,
      subtitle: r.subtitle ?? null,
      // not in schema yet → null
      description: (r as any).description ?? null,
      ctaLabel: (r as any).ctaLabel ?? null,
      ctaHref: (r as any).ctaHref ?? null,
      backgroundImageUrl: r.backgroundImage?.url ?? null,
      backgroundImageAlt: r.backgroundImage?.alt ?? null,
    })
  }

  return HERO_CONFIGS.map((c) =>
    map.get(c.key) ?? {
      key: c.key,
      title: null,
      subtitle: null,
      description: null,
      ctaLabel: null,
      ctaHref: null,
      backgroundImageUrl: null,
      backgroundImageAlt: null,
    }
  )
}
