import { z } from "zod"

export const sellerProfileSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  business_type: z.enum(["individual", "company", "partnership"], "Please select a business type"),
  gstin: z.string(),
  line1: z.string().min(5, "Address line 1 must be at least 5 characters"),
  line2: z.string(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
})

export type SellerProfileFormData = z.infer<typeof sellerProfileSchema>
