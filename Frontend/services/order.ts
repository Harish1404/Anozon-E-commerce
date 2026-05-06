// services/order.service.ts
import api from "@/lib/axios"
import { Order, PaymentMethod } from "@/types"

export const orderService = {
  placeOrder: (address_id: string, payment_method: PaymentMethod) =>
    api.post<{ message: string; order_id: string }>("/users/orders", { address_id, payment_method }),

  buyNow: (product_id: string, quantity: number, address_id: string, payment_method: PaymentMethod) =>
    api.post<{ message: string; order_id: string }>("/users/orders/buy-now", { product_id, quantity, address_id, payment_method }),

  getOrders: (params?: { 
    status?: string; 
    page?: number; 
    limit?: number; 
    year?: number; 
    month?: number 
  }) =>
    api.get<PaginatedOrderResponse>("/users/orders", { params }),

  getOrder: (order_id: string) =>
    api.get<Order>(`/users/orders/${order_id}`),

  cancelOrder: (order_id: string, product_id?: string) =>
    api.patch(`/users/orders/${order_id}/cancel`, null, { params: { product_id } })
}