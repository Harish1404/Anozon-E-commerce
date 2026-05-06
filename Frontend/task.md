Requirement Story — Anozon User Frontend (Next.js)

Context
User frontend covers the shopping experience — browsing products, managing cart, placing orders, tracking orders, and managing profile. Built with Next.js App Router, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, React Hook Form, and Zod. Architecture follows strict separation of concerns — UI components never call API directly, pages never manage raw state, business logic never lives in components.

Architecture Principles

Separation of concerns — four clear layers:
Page          →  composes components, reads from hooks, handles navigation
Component     →  receives props, renders UI, fires callbacks — no API calls
Hook          →  wraps TanStack Query, calls service, manages cache
Service       →  plain async functions, calls axios — no UI, no state
Every layer only talks to the layer directly below it. A component never imports a service. A page never calls axios directly. This makes every piece independently testable and replaceable.
File naming convention:
pages        →  app/(user)/products/page.tsx
components   →  components/product/ProductCard.tsx
hooks        →  hooks/useProducts.ts
services     →  services/product.service.ts
types        →  types/index.ts
schemas      →  schemas/order.schema.ts   ← Zod schemas for forms
State ownership:
Server state   →  TanStack Query        (products, cart, orders, profile)
UI state       →  local useState        (modal open, tab active, form step)
Global state   →  Zustand               (access token, user role, cart count)
Nothing goes into Zustand unless it is truly global and needed across unrelated components.

Folder Structure
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── verify-otp/page.tsx
│   └── forgot-password/page.tsx
│
├── (user)/
│   ├── layout.tsx                  ← user navbar, bottom tab bar mobile
│   ├── page.tsx                    ← home / product listing
│   ├── products/[slug]/page.tsx    ← product detail
│   ├── cart/page.tsx
│   ├── orders/page.tsx
│   ├── orders/[id]/page.tsx
│   └── profile/page.tsx
│
components/
├── shared/
│   ├── Navbar.tsx
│   ├── BottomTabBar.tsx
│   ├── SearchBar.tsx
│   └── ProfileDropdown.tsx
│
├── product/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductDetail.tsx
│   ├── ReviewCard.tsx
│   └── ReviewList.tsx
│
├── cart/
│   ├── CartItem.tsx
│   └── CartSummary.tsx
│
├── order/
│   ├── OrderCard.tsx
│   ├── OrderDetail.tsx
│   ├── OrderTimeline.tsx
│   └── StatusBadge.tsx
│
└── profile/
    ├── ProfileForm.tsx
    ├── AddressCard.tsx
    └── AddressForm.tsx

hooks/
├── useAuth.ts
├── useProducts.ts
├── useCart.ts
├── useOrders.ts
└── useProfile.ts

services/
├── auth.service.ts
├── product.service.ts
├── cart.service.ts
├── order.service.ts
└── profile.service.ts

schemas/
├── auth.schema.ts
├── order.schema.ts
└── profile.schema.ts

store/
├── useAuthStore.ts
└── useCartStore.ts

types/
└── index.ts

Layout — User Shell
File: app/(user)/layout.tsx
Responsibilities:

Render Navbar at top
Render BottomTabBar at bottom on mobile only
Run silent refresh on mount to restore auth session
Wrap children in layout container

Silent refresh runs once on layout mount. If refresh succeeds, Zustand is populated and user continues. If refresh fails, user is not redirected from layout — middleware handles protected route redirects. Layout only handles session restoration.

Middleware — Route Protection
File: middleware.ts
Responsibilities:

Protect all (user) routes — redirect to login if no valid session
Allow all (auth) routes publicly
Redirect logged in users away from auth pages to home
Check role from token — redirect seller/admin to their own dashboard if they try to access user routes directly

Middleware reads the access token from the request. If token is absent or expired, redirect to login. Token validation in middleware is lightweight — just check expiry, not full signature verification.

Page Stories

Page 1 — Home / Product Listing
File: app/(user)/page.tsx
User story: As a user I want to browse all available products with search and category filters so I can find what I want to buy.
What this page does:

Fetches paginated product list via useProducts hook
Passes products to ProductGrid component
Manages filter state locally — category, sort order, search query
Debounces search input — 300ms — before triggering API call
Shows Skeleton cards while loading
Shows empty state when no products match filters

