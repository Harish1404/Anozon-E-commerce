"use client"

import { useEffect, useState } from "react"
import { useSellerOrders } from "@/hooks/useSellerOrders"
import { useSellerDashboard } from "@/hooks/useSeller"
import { SellerOrderCard } from "@/components/seller/order/SellerOrderCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { label: "All",       key: "all" },
  { label: "Pending",   key: "pending" },
  { label: "Confirmed", key: "confirmed" },
  { label: "Shipped",   key: "shipped" },
  { label: "Delivered",  key: "delivered" },
  { label: "Cancelled", key: "cancelled" },
]

const DATE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "current_month", label: "This Month" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
]

const EMPTY_MESSAGES: Record<string, string> = {
  pending:   "No pending orders",
  confirmed: "No orders waiting to be shipped",
  shipped:   "No orders currently in transit",
  delivered: "No delivered orders yet",
  cancelled: "No cancelled orders",
  all:       "No orders received yet",
}

export default function SellerOrdersPage() {
  const [tab, setTab] = useState("pending")
  const [dateFilter, setDateFilter] = useState("current_month")
  const [page, setPage] = useState(1)
  const LIMIT = 15

  useEffect(() => {
    document.title = "Orders — Anozon Seller"
  }, [])

  // Build server-side filter params
  const getParams = () => {
    const now = new Date()
    const params: any = { page, limit: LIMIT }
    if (tab !== "all") params.status = tab

    if (dateFilter === "current_month" || dateFilter === "last_30_days") {
      params.year = now.getFullYear()
      params.month = now.getMonth() + 1
    } else if (dateFilter !== "all") {
      params.year = parseInt(dateFilter)
    }
    return params
  }

  const { data, isLoading } = useSellerOrders(getParams())
  const { data: dashboard } = useSellerDashboard()

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1
  const orders = data?.items ?? []

  const counts: Record<string, number> = {
    pending:   (dashboard?.orders as any)?.pending ?? 0,
    confirmed: dashboard?.orders.confirmed ?? 0,
    shipped:   dashboard?.orders.shipped ?? 0,
    delivered: dashboard?.orders.delivered ?? 0,
    cancelled: dashboard?.orders.cancelled ?? 0,
  }

  const handleTabChange = (key: string) => {
    setTab(key)
    setPage(1)
  }

  const handleDateChange = (val: string) => {
    setDateFilter(val)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your incoming orders</p>
        </div>

        {/* Tabs + Date filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {TABS.map((t) => {
              const count = counts[t.key as keyof typeof counts]
              return (
                <button
                  key={t.key}
                  onClick={() => handleTabChange(t.key)}
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

          <Select value={dateFilter} onValueChange={(val) => val && handleDateChange(val)}>
            <SelectTrigger className="h-9 w-40 text-sm shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Order list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16">
            <ShoppingBag className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{EMPTY_MESSAGES[tab] ?? "No orders"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <SellerOrderCard key={order._id} order={order} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="h-9 w-9 rounded-full"
            >
              <ChevronLeft className="size-4" />
            </Button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? "default" : "ghost"}
                size="sm"
                onClick={() => setPage(p)}
                className="h-9 w-9 rounded-full text-sm"
              >
                {p}
              </Button>
            ))}

            {totalPages > 7 && (
              <span className="text-xs text-muted-foreground px-1">…</span>
            )}

            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="h-9 w-9 rounded-full"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
