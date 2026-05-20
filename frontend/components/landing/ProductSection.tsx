"use client"

import Link from "next/link"
import { ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import { ProductCard as ProductCardType } from "@/types"
import { LandingProductCard } from "./LandingProductCard"

interface ProductSectionProps {
  title: string
  icon?: ReactNode
  items: ProductCardType[]
  layout?: "scroll" | "grid"
  viewAllHref?: string
}

export function ProductSection({ title, icon, items, layout = "scroll", viewAllHref }: ProductSectionProps) {
  if (!items.length) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      {layout === "scroll" ? (
        <div
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item) => (
            <div key={item._id} className="w-56 md:w-64 flex-shrink-0 snap-start">
              <LandingProductCard product={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <LandingProductCard key={item._id} product={item} />
          ))}
        </div>
      )}
    </section>
  )
}
