"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "@/lib/auth-api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pizza, User, Mail, ArrowRight, Store, Truck } from "lucide-react"
import { motion } from "framer-motion"

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" })
  const [loading, setLoading] = useState(false)
  const [registrationType, setRegistrationType] = useState("customer") // "customer" or "business"
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await registerUser(form)
      toast.success("Registered! Check your email for OTP")
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrationTypeChange = (type) => {
    setRegistrationType(type)
    // Set default role based on registration type
    if (type === "customer") {
      setForm({ ...form, role: "user" })
    } else {
      setForm({ ...form, role: "restaurant_owner" }) // Default business role
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

        <Card className="border-none shadow-xl overflow-hidden">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">Join us to start your food journey</CardDescription>
          </CardHeader>

          {/* Registration Type Selector */}
          <div className="grid grid-cols-2 gap-0 mb-6">
            <button
              type="button"
              onClick={() => handleRegistrationTypeChange("customer")}
              className={`py-3 relative transition-all duration-200 ${
                registrationType === "customer"
                  ? "bg-orange-500 text-white font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <User className="h-5 w-5 mb-1" />
                <span className="text-sm">Customer</span>
              </div>
              {registrationType === "customer" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleRegistrationTypeChange("business")}
              className={`py-3 relative transition-all duration-200 ${
                registrationType === "business"
                  ? "bg-orange-500 text-white font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <Store className="h-5 w-5 mb-1" />
                <span className="text-sm">Business</span>
              </div>
              {registrationType === "business" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          </div>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="pl-10 py-6 bg-gray-50 border-gray-100"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="pl-10 py-6 bg-gray-50 border-gray-100"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="pl-10 py-6 bg-gray-50 border-gray-100"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-lock"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Conditionally render role selection for business users */}
              {registrationType === "business" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700">Business Type</label>
                  <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                    <SelectTrigger className="w-full py-6 bg-gray-50 border-gray-100">
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant_owner" className="flex items-center">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-orange-500" />
                          <span>Restaurant Owner</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="delivery_person" className="flex items-center">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-orange-500" />
                          <span>Delivery Partner</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {form.role === "restaurant_owner"
                      ? "Register your restaurant and start receiving orders"
                      : "Join our delivery team and earn money on your schedule"}
                  </p>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500">
              Already have an account?{" "}
              <a href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
                Sign in
              </a>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-600"
                >
                  <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
                  <line x1="6" x2="18" y1="17" y2="17"></line>
                </svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-600"
                >
                  <path d="M15 11h.01"></path>
                  <path d="M11 15h.01"></path>
                  <path d="M16 16h.01"></path>
                  <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16"></path>
                  <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4"></path>
                </svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"></path>
                  <path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"></path>
                  <path d="M15 2v5h5"></path>
                </svg>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

