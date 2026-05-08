"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, ProductFormData } from "@/schemas/product.schema"
import { PRODUCT_CATEGORIES } from "@/lib/constants"
import { Product } from "@/types"
import Link from "next/link"
import { useMemo } from "react"

interface ProductFormProps {
  initialValues?: Partial<Product>
  onSubmit: (data: ProductFormData) => void
  isLoading?: boolean
  submitLabel?: string
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-rose-600">{message}</p>
}

export function ProductForm({ initialValues, onSubmit, isLoading, submitLabel = "Submit" }: ProductFormProps) {
  const defaultValues: ProductFormData = useMemo(() => ({
    name:             initialValues?.name ?? "",
    description:      initialValues?.description ?? "",
    category:         initialValues?.category ?? "",
    actual_price:     initialValues?.actual_price ?? 0,
    discount_percent: initialValues?.discount_percent ?? 0,
    stock:            initialValues?.stock ?? 0,
    image_urls:       initialValues?.image_urls ?? [],
  }), [initialValues])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  const actualPrice     = watch("actual_price") || 0
  const discountPercent = watch("discount_percent") || 0
  const finalPrice      = Math.round(actualPrice - (actualPrice * discountPercent) / 100)

  // Transform comma-separated images field
  const onFormSubmit = (data: ProductFormData) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">

        {/* ── Left column — name, description, images ─────────── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="e.g. Wireless Bluetooth Headphones"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
            <FieldError message={errors.name?.message} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={5}
              placeholder="Describe your product in detail (min 20 characters)…"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
            />
            <FieldError message={errors.description?.message} />
          </div>

          {/* Image URLs */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Image URLs
              <span className="ml-1.5 text-xs font-normal text-slate-400">(comma-separated)</span>
            </label>
            <textarea
              rows={3}
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
              defaultValue={(initialValues?.image_urls ?? []).join(", ")}
              {...register("image_urls", {
                setValueAs: (v: unknown) => {
                  if (Array.isArray(v)) return v
                  if (typeof v === "string") {
                    return v.split(",").map((s) => s.trim()).filter(Boolean)
                  }
                  return []
                },
              })}
            />
            <FieldError message={errors.image_urls?.message} />
          </div>
        </div>

        {/* ── Right column — category, pricing, stock ──────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("category")}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition bg-white"
            >
              <option value="">Select category…</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <FieldError message={errors.category?.message} />
          </div>

          {/* Actual Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Price (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("actual_price", { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="999"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
            <FieldError message={errors.actual_price?.message} />
          </div>

          {/* Discount Percent */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Discount (%)
            </label>
            <input
              {...register("discount_percent", { valueAsNumber: true })}
              type="number"
              min={0}
              max={100}
              placeholder="0"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
            <FieldError message={errors.discount_percent?.message} />

            {/* Live price preview */}
            {actualPrice > 0 && (
              <div className="mt-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                <p className="text-xs text-emerald-700">
                  Final price:{" "}
                  <span className="font-bold text-emerald-800">₹{finalPrice}</span>
                  {discountPercent > 0 && (
                    <span className="ml-1 line-through text-slate-400 text-xs">₹{actualPrice}</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Stock <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("stock", { valueAsNumber: true })}
              type="number"
              min={0}
              placeholder="100"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
            <FieldError message={errors.stock?.message} />
          </div>
        </div>
      </div>

      {/* ── Bottom actions ──────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <Link
          href="/seller/products"
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isLoading ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  )
}
