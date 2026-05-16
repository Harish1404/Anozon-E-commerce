"use client"

import { useState } from "react"
import { useAdminReviews, useDeleteReview, useSellersList } from "@/hooks/useAdminDashboard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Trash2, ChevronLeft, ChevronRight, Store, ArrowUpDown } from "lucide-react"

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">{rating}</span>
    </div>
  )
}

export default function ReviewsPage() {
  const [search, setSearch] = useState("")
  const [sellerId, setSellerId] = useState("")
  const [sortRating, setSortRating] = useState("")
  const [page, setPage] = useState(1)
  const limit = 20

  const [deleteDialog, setDeleteDialog] = useState<{ reviewId: string; comment: string } | null>(null)
  const [reason, setReason] = useState("")

  const params = {
    page, limit,
    search: search || undefined,
    seller_id: sellerId || undefined,
    sort_rating: sortRating || undefined,
  }
  const { data, isLoading } = useAdminReviews(params)
  const deleteMutation = useDeleteReview()
  const { data: sellersData } = useSellersList()

  const reviews = data?.reviews || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)
  const sellers = sellersData?.sellers || []

  function handleDelete() {
    if (!deleteDialog || reason.length < 5) return
    deleteMutation.mutate({ review_id: deleteDialog.reviewId, reason })
    setDeleteDialog(null)
    setReason("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading text-3xl font-bold tracking-tight">Review Management</h1>
        <p className="text-muted-foreground mt-1">Moderate platform reviews — search and remove policy-violating content.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{total} total reviews</p>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Seller filter dropdown */}
              <Select value={sellerId} onValueChange={(val) => { if (val !== null) { setSellerId(val === "__all__" ? "" : val); setPage(1); } }}>
                <SelectTrigger className="h-9 w-full sm:w-[180px] text-sm">
                  <div className="flex items-center gap-2">
                    <Store className="size-3.5 text-muted-foreground" />
                    <SelectValue placeholder="All Sellers" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Sellers</SelectItem>
                  {sellers.map((s: any) => (
                    <SelectItem key={s.user_id} value={s.user_id}>{s.business_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Rating sort dropdown */}
              <Select value={sortRating} onValueChange={(val) => { if (val !== null) { setSortRating(val === "__default__" ? "" : val); setPage(1); } }}>
                <SelectTrigger className="h-9 w-full sm:w-[180px] text-sm">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="size-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Sort by Rating" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__default__">Newest First</SelectItem>
                  <SelectItem value="desc">Rating: High to Low</SelectItem>
                  <SelectItem value="asc">Rating: Low to High</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by review comment…"
                  className="pl-9"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No reviews found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="hidden md:table-cell">Quality</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="w-[60px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((r: any) => (
                    <TableRow key={r._id}>
                      <TableCell className="text-sm font-medium">{r.name || "Anonymous"}</TableCell>
                      <TableCell><RatingStars rating={r.rating} /></TableCell>
                      <TableCell className="hidden md:table-cell text-sm capitalize">{r.quality || "—"}</TableCell>
                      <TableCell>
                        <p className="text-sm max-w-[300px] truncate">{r.comment}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => { setDeleteDialog({ reviewId: r._id, comment: r.comment }); setReason("") }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialog} onOpenChange={(open) => { if (!open) setDeleteDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              This will permanently remove the review and recalculate the product rating. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          {deleteDialog && (
            <div className="rounded-md border border-border p-3 bg-muted/50 text-sm italic">
              &ldquo;{deleteDialog.comment}&rdquo;
            </div>
          )}
          <Textarea placeholder="Reason for deletion (min 5 characters)…" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[80px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={reason.length < 5 || deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting…" : "Delete Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
