"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OrderFiltersProps {
  year: string
  setYear: (val: string) => void
}

export function OrderFilters({ year, setYear }: OrderFiltersProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-600">
        <span className="hidden sm:inline">Show orders from:</span>
        <span className="sm:hidden">Filter:</span>
      </span>
      <Select value={year} onValueChange={(val) => val && setYear(val)}>
        <SelectTrigger className="w-[140px] h-9 rounded-full bg-white shadow-sm border-slate-200 text-sm font-medium">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current_month">Current Month</SelectItem>
          <SelectItem value="last_30_days">Last 30 Days</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
