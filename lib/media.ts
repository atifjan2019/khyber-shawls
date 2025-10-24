import { prisma } from "@/lib/prisma"

export type MediaItem = {
  id: string
  url: string
  alt: string | null
  createdAt: Date
}

export async function fetchMediaLibrary(limit = 50): Promise<MediaItem[]> {
  if (!prisma) {
    return []
  }

  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return media
}
