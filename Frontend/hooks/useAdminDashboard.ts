/**
 * React Query hooks for all admin operations.
 * Follows the established pattern: queries for reads, mutations for writes.
 * All mutations invalidate relevant queries on success and show toasts.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { superAdminService } from '@/services/super-admin.service';
import { toast } from 'sonner';

// ── Query Keys (centralized for cache invalidation) ──────────────────────────

const KEYS = {
  dashboard: ['adminDashboard'],
  users: (params?: Record<string, any>) => ['adminUsers', params],
  user: (id: string) => ['adminUser', id],
  sellers: (params?: Record<string, any>) => ['adminSellers', params],
  seller: (id: string) => ['adminSeller', id],
  sellersList: ['adminSellersList'],
  products: (params?: Record<string, any>) => ['adminProducts', params],
  reviews: (params?: Record<string, any>) => ['adminReviews', params],
  admins: ['superAdminAdmins'],
  auditLogs: (params?: Record<string, any>) => ['auditLogs', params],
  categories: ['categories'],
} as const;


// ── Dashboard ────────────────────────────────────────────────────────────────

export function useAdminDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: async () => {
      const { data } = await adminService.getDashboard();
      return data;
    },
    staleTime: 30_000, // 30s — dashboard data is reasonably fresh
  });
}


// ── User Management ──────────────────────────────────────────────────────────

export function useAdminUsers(params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) {
  return useQuery({
    queryKey: KEYS.users(params),
    queryFn: async () => {
      const { data } = await adminService.getUsers(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: KEYS.user(id),
    queryFn: async () => {
      const { data } = await adminService.getUser(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (user_id: string) => adminService.banUser(user_id),
    onSuccess: () => {
      toast.success('User banned successfully');
      qc.invalidateQueries({ queryKey: ['adminUsers'] });
      qc.invalidateQueries({ queryKey: KEYS.dashboard });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to ban user');
    },
  });
}

export function useUnbanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (user_id: string) => adminService.unbanUser(user_id),
    onSuccess: () => {
      toast.success('User unbanned successfully');
      qc.invalidateQueries({ queryKey: ['adminUsers'] });
      qc.invalidateQueries({ queryKey: KEYS.dashboard });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to unban user');
    },
  });
}


// ── Seller Management ────────────────────────────────────────────────────────

export function useAdminSellers(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: KEYS.sellers(params),
    queryFn: async () => {
      const { data } = await adminService.getSellers(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useAdminSeller(user_id: string) {
  return useQuery({
    queryKey: KEYS.seller(user_id),
    queryFn: async () => {
      const { data } = await adminService.getSeller(user_id);
      return data;
    },
    enabled: !!user_id,
  });
}

export function useApproveSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (user_id: string) => adminService.approveSeller(user_id),
    onSuccess: () => {
      toast.success('Seller approved successfully');
      qc.invalidateQueries({ queryKey: ['adminSellers'] });
      qc.invalidateQueries({ queryKey: KEYS.dashboard });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to approve seller');
    },
  });
}

export function useRejectSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ user_id, reason }: { user_id: string; reason: string }) =>
      adminService.rejectSeller(user_id, reason),
    onSuccess: () => {
      toast.success('Seller application rejected');
      qc.invalidateQueries({ queryKey: ['adminSellers'] });
      qc.invalidateQueries({ queryKey: KEYS.dashboard });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to reject seller');
    },
  });
}

export function useSuspendSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ user_id, reason }: { user_id: string; reason: string }) =>
      adminService.suspendSeller(user_id, reason),
    onSuccess: () => {
      toast.success('Seller suspended');
      qc.invalidateQueries({ queryKey: ['adminSellers'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to suspend seller');
    },
  });
}

export function useUnsuspendSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ user_id, reason }: { user_id: string; reason: string }) =>
      adminService.unsuspendSeller(user_id, reason),
    onSuccess: () => {
      toast.success('Seller unsuspended');
      qc.invalidateQueries({ queryKey: ['adminSellers'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to unsuspend seller');
    },
  });
}


// ── Product Management ───────────────────────────────────────────────────────

export function useAdminProducts(params?: { page?: number; limit?: number; search?: string; category?: string; status?: string }) {
  return useQuery({
    queryKey: KEYS.products(params),
    queryFn: async () => {
      const { data } = await adminService.getProducts(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useApproveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (product_id: string) => adminService.approveProduct(product_id),
    onSuccess: () => {
      toast.success('Product approved successfully');
      qc.invalidateQueries({ queryKey: ['adminProducts'] });
      qc.invalidateQueries({ queryKey: KEYS.dashboard });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to approve product');
    },
  });
}

export function useRejectProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ product_id, reason }: { product_id: string; reason: string }) =>
      adminService.rejectProduct(product_id, reason),
    onSuccess: () => {
      toast.success('Product rejected');
      qc.invalidateQueries({ queryKey: ['adminProducts'] });
      qc.invalidateQueries({ queryKey: KEYS.dashboard });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to reject product');
    },
  });
}


// ── Review Management ────────────────────────────────────────────────────────

export function useAdminReviews(params?: { page?: number; limit?: number; search?: string; product_id?: string; seller_id?: string; min_rating?: number; max_rating?: number; sort_rating?: string }) {
  return useQuery({
    queryKey: KEYS.reviews(params),
    queryFn: async () => {
      const { data } = await adminService.getReviews(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useSellersList() {
  return useQuery({
    queryKey: KEYS.sellersList,
    queryFn: async () => {
      const { data } = await adminService.getSellersList();
      return data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ review_id, reason }: { review_id: string; reason: string }) =>
      adminService.deleteReview(review_id, reason),
    onSuccess: () => {
      toast.success('Review deleted');
      qc.invalidateQueries({ queryKey: ['adminReviews'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to delete review');
    },
  });
}


// ── Categories ───────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: KEYS.categories,
    queryFn: async () => {
      const { data } = await adminService.getCategories();
      return data;
    },
    staleTime: 5 * 60_000, // 5 min
  });
}


// ── Super Admin: Admin Management ────────────────────────────────────────────

export function useAdminList() {
  return useQuery({
    queryKey: KEYS.admins,
    queryFn: async () => {
      const { data } = await superAdminService.getAdmins();
      return data;
    },
  });
}

export function usePromoteToAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (user_id: string) => superAdminService.promoteToAdmin(user_id),
    onSuccess: () => {
      toast.success('User promoted to admin');
      qc.invalidateQueries({ queryKey: KEYS.admins });
      qc.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to promote user');
    },
  });
}

export function useDemoteToUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (user_id: string) => superAdminService.demoteToUser(user_id),
    onSuccess: () => {
      toast.success('Admin demoted to user');
      qc.invalidateQueries({ queryKey: KEYS.admins });
      qc.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to demote admin');
    },
  });
}


// ── Super Admin: Audit Logs ──────────────────────────────────────────────────

export function useAuditLogs(params?: { module?: string; action?: string; performed_by?: string; target?: string; date_from?: string; date_to?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: KEYS.auditLogs(params),
    queryFn: async () => {
      const { data } = await superAdminService.getAuditLogs(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}
