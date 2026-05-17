"use client"

import { useState, useEffect } from "react"
import { useOrders } from "@/hooks/useOrders"
import { OrderCard } from "@/components/orders/OrderCard"
import { OrderSkeleton } from "@/components/orders/OrderSkeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, PackageOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { value: "orders", label: "Orders" },
  { value: "buy_again", label: "Buy again" },
  { value: "cancelled", label: "Cancelled" },
]

const YEAR_OPTIONS = [
  { value: "current_month", label: "This month" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "all", label: "All time" },
]

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("orders")
  const [year, setYear] = useState("current_month")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const labels: Record<string, string> = {
      orders: "Orders",
      buy_again: "Order Again",
      cancelled: "Cancelled Orders"
    }
    document.title = `Anozon - ${labels[activeTab] || "Orders"}`
  }, [activeTab])

  const getFilterOptions = () => {
    const now = new Date()
    const options: any = { page, limit: 10 }

    if (activeTab === "buy_again") options.status = "delivered"
    else if (activeTab === "cancelled") options.status = "cancelled"

    if (year === "current_month" || year === "last_30_days") {
      options.year = now.getFullYear()
      options.month = now.getMonth() + 1
    } else if (year !== "all") {
      options.year = parseInt(year)
    }

    return options
  }

  const { data, isLoading, isError } = useOrders(getFilterOptions())

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setPage(1)
  }

  const handleYearChange = (value: string) => {
    setYear(value)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const emptyMessage =
    year === "current_month"
      ? "No orders placed this month."
      : year === "last_30_days"
      ? "No orders in the last 30 days."
      : year === "all"
      ? "You haven't placed any orders yet."
      : `No orders placed in ${year}.`

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Your orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track, manage, and reorder your purchases</p>
      </div>

      {/* Tabs + filter row */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Select value={year} onValueChange={(val) => val && handleYearChange(val)}>
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Body */}
      {isLoading ? (
        <OrderSkeleton />
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-8 text-center">
          <p className="text-sm font-medium text-destructive">Unable to load orders. Please try again later.</p>
        </div>
      ) : data?.items.length ? (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{data.total}</span> orders placed
          </p>

          <div className="space-y-3">
            {data.items.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="h-9 w-9 rounded-full"
              >
                <ChevronLeft className="size-4" />
              </Button>

              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(p)}
                  className="h-9 w-9 rounded-full text-sm"
                >
                  {p}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                disabled={page === data.pages}
                onClick={() => handlePageChange(page + 1)}
                className="h-9 w-9 rounded-full"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/40 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
            <PackageOpen className="size-7 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">No orders found</p>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground leading-relaxed">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}