import { ReactNode } from "react"
import { Navbar } from "@/components/shared/Navbar"
import { BottomTabBar } from "@/components/shared/BottomTabBar"

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomTabBar />
    </div>
  )
}
