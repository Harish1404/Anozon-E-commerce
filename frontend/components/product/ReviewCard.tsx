"use client"

import { Review } from "@/types"

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
        <span className="font-semibold text-slate-900">{review.reviewer_name}</span>
        <span>{review.rating.toFixed(1)} ★</span>
      </div>
      <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
      {review.is_verified_purchase && (
        <p className="mt-3 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Verified purchase
        </p>
      )}
    </div>
  )
}
