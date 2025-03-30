"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import {
  Pizza,
  Home,
  MapPin,
  Clock,
  Settings,
  Bell,
  ChevronRight,
  TrendingUp,
  Truck,
  DollarSign,
  Star,
  Navigation,
  CheckCircle,
  PhoneCall,
  MessageSquare,
  Calendar,
  BarChart3,
  Wallet,
  AlertCircle,
  Package,
  Compass,
  LogOut,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Sample data for the delivery dashboard
const activeDeliveries = [
  {
    id: "ORD-7291",
    customer: "John Doe",
    customerAddress: "123 Main St, Apt 4B, New York, NY 10001",
    customerPhone: "+1 (555) 123-4567",
    restaurant: "Burger Palace",
    restaurantAddress: "85 Broadway, New York, NY 10003",
    items: ["Cheeseburger", "Fries", "Coke"],
    total: 24.99,
    status: "Picked up",
    estimatedDelivery: "10 mins",
    distance: "1.2 miles",
    paymentMethod: "Card",
    specialInstructions: "Leave at door. Ring doorbell.",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "ORD-6432",
    customer: "Sarah Smith",
    customerAddress: "456 Park Ave, New York, NY 10022",
    customerPhone: "+1 (555) 987-6543",
    restaurant: "Pizza Heaven",
    restaurantAddress: "120 5th Ave, New York, NY 10011",
    items: ["Margherita Pizza", "Garlic Bread"],
    total: 18.5,
    status: "On the way",
    estimatedDelivery: "15 mins",
    distance: "2.5 miles",
    paymentMethod: "Cash",
    specialInstructions: "Call when arriving.",
    image: "/placeholder.svg?height=60&width=60",
  },
]

const deliveryHistory = [
  {
    id: "ORD-5128",
    customer: "Mike Johnson",
    restaurant: "Taco Fiesta",
    total: 32.75,
    status: "Delivered",
    time: "Today, 2:30 PM",
    earnings: 8.5,
    tip: 5.0,
    distance: "3.2 miles",
    duration: "28 mins",
    rating: 5,
  },
  {
    id: "ORD-4982",
    customer: "Emily Davis",
    restaurant: "Sushi World",
    total: 45.2,
    status: "Delivered",
    time: "Today, 1:15 PM",
    earnings: 9.25,
    tip: 7.5,
    distance: "4.5 miles",
    duration: "35 mins",
    rating: 5,
  },
  {
    id: "ORD-4879",
    customer: "Robert Wilson",
    restaurant: "Green Eats",
    total: 16.8,
    status: "Delivered",
    time: "Today, 11:45 AM",
    earnings: 6.75,
    tip: 3.0,
    distance: "1.8 miles",
    duration: "22 mins",
    rating: 4,
  },
  {
    id: "ORD-4756",
    customer: "Lisa Brown",
    restaurant: "Burger Palace",
    total: 28.5,
    status: "Delivered",
    time: "Yesterday, 7:30 PM",
    earnings: 7.5,
    tip: 4.5,
    distance: "2.7 miles",
    duration: "25 mins",
    rating: 5,
  },
  {
    id: "ORD-4698",
    customer: "David Miller",
    restaurant: "Pizza Heaven",
    total: 22.75,
    status: "Delivered",
    time: "Yesterday, 6:15 PM",
    earnings: 7.0,
    tip: 4.0,
    distance: "2.3 miles",
    duration: "20 mins",
    rating: 4,
  },
]

const weeklyData = [
  { day: "Mon", deliveries: 8, earnings: 85 },
  { day: "Tue", deliveries: 6, earnings: 72 },
  { day: "Wed", deliveries: 10, earnings: 110 },
  { day: "Thu", deliveries: 7, earnings: 98 },
  { day: "Fri", deliveries: 12, earnings: 145 },
  { day: "Sat", deliveries: 14, earnings: 168 },
  { day: "Sun", deliveries: 9, earnings: 132 },
]

