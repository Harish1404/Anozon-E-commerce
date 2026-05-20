"use client"

import { useQuery } from "@tanstack/react-query"
import { landingService } from "@/services/landing"
import { LandingPageResponse } from "@/types"

export function useLanding() {
  return useQuery<LandingPageResponse>({
    queryKey: ["landing"],
    queryFn: () => landingService.getLandingPage().then((res) => res.data),
    staleTime: 4 * 60 * 1000, // 4 min — slightly under the 5 min Redis TTL
  })
}
