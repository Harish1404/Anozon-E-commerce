"use client"

import Link from "next/link"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useIsWishlisted, useToggleWishlist } from "@/hooks/useWishlist"
import { cn, formatCompactNumber } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  onAddToCart: (product_id: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const imageUrl = product.image_urls?.[0] ?? "/placeholder.png"
  const discountLabel = product.discount_percent > 0 ? `${product.discount_percent}% OFF` : null
  const isWishlisted = useIsWishlisted(product._id)
  const toggleWishlist = useToggleWishlist()

  return (
    <div className="card group relative rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden">
      {/* Featured Offer badge */}
      {product.is_featured && (
        <span className="absolute top-3 left-3 z-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md select-none animate-pulse">
          ★ Featured Offer
        </span>
      )}

      {/* Heart button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleWishlist.mutate(product._id)
        }}
        disabled={toggleWishlist.isPending}
        className={cn(
          "absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200",
          isWishlisted
            ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
            : "bg-background/70 text-muted-foreground hover:bg-background hover:text-destructive"
        )}
        aria-label={isWishlisted ? "Remove from favourites" : "Add to favourites"}
      >
        <Heart
          className={cn(
            "size-4 transition-all duration-200",
            isWishlisted && "fill-current scale-110"
          )}
        />
      </button>



      <Link href={`/products/${product._id}`} className="block overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`/products/${product._id}`}
              className="block truncate text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              {product.name}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              <span className="text-xs text-muted-foreground">{product.category}</span>
              {product.brand && product.brand !== "Generic" && (
                <>
                  <span className="text-[10px] text-muted-foreground/60">•</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted/80">
                    {product.brand}
                  </span>
                </>
              )}
            </div>
          </div>
          {discountLabel && (
            <span className="shrink-0 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-semibold">
              {discountLabel}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-base font-bold text-foreground">₹{product.price.toLocaleString()}</span>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {product.product_likes > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="size-3 fill-destructive text-destructive" />
                {formatCompactNumber(product.product_likes)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="text-amber-500 text-sm">★</span>
              {product.avg_rating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 h-9 text-xs font-medium rounded-lg"
            onClick={() => onAddToCart(product._id)}
          >
            Add to cart
          </Button>
          <Link
            href={`/products/${product._id}`}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  )
}
