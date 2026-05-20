"use client"

import { Product } from "@/types"
import { ProductCard } from "@/components/product/ProductCard"

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product_id: string) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 xs:gap-3.5 sm:gap-6 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}
