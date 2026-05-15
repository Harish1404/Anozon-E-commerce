"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useLogout } from "@/hooks/useAuthHook"
import { useProfile, useUpdateProfile } from "@/hooks/useProfile"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut, Store, ShieldCheck, Mail, Phone, User, Pencil, Check, X } from "lucide-react"
import Link from "next/link"

function InlineEditRow({
  label, value, onSave, placeholder = "", icon: Icon, editable = true,
}: {
  label: string
  value: string
  onSave?: (val: string) => void
  placeholder?: string
  icon: any
  editable?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => { setDraft(value) }, [value])

  const handleSave = () => { onSave?.(draft); setIsEditing(false) }
  const handleCancel = () => { setDraft(value); setIsEditing(false) }

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          {isEditing ? (
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              className="mt-1 h-8 text-sm"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
            />
          ) : (
            <p className="text-sm font-medium text-foreground truncate">
              {value || <span className="italic text-muted-foreground/60">Not set</span>}
            </p>
          )}
        </div>
      </div>
      {editable && (
        <div className="shrink-0">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <button onClick={handleSave} className="rounded-md p-1.5 text-green-600 hover:bg-green-500/10" title="Save"><Check className="h-4 w-4" /></button>
              <button onClick={handleCancel} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" title="Cancel"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="Edit"><Pencil className="h-4 w-4" /></button>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminProfilePage() {
  const { user } = useAuthStore()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const { mutate: logout, isPending: isLogoutPending } = useLogout()

  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [avatarDraft, setAvatarDraft] = useState("")

  const isSuperAdmin = user?.role === "super_admin"
  const roleLabel = isSuperAdmin ? "Super Admin" : "Admin"

  const adminName = profile?.full_name || user?.email?.split("@")[0] || "Admin"
  const initials = profile?.full_name
    ? profile.full_name.slice(0, 2).toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AD"

  const handleSaveField = (field: "full_name" | "mobile" | "avatar_url", value: string) => {
    updateProfile.mutate({ [field]: value })
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl animate-pulse">
        <div className="h-10 w-48 bg-muted rounded" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-heading text-3xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your administrative account information and settings.</p>
      </div>

      {/* Account Profile Header */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Profile Avatar & Status</CardTitle>
          <CardDescription>Click the pencil on your avatar to update your profile photo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-primary/20 shadow">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => {
                  setAvatarDraft(profile?.avatar_url ?? "")
                  setIsEditingAvatar(true)
                }}
                className="absolute bottom-0 right-0 rounded-full bg-foreground p-1.5 text-background shadow-lg hover:scale-105 active:scale-95 transition-transform"
                title="Edit Avatar URL"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2 w-full">
              {isEditingAvatar ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">Avatar Image URL</p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={avatarDraft}
                      onChange={(e) => setAvatarDraft(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                      className="h-9 text-sm"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        handleSaveField("avatar_url", avatarDraft)
                        setIsEditingAvatar(false)
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingAvatar(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xl font-semibold text-foreground truncate">
                    {adminName}
                  </p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="pt-1">
                    <Badge className={isSuperAdmin ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-primary text-primary-foreground"}>
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                      {roleLabel}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Account Information</CardTitle>
          <CardDescription>Click the edit icon on any row to update your profile data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <InlineEditRow
            label="Full Name"
            value={profile?.full_name ?? ""}
            onSave={(val) => handleSaveField("full_name", val)}
            placeholder="Enter your full name"
            icon={User}
          />
          <InlineEditRow
            label="Email Address"
            value={user?.email ?? ""}
            icon={Mail}
            editable={false}
          />
          <InlineEditRow
            label="Mobile Number"
            value={profile?.mobile ?? ""}
            onSave={(val) => handleSaveField("mobile", val)}
            placeholder="Enter your mobile number"
            icon={Phone}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/" className="block">
            <Button variant="outline" className="w-full justify-start gap-3">
              <Store className="h-4 w-4" />
              Switch to Store Front
            </Button>
          </Link>
          <Button
            variant="destructive"
            className="w-full justify-start gap-3"
            onClick={() => logout()}
            disabled={isLogoutPending}
          >
            <LogOut className="h-4 w-4" />
            {isLogoutPending ? "Logging out…" : "Logout"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
