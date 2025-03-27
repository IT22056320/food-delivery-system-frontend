"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getUserById, updateUser } from "@/lib/api"

export default function DashboardPage() {
    const { user, setUser } = useAuth()
    const [loading, setLoading] = useState(false)
    const [userData, setUserData] = useState({
        name: "",
        email: "",
    })
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (!user) {
            router.push("/auth/login")
            return
        }

        const fetchUserData = async () => {
            try {
                const data = await getUserById(user._id)
                setUserData({
                    name: data.name,
                    email: data.email,
                })
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch user data",
                })
            }
        }

        fetchUserData()
    }, [user, router, toast])

    const handleChange = (e) => {
        const { name, value } = e.target
        setUserData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!user) return

        setLoading(true)
        try {
            const updatedUser = await updateUser(user._id, {
                name: userData.name,
            })

            setUser({
                ...user,
                name: updatedUser.name,
            })

            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Update failed",
                description: error instanceof Error ? error.message : "Failed to update profile",
            })
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return null
    }

    return (
        <div className="container py-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your account and view your information</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your account profile information</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" value={userData.name} onChange={handleChange} disabled={loading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" value={userData.email} disabled={true} />
                                <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save changes"
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}

