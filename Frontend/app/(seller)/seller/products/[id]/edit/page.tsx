"use client"

import { use, useEffect } from "react"
import { useSellerProduct, useUpdateProduct } from "@/hooks/useSellerProducts"
import { ProductForm } from "@/components/seller/product/ProductForm"
import { ProductFormData } from "@/schemas/product.schema"
import { ChevronLeft, CheckCircle2, Clock, EyeOff } from "lucide-react"
import Link from "next/link"

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

// Skeleton for the form while loading
function FormSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-5">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-slate-100" />)}
        </div>
        <div className="lg:col-span-2 space-y-5">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-xl bg-slate-100" />)}
        </div>
      </div>
    </div>
  )
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params)
  const { data: product, isLoading } = useSellerProduct(id)
  const { mutate: updateProduct, isPending } = useUpdateProduct()

  useEffect(() => {
    document.title = product ? `Edit: ${product.name} — Anozon Seller` : "Edit Product — Anozon Seller"
  }, [product])

  const handleSubmit = (data: ProductFormData) => {
    updateProduct({ product_id: id, data })
  }

  // Approval status banner
  const ApprovalBanner = () => {
    if (!product) return null
    if (!product.is_approved) {
      return (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-6">
          <Clock className="size-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            This product is <strong>pending admin approval</strong> and not visible to buyers yet.
          </p>
        </div>
      )
    }
    if (!product.is_active) {
      return (
        <div className="flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 mb-6">
          <EyeOff className="size-4 text-slate-500 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-700">
            This product is <strong>hidden</strong>. Toggle it active to make it visible.
          </p>
        </div>
      )
    }
    return (
      <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 mb-6">
        <CheckCircle2 className="size-4 text-emerald-600 mt-0.5 shrink-0" />
        <p className="text-sm text-emerald-800">
          This product is <strong>live</strong> and visible to buyers.
        </p>
      </div>
    )
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
            <h1 className="text-xl font-bold text-slate-900">Edit Product</h1>
            <p className="text-sm text-slate-500 mt-1">
              {product?.name ?? "Loading…"}
            </p>
          </div>

          <ApprovalBanner />

          {isLoading ? (
            <FormSkeleton />
          ) : product ? (
            <ProductForm
              initialValues={product}
              onSubmit={handleSubmit}
              isLoading={isPending}
              submitLabel="Save Changes"
            />
          ) : (
            <p className="text-sm text-rose-600">Product not found.</p>
          )}
        </div>
      </div>
    </div>
  )
}
