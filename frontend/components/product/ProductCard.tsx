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
    <div className="card group relative rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden flex flex-col h-full">
      {/* Featured Offer badge */}
      {product.is_featured && (
        <span className="absolute top-2 left-2 z-10 rounded bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold text-white shadow-md select-none animate-pulse">
          ★ Featured
        </span>
      )}

      {/* Out of stock overlay */}
      {product.stock <= 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <span className="rounded-full bg-destructive/90 px-3 py-1 text-[10px] sm:text-xs font-bold text-white shadow-md">
            Out of Stock
          </span>
        </div>
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
          "absolute top-2 right-2 z-10 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-md transition-all duration-200 shadow-sm",
          isWishlisted
            ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
            : "text-muted-foreground hover:bg-background hover:text-destructive"
        )}
        aria-label={isWishlisted ? "Remove from favourites" : "Add to favourites"}
      >
        <Heart
          className={cn(
            "size-3 sm:size-4 transition-all duration-200",
            isWishlisted && "fill-current scale-110"
          )}
        />
      </button>

      <Link href={`/products/${product._id}`} className="block overflow-hidden relative aspect-[4/3] xs:aspect-square sm:aspect-auto sm:h-48 w-full">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex-1 flex flex-col justify-between p-2.5 sm:p-4 gap-1.5 sm:gap-2.5">
        <div className="space-y-1 sm:space-y-2">
          <div className="min-w-0">
            <Link
              href={`/products/${product._id}`}
              className="block text-[11px] sm:text-sm font-semibold text-foreground hover:text-primary transition-colors leading-tight line-clamp-2 h-7 sm:h-10"
            >
              {product.name}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-[9px] sm:text-xs text-muted-foreground leading-none">
              <span>{product.category}</span>
              {product.brand && product.brand !== "Generic" && (
                <>
                  <span>•</span>
                  <span className="font-medium text-foreground/70">{product.brand}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1 flex-wrap leading-none">
              <span className="text-xs sm:text-base font-bold text-foreground">₹{product.price.toLocaleString()}</span>
              {product.discount_percent > 0 && (
                <span className="text-[9px] sm:text-[10px] text-primary font-bold">
                  -{product.discount_percent}%
                </span>
              )}
            </div>
            {product.discount_percent > 0 && (
              <div className="text-[8px] sm:text-[10px] text-muted-foreground leading-none">
                M.R.P.: <span className="line-through">₹{product.actual_price.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-1.5 text-[9px] sm:text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5 text-amber-500">
              ★ <span className="font-semibold text-foreground/80">{product.avg_rating.toFixed(1)}</span>
            </span>
            {product.review_count > 0 && (
              <span>({formatCompactNumber(product.review_count)})</span>
            )}
            {product.product_likes > 0 && (
              <span className="flex items-center gap-0.5 ml-auto">
                <Heart className="size-2.5 fill-destructive text-destructive" />
                {formatCompactNumber(product.product_likes)}
              </span>
            )}
          </div>

          <div className="pt-0.5">
            <Button
              size="sm"
              className="w-full h-7 sm:h-9 text-[10px] sm:text-xs font-semibold rounded-md shadow-sm transition-all duration-200"
              disabled={product.stock <= 0}
              onClick={() => onAddToCart(product._id)}
            >
              {product.stock > 0 ? "Add to cart" : "Out of stock"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
