import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Package, ArrowRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface PendingApprovalWidgetProps {
  count: number
  recent: any[]
}

export function PendingApprovalWidget({ count, recent }: PendingApprovalWidgetProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Pending Products</CardTitle>
            <CardDescription>
              {count} product{count !== 1 ? "s" : ""} await approval
            </CardDescription>
          </div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-full">
            <Package className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {recent.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No pending products
            </div>
          ) : (
            recent.map((product) => (
              <div key={product._id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {product.image_urls?.[0] ? (
                    <img src={product.image_urls[0]} alt={product.name} className="h-9 w-9 rounded-md object-cover border border-border shrink-0" />
                  ) : (
                    <div className="p-2 bg-muted rounded-md shrink-0">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3 mr-1" />
                      {product.created_at ? new Date(product.created_at).toLocaleDateString() : "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <Link
            href="/admin/products?status=pending"
            className={cn(buttonVariants({ variant: "ghost" }), "w-full text-sm text-primary hover:text-primary/90")}
          >
            View All Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
