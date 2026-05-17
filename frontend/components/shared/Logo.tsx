"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  variant?: "full" | "icon"
  height?: number
}

export function Logo({ 
  className, 
  variant = "full", 
  height = 32 
}: LogoProps) {
  const src = variant === "full" ? "/assets/Anozon.svg" : "/assets/logo.svg"
  
  return (
    <div className={cn("flex items-center", className)} style={{ height }}>
      <img
        src={src}
        alt="Anozon"
        style={{ height: "100%", width: "auto" }}
        className="object-contain"
      />
    </div>
  )
}
