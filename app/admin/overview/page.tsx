// app/admin/overview/page.tsx
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Tags,
  Images,
  Home,
  FileText,
  ShoppingCart,
  MessageSquare,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type StatCardProps = {
  title: string;
  count: number | string;
  description?: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  cta?: string;
};

function StatCard({ title, count, description, href, Icon, cta = 'Manage' }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md border bg-gray-50 p-2">
            <Icon className="h-5 w-5 text-gray-700" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-2xl font-bold tabular-nums text-gray-900">{count}</div>
      </div>
      {description ? (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      ) : null}
      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          {cta} <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

export default async function AdminOverviewPage() {
  // Fetch counts (fail-soft if some tables don't exist)
  const safeCount = async (fn: () => Promise<number>) => {
    try {
      return await fn();
    } catch {
      return 0;
    }
  };

  const [
    productCount,
    categoryCount,
    mediaCount,
    homeMediaCount,
    blogCount,
    orderCount,
    messageCount,
  ] = await Promise.all([
    safeCount(() => prisma.product.count()),
    safeCount(() => prisma.category.count()),
    safeCount(() => prisma.media.count()),
    safeCount(() => prisma.heroMedia.count()),
    safeCount(() => prisma.post.count()), // if your blog model is named differently, change this
    safeCount(() => prisma.order.count()),
    safeCount(() => prisma.contactEntry.count()), // change if your messages model differs
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your content across all sections.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Overview"
          count="-"
          description="Summary of your content"
          href="/admin/overview"
          Icon={LayoutDashboard}
          cta="Open Overview"
        />
        <StatCard
          title="Products"
          count={productCount}
          description="Manage product catalog"
          href="/admin/products"
          Icon={Package}
          cta="Manage Products"
        />
        <StatCard
          title="Categories"
          count={categoryCount}
          description="Organize your catalog"
          href="/admin/categories"
          Icon={Tags}
          cta="Manage Categories"
        />
        <StatCard
          title="Media"
          count={mediaCount}
          description="Library of uploaded images"
          href="/admin/media"
          Icon={Images}
          cta="Manage Media"
        />
        <StatCard
          title="Home Page Media"
          count={homeMediaCount}
          description="Hero slides & home visuals"
          href="/admin/home-media"
          Icon={Home}
          cta="Manage Home Media"
        />
        <StatCard
          title="Blogs"
          count={blogCount}
          description="Journal & articles"
          href="/admin/journal"
          Icon={FileText}
          cta="Manage Blogs"
        />
        <StatCard
          title="Orders"
          count={orderCount}
          description="Sales & fulfillment"
          href="/admin/orders"
          Icon={ShoppingCart}
          cta="View Orders"
        />
        <StatCard
          title="Messages"
          count={messageCount}
          description="Contact & enquiries"
          href="/admin/messages"
          Icon={MessageSquare}
          cta="View Messages"
        />
      </div>
    </div>
  );
}
