import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { ArrowRight, CheckCircle, XCircle, Ban, ShieldCheck, ShieldMinus, UserPlus, Package, Store, Trash2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const ACTION_ICONS: Record<string, { icon: typeof CheckCircle; color: string }> = {
  seller_approved: { icon: CheckCircle, color: "bg-green-500" },
  seller_rejected: { icon: XCircle, color: "bg-red-500" },
  seller_suspended: { icon: Ban, color: "bg-orange-500" },
  seller_unsuspended: { icon: CheckCircle, color: "bg-green-500" },
  seller_application_submitted: { icon: Store, color: "bg-blue-500" },
  seller_reapplied: { icon: Store, color: "bg-blue-500" },
  user_banned: { icon: Ban, color: "bg-red-500" },
  user_unbanned: { icon: ShieldCheck, color: "bg-green-500" },
  promoted_to_admin: { icon: UserPlus, color: "bg-purple-500" },
  demoted: { icon: ShieldMinus, color: "bg-orange-500" },
  product_approved: { icon: Package, color: "bg-green-500" },
  product_rejected: { icon: Package, color: "bg-red-500" },
  review_deleted: { icon: Trash2, color: "bg-red-500" },
}

interface RecentActivityFeedProps {
  logs: any[]
  isSuperAdmin: boolean
}

export function RecentActivityFeed({ logs, isSuperAdmin }: RecentActivityFeedProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest platform actions and updates
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-1 flex-1">
          {logs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No recent activity
            </div>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 8).map((log: any, idx: number) => {
                const actionInfo = ACTION_ICONS[log.action] || { icon: Clock, color: "bg-muted-foreground" }
                const IconComponent = actionInfo.icon

                return (
                  <div key={log._id || idx} className="flex items-start gap-3">
                    <div className={cn("mt-0.5 p-1 rounded-full shrink-0", actionInfo.color)}>
                      <IconComponent className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug line-clamp-2">{log.description || log.action}</p>
                      <time className="text-xs text-muted-foreground mt-0.5 block">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                      </time>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {isSuperAdmin && (
          <div className="mt-4 pt-4 border-t border-border">
            <Link
              href="/admin/audit-logs"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full text-sm text-primary hover:text-primary/90"
              )}
            >
              View Full Audit Log
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
