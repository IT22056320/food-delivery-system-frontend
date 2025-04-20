"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Phone, User, Navigation, CheckCircle, AlertCircle } from "lucide-react"
import DeliveryMap from "@/components/delivery-map"
import { updateDeliveryStatus, getDeliveryLocation } from "@/lib/delivery-api"
import { toast } from "sonner"

export default function DeliveryTracker({ delivery, isDeliveryPerson = false, onStatusUpdate = () => { } }) {
    const [currentLocation, setCurrentLocation] = useState(null)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    // Get initial delivery location
    useEffect(() => {
        if (!delivery || !delivery._id) return

        const fetchLocation = async () => {
            try {
                const locationData = await getDeliveryLocation(delivery._id)
                if (locationData && locationData.location) {
                    setCurrentLocation(locationData.location)
                }
            } catch (error) {
                console.error("Error fetching delivery location:", error)
            }
        }

        fetchLocation()
    }, [delivery])

    const handleLocationUpdate = (location) => {
        setCurrentLocation(location)
    }

    const handleStatusUpdate = async (newStatus) => {
        if (!delivery || !delivery._id) return

        setIsUpdatingStatus(true)
        try {
            await updateDeliveryStatus(delivery._id, newStatus)
            toast.success(`Delivery status updated to ${newStatus.replace(/_/g, " ")}`)
            onStatusUpdate(newStatus)
        } catch (error) {
            console.error("Error updating delivery status:", error)
            toast.error("Failed to update delivery status")
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    if (!delivery) {
        return (
            <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                    <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700">No active delivery selected</p>
                    <p className="text-sm text-gray-500 text-center mt-2">
                        Select an active delivery from the list to view details and track progress
                    </p>
                </CardContent>
            </Card>
        )
    }

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "PENDING_ASSIGNMENT":
                return "bg-gray-100 text-gray-700"
            case "ASSIGNED":
                return "bg-blue-100 text-blue-700"
            case "PICKED_UP":
                return "bg-amber-100 text-amber-700"
            case "IN_TRANSIT":
                return "bg-purple-100 text-purple-700"
            case "DELIVERED":
                return "bg-green-100 text-green-700"
            case "CANCELLED":
            case "FAILED":
                return "bg-red-100 text-red-700"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    const getNextStatusOptions = () => {
        switch (delivery.status) {
            case "ASSIGNED":
                return [
                    { value: "PICKED_UP", label: "Picked Up", color: "bg-amber-500 hover:bg-amber-600" },
                    { value: "CANCELLED", label: "Cancel", color: "bg-red-500 hover:bg-red-600" },
                ]
            case "PICKED_UP":
                return [
                    { value: "IN_TRANSIT", label: "In Transit", color: "bg-purple-500 hover:bg-purple-600" },
                    { value: "CANCELLED", label: "Cancel", color: "bg-red-500 hover:bg-red-600" },
                ]
            case "IN_TRANSIT":
                return [
                    { value: "DELIVERED", label: "Delivered", color: "bg-green-500 hover:bg-green-600" },
                    { value: "FAILED", label: "Failed", color: "bg-red-500 hover:bg-red-600" },
                ]
            default:
                return []
        }
    }

    return (
        <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle>Delivery Tracker</CardTitle>
                    <Badge className={getStatusBadgeColor(delivery.status)}>{delivery.status.replace(/_/g, " ")}</Badge>
                </div>
                <CardDescription>
                    Order #{delivery.order_id?.substring(0, 6) || "Unknown"} • {new Date(delivery.createdAt).toLocaleString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {/* Map */}
                <DeliveryMap
                    deliveryId={delivery._id}
                    pickupLocation={delivery.pickup_location}
                    deliveryLocation={delivery.delivery_location}
                    isDeliveryPerson={isDeliveryPerson}
                    onLocationUpdate={handleLocationUpdate}
                    className="h-[300px] w-full mb-4"
                />

                {/* Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pickup Location */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="mt-1">
                                <MapPin className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-medium text-blue-700">Pickup Location</h3>
                                <p className="text-sm text-gray-600 mt-1">{delivery.pickup_location?.address}</p>
                                {delivery.restaurant_contact && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="h-4 w-4" />
                                            <span>{delivery.restaurant_contact.name}</span>
                                        </div>
                                        {delivery.restaurant_contact.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                <Phone className="h-4 w-4" />
                                                <a href={`tel:${delivery.restaurant_contact.phone}`} className="text-blue-600">
                                                    {delivery.restaurant_contact.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Delivery Location */}
                    <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="mt-1">
                                <MapPin className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-medium text-green-700">Delivery Location</h3>
                                <p className="text-sm text-gray-600 mt-1">{delivery.delivery_location?.address}</p>
                                {delivery.customer_contact && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="h-4 w-4" />
                                            <span>{delivery.customer_contact.name}</span>
                                        </div>
                                        {delivery.customer_contact.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                <Phone className="h-4 w-4" />
                                                <a href={`tel:${delivery.customer_contact.phone}`} className="text-blue-600">
                                                    {delivery.customer_contact.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery Times */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-600">Estimated Time</p>
                                <p className="font-medium">{delivery.estimated_delivery_time || 30} minutes</p>
                            </div>
                        </div>
                    </div>
                    {delivery.actual_delivery_time && (
                        <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-600">Actual Time</p>
                                    <p className="font-medium">{delivery.actual_delivery_time} minutes</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Special Instructions */}
                {delivery.special_instructions && (
                    <div className="p-4 bg-amber-50 rounded-lg mt-4">
                        <h3 className="font-medium text-amber-700">Special Instructions</h3>
                        <p className="text-sm text-gray-600 mt-1">{delivery.special_instructions}</p>
                    </div>
                )}
            </CardContent>

            {/* Action Buttons for Delivery Person */}
            {isDeliveryPerson && getNextStatusOptions().length > 0 && (
                <CardFooter className="border-t pt-4 flex flex-wrap gap-2">
                    {getNextStatusOptions().map((option) => (
                        <Button
                            key={option.value}
                            className={option.color}
                            disabled={isUpdatingStatus}
                            onClick={() => handleStatusUpdate(option.value)}
                        >
                            {option.value === "DELIVERED" && <CheckCircle className="mr-2 h-4 w-4" />}
                            {option.value === "IN_TRANSIT" && <Navigation className="mr-2 h-4 w-4" />}
                            {option.label}
                        </Button>
                    ))}
                </CardFooter>
            )}
        </Card>
    )
}
