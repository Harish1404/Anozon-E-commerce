"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { cartService } from "@/services/cart"
import { useAuthStore } from "@/store/useAuthStore"
import { WishlistItem } from "@/types"
import { toast } from "sonner"

export function useWishlist() {
  const { user } = useAuthStore()

  return useQuery<WishlistItem[]>({
    queryKey: ["wishlist"],
    queryFn: () => cartService.getWishlist().then((res) => res.data),
    enabled: !!user,
    staleTime: 60 * 1000,
  })
}

export function useToggleWishlist() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (product_id: string) => {
      if (!user) {
        return Promise.reject(new Error("__AUTH_REQUIRED__"))
      }
      return cartService.toggleWishlist(product_id).then((res) => res.data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] })
      // Also refresh products so like count updates
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["product"] })
      toast.success(data.is_favorite ? "Added to wishlist" : "Removed from wishlist")
    },
    onError: (error: any) => {
      if (error?.message === "__AUTH_REQUIRED__") {
        toast.error("Please sign in to manage your wishlist")
        return
      }
      toast.error(error.response?.data?.detail || "Failed to update wishlist")
    },
  })
}

/**
 * Checks if a product is in the user's wishlist.
 * Uses the cached wishlist query data.
 */
export function useIsWishlisted(product_id: string): boolean {
  const { data: wishlist } = useWishlist()
  if (!wishlist) return false
  return wishlist.some((item) => item.product_id === product_id)
}
