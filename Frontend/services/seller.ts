// services/seller.ts
import api from "@/lib/axios"
import { SellerDashboard, SellerProfile, ItemStatus, PaginatedSellerProductResponse, PaginatedSellerOrderResponse } from "@/types"
import { Product } from "@/types"

export const sellerService = {
  // Dashboard
  getDashboard: () =>
    api.get<SellerDashboard>("/seller/dashboard"),

  // Products
  getProducts: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedSellerProductResponse>("/seller/products", { params }),

  getProduct: (product_id: string) =>
    api.get<Product>(`/seller/products/${product_id}`),

  createProduct: (data: Record<string, unknown>) =>
    api.post<{ message: string; product_id: string; product_data?: Product }>("/seller/products", data),

  updateProduct: (product_id: string, data: Record<string, unknown>) =>
    api.put<{ message: string }>(`/seller/products/${product_id}`, data),

  // is_active must be sent in body — backend requires it
  toggleProduct: (product_id: string, is_active: boolean) =>
    api.patch<{ message: string }>(`/seller/products/${product_id}/toggle`, { is_active }),

  updateStock: (product_id: string, stock: number) =>
    api.patch<{ message: string }>(`/seller/products/${product_id}/stock`, { stock }),

  deleteProduct: (product_id: string) =>
    api.delete<{ message: string }>(`/seller/products/${product_id}`),

  // Orders
  getOrders: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedSellerOrderResponse>("/seller/orders", { params }),

  getOrder: (order_id: string) =>
    api.get(`/seller/orders/${order_id}`),

  // URL includes /status suffix — required by backend route
  updateItemStatus: (order_id: string, product_id: string, item_status: ItemStatus) =>
    api.patch(`/seller/orders/${order_id}/items/${product_id}/status`, { item_status }),

  // Profile
  getProfile: () =>
    api.get<SellerProfile>("/seller/profile"),

  updateProfile: (data: Partial<SellerProfile>) =>
    api.put<{ message: string }>("/seller/profile", data),
}