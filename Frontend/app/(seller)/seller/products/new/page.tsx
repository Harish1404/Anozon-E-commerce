"use client"

import { useEffect } from "react"
import { useCreateProduct } from "@/hooks/useSellerProducts"
import { ProductForm } from "@/components/seller/product/ProductForm"
import { ProductFormData } from "@/schemas/product.schema"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function NewProductPage() {
  useEffect(() => {
    document.title = "New Product — Anozon Seller"
  }, [])

  const { mutate: createProduct, isPending, error } = useCreateProduct()

  const errorMsg: string | undefined = (error as any)?.response?.data?.detail

  const handleSubmit = (data: ProductFormData) => {
    createProduct(data)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Back */}
        <Link
          href="/seller/products"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-5"
        >
          <ChevronLeft className="size-4" /> Back to Products
        </Link>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 border-b border-slate-100 pb-5">
            <h1 className="text-xl font-bold text-slate-900">Create New Product</h1>
            <p className="text-sm text-slate-500 mt-1">
              Your product will be submitted for admin approval before going live.
            </p>
          </div>

          {/* Duplicate / error banner */}
          {error && errorMsg?.includes("already exists") && (
            <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-sm text-amber-800 font-medium">
                You already have a product with this name.
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Edit the existing listing instead of creating a new one.
              </p>
            </div>
          )}

          {error && !errorMsg?.includes("already exists") && (
            <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
              <p className="text-sm text-rose-700">{errorMsg ?? "Something went wrong. Please try again."}</p>
            </div>
          )}

          <ProductForm
            onSubmit={handleSubmit}
            isLoading={isPending}
            submitLabel="Submit for Approval"
          />
        </div>
      </div>
    </div>
  )
}
