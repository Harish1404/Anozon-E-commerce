"use client"

import { cn } from "@/lib/utils"

interface ProductStatusBadgeProps {
  is_approved: boolean
  is_active: boolean
  stock?: number
}

export function ProductStatusBadge({ is_approved, is_active, stock }: ProductStatusBadgeProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {!is_approved && (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          Pending
        </span>
      )}
      {is_approved && is_active && (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          Live
        </span>
      )}
      {is_approved && !is_active && (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          Hidden
        </span>
      )}
      {stock !== undefined && stock === 0 && (
        <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
          Out of Stock
        </span>
      )}
    </div>
  )
}
