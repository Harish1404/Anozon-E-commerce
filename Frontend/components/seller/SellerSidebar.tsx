"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  User,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  Bell,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLogout } from "@/hooks/useAuthHook"
import { useAuthStore } from "@/store/useAuthStore"
import { useSellerProfile } from "@/hooks/useSeller"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { label: "Products",  href: "/seller/products",  icon: Package },
  { label: "Orders",    href: "/seller/orders",    icon: ShoppingBag },
  { label: "Profile",   href: "/seller/profile",   icon: User },
]

interface SellerSidebarProps {
  collapsed: boolean
  onCollapse: (v: boolean) => void
  mobileOpen: boolean
  onMobileClose: () => void
  onMobileOpen: () => void
}

export function SellerSidebar({
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
  onMobileOpen,
}: SellerSidebarProps) {
  const pathname = usePathname()
  const { mutate: logout, isPending } = useLogout()
  const { user } = useAuthStore()
  const { data: profile } = useSellerProfile()

  const initials = profile?.business_name
    ? profile.business_name.slice(0, 2).toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "S"

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo + profile row */}
      <div className={cn("flex items-center gap-3 px-3 py-4 border-b border-white/10", collapsed ? "justify-center" : "")}>
        {!collapsed && (
          <>
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-[#7F77DD] text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 nav-item">
              <p className="text-sm font-semibold truncate">
                {profile?.business_name ?? "My Store"}
              </p>
              <p className="text-xs truncate opacity-70">{user?.email}</p>
            </div>
            {/* Desktop collapse */}
            <button
              onClick={() => onCollapse(true)}
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg transition-colors shrink-0 nav-item"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="size-4" />
            </button>
            {/* Mobile close */}
            <button
              onClick={onMobileClose}
              className="md:hidden flex h-7 w-7 items-center justify-center rounded-lg transition-colors shrink-0 nav-item"
            >
              <X className="size-4" />
            </button>
          </>
        )}
        {collapsed && (
          <button
            onClick={() => onCollapse(false)}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg transition-colors nav-item"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "nav-item group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active && "active"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/10 px-2 py-4 space-y-1">
        {/* Theme toggle */}
        {!collapsed && (
          <div className="nav-item flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium">
            <ThemeToggle />
            <span className="truncate">Theme</span>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-2">
            <ThemeToggle />
          </div>
        )}

        {/* Notification */}
        <button
          className="nav-item group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
          title={collapsed ? "Notifications" : undefined}
        >
          <div className="relative">
            <Bell className="size-5 shrink-0" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-400" />
          </div>
          {!collapsed && <span className="truncate">Notifications</span>}
        </button>

        {/* User Profile (personal details) */}
        <Link
          href="/profile"
          onClick={onMobileClose}
          className="nav-item group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
          title={collapsed ? "User Profile" : undefined}
        >
          <User className="size-5 shrink-0" />
          {!collapsed && <span className="truncate">User Profile</span>}
        </Link>

        {/* Switch to Store */}
        <Link
          href="/"
          onClick={onMobileClose}
          className="nav-item group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
          title={collapsed ? "Switch to Store" : undefined}
        >
          <Store className="size-5 shrink-0" />
          {!collapsed && <span className="truncate">Switch to Store</span>}
        </Link>

        {/* Logout */}
        <button
          onClick={() => logout()}
          disabled={isPending}
          className="nav-item group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium !text-red-500 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="size-5 shrink-0" />
          {!collapsed && <span className="truncate">{isPending ? "Logging out..." : "Logout"}</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger — floats top-left when sidebar is closed */}
      <button
        onClick={onMobileOpen}
        className={cn(
          "fixed top-4 left-4 z-30 md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border text-foreground shadow-lg transition-all duration-300",
          mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sidebar hidden md:flex flex-col shrink-0 transition-all duration-300",
          collapsed ? "w-[64px]" : "w-[240px]"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "sidebar fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
