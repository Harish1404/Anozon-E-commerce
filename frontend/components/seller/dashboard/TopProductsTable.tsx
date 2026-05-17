"use client"

import { TopProduct } from "@/types"
import Image from "next/image"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface TopProductsTableProps {
  products: TopProduct[]
}

const MEDALS = ["🥇", "🥈", "🥉"]

function formatCurrency(n: number): string {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toFixed(0)}`
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  if (products.length === 0) return null

  const maxRevenue = Math.max(...products.map((p) => p.revenue), 1)

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Top Products</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Best performers in the last 30 days</p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left text-xs font-medium text-muted-foreground w-8">#</th>
              <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Product</th>
              <th className="pb-2 text-right text-xs font-medium text-muted-foreground w-24">Units Sold</th>
              <th className="pb-2 text-right text-xs font-medium text-muted-foreground w-24">Revenue</th>
              <th className="pb-2 text-center text-xs font-medium text-muted-foreground w-20">Avg Rating</th>
              <th className="pb-2 text-left text-xs font-medium text-muted-foreground pl-4 w-36">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {products.map((product, i) => {
              const sharePct = (product.revenue / maxRevenue) * 100
              return (
                <tr key={product.product_id} className="hover:bg-muted/50 transition-colors">
                  <td className="py-3 pr-2 text-base">
                    {i < 3 ? MEDALS[i] : <span className="text-xs text-muted-foreground font-medium">{i + 1}</span>}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-muted shrink-0" />
                      )}
                      <span className="font-medium text-foreground truncate max-w-[200px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-muted-foreground font-medium">{product.units_sold}</td>
                  <td className="py-3 text-right font-semibold text-foreground">{formatCurrency(product.revenue)}</td>
                  <td className="py-3 text-center">
                    <div className="inline-flex items-center gap-1 text-xs">
                      <Star className="size-3 fill-amber-500 text-amber-500" />
                      <span className="font-medium text-foreground">
                        {(product.avg_rating ?? 0).toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pl-4">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-700",
                          i === 0 ? "bg-amber-400" : i === 1 ? "bg-primary/60" : "bg-amber-700/60"
                        )}
                        style={{ width: `${sharePct}%` }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {products.map((product, i) => {
          const sharePct = (product.revenue / maxRevenue) * 100
          return (
            <div key={product.product_id} className="flex items-center gap-3 rounded-xl border border-border p-3">
              <span className="text-xl shrink-0 w-6">
                {i < 3 ? MEDALS[i] : <span className="text-xs text-muted-foreground">{i + 1}</span>}
              </span>
              {product.image ? (
                <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 flex-1 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${sharePct}%` }} />
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground shrink-0">
                    <Star className="size-2.5 fill-amber-500 text-amber-500" />
                    {(product.avg_rating ?? 0).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-foreground">{formatCurrency(product.revenue)}</p>
                <p className="text-xs text-muted-foreground">{product.units_sold} units</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
