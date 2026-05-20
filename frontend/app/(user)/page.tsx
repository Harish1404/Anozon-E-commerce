"use client"

import { useMemo, useState, useEffect } from "react"
import { useProducts } from "@/hooks/useProducts"
import { useAddToCart } from "@/hooks/useCart"
import { ProductGrid } from "@/components/product/ProductGrid"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [page, setPage] = useState(1)
  
  useEffect(() => {
    document.title = "Anozon - Home"
  }, [])

  const productsQuery = useProducts({ page, limit: 12 })
  const addToCart = useAddToCart()

  const totalPages = useMemo(() => {
    if (!productsQuery.data) return 1
    return Math.max(1, productsQuery.data.pages)
  }, [productsQuery.data])

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">Shop</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">Browse today's best offers</h1>
          </div>
        </div>

        {productsQuery.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-80 rounded-3xl border border-border bg-card p-4 shadow-sm animate-pulse" />
            ))}
          </div>
        ) : productsQuery.isError ? (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-8 text-destructive">
            Unable to load products. Please try again.
          </div>
        ) : (
          <ProductGrid
            products={productsQuery.data?.items ?? []}
            onAddToCart={(product_id) => addToCart.mutate({ product_id, quantity: 1 })}
          />
        )}

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {productsQuery.data?.items.length ?? 0} of {productsQuery.data?.total ?? 0} products
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1 || productsQuery.isLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-foreground">Page {page} / {totalPages}</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages || productsQuery.isLoading}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
