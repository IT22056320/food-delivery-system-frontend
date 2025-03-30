"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import {
  Pizza,
  Home,
  UtensilsCrossed,
  ClipboardList,
  Settings,
  Bell,
  Search,
  ChevronRight,
  TrendingUp,
  Plus,
  Filter,
  Clock,
  Star,
  DollarSign,
  Calendar,
  Users,
  Utensils,
  PieChart,
  ShoppingBag,
  Truck,
  LogOut,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Sample data for the restaurant dashboard
const recentOrders = [
  {
    id: "ORD-7291",
    customer: "John Doe",
    items: ["Cheeseburger", "Fries", "Coke"],
    total: 24.99,
    status: "Ready for pickup",
    time: "10 mins ago",
    type: "Delivery",
  },
  {
    id: "ORD-6432",
    customer: "Sarah Smith",
    items: ["Margherita Pizza", "Garlic Bread"],
    total: 18.5,
    status: "Preparing",
    time: "15 mins ago",
    type: "Dine-in",
  },
  {
    id: "ORD-5128",
    customer: "Mike Johnson",
    items: ["Chicken Tacos", "Nachos", "Sprite"],
    total: 32.75,
    status: "Delivered",
    time: "35 mins ago",
    type: "Delivery",
  },
  {
    id: "ORD-4982",
    customer: "Emily Davis",
    items: ["Sushi Platter", "Miso Soup"],
    total: 45.2,
    status: "Completed",
    time: "2 hours ago",
    type: "Takeaway",
  },
]

const topItems = [
  {
    id: 1,
    name: "Cheeseburger Deluxe",
    price: 12.99,
    orders: 145,
    revenue: 1884.55,
    rating: 4.8,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 2,
    name: "Pepperoni Pizza",
    price: 14.99,
    orders: 132,
    revenue: 1978.68,
    rating: 4.6,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 3,
    name: "Chicken Wings",
    price: 10.99,
    orders: 98,
    revenue: 1077.02,
    rating: 4.5,
    image: "/placeholder.svg?height=60&width=60",
  },
]

const customerReviews = [
  {
    id: 1,
    name: "John Doe",
    rating: 5,
    comment: "The food was amazing! Fast delivery and everything was still hot when it arrived.",
    date: "Today, 2:30 PM",
    image: "/placeholder.svg?height=40&width=40",
    order: "Cheeseburger Deluxe, Fries",
  },
  {
    id: 2,
    name: "Sarah Smith",
    rating: 4,
    comment: "Great food but delivery took a bit longer than expected. Still worth the wait!",
    date: "Yesterday, 1:15 PM",
    image: "/placeholder.svg?height=40&width=40",
    order: "Pepperoni Pizza, Garlic Bread",
  },
  {
    id: 3,
    name: "Mike Johnson",
    rating: 5,
    comment: "Best tacos in town! Will definitely order again.",
    date: "Yesterday, 10:45 AM",
    image: "/placeholder.svg?height=40&width=40",
    order: "Chicken Tacos, Nachos",
  },
]

const weeklyData = [
  { day: "Mon", orders: 42, revenue: 850 },
  { day: "Tue", orders: 38, revenue: 720 },
  { day: "Wed", orders: 55, revenue: 1100 },
  { day: "Thu", orders: 47, revenue: 980 },
  { day: "Fri", orders: 68, revenue: 1450 },
  { day: "Sat", orders: 76, revenue: 1680 },
  { day: "Sun", orders: 62, revenue: 1320 },
]

