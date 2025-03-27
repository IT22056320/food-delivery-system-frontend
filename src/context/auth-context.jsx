"use client"

import { createContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { logoutUser } from "@/lib/api"
import { Toaster } from "@/components/ui/sonner"

export const AuthContext = createContext({
    user: null,
    setUser: () => { },
    login: () => { },
    logout: () => { },
    loading: true,
})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { toast } = Toaster()

    useEffect(() => {
        // Check if user is logged in
        const checkAuth = async () => {
            try {
                const response = await fetch("/api/auth/me")
                if (response.ok) {
                    const data = await response.json()
                    setUser(data.user)
                }
            } catch (error) {
                // User is not logged in, do nothing
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    const login = (userData) => {
        setUser(userData)
    }

    const logout = async () => {
        try {
            await logoutUser()
            setUser(null)
            router.push("/")
            toast({
                title: "Logged out",
                description: "You have been logged out successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Logout failed",
                description: "Failed to log out. Please try again.",
            })
        }
    }

    return <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>{children}</AuthContext.Provider>
}

