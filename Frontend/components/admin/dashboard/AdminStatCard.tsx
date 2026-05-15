import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface AdminStatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  className?: string
  trend?: string
  href?: string
}

export function AdminStatCard({ label, value, icon, className, trend, href }: AdminStatCardProps) {
  const content = (
    <Card className={cn(
      "bg-card text-card-foreground border-border transition-all duration-200",
      href && "hover:border-primary/40 hover:shadow-md cursor-pointer",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href} className="block">{content}</Link>
  }
  return content
}
