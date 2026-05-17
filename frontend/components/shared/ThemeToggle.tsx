"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("anozon-theme")
    if (stored === "dark") {
      setDark(true)
    } else if (stored === "light") {
      setDark(false)
    } else {
      // Follow system preference
      setDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("anozon-theme", dark ? "dark" : "light")
  }, [dark, mounted])

  // Prevent hydration mismatch — render nothing until mounted
  if (!mounted) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full" />
    )
  }

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  )
}
