"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { ReviewCard } from "@/components/product/ReviewCard"
import { RelatedProducts } from "@/components/product/RelatedProducts"
import { ShoppingCart, Zap, Truck, RotateCcw, ShieldCheck, AlertCircle } from "lucide-react"

interface ProductDetailProps {
  product: Product
  onAddToCart: (product_id: string, quantity: number) => void
}

type TabId = "reviews" | "specs"

export function ProductDetail({ product, onAddToCart }: ProductDetailProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<TabId>("reviews")

  const imageUrl = product.image_urls?.[selectedIndex] ?? "/placeholder.png"
  const savings = product.actual_price - product.price

  const handleBuyNow = () => {
    router.push(`/cart/checkout?buyNow=true&product_id=${product._id}&quantity=${quantity}`)
  }

  return (
    <div className="font-sans pb-16">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 px-4 py-3 text-xs text-muted-foreground sm:px-6">
        <span>Home</span>
        <span>›</span>
        <span>{product.category}</span>
        <span>›</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* ── Product Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-t border-border">

        {/* Left — Image Zone */}
        <div className="relative bg-muted border-b lg:border-b-0 lg:border-r border-border">
          <div className="relative flex items-center justify-center p-8 aspect-square max-h-[480px]">
            {product.discount_percent > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-foreground text-background text-[11px] font-medium tracking-wide uppercase px-3 py-1.5 rounded-sm">
                Save {product.discount_percent}%
              </span>
            )}
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-contain transition-opacity duration-300"
            />
          </div>

          {product.image_urls && product.image_urls.length > 1 && (
            <div className="flex gap-2 px-4 pb-4">
              {product.image_urls.map((src, index) => (
                <button
                  key={src + index}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`w-14 h-14 rounded-md overflow-hidden border transition-all shrink-0 ${
                    selectedIndex === index
                      ? "border-foreground ring-1 ring-foreground"
                      : "border-border opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Info Zone */}
        <div className="flex flex-col gap-6 p-6 sm:p-8 bg-background">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground border border-border px-3 py-1 rounded-sm">
              {product.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-amber-500 tracking-wider">{"★".repeat(Math.round(product.avg_rating))}</span>
              <span className="font-medium text-foreground">{product.avg_rating.toFixed(1)}</span>
              <span>({product.review_count} reviews)</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-foreground">
            {product.name}
          </h1>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="h-px bg-border" />

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              ₹{product.price.toLocaleString()}
            </span>
            {product.actual_price > product.price && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  ₹{product.actual_price.toLocaleString()}
                </span>
                <span className="text-[11px] font-medium bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 px-2.5 py-1 rounded-sm">
                  You save ₹{savings.toLocaleString()}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center bg-muted hover:bg-muted/80 text-foreground transition-colors text-lg"
                  >
                    −
                  </button>
                  <span className="w-10 h-9 flex items-center justify-center text-sm font-medium text-foreground border-x border-border">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-9 h-9 flex items-center justify-center bg-muted hover:bg-muted/80 text-foreground transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <AlertCircle className="size-3.5" />
                  {product.stock} left in stock
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-md text-sm font-medium border-foreground/20 hover:bg-muted"
                onClick={() => onAddToCart(product._id, quantity)}
              >
                <ShoppingCart className="size-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                className="h-12 rounded-md text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
                onClick={handleBuyNow}
              >
                <Zap className="size-4 mr-2" />
                Buy Now
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            {[
              { icon: <Truck className="size-3.5" />, label: "Free delivery" },
              { icon: <RotateCcw className="size-3.5" />, label: "30-day returns" },
              { icon: <ShieldCheck className="size-3.5" />, label: "1-yr warranty" },
            ].map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="text-orange-600">{icon}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reviews + Specs Tabs ── */}
      <div className="border-t border-border">
        <div className="flex px-4 sm:px-6 border-b border-border">
          {(["reviews", "specs"] as TabId[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 mr-6 text-xs font-medium uppercase tracking-widest border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "reviews" ? `Reviews (${product.review_count})` : "Specifications"}
            </button>
          ))}
        </div>

        <div className="px-4 py-6 sm:px-6">
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {product.recent_reviews?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.recent_reviews.map((review, index) => (
                    <ReviewCard key={review._id || index} review={review} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 py-14 text-center">
                  <span className="text-3xl mb-3">📝</span>
                  <h3 className="text-sm font-semibold text-foreground">No reviews yet</h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                    Be the first to share your thoughts about this product.
                  </p>
                </div>
              )}
              <div className="text-center pt-2">
                <Button variant="outline" size="sm" className="text-xs rounded-md">
                  View all {product.review_count} reviews →
                </Button>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Category", value: product.category },
                { label: "In Stock", value: `${product.stock} units` },
                { label: "Rating", value: `${product.avg_rating.toFixed(1)} / 5` },
                { label: "Reviews", value: product.review_count },
                { label: "Discount", value: product.discount_percent > 0 ? `${product.discount_percent}%` : "None" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted rounded-md px-4 py-3 border border-border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Related Products — always visible ── */}
      <div className="border-t border-border px-4 py-10 sm:px-6">
        <RelatedProducts category={product.category} currentProductId={product._id} />
      </div>

    </div>
  )
}