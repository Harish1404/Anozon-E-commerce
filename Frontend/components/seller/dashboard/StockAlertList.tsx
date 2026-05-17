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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <AlertTriangle className="size-4 text-amber-500" />
            Stock Alerts
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Products with stock below 10</p>
        </div>
        <Link href="/seller/products" className="text-xs text-primary hover:underline font-medium">
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : lowStockProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
          <Package className="size-8 text-emerald-500" />
          <p className="text-sm text-muted-foreground font-medium">All products are well stocked</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-2">
          {lowStockProducts.map((product) => (
            <li
              key={product._id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors"
            >
              <Link
                href={`/seller/products/${product._id}/edit`}
                className="min-w-0 flex-1"
              >
                <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold mt-0.5",
                    product.stock === 0
                      ? "bg-rose-500/10 text-rose-500"
                      : "bg-amber-500/10 text-amber-500"
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
