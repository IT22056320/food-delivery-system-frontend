"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getUnverifiedRestaurants, verifyRestaurant } from "@/lib/restaurant-api"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Users, ShoppingBag, Search, CheckCircle, MapPin, Phone, Mail, BarChart3, Filter } from "lucide-react"

export default function AdminRestaurantsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(true)
    const [restaurants, setRestaurants] = useState([])
    const [filteredRestaurants, setFilteredRestaurants] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState(searchParams.get("filter") || "all")

    useEffect(() => {
        if (!loading && (!user || user.role !== "admin")) {
            router.push("/")
            toast.error("You don't have permission to access this page")
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setIsLoading(true)
                const data = await getUnverifiedRestaurants()
                setRestaurants(data)
                setFilteredRestaurants(data)
            } catch (error) {
                toast.error("Failed to fetch restaurants")
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        if (user && !loading && user.role === "admin") {
            fetchRestaurants()
        }
    }, [user, loading])

    useEffect(() => {
        // Apply filters
        let filtered = [...restaurants]

        if (searchQuery) {
            filtered = filtered.filter(
                (restaurant) =>
                    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    restaurant.email.toLowerCase().includes(searchQuery.toLowerCase()),
            )
        }

        if (filterStatus !== "all") {
            filtered = filtered.filter((restaurant) =>
                filterStatus === "verified" ? restaurant.isVerified : !restaurant.isVerified,
            )
        }

        setFilteredRestaurants(filtered)
    }, [searchQuery, filterStatus, restaurants])

    const handleVerifyRestaurant = async (id) => {
        try {
            await verifyRestaurant(id)

            // Update local state
            setRestaurants(
                restaurants.map((restaurant) => (restaurant._id === id ? { ...restaurant, isVerified: true } : restaurant)),
            )

            toast.success("Restaurant verified successfully")
        } catch (error) {
            toast.error("Failed to verify restaurant")
            console.error(error)
        }
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
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Restaurant Management</h1>
                            <p className="text-gray-500">Approve and manage restaurant listings</p>
                        </div>
                    </div>

                    <Card className="border-none shadow-md mb-6">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle>Restaurants</CardTitle>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search restaurants..."
                                        className="pl-10 w-[250px]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue={filterStatus} value={filterStatus} onValueChange={setFilterStatus} className="mb-6">
                                <TabsList>
                                    <TabsTrigger value="all">All Restaurants</TabsTrigger>
                                    <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                                    <TabsTrigger value="verified">Verified</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                                    <p className="mt-4 text-gray-500">Loading restaurants...</p>
                                </div>
                            ) : filteredRestaurants.length === 0 ? (
                                <div className="text-center py-12">
                                    <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-1">No Restaurants Found</h3>
                                    <p className="text-sm text-gray-500">
                                        {searchQuery
                                            ? "Try adjusting your search criteria"
                                            : filterStatus === "pending"
                                                ? "No restaurants pending approval"
                                                : "No restaurants found"}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredRestaurants.map((restaurant) => (
                                        <Card key={restaurant._id} className="overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-lg">{restaurant.name}</h3>
                                                        <Badge
                                                            className={
                                                                restaurant.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                            }
                                                        >
                                                            {restaurant.isVerified ? "Verified" : "Pending Verification"}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                                            <span className="text-gray-600">{restaurant.address}</span>
                                                        </div>
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                                                            <span className="text-gray-600">{restaurant.phone}</span>
                                                        </div>
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                                                            <span className="text-gray-600">{restaurant.email}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {restaurant.cuisine &&
                                                            restaurant.cuisine.map((cuisine, index) => (
                                                                <Badge key={index} variant="outline">
                                                                    {cuisine}
                                                                </Badge>
                                                            ))}
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="text-sm text-gray-500">
                                                            Registered: {new Date(restaurant.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {!restaurant.isVerified && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 text-green-600 border-green-600 hover:bg-green-50"
                                                                    onClick={() => handleVerifyRestaurant(restaurant._id)}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8"
                                                                onClick={() => router.push(`/dashboard/admin/restaurants/${restaurant._id}`)}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
