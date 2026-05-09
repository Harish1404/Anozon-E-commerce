"use client"

import { useEffect, useState } from "react"
import { useSellerOrders } from "@/hooks/useSellerOrders"
import { useSellerDashboard } from "@/hooks/useSeller"
import { SellerOrderCard } from "@/components/seller/order/SellerOrderCard"
import { ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { label: "All",       key: "all" },
  { label: "Confirmed", key: "confirmed" },
  { label: "Shipped",   key: "shipped" },
  { label: "Delivered", key: "delivered" },
]

const EMPTY_MESSAGES: Record<string, string> = {
  confirmed: "No orders waiting to be shipped",
  shipped:   "No orders currently in transit",
  delivered: "No delivered orders yet",
  all:       "No orders received yet",
}

export default function SellerOrdersPage() {
  const [tab, setTab] = useState("all")
  const [page, setPage] = useState(1)
  const LIMIT = 15

  useEffect(() => {
    document.title = "Orders — Anozon Seller"
  }, [])

  const { data, isLoading } = useSellerOrders({ page, limit: LIMIT })
  const { data: dashboard } = useSellerDashboard()

  const allOrders = data?.items ?? []

  // Client-side filter by item_status
  const filtered = allOrders.filter((order) => {
    if (tab === "all") return true
    return order.items.some((item) => item.item_status === tab)
  })

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  const counts = {
    confirmed: dashboard?.orders.confirmed ?? 0,
    shipped:   dashboard?.orders.shipped ?? 0,
    delivered: dashboard?.orders.delivered ?? 0,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your incoming orders</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {TABS.map((t) => {
            const count = counts[t.key as keyof typeof counts]
            return (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setPage(1) }}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors",
                  tab === t.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {t.label}
                {t.key !== "all" && count > 0 && (
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    tab === t.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Order list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16">
            <ShoppingBag className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{EMPTY_MESSAGES[tab] ?? "No orders"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <SellerOrderCard key={order._id} order={order} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
