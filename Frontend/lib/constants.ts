// lib/constants.ts

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing & Apparel",
  "Home & Kitchen",
  "Books & Stationery",
  "Sports & Fitness",
  "Beauty & Personal Care",
  "Toys & Games",
  "Automotive",
  "Health & Wellness",
  "Food & Grocery",
  "Jewellery & Accessories",
  "Furniture & Decor",
  "Pet Supplies",
  "Other",
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry",
] as const

export const ITEM_STATUS_TRANSITIONS: Record<string, string[]> = {
  confirmed: ["shipped", "cancelled"],
  shipped:   ["delivered"],
  delivered: [],
  cancelled: [],
  pending:   ["confirmed", "cancelled"],
}

export const ITEM_STATUS_LABELS: Record<string, string> = {
  pending:   "Pending",
  confirmed: "Confirmed",
  shipped:   "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}
