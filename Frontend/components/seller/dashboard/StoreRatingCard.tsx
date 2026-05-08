"use client"

import { Star } from "lucide-react"

interface StoreRatingCardProps {
  avg_rating: number
  total_reviews: number
}

export function StoreRatingCard({ avg_rating, total_reviews }: StoreRatingCardProps) {
  const rating = Math.min(Math.max(avg_rating, 0), 5)
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm h-full flex flex-col">
      <h3 className="text-sm font-semibold text-slate-800">Store Rating</h3>
      <p className="text-xs text-slate-500 mt-0.5">Based on customer reviews</p>

      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
        {/* Big rating number */}
        <div className="text-5xl font-bold text-amber-500 leading-none">
          {avg_rating > 0 ? avg_rating.toFixed(1) : "—"}
        </div>

        {/* Star row */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => {
            const filled = i < fullStars
            const half = !filled && i === fullStars && hasHalf
            return (
              <Star
                key={i}
                className={`size-5 ${
                  filled
                    ? "fill-amber-400 text-amber-400"
                    : half
                    ? "fill-amber-200 text-amber-400"
                    : "fill-slate-100 text-slate-300"
                }`}
              />
            )
          })}
        </div>

        {/* Review count */}
        <p className="text-sm text-slate-500">
          {total_reviews > 0
            ? `${total_reviews} review${total_reviews !== 1 ? "s" : ""}`
            : "No reviews yet"}
        </p>
      </div>
    </div>
  )
}
