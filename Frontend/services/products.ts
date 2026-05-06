import api from "@/lib/axios"
import { PaginatedProductResponse, Product } from "@/types"

export const productService = {
  getProducts: (params?: {
    search?: string
    category?: string
    min_price?: number
    max_price?: number
    sort_by?: string
    sort_order?: -1 | 1
    page?: number
    limit?: number
  }) => api.get<PaginatedProductResponse>("/products", { params }),

  getProductById: (id: string) =>
    api.get<Product>(`/products/${id}`),
}
