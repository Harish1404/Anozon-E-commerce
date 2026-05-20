import { ReactNode } from "react"
import { Navbar } from "@/components/shared/Navbar"
import { MobileHeader } from "@/components/shared/MobileHeader"
import { BottomTabBar } from "@/components/shared/BottomTabBar"
import { AuthInit } from "@/components/shared/AuthInit"

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <AuthInit>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <MobileHeader />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <BottomTabBar />
      </div>
    </AuthInit>
  )
}

