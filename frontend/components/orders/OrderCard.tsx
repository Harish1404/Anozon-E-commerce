"use client"

import { useState } from "react"
import Link from "next/link"
import { Order } from "@/types"
import { format } from "date-fns"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

interface OrderCardProps {
  order: Order
}

const statusStyles: Record<string, { bg: string, text: string, label: string }> = {
  pending:             { bg: "bg-slate-100 dark:bg-slate-500/20", text: "text-slate-700 dark:text-slate-400", label: "Pending" },
  confirmed:           { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-400", label: "Confirmed" },
  partially_shipped:   { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-400", label: "Partially Shipped" },
  shipped:             { bg: "bg-violet-100 dark:bg-violet-500/20", text: "text-violet-700 dark:text-violet-400", label: "Shipped" },
  partially_delivered: { bg: "bg-teal-100 dark:bg-teal-500/20", text: "text-teal-700 dark:text-teal-400", label: "Partially Delivered" },
  delivered:           { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", label: "Delivered" },
  cancelled:           { bg: "bg-rose-100 dark:bg-rose-500/20", text: "text-rose-700 dark:text-rose-400", label: "Cancelled" },
}

export function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Ensure the date is parsed as UTC if it doesn't have a timezone indicator
  const dateStr = order.created_at.endsWith("Z") || order.created_at.includes("+")
    ? order.created_at
    : `${order.created_at}Z`
  const date = new Date(dateStr)
  
  const statusInfo = statusStyles[order.order_status] ?? {
    bg: "bg-slate-100 dark:bg-slate-500/20",
    text: "text-slate-700 dark:text-slate-400",
    label: order.order_status
  }

  const displayItems = isExpanded ? order.items : order.items.slice(0, 3)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/50 px-6 py-4 border-b border-border">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Placed</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {format(date, "d MMM yyyy, h:mm a")}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">₹{order.summary.total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ship To</p>
            <p className="mt-0.5 text-sm font-medium text-foreground truncate max-w-[120px]" title={order.shipping_address.full_name}>
              {order.shipping_address.full_name}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order # {order._id.slice(-8).toUpperCase()}</p>
          <Link href={`/orders/${order._id}`} className="mt-1 text-xs font-medium text-primary hover:underline">
            View order details
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
          <span className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold tracking-wide border border-transparent shadow-xs capitalize",
            statusInfo.bg,
            statusInfo.text
          )}>
            {statusInfo.label.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-6">
          {displayItems.map((item) => (
            <div key={item.product_id} className="flex gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <Link 
                    href={`/products/${item.product_id}`} 
                    className="text-sm font-semibold text-foreground hover:text-primary line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  
                  {/* Item-level Details & Status Badge */}
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>Quantity: {item.quantity}</span>
                    <span className="text-border">|</span>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-transparent",
                      item.item_status === "cancelled" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                      item.item_status === "delivered" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                      item.item_status === "shipped" ? "bg-violet-500/10 text-violet-600 dark:text-violet-400" :
                      item.item_status === "confirmed" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                      "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400"
                    )}>
                      <span className={cn("size-1.5 rounded-full",
                        item.item_status === "cancelled" ? "bg-rose-500" :
                        item.item_status === "delivered" ? "bg-emerald-500" :
                        item.item_status === "shipped" ? "bg-violet-500" :
                        item.item_status === "confirmed" ? "bg-blue-500" :
                        "bg-slate-400 dark:bg-slate-500"
                      )} />
                      <span className="capitalize">{item.item_status}</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link 
                    href={`/products/${item.product_id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 text-xs px-3 rounded-full")}
                  >
                    Buy it again
                  </Link>
                  <Link 
                    href={`/products/${item.product_id}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs px-3 rounded-full text-primary hover:bg-primary/10")}
                  >
                    View your item
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {order.items.length > 3 && (
            <div className="flex justify-center pt-2 border-t border-border/20">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-full transition-all duration-200 focus:outline-hidden"
              >
                {isExpanded ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp className="size-3.5" />
                  </>
                ) : (
                  <>
                    <span>Show all {order.items.length} items</span>
                    <ChevronDown className="size-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
