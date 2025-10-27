// lib/journal.ts
import { prisma } from "@/lib/prisma";

export type SerializedPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  publishedAt: string;
};

function serializePost(post: any): SerializedPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    imageUrl: post.image,
    publishedAt: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(post.createdAt),
  };
}

export async function fetchLatestPosts(limit: number = 3): Promise<SerializedPost[]> {
  if (!prisma) {
    console.warn("[database] DATABASE_URL is not configured. Returning empty post list.");
    return [];
  }

  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return posts.map(serializePost);
}
