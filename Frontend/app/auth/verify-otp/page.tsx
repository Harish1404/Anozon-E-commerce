"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { ShoppingBag, Loader2 } from "lucide-react"
import { useVerifyOtp, useResendOtp } from "@/hooks/useAuthHook"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const OTP_LENGTH = 6

export default function VerifyOtpPage() {
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const { mutate: verifyOtp, isPending, error } = useVerifyOtp()
    const { mutate: resendOtp, isPending: isResending } = useResendOtp()
    const otpToken = useAuthStore((s) => s.otpToken)
    const { setOtpToken } = useAuthStore()
    
    useEffect(() => {
        document.title = "Anozon - Verify OTP"
    }, [])

    const focusNext = (index: number) => inputRefs.current[index + 1]?.focus()
    const focusPrev = (index: number) => inputRefs.current[index - 1]?.focus()

    const handleChange = useCallback((value: string, index: number) => {
        // Allow paste of full OTP
        if (value.length > 1) {
            const pasted = value.replace(/\D/g, "").slice(0, OTP_LENGTH)
            const next = Array(OTP_LENGTH).fill("")
            pasted.split("").forEach((c, i) => { next[i] = c })
            setDigits(next)
            inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
            return
        }
        if (!/^\d*$/.test(value)) return
        const next = [...digits]
        next[index] = value
        setDigits(next)
        if (value) focusNext(index)
    }, [digits])

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Backspace" && !digits[index]) focusPrev(index)
        if (e.key === "ArrowLeft") focusPrev(index)
        if (e.key === "ArrowRight") focusNext(index)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const otp = digits.join("")
        if (otp.length < OTP_LENGTH) return
        verifyOtp({ otp })
    }

    const handleResend = () => {
        // otpToken carries the email encoded — backend resend uses email
        // We need the email from the store or ask user; here we use a hidden field approach
        // Since resendOtp needs email, we store it during signup/login redirect
        const email = useAuthStore.getState().pendingEmail
        if (!email) return
        resendOtp({ email }, {
            onSuccess: (res) => {
                setOtpToken(res.data.otp_token)
                setDigits(Array(OTP_LENGTH).fill(""))
                inputRefs.current[0]?.focus()
            }
        })
    }

    const serverError =
        error && "response" in (error as any)
            ? (error as any).response?.data?.detail ?? "Invalid OTP. Please try again."
            : (error as any)?.message ?? null

    const isComplete = digits.every(Boolean)

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-10">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="h-20 w-auto mb-4">
                        <img
                            src="/anozon2.png"
                            alt="Anozon Logo"
                            className="h-full w-auto object-contain"
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Verify identity</p>
                        <h1 className="text-2xl font-semibold">Account Security</h1>
                    </div>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Check your email</CardTitle>
                        <CardDescription>
                            We sent a {OTP_LENGTH}-digit code to your email address.
                            Enter it below to verify your account.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
                            {serverError && (
                                <div className="w-full rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive text-center">
                                    {serverError}
                                </div>
                            )}

                            {/* OTP digit boxes */}
                            <div className="flex gap-2 sm:gap-3">
                                {digits.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { inputRefs.current[i] = el }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={OTP_LENGTH}
                                        value={digit}
                                        onChange={(e) => handleChange(e.target.value, i)}
                                        onKeyDown={(e) => handleKeyDown(e, i)}
                                        onFocus={(e) => e.target.select()}
                                        className={[
                                            "size-11 sm:size-13 rounded-lg border text-center text-lg font-semibold",
                                            "bg-background outline-none transition-all",
                                            "focus:border-ring focus:ring-2 focus:ring-ring/30",
                                            digit ? "border-ring" : "border-input",
                                            serverError ? "border-destructive focus:ring-destructive/30" : "",
                                        ].join(" ")}
                                        autoComplete={i === 0 ? "one-time-code" : "off"}
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isPending || !isComplete}
                            >
                                {isPending && <Loader2 className="size-4 animate-spin" />}
                                {isPending ? "Verifying…" : "Verify"}
                            </Button>

                            <p className="text-sm text-muted-foreground">
                                Didn&apos;t receive a code?{" "}
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="font-medium text-foreground underline-offset-4 hover:underline disabled:opacity-50"
                                >
                                    {isResending ? "Sending…" : "Resend"}
                                </button>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
