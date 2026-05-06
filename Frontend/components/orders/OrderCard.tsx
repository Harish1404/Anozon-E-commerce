"use client"

import Link from "next/link"
import { Order } from "@/types"
import { format } from "date-fns"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  // Ensure the date is parsed as UTC if it doesn't have a timezone indicator
  const dateStr = order.created_at.endsWith("Z") || order.created_at.includes("+")
    ? order.created_at
    : `${order.created_at}Z`
  const date = new Date(dateStr)
  
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Order Placed</p>
            <p className="mt-0.5 text-sm font-medium text-slate-700">
              {format(date, "d MMM yyyy, h:mm a")}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</p>
            <p className="mt-0.5 text-sm font-medium text-slate-700">₹{order.summary.total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ship To</p>
            <p className="mt-0.5 text-sm font-medium text-slate-700 truncate max-w-[120px]" title={order.shipping_address.full_name}>
              {order.shipping_address.full_name}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Order # {order._id.slice(-8).toUpperCase()}</p>
          <Link href={`/orders/${order._id}`} className="mt-1 text-xs font-medium text-primary hover:underline">
            View order details
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            {order.order_status === "delivered" ? "Delivered" : order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
          </h3>
          <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
            {order.payment_status.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-6">
          {order.items.map((item) => (
            <div key={item.product_id} className="flex gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-100">
                <img
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between py-0.5">
                <div>
                  <Link 
                    href={`/products/${item.product_id}`} 
                    className="text-sm font-semibold text-slate-800 hover:text-primary line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">Quantity: {item.quantity}</p>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href={`/products/${item.product_id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 text-xs px-3 rounded-full")}
                  >
                    Buy it again
                  </Link>
                  <Link 
                    href={`/products/${item.product_id}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs px-3 rounded-full")}
                  >
                    View your item
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
