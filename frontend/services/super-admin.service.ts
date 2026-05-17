/**
 * Super Admin API service layer.
 * Maps to all /super-admin/* backend endpoints.
 * Handles admin management, promotion/demotion, and audit logs.
 */
import api from '@/lib/axios';

export const superAdminService = {
  // ── Admin Management ───────────────────────────────────────────────────────
  getAdmins: () =>
    api.get("/super-admin/admins"),

  promoteToAdmin: (user_id: string) =>
    api.post(`/super-admin/promote-admin/${user_id}`),

  demoteToUser: (user_id: string) =>
    api.post(`/super-admin/demote/${user_id}`),

  // ── User Search (for promotion dialog) ─────────────────────────────────────
  searchUsers: (query: string) =>
    api.get("/admin/users", { params: { search: query, role: "user", limit: 10 } }),

  // ── Audit Logs ─────────────────────────────────────────────────────────────
  getAuditLogs: (params?: {
    module?: string;
    action?: string;
    performed_by?: string;
    target?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }) => api.get("/super-admin/audit-logs", { params }),
}
