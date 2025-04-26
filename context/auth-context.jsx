"use client"

import { createContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { logoutUser } from "@/lib/auth-api"
import { fetchUser } from "@/lib/auth-api"

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch logged-in user on first load
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUser()
        setUser(userData)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
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
