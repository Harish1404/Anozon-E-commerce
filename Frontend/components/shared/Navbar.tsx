"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { useLogout } from "@/hooks/useAuthHook"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, ShoppingBag, ShoppingCart, Package } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { useProfile } from "@/hooks/useProfile"

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
    <header className="hidden md:block sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900">
          <ShoppingBag className="size-5 text-primary" />
          Anozon
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
            Shop
          </Link>
          <Link href="/cart" className="relative rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5">
            <div className="relative">
              <ShoppingCart className="size-4" />
              {cart && cart.summary.item_count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white ring-2 ring-white">
                  {cart.summary.item_count > 99 ? "99+" : cart.summary.item_count}
                </span>
              )}
            </div>
            Cart
          </Link>
          <Link href="/orders" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5">
            <Package className="size-4" />
            Orders
          </Link>

          {user ? (
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
          ) : (
            <Link
              href="/auth/login"
              className="ml-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
