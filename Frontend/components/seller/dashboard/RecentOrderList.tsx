"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { RecentOrderEntry, OrderStatus } from "@/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface RecentOrderListProps {
  orders: RecentOrderEntry[]
}

const statusStyles: Record<OrderStatus | string, string> = {
  confirmed:            "bg-blue-100 text-blue-700",
  shipped:              "bg-violet-100 text-violet-700",
  delivered:            "bg-emerald-100 text-emerald-700",
  cancelled:            "bg-rose-100 text-rose-700",
  pending:              "bg-slate-100 text-slate-600",
  partially_shipped:    "bg-amber-100 text-amber-700",
  partially_delivered:  "bg-teal-100 text-teal-700",
}

export function RecentOrderList({ orders }: RecentOrderListProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Your latest activity</p>
        </div>
        <Link href="/seller/orders" className="text-xs text-primary hover:underline font-medium">
          View all
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
          <ShoppingBag className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No orders received yet</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-2">
          {orders.map((order) => (
            <li key={order.order_id}>
              <Link
                href={`/seller/orders/${order.order_id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 hover:bg-muted transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    #{order.order_id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.buyer_first_name} · {order.item_count} item{order.item_count !== 1 ? "s" : ""}
                    {" · "}{format(new Date(order.created_at), "d MMM")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-semibold text-foreground">
                    ₹{order.seller_total.toFixed(0)}
                  </span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", statusStyles[order.order_status] ?? "bg-slate-100 text-slate-600")}>
                    {order.order_status}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
