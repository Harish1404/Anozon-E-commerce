// types/index.ts

export type Role = "super_admin" | "admin" | "seller" | "user"

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "partially_shipped"
  | "shipped"
  | "partially_delivered"
  | "delivered"
  | "cancelled"

export type PaymentStatus = "pending" | "paid" | "failed"
export type PaymentMethod = "cod" | "online"
export type ApplicationStatus = "pending" | "approved" | "rejected"

// ── Auth ──────────────────────────────────────────────────────────────────

export interface User {
  _id: string
  email: string
  username?: string
  role: Role
}

export interface AuthResponse {
  access_token: string
  token_type: string
  role: Role
}

// ── Profile ───────────────────────────────────────────────────────────────

export interface Address {
  address_id: string
  label: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  mobile: string
  is_default: boolean
}

export interface UserProfile {
  _id: string
  user_id: string
  email: string
  full_name: string | null
  mobile: string | null
  avatar_url: string | null
  addresses: Address[]
  updated_at: string
}

// ── Products ──────────────────────────────────────────────────────────────

export interface Product {
  _id: string
  seller_id: string
  name: string
  slug: string
  description: string
  category: string
  actual_price: number
  discount_percent: number
  price: number
  stock: number
  image_urls: string[]
  is_active: boolean
  is_approved: boolean
  avg_rating: number
  review_count: number
  product_likes: number
  recent_reviews?: Review[]
  seller_details?: {
    business_name?: string
    business_type?: string
    rating?: number
  }
  brand?: string
  sub_category?: string
  tags?: string[]
  specifications?: Record<string, unknown>
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  sku?: string
  variants?: string[]
  meta_title?: string
  meta_desc?: string
  is_featured?: boolean
  view_count?: number
  search_keywords?: string[]
  created_at: string
  updated_at: string
}

export interface PaginatedProductResponse {
  items: Product[]
  total: number
  page: number
  limit: number
  pages: number
}

// ── Reviews ───────────────────────────────────────────────────────────────

export interface Review {
  _id: string
  product_id: string
  user_id: string
  reviewer_name: string
  rating: number
  comment: string
  is_verified_purchase: boolean
  created_at: string
}

// ── Cart ──────────────────────────────────────────────────────────────────

export interface CartItem {
  product_id: string
  name: string
  image: string
  price: number
  quantity: number
  item_total: number
}

export interface CartSummary {
  item_count: number
  subtotal: number
  gst_rate: number
  gst_amount: number
  delivery_charge: number
  free_delivery_eligible: boolean
  total: number
}

export interface Cart {
  items: CartItem[]
  summary: CartSummary
}

// ── Wishlist ──────────────────────────────────────────────────────────────

export interface WishlistItem {
  product_id: string
  name: string
  image: string
  price: number
  added_at: string
}

// Legacy alias
export type Wishlist = WishlistItem



// ── Orders ────────────────────────────────────────────────────────────────

export interface OrderItem {
  product_id: string
  seller_id: string
  name: string
  image: string
  price: number
  quantity: number
  item_total: number
  item_status: OrderStatus
  status_updated_at: string | null
}

export interface ShippingAddress {
  full_name: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  mobile: string
}

export interface OrderSummary {
  subtotal: number
  gst_rate: number
  gst_amount: number
  delivery_charge: number
  total: number
}

export interface Order {
  _id: string
  user_id: string
  items: OrderItem[]
  shipping_address: ShippingAddress
  order_status: OrderStatus
  summary: OrderSummary
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  created_at: string
  updated_at: string
}

export interface PaginatedOrderResponse {
  items: Order[]
  total: number
  page: number
  limit: number
  pages: number
}

// ── Seller ────────────────────────────────────────────────────────────────

export type ItemStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"

export interface BusinessAddress {
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface SellerProfile {
  _id: string
  user_id: string
  email: string
  business_name: string
  business_type: "individual" | "company" | "partnership"
  gstin: string | null
  pan_number: string | null
  business_address: BusinessAddress
  application_status: ApplicationStatus
  rejection_reason: string | null
  is_suspended: boolean
  total_products: number
  total_orders: number
  rating: number | null
  total_reviews?: number
  created_at: string
}

export interface WeeklyRevenueEntry {
  day: string
  revenue: number
  is_today: boolean
}

export interface TopProduct {
  product_id: string
  name: string
  image: string
  units_sold: number
  revenue: number
  avg_rating?: number
}

export interface RecentOrderEntry {
  order_id: string
  created_at: string
  item_count: number
  seller_total: number
  order_status: OrderStatus
  buyer_first_name: string
}

export interface SellerDashboard {
  products: {
    total: number
    active: number
    pending_approval: number
    out_of_stock: number
    low_stock: number
    hidden: number
  }
  orders: {
    total: number
    confirmed: number
    shipped: number
    delivered: number
    cancelled: number
  }
  revenue: {
    all_time: number
    this_month: number
    this_week: number
    today: number
  }
  weekly_revenue: WeeklyRevenueEntry[]
  top_products: TopProduct[]
  recent_orders: RecentOrderEntry[]
  store: {
    avg_rating: number
    total_reviews: number
  }
}

export interface SellerOrderItem {
  product_id: string
  seller_id: string
  name: string
  image: string
  price: number
  quantity: number
  item_total: number
  item_status: ItemStatus
  status_updated_at?: string | null
}

export interface SellerOrder {
  _id: string
  items: SellerOrderItem[]
  shipping_address: Omit<ShippingAddress, "mobile">
  order_status: OrderStatus
  seller_total: number
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  created_at: string
  updated_at: string
}

export interface PaginatedSellerProductResponse {
  items: Product[]
  total: number
  page: number
  limit: number
}

export interface PaginatedSellerOrderResponse {
  items: SellerOrder[]
  total: number
  page: number
  limit: number
}

// ── Seller Application ───────────────────────────────────────────────────

export interface SellerApplicationStatusResponse {
  application_status: ApplicationStatus | null
  submitted_at: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  reapply_attempts_remaining: number
}

// ── Seller Reviews ───────────────────────────────────────────────────────

export interface SellerProductReviewsResponse {
  product_id: string
  product_name: string
  avg_rating: number
  review_count: number
  reviews: Review[]
  page: number
  limit: number
}
