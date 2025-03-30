"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import {
  Pizza,
  Home,
  Users,
  Store,
  ClipboardList,
  Settings,
  Bell,
  Search,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  Plus,
  MoreHorizontal,
  Filter,
  LogOut,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Sample data for the admin dashboard
const recentUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    joined: "Today, 2:30 PM",
    orders: 12,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah@example.com",
    joined: "Yesterday, 1:15 PM",
    orders: 8,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    joined: "Yesterday, 10:45 AM",
    orders: 5,
    image: "/placeholder.svg?height=40&width=40",
  },
]

const topRestaurants = [
  {
    id: 1,
    name: "Burger Palace",
    orders: 145,
    revenue: 2850,
    rating: 4.8,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 2,
    name: "Pizza Heaven",
    orders: 132,
    revenue: 2340,
    rating: 4.6,
    image: "/placeholder.svg?height=60&width=60",
  },
  { id: 3, name: "Taco Fiesta", orders: 98, revenue: 1780, rating: 4.5, image: "/placeholder.svg?height=60&width=60" },
]

const recentOrders = [
  {
    id: "ORD-7291",
    user: "John Doe",
    restaurant: "Burger Palace",
    total: 24.99,
    status: "Delivered",
    date: "Today, 2:30 PM",
  },
  {
    id: "ORD-6432",
    user: "Sarah Smith",
    restaurant: "Pizza Heaven",
    total: 18.5,
    status: "On the way",
    date: "Today, 12:15 PM",
  },
  {
    id: "ORD-5128",
    user: "Mike Johnson",
    restaurant: "Taco Fiesta",
    total: 32.75,
    status: "Preparing",
    date: "Today, 11:45 AM",
  },
  {
    id: "ORD-4982",
    user: "Emily Davis",
    restaurant: "Sushi World",
    total: 45.2,
    status: "Delivered",
    date: "Yesterday, 7:30 PM",
  },
  {
    id: "ORD-4879",
    user: "Robert Wilson",
    restaurant: "Green Eats",
    total: 16.8,
    status: "Delivered",
    date: "Yesterday, 6:15 PM",
  },
]

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
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
          <p className="text-gray-500 text-sm mb-4">Admin Control Panel</p>

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
              variant={activeTab === "users" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "users" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <Users className="mr-2 h-5 w-5" />
              Users
            </Button>

            <Button
              variant={activeTab === "restaurants" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "restaurants" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setActiveTab("restaurants")}
            >
              <Store className="mr-2 h-5 w-5" />
              Restaurants
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
                <TrendingUp className="h-8 w-8" />
                <p className="text-sm font-medium">View Analytics</p>
                <Button size="sm" variant="outline" className="bg-white text-orange-500 hover:bg-orange-50 w-full">
                  Open Reports
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
                  Admin Dashboard
                </motion.span>
              )}
            </h1>
            <p className="text-gray-500">Welcome back, {user?.name || "Admin"}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search..." className="pl-10 w-[300px] bg-white border-none" />
            </div>

            <Button size="icon" variant="outline" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center">
                5
              </span>
            </Button>

            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-orange-200 text-orange-700">{user?.name?.charAt(0) || "A"}</AvatarFallback>
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
                      <h3 className="text-2xl font-bold mt-1">1,248</h3>
                      <p className="text-green-500 text-xs mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> +12.5% this week
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
                      <p className="text-gray-500 text-sm">Total Users</p>
                      <h3 className="text-2xl font-bold mt-1">842</h3>
                      <p className="text-green-500 text-xs mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> +8.2% this week
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm">Total Revenue</p>
                      <h3 className="text-2xl font-bold mt-1">$24,582</h3>
                      <p className="text-green-500 text-xs mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> +15.3% this week
                      </p>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b">
                        <th className="pb-2 font-medium">Order ID</th>
                        <th className="pb-2 font-medium">Customer</th>
                        <th className="pb-2 font-medium">Restaurant</th>
                        <th className="pb-2 font-medium">Amount</th>
                        <th className="pb-2 font-medium">Date</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 text-sm"
                        >
                          <td className="py-3 font-medium">{order.id}</td>
                          <td className="py-3">{order.user}</td>
                          <td className="py-3">{order.restaurant}</td>
                          <td className="py-3">${order.total.toFixed(2)}</td>
                          <td className="py-3 text-gray-500">{order.date}</td>
                          <td className="py-3">
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
                          </td>
                          <td className="py-3">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Top Restaurants */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Top Performing Restaurants</CardTitle>
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
                  {topRestaurants.map((restaurant, index) => (
                    <motion.div
                      key={restaurant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white transition-colors"
                    >
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={restaurant.image || "/placeholder.svg"}
                          alt={restaurant.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{restaurant.name}</h4>
                          <p className="text-sm font-medium text-green-600">${restaurant.revenue}</p>
                        </div>
                        <div className="mt-1">
                          <div className="flex justify-between mb-1">
                            <p className="text-xs text-gray-500">
                              {restaurant.orders} orders · Rating: {restaurant.rating}
                            </p>
                            <p className="text-xs text-gray-500">85% completed</p>
                          </div>
                          <Progress value={85} className="h-1" />
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8">
                        <ArrowUpRight className="h-4 w-4" />
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
                <CardDescription className="text-orange-100">Manage your platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-white text-orange-500 hover:bg-orange-50 justify-start">
                  <Plus className="mr-2 h-4 w-4" /> Add New Restaurant
                </Button>
                <Button className="w-full bg-white text-orange-500 hover:bg-orange-50 justify-start">
                  <Plus className="mr-2 h-4 w-4" /> Create Promotion
                </Button>
                <Button className="w-full bg-white text-orange-500 hover:bg-orange-50 justify-start">
                  <Plus className="mr-2 h-4 w-4" /> Send Notification
                </Button>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Users</CardTitle>
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
                  {recentUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer"
                    >
                      <Avatar>
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="bg-orange-200 text-orange-700">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{user.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>Joined: {user.joined}</span>
                          <span>•</span>
                          <span>{user.orders} orders</span>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Add New User
                </Button>
              </CardFooter>
            </Card>

            {/* System Status */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm">Server Load</p>
                    <p className="text-sm font-medium">42%</p>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm">Database Usage</p>
                    <p className="text-sm font-medium">68%</p>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm">API Requests</p>
                    <p className="text-sm font-medium">85%</p>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">System Status</p>
                      <p className="text-xs text-gray-500">Last checked: 5 mins ago</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

