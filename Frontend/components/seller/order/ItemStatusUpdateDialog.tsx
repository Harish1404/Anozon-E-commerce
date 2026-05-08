"use client"

import { useState, useEffect } from "react"
import { ItemStatus } from "@/types"
import { ITEM_STATUS_TRANSITIONS, ITEM_STATUS_LABELS } from "@/lib/constants"
import { useUpdateItemStatus } from "@/hooks/useSellerOrders"
import { X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ItemStatusUpdateDialogProps {
  orderId: string
  productId: string
  productName: string
  currentStatus: ItemStatus
  onClose: () => void
}

const statusColors: Record<string, string> = {
  pending:   "bg-slate-100 text-slate-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped:   "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
}

export function ItemStatusUpdateDialog({
  orderId,
  productId,
  productName,
  currentStatus,
  onClose,
}: ItemStatusUpdateDialogProps) {
  const [selected, setSelected] = useState<ItemStatus | "">("")
  const { mutate: updateStatus, isPending } = useUpdateItemStatus()

  const allowed = ITEM_STATUS_TRANSITIONS[currentStatus] ?? []
  const isTerminal = allowed.length === 0

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const handleConfirm = () => {
    if (!selected) return
    updateStatus(
      { order_id: orderId, product_id: productId, item_status: selected as ItemStatus },
      { onSuccess: onClose }
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Update Item Status</h2>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{productName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Current status */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-slate-500">Current:</span>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", statusColors[currentStatus])}>
            {ITEM_STATUS_LABELS[currentStatus]}
          </span>
        </div>

        {isTerminal ? (
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-4 text-center">
            <p className="text-sm text-slate-600 font-medium">
              {currentStatus === "delivered" ? "✅ This item has been delivered." : "❌ This item was cancelled."}
            </p>
            <p className="text-xs text-slate-400 mt-1">No further status updates are possible.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-2 font-medium">Select new status:</p>
            <div className="space-y-2">
              {allowed.map((next) => (
                <label
                  key={next}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all",
                    selected === next
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    value={next}
                    checked={selected === next}
                    onChange={() => setSelected(next as ItemStatus)}
                    className="accent-indigo-600"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <ArrowRight className="size-3.5 text-slate-400" />
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", statusColors[next])}>
                      {ITEM_STATUS_LABELS[next]}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {isTerminal ? "Close" : "Cancel"}
          </button>
          {!isTerminal && (
            <button
              onClick={handleConfirm}
              disabled={!selected || isPending}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Updating…" : "Confirm"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
