"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAdminSellers, useApproveSeller, useRejectSeller, useSuspendSeller, useUnsuspendSeller } from "@/hooks/useAdminDashboard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, CheckCircle, XCircle, Pause, Play, ChevronLeft, ChevronRight } from "lucide-react"

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
]

function getStatusBadge(seller: any) {
  if (seller.is_suspended) return <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400">Suspended</Badge>
  const s = seller.application_status
  if (s === "pending") return <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400">Pending</Badge>
  if (s === "approved") return <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">Approved</Badge>
  if (s === "rejected") return <Badge variant="outline" className="border-red-500 text-red-600 dark:text-red-400">Rejected</Badge>
  return <Badge variant="outline">{s}</Badge>
}

export default function SellersPage() {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState(searchParams.get("status") || "pending")
  const [page, setPage] = useState(1)
  const limit = 15

  const [reasonDialog, setReasonDialog] = useState<{ type: "reject" | "suspend" | "unsuspend"; sellerId: string } | null>(null)
  const [reason, setReason] = useState("")

  const params = { page, limit, search: search || undefined, status: status === "all" ? undefined : status }
  const { data, isLoading } = useAdminSellers(params)
  const approveMutation = useApproveSeller()
  const rejectMutation = useRejectSeller()
  const suspendMutation = useSuspendSeller()
  const unsuspendMutation = useUnsuspendSeller()

  const sellers = data?.sellers || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  function handleReasonSubmit() {
    if (!reasonDialog || reason.length < 5) return
    const { type, sellerId } = reasonDialog
    if (type === "reject") rejectMutation.mutate({ user_id: sellerId, reason })
    if (type === "suspend") suspendMutation.mutate({ user_id: sellerId, reason })
    if (type === "unsuspend") unsuspendMutation.mutate({ user_id: sellerId, reason })
    setReasonDialog(null)
    setReason("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading text-3xl font-bold tracking-tight">Seller Management</h1>
        <p className="text-muted-foreground mt-1">Manage seller applications, approvals, and suspensions.</p>
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
              <Input
                placeholder="Search by business name or email…"
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : sellers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No sellers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Applied</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((s: any) => (
                    <TableRow key={s._id}>
                      <TableCell className="font-medium">{s.business_name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{s.email}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm capitalize">{s.business_type}</TableCell>
                      <TableCell>{getStatusBadge(s)}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {s.application_status === "pending" && (
                              <>
                                <DropdownMenuItem onClick={() => approveMutation.mutate(s.user_id)}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setReasonDialog({ type: "reject", sellerId: s.user_id }); setReason("") }}>
                                  <XCircle className="mr-2 h-4 w-4 text-red-500" />Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {s.application_status === "approved" && !s.is_suspended && (
                              <DropdownMenuItem onClick={() => { setReasonDialog({ type: "suspend", sellerId: s.user_id }); setReason("") }}>
                                <Pause className="mr-2 h-4 w-4 text-orange-500" />Suspend
                              </DropdownMenuItem>
                            )}
                            {s.is_suspended && (
                              <DropdownMenuItem onClick={() => { setReasonDialog({ type: "unsuspend", sellerId: s.user_id }); setReason("") }}>
                                <Play className="mr-2 h-4 w-4 text-green-500" />Unsuspend
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
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

      {/* Reason Dialog */}
      <Dialog open={!!reasonDialog} onOpenChange={(open) => { if (!open) setReasonDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{reasonDialog?.type} Seller</DialogTitle>
            <DialogDescription>
              Please provide a reason (minimum 5 characters). This will be logged.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter reason…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReasonDialog(null)}>Cancel</Button>
            <Button
              onClick={handleReasonSubmit}
              disabled={reason.length < 5 || rejectMutation.isPending || suspendMutation.isPending || unsuspendMutation.isPending}
            >
              {rejectMutation.isPending || suspendMutation.isPending || unsuspendMutation.isPending ? "Processing…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
