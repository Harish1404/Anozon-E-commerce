"use client"

import Link from "next/link"
import { Product } from "@/types"
import { ShoppingCart, Eye, Star } from "lucide-react"

interface RelatedProductCardProps {
  product: Product
  onAddToCart: (product_id: string) => void
}

export function RelatedProductCard({ product, onAddToCart }: RelatedProductCardProps) {
  const imageUrl = product.image_urls?.[0] ?? "/placeholder.png"

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-background border border-border hover:border-foreground/30 transition-colors duration-200">

      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link href={`/products/${product._id}`} className="block h-full w-full">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Badges — top left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount_percent > 0 && (
            <span className="text-[10px] font-medium bg-orange-800 text-orange-200 px-2 py-0.5 rounded-sm tracking-wide">
              -{product.discount_percent}%
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] font-medium bg-background text-foreground border border-border px-1.5 py-0.5 rounded-sm">
            <Star className="size-2.5 fill-amber-400 text-amber-400" />
            {product.avg_rating.toFixed(1)}
          </span>
        </div>

        {/* Quick actions — bottom right, visible on hover (always visible on mobile) */}
        <div className="absolute bottom-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 sm:opacity-0 transition-opacity duration-200 [.mobile_&]:opacity-100">
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart(product._id) }}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-background border border-border text-foreground hover:bg-muted transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart className="size-3.5" />
          </button>
          <Link
            href={`/products/${product._id}`}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-background border border-border text-foreground hover:bg-muted transition-colors"
            aria-label="View product"
          >
            <Eye className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1 p-2 flex-1">
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
          {product.category}
        </span>

        <Link
          href={`/products/${product._id}`}
          className="text-[11px] font-medium text-foreground hover:text-foreground/70 transition-colors truncate leading-tight"
        >
          {product.name}
        </Link>

        <div className="flex items-baseline gap-1 flex-wrap mt-auto pt-0.5">
          <span className="text-xs font-semibold text-foreground">
            ₹{product.price.toLocaleString()}
          </span>
          {product.actual_price > product.price && (
            <span className="text-[10px] text-muted-foreground line-through">
              ₹{product.actual_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to cart — always visible, compact */}
        <button
          onClick={() => onAddToCart(product._id)}
          className="mt-1 w-full flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors active:scale-[0.98]"
        >
          <ShoppingCart className="size-2.5" />
          Add to cart
        </button>
      </div>
    </div>
  )
}