Component responsibilities:
ProductGrid — receives products array and renders grid layout. Knows nothing about filters or pagination. Just renders what it receives.
ProductCard — receives single product. Renders image, name, price, rating, discount badge. Has Add to Cart button that calls onAddToCart callback prop. Never calls hook directly.
Search behavior: Search state lives in the page. Debounced value is passed to useProducts as query param. URL is updated with search and filter params so results are shareable and bookmarkable.

Page 2 — Product Detail
File: app/(user)/products/[slug]/page.tsx
User story: As a user I want to see full product details, images, reviews, and be able to add to cart or buy now.
What this page does:

Fetches single product by slug via useProduct(slug) hook
Fetches reviews via useReviews(product_id) hook
Manages selected image index locally
Manages quantity selector locally
Calls useAddToCart mutation on Add to Cart
Navigates to checkout on Buy Now with product pre-filled

Component responsibilities:
ProductDetail — receives product object. Renders image gallery, name, price, description, stock status, quantity selector. Fires onAddToCart and onBuyNow callbacks. Zero API knowledge.
ReviewList — receives reviews array. Renders each review via ReviewCard. Shows average rating summary at top.
ReviewCard — receives single review. Renders reviewer name, rating stars, comment, verified purchase badge.
Buy Now behavior: Does not add to cart. Navigates to /cart/checkout?buyNow=true&product_id=...&quantity=.... Checkout page detects buyNow param and uses useBuyNow mutation instead of usePlaceOrder.

Page 3 — Cart
File: app/(user)/cart/page.tsx
User story: As a user I want to view my cart, update quantities, remove items, and see the full price breakdown before placing an order.
What this page does:

Fetches cart via useCart hook
Renders CartItem for each item
Renders CartSummary with computed totals
Handles quantity update via useUpdateCart mutation
Handles remove via useRemoveFromCart mutation
Proceed to Checkout button navigates to checkout flow

Component responsibilities:
CartItem — receives item, onQuantityChange callback, onRemove callback. Renders image, name, price, quantity controls, item total. Fires callbacks on user action. Never mutates directly.
CartSummary — receives summary object. Renders subtotal, GST breakdown, delivery charge, free delivery badge if eligible, final total. Renders Proceed to Checkout button. Checkout button is in summary because it is logically tied to the total — user confirms total then proceeds.
Empty cart state: Friendly illustration with "Your cart is empty" message and a Browse Products button linking to home.

Page 4 — Checkout
File: app/(user)/cart/checkout/page.tsx
User story: As a user I want to select a delivery address and payment method then place my order.
What this page does:

Fetches user profile to get saved addresses via useProfile hook
Shows address selector — list of saved addresses, user picks one
Shows Add New Address inline form if no addresses or user wants new one
Shows payment method selector — COD or Online
Shows order summary (passed via state or refetched from cart)
Place Order button calls usePlaceOrder or useBuyNow depending on flow
On success — navigates to /orders/{order_id} with success toast

Form validation with Zod:
address_id    →  required, must be non-empty string
payment_method →  required, must be one of cod | online
Pre-condition checks before rendering:

Profile has full_name and mobile — if not, show banner "Complete your profile to continue" with link to profile page
Cart is not empty — if empty, redirect to cart page

Error handling:

Product out of stock at order time — toast with product name
Generic server error — toast "Something went wrong, please try again"


Page 5 — Orders List
File: app/(user)/orders/page.tsx
User story: As a user I want to see all my past and current orders filtered by status.
What this page does:

Fetches orders via useOrders hook with optional status filter
Renders status filter tabs — All, Confirmed, Shipped, Delivered, Cancelled
Renders OrderCard for each order
Clicking order card navigates to order detail page

Component responsibilities:
OrderCard — receives order object. Renders order ID, date, item count, total, current status badge, first item image as preview. Never fetches data.
StatusBadge — receives status string. Renders colored badge. Color map:
pending    →  yellow
confirmed  →  blue
shipped    →  purple
delivered  →  green
cancelled  →  red
Reused in both order list and order detail. Single source of truth for status colors.

Page 6 — Order Detail
File: app/(user)/orders/[id]/page.tsx
User story: As a user I want to see every detail of a specific order including per-item status and shipping info so I know exactly what is happening.
What this page does:

Fetches single order via useOrder(id) hook
Renders each item with its individual status badge
Renders shipping address
Renders order summary breakdown
Renders Cancel Order button if order status is confirmed
Cancel triggers useCancelOrder mutation with confirmation dialog

