"use client"

import { useState, useEffect } from "react"
import { useAdminList, usePromoteToAdmin, useDemoteToUser, useAdminUsers } from "@/hooks/useAdminDashboard"
import { useAuthStore } from "@/store/useAuthStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShieldCheck, ShieldMinus, UserPlus, Search, Crown } from "lucide-react"

export default function AdminManagementPage() {
  const { user: currentUser } = useAuthStore()
  const { data: adminData, isLoading } = useAdminList()
  const promoteMutation = usePromoteToAdmin()
  const demoteMutation = useDemoteToUser()

  const [promoteDialog, setPromoteDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [demoteDialog, setDemoteDialog] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    document.title = "Admins — Anozon Admin"
  }, [])

  // Search users to promote
  const { data: searchData } = useAdminUsers(
    promoteDialog && searchQuery.length >= 2
      ? { search: searchQuery, limit: 10 }
      : undefined
  )

  const admins = adminData?.admins || []
  const searchResults = searchData?.users || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-heading text-3xl font-bold tracking-tight">Admin Management</h1>
          <p className="text-muted-foreground mt-1">Manage platform administrators — promote and demote users.</p>
        </div>
        <Button onClick={() => setPromoteDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Promote User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Administrators</CardTitle>
          <CardDescription>{admins.length} admin(s) on the platform</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No admins found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((a: any) => (
                    <TableRow key={a._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {a.role === "super_admin" && <Crown className="h-4 w-4 text-amber-500" />}
                          {a.username || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{a.email}</TableCell>
                      <TableCell>
                        {a.role === "super_admin" ? (
                          <Badge className="bg-purple-600 text-white hover:bg-purple-700">Super Admin</Badge>
                        ) : (
                          <Badge className="bg-primary text-primary-foreground">Admin</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        {/* Cannot demote super_admins or self */}
                        {a.role === "admin" && a._id !== currentUser?._id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => setDemoteDialog({ id: a._id, name: a.username || a.email })}
                          >
                            <ShieldMinus className="mr-1 h-4 w-4" />
                            Demote
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promote Dialog */}
      <Dialog open={promoteDialog} onOpenChange={setPromoteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Promote User to Admin</DialogTitle>
            <DialogDescription>Search for a verified user to promote.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or username (min 2 chars)…"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery.length >= 2 && (
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No users found.</p>
              ) : (
                searchResults
                  .filter((u: any) => u.role === "user" || u.role === "seller")
                  .map((u: any) => (
                    <div key={u._id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{u.username || "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email} • {u.role}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          promoteMutation.mutate(u._id)
                          setPromoteDialog(false)
                          setSearchQuery("")
                        }}
                        disabled={promoteMutation.isPending || !u.is_verified}
                      >
                        <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                        Promote
                      </Button>
                    </div>
                  ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Demote Confirmation */}
      <Dialog open={!!demoteDialog} onOpenChange={(open) => { if (!open) setDemoteDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demote Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to demote &quot;{demoteDialog?.name}&quot; from admin to user?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDemoteDialog(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => { demoteMutation.mutate(demoteDialog!.id); setDemoteDialog(null) }}
              disabled={demoteMutation.isPending}
            >
              {demoteMutation.isPending ? "Processing…" : "Demote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
