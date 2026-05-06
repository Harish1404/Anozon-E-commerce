"use client"

import { useMemo } from "react"
import { useCart, useUpdateCart, useRemoveFromCart } from "@/hooks/useCart"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const router = useRouter()
  const { data: cart, isLoading, isError } = useCart()
  const updateCart = useUpdateCart()
  const removeFromCart = useRemoveFromCart()

  const totalItems = useMemo(() => cart?.summary.item_count ?? 0, [cart])

  if (isLoading) {
    return <div className="min-h-screen p-8">Loading cart...</div>
  }

  if (isError) {
    return <div className="min-h-screen p-8">Unable to load your cart.</div>
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Your cart is empty</h1>
          <p className="mt-2 text-slate-600">Add items from the shop to start your order.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          {cart.items.map((item) => (
            <div key={item.product_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="h-24 w-24 rounded-3xl object-cover" />
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">₹{item.price} each</p>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-2">
                    <button
                      type="button"
                      className="rounded-full bg-white px-3 py-2 text-slate-700 shadow-sm"
                      onClick={() => updateCart.mutate({ product_id: item.product_id, quantity: item.quantity - 1 })}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      className="rounded-full bg-white px-3 py-2 text-slate-700 shadow-sm"
                      onClick={() => updateCart.mutate({ product_id: item.product_id, quantity: item.quantity + 1 })}
                    >
                      +
                    </button>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => removeFromCart.mutate(item.product_id)}>
                    Remove
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-600">Total: ₹{item.item_total.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Items ({totalItems})</span>
              <span>₹{cart.summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST ({cart.summary.gst_rate}%)</span>
              <span>₹{cart.summary.gst_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹{cart.summary.delivery_charge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>₹{cart.summary.total.toFixed(2)}</span>
            </div>
          </div>
          <Button className="mt-6 w-full" onClick={() => router.push("/cart/checkout")}>
            Proceed to checkout
          </Button>
        </div>
      </div>
    </div>
  )
}
