"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { trackDelivery } from "@/lib/delivery-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MapPin, Phone, Clock, MessageSquare } from 'lucide-react'
import { toast } from "sonner"
import DeliveryMap from "@/components/delivery-map"

export default function TrackDeliveryPage() {
    const { user, loading } = useAuth()
    const params = useParams()
    const router = useRouter()
    const { id } = params

    const [delivery, setDelivery] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [refreshInterval, setRefreshInterval] = useState(null)

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
        }
    }, [user, loading, router])

    useEffect(() => {
        if (id && !loading) {
            fetchDeliveryData()

            // Set up polling for real-time updates
            const interval = setInterval(fetchDeliveryData, 15000) // Update every 15 seconds
            setRefreshInterval(interval)

            return () => {
                if (refreshInterval) {
                    clearInterval(refreshInterval)
                }
            }
        }
    }, [id, loading])

    const fetchDeliveryData = async () => {
        try {
            setIsLoading(true)
            const data = await trackDelivery(id)
            setDelivery(data)
        } catch (error) {
            console.error("Error fetching delivery:", error)
            toast.error("Failed to load delivery tracking information")
        } finally {
            setIsLoading(false)
        }
    }

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading delivery information...</p>
                </div>
            </div>
        )
    }

    if (!delivery) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
                <div className="max-w-3xl mx-auto">
                    <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>

                    <Card className="border-none shadow-xl">
                        <CardContent className="p-8 text-center">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Delivery Not Found</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                We couldn't find the delivery you're looking for. It may have been completed or cancelled.
                            </p>
                            <Button onClick={() => router.push("/dashboard/user/orders")}>View All Orders</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const getStatusStep = () => {
        const statusMap = {
            ASSIGNED: 1,
            PICKED_UP: 2,
            IN_TRANSIT: 3,
            DELIVERED: 4,
        }
        return statusMap[delivery.status] || 0
    }

    const handleNavigate = () => {
        const destination = encodeURIComponent(delivery.delivery_location?.address)
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`

        window.open(googleMapsUrl, "_blank")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
            <div className="max-w-3xl mx-auto">
                <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
                </Button>

                <Card className="border-none shadow-xl mb-6">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle>Track Your Delivery</CardTitle>
                            <Badge
                                className={
                                    delivery.status === "DELIVERED"
                                        ? "bg-green-100 text-green-700"
                                        : delivery.status === "IN_TRANSIT"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-amber-100 text-amber-700"
                                }
                            >
                                {delivery.status.replace(/_/g, " ")}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Map */}
                            <div className="h-[300px] w-full rounded-lg overflow-hidden">
                                <DeliveryMap
                                    deliveryId={delivery._id}
                                    pickupLocation={delivery.pickup_location}
                                    deliveryLocation={delivery.delivery_location}
                                    isDeliveryPerson={false}
                                    className="h-full w-full"
                                />
                            </div>

                            {/* Delivery Progress */}
                            <div className="pt-4">
                                <h3 className="text-lg font-medium mb-4">Delivery Progress</h3>
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200"></div>
                                    <div
                                        className="absolute left-0 top-0 w-1 bg-green-500 transition-all duration-500"
                                        style={{ height: `${(getStatusStep() / 4) * 100}%` }}
                                    ></div>

                                    <div className="space-y-8 relative">
                                        <div className="flex items-start pl-6">
                                            <div
                                                className={`absolute left-0 top-1 h-4 w-4 rounded-full ${getStatusStep() >= 1 ? "bg-green-500" : "bg-gray-300"}`}
                                            ></div>
                                            <div>
                                                <h4 className="font-medium">Order Confirmed</h4>
                                                <p className="text-sm text-gray-500">
                                                    {delivery.assigned_at ? new Date(delivery.assigned_at).toLocaleString() : "Pending"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start pl-6">
                                            <div
                                                className={`absolute left-0 top-1 h-4 w-4 rounded-full ${getStatusStep() >= 2 ? "bg-green-500" : "bg-gray-300"}`}
                                            ></div>
                                            <div>
                                                <h4 className="font-medium">Food Picked Up</h4>
                                                <p className="text-sm text-gray-500">
                                                    {delivery.picked_up_at ? new Date(delivery.picked_up_at).toLocaleString() : "Pending"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start pl-6">
                                            <div
                                                className={`absolute left-0 top-1 h-4 w-4 rounded-full ${getStatusStep() >= 3 ? "bg-green-500" : "bg-gray-300"}`}
                                            ></div>
                                            <div>
                                                <h4 className="font-medium">On The Way</h4>
                                                <p className="text-sm text-gray-500">
                                                    {delivery.status === "IN_TRANSIT" ? "Your food is on the way!" : "Pending"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start pl-6">
                                            <div
                                                className={`absolute left-0 top-1 h-4 w-4 rounded-full ${getStatusStep() >= 4 ? "bg-green-500" : "bg-gray-300"}`}
                                            ></div>
                                            <div>
                                                <h4 className="font-medium">Delivered</h4>
                                                <p className="text-sm text-gray-500">
                                                    {delivery.delivered_at ? new Date(delivery.delivered_at).toLocaleString() : "Pending"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div>
                                    <h3 className="text-lg font-medium mb-3">Order Details</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Order ID</p>
                                            <p className="font-medium">#{delivery.order_id.substring(0, 8)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Restaurant</p>
                                            <p className="font-medium">{delivery.restaurant_contact?.name || "Restaurant"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Estimated Delivery Time</p>
                                            <p className="font-medium">{delivery.estimated_delivery_time || 30} minutes</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Delivery Address</p>
                                            <p className="font-medium">{delivery.delivery_location?.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-3">Delivery Person</h3>
                                    {delivery.delivery_person_id ? (
                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src="/placeholder.svg?height=50&width=50" />
                                                    <AvatarFallback className="bg-orange-200 text-orange-700">DP</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">Delivery Partner</p>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        <span>
                                                            {delivery.status === "IN_TRANSIT"
                                                                ? "On the way to your location"
                                                                : delivery.status === "DELIVERED"
                                                                    ? "Delivered your order"
                                                                    : "Preparing for delivery"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                                                    <Phone className="h-4 w-4" /> Call
                                                </Button>
                                                <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                                                    <MessageSquare className="h-4 w-4" /> Message
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <p className="text-gray-500">Delivery person not yet assigned</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

