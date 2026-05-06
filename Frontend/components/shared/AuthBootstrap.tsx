"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { authService } from "@/services/auth"
import api from "@/lib/axios"

export function AuthBootstrap() {
    const { setAuth, logout } = useAuthStore()

    useEffect(() => {
        console.log("AuthBootstrap: refreshing...")
        authService.refresh()
            .then(async (res) => {
                console.log("AuthBootstrap: refresh success")
                const token = res.data.access_token
                api.defaults.headers.common["Authorization"] = `Bearer ${token}`
                const { data: user } = await authService.me()
                setAuth(token, user)
            })
            .catch((err) => {
                console.log("AuthBootstrap: refresh failed", err.response?.status)
                logout()
            })
    }, [])

    return null
}
