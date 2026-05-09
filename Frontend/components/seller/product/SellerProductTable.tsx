"use client"

import { useState } from "react"
import { Product } from "@/types"
import { ProductStatusBadge } from "./ProductStatusBadge"
import { StockUpdateDialog } from "./StockUpdateDialog"
import { useToggleProduct, useDeleteProduct } from "@/hooks/useSellerProducts"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface SellerProductTableProps {
  products: Product[]
}

export function SellerProductTable({ products }: SellerProductTableProps) {
  const router = useRouter()
  const { mutate: toggleProduct, isPending: toggling } = useToggleProduct()
  const { mutate: deleteProduct, isPending: deleting } = useDeleteProduct()
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16">
        <AlertTriangle className="size-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No products found</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground w-14">Image</th>
              <th className="py-3 px-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="py-3 px-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="py-3 px-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</th>
              <th className="py-3 px-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Stock</th>
              <th className="py-3 px-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="py-3 px-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-muted/50 transition-colors">
                {/* Image */}
                <td className="py-3 pl-4 pr-3">
                  <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-muted shrink-0">
                    {product.image_urls?.[0] ? (
                      <Image src={product.image_urls[0]} alt={product.name} fill className="object-cover" sizes="40px" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 text-xs">No img</div>
                    )}
                  </div>
                </td>

                {/* Name */}
                <td className="py-3 px-3 max-w-[180px]">
                  <p className="font-medium text-foreground truncate">{product.name}</p>
                </td>

                {/* Category */}
                <td className="py-3 px-3">
                  <span className="text-muted-foreground">{product.category}</span>
                </td>

                {/* Price */}
                <td className="py-3 px-3 text-right">
                  <p className="font-semibold text-foreground">₹{product.price}</p>
                  {product.discount_percent > 0 && (
                    <p className="text-xs text-muted-foreground line-through">₹{product.actual_price}</p>
                  )}
                </td>

                {/* Stock */}
                <td className="py-3 px-3 text-right">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                      product.stock === 0
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                        : product.stock < 10
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    )}
                  >
                    {product.stock}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  <ProductStatusBadge
                    is_approved={product.is_approved}
                    is_active={product.is_active}
                    stock={product.stock}
                  />
                </td>

                {/* Actions */}
                <td className="py-3 px-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Edit */}
                    <button
                      onClick={() => router.push(`/seller/products/${product._id}/edit`)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <Pencil className="size-4" />
                    </button>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleProduct({ product_id: product._id, is_active: !product.is_active })}
                      disabled={toggling}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-emerald-600 transition-colors"
                      title={product.is_active ? "Hide product" : "Make active"}
                    >
                      {product.is_active
                        ? <ToggleRight className="size-4 text-emerald-500" />
                        : <ToggleLeft className="size-4" />
                      }
                    </button>

                    {/* Stock */}
                    <StockUpdateDialog
                      productId={product._id}
                      currentStock={product.stock}
                      productName={product.name}
                    />

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {products.map((product) => (
          <div key={product._id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted shrink-0">
                {product.image_urls?.[0] ? (
                  <Image src={product.image_urls[0]} alt={product.name} fill className="object-cover" sizes="64px" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.category}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">₹{product.price}</span>
                  <ProductStatusBadge is_approved={product.is_approved} is_active={product.is_active} stock={product.stock} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <button
                onClick={() => router.push(`/seller/products/${product._id}/edit`)}
                className="flex-1 rounded-xl border border-border py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => toggleProduct({ product_id: product._id, is_active: !product.is_active })}
                className="flex-1 rounded-xl border border-border py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                {product.is_active ? "Hide" : "Activate"}
              </button>
              <StockUpdateDialog productId={product._id} currentStock={product.stock} productName={product.name} />
              <button
                onClick={() => setDeleteTarget(product)}
                className="flex-1 rounded-xl border border-rose-500/20 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10">
                <Trash2 className="size-5 text-rose-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Delete Product?</h2>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{deleteTarget.name}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              This product will be removed from your store. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) })
                }}
                disabled={deleting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
