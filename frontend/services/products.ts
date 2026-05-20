import api from "@/lib/axios"
import { PaginatedProductResponse, Product, ProductFacets, CategoryGroup } from "@/types"

export const productService = {
  getProducts: (params?: {
    search?: string
    category?: string
    brand?: string
    sub_category?: string
    min_price?: number
    max_price?: number
    min_discount?: number
    min_rating?: number
    is_featured?: boolean
    in_stock?: boolean
    sort_by?: string
    sort_order?: -1 | 1
    page?: number
    limit?: number
  }) => api.get<PaginatedProductResponse>("/products", { params }),

  getProductById: (id: string) =>
    api.get<Product>(`/products/${id}`),

  getProductFacets: (params?: {
    category?: string
    brand?: string
    sub_category?: string
    search?: string
    min_price?: number
    max_price?: number
    min_discount?: number
    min_rating?: number
    is_featured?: boolean
    in_stock?: boolean
  }) => api.get<ProductFacets>("/products/facets", { params }),

  getCategories: () =>
    api.get<CategoryGroup[]>("/categories"),
}
