"use client"

import { useEffect } from "react"
import { useSellerProfile, useUpdateSellerProfile } from "@/hooks/useSeller"
import { SellerProfileForm } from "@/components/seller/SellerProfileForm"
import { SellerProfileFormData } from "@/schemas/seller-profile.schema"
import { Star, Package, ShoppingBag, Calendar, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 rounded-xl bg-slate-200" />
      <div className="h-64 rounded-2xl bg-slate-200" />
    </div>
  )
}

export default function SellerProfilePage() {
  const { data: profile, isLoading } = useSellerProfile()
  const { mutate: updateProfile, isPending } = useUpdateSellerProfile()

  useEffect(() => {
    document.title = "Profile — Anozon Seller"
  }, [])

  const handleSubmit = (data: SellerProfileFormData) => {
    updateProfile(data)
  }

  // Application status banner
  const StatusBanner = () => {
    if (!profile) return null
    const status = profile.application_status
    if (profile.is_suspended) {
      return (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
          <XCircle className="size-4 text-rose-600 mt-0.5 shrink-0" />
          <p className="text-sm text-rose-800">
            <strong>Account suspended.</strong> Please contact support for assistance.
          </p>
        </div>
      )
    }
    if (status === "approved") {
      return (
        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <CheckCircle2 className="size-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-sm text-emerald-800"><strong>Your seller account is active.</strong></p>
        </div>
      )
    }
    if (status === "rejected") {
      return (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
          <AlertTriangle className="size-4 text-rose-600 mt-0.5 shrink-0" />
          <p className="text-sm text-rose-800">
            <strong>Application rejected:</strong> {profile.rejection_reason ?? "No reason provided"}.
          </p>
        </div>
      )
    }
    return (
      <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
        <Clock className="size-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800"><strong>Your seller application is under review.</strong></p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">Seller Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your business information</p>
        </div>

        {isLoading ? (
          <ProfileSkeleton />
        ) : profile ? (
          <>
            {/* Status banner */}
            <StatusBanner />

            <div className="grid gap-5 lg:grid-cols-3">
              {/* Profile form */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-800 mb-5 border-b border-slate-100 pb-4">
                  Business Information
                </h2>
                <SellerProfileForm
                  profile={profile}
                  onSubmit={handleSubmit}
                  isLoading={isPending}
                />
              </div>

              {/* Read-only info panel */}
              <div className="space-y-4">
                {/* Store stats */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Store Overview</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Package className="size-3.5" /> Total Products
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{profile.total_products}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ShoppingBag className="size-3.5" /> Total Orders
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{profile.total_orders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Star className="size-3.5" /> Store Rating
                      </div>
                      <span className="text-sm font-semibold text-amber-600">
                        {profile.rating != null ? profile.rating.toFixed(1) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="size-3.5" /> Member Since
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        {format(new Date(profile.created_at), "MMM yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Application status */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Application Status</h3>
                  <span className={cn(
                    "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
                    profile.application_status === "approved" ? "bg-emerald-100 text-emerald-700" :
                    profile.application_status === "rejected" ? "bg-rose-100 text-rose-700" :
                    "bg-amber-100 text-amber-700"
                  )}>
                    {profile.application_status}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-rose-600">Failed to load profile.</p>
        )}
      </div>
    </div>
  )
}
