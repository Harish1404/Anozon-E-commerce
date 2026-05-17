import api from "@/lib/axios"
import { AuthResponse, User } from "@/types"

export const authService = {
    signup: (username: string, email: string, password: string) =>
      api.post("/auth/signup", { username, email, password }),

    login: (email: string, password: string) => {
        const form = new URLSearchParams()
        form.append("username", email)
        form.append("password", password)
        return api.post<AuthResponse>("/auth/login", form, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
    },

    verifyOtp: (otp_token: string, otp: string) =>
        api.post<AuthResponse>("/auth/verify-otp", { otp_token, otp }),

    resendOtp: (email: string) =>
        api.post("/auth/resend-otp", { email }),

    me: () =>
        api.get<User>("/secure/me"),

    refresh: () =>
        api.post<AuthResponse>("/auth/refresh"),

    logout: () =>
        api.post("/auth/logout"),

    forgotPassword: (email: string) =>
        api.post("/auth/forgot-password", { email }),

    resetPassword: (email: string, token: string, new_password: string) =>
        api.post("/auth/reset-password", { email, token, new_password })
}


