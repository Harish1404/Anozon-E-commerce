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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Back */}
        <Link
          href="/seller/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ChevronLeft className="size-4" /> Back to Products
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 border-b border-border pb-5">
            <h1 className="text-xl font-bold text-foreground">Create New Product</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your product will be submitted for admin approval before going live.
            </p>
          </div>

          {/* Duplicate / error banner */}
          {error && errorMsg?.includes("already exists") && (
            <div className="mb-5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                You already have a product with this name.
              </p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                Edit the existing listing instead of creating a new one.
              </p>
            </div>
          )}

          {error && !errorMsg?.includes("already exists") && (
            <div className="mb-5 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">{errorMsg ?? "Something went wrong. Please try again."}</p>
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
