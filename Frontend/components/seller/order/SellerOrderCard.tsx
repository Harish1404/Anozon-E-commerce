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
  confirmed:           "bg-blue-100 text-blue-700",
  shipped:             "bg-violet-100 text-violet-700",
  delivered:           "bg-emerald-100 text-emerald-700",
  cancelled:           "bg-rose-100 text-rose-700",
  pending:             "bg-slate-100 text-slate-600",
  partially_shipped:   "bg-amber-100 text-amber-700",
  partially_delivered: "bg-teal-100 text-teal-700",
}

export function SellerOrderCard({ order }: SellerOrderCardProps) {
  const itemCount = order.items.length
  const sellerTotal = order.seller_total ?? order.items.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0
  )

  return (
    <Link
      href={`/seller/orders/${order._id}`}
      className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* Icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
        <ShoppingBag className="size-5 text-indigo-600" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">
            #{order._id.slice(-8).toUpperCase()}
          </p>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", statusStyles[order.order_status] ?? "bg-slate-100 text-slate-600")}>
            {order.order_status.replace("_", " ")}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-400">
          {itemCount} item{itemCount !== 1 ? "s" : ""} · {format(new Date(order.created_at), "d MMM yyyy")}
        </p>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p className="text-base font-bold text-slate-900">₹{sellerTotal.toFixed(0)}</p>
        <p className="text-xs text-slate-400 capitalize">{order.payment_method}</p>
      </div>
    </Link>
  )
}
