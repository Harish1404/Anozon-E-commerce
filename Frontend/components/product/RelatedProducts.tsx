"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"
import { useAddToCart } from "@/hooks/useCart"
import { RelatedProductCard } from "./RelatedProductCard"
import { Button } from "@/components/ui/button"

interface RelatedProductsProps {
  category: string
  currentProductId: string
}

const PRODUCTS_PER_PAGE = 6

export function RelatedProducts({ category, currentProductId }: RelatedProductsProps) {
  const [page, setPage] = useState(1)
  const addToCart = useAddToCart()

  const { data, isLoading } = useProducts({ category, limit: 25 })

  const relatedProducts = useMemo(() => {
    if (!data) return []
    return data.items.filter((p) => p._id !== currentProductId)
  }, [data, currentProductId])

  const totalPages = Math.ceil(relatedProducts.length / PRODUCTS_PER_PAGE)
  const paginatedProducts = relatedProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        {/* Desktop skeleton: 6 cols */}
        <div className="hidden sm:grid grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        {/* Mobile skeleton: 2 cols */}
        <div className="grid sm:hidden grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (relatedProducts.length === 0) return null

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
            You might also like
          </p>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Related products
          </h2>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 w-8 rounded-md"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 w-8 rounded-md"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 
        Grid layout:
        - Mobile  (<640px): 2 columns
        - Desktop (≥640px): 6 columns for compact Amazon-style look
      */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
        {paginatedProducts.map((product) => (
          <RelatedProductCard
            key={product._id}
            product={product}
            onAddToCart={(pid) => addToCart.mutate({ product_id: pid, quantity: 1 })}
          />
        ))}
      </div>

      {/* Mobile dot indicator */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1 sm:hidden">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-1.5 rounded-full transition-all ${
                page === i + 1
                  ? "w-4 bg-foreground"
                  : "w-1.5 bg-border"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}

    </div>
  )
}