"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, Clock, Truck } from "lucide-react"
import { toast } from "sonner"
import DeliveryMap from "@/components/delivery-map"

const DeliveryTracker = ({ delivery, order }) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [estimatedTime, setEstimatedTime] = useState(null)
    const [deliveryData, setDeliveryData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDeliveryData = async () => {
            try {
                setIsLoading(true)

                // If we already have delivery data from the order
                if (delivery) {
                    setDeliveryData(delivery)
                    determineCurrentStep(delivery)
                    setIsLoading(false)
                    return
                }

                // If we have an order but no delivery data, fetch it
                if (order && order._id) {
                    const response = await fetch(`http://localhost:5003/api/deliveries/by-order/${order._id}`, {
                        credentials: "include",
                    })

                    if (response.ok) {
                        const data = await response.json()
                        setDeliveryData(data)
                        determineCurrentStep(data)
                    }
                }
            } catch (error) {
                console.error("Error fetching delivery data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDeliveryData()
    }, [delivery, order])

    // Determine the current step based on delivery status
    const determineCurrentStep = (deliveryData) => {
        if (!deliveryData) return 0

        const statusMap = {
            PENDING: 0,
            ASSIGNED: 1,
            PICKED_UP: 2,
            IN_TRANSIT: 2,
            DELIVERED: 3,
            CANCELLED: -1,
        }

        setCurrentStep(statusMap[deliveryData.status] || 0)
    }

    // Handle view tracking button click
    const handleViewTracking = () => {
        if (deliveryData && deliveryData._id) {
            window.location.href = `/dashboard/user/${deliveryData._id}/track`
        } else {
            toast.error("Tracking information is not available yet")
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    if (!deliveryData && !order) {
        return (
            <div className="text-center py-6">
                <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No delivery information available yet</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Delivery Status</h3>

            {/* Delivery Progress Steps */}
            <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200"></div>
                <div
                    className="absolute left-0 top-0 w-1 bg-green-500 transition-all duration-500"
                    style={{ height: `${(currentStep / 3) * 100}%` }}
                ></div>

                <div className="space-y-8 relative">
                    <div className="flex items-start pl-6">
                        <div
                            className={`absolute left-0 top-1 h-4 w-4 rounded-full ${currentStep >= 0 ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <div>
                            <h4 className="font-medium">Order Confirmed</h4>
                            <p className="text-sm text-gray-500">
                                {order?.createdAt ? new Date(order.createdAt).toLocaleString() : "Processing"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start pl-6">
                        <div
                            className={`absolute left-0 top-1 h-4 w-4 rounded-full ${currentStep >= 1 ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <div>
                            <h4 className="font-medium">Delivery Assigned</h4>
                            <p className="text-sm text-gray-500">
                                {deliveryData?.assigned_at ? new Date(deliveryData.assigned_at).toLocaleString() : "Waiting for driver"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start pl-6">
                        <div
                            className={`absolute left-0 top-1 h-4 w-4 rounded-full ${currentStep >= 2 ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <div>
                            <h4 className="font-medium">On The Way</h4>
                            <p className="text-sm text-gray-500">
                                {deliveryData?.picked_up_at ? new Date(deliveryData.picked_up_at).toLocaleString() : "Pending"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start pl-6">
                        <div
                            className={`absolute left-0 top-1 h-4 w-4 rounded-full ${currentStep >= 3 ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <div>
                            <h4 className="font-medium">Delivered</h4>
                            <p className="text-sm text-gray-500">
                                {deliveryData?.delivered_at ? new Date(deliveryData.delivered_at).toLocaleString() : "Pending"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Preview */}
            {deliveryData &&
                (deliveryData.status === "ASSIGNED" ||
                    deliveryData.status === "PICKED_UP" ||
                    deliveryData.status === "IN_TRANSIT") && (
                    <div className="space-y-4">
                        <div className="h-[200px] w-full rounded-lg overflow-hidden">
                            <DeliveryMap
                                deliveryId={deliveryData._id}
                                pickupLocation={deliveryData.pickup_location}
                                deliveryLocation={deliveryData.delivery_location}
                                className="h-full w-full"
                            />
                        </div>

                        <Button onClick={handleViewTracking} className="w-full bg-orange-500 hover:bg-orange-600">
                            <Navigation className="h-4 w-4 mr-2" />
                            Track Delivery in Real-Time
                        </Button>
                    </div>
                )}

            {/* Delivery Info */}
            {deliveryData && (
                <Card className="bg-gray-50 border-none">
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">Delivery Address</p>
                                    <p className="text-sm text-gray-600">{deliveryData.delivery_location?.address}</p>
                                </div>
                            </div>

                            {deliveryData.estimated_delivery_time && (
                                <div className="flex items-start gap-2">
                                    <Clock className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-sm">Estimated Delivery Time</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(deliveryData.estimated_delivery_time).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {deliveryData.delivery_person_name && (
                                <div className="flex items-start gap-2">
                                    <Truck className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-sm">Delivery Person</p>
                                        <p className="text-sm text-gray-600">{deliveryData.delivery_person_name}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default DeliveryTracker
