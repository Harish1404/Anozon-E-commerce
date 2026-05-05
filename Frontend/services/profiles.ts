// services/profile.service.ts
import api from "@/lib/axios"
import { UserProfile, Address } from "@/types"

export const profileService = {
  getProfile: () =>
    api.get<UserProfile>("/users/profile"),

  updateProfile: (data: Partial<Pick<UserProfile, "full_name" | "mobile" | "avatar_url">>) =>
    api.put("/users/profile", data),

  addAddress: (address: Omit<Address, "address_id">) =>
    api.post("/users/profile/address", address),

  updateAddress: (address_id: string, data: Partial<Address>) =>
    api.put(`/users/profile/address/${address_id}`, data),

  deleteAddress: (address_id: string) =>
    api.delete(`/users/profile/address/${address_id}`)
}