"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sellerApplySchema, SellerApplyFormData } from "@/schemas/seller-apply.schema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { profileService } from "@/services/profiles"
import { SellerApplicationStatusResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  CheckCircle2, Clock, XCircle, AlertTriangle,
  Building2, FileText, ChevronLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

export default function SellerApplyPage() {
  useEffect(() => {
    document.title = "Anozon - Become a Seller"
  }, [])

  const queryClient = useQueryClient()

  // Fetch current status
  const { data: status, isLoading: statusLoading } = useQuery<SellerApplicationStatusResponse>({
    queryKey: ["seller-apply-status"],
    queryFn: () => profileService.getSellerApplicationStatus().then((res) => res.data),
    staleTime: 60 * 1000,
  })

  // Submit mutation
  const { mutate: submitApplication, isPending } = useMutation({
    mutationFn: (data: SellerApplyFormData) => {
      return profileService.applyForSeller({
        business_name: data.business_name,
        business_type: data.business_type,
        gstin: data.gstin || undefined,
        business_address: {
          line1: data.line1,
          line2: data.line2 || undefined,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: data.country || "India",
        },
      }).then((res) => res.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-apply-status"] })
      toast.success("Application submitted successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to submit application")
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SellerApplyFormData>({
    resolver: zodResolver(sellerApplySchema),
    defaultValues: {
      business_name: "",
      business_type: "individual",
      gstin: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  })

  const isDisabled = status?.application_status === "pending" || status?.application_status === "approved"

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Back */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="size-4" /> Back to Profile
      </Link>

      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Become a Seller</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Apply to sell your products on Anozon</p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {statusLoading ? (
        <div className="mb-6 h-20 rounded-2xl bg-muted animate-pulse" />
      ) : status?.application_status ? (
        <div className={cn(
          "mb-6 rounded-2xl border p-5",
          status.application_status === "pending" && "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
          status.application_status === "approved" && "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
          status.application_status === "rejected" && "border-destructive/30 bg-destructive/5",
        )}>
          <div className="flex items-start gap-3">
            {status.application_status === "pending" && (
              <Clock className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            {status.application_status === "approved" && (
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            {status.application_status === "rejected" && (
              <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="text-sm font-semibold text-foreground capitalize">
                Application {status.application_status}
              </h3>
              {status.application_status === "pending" && (
                <p className="text-xs text-muted-foreground mt-1">Your application is under review. We&apos;ll notify you once a decision is made.</p>
              )}
              {status.application_status === "approved" && (
                <p className="text-xs text-muted-foreground mt-1">Congratulations! You&apos;re now an approved seller. Visit your seller dashboard to get started.</p>
              )}
              {status.application_status === "rejected" && (
                <>
                  {status.rejection_reason && (
                    <p className="text-xs text-destructive mt-1">Reason: {status.rejection_reason}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    You have {status.reapply_attempts_remaining} reapply attempt(s) remaining.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Application Form */}
      <form
        onSubmit={handleSubmit((data) => submitApplication(data))}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <FileText className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Business Details</h2>
        </div>

        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Business Name <span className="text-destructive">*</span>
          </label>
          <input
            {...register("business_name")}
            disabled={isDisabled}
            placeholder="e.g. My Awesome Store"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition disabled:opacity-50"
          />
          <FieldError message={errors.business_name?.message} />
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Business Type <span className="text-destructive">*</span>
          </label>
          <Select
            value={watch("business_type")}
            onValueChange={(val) => setValue("business_type", val as any)}
            disabled={isDisabled}
          >
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.business_type?.message} />
        </div>

        {/* GSTIN (optional) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            GSTIN <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            {...register("gstin")}
            disabled={isDisabled}
            placeholder="e.g. 22AAAAA0000A1Z5"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition disabled:opacity-50"
          />
        </div>

        {/* Address Section */}
        <div className="pt-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Business Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Address Line 1 <span className="text-destructive">*</span></label>
              <input
                {...register("line1")}
                disabled={isDisabled}
                placeholder="Street, Building, Area"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition disabled:opacity-50"
              />
              <FieldError message={errors.line1?.message} />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Address Line 2</label>
              <input
                {...register("line2")}
                disabled={isDisabled}
                placeholder="Landmark (optional)"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">City <span className="text-destructive">*</span></label>
                <input
                  {...register("city")}
                  disabled={isDisabled}
                  placeholder="City"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition disabled:opacity-50"
                />
                <FieldError message={errors.city?.message} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">State <span className="text-destructive">*</span></label>
                <input
                  {...register("state")}
                  disabled={isDisabled}
                  placeholder="State"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition disabled:opacity-50"
                />
                <FieldError message={errors.state?.message} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Pincode <span className="text-destructive">*</span></label>
                <input
                  {...register("pincode")}
                  disabled={isDisabled}
                  placeholder="600001"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition disabled:opacity-50"
                />
                <FieldError message={errors.pincode?.message} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Country</label>
                <input
                  {...register("country")}
                  disabled
                  className="w-full rounded-xl border border-border bg-muted px-3.5 py-2.5 text-sm text-muted-foreground disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-border">
          {isDisabled ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="size-4" />
              {status?.application_status === "approved"
                ? "Your seller account is already approved."
                : "Your application is under review and cannot be modified."}
            </div>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl text-sm font-semibold"
            >
              {isPending ? "Submitting…" : "Submit Application"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
