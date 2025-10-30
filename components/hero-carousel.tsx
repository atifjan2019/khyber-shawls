"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"

import type { HeroRecord } from "@/lib/hero"

const ROTATION_INTERVAL_MS = 8000

type HeroCarouselProps = {
  slides: HeroRecord[]
  fallbackImage?: string
}

export function HeroCarousel({ slides, fallbackImage = "/hero/khyber-hero.jpg" }: HeroCarouselProps) {
  const preparedSlides = useMemo(() => {
    if (slides.length === 0) {
      return [
        {
          key: "home" as const,
          title: "Welcome to Khyber Shawls",
          subtitle: "Each shawl tells a story",
          description:
            "Every thread is woven by master artisans in Khyber, preserving centuries-old traditions for the modern wardrobe.",
          ctaLabel: "Explore Collections",
          ctaHref: "/collections",
          backgroundImageUrl: fallbackImage,
          backgroundImageAlt: "Hero background",
        } satisfies HeroRecord,
      ]
    }

    const withImages = slides.filter((slide) => slide.backgroundImageUrl)
    if (withImages.length > 0) {
      return withImages
    }

    return [
      {
        ...slides[0],
        backgroundImageUrl: fallbackImage,
        backgroundImageAlt: slides[0].backgroundImageAlt ?? slides[0].title ?? "Hero background",
      },
    ]
  }, [slides, fallbackImage])

  const [activeIndex, setActiveIndex] = useState(0)
  const activeSlide = preparedSlides[activeIndex] ?? preparedSlides[0]

  useEffect(() => {
    if (preparedSlides.length <= 1) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => {
        const nextIndex = current + 1
        return nextIndex >= preparedSlides.length ? 0 : nextIndex
      })
    }, ROTATION_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [preparedSlides.length])

  return (
    <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 isolate overflow-hidden pt-0">
      <div className="absolute inset-0 -z-10">
        {preparedSlides.map((slide, index) => {
          const backgroundUrl = slide.backgroundImageUrl ?? fallbackImage
          const altText = slide.backgroundImageAlt ?? slide.title ?? "Hero background"
          const isExternal = /^https?:\/\//.test(backgroundUrl)

          return (
            <div
              key={slide.key ?? `hero-slide-${index}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
              aria-hidden={index !== activeIndex}
            >
              {isExternal ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={backgroundUrl} alt={altText} className="h-full w-full object-cover" />
              ) : (
                <Image
                  src={backgroundUrl}
                  alt={altText}
                  fill
                  priority={index === activeIndex}
                  sizes="100vw"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/55 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
            </div>
          )
        })}
      </div>

      <div className="w-full px-6 py-16 text-center text-white sm:py-24 lg:py-28">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          {activeSlide.title || "Welcome to Khyber Shawls"}
        </h1>
        {activeSlide.subtitle && (
          <p className="mt-3 text-lg text-white/80 sm:text-xl">{activeSlide.subtitle}</p>
        )}
        {activeSlide.description && (
          <p className="mt-6 mx-auto max-w-2xl text-sm text-white/70 sm:text-base">
            {activeSlide.description}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={activeSlide.ctaHref || "/collections"}
            className="rounded-full bg-amber-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-amber-800"
          >
            {activeSlide.ctaLabel || "Explore Collections"}
          </Link>
          <Link
            href="/#categories"
            className="rounded-full bg-white/80 px-6 py-3 text-sm font-medium text-gray-900 transition hover:bg-white"
          >
            Browse Categories
          </Link>
        </div>
      </div>

      <svg className="absolute bottom-[-1px] left-0 right-0 -z-10" viewBox="0 0 1440 90" preserveAspectRatio="none">
        <path d="M0,40 C300,110 1140,-20 1440,50 L1440,90 L0,90 Z" fill="#f4ede3" />
      </svg>
    </section>
  )
}
