"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { ReviewCard } from "@/components/product/ReviewCard"

interface ProductDetailProps {
  product: Product
  onAddToCart: (product_id: string, quantity: number) => void
}

export function ProductDetail({ product, onAddToCart }: ProductDetailProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const imageUrl = product.image_urls?.[selectedIndex] ?? "/placeholder.png"

  const handleBuyNow = () => {
    router.push(`/cart/checkout?buyNow=true&product_id=${product._id}&quantity=${quantity}`)
  }

  return (
    <div className="space-y-12 pb-16">
      {/* Premium Glassmorphic Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-slate-100 p-1 shadow-[inset_0_1px_4px_rgba(255,255,255,0.6),0_10px_40px_-10px_rgba(0,0,0,0.05)]">
        <div className="absolute -right-64 -top-64 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-64 -left-64 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />
        
        <div className="relative rounded-[2.25rem] bg-white/60 p-6 backdrop-blur-xl sm:p-10 lg:p-12">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] items-center">
            
            {/* Image Gallery */}
            <div className="flex flex-col gap-6">
              <div className="group relative aspect-square overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-900/5 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10">
                <img 
                  src={imageUrl} 
                  alt={product.name} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                {product.discount_percent > 0 && (
                  <div className="absolute left-6 top-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-blue-500/30">
                    SAVE {product.discount_percent}%
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 px-2">
                {product.image_urls?.map((src, index) => (
                  <button
                    key={src + index}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`relative h-24 w-24 overflow-hidden rounded-2xl transition-all duration-300 ${
                      selectedIndex === index 
                        ? "ring-2 ring-primary ring-offset-2 scale-105 shadow-md" 
                        : "opacity-70 hover:opacity-100 ring-1 ring-slate-200 hover:scale-105"
                    }`}
                  >
                    <img src={src} alt={`${product.name} preview ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium tracking-wide text-slate-600">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 ring-1 ring-amber-500/20">
                    <span className="text-amber-500">★</span> {product.avg_rating.toFixed(1)} <span className="text-amber-700/50 font-normal">({product.review_count} reviews)</span>
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl/tight">
                  {product.name}
                </h1>
                
                <p className="text-lg leading-relaxed text-slate-600 max-w-2xl">
                  {product.description}
                </p>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-slate-200 to-transparent" />

              <div className="flex flex-wrap items-end gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Price</p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">₹{product.price}</p>
                    {product.actual_price > product.price && (
                      <p className="text-xl font-medium text-slate-400 line-through decoration-slate-300 decoration-2">₹{product.actual_price}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-widest pl-2">Quantity</p>
                  <div className="flex h-14 items-center gap-3 rounded-full bg-white px-3 shadow-sm ring-1 ring-slate-200 transition-all hover:ring-slate-300">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-95"
                    >
                      <span className="text-lg font-medium leading-none">-</span>
                    </button>
                    <span className="w-8 text-center text-lg font-semibold text-slate-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-95"
                    >
                      <span className="text-lg font-medium leading-none">+</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 pl-4">{product.stock} items left in stock</p>
                </div>

                <div className="flex flex-col gap-3 pt-7">
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="h-14 rounded-full border-2 border-slate-200 text-base font-semibold shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                      onClick={() => onAddToCart(product._id, quantity)}
                    >
                      Add to Cart
                    </Button>
                    <Button 
                      size="lg" 
                      className="h-14 rounded-full bg-slate-900 text-base font-semibold shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-900/30"
                      onClick={handleBuyNow}
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mx-auto max-w-5xl space-y-8 pt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Customer Reviews</h2>
          <span className="text-sm font-medium text-primary hover:underline cursor-pointer">View all {product.review_count} reviews →</span>
        </div>
        
        {product.recent_reviews?.length ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {product.recent_reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center shadow-sm">
            <div className="mb-4 rounded-full bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No reviews yet</h3>
            <p className="mt-2 text-slate-500 max-w-sm">Be the first to share your thoughts about this product with other customers.</p>
          </div>
        )}
      </div>
    </div>
  )
}
