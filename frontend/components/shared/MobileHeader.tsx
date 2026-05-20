"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { SearchBar } from "./SearchBar"

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-xl md:hidden px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile Logo */}
        <Link href="/" className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-foreground shrink-0 select-none">
          <ShoppingBag className="size-4.5 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Anozon</span>
        </Link>

        {/* Embedded Autocomplete SearchBar */}
        <div className="flex-1 max-w-xs sm:max-w-sm relative">
          <SearchBar />
        </div>
      </div>
    </header>
  )
}
