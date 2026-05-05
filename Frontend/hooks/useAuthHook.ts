"use client"

import { useMutation } from "@tanstack/react-query"
import { authService } from "@/services/auth"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"


export function useSignup() {
    const router = useRouter()

    return useMutation({
        mutationFn: ({ username, email, password }: { username: string; email: string; password: string }) =>
            authService.signup(username, email, password),
        onSuccess: () => {
            router.push("/auth/verify-otp")
        }
    })
}

export function useVerifyOtp() {
    const { setToken, setAuth } = useAuthStore()
    const router = useRouter()

    useMutation({
        mutationFn: ({ email, otp }: { email: string; otp: string }) =>
            authService.verifyOtp(email, otp),
        onSuccess: async (res) => {
            setToken(res.data.access_token)

            api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`

            const { data: user } = await authService.me()
            setAuth(res.data.access_token, user)
            
            if (res.data.role === "admin") {
                router.push("/admin/dashboard")
            }
            else if (res.data.role === "user") {
                router.push("/user/dashboard")
            }
            else router.push("/")
        }
    })
}

export function useLogin() {
    const { setToken, setAuth } = useAuthStore()
    const router = useRouter()

    return useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            authService.login(email, password),
        onSuccess: async (res) => {
            setToken(res.data.access_token)

            api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`

            const { data: user } = await authService.me()
            setAuth(res.data.access_token, user)
            
            if (res.data.role === "admin") {
                router.push("/admin/dashboard")
            }
            else if (res.data.role === "user") {
                router.push("/user/dashboard")
            }
            else router.push("/")
        }
    })
}

export function useResendOtp() {
    return useMutation({
        mutationFn: ({ email }: { email: string }) =>
            authService.resendOtp(email)
    })
}

export function useLogout() {
    const { logout } = useAuthStore()
    const router = useRouter()

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            logout()
            router.push("/")
        }
    })
}


