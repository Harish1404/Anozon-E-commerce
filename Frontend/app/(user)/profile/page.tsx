"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useProfile, useUpdateProfile, useAddAddress, useUpdateAddress, useDeleteAddress } from "@/hooks/useProfile"
import { useAuthStore } from "@/store/useAuthStore"
import { Address } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, Plus, Check, X, MapPin, Star } from "lucide-react"

const addressSchema = z.object({
  label: z.string().min(2, "Label is required"),
  line1: z.string().min(5, "Address line is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Pincode is required"),
  mobile: z.string().min(10, "Mobile is required"),
  is_default: z.boolean().optional(),
})
type AddressForm = z.infer<typeof addressSchema>

function InlineField({
  label, value, onSave, editable = true,
}: {
  label: string
  value: string
  onSave?: (val: string) => void
  editable?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  const save = () => { onSave?.(draft); setEditing(false) }
  const cancel = () => { setDraft(value); setEditing(false) }

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        {editing ? (
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mt-1 h-8 text-sm"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel() }}
          />
        ) : (
          <p className="mt-0.5 text-sm font-medium text-slate-800 truncate" title={value}>
            {value || <span className="text-slate-400 italic">Not set</span>}
          </p>
        )}
      </div>
      {editable && (
        <div className="flex shrink-0 items-center gap-1">
          {editing ? (
            <>
              <button onClick={save} className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50"><Check className="size-4" /></button>
              <button onClick={cancel} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil className="size-4" /></button>
          )}
        </div>
      )}
    </div>
  )
}

