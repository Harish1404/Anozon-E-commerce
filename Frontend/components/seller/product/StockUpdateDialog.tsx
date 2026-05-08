"use client"

import { useState, useRef, useEffect } from "react"
import { useUpdateStock } from "@/hooks/useSellerProducts"
import { X } from "lucide-react"

interface StockUpdateDialogProps {
  productId: string
  currentStock: number
  productName: string
}

export function StockUpdateDialog({ productId, currentStock, productName }: StockUpdateDialogProps) {
  const [open, setOpen] = useState(false)
  const [stock, setStock] = useState(currentStock)
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: updateStock, isPending } = useUpdateStock()

  useEffect(() => {
    if (open) {
      setStock(currentStock)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, currentStock])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open])

  const handleSave = () => {
    if (stock < 0) return
    updateStock(
      { product_id: productId, stock },
      { onSuccess: () => setOpen(false) }
    )
  }

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(true) }}
        className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
      >
        Update Stock
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Update Stock</h2>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{productName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Input */}
            <div className="space-y-1.5">
              <label htmlFor="stock-input" className="text-sm font-medium text-slate-700">
                Stock quantity
              </label>
              <input
                id="stock-input"
                ref={inputRef}
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            {/* Actions */}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending || stock < 0}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
