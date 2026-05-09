"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { useLogout } from "@/hooks/useAuthHook"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, ShoppingBag, ShoppingCart, Package, Bell, LayoutDashboard } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/hooks/useCart"
import { useProfile } from "@/hooks/useProfile"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

export function Navbar() {
  const { user } = useAuthStore()
  const { mutate: logout, isPending } = useLogout()
  const { data: cart } = useCart()
  const { data: profile } = useProfile()
  const router = useRouter()

  const initials = profile?.full_name
    ? profile.full_name.slice(0, 2).toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "?"

  return (
    <header className="hidden md:block sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
          <ShoppingBag className="size-5 text-primary" />
          Anozon
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            Shop
          </Link>
          <Link href="/cart" className="relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5">
            <div className="relative">
              <ShoppingCart className="size-4" />
              {cart && cart.summary.item_count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground ring-2 ring-card">
                  {cart.summary.item_count > 99 ? "99+" : cart.summary.item_count}
                </span>
              )}
            </div>
            Cart
          </Link>
          <Link href="/orders" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5">
            <Package className="size-4" />
            Orders
          </Link>

          {/* Dark mode toggle — always visible */}
          <ThemeToggle />

          {user ? (
            <div className="flex items-center">
              {/* Notification bell */}
              <button 
                onClick={() => toast.info("Notifications coming soon!")}
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Bell className="size-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger className="ml-2 flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar size="default">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      {profile?.full_name || user.email.split("@")[0]}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer gap-2">
                  <User className="size-4" />
                  Profile
                </DropdownMenuItem>
                {user.role === "seller" && (
                  <DropdownMenuItem onClick={() => router.push("/seller/dashboard")} className="cursor-pointer gap-2 text-teal-600 focus:text-teal-700 focus:bg-teal-50 dark:text-teal-400 dark:focus:text-teal-300 dark:focus:bg-teal-950">
                    <LayoutDashboard className="size-4" />
                    Seller Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => logout()}
                  className="cursor-pointer"
                >
                  <LogOut className="size-4" />
                  {isPending ? "Signing out…" : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="ml-2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Register/Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
