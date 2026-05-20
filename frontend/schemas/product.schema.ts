import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  actual_price: z
    .number()
    .int("Price must be a whole number")
    .positive("Price must be greater than 0"),
  discount_percent: z
    .number()
    .int("Discount must be a whole number")
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%"),
  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  image_urls: z
    .array(z.string().url("Must be a valid URL (starting with http:// or https://)"))
    .min(3, "At least 3 images are required")
    .max(5, "Maximum 5 images allowed"),

  // 12 Rich Schema Fields (Optional to avoid Zod input/output mismatches)
  brand: z.string().optional(),
  sub_category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  weight: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(0, "Weight cannot be negative").optional()
  ),
  dimensions: z
    .object({
      length: z.preprocess(
        (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
        z.number().min(0, "Length cannot be negative").optional()
      ),
      width: z.preprocess(
        (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
        z.number().min(0, "Width cannot be negative").optional()
      ),
      height: z.preprocess(
        (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
        z.number().min(0, "Height cannot be negative").optional()
      ),
    })
    .optional(),
  sku: z.string().optional().nullable(),
  variants: z.array(z.string()).optional(),
  meta_title: z.string().optional().nullable(),
  meta_desc: z.string().optional().nullable(),
  is_featured: z.boolean().optional(),
  search_keywords: z.array(z.string()).optional(),
})

export type ProductFormData = z.infer<typeof productSchema>
