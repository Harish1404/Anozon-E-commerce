"use client"

import { useState, useMemo } from "react"
import { useAuditLogs } from "@/hooks/useAdminDashboard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Filter, RotateCcw, CheckCircle, XCircle, Ban, ShieldCheck, ShieldMinus, UserPlus, Package, Store, Star, Trash2, Clock } from "lucide-react"

const MODULES = [
  { value: "all", label: "All Modules" },
  { value: "seller", label: "Seller" },
  { value: "user", label: "User" },
  { value: "product", label: "Product" },
  { value: "review", label: "Review" },
  { value: "role_management", label: "Role Management" },
  { value: "system", label: "System" },
]

const ACTION_ICONS: Record<string, { icon: typeof CheckCircle; color: string }> = {
  seller_approved: { icon: CheckCircle, color: "text-green-500" },
  seller_rejected: { icon: XCircle, color: "text-red-500" },
  seller_suspended: { icon: Ban, color: "text-orange-500" },
  seller_unsuspended: { icon: CheckCircle, color: "text-green-500" },
  seller_application_submitted: { icon: Store, color: "text-blue-500" },
  seller_reapplied: { icon: Store, color: "text-blue-500" },
  user_banned: { icon: Ban, color: "text-red-500" },
  user_unbanned: { icon: ShieldCheck, color: "text-green-500" },
  promoted_to_admin: { icon: UserPlus, color: "text-purple-500" },
  demoted: { icon: ShieldMinus, color: "text-orange-500" },
  product_approved: { icon: Package, color: "text-green-500" },
  product_rejected: { icon: Package, color: "text-red-500" },
  review_deleted: { icon: Trash2, color: "text-red-500" },
}

function getModuleBadge(module: string) {
  const colors: Record<string, string> = {
    seller: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    user: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    product: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    review: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    role_management: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    system: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  }
  return <Badge variant="secondary" className={colors[module] || colors.system}>{module}</Badge>
}

export default function AuditLogsPage() {
  const [module, setModule] = useState("")
  const [performedBy, setPerformedBy] = useState("")
  const [targetEmail, setTargetEmail] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)
  const limit = 20

  const params = useMemo(() => ({
    page,
    limit,
    module: module || undefined,
    performed_by: performedBy || undefined,
    target: targetEmail || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }), [page, limit, module, performedBy, targetEmail, dateFrom, dateTo])

  const { data, isLoading } = useAuditLogs(params)

  const logs = data?.logs || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  function resetFilters() {
    setModule("")
    setPerformedBy("")
    setTargetEmail("")
    setDateFrom("")
    setDateTo("")
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Complete history of all administrative actions on the platform.</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Select value={module || "all"} onValueChange={(v) => { setModule(!v || v === "all" ? "" : v); setPage(1) }}>
              <SelectTrigger>
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Performed by (email)"
              value={performedBy}
              onChange={(e) => { setPerformedBy(e.target.value); setPage(1) }}
            />

            <Input
              placeholder="Target user (email)"
              value={targetEmail}
              onChange={(e) => { setTargetEmail(e.target.value); setPage(1) }}
            />

            <Input
              type="date"
              placeholder="From date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            />

            <div className="flex items-center gap-2">
              <Input
                type="date"
                placeholder="To date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
              />
              <Button variant="outline" size="icon" onClick={resetFilters} title="Reset filters">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>{total} total log entries</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No audit logs found for the selected filters.</div>
          ) : (
            <div className="space-y-4">
              {logs.map((log: any) => {
                const actionInfo = ACTION_ICONS[log.action] || { icon: Clock, color: "text-muted-foreground" }
                const IconComponent = actionInfo.icon

                return (
                  <div key={log._id} className="flex gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    {/* Icon */}
                    <div className={`mt-0.5 shrink-0 ${actionInfo.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <p className="text-sm font-medium">{log.description || log.action}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          {getModuleBadge(log.module || "system")}
                          <span className="text-xs text-muted-foreground">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                        {log.performed_by && (
                          <span>By: <span className="font-medium text-foreground">{log.performed_by.name || log.performed_by.email}</span></span>
                        )}
                        {log.target && (
                          <span>Target: <span className="font-medium text-foreground">{log.target.name || log.target.email}</span></span>
                        )}
                        {log.target?.role_before && log.target?.role_after && log.target.role_before !== log.target.role_after && (
                          <span>Role: {log.target.role_before} → {log.target.role_after}</span>
                        )}
                      </div>

                      {log.reason && (
                        <p className="mt-2 text-xs italic text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          Reason: {log.reason}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({total} entries)
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
    </div>
  )
}
