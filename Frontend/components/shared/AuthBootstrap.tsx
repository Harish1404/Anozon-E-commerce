"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { authService } from "@/services/auth"
import api from "@/lib/axios"
import { useQueryClient } from "@tanstack/react-query"

export function AuthBootstrap() {
    const { setAuth, logout } = useAuthStore()
    const queryClient = useQueryClient()

    useEffect(() => {
        // Apply saved theme before first paint to prevent flash
        const theme = localStorage.getItem("anozon-theme")
        if (theme === "dark") {
            document.documentElement.classList.add("dark")
        } else if (theme === "light") {
            document.documentElement.classList.remove("dark")
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.classList.add("dark")
        }

        console.log("AuthBootstrap: refreshing...")
        authService.refresh()
            .then(async (res) => {
                console.log("AuthBootstrap: refresh success")
                const token = res.data.access_token
                api.defaults.headers.common["Authorization"] = `Bearer ${token}`
                const { data: user } = await authService.me()
                setAuth(token, user)
                queryClient.invalidateQueries({ queryKey: ["profile"] })
                queryClient.invalidateQueries({ queryKey: ["cart"] })
            })
            .catch((err) => {
                console.log("AuthBootstrap: refresh failed", err.response?.status)
                logout()
                queryClient.clear()
            })
    }, [])

    return null
}
