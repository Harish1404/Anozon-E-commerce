"use client"

import { useMemo } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { productService } from "@/services/products"
import { ProductFacets } from "@/types"

export function useProductFacets(
  params: {
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
  },
  options?: {
    enabled?: boolean
  }
) {
  const queryKey = useMemo(
    () => ["facets", params],
    [params.category, params.brand, params.sub_category, params.search, params.min_price, params.max_price, params.min_discount, params.min_rating, params.is_featured, params.in_stock]
  )

  return useQuery<ProductFacets>({
    queryKey,
    queryFn: () => productService.getProductFacets(params).then((res) => res.data),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    ...options,
  })
}
