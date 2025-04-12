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
  MapPin,
  ArrowUpRight,
  LogOut,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Sample data for the dashboard
const recentOrders = [
  {
    id: "ORD-7291",
    restaurant: "Burger Palace",
    items: 3,
    total: 24.99,
    status: "Delivered",
    date: "Today, 2:30 PM",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "ORD-6432",
    restaurant: "Pizza Heaven",
    items: 2,
    total: 18.5,
    status: "On the way",
    date: "Today, 12:15 PM",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "ORD-5128",
    restaurant: "Taco Fiesta",
    items: 4,
    total: 32.75,
    status: "Preparing",
    date: "Today, 11:45 AM",
    image: "/placeholder.svg?height=60&width=60",
  },
]

const favoriteRestaurants = [
  {
    id: 1,
    name: "Burger Palace",
    rating: 4.8,
    deliveryTime: "15-20 min",
    distance: "1.2 km",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 2,
    name: "Pizza Heaven",
    rating: 4.6,
    deliveryTime: "20-30 min",
    distance: "2.5 km",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 3,
    name: "Sushi World",
    rating: 4.9,
    deliveryTime: "25-35 min",
    distance: "3.0 km",
    image: "/placeholder.svg?height=120&width=120",
  },
]

const recommendedItems = [
  {
    id: 1,
    name: "Double Cheeseburger",
    restaurant: "Burger Palace",
    price: 12.99,
    rating: 4.7,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "Pepperoni Pizza",
    restaurant: "Pizza Heaven",
    price: 14.5,
    rating: 4.8,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Chicken Tacos",
    restaurant: "Taco Fiesta",
    price: 10.99,
    rating: 4.6,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 4,
    name: "Veggie Bowl",
    restaurant: "Green Eats",
    price: 9.99,
    rating: 4.5,
    image: "/placeholder.svg?height=100&width=100",
  },
]

export default function UserDashboard() {
  const { user, loading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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
              onClick={() => setActiveTab("dashboard")}
            >
              <Home className="mr-2 h-5 w-5" />
              Dashboard
            </Button>

            <Button
              variant={activeTab === "orders" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "orders" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              My Orders
            </Button>

            <Button
              variant={activeTab === "favorites" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "favorites" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setActiveTab("favorites")}
            >
              <Heart className="mr-2 h-5 w-5" />
              Favorites
            </Button>

            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "profile" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setActiveTab("profile")}
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
                      <h3 className="text-2xl font-bold mt-1">24</h3>
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
                      <h3 className="text-2xl font-bold mt-1">8</h3>
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
                      <p className="text-gray-500 text-sm">Total Spent</p>
                      <h3 className="text-2xl font-bold mt-1">$342.75</h3>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-500"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center gap-1"
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

            {/* Recommended For You */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recommended For You</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {recommendedItems.map((item, index) => (
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
          </motion.div>

          {/* Right Column */}
          <motion.div variants={item} className="w-[350px] space-y-6">
            {/* Current Order */}
            <Card className="border-none shadow-md bg-orange-500 text-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Current Order</CardTitle>
                  <Badge className="bg-white text-orange-500 hover:bg-orange-50">On the way</Badge>
                </div>
                <CardDescription className="text-orange-100">Estimated delivery: 15-20 min</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-white p-1">
                    <img
                      src="/placeholder.svg?height=50&width=50"
                      alt="Restaurant"
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">Pizza Heaven</h4>
                    <div className="flex items-center gap-1 text-sm text-orange-100">
                      <Clock className="h-3 w-3" />
                      <span>Preparing your order</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>1 × Margherita Pizza</span>
                    <span>$12.99</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>1 × Garlic Bread</span>
                    <span>$4.50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>1 × Coca Cola</span>
                    <span>$2.50</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-orange-400">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>$19.99</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-white text-orange-500 hover:bg-orange-50">Track Order</Button>
              </CardFooter>
            </Card>

            {/* Favorite Restaurants */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Favorite Places</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                  >
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {favoriteRestaurants.map((restaurant, index) => (
                    <motion.div
                      key={restaurant.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={restaurant.image || "/placeholder.svg"}
                          alt={restaurant.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{restaurant.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span>{restaurant.rating}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{restaurant.deliveryTime}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{restaurant.distance}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

