"use client"

import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { OrderStatus } from "@/types"

interface OrderTimelineProps {
  status: OrderStatus
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  const isCancelled = status === "cancelled"
  const steps = ["pending", "confirmed", "shipped", "delivered"]
  
  // Map exact and partial statuses to the step index
  const getStepIndex = (s: OrderStatus) => {
    switch (s) {
      case "pending": return 0
      case "confirmed": return 1
      case "partially_shipped": return 2
      case "shipped": return 2
      case "partially_delivered": return 3
      case "delivered": return 3
      default: return 0
    }
  }
  
  const currentStepIndex = getStepIndex(status)

  if (isCancelled) return null

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
      <h2 className="text-lg font-semibold text-slate-900 mb-8">Order Progress</h2>
      <div className="relative flex justify-between">
        <div className="absolute top-5 left-0 h-0.5 w-full bg-slate-100 -z-0" />
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex
          const isCurrent = index === currentStepIndex
          
          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
              <div className={cn(
                "flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                isCompleted ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-400",
                isCurrent && "ring-4 ring-primary/20"
              )}>
                {isCompleted ? <CheckCircle2 className="size-5" /> : (index + 1)}
              </div>
              <span className={cn(
                "text-xs font-semibold capitalize whitespace-nowrap",
                isCompleted ? "text-slate-900" : "text-slate-400"
              )}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
