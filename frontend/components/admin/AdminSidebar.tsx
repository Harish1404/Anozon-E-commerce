"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingBag,
  ShieldCheck,
  History,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  Star,
  User,
  LogOut,
  Activity,
  ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useLogout } from "@/hooks/useAuthHook"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const COMMON_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users",     href: "/admin/users",     icon: Users },
  { label: "Sellers",   href: "/admin/sellers",   icon: Store },
  { label: "Products",  href: "/admin/products",  icon: Package },
  { label: "Reviews",   href: "/admin/reviews",   icon: Star },
  { label: "Banners",   href: "/admin/banners",   icon: ImageIcon },
]

const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Admin Management", href: "/admin/admins",     icon: ShieldCheck },
]

interface AdminSidebarProps {
  collapsed: boolean
  onCollapse: (v: boolean) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function AdminSidebar({
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  const isSuperAdmin = user?.role === "super_admin"

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AD"

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo + profile row */}
      <div className={cn("flex items-center gap-3 px-3 py-4 border-b border-white/10", collapsed ? "justify-center" : "")}>
        {!collapsed && (
          <>
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 nav-item">
              <p className="text-sm font-semibold truncate text-foreground">
                Anozon Admin
              </p>
              <p className="text-xs truncate text-muted-foreground">{isSuperAdmin ? "Super Admin" : "Admin"}</p>
            </div>
            {/* Desktop collapse */}
            <button
              onClick={() => onCollapse(true)}
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg transition-colors shrink-0 nav-item text-foreground"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="size-4" />
            </button>
            {/* Mobile close */}
            <button
              onClick={onMobileClose}
              className="md:hidden flex h-7 w-7 items-center justify-center rounded-lg transition-colors shrink-0 nav-item text-foreground"
            >
              <X className="size-4" />
            </button>
          </>
        )}
        {collapsed && (
          <button
            onClick={() => onCollapse(false)}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg transition-colors nav-item text-foreground"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        <div className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground opacity-70">
          {!collapsed && "Platform"}
        </div>
        {COMMON_NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "nav-item group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-foreground",
                active && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}

        {isSuperAdmin && (
          <>
            <div className="mt-6 mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground opacity-70">
              {!collapsed && "Super Admin"}
            </div>
            {SUPER_ADMIN_NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "nav-item group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-foreground",
                    active && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="size-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/10 px-2 py-4 space-y-1">
        {/* Activity */}
        {(() => {
          const activityActive = pathname === "/admin/audit-logs" || pathname.startsWith("/admin/audit-logs/")
          return (
            <Link
              href="/admin/audit-logs"
              onClick={onMobileClose}
              className={cn(
                "nav-item group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-foreground",
                activityActive && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              title={collapsed ? "Activity" : undefined}
            >
              <Activity className="size-5 shrink-0" />
              {!collapsed && <span className="truncate">Activity</span>}
            </Link>
          )
        })()}

        {/* Profile */}
        {(() => {
          const profileActive = pathname === "/admin/profile" || pathname.startsWith("/admin/profile/")
          return (
            <Link
              href="/admin/profile"
              onClick={onMobileClose}
              className={cn(
                "nav-item group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-foreground",
                profileActive && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              title={collapsed ? "Profile" : undefined}
            >
              <User className="size-5 shrink-0" />
              {!collapsed && <span className="truncate">Profile</span>}
            </Link>
          )
        })()}

        {/* Theme toggle */}
        {!collapsed && (
          <div className="nav-item flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground">
            <ThemeToggle />
            <span className="truncate">Theme</span>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-2">
            <ThemeToggle />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sidebar hidden md:flex flex-col shrink-0 transition-all duration-300 border-r border-border",
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
          "sidebar fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col border-r border-border transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
