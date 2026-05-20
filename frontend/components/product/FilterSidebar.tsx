"use client"

import { useState } from "react"
import { ProductFacets } from "@/types"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export interface FilterState {
  brand?: string
  sub_category?: string
  min_price?: number
  max_price?: number
  min_rating?: number
  min_discount?: number
  in_stock?: boolean
}

interface FilterSidebarProps {
  facets: ProductFacets | undefined
  isLoading: boolean
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

function toggleValue(current: string | undefined, value: string): string | undefined {
  if (!current) return value
  const values = current.split(",")
  if (values.includes(value)) {
    const filtered = values.filter((v) => v !== value)
    return filtered.length > 0 ? filtered.join(",") : undefined
  }
  return [...values, value].join(",")
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        {title}
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {open && <div className="mt-3 space-y-1.5">{children}</div>}
    </div>
  )
}

export function FilterSidebar({ facets, isLoading, filters, onFilterChange }: FilterSidebarProps) {
  const [priceMin, setPriceMin] = useState(filters.min_price?.toString() ?? "")
  const [priceMax, setPriceMax] = useState(filters.max_price?.toString() ?? "")

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  const selectedBrands = filters.brand?.split(",") ?? []
  const selectedSubCats = filters.sub_category?.split(",") ?? []

  return (
    <div className="divide-y divide-border">
      {/* Sub-categories */}
      {facets && facets.sub_categories.length > 0 && (
        <FilterSection title="Sub-category">
          {facets.sub_categories.map((sc) => (
            <label
              key={sc.value}
              className="flex items-center gap-2 cursor-pointer rounded-md px-1 py-1 hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                className="rounded border-border accent-primary"
                checked={selectedSubCats.includes(sc.value)}
                onChange={() =>
                  onFilterChange({
                    ...filters,
                    sub_category: toggleValue(filters.sub_category, sc.value),
                  })
                }
              />
              <span className="text-sm text-foreground flex-1 truncate">{sc.value}</span>
              <span className="text-xs text-muted-foreground">({sc.count})</span>
            </label>
          ))}
        </FilterSection>
      )}

      {/* Brands */}
      {facets && facets.brands.length > 0 && (
        <FilterSection title="Brand">
          {facets.brands.map((b) => (
            <label
              key={b.value}
              className="flex items-center gap-2 cursor-pointer rounded-md px-1 py-1 hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                className="rounded border-border accent-primary"
                checked={selectedBrands.includes(b.value)}
                onChange={() =>
                  onFilterChange({
                    ...filters,
                    brand: toggleValue(filters.brand, b.value),
                  })
                }
              />
              <span className="text-sm text-foreground flex-1 truncate">{b.value}</span>
              <span className="text-xs text-muted-foreground">({b.count})</span>
            </label>
          ))}
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={facets ? `₹${facets.price_range.min}` : "Min"}
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="h-8 text-sm"
          />
          <span className="text-muted-foreground text-xs">to</span>
          <Input
            type="number"
            placeholder={facets ? `₹${facets.price_range.max}` : "Max"}
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="h-8 text-sm"
          />
          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() =>
              onFilterChange({
                ...filters,
                min_price: priceMin ? Number(priceMin) : undefined,
                max_price: priceMax ? Number(priceMax) : undefined,
              })
            }
          >
            Go
          </Button>
        </div>
      </FilterSection>

      {/* Customer Rating */}
      <FilterSection title="Customer Rating">
        {[4, 3, 2, 1].map((rating) => {
          const bucket = facets?.rating_distribution.find((r) => r._id === rating)
          const count = bucket?.count ?? 0
          const isSelected = filters.min_rating === rating
          return (
            <label
              key={rating}
              className={cn(
                "flex items-center gap-2 cursor-pointer rounded-md px-1 py-1 hover:bg-muted/50 transition-colors",
                isSelected && "bg-primary/5"
              )}
            >
              <input
                type="radio"
                name="rating"
                className="accent-primary"
                checked={isSelected}
                onChange={() =>
                  onFilterChange({
                    ...filters,
                    min_rating: isSelected ? undefined : rating,
                  })
                }
              />
              <span className="flex items-center gap-1 text-sm text-foreground">
                <span className="text-amber-500">{"★".repeat(rating)}</span>
                <span className="text-muted-foreground/40">{"★".repeat(5 - rating)}</span>
                <span>& above</span>
              </span>
              <span className="text-xs text-muted-foreground ml-auto">({count})</span>
            </label>
          )
        })}
      </FilterSection>

      {/* Discount */}
      <FilterSection title="Discount">
        {[10, 25, 50].map((disc) => {
          const isSelected = filters.min_discount === disc
          return (
            <label
              key={disc}
              className={cn(
                "flex items-center gap-2 cursor-pointer rounded-md px-1 py-1 hover:bg-muted/50 transition-colors",
                isSelected && "bg-primary/5"
              )}
            >
              <input
                type="radio"
                name="discount"
                className="accent-primary"
                checked={isSelected}
                onChange={() =>
                  onFilterChange({
                    ...filters,
                    min_discount: isSelected ? undefined : disc,
                  })
                }
              />
              <span className="text-sm text-foreground">{disc}% or more</span>
            </label>
          )
        })}
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <label className="flex items-center gap-2 cursor-pointer rounded-md px-1 py-1 hover:bg-muted/50 transition-colors">
          <input
            type="checkbox"
            className="rounded border-border accent-primary"
            checked={filters.in_stock === true}
            onChange={() =>
              onFilterChange({
                ...filters,
                in_stock: filters.in_stock ? undefined : true,
              })
            }
          />
          <span className="text-sm text-foreground">In Stock Only</span>
        </label>
      </FilterSection>
    </div>
  )
}
