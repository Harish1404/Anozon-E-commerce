"use client"

import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, ProductFormData } from "@/schemas/product.schema"
import { PRODUCT_CATEGORIES } from "@/lib/constants"
import { Product } from "@/types"
import Link from "next/link"
import { useMemo, useState, useEffect } from "react"
import {
  ImagePlus,
  X,
  AlertCircle,
  Sparkles,
  Scale,
  Ruler,
  Tags,
  Settings,
  Globe,
  Plus
} from "lucide-react"
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

// Reusable Pill Tag Input Component
interface TagInputProps {
  label: string
  placeholder?: string
  value: string[]
  onChange: (newValue: string[]) => void
  error?: string
  description?: string
}

function TagInput({ label, placeholder = "Type and press Enter", value, onChange, error, description }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const trimmed = inputValue.trim().replace(/,/g, "")
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed])
        setInputValue("")
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove))
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="block text-sm font-medium text-foreground">{label}</label>
        {description && <span className="text-[10px] text-muted-foreground">{description}</span>}
      </div>
      <div className="flex flex-wrap gap-2 p-2.5 rounded-xl border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition min-h-[46px]">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2 py-1 text-xs text-primary font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-primary/70 hover:text-primary transition-colors focus:outline-none"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground min-w-[120px]"
        />
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

// Reusable Specifications Builder Component
interface SpecsBuilderProps {
  value: Record<string, any>
  onChange: (newValue: Record<string, any>) => void
}

