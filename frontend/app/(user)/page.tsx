"use client"

import { useEffect } from "react"
import { useLanding } from "@/hooks/useLanding"
import { HeroBannerCarousel } from "@/components/landing/HeroBannerCarousel"
import { CategoryRow } from "@/components/landing/CategoryRow"
import { ProductSection } from "@/components/landing/ProductSection"
import { Zap, TrendingUp, Sparkles, Award } from "lucide-react"

export default function HomePage() {
  useEffect(() => {
    document.title = "Anozon - Home"
  }, [])

  const { data: landing, isLoading, isError } = useLanding()

  if (isError) {
    return (
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-8 text-destructive">
            Unable to load the store. Please try again later.
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-10">
        {/* Hero Banner */}
        {isLoading ? (
          <div className="aspect-[2.5/1] md:aspect-[3/1] w-full animate-pulse rounded-2xl bg-muted" />
        ) : (
          <HeroBannerCarousel banners={landing?.banners ?? []} />
        )}

        {/* Categories */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-6 w-48 animate-pulse rounded bg-muted" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-52 w-36 md:w-44 flex-shrink-0 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          </div>
        ) : (
          <CategoryRow categories={landing?.categories ?? []} />
        )}

        {/* Flash Deals */}
        {isLoading ? (
          <SectionSkeleton />
        ) : (
          <ProductSection
            title="Flash Deals"
            icon={<Zap className="size-5 text-amber-500" />}
            items={landing?.flash_deals ?? []}
            layout="scroll"
          />
        )}

        {/* Top Rated */}
        {isLoading ? (
          <SectionSkeleton />
        ) : (
          <ProductSection
            title="Top Rated"
            icon={<TrendingUp className="size-5 text-emerald-500" />}
            items={landing?.top_products ?? []}
            layout="scroll"
          />
        )}

        {/* New Arrivals */}
        {isLoading ? (
          <SectionSkeleton />
        ) : (
          <ProductSection
            title="New Arrivals"
            icon={<Sparkles className="size-5 text-blue-500" />}
            items={landing?.new_arrivals ?? []}
            layout="scroll"
          />
        )}

        {/* Featured */}
        {isLoading ? (
          <SectionSkeleton count={8} />
        ) : (
          <ProductSection
            title="Featured"
            icon={<Award className="size-5 text-purple-500" />}
            items={landing?.featured ?? []}
            layout="grid"
          />
        )}
      </section>
    </main>
  )
}

function SectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-72 w-56 md:w-64 flex-shrink-0 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  )
}
