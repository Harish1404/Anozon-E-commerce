// services/seller.service.ts
import api from "@/lib/axios"
import { Product, SellerDashboard, SellerProfile, Order, OrderStatus } from "@/types"

export const sellerService = {
  // Dashboard
  getDashboard: () =>
    api.get<SellerDashboard>("/seller/dashboard"),

  // Products
  getProducts: (params?: { status?: string; search?: string; stock_lt?: number }) =>
    api.get<Product[]>("/seller/products", { params }),

  getProduct: (product_id: string) =>
    api.get<Product>(`/seller/products/${product_id}`),

  createProduct: (data: Partial<Product>) =>
    api.post<Product>("/seller/products", data),

  updateProduct: (product_id: string, data: Partial<Product>) =>
    api.put(`/seller/products/${product_id}`, data),

  toggleProduct: (product_id: string) =>
    api.patch(`/seller/products/${product_id}/toggle`),

  updateStock: (product_id: string, stock: number) =>
    api.patch(`/seller/products/${product_id}/stock`, { stock }),

  deleteProduct: (product_id: string) =>
    api.delete(`/seller/products/${product_id}`),

  // Orders
  getOrders: (params?: { status?: string }) =>
    api.get<Order[]>("/seller/orders", { params }),

  getOrder: (order_id: string) =>
    api.get(`/seller/orders/${order_id}`),

  updateItemStatus: (order_id: string, product_id: string, item_status: OrderStatus) =>
    api.patch(`/seller/orders/${order_id}/items/${product_id}`, { item_status }),

  // Profile
  getProfile: () =>
    api.get<SellerProfile>("/seller/profile"),

  updateProfile: (data: Partial<SellerProfile>) =>
    api.put("/seller/profile", data),

  applyAsSeller: (data: Partial<SellerProfile>) =>
    api.post("/seller/apply", data),

  getApplicationStatus: () =>
    api.get("/seller/apply/status")
}