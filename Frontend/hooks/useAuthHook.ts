"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authService } from "@/services/auth"
import { useAuthStore } from "@/store/useAuthStore"
import { useCartStore } from "@/store/useCartStore"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"


export function useSignup() {
    const { setOtpToken, setPendingEmail } = useAuthStore()
    const router = useRouter()

    return useMutation({
        mutationFn: ({ username, email, password }: { username: string; email: string; password: string }) =>
            authService.signup(username, email, password),
        onSuccess: (res, variables) => {
            setOtpToken(res.data.otp_token)
            setPendingEmail(variables.email)
            router.push("/auth/verify-otp")
        }
    })
}

export function useVerifyOtp() {
    const { setToken, setAuth, otpToken } = useAuthStore()
    const router = useRouter()

    return useMutation({
        mutationFn: ({ otp }: { otp: string }) => {
            if (!otpToken) throw new Error("OTP token missing. Please sign up again.")
            return authService.verifyOtp(otpToken, otp)
        },
        onSuccess: async (res) => {
            setToken(res.data.access_token)
            api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`
            const { data: user } = await authService.me()
            setAuth(res.data.access_token, user)
            router.push("/")
        }
    })
}

export function useLogin() {
    const { setToken, setAuth, setOtpToken, setPendingEmail } = useAuthStore()
    const router = useRouter()

    return useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            authService.login(email, password),
        onSuccess: async (res) => {
            setToken(res.data.access_token)
            api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`

            const { data: user } = await authService.me()
            setAuth(res.data.access_token, user)

            if (res.data.role === "admin" || res.data.role === "super_admin") {
                router.push("/admin/dashboard")
            } else if (res.data.role === "seller") {
                router.push("/seller/dashboard")
            } else {
                router.push("/")
            }
        },
        onError: async (error: any) => {
            const detail = error?.response?.data?.detail ?? ""
            if (error?.response?.status === 403 && detail.includes("not verified")) {
                const email = error.config?.data
                    ? new URLSearchParams(error.config.data).get("username")
                    : null
                if (!email) return
                try {
                    const res = await authService.resendOtp(email)
                    setOtpToken(res.data.otp_token)
                    setPendingEmail(email)
                    router.push("/auth/verify-otp")
                } catch {
                    // resend failed — let the error surface to the UI
                }
            }
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
    const {resetCart} = useCartStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            logout()
            resetCart()
            queryClient.clear()
            router.push("/")
        }
    })
}