export default function DeliveryDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState("today")
  const [isAvailable, setIsAvailable] = useState(true)
  const [selectedDelivery, setSelectedDelivery] = useState(activeDeliveries[0]?.id || null)

  useEffect(() => {
    if (!loading && user?.role !== "delivery_person") {
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

  // Calculate total deliveries and earnings for the selected time period
  const getTotalDeliveries = () => {
    return timeFilter === "today" ? 5 : timeFilter === "week" ? 38 : 142
  }

  const getTotalEarnings = () => {
    return timeFilter === "today" ? 85 : timeFilter === "week" ? 520 : 1850
  }

  const getAverageRating = () => {
    return 4.8
  }

  const getSelectedDelivery = () => {
    return activeDeliveries.find((delivery) => delivery.id === selectedDelivery) || activeDeliveries[0]
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
          <p className="text-gray-500 text-sm mb-4">Delivery Dashboard</p>

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
              variant={activeTab === "deliveries" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "deliveries" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setActiveTab("deliveries")}
            >
              <Truck className="mr-2 h-5 w-5" />
              Deliveries
            </Button>

            <Button
              variant={activeTab === "earnings" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "earnings" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setActiveTab("earnings")}
            >
              <Wallet className="mr-2 h-5 w-5" />
              Earnings
            </Button>

            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "analytics" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
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
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-sm font-medium">Available for Deliveries</span>
                  <Switch
                    checked={isAvailable}
                    onCheckedChange={setIsAvailable}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
                <div
                  className={`w-full p-2 rounded-md text-center text-sm font-medium ${isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                >
                  {isAvailable ? "Online" : "Offline"}
                </div>
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
                  Delivery Dashboard
                </motion.span>
              )}
            </h1>
            <p className="text-gray-500">Welcome back, {user?.name || "Driver"}</p>
          </div>

          <div className="flex items-center gap-4">
            <Button size="icon" variant="outline" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center">
                2
              </span>
            </Button>

            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-orange-200 text-orange-700">{user?.name?.charAt(0) || "D"}</AvatarFallback>
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
                      <p className="text-gray-500 text-sm">Total Deliveries</p>
                      <h3 className="text-2xl font-bold mt-1">{getTotalDeliveries()}</h3>
                      <p className="text-green-500 text-xs mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> +12% from last {timeFilter}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Truck className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm">Total Earnings</p>
                      <h3 className="text-2xl font-bold mt-1">${getTotalEarnings()}</h3>
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

            {/* Active Deliveries */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Active Deliveries</CardTitle>
                  <Badge className="bg-green-100 text-green-700">{activeDeliveries.length} Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {activeDeliveries.length > 0 ? (
                  <div className="space-y-4">
                    {activeDeliveries.map((delivery, index) => (
                      <motion.div
                        key={delivery.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all cursor-pointer ${selectedDelivery === delivery.id ? "ring-2 ring-orange-500" : ""}`}
                        onClick={() => setSelectedDelivery(delivery.id)}
                      >
                        <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{delivery.id}</h4>
                            <Badge
                              className={
                                delivery.status === "Picked up"
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                  : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                              }
                            >
                              {delivery.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{delivery.restaurant}</p>
                          <div className="flex justify-between mt-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{delivery.distance}</span>
                              <span className="mx-1">•</span>
                              <Clock className="h-3 w-3" />
                              <span>Est. {delivery.estimatedDelivery}</span>
                            </div>
                            <p className="text-sm font-medium">${delivery.total.toFixed(2)}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="flex-shrink-0">
                          Navigate
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Truck className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No Active Deliveries</h3>
                    <p className="text-sm text-gray-500 text-center max-w-md">
                      You don't have any active deliveries at the moment. New delivery requests will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Delivery Details */}
            {selectedDelivery && (
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Delivery Details</CardTitle>
                    <Badge
                      className={
                        getSelectedDelivery().status === "Picked up"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    >
                      {getSelectedDelivery().status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Progress Tracker */}
                    <div className="relative pt-4">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 ml-3"></div>
                      <div className="space-y-8 relative">
                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center z-10">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium">Order Accepted</h4>
                            <p className="text-xs text-gray-500">Today, 2:30 PM</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center z-10">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium">Arrived at Restaurant</h4>
                            <p className="text-xs text-gray-500">Today, 2:45 PM</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div
                            className={`h-6 w-6 rounded-full ${getSelectedDelivery().status === "Picked up" ? "bg-green-500" : "bg-gray-300"} flex items-center justify-center z-10`}
                          >
                            {getSelectedDelivery().status === "Picked up" ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : (
                              <Clock className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium">Order Picked Up</h4>
                            <p className="text-xs text-gray-500">
                              {getSelectedDelivery().status === "Picked up" ? "Today, 2:55 PM" : "Pending"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center z-10">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium">Delivered to Customer</h4>
                            <p className="text-xs text-gray-500">Pending</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Restaurant</h4>
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                              <img
                                src={getSelectedDelivery().image || "/placeholder.svg"}
                                alt={getSelectedDelivery().restaurant}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{getSelectedDelivery().restaurant}</p>
                              <p className="text-xs text-gray-500">{getSelectedDelivery().restaurantAddress}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Order Items</h4>
                          <ul className="text-sm space-y-1">
                            {getSelectedDelivery().items.map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Payment</h4>
                          <p className="text-sm">{getSelectedDelivery().paymentMethod}</p>
                          <p className="text-sm font-medium">${getSelectedDelivery().total.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Customer</h4>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-200 text-blue-700">
                                {getSelectedDelivery().customer.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{getSelectedDelivery().customer}</p>
                              <p className="text-xs text-gray-500">{getSelectedDelivery().customerPhone}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Delivery Address</h4>
                          <p className="text-sm">{getSelectedDelivery().customerAddress}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Special Instructions</h4>
                          <p className="text-sm">{getSelectedDelivery().specialInstructions}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
                        {getSelectedDelivery().status === "Picked up" ? "Mark as Delivered" : "Mark as Picked Up"}
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <PhoneCall className="h-4 w-4" /> Call Customer
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Navigation className="h-4 w-4" /> Navigate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                            style={{ height: `${(day.deliveries / 15) * 200}px` }}
                          ></div>
                          <div
                            className="w-full bg-blue-500 rounded-t-sm"
                            style={{ height: `${(day.earnings / 180) * 200}px` }}
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
                    <span className="text-sm text-gray-600">Deliveries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-blue-500 rounded-sm"></div>
                    <span className="text-sm text-gray-600">Earnings ($)</span>
                  </div>
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
                <CardDescription className="text-orange-100">Manage your deliveries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-white text-orange-500 hover:bg-orange-50 justify-start">
                  <Compass className="mr-2 h-4 w-4" /> Start Navigation
                </Button>
                <Button className="w-full bg-white text-orange-500 hover:bg-orange-50 justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" /> Contact Support
                </Button>
                <Button className="w-full bg-white text-orange-500 hover:bg-orange-50 justify-start">
                  <AlertCircle className="mr-2 h-4 w-4" /> Report Issue
                </Button>
              </CardContent>
            </Card>

            {/* Earnings Summary */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Earnings Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Today</p>
                    <h3 className="text-2xl font-bold text-green-500 mt-1">${timeFilter === "today" ? 85 : 0}</h3>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">This Week</p>
                    <h3 className="text-2xl font-bold text-blue-500 mt-1">${timeFilter === "week" ? 520 : 0}</h3>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Base Pay</p>
                    <p className="text-sm font-medium">
                      ${timeFilter === "today" ? 55 : timeFilter === "week" ? 350 : 1200}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-medium">Tips</p>
                    <p className="text-sm font-medium">
                      ${timeFilter === "today" ? 30 : timeFilter === "week" ? 170 : 650}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-medium">Bonuses</p>
                    <p className="text-sm font-medium">${timeFilter === "today" ? 0 : timeFilter === "week" ? 0 : 0}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full" variant="outline">
                  View Detailed Earnings
                </Button>
              </CardFooter>
            </Card>

            {/* Delivery History */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Deliveries</CardTitle>
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
                  {deliveryHistory.slice(0, 3).map((delivery, index) => (
                    <motion.div
                      key={delivery.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{delivery.id}</h4>
                          <p className="text-xs text-gray-500">{delivery.time}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">{delivery.status}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>{delivery.restaurant}</span>
                        <span className="font-medium">${delivery.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{delivery.distance}</span>
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3" />
                          <span>{delivery.duration}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                          <DollarSign className="h-3 w-3" />
                          <span>${(delivery.earnings + delivery.tip).toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Upcoming Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Morning Shift</h4>
                      <p className="text-xs text-gray-500">Tomorrow, 8:00 AM - 12:00 PM</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Evening Shift</h4>
                      <p className="text-xs text-gray-500">Tomorrow, 5:00 PM - 9:00 PM</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full" variant="outline">
                  Manage Schedule
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

