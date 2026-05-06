"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { profileService } from "@/services/profiles"
import { UserProfile, Address } from "@/types"

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: () => profileService.getProfile().then((res) => res.data),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Pick<UserProfile, "full_name" | "mobile" | "avatar_url">>) =>
      profileService.updateProfile(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}

export function useAddAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (address: Omit<Address, "address_id">) =>
      profileService.addAddress(address).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ address_id, data }: { address_id: string; data: Partial<Address> }) =>
      profileService.updateAddress(address_id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (address_id: string) =>
      profileService.deleteAddress(address_id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}
