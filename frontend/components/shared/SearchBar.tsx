"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Flame, Sparkles, ShoppingBag, ArrowRight } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"
import { useDebounce } from "@/hooks/useDebounce"

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  // Fetch search results using our debounced query
  const { data: searchResults, isLoading } = useProducts({
    search: debouncedQuery,
    limit: 6,
  })

  // Fetch trending products for empty query state
  const { data: trendingProducts } = useProducts({
    limit: 4,
  })

  // Popular categories for quick autocomplete
  const popularCategories = [
    "Electronics",
    "Fashion",
    "Books",
    "Home",
    "Beauty",
  ]

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Keyboard support: Escape to close dropdown, Ctrl+K or Cmd+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
        inputRef.current?.blur()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleCategoryClick = (category: string) => {
    setQuery(category)
    inputRef.current?.focus()
    setIsOpen(true)
  }

  const handleProductClick = (productId: string) => {
    setIsOpen(false)
    setQuery("")
    router.push(`/products/${productId}`)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 size-4 text-muted-foreground/80" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          placeholder="Search products..."
          className="w-full h-10 pl-10 pr-10 rounded-full border border-border bg-muted/40 hover:bg-muted/60 focus:bg-background text-sm text-foreground placeholder:text-muted-foreground/75 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            className="absolute right-3.5 p-0.5 rounded-full hover:bg-muted text-muted-foreground/80 hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
        {!query && (
          <kbd className="pointer-events-none absolute right-3 hidden.md:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/80 bg-card px-1.5 font-mono text-[9px] font-medium text-muted-foreground/80 shadow-xs hidden md:flex">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[420px] overflow-y-auto rounded-2xl border border-border bg-card/98 backdrop-blur-xl shadow-2xl p-3 flex flex-col gap-3 scale-in-95 animate-in duration-100 ease-out origin-top">
          {isLoading && query ? (
            // Loading Skeletons
            <div className="space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Searching items...</p>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3 p-2 rounded-xl border border-border/20 bg-muted/10 animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2 py-1.5">
                    <div className="h-3.5 bg-muted rounded w-3/4" />
                    <div className="h-2.5 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            // Live Search Results
            <div>
              <div className="flex items-center justify-between px-1 mb-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Products Found ({searchResults?.items.length ?? 0})
                </p>
              </div>

              {searchResults?.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <div className="bg-muted/50 p-3 rounded-full mb-2.5 text-muted-foreground">
                    <ShoppingBag className="size-6" />
                  </div>
                  <h5 className="font-semibold text-foreground text-sm mb-0.5">No products found</h5>
                  <p className="text-xs text-muted-foreground max-w-[240px]">
                    Try adjusting your search terms or checking for spelling errors.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults?.items.map((product) => {
                    const imageUrl = product.image_urls?.[0] ?? "/placeholder.png"
                    return (
                      <button
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className="w-full text-left flex gap-3 p-2 rounded-xl border border-border/30 hover:border-primary/20 hover:bg-muted/40 transition-all group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-background border border-border/40">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-muted-foreground capitalize">{product.category}</p>
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-xs font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <span className="text-amber-500 text-xs">★</span>
                              <span>{product.avg_rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center pr-0.5 text-muted-foreground group-hover:text-primary transition-colors">
                          <ArrowRight className="size-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            // Zero-Query Suggestions
            <div className="space-y-4">
              {/* Popular Categories */}
              <div>
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
                  <Sparkles className="size-3 text-primary" />
                  Popular Categories
                </h4>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {popularCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className="px-2.5 py-1 text-xs font-medium rounded-full border border-border bg-background hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Products */}
              {trendingProducts && trendingProducts.items.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
                    <Flame className="size-3 text-orange-500 fill-orange-500/10" />
                    Trending Now
                  </h4>
                  <div className="space-y-1">
                    {trendingProducts.items.map((product) => {
                      const imageUrl = product.image_urls?.[0] ?? "/placeholder.png"
                      return (
                        <button
                          key={product._id}
                          onClick={() => handleProductClick(product._id)}
                          className="w-full text-left flex gap-3 p-1.5 rounded-lg border border-border/30 hover:border-primary/20 hover:bg-muted/40 transition-all group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-background border border-border/40">
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                              <span className="text-[9px] text-muted-foreground capitalize">• {product.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center pr-1 text-muted-foreground group-hover:text-primary transition-colors">
                            <ArrowRight className="size-3 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
