"use client"

import { Product } from "@/types"
import { ProductCard } from "@/components/product/ProductCard"

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product_id: string) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}
