"use client"

import Link from "next/link"
import { CategoryGroup } from "@/types"
import { ArrowRight, Grid3X3 } from "lucide-react"

interface CategoryRowProps {
  categories: CategoryGroup[]
}

export function CategoryRow({ categories }: CategoryRowProps) {
  if (!categories.length) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid3X3 className="size-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Shop by Category</h2>
        </div>
      </div>

      <div
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((cat) => (
          <Link
            key={cat.category}
            href={`/categories/${encodeURIComponent(cat.category)}`}
            className="group flex-shrink-0 snap-start"
          >
            <div className="relative w-36 md:w-44 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="aspect-square w-full overflow-hidden bg-muted">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.category}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <Grid3X3 className="size-10 text-primary/40" />
                  </div>
                )}
              </div>

              <div className="p-3">
                <p className="truncate text-sm font-semibold text-foreground">{cat.category}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {cat.product_count} {cat.product_count === 1 ? "product" : "products"}
                </p>
              </div>

              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowRight className="size-3 text-primary" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
