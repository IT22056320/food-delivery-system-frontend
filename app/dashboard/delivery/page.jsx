"use client";

import { useState, useEffect, useCallback } from "react"
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
  MessageSquare,
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
import {
  getAvailableDeliveries,
  getMyDeliveries,
  getDeliveryHistory,
  getDeliveryStats,
  updateDeliveryStatus,
  updateLocation,
  acceptDelivery,
} from "@/lib/delivery-api"
import DeliveryTracker from "@/components/delivery-tracker"

export default function DeliveryDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState("today")
  const [isAvailable, setIsAvailable] = useState(true)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  // State for real data
  const [activeDeliveries, setActiveDeliveries] = useState([])
  const [availableDeliveries, setAvailableDeliveries] = useState([])
  const [deliveryHistory, setDeliveryHistory] = useState([])
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalEarnings: 0,
    avgRating: 0,
  })

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error("Please log in to access the delivery dashboard")
        router.push("/login")
      } else {
        // Log user info for debugging
        console.log("Current user:", {
          id: user.id,
          name: user.name,
          role: user.role,
        })

        // Allow access even if not delivery_person for testing
        setAuthChecked(true)
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, heading, speed } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });

          // Update location in backend if user is available
          if (isAvailable) {
            updateLocation(
              latitude,
              longitude,
              "AVAILABLE",
              heading,
              speed
            ).catch((error) =>
              console.error("Error updating location:", error)
            );
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error(
            "Unable to access your location. Please enable location services."
          );
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  }, [isAvailable]);

  // Fetch active deliveries
  useEffect(() => {
    if (!loading && user) {
      fetchActiveDeliveries();
      fetchAvailableDeliveries();
      fetchDeliveryHistory();
      fetchDeliveryStats();
    }
  }, [loading, user, timeFilter]);

  const fetchActiveDeliveries = async () => {
    try {
      const data = await getMyDeliveries();
      setActiveDeliveries(data);
      if (data.length > 0 && !selectedDelivery) {
        setSelectedDelivery(data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching active deliveries:", error);
    }
  };

  const fetchAvailableDeliveries = async () => {
    if (!isAvailable) return;

    try {
      const data = await getAvailableDeliveries();
      setAvailableDeliveries(data);
    } catch (error) {
      console.error("Error fetching available deliveries:", error);
    }
  };

  const fetchDeliveryHistory = async () => {
    try {
      const data = await getDeliveryHistory();
      setDeliveryHistory(data.deliveries);
    } catch (error) {
      console.error("Error fetching delivery history:", error);
    }
  };

  const fetchDeliveryStats = async () => {
    try {
      const data = await getDeliveryStats(timeFilter);
      setStats(data);
    } catch (error) {
      console.error("Error fetching delivery stats:", error);
    }
  };

  const handleUpdateDeliveryStatus = async (deliveryId, status, notes = "") => {
    try {
      await updateDeliveryStatus(deliveryId, status, notes);
      toast.success(`Delivery status updated to ${status}`);
      fetchActiveDeliveries();
    } catch (error) {
      console.error("Error updating delivery status:", error);
      toast.error("An error occurred while updating delivery status");
    }
  };

  const handleAcceptDelivery = async (deliveryId) => {
    try {
      await acceptDelivery(deliveryId);
      toast.success("Delivery accepted");
      fetchActiveDeliveries();
      fetchAvailableDeliveries();
    } catch (error) {
      console.error("Error accepting delivery:", error);
      toast.error("Failed to accept delivery");
    }
  };

  const updateAvailability = async (isAvailable) => {
    try {
      if (!currentLocation) {
        toast.error("Unable to update availability without location");
        return;
      }

      await updateLocation(
        currentLocation.lat,
        currentLocation.lng,
        isAvailable ? "AVAILABLE" : "OFFLINE"
      );

      setIsAvailable(isAvailable);
      toast.success(
        isAvailable
          ? "You are now available for deliveries"
          : "You are now offline"
      );

      if (isAvailable) {
        fetchAvailableDeliveries();
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("An error occurred while updating availability");
    }
  };

  const handleLocationUpdate = useCallback((newLocation) => {
    setCurrentLocation(newLocation);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      logout();
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Get current location and set up tracking
  useEffect(() => {
    if (!authChecked) return

    const locationWatchId = null
    let locationUpdateInterval = null

    // Function to update location in the backend
    const updateLocationToBackend = async (position) => {
      if (!position || !isAvailable) return

      try {
        const { latitude, longitude, heading, speed } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })

        await updateLocation(latitude, longitude, isAvailable ? "AVAILABLE" : "OFFLINE", heading, speed)
      } catch (error) {
        console.error("Error updating location:", error)
        // Don't show toast on every error to avoid spamming the user
      }
    }

    // Start location tracking
    if (navigator.geolocation) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })

          // Only update backend if user is available
          if (isAvailable) {
            updateLocationToBackend(position)
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
          toast.error("Unable to access your location. Please enable location services.")
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      )

      // Set up periodic location updates (every 30 seconds)
      locationUpdateInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          updateLocationToBackend,
          (error) => console.error("Periodic location update error:", error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
        )
      }, 30000)
    } else {
      toast.error("Geolocation is not supported by this browser.")
    }

    // Cleanup function
    return () => {
      if (locationWatchId) {
        navigator.geolocation.clearWatch(locationWatchId)
      }
      if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval)
      }
    }
  }, [isAvailable, authChecked])

  // Fetch active deliveries
  useEffect(() => {
    if (!authChecked) return

    let isMounted = true
    let fetchInterval = null

    const fetchData = async () => {
      if (!isMounted) return

      setIsLoading(true)
      try {
        await Promise.all([
          fetchActiveDeliveries(),
          isAvailable ? fetchAvailableDeliveries() : Promise.resolve([]),
          fetchDeliveryHistory(),
          fetchDeliveryStats(),
        ])
      } catch (error) {
        console.error("Error fetching delivery data:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Initial fetch
    fetchData()

    // Set up polling for real-time updates (every 30 seconds)
    fetchInterval = setInterval(fetchData, 30000)

    // Cleanup function
    return () => {
      isMounted = false
      if (fetchInterval) {
        clearInterval(fetchInterval)
      }
    }
  }, [authChecked, timeFilter, isAvailable])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  const getSelectedDelivery = () => {
    return activeDeliveries.find((delivery) => delivery._id === selectedDelivery) || null
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
              className={`w-full justify-start ${activeTab === "dashboard"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
                }`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Home className="mr-2 h-5 w-5" />
              Dashboard
            </Button>

            <Button
              variant={activeTab === "deliveries" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "deliveries"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
                }`}
              onClick={() => setActiveTab("deliveries")}
            >
              <Truck className="mr-2 h-5 w-5" />
              Deliveries
            </Button>

            <Button
              variant={activeTab === "earnings" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "earnings"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
                }`}
              onClick={() => setActiveTab("earnings")}
            >
              <Wallet className="mr-2 h-5 w-5" />
              Earnings
            </Button>

            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "analytics"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
                }`}
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Analytics
            </Button>

            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === "settings"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
                }`}
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
                  <span className="text-sm font-medium">
                    Available for Deliveries
                  </span>
                  <Switch
                    checked={isAvailable}
                    onCheckedChange={(checked) => updateAvailability(checked)}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
                <div
                  className={`w-full p-2 rounded-md text-center text-sm font-medium ${isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                    }`}
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
            <p className="text-gray-500">
              Welcome back, {user?.name || "Driver"}
            </p>
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
              <AvatarFallback className="bg-orange-200 text-orange-700">
                {user?.name?.charAt(0) || "D"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Time Period Filter */}
        <div className="mb-6">
          <Tabs
            defaultValue="today"
            value={timeFilter}
            onValueChange={setTimeFilter}
          >
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
                      <h3 className="text-2xl font-bold mt-1">{stats.totalDeliveries || 0}</h3>
                      <p className="text-green-500 text-xs mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> +12% from last{" "}
                        {timeFilter}
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
                      <h3 className="text-2xl font-bold mt-1">${stats.totalEarnings || 0}</h3>
                      <p className="text-green-500 text-xs mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> +8% from last{" "}
                        {timeFilter}
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
                      <h3 className="text-2xl font-bold mt-1">{stats.avgRating || 0}</h3>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < Math.floor(stats.avgRating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
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

            {/* Available Deliveries */}
            {isAvailable && availableDeliveries.length > 0 && (
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Available Deliveries</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700">{availableDeliveries.length} Available</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {availableDeliveries.map((delivery, index) => (
                      <motion.div
                        key={delivery._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">Order #{delivery.order_id.substring(0, 6)}</h4>
                            <Badge className="bg-blue-100 text-blue-700">New Order</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {delivery.pickup_location?.address || "Restaurant Address"}
                          </p>
                          <div className="flex justify-between mt-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{delivery.estimated_delivery_time || "30"} mins</span>
                              <span className="mx-1">•</span>
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(delivery.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          className="flex-shrink-0 bg-blue-500 hover:bg-blue-600"
                          onClick={() => handleAcceptDelivery(delivery._id)}
                        >
                          Accept
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Deliveries */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Active Deliveries</CardTitle>
                  <Badge className="bg-green-100 text-green-700">
                    {activeDeliveries.length} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {activeDeliveries.length > 0 ? (
                  <div className="space-y-4">
                    {activeDeliveries.map((delivery, index) => (
                      <motion.div
                        key={delivery._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all cursor-pointer ${selectedDelivery === delivery._id ? "ring-2 ring-orange-500" : ""}`}
                        onClick={() => setSelectedDelivery(delivery._id)}
                      >
                        <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">Order #{delivery.order_id.substring(0, 6)}</h4>
                            <Badge
                              className={
                                delivery.status === "PICKED_UP"
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                  : delivery.status === "IN_TRANSIT"
                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                              }
                            >
                              {delivery.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {delivery.pickup_location?.address || "Restaurant Address"}
                          </p>
                          <div className="flex justify-between mt-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{delivery.estimated_delivery_time || "30"} mins</span>
                              <span className="mx-1">•</span>
                              <Clock className="h-3 w-3" />
                              <span>
                                Est.{" "}
                                {new Date(delivery.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                        >
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
                    <h3 className="text-lg font-medium text-gray-700 mb-1">
                      No Active Deliveries
                    </h3>
                    <p className="text-sm text-gray-500 text-center max-w-md">
                      You don't have any active deliveries at the moment. New
                      delivery requests will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column */}
          <motion.div variants={item} className="w-[350px] space-y-6">
            {/* Delivery Tracker */}
            <DeliveryTracker
              delivery={getSelectedDelivery()}
              isDeliveryPerson={true}
              onStatusUpdate={() => fetchActiveDeliveries()}
            />

            {/* Quick Actions */}
            <Card className="border-none shadow-md bg-orange-500 text-white">
              <CardHeader className="pb-2">
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription className="text-orange-100">
                  Manage your deliveries
                </CardDescription>
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
                    <h3 className="text-2xl font-bold text-green-500 mt-1">
                      ${timeFilter === "today" ? stats.totalEarnings || 0 : 0}
                    </h3>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">This Week</p>
                    <h3 className="text-2xl font-bold text-blue-500 mt-1">
                      ${timeFilter === "week" ? stats.totalEarnings || 0 : 0}
                    </h3>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Base Pay</p>
                    <p className="text-sm font-medium">${Math.round((stats.totalEarnings || 0) * 0.7)}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-medium">Tips</p>
                    <p className="text-sm font-medium">${Math.round((stats.totalEarnings || 0) * 0.3)}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-medium">Bonuses</p>
                    <p className="text-sm font-medium">$0</p>
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
                      key={delivery._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Order #{delivery.order_id?.substring(0, 6) || "Unknown"}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(delivery.delivered_at || delivery.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">DELIVERED</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>{delivery.restaurant_contact?.name || "Restaurant"}</span>
                        <span className="font-medium">${(delivery.order?.total_price || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{delivery.actual_delivery_time || "30"} mins</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                          <DollarSign className="h-3 w-3" />
                          <span>${((delivery.order?.total_price || 0) * 0.15).toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
