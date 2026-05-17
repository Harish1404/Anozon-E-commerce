"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sellerProfileSchema, SellerProfileFormData } from "@/schemas/seller-profile.schema"
import { SellerProfile } from "@/types"
import { INDIAN_STATES } from "@/lib/constants"

interface SellerProfileFormProps {
  profile: SellerProfile
  onSubmit: (data: SellerProfileFormData) => void
  isLoading?: boolean
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-rose-600">{message}</p>
}

export function SellerProfileForm({ profile, onSubmit, isLoading }: SellerProfileFormProps) {
  const addr = profile.business_address

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SellerProfileFormData>({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: {
      business_name: profile.business_name ?? "",
      business_type: profile.business_type ?? "individual",
      gstin:  profile.gstin ?? "",
      line1:  addr?.line1 ?? "",
      line2:  addr?.line2 ?? "",
      city:   addr?.city ?? "",
      state:  addr?.state ?? "",
      pincode: addr?.pincode ?? "",
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Business Details ────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">Business Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Business Name */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("business_name")}
              placeholder="Your business or brand name"
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            <FieldError message={errors.business_name?.message} />
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Business Type <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("business_type")}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            >
              <option value="individual">Individual</option>
              <option value="company">Company</option>
              <option value="partnership">Partnership</option>
            </select>
            <FieldError message={errors.business_type?.message} />
          </div>

          {/* GSTIN */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              GSTIN <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <input
              {...register("gstin")}
              placeholder="22AAAAA0000A1Z5"
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            <FieldError message={errors.gstin?.message} />
          </div>
        </div>
      </div>

      {/* ── Business Address ─────────────────────────────────────── */}
      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Business Address</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Line 1 */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Address Line 1 <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("line1")}
              placeholder="Street, building, floor"
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            <FieldError message={errors.line1?.message} />
          </div>

          {/* Line 2 */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Address Line 2 <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <input
              {...register("line2")}
              placeholder="Area, landmark"
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("city")}
              placeholder="Mumbai"
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            <FieldError message={errors.city?.message} />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              State <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("state")}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            >
              <option value="">Select state…</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <FieldError message={errors.state?.message} />
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Pincode <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("pincode")}
              placeholder="400001"
              maxLength={6}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            <FieldError message={errors.pincode?.message} />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end border-t border-border pt-5">
        <button
          type="submit"
          disabled={isLoading || !isDirty}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isLoading ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  )
}
