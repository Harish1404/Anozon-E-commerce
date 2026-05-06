"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { authService } from "@/services/auth"
import api from "@/lib/axios"

export function AuthBootstrap() {
    const { setAuth, logout } = useAuthStore()

    useEffect(() => {
        authService.refresh()
            .then(async (res) => {
                const token = res.data.access_token
                api.defaults.headers.common["Authorization"] = `Bearer ${token}`
                const { data: user } = await authService.me()
                setAuth(token, user)
            })
            .catch(() => {
                logout()
            })
    }, [])

    return null
}
