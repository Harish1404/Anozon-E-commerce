/**
 * Admin API service layer.
 * Maps to all /admin/* backend endpoints.
 * Handles dashboard, users, sellers, products, reviews management.
 */
import api from '@/lib/axios';

export const adminService = {
  // ── Dashboard ──────────────────────────────────────────────────────────────
  getDashboard: () =>
    api.get("/admin/dashboard"),

  // ── Users ──────────────────────────────────────────────────────────────────
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) =>
    api.get("/admin/users", { params }),

  getUser: (user_id: string) =>
    api.get(`/admin/users/${user_id}`),

  banUser: (user_id: string) =>
    api.post(`/admin/users/${user_id}/ban`),

  unbanUser: (user_id: string) =>
    api.post(`/admin/users/${user_id}/unban`),

  // ── Sellers ────────────────────────────────────────────────────────────────
  getSellers: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get("/admin/sellers", { params }),

  /** Lightweight list of approved sellers for filter dropdowns */
  getSellersList: () =>
    api.get("/admin/sellers/list"),

  getPendingSellers: (limit = 50, skip = 0) =>
    api.get("/admin/sellers/pending", { params: { limit, skip } }),

  getSeller: (user_id: string) =>
    api.get(`/admin/sellers/${user_id}`),

  approveSeller: (user_id: string) =>
    api.post(`/admin/sellers/${user_id}/approve`),

  rejectSeller: (user_id: string, rejection_reason: string) =>
    api.post(`/admin/sellers/${user_id}/reject`, { rejection_reason }),

  suspendSeller: (user_id: string, suspend_reason: string) =>
    api.post(`/admin/sellers/${user_id}/suspend`, { suspend_reason }),

  unsuspendSeller: (user_id: string, unsuspend_reason: string) =>
    api.post(`/admin/sellers/${user_id}/unsuspend`, { unsuspend_reason }),

  // ── Products ───────────────────────────────────────────────────────────────
  getProducts: (params?: { page?: number; limit?: number; search?: string; category?: string; status?: string }) =>
    api.get("/admin/products", { params }),

  getPendingProducts: (limit = 50, skip = 0) =>
    api.get("/admin/products/pending", { params: { limit, skip } }),

  approveProduct: (product_id: string) =>
    api.post(`/admin/products/${product_id}/approve`),

  rejectProduct: (product_id: string, rejection_reason: string) =>
    api.post(`/admin/products/${product_id}/reject`, { rejection_reason }),

  // ── Reviews ────────────────────────────────────────────────────────────────
  getReviews: (params?: { page?: number; limit?: number; search?: string; product_id?: string; seller_id?: string; min_rating?: number; max_rating?: number }) =>
    api.get("/admin/reviews", { params }),

  deleteReview: (review_id: string, reason: string) =>
    api.delete(`/admin/reviews/${review_id}`, { data: { reason } }),

  // ── Categories (public) ────────────────────────────────────────────────────
  getCategories: () =>
    api.get("/categories"),
}
