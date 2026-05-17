"use client"

import { useState } from "react"
import { SellerOrderItem } from "@/types"
import { ItemStatusUpdateDialog } from "./ItemStatusUpdateDialog"
import { ITEM_STATUS_TRANSITIONS } from "@/lib/constants"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface SellerOrderItemRowProps {
  item: SellerOrderItem
  orderId: string
}

const statusStyles: Record<string, string> = {
  pending:   "bg-muted text-muted-foreground",
  confirmed: "bg-blue-500/10 text-blue-500",
  shipped:   "bg-violet-500/10 text-violet-500",
  delivered: "bg-emerald-500/10 text-emerald-500",
  cancelled: "bg-rose-500/10 text-rose-500",
}

export function SellerOrderItemRow({ item, orderId }: SellerOrderItemRowProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const isTerminal = (ITEM_STATUS_TRANSITIONS[item.item_status] ?? []).length === 0

  return (
    <>
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        {/* Image */}
        <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-muted">
          {item.image ? (
            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
          ) : null}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            ₹{item.price} × {item.quantity} = <span className="font-medium text-foreground">₹{item.item_total}</span>
          </p>
          <span className={cn("mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize", statusStyles[item.item_status])}>
            {item.item_status}
          </span>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <button
            onClick={() => setDialogOpen(true)}
            disabled={isTerminal}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
              isTerminal
                ? "cursor-not-allowed bg-muted text-muted-foreground/50"
                : "bg-primary text-primary-foreground hover:opacity-90"
            )}
          >
            {isTerminal ? "Final" : "Update"}
          </button>
        </div>
      </div>

      {dialogOpen && (
        <ItemStatusUpdateDialog
          orderId={orderId}
          productId={item.product_id}
          productName={item.name}
          currentStatus={item.item_status}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  )
}
