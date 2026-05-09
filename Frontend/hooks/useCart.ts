"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { cartService } from "@/services/cart"
import { useAuthStore } from "@/store/useAuthStore"
import { Cart } from "@/types"
import { toast } from "sonner"

export function useCart() {
  const { user } = useAuthStore()

  return useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: () => cartService.getCart().then((res) => res.data),
    enabled: !!user,
  })
}

export function useAddToCart() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ product_id, quantity }: { product_id: string; quantity: number }) => {
      if (!user) {
        return Promise.reject(new Error("__AUTH_REQUIRED__"))
      }
      return cartService.addToCart(product_id, quantity).then((res) => res.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      toast.success("Added to cart")
    },
    onError: (error: any) => {
      if (error?.message === "__AUTH_REQUIRED__") {
        toast.error("Please sign in to add items to your cart")
        return
      }
      toast.error(error.response?.data?.detail || "Failed to add to cart")
    }
  })
}

export function useUpdateCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ product_id, quantity }: { product_id: string; quantity: number }) =>
      cartService.updateCart(product_id, quantity).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      toast.success("Cart updated")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update cart")
    }
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (product_id: string) => cartService.removeFromCart(product_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      toast.success("Removed from cart")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to remove from cart")
    }
  })
}
