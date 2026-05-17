"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { productService } from "@/services/products"
import { PaginatedProductResponse } from "@/types"

export function useProducts(params: {
  search?: string
  category?: string
  min_price?: number
  max_price?: number
  sort_by?: string
  sort_order?: -1 | 1
  page?: number
  limit?: number
}) {
  const queryKey = useMemo(
    () => ["products", params],
    [params.search, params.category, params.min_price, params.max_price, params.sort_by, params.sort_order, params.page, params.limit]
  )

  return useQuery<PaginatedProductResponse>({
    queryKey,
    queryFn: () => productService.getProducts(params).then((res) => res.data),
  })
}
