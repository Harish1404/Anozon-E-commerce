import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export type StatColor = "blue" | "emerald" | "violet" | "amber" | "rose" | "cyan" | "indigo"

interface AdminStatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  className?: string
  trend?: string
  href?: string
  color?: StatColor
}

const colorMap: Record<StatColor, { iconWrapper: string; textVal: string; border: string }> = {
  blue: {
    iconWrapper: "bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    textVal: "text-blue-950 font-extrabold dark:font-bold dark:text-blue-300",
    border: "border-blue-500/25 hover:border-blue-500/45 dark:border-blue-500/30 dark:hover:border-blue-500/50",
  },
  emerald: {
    iconWrapper: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    textVal: "text-emerald-950 font-extrabold dark:font-bold dark:text-emerald-300",
    border: "border-emerald-500/25 hover:border-emerald-500/45 dark:border-emerald-500/30 dark:hover:border-emerald-500/50",
  },
  violet: {
    iconWrapper: "bg-violet-500/15 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
    textVal: "text-violet-950 font-extrabold dark:font-bold dark:text-violet-300",
    border: "border-violet-500/25 hover:border-violet-500/45 dark:border-violet-500/30 dark:hover:border-violet-500/50",
  },
  amber: {
    iconWrapper: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    textVal: "text-amber-950 font-extrabold dark:font-bold dark:text-amber-300",
    border: "border-amber-500/25 hover:border-amber-500/45 dark:border-amber-500/30 dark:hover:border-amber-500/50",
  },
  rose: {
    iconWrapper: "bg-rose-500/15 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    textVal: "text-rose-950 font-extrabold dark:font-bold dark:text-rose-300",
    border: "border-rose-500/25 hover:border-rose-500/45 dark:border-rose-500/30 dark:hover:border-rose-500/50",
  },
  cyan: {
    iconWrapper: "bg-cyan-500/15 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-400",
    textVal: "text-cyan-950 font-extrabold dark:font-bold dark:text-cyan-300",
    border: "border-cyan-500/25 hover:border-cyan-500/45 dark:border-cyan-500/30 dark:hover:border-cyan-500/50",
  },
  indigo: {
    iconWrapper: "bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    textVal: "text-indigo-950 font-extrabold dark:font-bold dark:text-indigo-300",
    border: "border-indigo-500/25 hover:border-indigo-500/45 dark:border-indigo-500/30 dark:hover:border-indigo-500/50",
  },
}

export function AdminStatCard({ label, value, icon, className, trend, href, color = "blue" }: AdminStatCardProps) {
  const c = colorMap[color]

  const content = (
    <Card className={cn(
      "bg-card text-card-foreground transition-all duration-200 shadow-sm",
      c ? c.border : "border-border",
      href && "hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</CardTitle>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", c ? c.iconWrapper : "bg-muted text-muted-foreground")}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold leading-none", c ? c.textVal : "text-foreground")}>{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1.5">{trend}</p>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href} className="block">{content}</Link>
  }
  return content
}
