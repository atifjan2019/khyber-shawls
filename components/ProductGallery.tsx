"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

export type GalleryItem = {
  id: string;
  media: { url: string; alt: string | null };
};

type Props = {
  main: { url: string; alt: string };
  items: GalleryItem[];
  title: string;
};

export default function ProductGallery({ main, items, title }: Props) {
  const images = useMemo(() => {
    const list =
      items?.map((g) => ({
        id: g.id,
        url: g.media.url,
        alt: g.media.alt ?? title,
      })) ?? [];

    const hasMain = list.some((i) => i.url === main.url);
    return hasMain ? list : [{ id: "featured", url: main.url, alt: main.alt }, ...list];
  }, [items, main.url, main.alt, title]);

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const active = images[activeIdx] ?? { url: main.url, alt: main.alt };

  return (
    // Always two columns: [vertical thumb rail | main image]
    <div className="grid grid-cols-[84px,1fr] gap-4">
      {/* Vertical thumbnails (left) */}
      <div className="h-[520px] overflow-y-auto pr-1 md:h-[620px] md:sticky md:top-24">
        <div className="grid gap-2">
          {images.map((img, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={`${img.id}-${i}`}
                onClick={() => setActiveIdx(i)}
                type="button"
                aria-label={`View image ${i + 1}`}
                className={
                  "relative aspect-square overflow-hidden rounded-xl border transition " +
                  (isActive
                    ? "border-amber-700 ring-2 ring-amber-700/40"
                    : "border-white/10 hover:border-amber-700/40")
                }
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="84px"
                  className="object-cover"
                  priority={i === 0}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main image (right) */}
      <div>
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/10 bg-background">
          <Image
            key={active.url}
            src={active.url}
            alt={active.alt}
            fill
            sizes="(min-width:1280px) 48vw, (min-width:768px) 55vw, 80vw"
            className="object-cover"
            priority
          />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-black/5" />
        </div>
      </div>
    </div>
  );
}
