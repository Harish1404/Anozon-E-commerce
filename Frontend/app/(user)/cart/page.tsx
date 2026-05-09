"use client"

import { useMemo, useState, useEffect } from "react"
import { useCart, useUpdateCart, useRemoveFromCart } from "@/hooks/useCart"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ShoppingBag, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const ITEMS_PER_PAGE = 5

export default function CartPage() {
  const router = useRouter()
  const { data: cart, isLoading, isError } = useCart()
  const updateCart = useUpdateCart()
  const removeFromCart = useRemoveFromCart()

  useEffect(() => {
    document.title = "Anozon - Cart"
  }, [])

  const [page, setPage] = useState(1)

  const totalItems = useMemo(() => cart?.summary.item_count ?? 0, [cart])
  const cartItems = useMemo(() => cart?.items ?? [], [cart])
  const totalPages = Math.ceil(cartItems.length / ITEMS_PER_PAGE)

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return cartItems.slice(start, start + ITEMS_PER_PAGE)
  }, [cartItems, page])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 w-full bg-slate-100 animate-pulse rounded-3xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <div className="min-h-screen p-8 text-center text-red-500 font-medium">Unable to load your cart.</div>
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white mb-6">
          <ShoppingBag className="size-10 text-slate-700" />
        </div>
        <h1 className="text-3xl font-bold text-slate-700">Your Cart is empty</h1>
        <p className="mt-4 text-slate-600">Your shopping cart lives to serve. Give it purpose — fill it with groceries, electronics, and more.</p>
        <Button className="mt-8 px-8 rounded-full" onClick={() => router.push("/")}>Continue Shopping</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Cart Items Section */}
        <div className="flex-1 w-full space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
              <p className="text-sm font-medium text-slate-500">{totalItems} items</p>
            </div>

            <div className="space-y-6">
              {paginatedItems.map((item) => (
                <div key={item.product_id} className="flex flex-col sm:flex-row gap-6 group">
                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-slate-100">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3
                          className="text-lg font-bold text-slate-900 hover:text-primary cursor-pointer transition-colors"
                          onClick={() => router.push(`/products/${item.product_id}`)}
                        >
                          {item.name}
                        </h3>
                        <p className="text-sm font-medium text-emerald-600 mt-1">In Stock</p>
                      </div>
                      <p className="text-xl font-bold text-slate-900">₹{item.price.toFixed(2)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 mt-4">
                      <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 shadow-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-white shadow-sm hover:bg-slate-50"
                          onClick={() => updateCart.mutate({ product_id: item.product_id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1 || updateCart.isPending}
                        >
                          -
                        </Button>
                        <span className="min-w-[2.5rem] text-center text-sm font-bold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-white shadow-sm hover:bg-slate-50"
                          onClick={() => updateCart.mutate({ product_id: item.product_id, quantity: item.quantity + 1 })}
                          disabled={updateCart.isPending}
                        >
                          +
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <Separator orientation="vertical" className="h-4 hidden sm:block" />
                        <button
                          className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
                          onClick={() => removeFromCart.mutate(item.product_id)}
                        >
                          <Trash2 className="size-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-full gap-1.5"
                >
                  <ChevronLeft className="size-4" /> Previous
                </Button>
                <div className="text-sm font-medium text-slate-500">
                  Page <span className="text-slate-900">{page}</span> of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-full gap-1.5"
                >
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96 sticky top-24">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{cart.summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                {cart.summary.delivery_charge === 0 ? (
                  <span className="text-emerald-600 font-medium">FREE</span>
                ) : (
                  <span>₹{cart.summary.delivery_charge.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%)</span>
                <span>₹{cart.summary.gst_amount.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-xl font-bold text-slate-900 pt-2">
                <span>Total</span>
                <span>₹{cart.summary.total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="mt-8 w-full h-12 rounded-full text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => router.push("/cart/checkout")}
            >
              Proceed to Buy
            </Button>

            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">
              <div className="h-px w-8 bg-slate-100" />
              Secure Checkout
              <div className="h-px w-8 bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
