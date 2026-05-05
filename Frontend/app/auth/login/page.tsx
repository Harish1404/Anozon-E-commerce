"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Eye, EyeOff, Loader2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useLogin } from "@/hooks/useAuthHook"

const loginSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const { mutate: login, isPending, error } = useLogin()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

    const onSubmit = (data: LoginForm) => {
        login({ email: data.email, password: data.password })
    }

    const serverError =
        error && "response" in (error as any)
            ? (error as any).response?.data?.detail ?? "Unable to sign in."
            : null

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-10">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Welcome back</p>
                        <h1 className="text-2xl font-semibold">Sign in to Anozon</h1>
                    </div>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>Enter your credentials to continue shopping.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            {serverError && (
                                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                    {serverError}
                                </div>
                            )}

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

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="........."
                                        autoComplete="current-password"
                                        aria-invalid={!!errors.password}
                                        className="pr-10"
                                        {...register("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <Link href="/auth/forgot-password" className="font-medium text-foreground underline-offset-4 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                            <Button type="submit" className="mt-1 w-full" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isPending ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="justify-center text-sm text-muted-foreground">
                        New here?&nbsp;
                        <Link href="/auth/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
                            Create an account
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

