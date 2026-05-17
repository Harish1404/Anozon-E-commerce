"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Eye, EyeOff, Loader2, ShoppingBag } from "lucide-react"
import { useSignup } from "@/hooks/useAuthHook"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const signupSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(15, "Username must be at most 15 characters")
            .regex(/^[a-zA-Z0-9_@]+$/, "Username can only contain letters, numbers, _ and @"),
        email: z.string().email("Enter a valid email address"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .regex(/[a-z]/, "Must contain at least one lowercase letter")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain at least one special character"),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    
    useEffect(() => {
        document.title = "Anozon - Signup"
    }, [])

    const { mutate: signup, isPending, error } = useSignup()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })

    const onSubmit = (data: SignupForm) => {
        signup({ username: data.username, email: data.email, password: data.password })
    }

    const serverError = (() => {
        if (!error) return null;
        const res = (error as any).response;
        if (!res) return (error as any).message ?? "Something went wrong. Please try again.";
        const detail = res.data?.detail;
        if (typeof detail === "string") return detail;
        if (Array.isArray(detail)) return detail.map((d: any) => d.msg ?? JSON.stringify(d)).join(", ");
        return "Something went wrong. Please try again.";
    })();

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center ">
                    <Link href="/">
                        <img
                            src="/anozon2.png"
                            alt="Anozon Logo"
                            className="h-20 w-auto object-contain"
                        />
                    </Link>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Create an account</CardTitle>
                        <CardDescription>Sign up to start shopping on Anozon</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            {/* Server error */}
                            {serverError && (
                                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                    {serverError}
                                </div>
                            )}

                            {/* Username */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    placeholder="Enter your username..."
                                    autoComplete="username"
                                    aria-invalid={!!errors.username}
                                    {...register("username")}
                                />
                                {errors.username && (
                                    <p className="text-xs text-destructive">{errors.username.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    aria-invalid={!!errors.email}
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="*********"
                                        autoComplete="new-password"
                                        aria-invalid={!!errors.password}
                                        className="pr-10"
                                        {...register("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        aria-invalid={!!errors.confirmPassword}
                                        className="pr-10"
                                        {...register("confirmPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((p) => !p)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="mt-1 w-full" disabled={isPending}>
                                {isPending && <Loader2 className="size-4 animate-spin" />}
                                {isPending ? "Creating account…" : "Create account"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="justify-center text-sm text-muted-foreground">
                        Already have an account?&nbsp;
                        <Link href="/auth/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                            Sign in
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

