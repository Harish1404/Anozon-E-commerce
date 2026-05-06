"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { orderService } from "@/services/order"
import { Order, PaymentMethod } from "@/types"

export function useOrders(status?: string) {
  return useQuery<Order[]>({
    queryKey: ["orders", status],
    queryFn: () => orderService.getOrders({ status }).then((res) => res.data),
    enabled: status !== undefined || status === undefined,
  })
}

export function useOrder(order_id: string) {
  return useQuery<Order>({
    queryKey: ["order", order_id],
    queryFn: () => orderService.getOrder(order_id).then((res) => res.data),
    enabled: Boolean(order_id),
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ order_id, product_id }: { order_id: string; product_id?: string }) => 
      orderService.cancelOrder(order_id, product_id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["order"] })
    },
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { address_id: string; payment_method: PaymentMethod }) =>
      orderService.placeOrder(data.address_id, data.payment_method).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}

export function useBuyNow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { product_id: string; quantity: number; address_id: string; payment_method: PaymentMethod }) =>
      orderService.buyNow(data.product_id, data.quantity, data.address_id, data.payment_method).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}
