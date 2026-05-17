"use client"

export function OrderSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="h-16 bg-muted/50 animate-pulse border-b border-border" />
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
            </div>
            <div className="flex gap-4">
              <div className="h-20 w-20 bg-muted animate-pulse rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
                <div className="flex gap-2 mt-2">
                  <div className="h-8 w-24 bg-muted animate-pulse rounded-full" />
                  <div className="h-8 w-24 bg-muted animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
