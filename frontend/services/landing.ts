import api from "@/lib/axios"
import { LandingPageResponse } from "@/types"

export const landingService = {
  getLandingPage: () =>
    api.get<LandingPageResponse>("/landing"),
}
