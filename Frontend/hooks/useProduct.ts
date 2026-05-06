"use client"

import { useQuery } from "@tanstack/react-query"
import { productService } from "@/services/products"
import { Product } from "@/types"

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => productService.getProductById(id).then((res) => res.data),
    enabled: Boolean(id),
  })
}
