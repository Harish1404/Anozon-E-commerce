"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAdminUsers, useBanUser, useUnbanUser } from "@/hooks/useAdminDashboard"
import { useAuthStore } from "@/store/useAuthStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Ban, ShieldOff, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react"

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
  { value: "banned", label: "Banned" },
]

function getRoleBadge(role: string) {
  if (role === "super_admin") return <Badge className="bg-purple-600 text-white hover:bg-purple-700">Super Admin</Badge>
  if (role === "admin") return <Badge className="bg-primary text-primary-foreground">Admin</Badge>
  if (role === "seller") return <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">Seller</Badge>
  return <Badge variant="secondary">User</Badge>
}

export default function UsersPage() {
  const searchParams = useSearchParams()
  const { user: currentUser } = useAuthStore()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState(searchParams.get("status") || "all")
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    document.title = "Users — Anozon Admin"
    const s = searchParams.get("status")
    if (s) setStatus(s)
    else setStatus("all")
  }, [searchParams])

  const [confirmDialog, setConfirmDialog] = useState<{ action: "ban" | "unban"; userId: string; userName: string } | null>(null)

  const params = { page, limit, search: search || undefined, status: status === "all" ? undefined : status }
  const { data, isLoading } = useAdminUsers(params)
  const banMutation = useBanUser()
  const unbanMutation = useUnbanUser()

  const users = data?.users || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  function handleConfirm() {
    if (!confirmDialog) return
    if (confirmDialog.action === "ban") banMutation.mutate(confirmDialog.userId)
    if (confirmDialog.action === "unban") unbanMutation.mutate(confirmDialog.userId)
    setConfirmDialog(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">View, search, and manage all platform users.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
              <TabsList>
                {STATUS_TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value} className="text-xs sm:text-sm">{t.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by email or username…" className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Role</TableHead>
                    <TableHead className="hidden lg:table-cell">Verified</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u: any) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium">{u.username || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{getRoleBadge(u.role)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {u.is_verified ? (
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <ShieldOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        {u.is_banned ? (
                          <Badge variant="outline" className="border-red-500 text-red-600 dark:text-red-400">Banned</Badge>
                        ) : (
                          <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        {/* Don't show actions for admins/super_admins or for self */}
                        {u.role !== "admin" && u.role !== "super_admin" && u._id !== currentUser?._id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {u.is_banned ? (
                                <DropdownMenuItem onClick={() => setConfirmDialog({ action: "unban", userId: u._id, userName: u.username || u.email })}>
                                  <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />Unban
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => setConfirmDialog({ action: "ban", userId: u._id, userName: u.username || u.email })}>
                                  <Ban className="mr-2 h-4 w-4 text-red-500" />Ban User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={(open) => { if (!open) setConfirmDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog?.action === "ban" ? "Ban User" : "Unban User"}</DialogTitle>
            <DialogDescription>
              {confirmDialog?.action === "ban"
                ? `Are you sure you want to ban "${confirmDialog?.userName}"? They will lose access to the platform.`
                : `Are you sure you want to unban "${confirmDialog?.userName}"? They will regain access.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button
              variant={confirmDialog?.action === "ban" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={banMutation.isPending || unbanMutation.isPending}
            >
              {banMutation.isPending || unbanMutation.isPending ? "Processing…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
