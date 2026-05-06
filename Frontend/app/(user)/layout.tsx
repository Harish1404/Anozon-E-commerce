import { ReactNode } from "react"
import { Navbar } from "@/components/shared/Navbar"

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}
