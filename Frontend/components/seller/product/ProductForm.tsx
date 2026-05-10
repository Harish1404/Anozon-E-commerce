"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, ProductFormData } from "@/schemas/product.schema"
import { PRODUCT_CATEGORIES } from "@/lib/constants"
import { Product } from "@/types"
import Link from "next/link"
import { useMemo, useState, useEffect } from "react"
import { ImagePlus, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductFormProps {
  initialValues?: Partial<Product>
  onSubmit: (data: ProductFormData) => void
  isLoading?: boolean
  submitLabel?: string
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

const IMAGE_SLOT_LABELS = [
  { label: "Main Image", mandatory: true },
  { label: "Image 2", mandatory: true },
  { label: "Image 3", mandatory: true },
  { label: "Image 4", mandatory: false },
  { label: "Image 5", mandatory: false },
]

export function ProductForm({ initialValues, onSubmit, isLoading, submitLabel = "Submit" }: ProductFormProps) {
  // Initialize per-slot state from initial values
  const initialSlots = useMemo(() => {
    const urls = initialValues?.image_urls ?? []
    return IMAGE_SLOT_LABELS.map((_, i) => urls[i] ?? "")
  }, [initialValues])

  const [imageSlots, setImageSlots] = useState<string[]>(initialSlots)

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
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  // Sync imageSlots → form field
  useEffect(() => {
    const nonEmpty = imageSlots.filter(Boolean)
    setValue("image_urls", nonEmpty, { shouldValidate: false })
  }, [imageSlots, setValue])

  const handleSlotChange = (index: number, value: string) => {
    const next = [...imageSlots]
    next[index] = value
    setImageSlots(next)
  }

  const handleSlotClear = (index: number) => {
    const next = [...imageSlots]
    next[index] = ""
    setImageSlots(next)
  }

  const actualPrice     = watch("actual_price") || 0
  const discountPercent = watch("discount_percent") || 0
  const finalPrice      = Math.round(actualPrice - (actualPrice * discountPercent) / 100)

  const isValidUrl = (url: string) => {
    try {
      return url.startsWith("http://") || url.startsWith("https://")
    } catch {
      return false
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">

        {/* ── Left column — name, description, images ─────────── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Product Name <span className="text-destructive">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="e.g. Wireless Bluetooth Headphones"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            <FieldError message={errors.name?.message} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={5}
              placeholder="Describe your product in detail (min 20 characters)…"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
            />
            <FieldError message={errors.description?.message} />
          </div>

          {/* Image URL Slots */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Product Images
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (3 required, 2 optional · must be valid URLs)
              </span>
            </label>

            {/* Array-level error */}
            {errors.image_urls?.message && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="size-3" />
                {errors.image_urls.message}
              </div>
            )}

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {IMAGE_SLOT_LABELS.map((slot, index) => (
                <div key={index} className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {slot.label}
                    {slot.mandatory && <span className="text-destructive ml-0.5">*</span>}
                  </p>

                  <div className="relative">
                    <input
                      value={imageSlots[index]}
                      onChange={(e) => handleSlotChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className={cn(
                        "w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition pr-8",
                        imageSlots[index] && !isValidUrl(imageSlots[index])
                          ? "border-destructive focus:ring-destructive/20"
                          : "border-border focus:ring-primary/20 focus:border-primary"
                      )}
                    />
                    {imageSlots[index] && (
                      <button
                        type="button"
                        onClick={() => handleSlotClear(index)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Per-slot error */}
                  {errors.image_urls?.[index]?.message && (
                    <p className="text-[10px] text-destructive">{errors.image_urls[index]?.message}</p>
                  )}

                  {/* Live preview */}
                  {imageSlots[index] && isValidUrl(imageSlots[index]) ? (
                    <div className="relative h-20 w-full rounded-lg overflow-hidden bg-muted border border-border">
                      <img
                        src={imageSlots[index]}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    </div>
                  ) : !imageSlots[index] ? (
                    <div className="flex h-20 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/40">
                      <ImagePlus className="size-5 text-muted-foreground/40" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column — category, pricing, stock ──────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Category <span className="text-destructive">*</span>
            </label>
            <select
              {...register("category")}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
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
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Price (₹) <span className="text-destructive">*</span>
            </label>
            <input
              {...register("actual_price", { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="999"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            <FieldError message={errors.actual_price?.message} />
          </div>

          {/* Discount Percent */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Discount (%)
            </label>
            <input
              {...register("discount_percent", { valueAsNumber: true })}
              type="number"
              min={0}
              max={100}
              placeholder="0"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            <FieldError message={errors.discount_percent?.message} />

            {/* Live price preview */}
            {actualPrice > 0 && (
              <div className="mt-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 px-3 py-2">
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Final price:{" "}
                  <span className="font-bold">₹{finalPrice}</span>
                  {discountPercent > 0 && (
                    <span className="ml-1 line-through text-muted-foreground text-xs">₹{actualPrice}</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Stock <span className="text-destructive">*</span>
            </label>
            <input
              {...register("stock", { valueAsNumber: true })}
              type="number"
              min={0}
              placeholder="100"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            <FieldError message={errors.stock?.message} />
          </div>
        </div>
      </div>

      {/* ── Bottom actions ──────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <Link
          href="/seller/products"
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isLoading ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  )
}
