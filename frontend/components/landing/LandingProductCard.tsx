"use client"

import Link from "next/link"
import { ProductCard as ProductCardType } from "@/types"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useIsWishlisted, useToggleWishlist } from "@/hooks/useWishlist"
import { useAddToCart } from "@/hooks/useCart"
import { cn } from "@/lib/utils"

interface LandingProductCardProps {
  product: ProductCardType
}

export function LandingProductCard({ product }: LandingProductCardProps) {
  const imageUrl = product.image_url ?? "/placeholder.png"
  const discountLabel = product.discount_percent > 0 ? `${product.discount_percent}% OFF` : null
  const isWishlisted = useIsWishlisted(product._id)
  const toggleWishlist = useToggleWishlist()
  const addToCart = useAddToCart()

  return (
    <div className="group relative rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden">
      {/* Featured badge */}
      {product.is_featured && (
        <span className="absolute top-3 left-3 z-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md select-none">
          ★ Featured
        </span>
      )}

      {/* Out of stock overlay */}
      {!product.in_stock && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <span className="rounded-full bg-destructive/90 px-4 py-1.5 text-xs font-bold text-white">Out of Stock</span>
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
          "absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200",
          isWishlisted
            ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
            : "bg-background/70 text-muted-foreground hover:bg-background hover:text-destructive"
        )}
        aria-label={isWishlisted ? "Remove from favourites" : "Add to favourites"}
      >
        <Heart className={cn("size-3.5 transition-all duration-200", isWishlisted && "fill-current scale-110")} />
      </button>

      {/* Image */}
      <Link href={`/products/${product._id}`} className="block overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/products/${product._id}`}
              className="block truncate text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              {product.name}
            </Link>
            <div className="mt-0.5 flex flex-wrap items-center gap-1">
              <span className="text-xs text-muted-foreground">{product.category}</span>
              {product.brand && product.brand !== "Generic" && (
                <>
                  <span className="text-[10px] text-muted-foreground/60">•</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {product.brand}
                  </span>
                </>
              )}
            </div>
          </div>
          {discountLabel && (
            <span className="shrink-0 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
              {discountLabel}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-foreground">₹{product.price.toLocaleString()}</span>
            {product.discount_percent > 0 && (
              <span className="text-xs text-muted-foreground line-through">₹{product.actual_price.toLocaleString()}</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-amber-500">★</span>
            {product.avg_rating.toFixed(1)}
          </span>
        </div>

        <Button
          size="sm"
          className="w-full h-8 text-xs font-medium rounded-lg"
          disabled={!product.in_stock}
          onClick={() => addToCart.mutate({ product_id: product._id, quantity: 1 })}
        >
          {product.in_stock ? "Add to cart" : "Out of stock"}
        </Button>
      </div>
    </div>
  )
}
