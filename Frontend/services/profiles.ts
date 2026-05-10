// services/profile.service.ts
import api from "@/lib/axios"
import { UserProfile, Address, SellerApplicationStatusResponse } from "@/types"

export const profileService = {
  getProfile: () =>
    api.get<UserProfile>("/users/profile"),

  updateProfile: (data: Partial<Pick<UserProfile, "full_name" | "mobile" | "avatar_url">>) =>
    api.put("/users/profile", data),

  addAddress: (address: Omit<Address, "address_id">) =>
    api.post("/users/addresses", address),

  updateAddress: (address_id: string, data: Partial<Address>) =>
    api.put(`/users/addresses/${address_id}`, data),

  deleteAddress: (address_id: string) =>
    api.delete(`/users/addresses/${address_id}`),

  // Seller Application
  applyForSeller: (data: {
    business_name: string
    business_type: string
    gstin?: string
    business_address: {
      line1: string
      line2?: string
      city: string
      state: string
      pincode: string
      country: string
    }
  }) =>
    api.post<{ message: string }>("/users/seller-apply", data),

  getSellerApplicationStatus: () =>
    api.get<SellerApplicationStatusResponse>("/users/seller-apply/status"),
}