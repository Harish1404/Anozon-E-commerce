"use client"

import { WeeklyRevenueEntry } from "@/types"
import { useMemo } from "react"

interface WeeklyRevenueChartProps {
  data: WeeklyRevenueEntry[]
}

function formatAmount(n: number): string {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toFixed(0)}`
}

export function WeeklyRevenueChart({ data }: WeeklyRevenueChartProps) {
  const maxRevenue = useMemo(() => Math.max(...data.map((d) => d.revenue), 1), [data])

  // SVG chart dimensions
  const W = 560
  const H = 180
  const PADDING_LEFT = 48
  const PADDING_RIGHT = 16
  const PADDING_TOP = 16
  const PADDING_BOTTOM = 32
  const chartW = W - PADDING_LEFT - PADDING_RIGHT
  const chartH = H - PADDING_TOP - PADDING_BOTTOM
  const barCount = data.length
  const barGroupW = chartW / barCount
  const barW = Math.min(barGroupW * 0.55, 36)

  // Y-axis grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((frac) => ({
    y: PADDING_TOP + chartH * (1 - frac),
    label: formatAmount(maxRevenue * frac),
  }))

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Weekly Revenue</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 7 days</p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="overflow-visible"
        aria-label="Weekly revenue bar chart"
      >
        {/* Grid lines */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={PADDING_LEFT}
              y1={line.y}
              x2={W - PADDING_RIGHT}
              y2={line.y}
              className="stroke-border"
              strokeWidth={1}
              strokeDasharray={i === 0 ? undefined : "4 3"}
            />
            <text
              x={PADDING_LEFT - 6}
              y={line.y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={9}
              className="fill-muted-foreground"
            >
              {i === 0 ? "₹0" : line.label}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((entry, i) => {
          const barH = maxRevenue > 0 ? (entry.revenue / maxRevenue) * chartH : 0
          const x = PADDING_LEFT + i * barGroupW + (barGroupW - barW) / 2
          const y = PADDING_TOP + chartH - barH
          const isToday = entry.is_today

          return (
            <g key={entry.day}>
              {/* Bar background (track) */}
              <rect
                x={x}
                y={PADDING_TOP}
                width={barW}
                height={chartH}
                rx={6}
                className="fill-muted/50"
              />
              {/* Actual bar */}
              <rect
                x={x}
                y={barH > 0 ? y : PADDING_TOP + chartH - 2}
                width={barW}
                height={Math.max(barH, 2)}
                rx={6}
                fill={isToday ? "url(#todayGrad)" : "url(#barGrad)"}
                className="transition-all duration-700"
              />
              {/* Day label */}
              <text
                x={x + barW / 2}
                y={PADDING_TOP + chartH + 14}
                textAnchor="middle"
                fontSize={10}
                fontWeight={isToday ? "700" : "500"}
                className={isToday ? "fill-primary" : "fill-muted-foreground"}
              >
                {entry.day}
              </text>
              {/* Amount on hover — always visible for today */}
              {isToday && entry.revenue > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="600"
                  className="fill-primary"
                >
                  {formatAmount(entry.revenue)}
                </text>
              )}
            </g>
          )
        })}

        {/* Gradient defs */}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-accent, #818cf8)" />
            <stop offset="100%" stopColor="var(--brand-cta, #6366f1)" />
          </linearGradient>
          <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-primary, #a5b4fc)" />
            <stop offset="100%" stopColor="var(--brand-teal, #4f46e5)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
