"use client"

import { useOrders } from "@/hooks/useOrders"
import { Button } from "@/components/ui/button"

export default function OrdersPage() {
  const { data: orders, isLoading, isError } = useOrders()

  if (isLoading) {
    return <div className="min-h-screen p-8">Loading orders…</div>
  }

  if (isError) {
    return <div className="min-h-screen p-8">Unable to load orders.</div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Your orders</h1>
          <p className="mt-2 text-slate-600">Track and review the status of your recent purchases.</p>
        </div>

        {orders?.length ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Order #{order._id}</p>
                    <p className="text-sm text-slate-600">Status: {order.order_status}</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    ₹{order.summary.total.toFixed(2)}
                  </span>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm" disabled>
                    View details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">No orders yet</p>
            <p className="mt-2 text-slate-600">Your placed orders will appear here once you order from the shop.</p>
          </div>
        )}
      </div>
    </div>
  )
}
