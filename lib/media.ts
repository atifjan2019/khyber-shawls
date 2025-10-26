// /lib/media.ts
import prisma from "@/lib/prisma"

// Keep this in sync with your DB columns
export type MediaItem = {
  id: string
  url: string
  alt: string | null
  createdAt: Date
}

/**
 * Fetch recent media from the database.
 * Sorted newest-first and limited by `limit`.
 */
export async function fetchMediaLibrary(limit = 24): Promise<MediaItem[]> {
  try {
    const rows = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.max(1, Math.min(limit, 200)), // safety bounds
    })

    // Normalize to the shape AdminMediaPage expects
    return rows.map((m: { id: any; url: any; alt: any; createdAt: any }) => ({
      id: m.id,
      url: m.url,
      alt: m.alt ?? null,
      createdAt: m.createdAt,
    }))
  } catch (err) {
    console.error("[media] fetchMediaLibrary failed:", err)
    return []
  }
}
