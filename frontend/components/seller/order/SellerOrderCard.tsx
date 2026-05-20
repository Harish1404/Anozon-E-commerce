"use client"

import Link from "next/link"
import { SellerOrder, OrderStatus } from "@/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ShoppingBag } from "lucide-react"

interface SellerOrderCardProps {
  order: SellerOrder
}

const statusStyles: Record<string, string> = {
  confirmed:           "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  shipped:             "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
  delivered:           "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  cancelled:           "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
  pending:             "bg-muted text-muted-foreground dark:bg-slate-500/20 dark:text-slate-400",
  partially_shipped:   "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  partially_delivered: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400",
}

export function SellerOrderCard({ order }: SellerOrderCardProps) {
  const itemCount = order.items.length
  const sellerTotal = order.seller_total ?? order.items.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0
  )

  const dateStr = order.created_at.endsWith("Z") || order.created_at.includes("+")
    ? order.created_at
    : `${order.created_at}Z`
  const date = new Date(dateStr)

  return (
    <Link
      href={`/seller/orders/${order._id}`}
      className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* Icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <ShoppingBag className="size-5 text-primary" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            #{order._id.slice(-8).toUpperCase()}
          </p>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", statusStyles[order.order_status] ?? "bg-muted text-muted-foreground")}>
            {order.order_status.replace("_", " ")}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {itemCount} item{itemCount !== 1 ? "s" : ""} · {format(date, "d MMM yyyy, h:mm a")}
        </p>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p className="text-base font-bold text-foreground">₹{sellerTotal.toFixed(0)}</p>
        <p className="text-xs text-muted-foreground capitalize">pay method - {order.payment_method}</p>
      </div>
    </Link>
  )
}
