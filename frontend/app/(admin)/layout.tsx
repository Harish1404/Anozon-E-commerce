"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { authService } from "@/services/auth"
import api from "@/lib/axios"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminNavbar } from "@/components/admin/AdminNavbar"
import Loading from "@/app/loading"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}

function AdminShell({ children }: { children: ReactNode }) {
  const { setAuth, logout, user } = useAuthStore()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobile drawer
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("admin_sidebar_collapsed") === "true"
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

        if (!["admin", "super_admin"].includes(me.role)) {
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
    localStorage.setItem("admin_sidebar_collapsed", String(collapsed))
  }, [collapsed])

  if (!ready) {
    return <Loading message="Loading admin dashboard..." />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground" data-theme="admin">
      <AdminSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden transition-all duration-300">
        <AdminNavbar 
          onMobileOpen={() => setSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
