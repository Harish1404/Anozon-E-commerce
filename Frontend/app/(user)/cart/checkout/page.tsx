"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useProfile } from "@/hooks/useProfile"
import { useCart } from "@/hooks/useCart"
import { useProduct } from "@/hooks/useProduct"
import { usePlaceOrder, useBuyNow } from "@/hooks/useOrders"
import { checkoutSchema, CheckoutFormValues } from "@/schemas/order.schema"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isBuyNow = searchParams.get("buyNow") === "true"
  const buyNowProductId = searchParams.get("product_id") || ""
  const buyNowQuantity = parseInt(searchParams.get("quantity") || "1", 10)

  const { data: profile, isLoading: isProfileLoading } = useProfile()
  const { data: cart, isLoading: isCartLoading } = useCart()
  const { data: product, isLoading: isProductLoading } = useProduct(isBuyNow ? buyNowProductId : "")

  const placeOrder = usePlaceOrder()
  const buyNow = useBuyNow()

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address_id: "",
      payment_method: "online",
    },
  })

  // Pre-select default address if available
  useEffect(() => {
    if (profile?.addresses && profile.addresses.length > 0) {
      const defaultAddress = profile.addresses.find((a) => a.is_default) || profile.addresses[0]
      form.setValue("address_id", defaultAddress.address_id)
    }
  }, [profile, form])

  const isLoading = isProfileLoading || (isBuyNow ? isProductLoading : isCartLoading)

  const summary = useMemo(() => {
    if (isBuyNow && product) {
      const subtotal = product.price * buyNowQuantity
      const delivery_charge = subtotal >= 500 ? 0 : 50
      const gst_amount = subtotal * 0.18
      const total = subtotal + delivery_charge + gst_amount
      return { subtotal, gst_amount, delivery_charge, total, gst_rate: 18 }
    } else if (!isBuyNow && cart) {
      return cart.summary
    }
    return null
  }, [isBuyNow, product, cart, buyNowQuantity])

  if (isLoading) {
    return <div className="min-h-screen p-8 text-center text-slate-500">Loading checkout...</div>
  }

  if (!profile?.full_name || !profile?.mobile) {
    return (
      <div className="min-h-screen p-8">
        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-8 text-yellow-800 text-center shadow-sm">
          <p className="font-semibold text-lg">Incomplete Profile</p>
          <p className="mt-2">Please complete your profile (name and mobile) to continue.</p>
          <Button className="mt-6" onClick={() => router.push("/profile")}>Go to Profile</Button>
        </div>
      </div>
    )
  }

  if (!summary || (!isBuyNow && cart?.items.length === 0)) {
    return (
      <div className="min-h-screen p-8 text-center">
        <p className="text-lg font-semibold text-slate-700">Nothing to checkout.</p>
        <Button className="mt-4" onClick={() => router.push("/")}>Browse Products</Button>
      </div>
    )
  }

  const onSubmit = (data: CheckoutFormValues) => {
    if (isBuyNow) {
      buyNow.mutate(
        { product_id: buyNowProductId, quantity: buyNowQuantity, ...data },
        {
          onSuccess: (res) => {
            toast.success("Order placed successfully!")
            router.push(`/orders/${res.order_id}`)
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.detail || "Failed to place order")
          },
        }
      )
    } else {
      placeOrder.mutate(data, {
        onSuccess: (res) => {
          toast.success("Order placed successfully!")
          router.push(`/orders/${res.order_id}`)
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || "Failed to place order")
        },
      })
    }
  }

  const isSubmitting = placeOrder.isPending || buyNow.isPending

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900 mb-8">Checkout</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-8">
            {/* Address Selection */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Delivery Address</h2>
              {profile.addresses && profile.addresses.length > 0 ? (
                <FormField
                  control={form.control}
                  name="address_id"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          {profile.addresses.map((address) => (
                            <FormItem key={address.address_id} className="flex items-start space-x-3 space-y-0 rounded-2xl border border-slate-200 p-4 transition-colors hover:bg-slate-50 cursor-pointer">
                              <FormControl>
                                <RadioGroupItem value={address.address_id} className="mt-1" />
                              </FormControl>
                              <div className="flex-1 cursor-pointer">
                                <FormLabel className="font-semibold text-slate-900 cursor-pointer">
                                  {address.label} {address.is_default && <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Default</span>}
                                </FormLabel>
                                <p className="mt-1 text-sm text-slate-600">
                                  {address.line1}, {address.line2 && `${address.line2}, `}{address.city}, {address.state} - {address.pincode}
                                </p>
                              </div>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="text-center p-6 border border-dashed border-slate-300 rounded-2xl">
                  <p className="text-slate-600 mb-4">You have no saved addresses.</p>
                  <Button type="button" variant="outline" onClick={() => router.push("/profile")}>Add an Address</Button>
                </div>
              )}
            </div>

            {/* Payment Selection */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Payment Method</h2>
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-2xl border border-slate-200 p-4 transition-colors hover:bg-slate-50 cursor-pointer">
                          <FormControl>
                            <RadioGroupItem value="online" />
                          </FormControl>
                          <FormLabel className="font-medium text-slate-900 cursor-pointer">Online Payment (Cards, UPI, NetBanking)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-2xl border border-slate-200 p-4 transition-colors hover:bg-slate-50 cursor-pointer">
                          <FormControl>
                            <RadioGroupItem value="cod" />
                          </FormControl>
                          <FormLabel className="font-medium text-slate-900 cursor-pointer">Cash on Delivery (COD)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Order Summary</h2>
              
              {isBuyNow && product ? (
                <div className="mb-6 flex gap-4 pb-6 border-b border-slate-100">
                   <img src={product.image_urls?.[0] || "/placeholder.png"} alt={product.name} className="h-16 w-16 rounded-xl object-cover" />
                   <div>
                     <p className="font-medium text-sm text-slate-900 line-clamp-2">{product.name}</p>
                     <p className="text-xs text-slate-500 mt-1">Qty: {buyNowQuantity}</p>
                   </div>
                </div>
              ) : null}

              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({summary.gst_rate}%)</span>
                  <span>₹{summary.gst_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  {summary.delivery_charge === 0 ? (
                    <span className="text-emerald-600 font-medium">Free</span>
                  ) : (
                    <span>₹{summary.delivery_charge.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-semibold text-slate-900">
                  <span>Total</span>
                  <span>₹{summary.total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button type="submit" size="lg" className="mt-8 w-full rounded-2xl" disabled={isSubmitting || !profile.addresses?.length}>
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
