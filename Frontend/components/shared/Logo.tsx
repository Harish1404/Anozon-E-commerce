"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  iconOnly?: boolean
  size?: number
}

export function Logo({ className, iconOnly = false, size = 32 }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          src="/Anozon.svg"
          alt="Anozon Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      {!iconOnly && (
        <span className="text-xl font-semibold tracking-tight text-slate-900">
          Anozon
        </span>
      )}
    </div>
  )
}
