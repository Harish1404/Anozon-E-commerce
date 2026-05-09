"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  color?: "indigo" | "amber" | "emerald" | "rose" | "violet" | "sky"
  subtitle?: string
  href?: string
}

const colorMap = {
  indigo:  { bg: "bg-indigo-50",  icon: "bg-indigo-100 text-indigo-600",  value: "text-indigo-700" },
  amber:   { bg: "bg-amber-50",   icon: "bg-amber-100 text-amber-600",    value: "text-amber-700" },
  emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600",value: "text-emerald-700" },
  rose:    { bg: "bg-rose-50",    icon: "bg-rose-100 text-rose-600",      value: "text-rose-700" },
  violet:  { bg: "bg-violet-50",  icon: "bg-violet-100 text-violet-600",  value: "text-violet-700" },
  sky:     { bg: "bg-sky-50",     icon: "bg-sky-100 text-sky-600",        value: "text-sky-700" },
}

export function StatCard({ label, value, icon: Icon, color = "indigo", subtitle, href }: StatCardProps) {
  const c = colorMap[color]

  const card = (
    <div
      className={cn(
        "relative flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm",
        "hover:-translate-y-0.5 hover:shadow-md transition-all duration-200",
        href && "cursor-pointer"
      )}
    >
      {/* Icon circle */}
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", c.icon)}>
        <Icon className="size-6" />
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={cn("mt-0.5 text-2xl font-bold leading-none", c.value)}>{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  )

  if (href) return <Link href={href} className="block">{card}</Link>
  return card
}
