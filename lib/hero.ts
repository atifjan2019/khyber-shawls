import { prisma } from "@/lib/prisma"

export type HeroContent = {
  key: string
  title: string
  subtitle: string
  description: string
  ctaLabel: string
  ctaHref: string
  backgroundImageUrl: string | null
  backgroundImageAlt: string | null
  backgroundImageId: string | null
}

export const HERO_CONFIGS: Array<{ key: string; label: string }> = [
  { key: "home-hero", label: "Home Page Hero" },
]

const HERO_DEFAULTS: Record<string, HeroContent> = {
  "home-hero": {
    key: "home-hero",
    title: "Discover the Art of Kashmiri Craftsmanship",
    subtitle: "Each shawl tells a story",
    description:
      "Every thread is woven by master artisans in Khyber, preserving centuries-old traditions for the modern wardrobe.",
    ctaLabel: "Explore Collections",
    ctaHref: "/category/signature",
    backgroundImageUrl: null,
    backgroundImageAlt: null,
    backgroundImageId: null,
  },
}

export async function fetchHeroContent(key: string): Promise<HeroContent> {
  if (!prisma) {
    return HERO_DEFAULTS[key] ?? {
      key,
      title: "",
      subtitle: "",
      description: "",
      ctaLabel: "",
      ctaHref: "",
      backgroundImageUrl: null,
      backgroundImageAlt: null,
      backgroundImageId: null,
    }
  }

  const hero = await prisma.heroMedia.findUnique({
    where: { key },
    include: { backgroundImage: true },
  })

  if (!hero) {
    return HERO_DEFAULTS[key] ?? {
      key,
      title: "",
      subtitle: "",
      description: "",
      ctaLabel: "",
      ctaHref: "",
      backgroundImageUrl: null,
      backgroundImageAlt: null,
    }
  }

  return {
    key: hero.key,
    title: hero.title ?? HERO_DEFAULTS[key]?.title ?? "",
    subtitle: hero.subtitle ?? HERO_DEFAULTS[key]?.subtitle ?? "",
    description: hero.description ?? HERO_DEFAULTS[key]?.description ?? "",
    ctaLabel: hero.ctaLabel ?? HERO_DEFAULTS[key]?.ctaLabel ?? "",
    ctaHref: hero.ctaHref ?? HERO_DEFAULTS[key]?.ctaHref ?? "",
    backgroundImageUrl: hero.backgroundImage?.url ?? HERO_DEFAULTS[key]?.backgroundImageUrl ?? null,
    backgroundImageAlt: hero.backgroundImage?.alt ?? HERO_DEFAULTS[key]?.backgroundImageAlt ?? null,
    backgroundImageId: hero.backgroundImageId ?? HERO_DEFAULTS[key]?.backgroundImageId ?? null,
  }
}

export async function fetchAllHeroContent() {
  if (!prisma) {
    return Object.values(HERO_DEFAULTS)
  }

  const heroes = await prisma.heroMedia.findMany({
    include: { backgroundImage: true },
    orderBy: { key: "asc" },
  })

  const defaults = Object.values(HERO_DEFAULTS)
  const mapped = heroes.map<HeroContent>((hero) => ({
    key: hero.key,
    title: hero.title ?? "",
    subtitle: hero.subtitle ?? "",
    description: hero.description ?? "",
    ctaLabel: hero.ctaLabel ?? "",
    ctaHref: hero.ctaHref ?? "",
    backgroundImageUrl: hero.backgroundImage?.url ?? null,
    backgroundImageAlt: hero.backgroundImage?.alt ?? null,
    backgroundImageId: hero.backgroundImageId ?? null,
  }))

  const keysInDb = new Set(heroes.map((hero) => hero.key))
  defaults.forEach((defaultHero) => {
    if (!keysInDb.has(defaultHero.key)) {
      mapped.push(defaultHero)
    }
  })

  return mapped
}
