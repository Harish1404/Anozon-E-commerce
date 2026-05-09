"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sellerService } from "@/services/seller"
import { SellerDashboard, SellerProfile } from "@/types"
import { toast } from "sonner"
import { SellerProfileFormData } from "@/schemas/seller-profile.schema"

export function useSellerDashboard() {
  return useQuery<SellerDashboard>({
    queryKey: ["seller-dashboard"],
    queryFn: () => sellerService.getDashboard().then((res) => res.data),
    staleTime: 60 * 1000,
  })
}

export function useSellerProfile() {
  return useQuery<SellerProfile>({
    queryKey: ["seller-profile"],
    queryFn: () => sellerService.getProfile().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateSellerProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SellerProfileFormData) => {
      const payload: Partial<SellerProfile> = {
        business_name: data.business_name,
        business_type: data.business_type,
        gstin: data.gstin || null,
        business_address: {
          line1: data.line1,
          line2: data.line2 || undefined,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: "India",
        },
      }
      return sellerService.updateProfile(payload).then((res) => res.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] })
      toast.success("Profile updated successfully")
    },
    onError: (error: any) => {
      let msg = "Failed to update profile"
      const detail = error?.response?.data?.detail
      if (typeof detail === "string") {
        msg = detail
      } else if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
        msg = detail[0].msg
      }
      toast.error(msg)
    },
  })
}
