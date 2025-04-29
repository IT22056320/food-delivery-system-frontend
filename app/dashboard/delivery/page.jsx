"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { MapPin, Clock, Navigation, CheckCircle, XCircle, Package, TrendingUp, LogOut } from "lucide-react"
import DeliveryMap from "@/components/delivery-map"
import { getActiveDeliveries, getDeliveryHistory, updateDeliveryStatus } from "@/lib/delivery-api"

export default function DeliveryDashboard() {
    const { user, loading, logout } = useAuth()
    const router = useRouter()
    const [activeDeliveries, setActiveDeliveries] = useState([])
    const [availableDeliveries, setAvailableDeliveries] = useState([])
    const [deliveryHistory, setDeliveryHistory] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentLocation, setCurrentLocation] = useState(null)
    const [selectedDelivery, setSelectedDelivery] = useState(null)
    const [stats, setStats] = useState({
        totalDeliveries: 0,
        completedToday: 0,
        earnings: 0,
        avgRating: 4.8,
    })

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
            return
        }

        if (!loading && user && user.role !== "delivery_person") {
            toast.error("You don't have access to the delivery dashboard")
            router.push("/dashboard/user")
            return
        }

        if (!loading && user) {
            fetchDeliveries()
            startLocationTracking()
        }
    }, [loading, user, router])

    // Update the fetchDeliveries function to also fetch real orders that are ready for pickup
    const fetchDeliveries = async () => {
        try {
            setIsLoading(true)

            // Fetch active deliveries assigned to this delivery person
            const activeData = await getActiveDeliveries(user.id)
            setActiveDeliveries(activeData)

            // Fetch available deliveries that haven't been assigned yet
            // This includes both demo orders and real orders marked as READY_FOR_PICKUP
            try {
                // First get real orders that are ready for pickup
                const response = await fetch("http://localhost:5002/api/orders/ready-for-pickup", {
                    credentials: "include",
                })

                let realAvailableOrders = []
                if (response.ok) {
                    const readyOrders = await response.json()

                    // Transform order data to delivery format
                    realAvailableOrders = readyOrders.map((order) => ({
                        _id: `order-${order._id}`,
                        order_id: order._id,
                        restaurant_contact: {
                            name: order.restaurant_name || "Restaurant",
                            phone: order.restaurant_phone || "Not available",
                        },
                        pickup_location: {
                            address: order.restaurant_address || "Restaurant Address",
                            coordinates: order.restaurant_coordinates || { lat: 6.9271, lng: 79.8612 },
                        },
                        delivery_location: {
                            address: order.delivery_address || "Delivery Address",
                            coordinates: order.delivery_coordinates || { lat: 6.932, lng: 79.857 },
                        },
                        order: {
                            total_price: order.total_price,
                            items: order.items ? order.items.length : 1,
                        },
                        estimated_delivery_time: 30,
                        created_at: order.createdAt || new Date().toISOString(),
                        isRealOrder: true, // Flag to identify real orders
                    }))
                }

                // Add some demo orders for testing
                const demoOrders = [
                    {
                        _id: "avail1",
                        order_id: "ord123456",
                        restaurant_contact: { name: "Burger Palace" },
                        pickup_location: {
                            address: "123 Main St, City",
                            coordinates: { lat: 6.9271, lng: 79.8612 },
                        },
                        delivery_location: {
                            address: "456 Park Ave, City",
                            coordinates: { lat: 6.932, lng: 79.857 },
                        },
                        order: { total_price: 24.99, items: 3 },
                        estimated_delivery_time: 30,
                        created_at: new Date().toISOString(),
                        isRealOrder: false, // Flag to identify demo orders
                    },
                    {
                        _id: "avail2",
                        order_id: "ord789012",
                        restaurant_contact: { name: "Pizza Heaven" },
                        pickup_location: {
                            address: "789 Oak St, City",
                            coordinates: { lat: 6.91, lng: 79.87 },
                        },
                        delivery_location: {
                            address: "101 Pine Rd, City",
                            coordinates: { lat: 6.915, lng: 79.875 },
                        },
                        order: { total_price: 32.5, items: 2 },
                        estimated_delivery_time: 25,
                        created_at: new Date(Date.now() - 15 * 60000).toISOString(),
                        isRealOrder: false, // Flag to identify demo orders
                    }, {
                        _id: "avail3",
                        order_id: "ord345678",
                        restaurant_contact: {
                            name: "Upali's by Nawaloka",
                            phone: "+94 11 2 320 711"
                        },
                        pickup_location: {
                            address: "65 D.R. Wijewardena Mawatha, Colombo 00100, Sri Lanka",
                            coordinates: { lat: 6.9337, lng: 79.8567 },
                        },
                        delivery_location: {
                            address: "25 Galle Face Center Rd, Colombo 00200, Sri Lanka",
                            coordinates: { lat: 6.9271, lng: 79.8430 },
                        },
                        order: { total_price: 45.75, items: 4 },
                        estimated_delivery_time: 35,
                        created_at: new Date(Date.now() - 5 * 60000).toISOString(),
                        isRealOrder: false,
                    },
                    // Ministry of Crab to Hilton Colombo
                    {
                        _id: "avail4",
                        order_id: "ord456789",
                        restaurant_contact: {
                            name: "Ministry of Crab",
                            phone: "+94 11 2 342 722"
                        },
                        pickup_location: {
                            address: "Old Dutch Hospital, 04 Hospital St, Colombo, Sri Lanka",
                            coordinates: { lat: 6.9350, lng: 79.8403 },
                        },
                        delivery_location: {
                            address: "2 Sir Chittampalam A Gardiner Mawatha, Colombo 00200, Sri Lanka",
                            coordinates: { lat: 6.9312, lng: 79.8473 },
                        },
                        order: { total_price: 89.50, items: 3 },
                        estimated_delivery_time: 20,
                        created_at: new Date(Date.now() - 8 * 60000).toISOString(),
                        isRealOrder: false
                    },
                    // Kaema Sutra to Cinnamon Grand
                    {
                        _id: "avail5",
                        order_id: "ord567890",
                        restaurant_contact: {
                            name: "Kaema Sutra",
                            phone: "+94 11 2 497 377"
                        },
                        pickup_location: {
                            address: "Shangri-La Hotel, 1 Galle Face, Colombo, Sri Lanka",
                            coordinates: { lat: 6.9280, lng: 79.8443 },
                        },
                        delivery_location: {
                            address: "77 Galle Rd, Colombo 00300, Sri Lanka",
                            coordinates: { lat: 6.9195, lng: 79.8512 },
                        },
                        order: { total_price: 67.25, items: 5 },
                        estimated_delivery_time: 30,
                        created_at: new Date(Date.now() - 10 * 60000).toISOString(),
                        isRealOrder: false
                    },
                    // Cafe Kumbuk to Independence Square
                    {
                        _id: "avail6",
                        order_id: "ord678901",
                        restaurant_contact: {
                            name: "Cafe Kumbuk",
                            phone: "+94 77 200 1586"
                        },
                        pickup_location: {
                            address: "No 44/1 Horton Place, Colombo 00700, Sri Lanka",
                            coordinates: { lat: 6.9068, lng: 79.8643 },
                        },
                        delivery_location: {
                            address: "Independence Square, Colombo 00700, Sri Lanka",
                            coordinates: { lat: 6.9068, lng: 79.8683 },
                        },
                        order: { total_price: 29.95, items: 2 },
                        estimated_delivery_time: 15,
                        created_at: new Date(Date.now() - 3 * 60000).toISOString(),
                        isRealOrder: false
                    }
                ]

                // Combine real and demo orders
                setAvailableDeliveries([...realAvailableOrders, ...demoOrders])
            } catch (error) {
                console.error("Error fetching available orders:", error)
                // Fall back to demo orders if real orders can't be fetched
                setAvailableDeliveries([
                    {
                        _id: "avail1",
                        order_id: "ord123456",
                        restaurant_contact: { name: "Burger Palace" },
                        pickup_location: {
                            address: "123 Main St, City",
                            coordinates: { lat: 6.9271, lng: 79.8612 },
                        },
                        delivery_location: {
                            address: "456 Park Ave, City",
                            coordinates: { lat: 6.932, lng: 79.857 },
                        },
                        order: { total_price: 24.99, items: 3 },
                        estimated_delivery_time: 30,
                        created_at: new Date().toISOString(),
                        isRealOrder: false,
                    },
                    {
                        _id: "avail2",
                        order_id: "ord789012",
                        restaurant_contact: { name: "Pizza Heaven" },
                        pickup_location: {
                            address: "789 Oak St, City",
                            coordinates: { lat: 6.91, lng: 79.87 },
                        },
                        delivery_location: {
                            address: "101 Pine Rd, City",
                            coordinates: { lat: 6.915, lng: 79.875 },
                        },
                        order: { total_price: 32.5, items: 2 },
                        estimated_delivery_time: 25,
                        created_at: new Date(Date.now() - 15 * 60000).toISOString(),
                        isRealOrder: false,
                    },
                ])
            }

            // Fetch delivery history
            const historyData = await getDeliveryHistory(user.id)
            setDeliveryHistory(historyData)

            // Calculate stats
            const totalCompleted = historyData.length
            const today = new Date().toDateString()
            const completedToday = historyData.filter((d) => new Date(d.delivered_at).toDateString() === today).length

            const totalEarnings = historyData.reduce((sum, delivery) => {
                // Assuming delivery person gets 80% of the delivery fee (which is 10% of order total)
                const deliveryFee = delivery.order.total_price * 0.1
                const earnings = deliveryFee * 0.8
                return sum + earnings
            }, 0)

            setStats({
                totalDeliveries: totalCompleted,
                completedToday,
                earnings: totalEarnings.toFixed(2),
                avgRating: 4.8, // Placeholder - would come from actual ratings
            })
        } catch (error) {
            console.error("Error fetching deliveries:", error)
            toast.error("Failed to load deliveries")
        } finally {
            setIsLoading(false)
        }
    }

    const startLocationTracking = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser")
            return
        }

        // Get current position once
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setCurrentLocation({
                    lat: latitude,
                    lng: longitude,
                })
            },
            (error) => {
                console.error("Error getting location:", error)
                toast.error("Failed to get your current location. Please check your device settings.")
            },
        )

        // Set up continuous tracking
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setCurrentLocation({
                    lat: latitude,
                    lng: longitude,
                })

                // If there's a selected delivery, update its location on the server
                if (selectedDelivery) {
                    updateDeliveryLocation(selectedDelivery._id, latitude, longitude)
                }
            },
            (error) => {
                console.error("Error tracking location:", error)
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 10000,
            },
        )

        // Clean up on component unmount
        return () => {
            navigator.geolocation.clearWatch(watchId)
        }
    }

    const updateDeliveryLocation = async (deliveryId, lat, lng) => {
        try {
            await fetch(`http://localhost:5003/api/deliveries/${deliveryId}/location`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ lat, lng }),
            })
        } catch (error) {
            console.error("Error updating location:", error)
        }
    }

    // Update the handleAcceptDelivery function to handle both real and demo orders
    const handleAcceptDelivery = async (deliveryId) => {
        try {
            // Find the delivery from available list
            const delivery = availableDeliveries.find((d) => d._id === deliveryId)

            if (!delivery) {
                toast.error("Delivery not found")
                return
            }

            if (delivery.isRealOrder) {
                // For real orders, create a delivery in the delivery service
                const response = await fetch("http://localhost:5003/api/deliveries", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        order_id: delivery.order_id,
                        pickup_location: delivery.pickup_location,
                        delivery_location: delivery.delivery_location,
                        customer_contact: delivery.customer_contact || { name: "Customer", phone: "Not available" },
                        restaurant_contact: delivery.restaurant_contact,
                        order: delivery.order,
                    }),
                })

                if (!response.ok) {
                    throw new Error("Failed to create delivery")
                }

                const newDelivery = await response.json()

                // Update the order status to IN_PROGRESS
                await fetch(`http://localhost:5002/api/orders/${delivery.order_id}/status`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ status: "OUT_FOR_DELIVERY" }),
                })

                // Assign the delivery to this delivery person
                await fetch(`http://localhost:5003/api/deliveries/${newDelivery._id}/assign`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        delivery_person_id: user.id,
                        delivery_person_name: user.name,
                    }),
                })

                toast.success("Delivery accepted!")

                // Add the new delivery to active deliveries
                setActiveDeliveries((prev) => [
                    ...prev,
                    {
                        ...newDelivery,
                        status: "ASSIGNED",
                        assigned_at: new Date().toISOString(),
                        delivery_person_id: user.id,
                    },
                ])

                // Select this delivery to show on map
                setSelectedDelivery({
                    ...newDelivery,
                    status: "ASSIGNED",
                    assigned_at: new Date().toISOString(),
                    delivery_person_id: user.id,
                })
            } else {
                // For demo orders, just update the UI
                toast.success("Demo delivery accepted!")

                // Move from available to active
                setAvailableDeliveries((prev) => prev.filter((d) => d._id !== deliveryId))
                setActiveDeliveries((prev) => [
                    ...prev,
                    {
                        ...delivery,
                        status: "ASSIGNED",
                        assigned_at: new Date().toISOString(),
                        delivery_person_id: user.id,
                    },
                ])

                // Select this delivery to show on map
                setSelectedDelivery({
                    ...delivery,
                    status: "ASSIGNED",
                    assigned_at: new Date().toISOString(),
                    delivery_person_id: user.id,
                })
            }

            // Remove from available deliveries list
            setAvailableDeliveries((prev) => prev.filter((d) => d._id !== deliveryId))
        } catch (error) {
            console.error("Error accepting delivery:", error)
            toast.error("Failed to accept delivery")
        }
    }

    const handleRejectDelivery = (deliveryId) => {
        // In a real app, this would call an API to reject the delivery
        setAvailableDeliveries((prev) => prev.filter((d) => d._id !== deliveryId))
        toast.info("Delivery rejected")
    }

    const handleUpdateStatus = async (deliveryId, newStatus) => {
        try {
            await updateDeliveryStatus(deliveryId, newStatus)

            // Update the delivery in our state
            setActiveDeliveries((prev) =>
                prev.map((d) =>
                    d._id === deliveryId
                        ? {
                            ...d,
                            status: newStatus,
                            ...(newStatus === "PICKED_UP" ? { picked_up_at: new Date().toISOString() } : {}),
                            ...(newStatus === "DELIVERED" ? { delivered_at: new Date().toISOString() } : {}),
                        }
                        : d,
                ),
            )

            // If the selected delivery is being updated, update it too
            if (selectedDelivery && selectedDelivery._id === deliveryId) {
                setSelectedDelivery((prev) => ({
                    ...prev,
                    status: newStatus,
                    ...(newStatus === "PICKED_UP" ? { picked_up_at: new Date().toISOString() } : {}),
                    ...(newStatus === "DELIVERED" ? { delivered_at: new Date().toISOString() } : {}),
                }))
            }

            // If delivery is completed, refresh the data
            if (newStatus === "DELIVERED") {
                toast.success("Delivery completed successfully!")
                fetchDeliveries()
            } else {
                toast.success(`Delivery status updated to ${newStatus.replace(/_/g, " ")}`)
            }
        } catch (error) {
            console.error("Error updating delivery status:", error)
            toast.error("Failed to update delivery status")
        }
    }

    const handleSelectDelivery = (delivery) => {
        setSelectedDelivery(delivery)
    }

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading delivery dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left column - Deliveries list */}
                    <div className="w-full md:w-1/3">
                        <div className="mb-6 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Delivery Dashboard</h1>
                                <p className="text-gray-600">Welcome back, {user?.name || "Delivery Partner"}</p>
                            </div>
                            <Button
                                variant="outline"
                                className="border-orange-500 text-orange-500 hover:bg-orange-50"
                                onClick={logout}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>

                        {/* Stats cards */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <Card className="bg-white border-none shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Today's Deliveries</p>
                                            <p className="text-2xl font-bold">{stats.completedToday}</p>
                                        </div>
                                        <Package className="h-8 w-8 text-orange-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-none shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Earnings</p>
                                            <p className="text-2xl font-bold">${stats.earnings}</p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Tabs defaultValue="active" className="w-full">
                            <TabsList className="grid grid-cols-3 mb-4">
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="available">Available</TabsTrigger>
                                <TabsTrigger value="history">History</TabsTrigger>
                            </TabsList>

                            <TabsContent value="active" className="space-y-4">
                                {activeDeliveries.length === 0 ? (
                                    <Card className="border-none shadow-md">
                                        <CardContent className="p-6 text-center">
                                            <p className="text-gray-500">No active deliveries</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    activeDeliveries.map((delivery) => (
                                        <Card
                                            key={delivery._id}
                                            className={`border-none shadow-md cursor-pointer transition-all ${selectedDelivery?._id === delivery._id ? "ring-2 ring-orange-500" : ""
                                                }`}
                                            onClick={() => handleSelectDelivery(delivery)}
                                        >
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-base">Order #{delivery.order_id.substring(0, 6)}</CardTitle>
                                                    <Badge
                                                        className={
                                                            delivery.status === "DELIVERED"
                                                                ? "bg-green-100 text-green-700"
                                                                : delivery.status === "PICKED_UP"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-amber-100 text-amber-700"
                                                        }
                                                    >
                                                        {delivery.status.replace(/_/g, " ")}
                                                    </Badge>
                                                </div>
                                                <CardDescription>{delivery.restaurant_contact?.name || "Restaurant"}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-2">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium">Pickup</p>
                                                            <p className="text-gray-500 truncate">{delivery.pickup_location?.address}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium">Delivery</p>
                                                            <p className="text-gray-500 truncate">{delivery.delivery_location?.address}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="p-4 pt-0">
                                                <div className="w-full space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                                            <span>
                                                                {delivery.estimated_delivery_time
                                                                    ? `${delivery.estimated_delivery_time} min`
                                                                    : "30 min"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">${delivery.order?.total_price.toFixed(2)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        {delivery.status === "ASSIGNED" && (
                                                            <Button
                                                                className="w-full bg-orange-500 hover:bg-orange-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleUpdateStatus(delivery._id, "PICKED_UP")
                                                                }}
                                                            >
                                                                Mark as Picked Up
                                                            </Button>
                                                        )}

                                                        {delivery.status === "PICKED_UP" && (
                                                            <Button
                                                                className="w-full bg-green-500 hover:bg-green-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleUpdateStatus(delivery._id, "DELIVERED")
                                                                }}
                                                            >
                                                                Complete Delivery
                                                            </Button>
                                                        )}

                                                        {delivery.status === "DELIVERED" && (
                                                            <Button variant="outline" className="w-full" disabled>
                                                                Completed
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="available" className="space-y-4">
                                {availableDeliveries.length === 0 ? (
                                    <Card className="border-none shadow-md">
                                        <CardContent className="p-6 text-center">
                                            <p className="text-gray-500">No available deliveries</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    availableDeliveries.map((delivery) => (
                                        <Card key={delivery._id} className="border-none shadow-md">
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-base">Order #{delivery.order_id.substring(0, 6)}</CardTitle>
                                                    <Badge className="bg-blue-100 text-blue-700">New Order</Badge>
                                                </div>
                                                <CardDescription>{delivery.restaurant_contact?.name || "Restaurant"}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-2">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium">Pickup</p>
                                                            <p className="text-gray-500 truncate">{delivery.pickup_location?.address}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium">Delivery</p>
                                                            <p className="text-gray-500 truncate">{delivery.delivery_location?.address}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="p-4 pt-0">
                                                <div className="w-full space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                                            <span>
                                                                {delivery.estimated_delivery_time
                                                                    ? `${delivery.estimated_delivery_time} min`
                                                                    : "30 min"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">${delivery.order?.total_price.toFixed(2)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            className="flex-1 bg-green-500 hover:bg-green-600"
                                                            onClick={() => handleAcceptDelivery(delivery._id)}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" /> Accept
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1"
                                                            onClick={() => handleRejectDelivery(delivery._id)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" /> Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="space-y-4">
                                {deliveryHistory.length === 0 ? (
                                    <Card className="border-none shadow-md">
                                        <CardContent className="p-6 text-center">
                                            <p className="text-gray-500">No delivery history</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    deliveryHistory.map((delivery) => (
                                        <Card key={delivery._id} className="border-none shadow-md">
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-base">Order #{delivery.order_id.substring(0, 6)}</CardTitle>
                                                    <Badge className="bg-green-100 text-green-700">{delivery.status}</Badge>
                                                </div>
                                                <CardDescription>
                                                    {new Date(delivery.delivered_at || delivery.createdAt).toLocaleDateString()}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-2">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span>{delivery.restaurant_contact?.name || "Restaurant"}</span>
                                                        <span className="font-medium">${delivery.order?.total_price.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                                        <p className="text-gray-500 truncate">{delivery.delivery_location?.address}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right column - Map and delivery details */}
                    <div className="w-full md:w-2/3">
                        <Card className="border-none shadow-md h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] overflow-hidden">
                            <CardContent className="p-0 h-full flex flex-col">
                                {selectedDelivery ? (
                                    <>
                                        <div className="h-[60%] relative">
                                            <DeliveryMap
                                                deliveryId={selectedDelivery._id}
                                                pickupLocation={selectedDelivery.pickup_location}
                                                deliveryLocation={selectedDelivery.delivery_location}
                                                currentLocation={currentLocation}
                                                isDeliveryPerson={true}
                                                className="h-full w-full"
                                            />

                                            <div className="absolute bottom-4 right-4">
                                                <Button
                                                    className="bg-white text-gray-800 hover:bg-gray-100 shadow-md"
                                                    onClick={() => {
                                                        // Open Google Maps navigation
                                                        const destination =
                                                            selectedDelivery.status === "ASSIGNED"
                                                                ? selectedDelivery.pickup_location?.address
                                                                : selectedDelivery.delivery_location?.address

                                                        const encodedDestination = encodeURIComponent(destination)
                                                        window.open(
                                                            `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`,
                                                            "_blank",
                                                        )
                                                    }}
                                                >
                                                    <Navigation className="h-4 w-4 mr-2" /> Navigate
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="p-6 flex-1 overflow-y-auto">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h2 className="text-xl font-bold">Order #{selectedDelivery.order_id.substring(0, 6)}</h2>
                                                    <p className="text-gray-500">{selectedDelivery.restaurant_contact?.name}</p>
                                                </div>
                                                <Badge
                                                    className={
                                                        selectedDelivery.status === "DELIVERED"
                                                            ? "bg-green-100 text-green-700"
                                                            : selectedDelivery.status === "PICKED_UP"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-amber-100 text-amber-700"
                                                    }
                                                >
                                                    {selectedDelivery.status.replace(/_/g, " ")}
                                                </Badge>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Delivery progress */}
                                                <div>
                                                    <h3 className="text-lg font-medium mb-4">Delivery Progress</h3>
                                                    <div className="relative">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200"></div>
                                                        <div
                                                            className="absolute left-0 top-0 w-1 bg-green-500 transition-all duration-500"
                                                            style={{
                                                                height:
                                                                    selectedDelivery.status === "DELIVERED"
                                                                        ? "100%"
                                                                        : selectedDelivery.status === "PICKED_UP"
                                                                            ? "50%"
                                                                            : "25%",
                                                            }}
                                                        ></div>

                                                        <div className="space-y-8 relative">
                                                            <div className="flex items-start pl-6">
                                                                <div
                                                                    className={`absolute left-0 top-1 h-4 w-4 rounded-full ${selectedDelivery.status ? "bg-green-500" : "bg-gray-300"
                                                                        }`}
                                                                ></div>
                                                                <div>
                                                                    <h4 className="font-medium">Order Assigned</h4>
                                                                    <p className="text-sm text-gray-500">
                                                                        {selectedDelivery.assigned_at
                                                                            ? new Date(selectedDelivery.assigned_at).toLocaleString()
                                                                            : "Pending"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start pl-6">
                                                                <div
                                                                    className={`absolute left-0 top-1 h-4 w-4 rounded-full ${selectedDelivery.status === "PICKED_UP" || selectedDelivery.status === "DELIVERED"
                                                                        ? "bg-green-500"
                                                                        : "bg-gray-300"
                                                                        }`}
                                                                ></div>
                                                                <div>
                                                                    <h4 className="font-medium">Food Picked Up</h4>
                                                                    <p className="text-sm text-gray-500">
                                                                        {selectedDelivery.picked_up_at
                                                                            ? new Date(selectedDelivery.picked_up_at).toLocaleString()
                                                                            : "Pending"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start pl-6">
                                                                <div
                                                                    className={`absolute left-0 top-1 h-4 w-4 rounded-full ${selectedDelivery.status === "DELIVERED" ? "bg-green-500" : "bg-gray-300"
                                                                        }`}
                                                                ></div>
                                                                <div>
                                                                    <h4 className="font-medium">Delivered</h4>
                                                                    <p className="text-sm text-gray-500">
                                                                        {selectedDelivery.delivered_at
                                                                            ? new Date(selectedDelivery.delivered_at).toLocaleString()
                                                                            : "Pending"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Delivery details */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h3 className="text-lg font-medium mb-3">Pickup Details</h3>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="text-sm text-gray-500">Restaurant</p>
                                                                <p className="font-medium">{selectedDelivery.restaurant_contact?.name}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Address</p>
                                                                <p className="font-medium">{selectedDelivery.pickup_location?.address}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Phone</p>
                                                                <p className="font-medium">
                                                                    {selectedDelivery.restaurant_contact?.phone || "Not available"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-lg font-medium mb-3">Delivery Details</h3>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="text-sm text-gray-500">Customer</p>
                                                                <p className="font-medium">{selectedDelivery.customer_contact?.name || "Customer"}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Address</p>
                                                                <p className="font-medium">{selectedDelivery.delivery_location?.address}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Phone</p>
                                                                <p className="font-medium">
                                                                    {selectedDelivery.customer_contact?.phone || "Not available"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Order details */}
                                                <div>
                                                    <h3 className="text-lg font-medium mb-3">Order Details</h3>
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Items</p>
                                                            <p className="font-medium">{selectedDelivery.order?.items || 0} items</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Order Total</p>
                                                            <p className="font-medium">${selectedDelivery.order?.total_price.toFixed(2) || "0.00"}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Delivery Fee</p>
                                                            <p className="font-medium">
                                                                ${(selectedDelivery.order?.total_price * 0.1).toFixed(2) || "0.00"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action buttons */}
                                                <div className="flex gap-3 mt-6">
                                                    {selectedDelivery.status === "ASSIGNED" && (
                                                        <Button
                                                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                                                            onClick={() => handleUpdateStatus(selectedDelivery._id, "PICKED_UP")}
                                                        >
                                                            Mark as Picked Up
                                                        </Button>
                                                    )}

                                                    {selectedDelivery.status === "PICKED_UP" && (
                                                        <Button
                                                            className="flex-1 bg-green-500 hover:bg-green-600"
                                                            onClick={() => handleUpdateStatus(selectedDelivery._id, "DELIVERED")}
                                                        >
                                                            Complete Delivery
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => {
                                                            const destination =
                                                                selectedDelivery.status === "ASSIGNED"
                                                                    ? selectedDelivery.pickup_location?.address
                                                                    : selectedDelivery.delivery_location?.address

                                                            const encodedDestination = encodeURIComponent(destination)
                                                            window.open(
                                                                `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`,
                                                                "_blank",
                                                            )
                                                        }}
                                                    >
                                                        <Navigation className="h-4 w-4 mr-2" /> Navigate
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center p-6">
                                            <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <MapPin className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">No Delivery Selected</h3>
                                            <p className="text-sm text-gray-500 max-w-md">
                                                Select an active delivery from the list to view details and track on the map.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
