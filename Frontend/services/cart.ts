// services/cart.service.ts
import api from "@/lib/axios"
import { Cart } from "@/types"

export const cartService = {
  getCart: () =>
    api.get<Cart>("/users/cart"),

  addToCart: (product_id: string, quantity: number) =>
    api.post("/users/cart", { product_id, quantity }),

  updateCart: (product_id: string, quantity: number) =>
    api.put("/users/cart", { product_id, quantity }),

  removeFromCart: (product_id: string) =>
    api.delete(`/users/cart/${product_id}`)
}