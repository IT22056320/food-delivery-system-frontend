"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getRestaurantById, verifyRestaurant, getRestaurantStats } from "@/lib/restaurant-api"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
    Store,
    Users,
    ShoppingBag,
    ArrowLeft,
    CheckCircle,
    XCircle,
    MapPin,
    Phone,
    Mail,
    Calendar,
    BarChart3,
    DollarSign,
} from "lucide-react"

export default function AdminRestaurantDetailPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const { id } = params

    const [isLoading, setIsLoading] = useState(true)
    const [restaurant, setRestaurant] = useState(null)
    const [stats, setStats] = useState(null)

    useEffect(() => {
        if (!loading && (!user || user.role !== "admin")) {
            router.push("/")
            toast.error("You don't have permission to access this page")
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                setIsLoading(true)
                const [restaurantData, statsData] = await Promise.all([getRestaurantById(id), getRestaurantStats(id)])

                setRestaurant(restaurantData)
                setStats(statsData)
            } catch (error) {
                toast.error("Failed to fetch restaurant data")
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        if (user && !loading && user.role === "admin" && id) {
            fetchRestaurantData()
        }
    }, [user, loading, id])

    const handleVerifyRestaurant = async () => {
        try {
            await verifyRestaurant(id)
            setRestaurant({ ...restaurant, isVerified: true })
            toast.success("Restaurant verified successfully")
        } catch (error) {
            toast.error("Failed to verify restaurant")
            console.error(error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="ml-2">Loading restaurant details...</p>
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">Restaurant Not Found</h3>
                    <p className="text-sm text-gray-500 mb-4">The restaurant you're looking for doesn't exist</p>
                    <Button onClick={() => router.push("/dashboard/admin/restaurants")}>Back to Restaurants</Button>
                </div>
            </div>
        )
    }

    // Placeholder stats if real stats are not available
    const displayStats = stats || {
        totalOrders: 125,
        completedOrders: 110,
        cancelledOrders: 8,
        totalRevenue: 2450,
        completionRate: 88,
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Sidebar */}
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
                        <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/dashboard/admin")}>
                            <BarChart3 className="mr-2 h-5 w-5" />
                            Overview
                        </Button>

                        <Button
                            variant="default"
                            className="w-full justify-start bg-blue-500 hover:bg-blue-600"
                            onClick={() => router.push("/dashboard/admin/restaurants")}
                        >
                            <Store className="mr-2 h-5 w-5" />
                            Restaurants
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => router.push("/dashboard/admin/users")}
                        >
                            <Users className="mr-2 h-5 w-5" />
                            Users
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => router.push("/dashboard/admin/orders")}
                        >
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Orders
                        </Button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center mb-6">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 mr-4"
                            onClick={() => router.push("/dashboard/admin/restaurants")}
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Restaurants
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                            <p className="text-gray-500">Restaurant Details</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Restaurant Details */}
                            <Card className="border-none shadow-md">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>Restaurant Information</CardTitle>
                                            <CardDescription>Basic details and contact information</CardDescription>
                                        </div>
                                        <Badge
                                            className={
                                                restaurant.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                            }
                                        >
                                            {restaurant.isVerified ? "Verified" : "Pending Verification"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium">Address</p>
                                                        <p className="text-gray-600">{restaurant.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium">Phone</p>
                                                        <p className="text-gray-600">{restaurant.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium">Email</p>
                                                        <p className="text-gray-600">{restaurant.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium">Registered On</p>
                                                        <p className="text-gray-600">{new Date(restaurant.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h3 className="font-medium mb-2">Description</h3>
                                            <p className="text-gray-600">{restaurant.description}</p>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h3 className="font-medium mb-2">Cuisine Types</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {restaurant.cuisine &&
                                                    restaurant.cuisine.map((cuisine, index) => (
                                                        <Badge key={index} variant="outline">
                                                            {cuisine}
                                                        </Badge>
                                                    ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h3 className="font-medium mb-2">Opening Hours</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {restaurant.openingHours &&
                                                    restaurant.openingHours.map((hours, index) => (
                                                        <div key={index} className="flex items-center justify-between">
                                                            <span className="font-medium">{hours.day}</span>
                                                            <span className="text-gray-600">
                                                                {hours.open} - {hours.close}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>

                                        {!restaurant.isVerified && (
                                            <div className="pt-4">
                                                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleVerifyRestaurant}>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve Restaurant
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Restaurant Performance */}
                            <Card className="border-none shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle>Performance Metrics</CardTitle>
                                    <CardDescription>Restaurant statistics and performance data</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <ShoppingBag className="h-5 w-5 text-blue-500" />
                                                <span className="font-medium">Total Orders</span>
                                            </div>
                                            <p className="text-2xl font-bold">{displayStats.totalOrders}</p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <DollarSign className="h-5 w-5 text-green-500" />
                                                <span className="font-medium">Total Revenue</span>
                                            </div>
                                            <p className="text-2xl font-bold">${displayStats.totalRevenue}</p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                <span className="font-medium">Completion Rate</span>
                                            </div>
                                            <p className="text-2xl font-bold">{displayStats.completionRate}%</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <p className="text-sm">Completed Orders</p>
                                                <p className="text-sm font-medium">
                                                    {displayStats.completedOrders} (
                                                    {Math.round((displayStats.completedOrders / displayStats.totalOrders) * 100)}%)
                                                </p>
                                            </div>
                                            <Progress
                                                value={Math.round((displayStats.completedOrders / displayStats.totalOrders) * 100)}
                                                className="h-2"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <p className="text-sm">Cancelled Orders</p>
                                                <p className="text-sm font-medium">
                                                    {displayStats.cancelledOrders} (
                                                    {Math.round((displayStats.cancelledOrders / displayStats.totalOrders) * 100)}%)
                                                </p>
                                            </div>
                                            <Progress
                                                value={Math.round((displayStats.cancelledOrders / displayStats.totalOrders) * 100)}
                                                className="h-2"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Actions */}
                            <Card className="border-none shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle>Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button className="w-full bg-blue-500 hover:bg-blue-600 justify-start">
                                        <BarChart3 className="mr-2 h-4 w-4" /> View Analytics
                                    </Button>
                                    <Button className="w-full bg-blue-500 hover:bg-blue-600 justify-start">
                                        <ShoppingBag className="mr-2 h-4 w-4" /> View Orders
                                    </Button>
                                    {!restaurant.isVerified && (
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700 justify-start"
                                            onClick={handleVerifyRestaurant}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" /> Approve Restaurant
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-red-500 border-red-500 hover:bg-red-50"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" /> Suspend Restaurant
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Owner Information */}
                            <Card className="border-none shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle>Owner Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                                            <Users className="h-6 w-6 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Owner ID</p>
                                            <p className="text-sm text-gray-500">{restaurant.ownerId}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.push(`/dashboard/admin/users/${restaurant.ownerId}`)}
                                    >
                                        View Owner Profile
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Restaurant Status */}
                            <Card className="border-none shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle>Restaurant Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Verification Status</span>
                                            <Badge
                                                className={
                                                    restaurant.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                }
                                            >
                                                {restaurant.isVerified ? "Verified" : "Pending"}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Availability</span>
                                            <Badge
                                                className={restaurant.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                                            >
                                                {restaurant.isAvailable ? "Open" : "Closed"}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Rating</span>
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">{restaurant.rating || "N/A"}</span>
                                                {restaurant.rating && (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        className="w-4 h-4 text-yellow-500"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
