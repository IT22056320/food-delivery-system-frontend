"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import {
    Pizza,
    Home,
    ShoppingBag,
    Heart,
    User,
    Search,
    Star,
    Clock,
    MapPin,
    Filter,
    ChevronDown,
    LogOut,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RestaurantsPage() {
    const { user, loading, logout } = useAuth()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("restaurants")
    const [isLoading, setIsLoading] = useState(true)
    const [restaurants, setRestaurants] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [cuisineFilter, setCuisineFilter] = useState("")
    const [sortBy, setSortBy] = useState("rating")

    // Fetch all verified and available restaurants
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/restaurants", {
                    credentials: "include",
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch restaurants")
                }

                const data = await response.json()
                // Filter only verified and available restaurants
                const filteredData = data.filter((restaurant) => restaurant.isVerified && restaurant.isAvailable)
                setRestaurants(filteredData)
            } catch (error) {
                console.error("Error fetching restaurants:", error)
                toast.error("Failed to load restaurants")
            } finally {
                setIsLoading(false)
            }
        }

        fetchRestaurants()
    }, [])

    // Filter and sort restaurants
    const filteredRestaurants = restaurants
        .filter((restaurant) => {
            // Search filter
            const matchesSearch =
                restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                restaurant.description.toLowerCase().includes(searchQuery.toLowerCase())

            // Cuisine filter
            const matchesCuisine = !cuisineFilter || (restaurant.cuisine && restaurant.cuisine.includes(cuisineFilter))

            return matchesSearch && matchesCuisine
        })
        .sort((a, b) => {
            // Sort by selected criteria
            if (sortBy === "rating") {
                return b.rating - a.rating
            } else if (sortBy === "name") {
                return a.name.localeCompare(b.name)
            }
            return 0
        })

    // Get all unique cuisines for filter
    const allCuisines = [...new Set(restaurants.flatMap((r) => r.cuisine || []))]

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

    const handleRestaurantClick = (restaurantId) => {
        router.push(`/dashboard/user/restaurants/${restaurantId}`)
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
                    <p className="text-gray-500 text-sm mb-4">Welcome to your food dashboard</p>

                    <nav className="space-y-1">
                        <Button
                            variant={activeTab === "dashboard" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "dashboard" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("dashboard")
                                router.push("/dashboard/user")
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
                                router.push("/dashboard/user/restaurants")
                            }}
                        >
                            <Pizza className="mr-2 h-5 w-5" />
                            Restaurants
                        </Button>

                        <Button
                            variant={activeTab === "orders" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "orders" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("orders")
                                router.push("/dashboard/user/orders")
                            }}
                        >
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            My Orders
                        </Button>

                        <Button
                            variant={activeTab === "favorites" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "favorites" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("favorites")
                                router.push("/dashboard/user/favorites")
                            }}
                        >
                            <Heart className="mr-2 h-5 w-5" />
                            Favorites
                        </Button>

                        <Button
                            variant={activeTab === "profile" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "profile" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("profile")
                                router.push("/dashboard/user/profile")
                            }}
                        >
                            <User className="mr-2 h-5 w-5" />
                            Profile
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
                    <Card className="bg-orange-500 text-white border-none shadow-md">
                        <CardContent className="p-4">
                            <div className="flex flex-col items-center gap-2">
                                <Pizza className="h-8 w-8" />
                                <p className="text-sm font-medium">Get 50% off</p>
                                <Button size="sm" variant="outline" className="bg-white text-orange-500 hover:bg-orange-50 w-full">
                                    Order Now
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Restaurants</h1>
                        <p className="text-gray-500">Discover and order from the best restaurants</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarFallback className="bg-orange-200 text-orange-700">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search restaurants..."
                                className="pl-10 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="w-48">
                                <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
                                    <SelectTrigger>
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            <SelectValue placeholder="Cuisine" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Cuisines</SelectItem>
                                        {allCuisines.map((cuisine) => (
                                            <SelectItem key={cuisine} value={cuisine}>
                                                {cuisine}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-48">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger>
                                        <div className="flex items-center gap-2">
                                            <ChevronDown className="h-4 w-4" />
                                            <SelectValue placeholder="Sort by" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rating">Highest Rated</SelectItem>
                                        <SelectItem value="name">Alphabetical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Restaurants Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((_, index) => (
                            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md h-72 animate-pulse">
                                <div className="h-40 bg-gray-200"></div>
                                <div className="p-4 space-y-2">
                                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredRestaurants.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredRestaurants.map((restaurant, index) => (
                            <motion.div
                                key={restaurant._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-lg overflow-hidden shadow-md cursor-pointer"
                                onClick={() => handleRestaurantClick(restaurant._id)}
                            >
                                <div className="h-40 bg-gray-100 relative">
                                    {restaurant.image ? (
                                        <img
                                            src={restaurant.image || "/placeholder.svg"}
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Pizza className="h-16 w-16 text-gray-300" />
                                        </div>
                                    )}
                                    {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                                        <div className="absolute top-2 right-2">
                                            <Badge className="bg-orange-500">{restaurant.cuisine[0]}</Badge>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>

                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center">
                                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                            <span className="text-sm ml-1">{restaurant.rating || 4.5}</span>
                                        </div>
                                        <span className="text-gray-300">•</span>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span>30-45 min</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                        {restaurant.description || "Delicious food delivered to your doorstep"}
                                    </p>

                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span className="truncate">{restaurant.address}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-16">
                        <Pizza className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No restaurants found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            We couldn't find any restaurants matching your search criteria. Try adjusting your filters or search for
                            something else.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
