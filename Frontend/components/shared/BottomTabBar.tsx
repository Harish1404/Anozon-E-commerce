"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Search, ShoppingCart, Menu, User, Package, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/hooks/useCart"
import { useAuthStore } from "@/store/useAuthStore"
import { useLogout } from "@/hooks/useAuthHook"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function BottomTabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: cart } = useCart()
  const { user } = useAuthStore()
  const { mutate: logout, isPending } = useLogout()

  const tabs = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Search", icon: Search, href: "/search" },
    { 
      label: "Cart", 
      icon: ShoppingCart, 
      href: "/cart", 
      badge: cart?.summary.item_count 
    },
  ]

  const formatBadge = (count?: number) => {
    if (!count) return null
    return count > 99 ? "99+" : count.toString()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 pb-safe backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                "group relative flex flex-col items-center gap-1 px-3 py-1 transition-colors",
                isActive ? "text-primary" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <div className="relative">
                <Icon className={cn("size-6", isActive && "fill-primary/10")} />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white ring-2 ring-white">
                    {formatBadge(tab.badge)}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <span className="absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}

        {/* Hamburger Menu Trigger */}
        <Sheet>
          <SheetTrigger className="group relative flex flex-col items-center gap-1 px-3 py-1 transition-colors text-slate-500 hover:text-slate-900 outline-none">
            <Menu className="size-6" />
            <span className="text-[10px] font-medium">Menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader className="mb-6 border-b border-slate-100 pb-4">
              <SheetTitle className="text-left">
                {user ? `Hello, ${user.email}` : "Menu"}
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <User className="size-5" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                  <Link 
                    href="/orders" 
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <Package className="size-5" />
                    <span className="font-medium">My Orders</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    disabled={isPending}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors mt-4"
                  >
                    <LogOut className="size-5" />
                    <span className="font-medium">{isPending ? "Signing out..." : "Sign Out"}</span>
                  </button>
                </>
              ) : (
                <div className="pt-4">
                  <p className="text-sm text-slate-500 mb-4">Sign in to manage your profile and orders.</p>
                  <Link 
                    href="/auth/login"
                    className="block w-full rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
