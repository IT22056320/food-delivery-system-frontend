"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Pizza, KeyRound } from "lucide-react"

export default function VerifyOtpPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })
      if (!res.ok) throw new Error("Invalid or expired OTP")
      toast.success("OTP verified! You can now login.")
      router.push("/login")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="absolute top-0 left-0 w-full h-64 bg-orange-500 rounded-b-[30%] -z-10 opacity-90" />

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-full shadow-md">
            <Pizza className="h-10 w-10 text-orange-500" />
          </div>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Verify OTP</CardTitle>
            <CardDescription className="text-center">Check your email for the OTP code</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="pl-10 py-6 bg-gray-50 border-gray-100"
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
              </div>

              <Button
                type="submit"
                className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-all duration-200"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="text-center text-sm text-gray-500">
            Didn't get the code? Check spam or try resending.
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
