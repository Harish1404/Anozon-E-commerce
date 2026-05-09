"use client"

import { useEffect } from "react"
import { useSellerDashboard } from "@/hooks/useSeller"
import { StatCard } from "@/components/seller/dashboard/StatCard"
import { RevenueCard } from "@/components/seller/dashboard/RevenueCard"
import { WeeklyRevenueChart } from "@/components/seller/dashboard/WeeklyRevenueChart"
import { StoreRatingCard } from "@/components/seller/dashboard/StoreRatingCard"
import { StockAlertList } from "@/components/seller/dashboard/StockAlertList"
import { RecentOrderList } from "@/components/seller/dashboard/RecentOrderList"
import { TopProductsTable } from "@/components/seller/dashboard/TopProductsTable"
import {
  Package, CheckCircle2, Clock, XCircle,
  ShoppingBag, Truck, Star, Eye,
  IndianRupee, Calendar, TrendingUp, Zap,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"

// Skeleton for a card
function CardSkeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-2xl bg-muted animate-pulse ${className}`} />
}

export default function SellerDashboardPage() {
  const { data, isLoading, isError } = useSellerDashboard()
  const { user } = useAuthStore()

  useEffect(() => {
    document.title = "Dashboard — Anozon Seller"
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">

        {/* ── Welcome Banner ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Good {getGreeting()}, {user?.email?.split("@")[0] ?? "Seller"} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {format(new Date(), "EEEE, d MMMM yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Package className="size-4" />
              Add Product
            </Link>
            <Link
              href="/seller/orders"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <ShoppingBag className="size-4" />
              Orders
            </Link>
          </div>
        </div>

        {/* ── Product Stat Cards ──────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} className="h-24" />)}
          </div>
        ) : isError ? (
          <p className="text-sm text-rose-600">Failed to load dashboard. Please refresh.</p>
        ) : data ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Active Products"   value={data.products.active}           icon={CheckCircle2} color="emerald" href="/seller/products" />
            <StatCard label="Pending Approval"  value={data.products.pending_approval}  icon={Clock}        color="amber"   href="/seller/products" />
            <StatCard label="Out of Stock"       value={data.products.out_of_stock}     icon={XCircle}      color="rose"    href="/seller/products" />
            <StatCard label="Total Products"     value={data.products.total}            icon={Package}      color="indigo"  href="/seller/products" />
          </div>
        ) : null}

        {/* ── Order Stat Cards ────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} className="h-24" />)}
          </div>
        ) : data ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Orders"    value={data.orders.total}     icon={ShoppingBag}  color="indigo"  href="/seller/orders" />
            <StatCard label="Confirmed"       value={data.orders.confirmed} icon={CheckCircle2} color="sky"     href="/seller/orders" />
            <StatCard label="Shipped"         value={data.orders.shipped}   icon={Truck}        color="violet"  href="/seller/orders" />
            <StatCard label="Delivered"       value={data.orders.delivered} icon={Star}         color="emerald" href="/seller/orders" />
          </div>
        ) : null}

        {/* ── Revenue Cards ───────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} className="h-28" />)}
          </div>
        ) : data ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <RevenueCard label="All Time Revenue" amount={data.revenue.all_time}   gradient="bg-gradient-to-br from-indigo-500 to-violet-600" icon={TrendingUp} />
            <RevenueCard label="This Month"        amount={data.revenue.this_month} gradient="bg-gradient-to-br from-emerald-500 to-teal-600"  icon={Calendar} />
            <RevenueCard label="This Week"         amount={data.revenue.this_week}  gradient="bg-gradient-to-br from-amber-500 to-orange-600"  icon={Eye} />
            <RevenueCard label="Today"             amount={data.revenue.today}      gradient="bg-gradient-to-br from-rose-500 to-pink-600"     icon={Zap} />
          </div>
        ) : null}

        {/* ── Chart Row ───────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <CardSkeleton className="lg:col-span-2 h-56" />
            <CardSkeleton className="h-56" />
          </div>
        ) : data ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WeeklyRevenueChart data={data.weekly_revenue} />
            </div>
            <StoreRatingCard
              avg_rating={data.store.avg_rating}
              total_reviews={data.store.total_reviews}
            />
          </div>
        ) : null}

        {/* ── Alerts & Recent Orders Row ──────────────────────────────── */}
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <CardSkeleton className="h-64" />
            <CardSkeleton className="h-64" />
          </div>
        ) : data ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <StockAlertList />
            <RecentOrderList orders={data.recent_orders} />
          </div>
        ) : null}

        {/* ── Top Products ────────────────────────────────────────────── */}
        {isLoading ? (
          <CardSkeleton className="h-64" />
        ) : data && data.top_products.length > 0 ? (
          <TopProductsTable products={data.top_products} />
        ) : null}
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  return "evening"
}
