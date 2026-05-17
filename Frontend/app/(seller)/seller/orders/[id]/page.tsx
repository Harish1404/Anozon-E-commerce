"use client"

import { use, useEffect } from "react"
import { useSellerOrder } from "@/hooks/useSellerOrders"
import { SellerOrderItemRow } from "@/components/seller/order/SellerOrderItemRow"
import { ChevronLeft, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

const statusStyles: Record<string, string> = {
  confirmed:           "bg-blue-500/10 text-blue-500",
  shipped:             "bg-violet-500/10 text-violet-500",
  delivered:           "bg-emerald-500/10 text-emerald-500",
  cancelled:           "bg-rose-500/10 text-rose-500",
  pending:             "bg-muted text-muted-foreground",
  partially_shipped:   "bg-amber-500/10 text-amber-500",
  partially_delivered: "bg-teal-500/10 text-teal-500",
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params)
  const { data: order, isLoading } = useSellerOrder(id)

  useEffect(() => {
    document.title = order ? `Order #${order._id.slice(-8).toUpperCase()} — Anozon Seller` : "Order — Anozon Seller"
  }, [order])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 space-y-4 animate-pulse">
          <div className="h-8 w-40 rounded-xl bg-muted" />
          <div className="h-32 rounded-2xl bg-muted" />
          <div className="h-48 rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-destructive">Order not found.</p>
      </div>
    )
  }

  const addr = order.shipping_address

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 space-y-5">
        {/* Back */}
        <Link
          href="/seller/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" /> Back to Orders
        </Link>

        {/* Order header card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Order ID</p>
              <p className="text-lg font-bold text-foreground tracking-tight">
                #{order._id.slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Placed {format(new Date(order.created_at.endsWith("Z") || order.created_at.includes("+") ? order.created_at : `${order.created_at}Z`), "d MMMM yyyy, h:mm a")}
              </p>
            </div>
            <span className={cn("self-start rounded-full px-3 py-1 text-[10px] font-semibold capitalize", statusStyles[order.order_status])}>
              {order.order_status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Shipping address */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <MapPin className="size-4 text-muted-foreground" />
            Shipping Address
          </h2>
          <div className="text-sm text-muted-foreground space-y-0.5">
            <p className="font-medium text-foreground">{addr.full_name}</p>
            <p>{addr.line1}</p>
            {addr.line2 && <p>{addr.line2}</p>}
            <p>{addr.city}, {addr.state} — {addr.pincode}</p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Your Items ({order.items.length})
          </h2>
          {order.items.map((item) => (
            <SellerOrderItemRow
              key={item.product_id}
              item={item}
              orderId={order._id}
            />
          ))}
        </div>

        {/* Payment & total */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <CreditCard className="size-4 text-muted-foreground" />
            Payment
          </h2>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Method</span>
            <span className="font-medium capitalize text-foreground">{order.payment_method}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>Payment Status</span>
            <span className="font-medium capitalize text-foreground">{order.payment_status}</span>
          </div>
          <div className="mt-3 border-t border-border pt-3 flex justify-between">
            <span className="text-sm font-semibold text-foreground">Your Total</span>
            <span className="text-lg font-bold text-primary">₹{order.seller_total.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
