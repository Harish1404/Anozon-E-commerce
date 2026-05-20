"use client"

import { use, useEffect, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useProducts } from "@/hooks/useProducts"
import { useProductFacets } from "@/hooks/useProductFacets"
import { useAddToCart } from "@/hooks/useCart"
import { ProductGrid } from "@/components/product/ProductGrid"
import { FilterSidebar, type FilterState } from "@/components/product/FilterSidebar"
import { ActiveFilters } from "@/components/product/ActiveFilters"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SlidersHorizontal, ChevronRight, Home } from "lucide-react"

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = use(params)
  const decodedCategory = decodeURIComponent(category)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    document.title = `${decodedCategory} - Anozon`
  }, [decodedCategory])

  // Read filters from URL search params
  const filters: FilterState = useMemo(
    () => ({
      brand: searchParams.get("brand") || undefined,
      sub_category: searchParams.get("sub_category") || undefined,
      min_price: searchParams.get("min_price")
        ? Number(searchParams.get("min_price"))
        : undefined,
      max_price: searchParams.get("max_price")
        ? Number(searchParams.get("max_price"))
        : undefined,
      min_rating: searchParams.get("min_rating")
        ? Number(searchParams.get("min_rating"))
        : undefined,
      min_discount: searchParams.get("min_discount")
        ? Number(searchParams.get("min_discount"))
        : undefined,
      in_stock: searchParams.get("in_stock") === "true" ? true : undefined,
    }),
    [searchParams]
  )

  const sortBy = searchParams.get("sort_by") || "created_at"
  const sortOrder = Number(searchParams.get("sort_order") || "-1") as -1 | 1
  const page = Number(searchParams.get("page") || "1")

  // Update URL when filters change
  const updateFilters = useCallback(
    (newFilters: typeof filters) => {
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, String(value))
        }
      })
      if (sortBy !== "created_at") params.set("sort_by", sortBy)
      if (sortOrder !== -1) params.set("sort_order", String(sortOrder))
      router.push(
        `/categories/${encodeURIComponent(decodedCategory)}?${params.toString()}`,
        { scroll: false }
      )
    },
    [router, decodedCategory, sortBy, sortOrder]
  )

  const clearAllFilters = useCallback(() => {
    router.push(`/categories/${encodeURIComponent(decodedCategory)}`, {
      scroll: false,
    })
  }, [router, decodedCategory])

  const updateSort = useCallback(
    (value: string | null) => {
      if (!value) return
      const params = new URLSearchParams(searchParams.toString())
      const [field, order] = value.split(":")
      params.set("sort_by", field)
      params.set("sort_order", order)
      params.delete("page")
      router.push(
        `/categories/${encodeURIComponent(decodedCategory)}?${params.toString()}`,
        { scroll: false }
      )
    },
    [router, searchParams, decodedCategory]
  )

  const updatePage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", String(newPage))
      router.push(
        `/categories/${encodeURIComponent(decodedCategory)}?${params.toString()}`,
        { scroll: false }
      )
    },
    [router, searchParams, decodedCategory]
  )

  // Queries
  const productsQuery = useProducts({
    category: decodedCategory,
    ...filters,
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    limit: 12,
  })

  const facetsQuery = useProductFacets({
    category: decodedCategory,
    ...filters,
  })

  const addToCart = useAddToCart()
  const totalPages = productsQuery.data?.pages ?? 1

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined)

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link
            href="/"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Home className="size-3.5" /> Home
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-foreground">{decodedCategory}</span>
        </nav>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="mb-4">
            <ActiveFilters
              filters={filters}
              onFilterChange={updateFilters}
              onClearAll={clearAllFilters}
            />
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-foreground">Filters</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    onClick={clearAllFilters}
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <FilterSidebar
                facets={facetsQuery.data}
                isLoading={facetsQuery.isLoading}
                filters={filters}
                onFilterChange={updateFilters}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <Sheet>
                  <SheetTrigger
                    render={
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <SlidersHorizontal className="size-4 mr-2" /> Filters
                      </Button>
                    }
                  />
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <FilterSidebar
                        facets={facetsQuery.data}
                        isLoading={facetsQuery.isLoading}
                        filters={filters}
                        onFilterChange={updateFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  {productsQuery.isLoading ? (
                    <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
                  ) : (
                    <>{productsQuery.data?.total ?? 0} results</>
                  )}
                </p>
              </div>

              {/* Sort */}
              <Select
                value={`${sortBy}:${sortOrder}`}
                onValueChange={updateSort}
              >
                <SelectTrigger className="w-48 h-9 text-sm">
                  <SelectValue>
                    {
                      (
                        {
                          "created_at:-1": "Newest first",
                          "price:1": "Price: Low to High",
                          "price:-1": "Price: High to Low",
                          "avg_rating:-1": "Top Rated",
                          "discount_percent:-1": "Biggest Discount",
                        } as Record<string, string>
                      )[`${sortBy}:${sortOrder}`] || "Sort by"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at:-1">Newest first</SelectItem>
                  <SelectItem value="price:1">Price: Low to High</SelectItem>
                  <SelectItem value="price:-1">Price: High to Low</SelectItem>
                  <SelectItem value="avg_rating:-1">Top Rated</SelectItem>
                  <SelectItem value="discount_percent:-1">
                    Biggest Discount
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Grid */}
            {productsQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-2 xs:gap-3.5 sm:gap-6 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 sm:h-80 rounded-xl sm:rounded-2xl border border-border bg-card animate-pulse"
                  />
                ))}
              </div>
            ) : productsQuery.isError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-destructive">
                Unable to load products. Please try again.
              </div>
            ) : productsQuery.data?.items.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <p className="text-lg font-medium text-foreground">
                  No products found
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={clearAllFilters}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <ProductGrid
                products={productsQuery.data?.items ?? []}
                onAddToCart={(product_id) =>
                  addToCart.mutate({ product_id, quantity: 1 })
                }
              />
            )}

            {/* Pagination */}
            {(productsQuery.data?.pages ?? 0) > 1 && (
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {productsQuery.data?.items.length ?? 0} of{" "}
                  {productsQuery.data?.total ?? 0} products
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1 || productsQuery.isLoading}
                    onClick={() => updatePage(Math.max(1, page - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-foreground">
                    Page {page} / {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages || productsQuery.isLoading}
                    onClick={() => updatePage(Math.min(totalPages, page + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
