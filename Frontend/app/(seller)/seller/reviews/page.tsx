"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { sellerService } from "@/services/seller"
import { useSellerProducts } from "@/hooks/useSellerProducts"
import { SellerProductReviewsResponse, Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Star, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  MessageSquare, ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Search, ArrowUpDown } from "lucide-react"

export default function SellerReviewsPage() {
  useEffect(() => {
    document.title = "Reviews — Anozon Seller"
  }, [])

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("newest")
  const LIMIT = 10

  const { data: productsData, isLoading: productsLoading } = useSellerProducts({ limit: 100 })
  const allProducts = productsData?.items ?? []

  // Client-side filtering and sorting for products
  const filteredProducts = allProducts.filter((p) => {
    return search === "" || p.name.toLowerCase().includes(search.toLowerCase())
  }).sort((a, b) => {
    if (sort === "rating_desc") return b.avg_rating - a.avg_rating
    if (sort === "rating_asc") return a.avg_rating - b.avg_rating
    if (sort === "reviews_desc") return b.review_count - a.review_count
    if (sort === "reviews_asc") return a.review_count - b.review_count
    // default: newest first based on created_at
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / LIMIT))
  const paginatedProducts = filteredProducts.slice((page - 1) * LIMIT, page * LIMIT)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Product Reviews</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            See what customers are saying about your products
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={sort} onValueChange={(val) => { if (val) { setSort(val); setPage(1); } }}>
              <SelectTrigger className="h-9 w-[160px] text-sm">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating_desc">Highest Rating</SelectItem>
                <SelectItem value="rating_asc">Lowest Rating</SelectItem>
                <SelectItem value="reviews_desc">Most Reviews</SelectItem>
                <SelectItem value="reviews_asc">Least Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product accordion list */}
        {productsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16">
            <MessageSquare className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedProducts.map((product) => (
              <ProductReviewPanel key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-xl border-border hover:bg-muted transition-colors"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-xl border-border hover:bg-muted transition-colors"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Collapsible Product Review Panel ─── */
function ProductReviewPanel({ product }: { product: Product }) {
  const [expanded, setExpanded] = useState(false)
  const [page, setPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const LIMIT = 5

  const { data, isLoading } = useQuery<SellerProductReviewsResponse>({
    queryKey: ["seller-product-reviews", product._id, page, LIMIT],
    queryFn: () => sellerService.getProductReviews(product._id, { page, limit: LIMIT }).then((res) => res.data),
    enabled: expanded,
    staleTime: 60 * 1000,
  })

  const reviews = data?.reviews ?? []
  const filteredReviews = ratingFilter === "all"
    ? reviews
    : reviews.filter((r) => r.rating === parseInt(ratingFilter))
  const totalPages = data ? Math.max(1, Math.ceil(data.review_count / LIMIT)) : 1

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all">
      {/* Collapsed header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        {product.image_urls?.[0] ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="h-10 w-10 rounded-lg object-cover bg-muted shrink-0"
          />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3 fill-amber-500 text-amber-500" />
              {product.avg_rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({product.review_count} {product.review_count === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="size-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">

          {/* Filter bar */}
          <div className="flex items-center justify-between gap-3">
            <Select value={ratingFilter} onValueChange={(val) => val && setRatingFilter(val)}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            {data && (
              <p className="text-xs text-muted-foreground">
                Avg: <span className="font-semibold text-foreground">{data.avg_rating.toFixed(1)}</span>
                {" · "}
                {data.review_count} total
              </p>
            )}
          </div>

          {/* Reviews */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No reviews match this filter.</p>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-xl border border-border bg-background p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 text-xs tracking-wider">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                      <span className="text-sm font-medium text-foreground">{review.reviewer_name}</span>
                      {review.is_verified_purchase && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-primary font-medium">
                          <ShieldCheck className="size-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="h-8 w-8 rounded-full"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <span className="text-sm font-medium text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="h-8 w-8 rounded-full"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
