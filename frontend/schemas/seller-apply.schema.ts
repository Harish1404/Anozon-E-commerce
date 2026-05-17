import { z } from "zod"

export const sellerApplySchema = z.object({
  business_name: z.string().min(3, "Business name must be at least 3 characters"),
  business_type: z.enum(["individual", "company", "partnership"], {
    message: "Select a business type",
  }),
  gstin: z.string().optional().or(z.literal("")),
  line1: z.string().min(5, "Address line 1 is required"),
  line2: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Must be a valid 6-digit pincode"),
  country: z.string().min(1, "Country is required"),
})

export type SellerApplyFormData = z.infer<typeof sellerApplySchema>
