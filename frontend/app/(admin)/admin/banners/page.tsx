"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminService } from "@/services/admin.service"
import { Banner, BannerCreate, BannerUpdate } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Eye, EyeOff, ImageIcon } from "lucide-react"

export default function AdminBannersPage() {
  const queryClient = useQueryClient()
  const [editBanner, setEditBanner] = useState<Banner | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null)

  const bannersQuery = useQuery<{ banners: Banner[] }>({
    queryKey: ["admin", "banners"],
    queryFn: () => adminService.getBanners().then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] })
      queryClient.invalidateQueries({ queryKey: ["landing"] })
      toast.success("Banner deleted")
      setDeleteTarget(null)
    },
    onError: () => toast.error("Failed to delete banner"),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      adminService.updateBanner(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] })
      queryClient.invalidateQueries({ queryKey: ["landing"] })
      toast.success("Banner updated")
    },
    onError: () => toast.error("Failed to update banner"),
  })

  const banners: Banner[] = bannersQuery.data?.banners ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Banner Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage homepage carousel banners
          </p>
        </div>
        <BannerFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "banners"] })
            queryClient.invalidateQueries({ queryKey: ["landing"] })
            setCreateOpen(false)
          }}
        >
          <Button size="sm">
            <Plus className="size-4 mr-2" /> New Banner
          </Button>
        </BannerFormDialog>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Subtitle</TableHead>
              <TableHead className="w-20 text-center">Priority</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bannersQuery.isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : banners.length === 0
                ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <ImageIcon className="size-10 mx-auto mb-3 text-muted-foreground/40" />
                        No banners yet. Create your first banner to get started.
                      </TableCell>
                    </TableRow>
                  )
                : banners.map((banner) => (
                    <TableRow key={banner._id}>
                      <TableCell>
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className="h-10 w-16 rounded object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {banner.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm truncate max-w-48">
                        {banner.subtitle ?? "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {banner.priority}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={banner.is_active ? "default" : "secondary"}
                        >
                          {banner.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toggleMutation.mutate({
                                id: banner._id,
                                is_active: !banner.is_active,
                              })
                            }
                            title={
                              banner.is_active ? "Deactivate" : "Activate"
                            }
                          >
                            {banner.is_active ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                          <BannerFormDialog
                            banner={banner}
                            open={editBanner?._id === banner._id}
                            onOpenChange={(open) =>
                              setEditBanner(open ? banner : null)
                            }
                            onSuccess={() => {
                              queryClient.invalidateQueries({
                                queryKey: ["admin", "banners"],
                              })
                              queryClient.invalidateQueries({
                                queryKey: ["landing"],
                              })
                              setEditBanner(null)
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditBanner(banner)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </BannerFormDialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(banner)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &quot;{deleteTarget?.title}&quot;?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget._id)
              }
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Banner Form Dialog ──────────────────────────────────────────────────

function BannerFormDialog({
  banner,
  open,
  onOpenChange,
  onSuccess,
  children,
}: {
  banner?: Banner
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  children: React.ReactNode
}) {
  const isEdit = !!banner
  const [title, setTitle] = useState(banner?.title ?? "")
  const [subtitle, setSubtitle] = useState(banner?.subtitle ?? "")
  const [imageUrl, setImageUrl] = useState(banner?.image_url ?? "")
  const [linkUrl, setLinkUrl] = useState(banner?.link_url ?? "")
  const [priority, setPriority] = useState(banner?.priority ?? 0)
  const [isActive, setIsActive] = useState(banner?.is_active ?? true)

  // Reset form when banner prop changes
  useEffect(() => {
    setTitle(banner?.title ?? "")
    setSubtitle(banner?.subtitle ?? "")
    setImageUrl(banner?.image_url ?? "")
    setLinkUrl(banner?.link_url ?? "")
    setPriority(banner?.priority ?? 0)
    setIsActive(banner?.is_active ?? true)
  }, [banner])

  const createMutation = useMutation({
    mutationFn: (data: BannerCreate) => adminService.createBanner(data),
    onSuccess: () => {
      toast.success("Banner created")
      onSuccess()
    },
    onError: () => toast.error("Failed to create banner"),
  })

  const updateMutation = useMutation({
    mutationFn: (data: BannerUpdate) =>
      adminService.updateBanner(banner!._id, data),
    onSuccess: () => {
      toast.success("Banner updated")
      onSuccess()
    },
    onError: () => toast.error("Failed to update banner"),
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      title,
      subtitle: subtitle || undefined,
      image_url: imageUrl,
      link_url: linkUrl || undefined,
      priority,
      is_active: isActive,
    }
    if (isEdit) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={children as React.JSX.Element} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Banner" : "New Banner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="banner-title">Title *</Label>
            <Input
              id="banner-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="banner-subtitle">Subtitle</Label>
            <Input
              id="banner-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="banner-image-url">Image URL *</Label>
            <Input
              id="banner-image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="h-24 w-full rounded-lg object-cover border"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="banner-link-url">Link URL</Label>
            <Input
              id="banner-link-url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="/categories/Electronics"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="banner-priority">Priority</Label>
              <Input
                id="banner-priority"
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <input
                type="checkbox"
                id="banner-is-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="banner-is-active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending || !title || !imageUrl}>
              {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
