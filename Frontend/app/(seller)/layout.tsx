"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { authService } from "@/services/auth"
import api from "@/lib/axios"
import { SellerSidebar } from "@/components/seller/SellerSidebar"
import { SellerNavbar } from "@/components/seller/SellerNavbar"

export default function SellerLayout({ children }: { children: ReactNode }) {
  return <SellerShell>{children}</SellerShell>
}

function SellerShell({ children }: { children: ReactNode }) {
  const { setAuth, logout, user } = useAuthStore()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobile drawer
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("seller_sidebar_collapsed") === "true"
  })
  const bootstrapped = useRef(false)

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true

    authService
      .refresh()
      .then(async (res) => {
        const token = res.data.access_token
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        const { data: me } = await authService.me()
        setAuth(token, me)

        if (me.role !== "seller") {
          router.replace("/")
          return
        }
        setReady(true)
      })
      .catch(() => {
        logout()
        router.replace("/auth/login")
      })
  }, [])

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem("seller_sidebar_collapsed", String(collapsed))
  }, [collapsed])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <SellerSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main column */}
      <div
        className="flex flex-1 flex-col min-w-0 overflow-hidden transition-all duration-300"
      >
        <SellerNavbar
          onMenuClick={() => setSidebarOpen(true)}
          sidebarCollapsed={collapsed}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
