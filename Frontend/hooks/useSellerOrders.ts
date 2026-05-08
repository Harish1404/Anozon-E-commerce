"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sellerService } from "@/services/seller"
import { PaginatedSellerOrderResponse, SellerOrder, ItemStatus } from "@/types"
import { toast } from "sonner"

interface OrderListParams {
  page?: number
  limit?: number
}

export function useSellerOrders(params: OrderListParams = {}) {
  return useQuery<PaginatedSellerOrderResponse>({
    queryKey: ["seller-orders", params],
    queryFn: () => sellerService.getOrders(params).then((res) => res.data),
    staleTime: 30 * 1000,
  })
}

export function useSellerOrder(order_id: string) {
  return useQuery<SellerOrder>({
    queryKey: ["seller-order", order_id],
    queryFn: () => sellerService.getOrder(order_id).then((res) => res.data),
    enabled: Boolean(order_id),
    staleTime: 30 * 1000,
  })
}

export function useUpdateItemStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      order_id,
      product_id,
      item_status,
    }: {
      order_id: string
      product_id: string
      item_status: ItemStatus
    }) =>
      sellerService
        .updateItemStatus(order_id, product_id, item_status)
        .then((res) => res.data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["seller-order", vars.order_id] })
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] })
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] })
      toast.success("Order item status updated")
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.detail ?? "Failed to update status"
      toast.error(msg)
    },
  })
}
