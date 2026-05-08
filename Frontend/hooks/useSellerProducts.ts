"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sellerService } from "@/services/seller"
import { Product, PaginatedSellerProductResponse } from "@/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ProductFormData } from "@/schemas/product.schema"

interface ProductListParams {
  page?: number
  limit?: number
}

export function useSellerProducts(params: ProductListParams = {}) {
  return useQuery<PaginatedSellerProductResponse>({
    queryKey: ["seller-products", params],
    queryFn: () => sellerService.getProducts(params).then((res) => res.data),
    staleTime: 30 * 1000,
  })
}

export function useSellerProduct(product_id: string) {
  return useQuery<Product>({
    queryKey: ["seller-product", product_id],
    queryFn: () => sellerService.getProduct(product_id).then((res) => res.data),
    enabled: Boolean(product_id),
    staleTime: 30 * 1000,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: ProductFormData) => {
      const payload = {
        ...data,
        image_urls: data.image_urls ?? [],
      }
      return sellerService.createProduct(payload).then((res) => res.data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] })
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] })
      if (data.product_data) {
        // 200 = restored previously deleted product
        toast.success("Previously deleted product restored and resubmitted for approval")
      } else {
        toast.success("Product submitted for approval")
      }
      router.push("/seller/products")
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.detail ?? "Failed to create product"
      toast.error(msg)
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: ({ product_id, data }: { product_id: string; data: ProductFormData }) =>
      sellerService.updateProduct(product_id, data).then((res) => res.data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] })
      queryClient.invalidateQueries({ queryKey: ["seller-product", vars.product_id] })
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] })
      toast.success("Product updated successfully")
      router.push("/seller/products")
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.detail ?? "Failed to update product"
      toast.error(msg)
    },
  })
}

export function useToggleProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ product_id, is_active }: { product_id: string; is_active: boolean }) =>
      sellerService.toggleProduct(product_id, is_active).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.detail ?? "Failed to toggle product"
      toast.error(msg)
    },
  })
}

export function useUpdateStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ product_id, stock }: { product_id: string; stock: number }) =>
      sellerService.updateStock(product_id, stock).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] })
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] })
      toast.success("Stock updated successfully")
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.detail ?? "Failed to update stock"
      toast.error(msg)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (product_id: string) =>
      sellerService.deleteProduct(product_id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] })
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] })
      toast.success("Product deleted successfully")
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.detail ?? "Failed to delete product"
      toast.error(msg)
    },
  })
}
