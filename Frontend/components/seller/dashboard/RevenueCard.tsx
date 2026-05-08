"use client"

import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface RevenueCardProps {
  label: string
  amount: number
  gradient: string // tailwind gradient classes
  icon: LucideIcon
}

function formatCurrency(amount: number): string {
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(1)}L`
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`
  return `₹${amount.toFixed(0)}`
}

export function RevenueCard({ label, amount, gradient, icon: Icon }: RevenueCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-5 text-white shadow-sm", gradient)}>
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
      <div className="absolute -right-2 top-8 h-12 w-12 rounded-full bg-white/5" />

      {/* Icon */}
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
        <Icon className="size-5 text-white" />
      </div>

      {/* Amount */}
      <p className="text-2xl font-bold leading-none">{formatCurrency(amount)}</p>
      <p className="mt-1 text-xs font-medium text-white/80">{label}</p>
    </div>
  )
}
