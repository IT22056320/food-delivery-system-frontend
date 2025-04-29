"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Store, Users, ShoppingBag, BarChart3, DollarSign, Settings, Bell, LogOut } from "lucide-react"

export function AdminSidebar({ activePage = "dashboard" }) {
    const router = useRouter()

    return (
        <div className="w-56 bg-white shadow-md flex flex-col">
            <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                    <Store className="h-8 w-8 text-blue-500" />
                    <span className="font-bold text-xl">FoodHub</span>
                </div>
            </div>

            <div className="flex flex-col p-4 flex-1">
                <p className="text-gray-500 text-sm mb-4">Admin Dashboard</p>

                <nav className="space-y-1">
                    <Button
                        variant={activePage === "dashboard" ? "default" : "ghost"}
                        className={`w-full justify-start ${activePage === "dashboard" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                        onClick={() => router.push("/dashboard/admin")}
                    >
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Overview
                    </Button>

                    <Button
                        variant={activePage === "restaurants" ? "default" : "ghost"}
                        className={`w-full justify-start ${activePage === "restaurants" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                        onClick={() => router.push("/dashboard/admin/restaurants")}
                    >
                        <Store className="mr-2 h-5 w-5" />
                        Restaurants
                    </Button>

                    <Button
                        variant={activePage === "users" ? "default" : "ghost"}
                        className={`w-full justify-start ${activePage === "users" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                        onClick={() => router.push("/dashboard/admin/users")}
                    >
                        <Users className="mr-2 h-5 w-5" />
                        Users
                    </Button>

                    <Button
                        variant={activePage === "orders" ? "default" : "ghost"}
                        className={`w-full justify-start ${activePage === "orders" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                        onClick={() => router.push("/dashboard/admin/orders")}
                    >
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Orders
                    </Button>

                    <Button
                        variant={activePage === "transactions" ? "default" : "ghost"}
                        className={`w-full justify-start ${activePage === "transactions" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                        onClick={() => router.push("/dashboard/admin/transactions")}
                    >
                        <DollarSign className="mr-2 h-5 w-5" />
                        Transactions
                    </Button>

                    <Button
                        variant={activePage === "settings" ? "default" : "ghost"}
                        className={`w-full justify-start ${activePage === "settings" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                        onClick={() => router.push("/dashboard/admin/settings")}
                    >
                        <Settings className="mr-2 h-5 w-5" />
                        Settings
                    </Button>
                </nav>

                <div className="mt-auto pt-4 border-t">
                    <Button variant="outline" className="w-full justify-start mb-2">
                        <Bell className="mr-2 h-5 w-5" />
                        Notifications
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-500 border-red-200">
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    )
}
