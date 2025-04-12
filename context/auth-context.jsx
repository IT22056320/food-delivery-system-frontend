"use client"

import { createContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { logoutUser } from "@/lib/api"

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch logged-in user on first load
  useEffect(() => {
    fetch("http://localhost:5000/api/auth/me", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user)
      })
      .finally(() => setLoading(false))
  }, [])

  // Role-based convenience flags
  const isAdmin = user?.role === "admin"
  const isRestaurantOwner = user?.role === "restaurant_owner"
  const isDeliveryPerson = user?.role === "delivery_person"
  const isUser = user?.role === "user"

  // Manual login method
  const login = (userData) => {
    setUser(userData)
  }

  // Logout handler
  const logout = async () => {
    try {
      await logoutUser()
      setUser(null)
      toast.success("Logged out successfully")
      router.push("/")
    } catch {
      toast.error("Logout failed")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        isAdmin,
        isRestaurantOwner,
        isDeliveryPerson,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
