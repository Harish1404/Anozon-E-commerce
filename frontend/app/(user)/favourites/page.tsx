"use client"

import { useState, useMemo, useEffect } from "react"
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist"
import { useAddToCart } from "@/hooks/useCart"
import { WishlistItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ShoppingBag, ShoppingCart, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type SortMode = "newest" | "price_asc" | "price_desc"

const PER_PAGE = 12

export default function FavouritesPage() {
  const { data: wishlist, isLoading, isError } = useWishlist()
  const toggleWishlist = useToggleWishlist()
  const addToCart = useAddToCart()

  const [sort, setSort] = useState<SortMode>("newest")
  const [page, setPage] = useState(1)

  useEffect(() => {
    document.title = "Anozon - Wishlist"
  }, [])

  // Sort
  const sorted = useMemo(() => {
    if (!wishlist) return []
    const copy = [...wishlist]
    switch (sort) {
      case "price_asc":
        return copy.sort((a, b) => a.price - b.price)
      case "price_desc":
        return copy.sort((a, b) => b.price - a.price)
      case "newest":
      default:
        return copy.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
    }
  }, [wishlist, sort])

  // Pagination (client-side)
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const currentItems = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Collection</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Your Wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">Products you&apos;ve saved for later</p>
      </div>

      {/* Sort + Count */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{wishlist?.length ?? 0}</span> items saved
        </p>
        <Select value={sort} onValueChange={(val) => { if (val) { setSort(val as SortMode); setPage(1) } }}>
          <SelectTrigger className="h-9 w-44 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low → High</SelectItem>
            <SelectItem value="price_desc">Price: High → Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl border border-border bg-muted animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center">
          <p className="text-sm font-medium text-destructive">Unable to load wishlist. Please try again later.</p>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/40 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
            <Heart className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">No wishlist items yet</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
            Browse products and tap the heart icon to save items you love.
          </p>
          <Link href="/">
            <Button className="mt-6 rounded-xl" size="sm">
              <ShoppingBag className="size-4 mr-2" />
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentItems.map((item) => (
              <WishlistCard
                key={item.product_id}
                item={item}
                onToggle={() => toggleWishlist.mutate(item.product_id)}
                onAddToCart={() => addToCart.mutate({ product_id: item.product_id, quantity: 1 })}
                isToggling={toggleWishlist.isPending}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="h-9 w-9 rounded-full"
              >
                <ChevronLeft className="size-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(p)}
                  className="h-9 w-9 rounded-full text-sm"
                >
                  {p}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="h-9 w-9 rounded-full"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ─── Wishlist Card ─── */
function WishlistCard({
  item,
  onToggle,
  onAddToCart,
  isToggling,
}: {
  item: WishlistItem
  onToggle: () => void
  onAddToCart: () => void
  isToggling: boolean
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">


      <Link href={`/products/${item.product_id}`} className="block overflow-hidden">
        <img
          src={item.image || "/placeholder.png"}
          alt={item.name}
          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="p-4 space-y-3">
        <Link
          href={`/products/${item.product_id}`}
          className="block truncate text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          {item.name}
        </Link>

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-foreground">₹{item.price.toLocaleString()}</span>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-10 shrink-0 text-destructive border-destructive/20 hover:text-destructive hover:bg-destructive/10 rounded-lg"
            onClick={(e) => {
              e.preventDefault()
              onToggle()
            }}
            disabled={isToggling}
            aria-label="Remove from wishlist"
            title="Remove from wishlist"
          >
            <Trash2 className="size-4" />
          </Button>
          <Button
            size="sm"
            className="flex-1 h-9 text-xs font-medium rounded-lg"
            onClick={onAddToCart}
          >
            <ShoppingCart className="size-3.5 mr-1.5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
