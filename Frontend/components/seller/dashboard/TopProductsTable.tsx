"use client"

import { TopProduct } from "@/types"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface TopProductsTableProps {
  products: TopProduct[]
}

const MEDALS = [
  "🥇",
  "🥈",
  "🥉",
]

function formatCurrency(n: number): string {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toFixed(0)}`
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  if (products.length === 0) return null

  const maxRevenue = Math.max(...products.map((p) => p.revenue), 1)

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Top Products</h3>
        <p className="text-xs text-slate-500 mt-0.5">Best performers in the last 30 days</p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-2 text-left text-xs font-medium text-slate-400 w-8">#</th>
              <th className="pb-2 text-left text-xs font-medium text-slate-400">Product</th>
              <th className="pb-2 text-right text-xs font-medium text-slate-400 w-24">Units Sold</th>
              <th className="pb-2 text-right text-xs font-medium text-slate-400 w-24">Revenue</th>
              <th className="pb-2 text-left text-xs font-medium text-slate-400 pl-4 w-36">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map((product, i) => {
              const sharePct = (product.revenue / maxRevenue) * 100
              return (
                <tr key={product.product_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-2 text-base">
                    {i < 3 ? MEDALS[i] : <span className="text-xs text-slate-400 font-medium">{i + 1}</span>}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-slate-100 shrink-0" />
                      )}
                      <span className="font-medium text-slate-800 truncate max-w-[200px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-slate-600 font-medium">{product.units_sold}</td>
                  <td className="py-3 text-right font-semibold text-slate-800">{formatCurrency(product.revenue)}</td>
                  <td className="py-3 pl-4">
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-700",
                          i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : "bg-amber-700/60"
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
            <div key={product.product_id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
              <span className="text-xl shrink-0 w-6">
                {i < 3 ? MEDALS[i] : <span className="text-xs text-slate-400">{i + 1}</span>}
              </span>
              {product.image ? (
                <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-lg bg-slate-100 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{product.name}</p>
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-indigo-400" style={{ width: `${sharePct}%` }} />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-slate-800">{formatCurrency(product.revenue)}</p>
                <p className="text-xs text-slate-400">{product.units_sold} units</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
