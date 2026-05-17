import { z } from "zod"

export const checkoutSchema = z.object({
  address_id: z.string().min(1, "Please select a delivery address"),
  payment_method: z.enum(["cod", "online"], {
    error: "Please select a payment method",
  }),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
