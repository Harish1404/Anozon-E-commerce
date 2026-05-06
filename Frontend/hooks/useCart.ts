"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { cartService } from "@/services/cart"
import { Cart } from "@/types"

export function useCart() {
  return useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: () => cartService.getCart().then((res) => res.data),
  })
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ product_id, quantity }: { product_id: string; quantity: number }) =>
      cartService.addToCart(product_id, quantity).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}

export function useUpdateCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ product_id, quantity }: { product_id: string; quantity: number }) =>
      cartService.updateCart(product_id, quantity).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (product_id: string) => cartService.removeFromCart(product_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}
