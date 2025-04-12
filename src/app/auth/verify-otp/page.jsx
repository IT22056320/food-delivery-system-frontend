"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { verifyOtp } from "@/lib/api"

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState(null)
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const id = searchParams.get("userId")
        if (!id) {
            toast.error("User ID is missing. Please try registering again.")
            router.push("/auth/register")
            return
        }
        setUserId(id)
    }, [searchParams, router])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!otp.trim()) {
            toast.error("Please enter the OTP sent to your email")
            return
        }

        if (!userId) {
            toast.error("User ID is missing. Please try registering again.")
            router.push("/auth/register")
            return
        }

        setLoading(true)
        try {
            await verifyOtp({ userId, otp })
            toast.success("Your account has been verified. You can now log in.")
            router.push("/auth/login")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Invalid or expired OTP")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container flex items-center justify-center min-h-screen py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
                    <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">OTP Code</Label>
                            <Input
                                id="otp"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                disabled={loading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify Email"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}