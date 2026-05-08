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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLogout } from "@/hooks/useAuthHook"

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
}

export function SellerSidebar({
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
}: SellerSidebarProps) {
  const pathname = usePathname()
  const { mutate: logout, isPending } = useLogout()

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo row */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-white">
            Anozon <span className="text-indigo-400 text-xs font-medium ml-1">Seller</span>
          </span>
        )}
        {/* Desktop collapse toggle */}
        <button
          onClick={() => onCollapse(!collapsed)}
          className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ml-auto"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="size-4" />
        </button>
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
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("size-5 shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-white")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Divider + Switch to Store + Logout */}
      <div className="border-t border-slate-800 px-2 py-4 space-y-1">
        <Link
          href="/"
          onClick={onMobileClose}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-150"
          title={collapsed ? "Switch to Store" : undefined}
        >
          <Store className="size-5 shrink-0 text-slate-400 group-hover:text-white" />
          {!collapsed && <span className="truncate">Switch to Store</span>}
        </Link>
        <button
          onClick={() => logout()}
          disabled={isPending}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="size-5 shrink-0 text-rose-400 group-hover:text-rose-500" />
          {!collapsed && <span className="truncate">{isPending ? "Logging out..." : "Logout"}</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 shrink-0",
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
          "fixed inset-y-0 left-0 z-50 w-[240px] flex flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
