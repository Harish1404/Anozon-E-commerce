"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type FilterState } from "@/components/product/FilterSidebar"

interface ActiveFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onClearAll: () => void
}

interface Chip {
  label: string
  onRemove: () => void
}

export function ActiveFilters({ filters, onFilterChange, onClearAll }: ActiveFiltersProps) {
  const chips: Chip[] = []

  // Brand chips
  if (filters.brand) {
    filters.brand.split(",").forEach((brand) => {
      chips.push({
        label: brand,
        onRemove: () => {
          const remaining = filters.brand!.split(",").filter((b) => b !== brand)
          onFilterChange({
            ...filters,
            brand: remaining.length > 0 ? remaining.join(",") : undefined,
          })
        },
      })
    })
  }

  // Sub-category chips
  if (filters.sub_category) {
    filters.sub_category.split(",").forEach((sc) => {
      chips.push({
        label: sc,
        onRemove: () => {
          const remaining = filters.sub_category!.split(",").filter((s) => s !== sc)
          onFilterChange({
            ...filters,
            sub_category: remaining.length > 0 ? remaining.join(",") : undefined,
          })
        },
      })
    })
  }

  // Price chip
  if (filters.min_price !== undefined || filters.max_price !== undefined) {
    const min = filters.min_price !== undefined ? `₹${filters.min_price.toLocaleString()}` : "₹0"
    const max = filters.max_price !== undefined ? `₹${filters.max_price.toLocaleString()}` : "Any"
    chips.push({
      label: `${min} – ${max}`,
      onRemove: () =>
        onFilterChange({ ...filters, min_price: undefined, max_price: undefined }),
    })
  }

  // Rating chip
  if (filters.min_rating !== undefined) {
    chips.push({
      label: `${filters.min_rating}★ & above`,
      onRemove: () => onFilterChange({ ...filters, min_rating: undefined }),
    })
  }

  // Discount chip
  if (filters.min_discount !== undefined) {
    chips.push({
      label: `${filters.min_discount}%+ off`,
      onRemove: () => onFilterChange({ ...filters, min_discount: undefined }),
    })
  }

  // In stock chip
  if (filters.in_stock) {
    chips.push({
      label: "In Stock",
      onRemove: () => onFilterChange({ ...filters, in_stock: undefined }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-sm text-foreground transition-colors hover:bg-muted"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground hover:text-destructive"
        onClick={onClearAll}
      >
        Clear all
      </Button>
    </div>
  )
}
