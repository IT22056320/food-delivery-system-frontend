"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email.trim()) {
            toast.error("Please enter your email address")
            return
        }

        setLoading(true)
        try {
            // This would connect to your backend reset password endpoint
            // For now, we'll just simulate a successful request
            await new Promise((resolve) => setTimeout(resolve, 1500))

            setSubmitted(true)
            toast.success("If an account exists with this email, you will receive password reset instructions.")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send reset email")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container flex items-center justify-center min-h-screen py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Forgot password</CardTitle>
                    <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
                </CardHeader>
                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending reset link...
                                    </>
                                ) : (
                                    "Send reset link"
                                )}
                            </Button>
                            <div className="text-center text-sm">
                                <Link href="/auth/login" className="underline">
                                    Back to login
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                ) : (
                    <CardContent className="space-y-4">
                        <div className="bg-primary/10 p-4 rounded-md text-center">
                            <p className="text-sm">
                                If an account exists with the email <strong>{email}</strong>, you will receive password reset
                                instructions shortly.
                            </p>
                        </div>
                        <Button asChild className="w-full">
                            <Link href="/auth/login">Return to login</Link>
                        </Button>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}