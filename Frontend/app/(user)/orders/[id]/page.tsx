"use client"

import React, { useState } from "react"
import { useOrder, useCancelOrder } from "@/hooks/useOrders"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Clock, CheckCircle2, Truck, XCircle, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { OrderTimeline } from "@/components/orders/OrderTimeline"
import { OrderDetail } from "@/components/orders/OrderDetail"
import { CancelOrderDialog } from "@/components/orders/CancelOrderDialog"

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = React.use(params)
  const { data: order, isLoading, isError } = useOrder(id)
  const cancelOrder = useCancelOrder()
  const router = useRouter()

  React.useEffect(() => {
    document.title = "Anozon - Order Details"
  }, [])

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<{ type: 'order' } | { type: 'item', productId: string, productName: string } | null>(null)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg mb-8" />
        <div className="space-y-6">
          <div className="h-64 bg-muted animate-pulse rounded-3xl" />
          <div className="h-96 bg-muted animate-pulse rounded-3xl" />
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold text-foreground">Order not found</h2>
        <p className="mt-2 text-muted-foreground">We couldn't find the order you're looking for.</p>
        <Button className="mt-6" onClick={() => router.push("/orders")}>Back to Orders</Button>
      </div>
    )
  }

  const handleCancelConfirm = () => {
    if (!cancelTarget) return

    const product_id = cancelTarget.type === 'item' ? cancelTarget.productId : undefined

    cancelOrder.mutate(
      { order_id: id, product_id },
      {
        onSuccess: () => {
          toast.success("Cancellation successful")
          setCancelDialogOpen(false)
          setCancelTarget(null)
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || "Failed to cancel")
          setCancelDialogOpen(false)
          setCancelTarget(null)
        },
      }
    )
  }

  const openCancelItemDialog = (productId: string, productName: string) => {
    setCancelTarget({ type: 'item', productId, productName })
    setCancelDialogOpen(true)
  }

  const openCancelOrderDialog = () => {
    setCancelTarget({ type: 'order' })
    setCancelDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="size-5 text-amber-600 dark:text-amber-500" />
      case "confirmed": return <CheckCircle2 className="size-5 text-blue-500" />
      case "partially_shipped": return <Truck className="size-5 text-indigo-400" />
      case "shipped": return <Truck className="size-5 text-indigo-500" />
      case "partially_delivered": return <CheckCircle2 className="size-5 text-emerald-400" />
      case "delivered": return <CheckCircle2 className="size-5 text-emerald-500" />
      case "cancelled": return <XCircle className="size-5 text-rose-500" />
      default: return <Clock className="size-5 text-muted-foreground" />
    }
  }

  const isCancelled = order.order_status === "cancelled"
  
  const dialogTitle = cancelTarget?.type === 'item' ? "Cancel Item?" : "Cancel Entire Order?"
  const dialogDesc = cancelTarget?.type === 'item' 
    ? `Are you sure you want to cancel "${cancelTarget.productName}" from your order?`
    : "This will cancel all items in this order. This action cannot be undone."
  
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/orders" className="mb-6 flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="size-4" />
        Back to My Orders
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Order Details</h1>
          <p className="mt-1 text-muted-foreground font-mono text-sm">ID: {order._id}</p>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold",
          isCancelled ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-secondary text-secondary-foreground"
        )}>
          {getStatusIcon(order.order_status)}
          <span className="capitalize">{order.order_status.replace('_', ' ')}</span>
        </div>
      </div>

      <OrderTimeline status={order.order_status} />
      
      <OrderDetail 
        order={order} 
        onCancelItem={openCancelItemDialog}
        onCancelOrder={openCancelOrderDialog}
        isCancelPending={cancelOrder.isPending}
      />

      <CancelOrderDialog
        isOpen={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelConfirm}
        isPending={cancelOrder.isPending}
        title={dialogTitle}
        description={dialogDesc}
        confirmText={cancelTarget?.type === 'item' ? "Confirm Cancellation" : "Yes, Cancel Order"}
      />
    </div>
  )
}
