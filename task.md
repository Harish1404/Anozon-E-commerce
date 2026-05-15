Requirement Story — Anozon Admin & Super Admin Frontend (Next.js)

Context
Admin and Super Admin share the same dashboard layout and most pages. The difference is capability — certain actions and pages are visible only to Super Admin. Both roles are redirected to /admin/dashboard on login. A single (admin) route group handles both roles. Role-aware rendering controls what each sees within the same pages — no separate route groups needed.

Role Differentiation Strategy
Rather than building two separate frontends, use a single admin frontend with capability-based rendering:
typescript// hooks/useAdminRole.ts
const isSuperAdmin = user?.role === "super_admin"
const isAdmin = user?.role === "admin" || user?.role === "super_admin"
Super Admin sees everything Admin sees, plus additional actions. Components receive a permissions prop or read from useAuthStore directly to decide what to render.
Admin sees          →  seller management, product approval, user management, orders
Super Admin adds    →  admin management, audit logs, promote/demote controls

Middleware — Admin Route Protection
File: middleware.ts (update existing)
/admin/* routes
        │
        ├── No token              →  redirect to /login
        ├── Token valid
        │       role: admin       →  allow
        │       role: super_admin →  allow
        │       any other role    →  redirect to /
        └── Token expired         →  silent refresh attempt

Folder Structure
app/
├── (admin)/
│   ├── layout.tsx
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   ├── users/[id]/page.tsx
│   │   ├── sellers/page.tsx
│   │   ├── sellers/[id]/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/[id]/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   ├── admins/page.tsx           ← super_admin only
│   │   └── audit-logs/page.tsx       ← super_admin only

components/
├── admin/
│   ├── AdminSidebar.tsx
│   ├── AdminNavbar.tsx
│   ├── dashboard/
│   │   ├── AdminStatCard.tsx
│   │   ├── PendingApprovalWidget.tsx
│   │   ├── PendingSellerWidget.tsx
│   │   └── RecentActivityFeed.tsx
│   ├── user/
│   │   ├── UserTable.tsx
│   │   ├── UserDetailCard.tsx
│   │   └── UserActionMenu.tsx
│   ├── seller/
│   │   ├── SellerApplicationTable.tsx
│   │   ├── SellerDetailCard.tsx
│   │   ├── ApplicationStatusBadge.tsx
│   │   └── SellerActionMenu.tsx
│   ├── product/
│   │   ├── AdminProductTable.tsx
│   │   ├── AdminProductDetail.tsx
│   │   └── ApprovalActionBar.tsx
│   ├── order/
│   │   ├── AdminOrderTable.tsx
│   │   └── AdminOrderDetail.tsx
│   ├── admin-mgmt/                   ← super_admin only components
│   │   ├── AdminTable.tsx
│   │   └── PromoteUserDialog.tsx
│   └── audit/
│       ├── AuditLogTable.tsx
│       └── AuditLogFilters.tsx

hooks/
├── useAdminDashboard.ts
├── useAdminUsers.ts
├── useAdminSellers.ts
├── useAdminProducts.ts
├── useAdminOrders.ts
├── useAdminManagement.ts             ← super_admin only
└── useAuditLogs.ts                   ← super_admin only

services/
├── admin.service.ts
└── super-admin.service.ts

schemas/
└── admin.schema.ts

types/
└── index.ts

Layout — Admin Shell
File: app/(admin)/layout.tsx
Responsibilities:

Render AdminSidebar on left
Render AdminNavbar at top
Run silent refresh on mount
Verify role is admin or super_admin — if not redirect to /
Sidebar collapsible — state persisted in localStorage

AdminSidebar — links visible to both roles:
Dashboard          →  /admin/dashboard
Users              →  /admin/users
Sellers            →  /admin/sellers
Products           →  /admin/products
Orders             →  /admin/orders
AdminSidebar — links visible to super_admin only:
─────────────────────────────
Admin Management   →  /admin/admins
Audit Logs         →  /admin/audit-logs
Super admin only links are conditionally rendered based on role from useAuthStore. Admin never sees these links — not even grayed out. They simply do not exist in their sidebar.
AdminNavbar:

Logo on left
Role badge next to logo — Admin or Super Admin — so it is always clear which role is active
Notification bell (static for now)
Profile avatar dropdown on right

Profile dropdown:
Name + Role badge
─────────────────
Logout
Admin has no "Switch to Store" — admin accounts are separate from shopping. Super Admin same.
Mobile behavior:

Sidebar becomes a drawer via hamburger
Same pattern as seller sidebar


Services
typescript// services/admin.service.ts

export const adminService = {
  // Dashboard
  getDashboard: () =>
    api.get("/admin/dashboard"),

  // Users
  getUsers: (params?) =>
    api.get("/admin/users", { params }),

  getUser: (user_id: string) =>
    api.get(`/admin/users/${user_id}`),

  banUser: (user_id: string) =>
    api.post(`/admin/users/${user_id}/ban`),

  unbanUser: (user_id: string) =>
    api.post(`/admin/users/${user_id}/unban`),

  // Sellers
  getSellers: (params?) =>
    api.get("/admin/sellers", { params }),

  getSeller: (user_id: string) =>
    api.get(`/admin/sellers/${user_id}`),

  approveSeller: (user_id: string) =>
    api.post(`/admin/sellers/${user_id}/approve`),

  rejectSeller: (user_id: string, rejection_reason: string) =>
    api.post(`/admin/sellers/${user_id}/reject`, { rejection_reason }),

  suspendSeller: (user_id: string, reason: string) =>
    api.post(`/admin/sellers/${user_id}/suspend`, { reason }),

  unsuspendSeller: (user_id: string) =>
    api.post(`/admin/sellers/${user_id}/unsuspend`),

  // Products
  getProducts: (params?) =>
    api.get("/admin/products", { params }),

  getProduct: (product_id: string) =>
    api.get(`/admin/products/${product_id}`),

  approveProduct: (product_id: string) =>
    api.post(`/admin/products/${product_id}/approve`),

  removeProduct: (product_id: string, reason: string) =>
    api.delete(`/admin/products/${product_id}`, { data: { reason } }),

  // Orders
  getOrders: (params?) =>
    api.get("/admin/orders", { params }),

  getOrder: (order_id: string) =>
    api.get(`/admin/orders/${order_id}`)
}
typescript// services/super-admin.service.ts

export const superAdminService = {
  // Admin management
  getAdmins: () =>
    api.get("/super-admin/admins"),

  promoteToAdmin: (user_id: string) =>
    api.post(`/super-admin/promote-admin/${user_id}`),

  demoteToUser: (user_id: string) =>
    api.post(`/super-admin/demote/${user_id}`),

  // User search for promotion
  searchUsers: (query: string) =>
    api.get("/admin/users", { params: { search: query, role: "user" } }),

  // Audit logs
  getAuditLogs: (params?) =>
    api.get("/super-admin/audit-logs", { params })
}

Page Stories

Page 1 — Admin Dashboard
File: app/(admin)/admin/dashboard/page.tsx
User story: As an admin I want a summary of platform activity so I can see what needs immediate attention.
What this page does:

Fetches dashboard data via useAdminDashboard hook
Renders platform-wide stat cards
Renders pending seller applications widget — needs action
Renders pending product approvals widget — needs action
Renders recent activity feed

Component responsibilities:
AdminStatCard — receives label, value, icon, variant. Same pattern as seller StatCard but with admin-relevant metrics. Renders one metric. Used for total users, total sellers, total products, total orders, total revenue.
PendingSellerWidget — receives count of pending seller applications and list of 3 most recent ones. Renders compact list with applicant name, business name, applied date, Review button. Review button navigates to /admin/sellers?status=pending. "View All" link at bottom.
PendingApprovalWidget — receives count of pending products and list of 3 most recent. Renders compact list with product name, seller name, submitted date, Review button. Review navigates to /admin/products?status=pending. "View All" link at bottom.
RecentActivityFeed — receives recent audit log entries. Renders timeline-style feed with avatar, description sentence, timestamp. Example: "You approved seller application from Jane Smith — 2 hours ago". Shows last 10 entries. "View Full Log" link navigates to audit logs page — visible only to super_admin.
Dashboard layout — desktop:
Row 1 — 5 stat cards
  Total Users | Total Sellers | Total Products | Total Orders | Total Revenue

Row 2 — 3 action widgets
  Pending Sellers | Pending Products | Recent Activity (taller, spans more)
Super Admin additions on dashboard:

Total Admins stat card added to Row 1
Recent Activity Feed shows full audit log including admin promotions


Page 2 — User Management
File: app/(admin)/admin/users/page.tsx
User story: As an admin I want to view all users, search by name or email, filter by status, and take action on accounts.
What this page does:

Fetches users via useAdminUsers hook with filter params
Renders search input — searches by name or email
Renders filter tabs — All, Verified, Unverified, Banned
Renders UserTable with paginated results
Clicking a user row navigates to user detail page

Component responsibilities:
UserTable — receives users array. Renders table with columns — Avatar, Name, Email, Role, Verified, Joined Date, Status, Actions. Actions column renders UserActionMenu.
UserActionMenu — receives user object and role of current admin. Renders dropdown with context-aware actions:
User is active     →  View Detail, Ban User
User is banned     →  View Detail, Unban User
User role is user  →  (super_admin only) Promote to Admin
Ban and Unban open a confirmation AlertDialog before calling mutation. Promote to Admin only visible and functional for super_admin — admin never sees this option.
User detail page: app/(admin)/admin/users/[id]/page.tsx
UserDetailCard — renders full user info — name, email, role, verified status, joined date, last login. Below that renders user's orders (count and list), and if they have a seller profile, a link to seller detail.

Page 3 — Seller Management
File: app/(admin)/admin/sellers/page.tsx
User story: As an admin I want to manage all seller applications and active sellers — approve, reject, suspend, and unsuspend.
What this page does:

Fetches sellers via useAdminSellers hook
Renders status filter tabs — All, Pending, Approved, Rejected, Suspended
Pending tab is the default — this is the most action-required view
Renders SellerApplicationTable
Clicking a row navigates to seller detail page

Component responsibilities:
SellerApplicationTable — receives sellers array. Renders table with columns — Business Name, Owner Name, Email, Type, Applied Date, Status, Actions. Actions column renders SellerActionMenu.
SellerActionMenu — receives seller object. Renders dropdown with status-aware actions:
status: pending    →  Approve, Reject
status: approved   →  Suspend, View Detail
status: rejected   →  View Detail
status: suspended  →  Unsuspend, View Detail
ApplicationStatusBadge — receives status string. Renders colored badge:
pending    →  yellow   "Pending Review"
approved   →  green    "Approved"
rejected   →  red      "Rejected"
suspended  →  orange   "Suspended"
Reject flow — requires reason:
Reject button opens a Dialog not AlertDialog — dialog has a textarea for rejection reason. Reason is required — submit button disabled if textarea is empty. On confirm calls useRejectSeller mutation with reason.
Suspend flow — requires reason:
Same pattern as reject — dialog with required reason textarea.
Seller detail page: app/(admin)/admin/sellers/[id]/page.tsx
SellerDetailCard — renders full seller info in sections:
Section 1 — Business Info
  business_name, business_type, gstin, pan_number
  Application status badge + rejection reason if rejected
  Reviewed by + reviewed at if actioned

Section 2 — Business Address
  Full address display

Section 3 — Performance
  total_products, total_orders, rating, is_suspended

Section 4 — Bank Details
  account_holder, bank_name, ifsc_code
  Account number masked — show last 4 digits only
  "****1234" — protect sensitive data in UI

Section 5 — Action Bar (ApprovalActionBar)
  Context-aware buttons based on current status
ApprovalActionBar — receives seller status and callbacks. Renders the correct action buttons for current state. Approve and Reject for pending. Suspend for approved. Unsuspend for suspended. No actions for rejected — read only.

Page 4 — Product Management
File: app/(admin)/admin/products/page.tsx
User story: As an admin I want to review all products — approve pending ones and remove policy-violating ones.
What this page does:

Fetches products via useAdminProducts hook
Renders filter tabs — All, Pending Approval, Approved, Removed
Pending Approval tab is default — most action-required
Renders AdminProductTable
Clicking a product navigates to product detail

Component responsibilities:
AdminProductTable — receives products array. Renders table with columns — Image, Name, Category, Seller Name, Price, Stock, Approval Status, Listed Date, Actions.
Actions per product:
is_approved: false  →  Approve, Remove
is_approved: true   →  Remove
Approve — AlertDialog "Approve this product? It will become visible to all buyers." Confirm calls useApproveProduct mutation.
Remove — Dialog with required reason textarea. Reason stored in audit log. Confirm calls useRemoveProduct mutation.
Product detail page: app/(admin)/admin/products/[id]/page.tsx
AdminProductDetail — renders full product info admin needs to make approval decision:
Product images      ← review for policy compliance
Name, description   ← review for accuracy
Category, price     ← verify correct categorization
Seller info         ← who listed this — link to seller detail
Stock level
Approval status
Reviews if any
ApprovalActionBar at bottom — Approve or Remove buttons. Same component as seller detail but configured for product actions.

Page 5 — Order Management
File: app/(admin)/admin/orders/page.tsx
User story: As an admin I want to view all platform orders for oversight and dispute resolution.
What this page does:

Fetches all orders via useAdminOrders hook
Renders filter tabs — All, Pending, Confirmed, Shipped, Delivered, Cancelled
Renders search by order ID or user email
Renders AdminOrderTable
Clicking order navigates to detail

Component responsibilities:
AdminOrderTable — receives orders array. Renders table with columns — Order ID, Buyer Name, Seller Count, Item Count, Total, Payment Status, Order Status, Date, Actions. Actions — View Detail only. Admin does not update order status — that is seller responsibility.
Admin order detail page: app/(admin)/admin/orders/[id]/page.tsx
AdminOrderDetail — renders full order with all items from all sellers — unlike seller who sees only their own items, admin sees everything:
Buyer info           ← name, email, shipping address
All items            ← all items regardless of seller, with seller name per item
Per-item status      ← each item's current status
Order summary        ← full financials
Payment info         ← method and status
Timeline             ← order status history if tracked
Admin view is read-only. No status update buttons. Admin oversight only.

Page 6 — Admin Management (Super Admin Only)
File: app/(admin)/admin/admins/page.tsx
User story: As a super admin I want to manage who has admin access — view current admins, promote users to admin, and demote admins.
Middleware adds extra check:
/admin/admins/*
        │
        └── role must be super_admin specifically
            admin role → redirect to /admin/dashboard
What this page does:

Fetches current admins via useAdminManagement hook
Renders AdminTable of current admins
Renders "Promote User to Admin" button — opens PromoteUserDialog
Demote action per admin in table

Component responsibilities:
AdminTable — receives admins array. Renders table with columns — Avatar, Name, Email, Promoted Date, Actions. Actions — Demote to User button per row. Cannot demote self — button disabled with tooltip "Cannot demote yourself".
PromoteUserDialog — renders Dialog with user search input. Super admin types email or name — dropdown shows matching users with role "user". Select a user — confirm promotes them. Uses useDebouncedSearch hook internally to search users as super admin types.
Promote flow:
Super admin opens dialog
        │
        ├── Types name or email
        ├── Matching users appear in dropdown
        ├── Selects user
        ├── Confirmation step — "Promote {name} to Admin?"
        └── Confirm → mutation → success toast → table refreshes
Demote flow:
Super admin clicks Demote on a row
        │
        ├── AlertDialog — "Demote {name} from Admin to User?"
        │       "They will lose all admin access immediately."
        └── Confirm → mutation → success toast → table refreshes

Page 7 — Audit Logs (Super Admin Only)
File: app/(admin)/admin/audit-logs/page.tsx
User story: As a super admin I want to see a full history of all admin actions across the platform so I can monitor what is happening and investigate issues.
Same middleware extra check as admin management — super_admin only.
What this page does:

Fetches audit logs via useAuditLogs hook with filter params
Renders AuditLogFilters panel
Renders AuditLogTable with paginated results
No actions — read only, append only data

Component responsibilities:
AuditLogFilters — renders filter controls:
Module filter    →  select — all, role_management, seller, user, product
Action filter    →  select — populated based on selected module
Performed by     →  text input — search by admin email
Target user      →  text input — search by affected user email
Date range       →  date from + date to pickers
Filters are applied and URL updated on change. Filters persist in URL so the log view is shareable and bookmarkable.
AuditLogTable — receives audit log entries array. Renders table with columns — Timestamp, Performed By, Action, Target User, Description, Reason.
Description column renders the human readable sentence from the audit log document:
"Promoted John Doe from user to admin"
"Rejected seller application from Jane Smith — incomplete documents"
"Suspended seller Mike Ross — policy violation"
Reason column shows reason if present, dash if not.
Pagination — 20 entries per page. Page controls at bottom. Total count shown — "Showing 1-20 of 347 entries".

Hooks
useAdminDashboard      →  GET /admin/dashboard
useAdminUsers          →  GET /admin/users with params
useAdminUser           →  GET /admin/users/{id}
useBanUser             →  POST /admin/users/{id}/ban
useUnbanUser           →  POST /admin/users/{id}/unban
useAdminSellers        →  GET /admin/sellers with params
useAdminSeller         →  GET /admin/sellers/{id}
useApproveSeller       →  POST /admin/sellers/{id}/approve
useRejectSeller        →  POST /admin/sellers/{id}/reject
useSuspendSeller       →  POST /admin/sellers/{id}/suspend
useUnsuspendSeller     →  POST /admin/sellers/{id}/unsuspend
useAdminProducts       →  GET /admin/products with params
useAdminProduct        →  GET /admin/products/{id}
useApproveProduct      →  POST /admin/products/{id}/approve
useRemoveProduct       →  DELETE /admin/products/{id}
useAdminOrders         →  GET /admin/orders with params
useAdminOrder          →  GET /admin/orders/{id}
useAdminManagement     →  GET /super-admin/admins
usePromoteToAdmin      →  POST /super-admin/promote-admin/{id}
useDemoteToUser        →  POST /super-admin/demote/{id}
useAuditLogs           →  GET /super-admin/audit-logs with params
All mutation hooks follow same pattern — onSuccess invalidates relevant queries and shows toast, onError shows error toast with backend message.

Schemas
schemas/admin.schema.ts:
rejection_reason   →  string, min 10 chars, max 500 chars, required
suspend_reason     →  string, min 10 chars, max 500 chars, required
remove_reason      →  string, min 10 chars, max 500 chars, required
ban_reason         →  string, min 10 chars, max 500 chars, required
All reason fields have minimum 10 characters — forces admins to write meaningful reasons, not just "bad" or "no".

Role Aware Rendering Summary
Component or page       Admin sees          Super Admin sees
────────────────────────────────────────────────────────────
Sidebar audit logs      hidden              visible
Sidebar admin mgmt      hidden              visible
Dashboard activity      own actions only    all actions
User action menu        ban/unban only      ban/unban + promote
AdminTable demote btn   not rendered        rendered
Promote dialog          not rendered        rendered
/admin/admins route     redirected away     accessible
/admin/audit-logs route redirected away     accessible
Single frontend, capability-based rendering. No duplicate pages, no separate route groups for the two roles.

Build Order for Admin Frontend
1.  Admin layout — sidebar, navbar, role-aware sidebar links
2.  Dashboard page — first page after login
3.  Seller management — highest priority admin action
4.  Product management — second highest priority
5.  User management — view and ban
6.  Order management — oversight only, read heavy
7.  Admin management page — super_admin only
8.  Audit logs page — super_admin only, build last

Key Differences from Seller Frontend
Seller frontend    →  manages own data only, ownership scoped
Admin frontend     →  manages all platform data, no ownership scope
Seller sidebar     →  product and order focused
Admin sidebar      →  people and platform focused
Seller actions     →  create, edit, update status
Admin actions      →  approve, reject, ban, suspend — never create
Seller orders      →  sees own items only per order
Super admin adds   →  admin management and audit logs on top of everything
Everything else — layout pattern, hook conventions, service layer, form validation, error handling, loading skeletons — is identical across user, seller, and admin frontends.