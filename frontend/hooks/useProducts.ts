"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { productService } from "@/services/products"
import { PaginatedProductResponse } from "@/types"

export function useProducts(
  params: {
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
  },
  options?: {
    enabled?: boolean
  }
) {
  const queryKey = useMemo(
    () => ["products", params],
    [params.search, params.category, params.brand, params.sub_category, params.min_price, params.max_price, params.min_discount, params.min_rating, params.is_featured, params.in_stock, params.sort_by, params.sort_order, params.page, params.limit]
  )

  return useQuery<PaginatedProductResponse>({
    queryKey,
    queryFn: () => productService.getProducts(params).then((res) => res.data),
    ...options,
  })
}
