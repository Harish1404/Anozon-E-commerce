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
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16">
        <AlertTriangle className="size-10 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">No products found</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 w-14">Image</th>
              <th className="py-3 px-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
              <th className="py-3 px-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Category</th>
              <th className="py-3 px-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Price</th>
              <th className="py-3 px-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Stock</th>
              <th className="py-3 px-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
              <th className="py-3 px-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-slate-50/60 transition-colors">
                {/* Image */}
                <td className="py-3 pl-4 pr-3">
                  <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {product.image_urls?.[0] ? (
                      <Image src={product.image_urls[0]} alt={product.name} fill className="object-cover" sizes="40px" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-300 text-xs">No img</div>
                    )}
                  </div>
                </td>

                {/* Name */}
                <td className="py-3 px-3 max-w-[180px]">
                  <p className="font-medium text-slate-800 truncate">{product.name}</p>
                </td>

                {/* Category */}
                <td className="py-3 px-3">
                  <span className="text-slate-500">{product.category}</span>
                </td>

                {/* Price */}
                <td className="py-3 px-3 text-right">
                  <p className="font-semibold text-slate-800">₹{product.price}</p>
                  {product.discount_percent > 0 && (
                    <p className="text-xs text-slate-400 line-through">₹{product.actual_price}</p>
                  )}
                </td>

                {/* Stock */}
                <td className="py-3 px-3 text-right">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                      product.stock === 0
                        ? "bg-rose-100 text-rose-700"
                        : product.stock < 10
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
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
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="size-4" />
                    </button>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleProduct({ product_id: product._id, is_active: !product.is_active })}
                      disabled={toggling}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
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
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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
          <div key={product._id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                {product.image_urls?.[0] ? (
                  <Image src={product.image_urls[0]} alt={product.name} fill className="object-cover" sizes="64px" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 truncate">{product.name}</p>
                <p className="text-xs text-slate-400">{product.category}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">₹{product.price}</span>
                  <ProductStatusBadge is_approved={product.is_approved} is_active={product.is_active} stock={product.stock} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => router.push(`/seller/products/${product._id}/edit`)}
                className="flex-1 rounded-xl border border-slate-200 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => toggleProduct({ product_id: product._id, is_active: !product.is_active })}
                className="flex-1 rounded-xl border border-slate-200 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {product.is_active ? "Hide" : "Activate"}
              </button>
              <StockUpdateDialog productId={product._id} currentStock={product.stock} productName={product.name} />
              <button
                onClick={() => setDeleteTarget(product)}
                className="flex-1 rounded-xl border border-rose-100 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
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
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <Trash2 className="size-5 text-rose-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Delete Product?</h2>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{deleteTarget.name}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              This product will be removed from your store. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
