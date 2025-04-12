"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import {
    Pizza,
    Home,
    Store,
    MenuIcon,
    ClipboardList,
    Settings,
    Bell,
    Search,
    ChevronRight,
    TrendingUp,
    Plus,
    MoreHorizontal,
    Filter,
    Clock,
    DollarSign,
    CheckCircle,
    XCircle,
    LogOut,
    AlertCircle,
    Edit,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    getMyRestaurants,
    updateRestaurantAvailability,
    getPendingOrders,
    getCompletedOrders,
    updateOrderStatus,
    getPopularMenuItems,
} from "@/lib/restaurant-api"

export default function RestaurantDashboard() {
    const { user, loading, logout } = useAuth()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("dashboard")
    const [isLoading, setIsLoading] = useState(true)
    const [restaurants, setRestaurants] = useState([])
    const [selectedRestaurant, setSelectedRestaurant] = useState(null)
    const [pendingOrders, setPendingOrders] = useState([])
    const [completedOrders, setCompletedOrders] = useState([])
    const [timeFilter, setTimeFilter] = useState("today")
    const [popularItems, setPopularItems] = useState([])
    const [isLoadingPopularItems, setIsLoadingPopularItems] = useState(false)

    useEffect(() => {
        if (!loading && user?.role !== "restaurant_owner") {
            router.push("/")
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const data = await getMyRestaurants()
                setRestaurants(data)
                if (data.length > 0) {
                    setSelectedRestaurant(data[0])
                }
            } catch (error) {
                toast.error("Failed to fetch restaurants")
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        if (user && !loading) {
            fetchRestaurants()
        }
    }, [user, loading])

    useEffect(() => {
        const fetchOrders = async () => {
            if (!selectedRestaurant) return

            try {
                const [pending, completed] = await Promise.all([
                    getPendingOrders(selectedRestaurant._id),
                    getCompletedOrders(selectedRestaurant._id),
                ])
                setPendingOrders(pending)
                setCompletedOrders(completed)
            } catch (error) {
                toast.error("Failed to fetch orders")
                console.error(error)
            }
        }

        if (selectedRestaurant) {
            fetchOrders()
        }
    }, [selectedRestaurant])

    useEffect(() => {
        const fetchPopularItems = async () => {
            if (!selectedRestaurant) return

            setIsLoadingPopularItems(true)
            try {
                const period = timeFilter === "today" ? "day" : timeFilter === "week" ? "week" : "month"
                const items = await getPopularMenuItems(selectedRestaurant._id, period)
                setPopularItems(items)
            } catch (error) {
                console.error("Failed to fetch popular items:", error)
                // Don't show error toast as this is not critical
            } finally {
                setIsLoadingPopularItems(false)
            }
        }

        if (selectedRestaurant) {
            fetchPopularItems()
        }
    }, [selectedRestaurant, timeFilter])

    const handleToggleAvailability = async (restaurant) => {
        try {
            const updatedRestaurant = await updateRestaurantAvailability(restaurant._id, !restaurant.isAvailable)

            setRestaurants(restaurants.map((r) => (r._id === updatedRestaurant._id ? updatedRestaurant : r)))

            if (selectedRestaurant?._id === updatedRestaurant._id) {
                setSelectedRestaurant(updatedRestaurant)
            }

            toast.success(`Restaurant is now ${updatedRestaurant.isAvailable ? "available" : "unavailable"}`)
        } catch (error) {
            toast.error("Failed to update availability")
            console.error(error)
        }
    }

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus)

            // Refresh orders
            const [pending, completed] = await Promise.all([
                getPendingOrders(selectedRestaurant._id),
                getCompletedOrders(selectedRestaurant._id),
            ])
            setPendingOrders(pending)
            setCompletedOrders(completed)

            toast.success(`Order status updated to ${newStatus}`)
        } catch (error) {
            toast.error("Failed to update order status")
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

    if (loading) {
        return <div className="p-6">Loading...</div>
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    }

    // Calculate stats
    const getTotalOrders = () => {
        return pendingOrders.length + completedOrders.length
    }

    const getTotalRevenue = () => {
        return completedOrders
            .filter((order) => order.status === "delivered" && order.paymentStatus === "completed")
            .reduce((sum, order) => sum + order.totalAmount, 0)
            .toFixed(2)
    }

    const getCompletionRate = () => {
        const total = getTotalOrders()
        if (total === 0) return 0
        const delivered = completedOrders.filter((order) => order.status === "delivered").length
        return Math.round((delivered / total) * 100)
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
                            <Home className="mr-2 h-5 w-5" />
                            Dashboard
                        </Button>

                        <Button
                            variant={activeTab === "restaurants" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "restaurants" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("restaurants")
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
                            <MenuIcon className="mr-2 h-5 w-5" />
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
                            <ClipboardList className="mr-2 h-5 w-5" />
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

                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 mt-4"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-5 w-5" />
                            Logout
                        </Button>
                    </nav>
                </div>

                <div className="p-4 mt-auto">
                    <Card className="border-none shadow-md">
                        <CardContent className="p-4">
                            {selectedRestaurant ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <span className="text-sm font-medium">Restaurant Open</span>
                                        <Switch
                                            checked={selectedRestaurant.isAvailable}
                                            onCheckedChange={() => handleToggleAvailability(selectedRestaurant)}
                                            className="data-[state=checked]:bg-orange-500"
                                        />
                                    </div>
                                    <div
                                        className={`w-full p-2 rounded-md text-center text-sm font-medium ${selectedRestaurant.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {selectedRestaurant.isAvailable ? "Open for Orders" : "Closed"}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-sm text-gray-500">No restaurant selected</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {isLoading ? (
                                <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
                            ) : (
                                <motion.span
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    Restaurant Dashboard
                                </motion.span>
                            )}
                        </h1>
                        <p className="text-gray-500">Welcome back, {user?.name}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="Search..." className="pl-10 w-[300px] bg-white border-none" />
                        </div>

                        <Button size="icon" variant="outline" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                {pendingOrders.length}
                            </span>
                        </Button>

                        <Avatar>
                            <AvatarImage src="/placeholder.svg?height=40&width=40" />
                            <AvatarFallback className="bg-orange-200 text-orange-700">{user?.name?.charAt(0) || "R"}</AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Restaurant Selector */}
                {restaurants.length === 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Store className="h-5 w-5 text-orange-500" />
                                <span className="font-medium">Select Restaurant:</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-orange-500 border-orange-500"
                                onClick={() => router.push("/dashboard/restaurant/create")}
                            >
                                <Plus className="h-4 w-4 mr-1" /> Add New Restaurant
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                            {restaurants.map((restaurant) => (
                                <Card
                                    key={restaurant._id}
                                    className={`cursor-pointer transition-all hover:shadow-md ${selectedRestaurant?._id === restaurant._id ? "border-orange-500 bg-orange-50" : ""
                                        }`}
                                    onClick={() => setSelectedRestaurant(restaurant)}
                                >
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Store className="h-6 w-6 text-orange-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{restaurant.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Badge
                                                    className={
                                                        restaurant.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                    }
                                                >
                                                    {restaurant.isVerified ? "Verified" : "Pending Verification"}
                                                </Badge>
                                                <Badge
                                                    className={
                                                        restaurant.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                                    }
                                                >
                                                    {restaurant.isAvailable ? "Open" : "Closed"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Time Period Filter */}
                <div className="mb-6">
                    <Tabs defaultValue="today" value={timeFilter} onValueChange={setTimeFilter}>
                        <TabsList>
                            <TabsTrigger value="today">Today</TabsTrigger>
                            <TabsTrigger value="week">This Week</TabsTrigger>
                            <TabsTrigger value="month">This Month</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Main Content */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate={isLoading ? "hidden" : "show"}
                    className="flex flex-col lg:flex-row gap-6"
                >
                    {/* Left Column */}
                    <motion.div variants={item} className="flex-1 space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-500 text-sm">Total Orders</p>
                                            <h3 className="text-2xl font-bold mt-1">{getTotalOrders()}</h3>
                                            <p className="text-green-500 text-xs mt-1 flex items-center">
                                                <TrendingUp className="h-3 w-3 mr-1" /> +12% from last {timeFilter}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                                            <ClipboardList className="h-6 w-6 text-orange-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-500 text-sm">Total Revenue</p>
                                            <h3 className="text-2xl font-bold mt-1">${getTotalRevenue()}</h3>
                                            <p className="text-green-500 text-xs mt-1 flex items-center">
                                                <TrendingUp className="h-3 w-3 mr-1" /> +8% from last {timeFilter}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-green-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-500 text-sm">Completion Rate</p>
                                            <h3 className="text-2xl font-bold mt-1">{getCompletionRate()}%</h3>
                                            <p className="text-green-500 text-xs mt-1 flex items-center">
                                                <TrendingUp className="h-3 w-3 mr-1" /> +5% from last {timeFilter}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-6 w-6 text-blue-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pending Orders */}
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle>Pending Orders</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" className="h-8 gap-1">
                                            <Filter className="h-3 w-3" /> Filter
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                                            onClick={() => {
                                                setActiveTab("orders")
                                                router.push("/dashboard/restaurant/orders")
                                            }}
                                        >
                                            View All <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {pendingOrders.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-xs text-gray-500 border-b">
                                                    <th className="pb-2 font-medium">Order ID</th>
                                                    <th className="pb-2 font-medium">Customer</th>
                                                    <th className="pb-2 font-medium">Items</th>
                                                    <th className="pb-2 font-medium">Total</th>
                                                    <th className="pb-2 font-medium">Status</th>
                                                    <th className="pb-2 font-medium">Time</th>
                                                    <th className="pb-2 font-medium"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingOrders.map((order, index) => (
                                                    <motion.tr
                                                        key={order._id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="border-b border-gray-100 text-sm"
                                                    >
                                                        <td className="py-3 font-medium">{order._id.substring(0, 8)}</td>
                                                        <td className="py-3">{order.userId.substring(0, 8)}</td>
                                                        <td className="py-3">{order.items.length} items</td>
                                                        <td className="py-3">${order.totalAmount.toFixed(2)}</td>
                                                        <td className="py-3">
                                                            <Badge
                                                                className={
                                                                    order.status === "pending"
                                                                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                                                        : order.status === "accepted"
                                                                            ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                                                            : "bg-green-100 text-green-700 hover:bg-green-100"
                                                                }
                                                            >
                                                                {order.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</td>
                                                        <td className="py-3">
                                                            <div className="flex items-center gap-2">
                                                                {order.status === "pending" && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 text-green-600 border-green-600 hover:bg-green-50"
                                                                        onClick={() => handleUpdateOrderStatus(order._id, "accepted")}
                                                                    >
                                                                        Accept
                                                                    </Button>
                                                                )}
                                                                {order.status === "accepted" && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 text-blue-600 border-blue-600 hover:bg-blue-50"
                                                                        onClick={() => handleUpdateOrderStatus(order._id, "preparing")}
                                                                    >
                                                                        Preparing
                                                                    </Button>
                                                                )}
                                                                {order.status === "preparing" && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 text-green-600 border-green-600 hover:bg-green-50"
                                                                        onClick={() => handleUpdateOrderStatus(order._id, "ready")}
                                                                    >
                                                                        Ready
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => router.push(`/dashboard/restaurant/orders/${order._id}`)}
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <ClipboardList className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-700 mb-1">No Pending Orders</h3>
                                        <p className="text-sm text-gray-500">You don't have any pending orders at the moment.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Restaurant Performance */}
                        {selectedRestaurant && (
                            <Card className="border-none shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle>Restaurant Performance</CardTitle>
                                    <CardDescription>Overview of {selectedRestaurant.name}'s performance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <p className="text-sm">Order Completion Rate</p>
                                                <p className="text-sm font-medium">{getCompletionRate()}%</p>
                                            </div>
                                            <Progress value={getCompletionRate()} className="h-2" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <p className="text-sm">Customer Satisfaction</p>
                                                <p className="text-sm font-medium">92%</p>
                                            </div>
                                            <Progress value={92} className="h-2" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <p className="text-sm">On-time Delivery</p>
                                                <p className="text-sm font-medium">88%</p>
                                            </div>
                                            <Progress value={88} className="h-2" />
                                        </div>
                                        <div className="pt-4 border-t">
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-medium">Popular Items</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                                                    onClick={() => {
                                                        setActiveTab("menu")
                                                        router.push("/dashboard/restaurant/menu")
                                                    }}
                                                >
                                                    View Menu <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                                {isLoadingPopularItems ? (
                                                    <>
                                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                                                            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                                                            <div className="flex-1">
                                                                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                                                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                                                            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                                                            <div className="flex-1">
                                                                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                                                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : popularItems.length > 0 ? (
                                                    popularItems.slice(0, 2).map((item) => (
                                                        <div key={item.menuItemId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                            <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                                                                <Pizza className="h-5 w-5 text-orange-500" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{item.name}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {item.count} orders this {timeFilter === "today" ? "day" : timeFilter}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-2 text-center py-4">
                                                        <p className="text-sm text-gray-500">No order data available for this period</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>

                    {/* Right Column */}
                    <motion.div variants={item} className="w-[350px] space-y-6">
                        {/* Quick Actions */}
                        <Card className="border-none shadow-md bg-orange-500 text-white">
                            <CardHeader className="pb-2">
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription className="text-orange-100">Manage your restaurant</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    className="w-full bg-white text-orange-500 hover:bg-orange-50 justify-start"
                                    onClick={() => router.push("/dashboard/restaurant/menu/create")}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Menu Item
                                </Button>
                                <Button
                                    className="w-full bg-white text-orange-500 hover:bg-orange-50 justify-start"
                                    onClick={() => {
                                        setActiveTab("orders")
                                        router.push("/dashboard/restaurant/orders")
                                    }}
                                >
                                    <ClipboardList className="mr-2 h-4 w-4" /> View All Orders
                                </Button>
                                <Button
                                    className="w-full bg-white text-orange-500 hover:bg-orange-50 justify-start"
                                    onClick={() =>
                                        selectedRestaurant && router.push(`/dashboard/restaurant/edit/${selectedRestaurant._id}`)
                                    }
                                    disabled={!selectedRestaurant}
                                >
                                    <Edit className="mr-2 h-4 w-4" /> Edit Restaurant
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {completedOrders.slice(0, 5).map((order, index) => (
                                        <div key={order._id} className="flex items-start gap-3">
                                            <div
                                                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${order.status === "delivered"
                                                    ? "bg-green-100"
                                                    : order.status === "cancelled"
                                                        ? "bg-red-100"
                                                        : "bg-blue-100"
                                                    }`}
                                            >
                                                {order.status === "delivered" ? (
                                                    <CheckCircle className={`h-4 w-4 text-green-500`} />
                                                ) : order.status === "cancelled" ? (
                                                    <XCircle className={`h-4 w-4 text-red-500`} />
                                                ) : (
                                                    <Clock className={`h-4 w-4 text-blue-500`} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">
                                                    <span className="font-medium">Order {order._id.substring(0, 8)}</span>{" "}
                                                    {order.status === "delivered"
                                                        ? "was delivered"
                                                        : order.status === "cancelled"
                                                            ? "was cancelled"
                                                            : `is ${order.status}`}
                                                </p>
                                                <p className="text-xs text-gray-500">{new Date(order.updatedAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {completedOrders.length === 0 && (
                                        <div className="text-center py-4">
                                            <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4">
                                <Button className="w-full" variant="outline" onClick={() => setActiveTab("orders")}>
                                    View All Activity
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Restaurant Status */}
                        {selectedRestaurant && (
                            <Card className="border-none shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle>Restaurant Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{selectedRestaurant.name}</p>
                                            <p className="text-xs text-gray-500">{selectedRestaurant.address}</p>
                                        </div>
                                        <Badge
                                            className={
                                                selectedRestaurant.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                            }
                                        >
                                            {selectedRestaurant.isVerified ? "Verified" : "Pending Verification"}
                                        </Badge>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-sm font-medium">Restaurant Open</p>
                                            <Switch
                                                checked={selectedRestaurant.isAvailable}
                                                onCheckedChange={() => handleToggleAvailability(selectedRestaurant)}
                                                className="data-[state=checked]:bg-orange-500"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {selectedRestaurant.isAvailable
                                                ? "Your restaurant is currently open and accepting orders."
                                                : "Your restaurant is currently closed and not accepting orders."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </div >
    )
}