Component responsibilities:
OrderDetail — receives full order object. Renders all sections. Fires onCancel callback. No API knowledge.
OrderTimeline — receives order status. Renders visual step indicator showing progress — Confirmed → Shipped → Delivered. Current step highlighted. Cancelled shows a separate cancelled state. This is a purely presentational component — receives status string, renders the right visual.
Cancel confirmation: Uses shadcn Dialog component. "Are you sure you want to cancel this order?" with Cancel and Confirm buttons. Confirm calls mutation. Dialog state managed locally in the page.

Page 7 — Profile
File: app/(user)/profile/page.tsx
User story: As a user I want to view and update my personal details and manage my delivery addresses.
What this page does:

Fetches profile via useProfile hook
Renders profile form pre-filled with current data
Renders address list with edit and delete per address
Renders Add Address button that opens address form in a Sheet

Component responsibilities:
ProfileForm — receives current profile data and onSubmit callback. Manages its own form state via React Hook Form. Fires onSubmit with changed fields only. Uses Zod schema for validation.
AddressCard — receives address object and callbacks for edit and delete. Renders label, full address, default badge if is_default true. Fires callbacks on button click.
AddressForm — receives optional existing address (for edit) and onSubmit callback. Manages own form state. Used both for add and edit — same component, different initial values.
Zod schema for profile form:
full_name     →  optional, min 2 chars if provided
mobile        →  optional, must match 10 digit pattern if provided
Zod schema for address form:
label         →  required
line1         →  required, min 5 chars
city          →  required
state         →  required
pincode       →  required, exactly 6 digits

Shared Components
Navbar:

Logo on left
SearchBar in center — wide on desktop, icon on mobile
Cart icon with item count badge from useCartStore
Profile dropdown on right
Profile dropdown shows links based on role from useAuthStore

SearchBar:

Controlled input with debounce
Dropdown shows up to 5 product suggestions while typing
Each suggestion has product image, name, price
Click suggestion → navigate to product detail
Press Enter → navigate to search results page with query param
Click outside → close dropdown
Debounce logic lives inside SearchBar component — not in parent

BottomTabBar (mobile only):

Fixed at bottom, visible only below md breakpoint
Five tabs — Home, Search, Cart, Orders, Profile
Active tab highlighted
Cart tab shows item count badge

ProfileDropdown:

Renders different links based on role
User sees — Profile, Orders, Addresses, Apply as Seller, Logout
Logout calls useLogout mutation — clears Zustand, redirects to login


Form Validation Strategy
All forms use React Hook Form with Zod resolver. Zod schemas live in schemas/ folder — separate from components. This way the same schema can be reused across different form components if needed.
schemas/auth.schema.ts      →  login, signup, otp, forgot password forms
schemas/profile.schema.ts   →  profile form, address form
schemas/order.schema.ts     →  checkout form
Validation errors display inline below each field using shadcn FormMessage component. Form never submits if validation fails — no API call made.

Error Handling Strategy
API errors are caught in the mutation onError callback and shown as toast notifications using shadcn Sonner toast. Never shown as raw error objects.
Loading states use shadcn Skeleton component — not spinners. Skeletons match the shape of the content being loaded so layout does not shift.
Empty states are handled per page with a helpful message and a clear next action button — not just blank space.
Network errors are caught by the axios interceptor. 401 triggers silent refresh. Other errors bubble up to the mutation error handler.

Mobile Responsiveness Rules
Every component is built mobile-first. Tailwind breakpoints used consistently:
default     →  mobile layout
md:         →  tablet adjustments
lg:         →  desktop layout
Product grid — 1 column mobile, 2 tablet, 3 or 4 desktop. Cart — stacked on mobile, side by side summary on desktop. Checkout — single column mobile, two column desktop.

Pages and Components Build Order
Build in this sequence so each piece is usable as soon as it is done:
1.  Types and schemas                  ← foundation
2.  Auth pages                         ← login, signup, OTP verify
3.  Navbar + ProfileDropdown           ← needed on every page
4.  Home + ProductCard + ProductGrid   ← first thing user sees
5.  Product detail page                ← needed before cart
6.  Cart page                          ← needed before checkout
7.  Checkout page                      ← needed before orders
8.  Orders list page
9.  Order detail page
10. Profile page
11. SearchBar with suggestions         ← polish, add last
12. BottomTabBar mobile                ← polish, add last