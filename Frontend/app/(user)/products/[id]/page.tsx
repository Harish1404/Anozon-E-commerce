"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useProduct } from "@/hooks/useProduct"
import { useAddToCart } from "@/hooks/useCart"
import { ProductDetail } from "@/components/product/ProductDetail"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter()
  const { id } = React.use(params)
  const productQuery = useProduct(id)
  const addToCart = useAddToCart()

  if (productQuery.isLoading) {
    return <div className="min-h-screen p-8">Loading product...</div>
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <div className="min-h-screen p-8">
        <p className="text-lg font-semibold text-slate-900">Product not found</p>
        <button className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-white" onClick={() => router.push("/")}>Go back</button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
      <ProductDetail
        product={productQuery.data}
        onAddToCart={(product_id, quantity) => addToCart.mutate({ product_id, quantity })}
      />
    </div>
  )
}
