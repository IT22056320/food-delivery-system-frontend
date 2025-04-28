"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import {
  Pizza,
  Home,
  ShoppingBag,
  Heart,
  User,
  Bell,
  Search,
  ChevronRight,
  Star,
  Clock,
  LogOut,
  Utensils,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function UserDashboard() {
  const { user, loading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [restaurants, setRestaurants] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [popularItems, setPopularItems] = useState([])
  const router = useRouter()

  // Fetch restaurants from the API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/restaurants", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          // Filter only verified and available restaurants
          const availableRestaurants = data.filter((restaurant) => restaurant.isVerified && restaurant.isAvailable)
          setRestaurants(availableRestaurants)
        } else {
          console.error("Failed to fetch restaurants:", await response.text())
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error)
      }
    }

    // Fetch recent orders (placeholder for now)
    const fetchRecentOrders = async () => {
      // This would be replaced with an actual API call
      setRecentOrders([
        {
          id: "ORD-7291",
          restaurant: "Burger Palace",
          items: 3,
          total: 24.99,
          status: "Delivered",
          date: "Today, 2:30 PM",
          image: "/classic-beef-burger.png",
        },
        {
          id: "ORD-6432",
          restaurant: "Pizza Heaven",
          items: 2,
          total: 18.5,
          status: "On the way",
          date: "Today, 12:15 PM",
          image: "/classic-pepperoni-pizza.png",
        },
      ])
    }

    // Fetch popular menu items (placeholder for now)
    const fetchPopularItems = async () => {
      // This would be replaced with an actual API call
      setPopularItems([
        {
          id: 1,
          name: "Double Cheeseburger",
          restaurant: "Burger Palace",
          price: 12.99,
          rating: 4.7,
          image: "/classic-cheeseburger.png",
        },
        {
          id: 2,
          name: "Pepperoni Pizza",
          restaurant: "Pizza Heaven",
          price: 14.5,
          rating: 4.8,
          image: "/classic-pepperoni-pizza.png",
        },
        {
          id: 3,
          name: "Chicken Tacos",
          restaurant: "Taco Fiesta",
          price: 10.99,
          rating: 4.6,
          image: "/colorful-taco-spread.png",
        },
        {
          id: 4,
          name: "Veggie Bowl",
          restaurant: "Green Eats",
          price: 9.99,
          rating: 4.5,
          image: "/colorful-garden-salad.png",
        },
      ])
    }

    if (!loading) {
      Promise.all([fetchRestaurants(), fetchRecentOrders(), fetchPopularItems()]).then(() => {
        setIsLoading(false)
      })
    }
  }, [loading])

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

  const viewRestaurant = (restaurantId) => {
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
            <h1 className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Hello, {user?.name || "Guest"}
                </motion.span>
              )}
            </h1>
            <p className="text-gray-500">Welcome to your food dashboard</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search for food..." className="pl-10 w-[300px] bg-white border-none" />
            </div>

            <Button size="icon" variant="outline" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Button>

            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-orange-200 text-orange-700">{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={isLoading ? "hidden" : "show"}
          className="flex flex-col gap-6"
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Total Orders</p>
                    <h3 className="text-2xl font-bold mt-1">{recentOrders.length || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Favorites</p>
                    <h3 className="text-2xl font-bold mt-1">0</h3>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Available Restaurants</p>
                    <h3 className="text-2xl font-bold mt-1">{restaurants.length || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Utensils className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Restaurants Section */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Restaurants</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search restaurants..." className="pl-10 w-[250px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : restaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurants.map((restaurant) => (
                    <motion.div
                      key={restaurant._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                      onClick={() => viewRestaurant(restaurant._id)}
                    >
                      <div className="h-32 bg-gray-100 relative">
                        <img
                          src={
                            restaurant.image ||
                            `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(restaurant.name)}`
                          }
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                        {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                          <Badge className="absolute top-2 right-2 bg-white text-orange-500">
                            {restaurant.cuisine[0]}
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1 mb-2">{restaurant.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">{restaurant.rating || "New"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>15-30 min</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Utensils className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No Restaurants Found</h3>
                  <p className="text-sm text-gray-500">
                    There are no restaurants available at the moment. Please check back later.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          {recentOrders.length > 0 && (
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                    onClick={() => router.push("/dashboard/user/orders")}
                  >
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white transition-colors"
                    >
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={order.image || "/placeholder.svg"}
                          alt={order.restaurant}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{order.restaurant}</h4>
                          <p className="text-sm text-gray-500">{order.date}</p>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-gray-500">
                            {order.items} items · ${order.total.toFixed(2)}
                          </p>
                          <Badge
                            className={
                              order.status === "Delivered"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : order.status === "On the way"
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                  : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Popular Items */}
          {popularItems.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Popular Items</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {popularItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="relative h-24 w-full mb-2 flex items-center justify-center">
                      <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full object-contain" />
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute top-0 right-0 h-7 w-7 rounded-full bg-white"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{item.restaurant}</p>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-orange-500">${item.price}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs">{item.rating}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
