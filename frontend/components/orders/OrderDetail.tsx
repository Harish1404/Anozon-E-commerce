"use client"

import { MapPin, Phone, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { Order } from "@/types"
import { Button } from "@/components/ui/button"

interface OrderDetailProps {
  order: Order
  onCancelOrder: () => void
  onCancelItem: (productId: string, productName: string) => void
  isCancelPending: boolean
}

export function OrderDetail({ order, onCancelOrder, onCancelItem, isCancelPending }: OrderDetailProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        {/* Order Items */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/50">
            <h2 className="font-semibold text-foreground text-lg">Order Items</h2>
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.product_id} className="p-6">
                <div className="flex gap-4">
                  <img src={item.image} alt={item.name} className="size-20 rounded-2xl object-cover border border-border" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-foreground line-clamp-2">{item.name}</h3>
                      <p className="font-semibold text-foreground ml-4">₹{item.item_total.toFixed(2)}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Price: ₹{item.price.toFixed(2)}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                        item.item_status === "cancelled" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                        item.item_status === "delivered" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        "bg-secondary text-secondary-foreground"
                      )}>
                        <div className={cn("size-1.5 rounded-full", 
                          item.item_status === "cancelled" ? "bg-rose-500" :
                          item.item_status === "delivered" ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"
                        )} />
                        {item.item_status}
                      </div>
                      
                      {/* Per-item Cancellation */}
                      {["pending", "confirmed"].includes(item.item_status) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full h-8"
                          onClick={() => onCancelItem(item.product_id, item.name)}
                          disabled={isCancelPending}
                        >
                          Cancel Item
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-foreground">
              <MapPin className="size-5 text-primary" />
              <h3 className="font-semibold">Shipping Address</h3>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{order.shipping_address.full_name}</p>
              <p>{order.shipping_address.line1}</p>
              {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
              <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <span>{order.shipping_address.mobile}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-foreground">
              <CreditCard className="size-5 text-primary" />
              <h3 className="font-semibold">Payment Details</h3>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-medium text-foreground uppercase">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className={cn(
                  "font-medium",
                  order.payment_status === "paid" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                )}>{order.payment_status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sticky top-24">
          <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST ({order.summary.gst_rate}%)</span>
              <span>₹{order.summary.gst_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹{order.summary.delivery_charge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-lg font-bold text-foreground">
              <span>Total</span>
              <span>₹{order.summary.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Cancel Entire Order Button */}
          {["pending", "confirmed"].includes(order.order_status) && (
            <Button 
              variant="outline" 
              className="mt-8 w-full rounded-2xl text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive" 
              disabled={isCancelPending}
              onClick={onCancelOrder}
            >
              {isCancelPending ? "Processing..." : "Cancel Order"}
            </Button>
          )}
          
          <p className="mt-4 text-[10px] text-center text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  )
}
