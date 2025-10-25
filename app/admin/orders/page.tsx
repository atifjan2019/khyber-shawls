import { OrderStatusForm } from "@/components/admin/order-status-form"
import { formatCurrency } from "@/lib/currency"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export default async function AdminOrdersPage() {
  if (!prisma) {
    return (
      <div className="overflow-hidden rounded-4xl border border-primary/20 bg-gradient-to-br from-background via-background/90 to-primary/10 p-12 shadow-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Database not configured
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Add a valid <code>DATABASE_URL</code> to <code>.env.local</code> and restart the
          server to manage orders.
        </p>
      </div>
    )
  }

  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-4xl border border-white/10 bg-background/90 p-8 shadow-lg backdrop-blur">
        <h1 className="text-3xl font-semibold text-foreground">Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track fulfilment, adjust statuses, and give clients immediate updates.
        </p>
      </section>

      <section className="rounded-4xl border border-white/10 bg-background/90 p-8 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Latest bespoke orders</h2>
          <span className="text-xs text-muted-foreground">Newest first</span>
        </div>
        <div className="mt-6 space-y-4">
          {orders.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground">
              No orders yet. Once clients begin checking out, updates will appear here in real time—no approvals required.
            </p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-white/10 bg-background/70 p-5 shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      #{order.id.slice(0, 8)} · {order.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{formatCurrency(order.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {dateFormatter.format(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                  {order.items.map((item) => (
                    <p key={item.id}>
                      {item.quantity} × {item.product?.title ?? "Removed product"}
                    </p>
                  ))}
                </div>
                <div className="mt-5">
                  <OrderStatusForm orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
