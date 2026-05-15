import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Store, ArrowRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface PendingSellerWidgetProps {
  count: number
  recent: any[]
}

export function PendingSellerWidget({ count, recent }: PendingSellerWidgetProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Pending Sellers</CardTitle>
            <CardDescription>
              {count} application{count !== 1 ? "s" : ""} need review
            </CardDescription>
          </div>
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full">
            <Store className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {recent.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No pending applications
            </div>
          ) : (
            recent.map((seller) => (
              <div key={seller._id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-muted rounded-md shrink-0">
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{seller.business_name}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3 mr-1" />
                      {seller.created_at ? new Date(seller.created_at).toLocaleDateString() : "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <Link
            href="/admin/sellers?status=pending"
            className={cn(buttonVariants({ variant: "ghost" }), "w-full text-sm text-primary hover:text-primary/90")}
          >
            View All Applications
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
