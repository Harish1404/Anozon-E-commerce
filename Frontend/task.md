Context

Seller frontend is a dashboard experience — completely separate from the user shopping interface. When a user with role seller logs in, they are redirected to /seller/dashboard automatically. Seller has their own layout with sidebar navigation. All seller pages live under the (seller) route group. Architecture follows the same separation of concerns as the user frontend — four layers: page, component, hook, service.

Redirect Logic on Login

Login page already exists in (auth). After successful login the redirect is role based:
role: user         →  /
role: seller       →  /seller/dashboard
role: admin        →  /admin/dashboard
role: super_admin  →  /admin/dashboard

This lives in useLogin hook's onSuccess callback. No change needed to the login page itself.

Middleware — Seller Route Protection
File: middleware.ts (update existing)
/seller/* routes
        │
        ├── No token          →  redirect to /login
        ├── Token valid        →  check role
        │       role is seller →  allow
        │       role is not seller →  redirect to /
        └── Token expired     →  silent refresh attempt
Seller cannot access user shopping routes as a seller — middleware redirects them to seller dashboard. They can still shop by accessing the user layout but middleware distinguishes the contexts clearly.

Folder Structure
app/
├── (seller)/
│   ├── layout.tsx                        ← seller shell, sidebar + top navbar
│   ├── seller/
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/new/page.tsx
│   │   ├── products/[id]/page.tsx
│   │   ├── products/[id]/edit/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   └── profile/page.tsx

components/
├── seller/
│   ├── SellerSidebar.tsx
│   ├── SellerNavbar.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── RevenueCard.tsx
│   │   ├── StockAlertList.tsx
│   │   └── RecentOrderList.tsx
│   ├── product/
│   │   ├── SellerProductCard.tsx
│   │   ├── SellerProductTable.tsx
│   │   ├── ProductForm.tsx
│   │   ├── StockUpdateDialog.tsx
│   │   └── ProductStatusBadge.tsx
│   └── order/
│       ├── SellerOrderCard.tsx
│       ├── SellerOrderDetail.tsx
│       ├── SellerOrderItemRow.tsx
│       └── ItemStatusUpdateDialog.tsx

hooks/
├── useSeller.ts                          ← dashboard, profile
├── useSellerProducts.ts
└── useSellerOrders.ts

services/
└── seller.service.ts                     ← already written

schemas/
├── product.schema.ts                     ← create and edit product form
└── seller-profile.schema.ts

types/
└── index.ts                              ← already has seller types

Layout — Seller Shell
File: app/(seller)/layout.tsx
Responsibilities:

Render SellerSidebar on left
Render SellerNavbar at top
Run silent refresh on mount to restore auth session
Verify role is seller after session restore — if not, redirect to appropriate page
Sidebar collapsible — collapse state persisted in localStorage

SellerSidebar links:
Dashboard        →  /seller/dashboard
Products         →  /seller/products
Orders           →  /seller/orders
Profile          →  /seller/profile
─────────────────
Switch to Store  →  /              ← goes to user shopping storefront
Switch to Store opens the user shopping experience in the same tab. Seller is still a buyer — this link reminds them they can shop too.
SellerNavbar:

Logo on left
Business name from seller profile in center
Notification bell (static for now, no real-time)
Profile avatar dropdown on right

Profile avatar dropdown:
Business Name
─────────────
Seller Profile
─────────────
Switch to Store
─────────────
Logout
Mobile behavior:

Sidebar becomes a drawer triggered by hamburger in top navbar
Overlay closes drawer on outside click
All sidebar links close drawer on navigation


Page Stories

Page 1 — Seller Dashboard
File: app/(seller)/seller/dashboard/page.tsx
User story: As a seller I want to see a summary of my store performance at a glance so I know what needs attention immediately.
What this page does:

Fetches dashboard data via useSellerDashboard hook
Renders stat cards for product and order counts
Renders revenue cards for all time, this month, this week
Renders low stock alert list — products with stock below 10
Renders recent orders list — last 5 orders
Renders pending approval count — products waiting for admin approval

Component responsibilities:
StatCard — receives label, value, icon, optional color variant. Renders single metric box. Used for total products, active products, pending approval, out of stock, total orders, confirmed orders, shipped orders, delivered orders. Purely presentational.
RevenueCard — receives label and amount. Renders formatted currency value. Three instances — all time, this month, this week.
StockAlertList — receives array of low stock products. Renders compact list with product name, current stock, and a quick Update Stock button that opens StockUpdateDialog inline. Clicking a product name navigates to product edit page.
RecentOrderList — receives array of recent orders. Renders compact list with order ID, buyer name masked, item count, total, status badge. Clicking an order navigates to order detail page.
Empty states:

No products yet — "You haven't listed any products. Create your first product." with link to create page
No orders yet — "No orders received yet. Your orders will appear here."

Dashboard data layout — desktop:
Row 1 — 4 stat cards   (Total Products, Active, Pending Approval, Out of Stock)
Row 2 — 4 stat cards   (Total Orders, Confirmed, Shipped, Delivered)
Row 3 — 3 revenue cards (All Time, This Month, This Week) + Store rating
Row 4 — Stock Alerts (left) | Recent Orders (right)

Page 2 — Products List
File: app/(seller)/seller/products/page.tsx
User story: As a seller I want to view all my products with their status and stock so I can manage my catalogue efficiently.
What this page does:

Fetches seller products via useSellerProducts hook with filter params
Renders status filter tabs — All, Active, Inactive, Pending Approval, Out of Stock
Renders search input to filter by product name
Renders SellerProductTable with fetched products
Create New Product button navigates to /seller/products/new

Component responsibilities:
SellerProductTable — receives products array. Renders table with columns — Image, Name, Category, Price, Stock, Status, Approval, Actions. Actions column has Edit, Toggle, Update Stock, Delete buttons per row.
ProductStatusBadge — receives is_active and is_approved booleans. Renders combined status:
is_approved: false                →  "Pending Approval"  yellow
is_approved: true, is_active: true  →  "Live"              green
is_approved: true, is_active: false →  "Hidden"            gray
StockUpdateDialog — receives product id and current stock. Renders shadcn Dialog with a single number input and Save button. Calls useUpdateStock mutation on save. Closes on success with toast.
Inline actions behavior:
Toggle — calls useToggleProduct mutation immediately, no confirmation needed. Toast confirms action.
Delete — opens shadcn AlertDialog for confirmation. "This product will be removed from your store. This cannot be undone." Confirm calls useDeleteProduct mutation.
Update Stock — opens StockUpdateDialog inline. No navigation.
Edit — navigates to /seller/products/[id]/edit.
Empty state: "No products found. Create your first product to start selling." with Create Product button.

Page 3 — Create Product
File: app/(seller)/seller/products/new/page.tsx
User story: As a seller I want to create a new product listing by filling in all product details so it goes for admin approval.
What this page does:

Renders ProductForm with empty initial values
On submit calls useCreateProduct mutation
On success — navigates to /seller/products with toast "Product submitted for approval"
On duplicate error (409) — shows inline error "You already have a product with this name. Edit the existing listing instead."
On restore response (200) — shows toast "Previously deleted product restored and resubmitted for approval"

Component responsibilities:
ProductForm — receives optional initial values and onSubmit callback. Manages own form state with React Hook Form and Zod. Renders all product fields. Fires onSubmit with form data. Used for both create and edit — same component.
Form fields and validation:
name           →  required, min 3 chars
description    →  required, min 20 chars
category       →  required, select from category list
price          →  required, greater than 0
discount_price →  optional, must be less than price if provided
stock          →  required, 0 or above
images         →  optional, list of URL strings for now
Category list — static array in a constants file. Not fetched from API. Add categories as needed.
Form layout:
Left column (wider)   →  name, description, images
Right column          →  category, price, discount price, stock
Bottom                →  Cancel button + Submit button
Cancel navigates back to products list without confirmation — form data is lost, which is acceptable for create flow.

Page 4 — Edit Product
File: app/(seller)/seller/products/[id]/edit/page.tsx
User story: As a seller I want to edit my existing product details so I can update pricing, description, or images without needing admin approval again.
What this page does:

Fetches single product via useSellerProduct(id) hook
Renders ProductForm pre-filled with existing product data
On submit calls useUpdateProduct mutation
On success — navigates to /seller/products with toast "Product updated successfully"
Shows Skeleton form while product is loading

Difference from create:

Form pre-filled with existing values
Submit calls update mutation not create
No duplicate check on update unless name is changed
Approval status shown as read-only info banner at top

Info banner at top of edit page:
is_approved: false  →  yellow banner "This product is pending admin approval and not visible to buyers yet"
is_approved: true   →  green banner "This product is live and visible to buyers"
is_active: false    →  gray banner "This product is hidden. Toggle it active to make it visible"

Page 5 — Orders List
File: app/(seller)/seller/orders/page.tsx
User story: As a seller I want to view all orders containing my products filtered by status so I can prioritize what needs dispatching.
What this page does:

Fetches seller orders via useSellerOrders hook with status filter
Renders status filter tabs — All, Confirmed, Shipped, Delivered
Renders SellerOrderCard for each order
Clicking card navigates to order detail page

Component responsibilities:
SellerOrderCard — receives seller order object. Renders order ID, placed date, buyer name (first name only), item count of own items only, seller total, overall order status badge. Does not show items from other sellers. Clicking anywhere on card navigates to detail.
Tab counts — each tab shows count in badge next to label:
Confirmed (3)  |  Shipped (7)  |  Delivered (42)
Counts come from dashboard data already fetched — no extra API call needed.
Empty state per tab:
Confirmed tab empty  →  "No orders waiting to be shipped"
Shipped tab empty    →  "No orders currently in transit"
Delivered tab empty  →  "No delivered orders yet"

Page 6 — Order Detail
File: app/(seller)/seller/orders/[id]/page.tsx
User story: As a seller I want to see the full detail of a specific order and update the status of each of my items independently.
What this page does:

Fetches single seller order via useSellerOrder(id) hook
Renders buyer name and shipping address (masked — no mobile number)
Renders each of seller's own items via SellerOrderItemRow
Each item row has status badge and Update Status button
Update Status opens ItemStatusUpdateDialog
Overall order status shown at top as read-only badge

Component responsibilities:
SellerOrderDetail — receives seller order object and onUpdateStatus callback. Renders shipping address, items list, payment info, seller total. Fires callback when user requests status update.
SellerOrderItemRow — receives single order item. Renders product image, name, quantity, price, current item status badge, Update Status button. Button disabled if item is in terminal state — delivered or cancelled. Fires onUpdate callback.
ItemStatusUpdateDialog — receives current item status, product name, and onConfirm callback. Renders shadcn Dialog. Shows current status, allowed next statuses as radio options, Confirm button. Valid transitions shown based on current status:
confirmed  →  can select: shipped, cancelled
shipped    →  can select: delivered
delivered  →  no options, button hidden
cancelled  →  no options, button hidden
On confirm — calls useUpdateItemStatus mutation. Dialog closes on success. Toast confirms update. Order detail refetches automatically via TanStack Query invalidation.
Shipping address display:
Full Name
Line 1, Line 2
City, State - Pincode
Mobile number not shown to seller — only shown to user for their own orders.

Page 7 — Seller Profile
File: app/(seller)/seller/profile/page.tsx
User story: As a seller I want to view and update my business details so my store information is accurate.
What this page does:

Fetches seller profile via useSellerProfile hook
Renders application status banner at top
Renders SellerProfileForm pre-filled with current data
On submit calls useUpdateSellerProfile mutation
Shows read-only fields separately — application status, rating, reviewed by

Application status banner:

pending   →  yellow "Your seller application is under review"
approved  →  green  "Your seller account is active"
rejected  →  red    "Application rejected: {rejection_reason}. You can reapply."
suspended →  red    "Your account is suspended. Contact support."
SellerProfileForm sections:
Business details section:
business_name     →  required
business_type     →  select — individual, company, partnership
gstin             →  optional
Business address section:
line1, line2, city, state, pincode  →  same pattern as user address form

Read-only info section:
Application Status     →  badge
Total Products         →  count
Total Orders           →  count
Store Rating           →  stars display
Member Since           →  formatted date

Hooks
useSellerDashboard     →  GET /seller/dashboard
useSellerProducts      →  GET /seller/products with params
useSellerProduct       →  GET /seller/products/{id}
useCreateProduct       →  POST /seller/products
useUpdateProduct       →  PUT /seller/products/{id}
useToggleProduct       →  PATCH /seller/products/{id}/toggle
useUpdateStock         →  PATCH /seller/products/{id}/stock
useDeleteProduct       →  DELETE /seller/products/{id}
useSellerOrders        →  GET /seller/orders with params
useSellerOrder         →  GET /seller/orders/{id}
useUpdateItemStatus    →  PATCH /seller/orders/{id}/items/{product_id}
useSellerProfile       →  GET /seller/profile
useUpdateSellerProfile →  PUT /seller/profile
All mutation hooks follow the same pattern:

onSuccess — invalidate relevant query keys, show success toast, navigate if needed
onError — extract error message from response, show error toast


Schemas
schemas/product.schema.ts:
name           →  string, min 3
description    →  string, min 20
category       →  string, non-empty
price          →  number, positive
discount_price →  number, positive, less than price, optional
stock          →  number, integer, min 0
images         →  array of strings, optional
schemas/seller-profile.schema.ts:
business_name    →  string, min 2
business_type    →  enum individual | company | partnership
gstin            →  optional string
line1            →  string, min 5
city             →  string, required
state            →  string, required
pincode          →  string, 6 digits


Build Order for Seller Frontend
1.  Seller layout — sidebar, navbar, mobile drawer
2.  Dashboard page — first thing seller sees on login
3.  Products list page — core seller activity
4.  Create product page — needed to populate products list
5.  Edit product page — same form component, minimal extra work
6.  Orders list page
7.  Order detail page — most complex, item status updates
8.  Seller profile page

Key Differences from User Frontend
User frontend     →  shopping experience, navbar only, consumer feel
Seller frontend   →  dashboard experience, sidebar, management feel
Search            →  user has search, seller has table filters
Navigation        →  user has bottom tab bar, seller has sidebar
Data display      →  user sees cards, seller sees tables
Actions           →  user browses and buys, seller manages and updates
Layout            →  user is full width content, seller is sidebar + content area
Everything else — separation of concerns, hook patterns, form validation strategy, error handling, loading skeletons, toast notifications — is identical between user and seller frontends. Same conventions, different pages.