function AddressCard({
  address, onEdit, onDelete,
}: {
  address: Address
  onEdit: (address: Address) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">{address.label}</span>
          {address.is_default && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <Star className="size-3" /> Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(address)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil className="size-4" /></button>
          <button onClick={() => onDelete(address.address_id)} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
        </div>
      </div>
      <div className="mt-2 space-y-0.5 text-sm text-slate-600">
        <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
        <p>{address.city}, {address.state} — {address.pincode}</p>
        <p className="text-slate-400">{address.mobile}</p>
      </div>
    </div>
  )
}

function AddressFormPanel({
  initial, onSubmit, onCancel, isPending,
}: {
  initial?: Partial<AddressForm>
  onSubmit: (data: AddressForm) => void
  onCancel: () => void
  isPending: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: "Home", is_default: false, ...initial },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-xs">Label</Label>
          <Input {...register("label")} className="mt-1 h-8 text-sm" />
          {errors.label && <p className="text-xs text-destructive mt-0.5">{errors.label.message}</p>}
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" id="is_default" {...register("is_default")} className="size-4" />
          <label htmlFor="is_default" className="text-sm text-slate-600">Set as default</label>
        </div>
      </div>
      <div>
        <Label className="text-xs">Address line 1</Label>
        <Input {...register("line1")} className="mt-1 h-8 text-sm" />
        {errors.line1 && <p className="text-xs text-destructive mt-0.5">{errors.line1.message}</p>}
      </div>
      <div>
        <Label className="text-xs">Address line 2 (optional)</Label>
        <Input {...register("line2")} className="mt-1 h-8 text-sm" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label className="text-xs">City</Label>
          <Input {...register("city")} className="mt-1 h-8 text-sm" />
          {errors.city && <p className="text-xs text-destructive mt-0.5">{errors.city.message}</p>}
        </div>
        <div>
          <Label className="text-xs">State</Label>
          <Input {...register("state")} className="mt-1 h-8 text-sm" />
          {errors.state && <p className="text-xs text-destructive mt-0.5">{errors.state.message}</p>}
        </div>
        <div>
          <Label className="text-xs">Pincode</Label>
          <Input {...register("pincode")} className="mt-1 h-8 text-sm" />
          {errors.pincode && <p className="text-xs text-destructive mt-0.5">{errors.pincode.message}</p>}
        </div>
      </div>
      <div>
        <Label className="text-xs">Mobile</Label>
        <Input {...register("mobile")} className="mt-1 h-8 text-sm" />
        {errors.mobile && <p className="text-xs text-destructive mt-0.5">{errors.mobile.message}</p>}
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={isPending}>{isPending ? "Saving…" : "Save address"}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const addAddress = useAddAddress()
  const updateAddress = useUpdateAddress()
  const deleteAddress = useDeleteAddress()
  const user = useAuthStore((s) => s.user)
  
  useEffect(() => {
    document.title = "Anozon - Profile"
  }, [])

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [avatarUrlDraft, setAvatarUrlDraft] = useState("")

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "?"

  const handleSaveField = (field: "full_name" | "mobile" | "avatar_url", value: string) => {
    updateProfile.mutate({ [field]: value })
  }

  const handleAddAddress = (data: AddressForm) => {
    addAddress.mutate({ ...data, is_default: data.is_default ?? false }, {
      onSuccess: () => setShowAddForm(false),
    })
  }

  const handleUpdateAddress = (data: AddressForm) => {
    if (!editingAddress) return
    updateAddress.mutate({ address_id: editingAddress.address_id, data: { ...data, is_default: data.is_default ?? false } }, {
      onSuccess: () => setEditingAddress(null),
    })
  }

  const handleDeleteAddress = (address_id: string) => {
    deleteAddress.mutate(address_id)
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-6">

      {/* Avatar + name header */}
      <div className="flex flex-col sm:flex-row items-center gap-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="relative group">
          <Avatar className="size-32 text-4xl shadow-md ring-4 ring-slate-50 transition-all group-hover:opacity-90">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <button 
            onClick={() => {
              setAvatarUrlDraft(profile?.avatar_url ?? "")
              setIsEditingAvatar(true)
            }}
            className="absolute bottom-0 right-0 rounded-full bg-slate-900 p-2 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          >
            <Pencil className="size-4" />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-3">
          {isEditingAvatar ? (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Enter Avatar URL</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={avatarUrlDraft}
                  onChange={(e) => setAvatarUrlDraft(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="h-10 text-sm"
                  autoFocus
                />
                <Button 
                  size="sm" 
                  onClick={() => {
                    handleSaveField("avatar_url", avatarUrlDraft)
                    setIsEditingAvatar(false)
                  }}
                >
                  <Check className="size-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsEditingAvatar(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">{profile?.full_name || user?.email}</p>
                <p className="text-slate-500 font-medium">{user?.email}</p>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="inline-block rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
                  {user?.role}
                </span>
                <span className="inline-block rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  {profile?.addresses?.length ?? 0} Saved Addresses
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Personal info */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-1">Personal Info</h2>
        <InlineField
          label="Full Name"
          value={profile?.full_name ?? ""}
          onSave={(v) => handleSaveField("full_name", v)}
        />
        <InlineField
          label="Email"
          value={user?.email ?? ""}
          editable={false}
        />
        <InlineField
          label="Mobile"
          value={profile?.mobile ?? ""}
          onSave={(v) => handleSaveField("mobile", v)}
        />
        <InlineField
          label="Avatar URL"
          value={profile?.avatar_url ?? ""}
          onSave={(v) => handleSaveField("avatar_url", v)}
        />
      </section>

      {/* Addresses */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Addresses</h2>
          </div>
          {!showAddForm && !editingAddress && (
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
              <Plus className="size-4" /> Add
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {showAddForm && (
            <AddressFormPanel
              onSubmit={handleAddAddress}
              onCancel={() => setShowAddForm(false)}
              isPending={addAddress.isPending}
            />
          )}

          {profile?.addresses?.length ? (
            profile.addresses.map((addr) =>
              editingAddress?.address_id === addr.address_id ? (
                <AddressFormPanel
                  key={addr.address_id}
                  initial={addr}
                  onSubmit={handleUpdateAddress}
                  onCancel={() => setEditingAddress(null)}
                  isPending={updateAddress.isPending}
                />
              ) : (
                <AddressCard
                  key={addr.address_id}
                  address={addr}
                  onEdit={setEditingAddress}
                  onDelete={handleDeleteAddress}
                />
              )
            )
          ) : (
            !showAddForm && (
              <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                No saved addresses yet. Add one to place orders.
              </p>
            )
          )}
        </div>
      </section>
    </div>
  )
}
