"use client"

import { useAuthStore } from "@/store/useAuthStore"
import Loading from "@/app/loading"

export function AuthInit({ children }: { children: React.ReactNode }) {
    const isInitializing = useAuthStore((s) => s.isInitializing)

    if (isInitializing) {
        return <Loading />
    }

    return <>{children}</>
}
