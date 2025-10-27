// components/from-the-journal.tsx
import Link from "next/link";
import Image from "next/image";
import type { SerializedPost } from "@/lib/journal";

type Props = {
  posts: SerializedPost[];
};

export function FromTheJournal({ posts }: Props) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-700">From the Journal</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900">Latest Stories</h2>
          </div>
          <Link href="/journal" className="text-sm font-medium text-amber-700 hover:text-amber-800">
            Read all →
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/journal/${post.slug}`}
              className="group block overflow-hidden rounded-3xl bg-white shadow-sm hover:shadow-lg transition"
            >
              <div className="relative h-56">
                <Image
                  src={post.imageUrl ?? "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-xs text-gray-500">{post.publishedAt}</p>
                <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-amber-700">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-gray-600">{post.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
