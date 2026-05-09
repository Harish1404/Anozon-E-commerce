"use client"

import Link from "next/link"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  product: Product
  onAddToCart: (product_id: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const imageUrl = product.image_urls?.[0] ?? "/placeholder.png"
  const discountLabel = product.discount_percent > 0 ? `${product.discount_percent}% OFF` : null

  return (
    <div className="card rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Link href={`/products/${product._id}`} className="block overflow-hidden rounded-t-3xl">
        <img src={imageUrl} alt={product.name} className="h-48 w-full object-cover" />
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Link href={`/products/${product._id}`} className="text-lg font-semibold text-foreground hover:text-primary">
              {product.name}
            </Link>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
          {discountLabel && (
            <span className="rounded-full bg-success text-success-foreground px-3 py-1 text-xs font-semibold">
              {discountLabel}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">₹{product.price}</span>
          <span>{product.avg_rating.toFixed(1)} ★</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button size="sm" onClick={() => onAddToCart(product._id)}>
            Add to cart
          </Button>
          <Link href={`/products/${product._id}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            View
          </Link>
        </div>
      </div>
    </div>
  )
}
