"use client"

import { useAdminDashboard } from "@/hooks/useAdminDashboard"
import { useAuthStore } from "@/store/useAuthStore"
import { AdminStatCard } from "@/components/admin/dashboard/AdminStatCard"
import { PendingSellerWidget } from "@/components/admin/dashboard/PendingSellerWidget"
import { PendingApprovalWidget } from "@/components/admin/dashboard/PendingApprovalWidget"
import { RecentActivityFeed } from "@/components/admin/dashboard/RecentActivityFeed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Store, Package, ShoppingBag, IndianRupee, ShieldCheck, Ban, Clock, Star, TrendingDown } from "lucide-react"

/** Format revenue like seller dashboard: ₹3.1L, ₹12.5K, ₹950 */
function formatCurrency(amount: number): string {
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(1)}L`
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`
  return `₹${amount.toFixed(0)}`
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= Math.round(rating) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-foreground">{rating}</span>
    </div>
  )
}

interface SellerPerf {
  seller_id: string
  business_name: string
  avg_rating: number
  total_reviews: number
  product_count: number
}

function SellerPerformanceCard({ title, icon, sellers, variant }: {
  title: string
  icon: React.ReactNode
  sellers: SellerPerf[]
  variant: "top" | "worst"
}) {
  const borderColor = variant === "top"
    ? "border-green-500/30 dark:border-green-500/20"
    : "border-red-500/30 dark:border-red-500/20"

  return (
    <Card className={borderColor}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sellers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {variant === "top" ? "No top sellers available yet." : "No sellers currently have a rating below 2.0. All good!"}
          </p>
        ) : (
          sellers.map((s, i) => (
            <div key={s.seller_id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  variant === "top"
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                }`}>
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{s.business_name}</p>
                  <p className="text-xs text-muted-foreground">{s.product_count} products · {s.total_reviews} reviews</p>
                </div>
              </div>
              <RatingStars rating={s.avg_rating} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading, isError } = useAdminDashboard()

  const isSuperAdmin = user?.role === "super_admin"

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <p className="text-destructive">Failed to load dashboard data. Please refresh.</p>
      </div>
    )
  }

  const m = data.metrics || {}

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-heading text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and pending actions.</p>
      </div>

      {/* Stat Cards — clickable */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <AdminStatCard label="Total Users" value={m.total_users ?? 0} icon={<Users className="size-5" />} color="blue" href="/admin/users" />
        <AdminStatCard label="Active Sellers" value={m.total_sellers ?? 0} icon={<Store className="size-5" />} color="emerald" href="/admin/sellers?status=approved" />
        <AdminStatCard label="Products" value={m.total_products ?? 0} icon={<Package className="size-5" />} color="violet" href="/admin/products" />
        <AdminStatCard label="Orders" value={m.total_orders ?? 0} icon={<ShoppingBag className="size-5" />} color="cyan" />
        <AdminStatCard label="Revenue" value={formatCurrency(m.total_revenue ?? 0)} icon={<IndianRupee className="size-5" />} color="indigo" />
        <AdminStatCard label="Pending Sellers" value={m.pending_sellers ?? 0} icon={<Clock className="size-5" />} color="amber" href="/admin/sellers?status=pending" />
        <AdminStatCard label="Pending Products" value={m.pending_products ?? 0} icon={<Clock className="size-5" />} color="emerald" href="/admin/products?status=pending" />
        <AdminStatCard label="Banned Users" value={m.banned_users ?? 0} icon={<Ban className="size-5" />} color="rose" href="/admin/users?status=banned" />
        {isSuperAdmin && (
          <AdminStatCard label="Admins" value={m.total_admins ?? 0} icon={<ShieldCheck className="size-5" />} color="violet" href="/admin/admins" />
        )}
      </div>

      {/* Top & Worst Sellers */}
      <div className="grid gap-6 md:grid-cols-2">
        <SellerPerformanceCard
          title="Top Sellers"
          icon={<Star className="h-4 w-4 text-amber-500" />}
          sellers={data.top_sellers || []}
          variant="top"
        />
        <SellerPerformanceCard
          title="Needs Attention"
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          sellers={data.worst_sellers || []}
          variant="worst"
        />
      </div>

      {/* Pending Widgets + Activity Feed */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-2">
          <PendingSellerWidget count={m.pending_sellers ?? 0} recent={data.pending_sellers || []} />
        </div>
        <div className="lg:col-span-2">
          <PendingApprovalWidget count={m.pending_products ?? 0} recent={data.pending_products || []} />
        </div>
        <div className="lg:col-span-3">
          <RecentActivityFeed logs={data.recent_activity || []} isSuperAdmin={isSuperAdmin} />
        </div>
      </div>
    </div>
  )
}
