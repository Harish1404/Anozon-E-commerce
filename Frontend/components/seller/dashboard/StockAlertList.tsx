"use client"

import Link from "next/link"
import { Package, AlertTriangle } from "lucide-react"
import { useSellerProducts } from "@/hooks/useSellerProducts"
import { StockUpdateDialog } from "@/components/seller/product/StockUpdateDialog"
import { cn } from "@/lib/utils"

export function StockAlertList() {
  const { data, isLoading } = useSellerProducts({ limit: 20 })

  const lowStockProducts = (data?.items ?? [])
    .filter((p) => p.stock < 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <AlertTriangle className="size-4 text-amber-500" />
            Stock Alerts
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Products with stock below 10</p>
        </div>
        <Link href="/seller/products" className="text-xs text-indigo-600 hover:underline font-medium">
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : lowStockProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
          <Package className="size-8 text-emerald-400" />
          <p className="text-sm text-slate-500 font-medium">All products are well stocked</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-2">
          {lowStockProducts.map((product) => (
            <li
              key={product._id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-slate-50 transition-colors"
            >
              <Link
                href={`/seller/products/${product._id}/edit`}
                className="min-w-0 flex-1"
              >
                <p className="text-sm font-medium text-slate-800 truncate">{product.name}</p>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mt-0.5",
                    product.stock === 0
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                </span>
              </Link>
              <StockUpdateDialog
                productId={product._id}
                currentStock={product.stock}
                productName={product.name}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
