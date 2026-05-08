# Seller Navigation & Shared Navbar Improvements

Add logout to the seller sidebar, a "Seller Dashboard" link in the user store Navbar for seller-role users, and implement the profile dropdown + bell icon functionality in the user store Navbar.

## Proposed Changes

### 1. Seller Sidebar — Add Logout Button

#### [MODIFY] [SellerSidebar.tsx](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/frontend/components/seller/SellerSidebar.tsx)

Add a **Logout** button below the "Switch to Store" link in the sidebar's bottom section.

- Import `LogOut` from `lucide-react`, `useLogout` from `@/hooks/useAuthHook`
- Add a logout button styled consistently with the sidebar's dark theme (rose-500 hover for destructive action)
- When collapsed, show only the icon with a tooltip title
- When expanded, show "Logout" text alongside the icon
- Disable the button while the logout mutation is pending

**Layout:**
```
─────────────────
 Switch to Store  ← existing
 Logout           ← new (rose-500 accent)
─────────────────
```

---

### 2. User Store Navbar — Add "Seller Dashboard" Link for Sellers

#### [MODIFY] [Navbar.tsx](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/frontend/components/shared/Navbar.tsx)

When the logged-in user has `role === "seller"`, add a **"Seller Dashboard"** menu item in the profile dropdown (between "Profile" and "Logout").

- Check `user.role === "seller"` from `useAuthStore`
- Add a `DropdownMenuItem` with `LayoutDashboard` icon → navigates to `/seller/dashboard`
- Visually distinct with an indigo accent icon so it stands out

#### [MODIFY] [BottomTabBar.tsx](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/frontend/components/shared/BottomTabBar.tsx)

Same logic for mobile — add "Seller Dashboard" link in the Sheet menu for `role === "seller"` users, positioned before "Sign Out".

---

### 3. User Store Navbar — Bell Icon (Notification Indicator)

There is no backend notification system, so the bell will show a **toast message** ("Notifications coming soon!") when clicked, instead of silently doing nothing.

#### [MODIFY] [Navbar.tsx](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/frontend/components/shared/Navbar.tsx)

- Add a `Bell` icon button to the right of the nav links (before the avatar), visible only when logged in
- On click → show `toast.info("Notifications coming soon!")` via sonner
- Include a subtle notification dot badge for visual completeness

---

### 4. Seller Navbar — Fix Bell & Profile Dropdown

The seller navbar (`SellerNavbar.tsx`) already has both the bell icon and profile dropdown **fully implemented** with working code — the bell is a static indicator, and the dropdown has Profile, Switch to Store, and Logout items. These work correctly now that the auth/CORS issues are resolved. No changes needed here.

> [!NOTE]
> The bell icon in the seller navbar is intentionally static (no click action) since there's no notification backend. If you want it to show "coming soon" toast too, I'll add that.

---

## Summary of Changes

| File | Change |
|---|---|
| `SellerSidebar.tsx` | Add Logout button at the bottom |
| `Navbar.tsx` | Add bell icon + "Seller Dashboard" dropdown item for sellers |
| `BottomTabBar.tsx` | Add "Seller Dashboard" link in mobile sheet for sellers |

## Verification Plan

### Browser Tests
- Login as seller → verify Logout button appears in sidebar → click it → redirects to home/login
- From seller dashboard → click "Switch to Store" → verify "Seller Dashboard" option appears in the user Navbar profile dropdown → click it → returns to `/seller/dashboard`
- On user store → verify bell icon shows toast on click
- On mobile → verify "Seller Dashboard" link appears in bottom sheet menu