function SpecsBuilder({ value, onChange }: SpecsBuilderProps) {
  const [newKey, setNewKey] = useState("")
  const [newVal, setNewVal] = useState("")

  const handleAdd = () => {
    const trimmedKey = newKey.trim()
    const trimmedVal = newVal.trim()
    if (trimmedKey && trimmedVal) {
      onChange({ ...value, [trimmedKey]: trimmedVal })
      setNewKey("")
      setNewVal("")
    }
  }

  const handleRemove = (keyToRemove: string) => {
    const next = { ...value }
    delete next[keyToRemove]
    onChange(next)
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card/50 p-4">
      <div className="flex items-center gap-2">
        <Settings className="size-4 text-primary" />
        <div>
          <h4 className="text-sm font-semibold text-foreground">Technical Specifications</h4>
          <p className="text-[10px] text-muted-foreground">Add details like RAM, Material, Color, etc.</p>
        </div>
      </div>

      {/* Existing list */}
      {Object.keys(value).length > 0 && (
        <div className="divide-y divide-border border border-border rounded-xl bg-background overflow-hidden max-h-[200px] overflow-y-auto">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-3 py-2.5 text-xs">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <span className="font-semibold text-muted-foreground truncate">{k}</span>
                <span className="text-foreground truncate">{String(v)}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(k)}
                className="text-muted-foreground hover:text-destructive transition ml-2 p-1 rounded-md hover:bg-muted"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new spec form */}
      <div className="flex gap-2">
        <input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="e.g. Memory"
          className="w-1/2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
        />
        <input
          value={newVal}
          onChange={(e) => setNewVal(e.target.value)}
          placeholder="e.g. 16 GB"
          className="w-1/2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newKey.trim() || !newVal.trim()}
          className="rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium text-xs px-3.5 py-2 transition-colors disabled:opacity-50 shrink-0"
        >
          Add
        </button>
      </div>
    </div>
  )
}

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
    brand:            initialValues?.brand ?? "Generic",
    sub_category:     initialValues?.sub_category ?? "General",
    tags:             initialValues?.tags ?? [],
    specifications:   initialValues?.specifications ?? {},
    weight:           initialValues?.weight ?? 0,
    dimensions:       initialValues?.dimensions ?? { length: 0, width: 0, height: 0 },
    sku:              initialValues?.sku ?? "",
    variants:         initialValues?.variants ?? [],
    meta_title:       initialValues?.meta_title ?? "",
    meta_desc:        initialValues?.meta_desc ?? "",
    is_featured:      initialValues?.is_featured ?? false,
    search_keywords:  initialValues?.search_keywords ?? [],
  }), [initialValues])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
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

  // Watch properties for custom components
  const tagsValue = watch("tags") || []
  const variantsValue = watch("variants") || []
  const searchKeywordsValue = watch("search_keywords") || []
  const specificationsValue = watch("specifications") || {}

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

        {/* ── Left column — name, description, images, technical details ─────────── */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card 1: Product Basics */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Basic Details
            </h3>

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

          {/* Card 2: Technical Specifications & Dimensions */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
              <Scale className="size-4 text-primary" /> Technical specs & Size
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
                  Weight (kg)
                </label>
                <input
                  {...register("weight", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.0"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
                <FieldError message={errors.weight?.message} />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  SKU (Item Code)
                </label>
                <input
                  {...register("sku")}
                  placeholder="e.g. LAP-DELL-15-01"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
                <FieldError message={errors.sku?.message} />
              </div>
            </div>

            {/* Sizing Dimensions */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Ruler className="size-4 text-primary" />
                Dimensions (cm)
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold">Length</p>
                  <input
                    {...register("dimensions.length", { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="L"
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold">Width</p>
                  <input
                    {...register("dimensions.width", { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="W"
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold">Height</p>
                  <input
                    {...register("dimensions.height", { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="H"
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Custom Specifications Builder */}
            <SpecsBuilder
              value={specificationsValue}
              onChange={(next) => setValue("specifications", next, { shouldValidate: true })}
            />
          </div>

          {/* Card 3: SEO Metadata details */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
              <Globe className="size-4 text-primary" /> Search Engine Optimization (SEO)
            </h3>

            {/* Meta Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center justify-between">
                <span>Meta Title</span>
                <span className="text-[10px] text-muted-foreground">Optimal: 50-60 characters</span>
              </label>
              <input
                {...register("meta_title")}
                placeholder="Google Search title headline..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
              <FieldError message={errors.meta_title?.message} />
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center justify-between">
                <span>Meta Description</span>
                <span className="text-[10px] text-muted-foreground">Optimal: 150-160 characters</span>
              </label>
              <textarea
                {...register("meta_desc")}
                rows={3}
                placeholder="Google Search page description snippet summary..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
              />
              <FieldError message={errors.meta_desc?.message} />
            </div>
          </div>
        </div>

        {/* ── Right column — category, pricing, stock, categorization, discovery ──────────── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 4: Pricing & Inventory */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
              <Tags className="size-4 text-primary" /> Price & Categorization
            </h3>

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

            {/* Sub-Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Sub-Category
              </label>
              <input
                {...register("sub_category")}
                placeholder="e.g. Wireless Headsets"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
              <FieldError message={errors.sub_category?.message} />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Brand
              </label>
              <input
                {...register("brand")}
                placeholder="e.g. Sony, Generic"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
              <FieldError message={errors.brand?.message} />
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
                <div className="mt-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
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

            {/* Is Featured checkbox */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-border mt-3">
              <input
                {...register("is_featured")}
                type="checkbox"
                id="is_featured"
                className="size-4 rounded-md border-border text-primary focus:ring-primary/20 transition cursor-pointer"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-foreground cursor-pointer select-none">
                Featured Product <span className="text-[10px] text-muted-foreground font-normal">(Promote on front feed)</span>
              </label>
            </div>
          </div>

          {/* Card 5: Variants & SEO Discovery keywords */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
              <Settings className="size-4 text-primary" /> Variants & Discovery
            </h3>

            {/* Variants input */}
            <TagInput
              label="Product Variants"
              placeholder="Type e.g. Black, XL and press Enter"
              description="Descriptive options only"
              value={variantsValue}
              onChange={(next) => setValue("variants", next, { shouldValidate: true })}
            />

            {/* Search Keywords */}
            <TagInput
              label="Search Keywords"
              placeholder="e.g. headphones, audio, mic"
              description="Synonyms to boost search matches"
              value={searchKeywordsValue}
              onChange={(next) => setValue("search_keywords", next, { shouldValidate: true })}
            />

            {/* Tags */}
            <TagInput
              label="Advanced Tags"
              placeholder="e.g. sale, wireless, noise-cancelling"
              description="Clickable category hashtags"
              value={tagsValue}
              onChange={(next) => setValue("tags", next, { shouldValidate: true })}
            />
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
