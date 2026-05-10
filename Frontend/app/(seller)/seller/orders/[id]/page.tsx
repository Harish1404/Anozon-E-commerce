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
  confirmed:           "bg-blue-100 text-blue-700",
  shipped:             "bg-violet-100 text-violet-700",
  delivered:           "bg-emerald-100 text-emerald-700",
  cancelled:           "bg-rose-100 text-rose-700",
  pending:             "bg-slate-100 text-slate-600",
  partially_shipped:   "bg-amber-100 text-amber-700",
  partially_delivered: "bg-teal-100 text-teal-700",
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params)
  const { data: order, isLoading } = useSellerOrder(id)

  useEffect(() => {
    document.title = order ? `Order #${order._id.slice(-8).toUpperCase()} — Anozon Seller` : "Order — Anozon Seller"
  }, [order])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 space-y-4 animate-pulse">
          <div className="h-8 w-40 rounded-xl bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="h-48 rounded-2xl bg-slate-200" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-rose-600">Order not found.</p>
      </div>
    )
  }

  const addr = order.shipping_address

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 space-y-5">
        {/* Back */}
        <Link
          href="/seller/orders"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="size-4" /> Back to Orders
        </Link>

        {/* Order header card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Order ID</p>
              <p className="text-lg font-bold text-slate-900 tracking-tight">
                #{order._id.slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Placed {format(new Date(order.created_at.endsWith("Z") || order.created_at.includes("+") ? order.created_at : `${order.created_at}Z`), "d MMMM yyyy, h:mm a")}
              </p>
            </div>
            <span className={cn("self-start rounded-full px-3 py-1 text-xs font-semibold capitalize", statusStyles[order.order_status])}>
              {order.order_status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Shipping address */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
            <MapPin className="size-4 text-slate-400" />
            Shipping Address
          </h2>
          <div className="text-sm text-slate-600 space-y-0.5">
            <p className="font-medium text-slate-800">{addr.full_name}</p>
            <p>{addr.line1}</p>
            {addr.line2 && <p>{addr.line2}</p>}
            <p>{addr.city}, {addr.state} — {addr.pincode}</p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">
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
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
            <CreditCard className="size-4 text-slate-400" />
            Payment
          </h2>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Method</span>
            <span className="font-medium capitalize">{order.payment_method}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 mt-1">
            <span>Payment Status</span>
            <span className="font-medium capitalize">{order.payment_status}</span>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3 flex justify-between">
            <span className="text-sm font-semibold text-slate-800">Your Total</span>
            <span className="text-lg font-bold text-indigo-600">₹{order.seller_total.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
