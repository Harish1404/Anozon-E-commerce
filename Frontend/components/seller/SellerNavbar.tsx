"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Menu, LogOut, User, Store } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useLogout } from "@/hooks/useAuthHook"
import { useSellerProfile } from "@/hooks/useSeller"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SellerNavbarProps {
  onMenuClick: () => void
  sidebarCollapsed: boolean
}

export function SellerNavbar({ onMenuClick }: SellerNavbarProps) {
  const { user } = useAuthStore()
  const { data: profile } = useSellerProfile()
  const { mutate: logout, isPending } = useLogout()
  const router = useRouter()

  const initials = profile?.business_name
    ? profile.business_name.slice(0, 2).toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "S"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/90 backdrop-blur-xl px-4 md:px-6">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Business name — center */}
      <div className="flex-1 flex justify-center">
        {profile?.business_name && (
          <span className="text-sm font-semibold text-foreground truncate max-w-xs">
            {profile.business_name}
          </span>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell (static) */}
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors relative">
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground truncate">
                  {profile?.business_name ?? "My Store"}
                </span>
                <span className="text-xs font-normal text-muted-foreground truncate">
                  {user?.email}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => router.push("/seller/profile")}
            >
              <User className="size-4" />
              Seller Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => router.push("/")}
            >
              <Store className="size-4" />
              Switch to Store
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isPending}
              onClick={() => logout()}
              className="cursor-pointer gap-2"
            >
              <LogOut className="size-4" />
              {isPending ? "Signing out…" : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