export default function RestaurantDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState("today")

  useEffect(() => {
    if (!loading && user?.role !== "restaurant_owner") {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading || !user) {
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

  // Calculate total orders and revenue for the selected time period
  const getTotalOrders = () => {
    return timeFilter === "today" ? 38 : timeFilter === "week" ? 388 : 1248
  }

  const getTotalRevenue = () => {
    return timeFilter === "today" ? 850 : timeFilter === "week" ? 8520 : 24582
  }

  const getAverageRating = () => {
    return 4.7
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
          <p className="text-gray-500 text-sm mb-4">Restaurant Management</p>

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
              <ClipboardList className="mr-2 h-5 w-5" />
              Orders
            </Button>

            <Button
              variant={activeTab === "menu" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "menu" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setActiveTab("menu")}
            >
              <UtensilsCrossed className="mr-2 h-5 w-5" />
              Menu
            </Button>

            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "analytics" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              <PieChart className="mr-2 h-5 w-5" />
              Analytics
            </Button>

            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "settings" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setActiveTab("settings")}
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
          <Card className="bg-orange-500 text-white border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-2">
                <ShoppingBag className="h-8 w-8" />
                <p className="text-sm font-medium">Restaurant Status</p>
                <Button size="sm" variant="outline" className="bg-white text-orange-500 hover:bg-orange-50 w-full">
                  Open for Orders
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
                  Restaurant Dashboard
                </motion.span>
              )}
            </h1>
            <p className="text-gray-500">Welcome back, {user?.name || "Restaurant Owner"}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search orders..." className="pl-10 w-[300px] bg-white border-none" />
            </div>

            <Button size="icon" variant="outline" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Button>

            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-orange-200 text-orange-700">{user?.name?.charAt(0) || "R"}</AvatarFallback>
            </Avatar>
          </div>
        </header>

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
                        <TrendingUp className="h-3 w-3 mr-1" /> +8.5% from last {timeFilter}
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
                        <TrendingUp className="h-3 w-3 mr-1" /> +12.3% from last {timeFilter}
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
                      <p className="text-gray-500 text-sm">Average Rating</p>
                      <h3 className="text-2xl font-bold mt-1">{getAverageRating()}</h3>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < Math.floor(getAverageRating()) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Orders */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Live Orders</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Filter className="h-3 w-3" /> Filter
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                    >
                      View All <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.slice(0, 3).map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {order.type === "Delivery" ? (
                          <Truck className="h-6 w-6 text-orange-500" />
                        ) : order.type === "Takeaway" ? (
                          <ShoppingBag className="h-6 w-6 text-orange-500" />
                        ) : (
                          <Utensils className="h-6 w-6 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{order.id}</h4>
                          <Badge
                            className={
                              order.status === "Delivered" || order.status === "Completed"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : order.status === "Ready for pickup"
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                  : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{order.customer}</p>
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-gray-500">{order.items.join(", ")}</p>
                          <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{order.time}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="flex-shrink-0">
                        Details
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Performance Chart */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Weekly Performance</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                  >
                    Download Report <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <div className="flex h-full items-end gap-2">
                    {weeklyData.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-orange-500 rounded-t-sm"
                            style={{ height: `${(day.orders / 80) * 200}px` }}
                          ></div>
                          <div
                            className="w-full bg-blue-500 rounded-t-sm"
                            style={{ height: `${(day.revenue / 1800) * 200}px` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{day.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-orange-500 rounded-sm"></div>
                    <span className="text-sm text-gray-600">Orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-blue-500 rounded-sm"></div>
                    <span className="text-sm text-gray-600">Revenue ($)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Menu Items */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Top Menu Items</CardTitle>
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
                  {topItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white transition-colors"
                    >
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm font-medium text-green-600">${item.revenue.toFixed(2)}</p>
                        </div>
                        <div className="mt-1">
                          <div className="flex justify-between mb-1">
                            <p className="text-xs text-gray-500">
                              ${item.price} · {item.orders} orders · Rating: {item.rating}
                            </p>
                            <p className="text-xs text-gray-500">
                              {Math.round((item.orders / getTotalOrders()) * 100)}% of sales
                            </p>
                          </div>
                          <Progress value={Math.round((item.orders / getTotalOrders()) * 100)} className="h-1" />
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="flex-shrink-0">
                        Edit Item
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                <Button className="w-full bg-white text-orange-500 hover:bg-orange-50 justify-start">
                  <Plus className="mr-2 h-4 w-4" /> Add New Menu Item
                </Button>
                <Button className="w-full bg-white text-orange-500 hover:bg-orange-50 justify-start">
                  <Plus className="mr-2 h-4 w-4" /> Create Special Offer
                </Button>
                <Button className="w-full bg-white text-orange-500 hover:bg-orange-50 justify-start">
                  <Clock className="mr-2 h-4 w-4" /> Update Business Hours
                </Button>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">New Orders</p>
                    <h3 className="text-2xl font-bold text-orange-500 mt-1">12</h3>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Preparing</p>
                    <h3 className="text-2xl font-bold text-blue-500 mt-1">8</h3>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Ready</p>
                    <h3 className="text-2xl font-bold text-amber-500 mt-1">5</h3>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Completed</p>
                    <h3 className="text-2xl font-bold text-green-500 mt-1">24</h3>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Average Preparation Time</p>
                    <p className="text-sm font-medium">18 mins</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-medium">Average Delivery Time</p>
                    <p className="text-sm font-medium">25 mins</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full" variant="outline">
                  View Detailed Analytics
                </Button>
              </CardFooter>
            </Card>

            {/* Customer Reviews */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Reviews</CardTitle>
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
                  {customerReviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar>
                          <AvatarImage src={review.image} />
                          <AvatarFallback className="bg-orange-200 text-orange-700">
                            {review.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{review.name}</h4>
                          <p className="text-xs text-gray-500">{review.date}</p>
                        </div>
                        <div className="ml-auto flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-xs text-gray-500">Order: {review.order}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Reservations */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Today's Reservations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Johnson Family</h4>
                      <p className="text-xs text-gray-500">Table for 4 · 7:30 PM</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Confirmed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Smith Anniversary</h4>
                      <p className="text-xs text-gray-500">Table for 2 · 8:00 PM</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Confirmed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Business Meeting</h4>
                      <p className="text-xs text-gray-500">Private Room · 12:30 PM</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Completed</Badge>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full" variant="outline">
                  Manage Reservations
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

