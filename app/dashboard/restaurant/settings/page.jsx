"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Pizza, Store, Clock, Settings, User, Bell, LogOut, Shield, CreditCard, Plus } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
    const { user, loading, logout } = useAuth()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("settings")
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false)

    // Settings state
    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
    })

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        orderUpdates: true,
        marketingEmails: false,
        appNotifications: true,
    })

    useEffect(() => {
        if (!loading && user?.role !== "restaurant_owner") {
            router.push("/")
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || "",
                email: user.email || "",
            })
        }
    }, [user])

    const handleProfileChange = (e) => {
        const { name, value } = e.target
        setProfileForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleNotificationChange = (setting, value) => {
        setNotificationSettings((prev) => ({ ...prev, [setting]: value }))
    }

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            // This would be an API call to update the user profile
            // await updateUserProfile(profileForm)

            toast.success("Profile updated successfully")
        } catch (error) {
            toast.error("Failed to update profile")
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveNotifications = async () => {
        setIsSaving(true)

        try {
            // This would be an API call to update notification settings
            // await updateNotificationSettings(notificationSettings)

            toast.success("Notification settings updated")
        } catch (error) {
            toast.error("Failed to update notification settings")
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        try {
            // This would be an API call to delete the user account
            // await deleteUserAccount()

            toast.success("Account deleted successfully")
            logout()
            router.push("/")
        } catch (error) {
            toast.error("Failed to delete account")
            console.error(error)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5000/api/auth/logout", {
                method: "POST",
                credentials: "include",
            })
            logout()
            router.push("/login")
            toast.success("Logged out successfully")
        } catch (error) {
            console.error("Logout failed:", error)
            toast.error("Logout failed. Please try again.")
        }
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            {/* Sidebar */}
            <div className="w-56 bg-white shadow-md flex flex-col">
                <div className="p-4 border-b">
                    <div className="flex items-center gap-2">
                        <Pizza className="h-8 w-8 text-orange-500" />
                        <span className="font-bold text-xl">FoodHub</span>
                    </div>
                </div>

                <div className="flex flex-col p-4 flex-1">
                    <p className="text-gray-500 text-sm mb-4">Restaurant Dashboard</p>

                    <nav className="space-y-1">
                        <Button
                            variant={activeTab === "dashboard" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "dashboard" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("dashboard")
                                router.push("/dashboard/restaurant")
                            }}
                        >
                            <Store className="mr-2 h-5 w-5" />
                            Dashboard
                        </Button>

                        <Button
                            variant={activeTab === "my-restaurants" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "my-restaurants" ? "bg-orange-500 hover:bg-orange-600" : ""
                                }`}
                            onClick={() => {
                                setActiveTab("my-restaurants")
                                router.push("/dashboard/restaurant/my-restaurants")
                            }}
                        >
                            <Store className="mr-2 h-5 w-5" />
                            My Restaurants
                        </Button>

                        <Button
                            variant={activeTab === "menu" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "menu" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("menu")
                                router.push("/dashboard/restaurant/menu")
                            }}
                        >
                            <Pizza className="mr-2 h-5 w-5" />
                            Menu Items
                        </Button>

                        <Button
                            variant={activeTab === "orders" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "orders" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("orders")
                                router.push("/dashboard/restaurant/orders")
                            }}
                        >
                            <Clock className="mr-2 h-5 w-5" />
                            Orders
                        </Button>

                        <Button
                            variant={activeTab === "settings" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "settings" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("settings")
                                router.push("/dashboard/restaurant/settings")
                            }}
                        >
                            <Settings className="mr-2 h-5 w-5" />
                            Settings
                        </Button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Account Settings</h1>
                            <p className="text-gray-500">Manage your account preferences and settings</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Sidebar */}
                        <div className="md:col-span-1 space-y-4">
                            <Card className="border-none shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                                            <User className="h-10 w-10 text-orange-500" />
                                        </div>
                                        <h3 className="font-bold text-lg">{user?.name}</h3>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                        <Badge className="mt-2 bg-orange-100 text-orange-700">Restaurant Owner</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md">
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start rounded-none p-4 h-auto"
                                            onClick={() => document.getElementById("profile-section").scrollIntoView({ behavior: "smooth" })}
                                        >
                                            <User className="mr-2 h-5 w-5" />
                                            <span>Profile Information</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start rounded-none p-4 h-auto"
                                            onClick={() => document.getElementById("security-section").scrollIntoView({ behavior: "smooth" })}
                                        >
                                            <Shield className="mr-2 h-5 w-5" />
                                            <span>Security</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start rounded-none p-4 h-auto"
                                            onClick={() =>
                                                document.getElementById("notifications-section").scrollIntoView({ behavior: "smooth" })
                                            }
                                        >
                                            <Bell className="mr-2 h-5 w-5" />
                                            <span>Notifications</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start rounded-none p-4 h-auto"
                                            onClick={() => document.getElementById("payment-section").scrollIntoView({ behavior: "smooth" })}
                                        >
                                            <CreditCard className="mr-2 h-5 w-5" />
                                            <span>Payment Methods</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start rounded-none p-4 h-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="mr-2 h-5 w-5" />
                                            <span>Logout</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Settings */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Profile Section */}
                            <Card className="border-none shadow-md" id="profile-section">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Profile Information
                                    </CardTitle>
                                    <CardDescription>Update your personal information</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSaveProfile} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={profileForm.name}
                                                onChange={handleProfileChange}
                                                placeholder="Your full name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={profileForm.email}
                                                onChange={handleProfileChange}
                                                placeholder="Your email address"
                                            />
                                        </div>
                                        <Button type="submit" disabled={isSaving}>
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Security Section */}
                            <Card className="border-none shadow-md" id="security-section">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Security
                                    </CardTitle>
                                    <CardDescription>Manage your account security</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input id="current-password" type="password" placeholder="Enter your current password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input id="new-password" type="password" placeholder="Enter your new password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input id="confirm-password" type="password" placeholder="Confirm your new password" />
                                    </div>
                                    <Button>Change Password</Button>

                                    <Separator className="my-6" />

                                    <div>
                                        <h3 className="text-lg font-medium mb-4">Danger Zone</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Once you delete your account, there is no going back. Please be certain.
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="text-red-500 border-red-500 hover:bg-red-50"
                                            onClick={() => setDeleteAccountDialogOpen(true)}
                                        >
                                            Delete Account
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notifications Section */}
                            <Card className="border-none shadow-md" id="notifications-section">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        Notifications
                                    </CardTitle>
                                    <CardDescription>Manage your notification preferences</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Email Notifications</h4>
                                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.emailNotifications}
                                            onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                                            className="data-[state=checked]:bg-orange-500"
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Order Updates</h4>
                                            <p className="text-sm text-gray-500">Receive notifications about order status changes</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.orderUpdates}
                                            onCheckedChange={(checked) => handleNotificationChange("orderUpdates", checked)}
                                            className="data-[state=checked]:bg-orange-500"
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Marketing Emails</h4>
                                            <p className="text-sm text-gray-500">Receive promotional emails and offers</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.marketingEmails}
                                            onCheckedChange={(checked) => handleNotificationChange("marketingEmails", checked)}
                                            className="data-[state=checked]:bg-orange-500"
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">App Notifications</h4>
                                            <p className="text-sm text-gray-500">Receive push notifications in the app</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.appNotifications}
                                            onCheckedChange={(checked) => handleNotificationChange("appNotifications", checked)}
                                            className="data-[state=checked]:bg-orange-500"
                                        />
                                    </div>
                                    <Button onClick={handleSaveNotifications} disabled={isSaving} className="mt-4">
                                        {isSaving ? "Saving..." : "Save Preferences"}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Payment Methods Section */}
                            <Card className="border-none shadow-md" id="payment-section">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Methods
                                    </CardTitle>
                                    <CardDescription>Manage your payment methods</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <CreditCard className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-700 mb-1">No Payment Methods</h3>
                                        <p className="text-sm text-gray-500 mb-4">You haven't added any payment methods yet.</p>
                                        <Button className="bg-orange-500 hover:bg-orange-600">
                                            <Plus className="h-4 w-4 mr-2" /> Add Payment Method
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Account Confirmation Dialog */}
            <AlertDialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data from our
                            servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
