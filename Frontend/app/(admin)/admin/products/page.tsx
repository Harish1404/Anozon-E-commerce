"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAdminProducts, useApproveProduct, useRejectProduct, useCategories } from "@/hooks/useAdminDashboard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, CheckCircle, XCircle, ChevronLeft, ChevronRight, Star } from "lucide-react"

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState(searchParams.get("status") || "pending")
  const [category, setCategory] = useState("")
  const [page, setPage] = useState(1)
  const limit = 15

  const [rejectDialog, setRejectDialog] = useState<string | null>(null)
  const [reason, setReason] = useState("")

  const params = {
    page, limit,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    category: category || undefined,
  }
  const { data, isLoading } = useAdminProducts(params)
  const { data: categoriesData } = useCategories()
  const approveMutation = useApproveProduct()
  const rejectMutation = useRejectProduct()

  const products = data?.products || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)
  const categories: string[] = Array.isArray(categoriesData) ? categoriesData : []

  function handleReject() {
    if (!rejectDialog || reason.length < 5) return
    rejectMutation.mutate({ product_id: rejectDialog, reason })
    setRejectDialog(null)
    setReason("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading text-3xl font-bold tracking-tight">Product Management</h1>
        <p className="text-muted-foreground mt-1">Review, approve, or reject products across the platform.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
                <TabsList>
                  {STATUS_TABS.map((t) => (
                    <TabsTrigger key={t.value} value={t.value} className="text-xs sm:text-sm">{t.label}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {categories.length > 0 && (
                  <Select value={category || "all"} onValueChange={(v) => { setCategory(!v || v === "all" ? "" : v); setPage(1) }}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((c: string) => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products…"
                    className="pl-9"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No products found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Price</TableHead>
                    <TableHead className="hidden lg:table-cell">Stock</TableHead>
                    <TableHead className="hidden md:table-cell">Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p: any) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {p.image_urls?.[0] ? (
                            <img src={p.image_urls[0]} alt={p.name} className="h-10 w-10 rounded-md object-cover border border-border" />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">ID: {p._id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm capitalize">{p.category}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">₹{p.price?.toLocaleString()}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{p.stock}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          {(p.avg_rating || 0).toFixed(1)}
                          <span className="text-muted-foreground">({p.review_count || 0})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.is_approved ? (
                          <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">Approved</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!p.is_approved && (
                              <DropdownMenuItem onClick={() => approveMutation.mutate(p._id)}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />Approve
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => { setRejectDialog(p._id); setReason("") }}>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />Reject / Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={(open) => { if (!open) setRejectDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject / Remove Product</DialogTitle>
            <DialogDescription>Provide a reason (min 5 characters). This will be logged in audit.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Enter reason…" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[100px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button>
            <Button onClick={handleReject} disabled={reason.length < 5 || rejectMutation.isPending}>
              {rejectMutation.isPending ? "Processing…" : "Reject Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
