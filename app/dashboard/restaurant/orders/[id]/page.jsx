"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getOrderById, updateOrderStatus } from "@/lib/restaurant-api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Pizza,
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    User,
    CreditCard,
    Truck,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from "lucide-react"

export default function OrderDetailsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const { id } = params

    const [isLoading, setIsLoading] = useState(true)
    const [order, setOrder] = useState(null)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        if (!loading && user?.role !== "restaurant_owner") {
            router.push("/")
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setIsLoading(true)
                const data = await getOrderById(id)
                setOrder(data)
            } catch (error) {
                toast.error("Failed to fetch order details")
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            fetchOrder()
        }
    }, [id])

    const handleUpdateStatus = async (newStatus) => {
        try {
            setIsUpdating(true)
            await updateOrderStatus(id, newStatus)

            // Update local state
            setOrder((prev) => ({
                ...prev,
                status: newStatus,
            }))

            toast.success(`Order status updated to ${newStatus.replace(/_/g, " ")}`)
        } catch (error) {
            toast.error("Failed to update order status")
            console.error(error)
        } finally {
            setIsUpdating(false)
        }
    }

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-700"
            case "accepted":
                return "bg-blue-100 text-blue-700"
            case "preparing":
                return "bg-indigo-100 text-indigo-700"
            case "ready":
                return "bg-purple-100 text-purple-700"
            case "out_for_delivery":
                return "bg-orange-100 text-orange-700"
            case "delivered":
                return "bg-green-100 text-green-700"
            case "cancelled":
                return "bg-red-100 text-red-700"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    const getNextStatus = (currentStatus) => {
        const statusFlow = {
            pending: "accepted",
            accepted: "preparing",
            preparing: "ready",
            ready: "out_for_delivery",
            out_for_delivery: "delivered",
        }
        return statusFlow[currentStatus] || null
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    const formatStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6 flex items-center justify-center">
                <div className="text-center">
                    <Pizza className="h-10 w-10 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-lg">Loading order details...</p>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2"
                            onClick={() => router.push("/dashboard/restaurant/orders")}
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Orders
                        </Button>
                        <div className="flex items-center gap-2">
                            <Pizza className="h-6 w-6 text-orange-500" />
                            <span className="font-bold text-xl">FoodHub</span>
                        </div>
                    </div>

                    <Card className="border-none shadow-xl">
                        <CardContent className="p-12 flex flex-col items-center justify-center">
                            <AlertTriangle className="h-16 w-16 text-orange-500 mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
                            <p className="text-gray-500 mb-6">
                                The order you're looking for doesn't exist or you don't have permission to view it.
                            </p>
                            <Button onClick={() => router.push("/dashboard/restaurant/orders")}>Return to Orders</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2"
                        onClick={() => router.push("/dashboard/restaurant/orders")}
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Orders
                    </Button>
                    <div className="flex items-center gap-2">
                        <Pizza className="h-6 w-6 text-orange-500" />
                        <span className="font-bold text-xl">FoodHub</span>
                    </div>
                </div>

                <Card className="border-none shadow-xl mb-6">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-2xl">Order Details</CardTitle>
                        <Badge className={getStatusBadgeColor(order.status)}>{formatStatus(order.status)}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Order Summary */}
                            <div>
                                <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Order ID:</span>
                                        <span className="font-medium">{order._id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Date:</span>
                                        <span>{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <div className="flex items-center gap-1">
                                            <CreditCard className="h-4 w-4 text-gray-500" />
                                            <span>{order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Payment Status:</span>
                                        <Badge
                                            className={
                                                order.paymentStatus === "completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : order.paymentStatus === "pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                            }
                                        >
                                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <h3 className="text-lg font-medium mb-4">Customer Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <User className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Customer ID</p>
                                            <p className="text-gray-600">{order.userId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Delivery Address</p>
                                            <p className="text-gray-600">{order.deliveryAddress}</p>
                                        </div>
                                    </div>
                                    {order.phone && (
                                        <div className="flex items-start gap-2">
                                            <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Phone</p>
                                                <p className="text-gray-600">{order.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {order.email && (
                                        <div className="flex items-start gap-2">
                                            <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Email</p>
                                                <p className="text-gray-600">{order.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {order.specialInstructions && (
                                    <>
                                        <Separator className="my-6" />
                                        <h3 className="text-lg font-medium mb-2">Special Instructions</h3>
                                        <div className="bg-gray-50 p-3 rounded-md border text-gray-700">{order.specialInstructions}</div>
                                    </>
                                )}
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-lg font-medium mb-4">Order Items</h3>
                                <div className="bg-white rounded-md border overflow-hidden">
                                    <div className="divide-y">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="p-4">
                                                <div className="flex justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image || "/placeholder.svg"}
                                                                    alt={item.name}
                                                                    className="h-full w-full object-cover rounded-md"
                                                                />
                                                            ) : (
                                                                <Pizza className="h-6 w-6 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{item.name}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {item.quantity} x ${item.price.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-gray-50 p-4">
                                        <div className="flex justify-between mb-2">
                                            <span>Subtotal</span>
                                            <span>${order.subtotal?.toFixed(2) || order.totalAmount.toFixed(2)}</span>
                                        </div>
                                        {order.deliveryFee !== undefined && (
                                            <div className="flex justify-between mb-2">
                                                <span>Delivery Fee</span>
                                                <span>${order.deliveryFee.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {order.tax !== undefined && (
                                            <div className="flex justify-between mb-2">
                                                <span>Tax</span>
                                                <span>${order.tax.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                            <span>Total</span>
                                            <span>${order.totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <h3 className="text-lg font-medium mb-4">Order Timeline</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Order Placed</p>
                                            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                        </div>
                                    </div>

                                    {order.status !== "pending" && order.status !== "cancelled" && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Order Accepted</p>
                                                <p className="text-sm text-gray-500">
                                                    {order.statusUpdates?.accepted ? formatDate(order.statusUpdates.accepted) : "Status updated"}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {(order.status === "preparing" ||
                                        order.status === "ready" ||
                                        order.status === "out_for_delivery" ||
                                        order.status === "delivered") && (
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Preparing</p>
                                                    <p className="text-sm text-gray-500">
                                                        {order.statusUpdates?.preparing
                                                            ? formatDate(order.statusUpdates.preparing)
                                                            : "Status updated"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                    {(order.status === "ready" ||
                                        order.status === "out_for_delivery" ||
                                        order.status === "delivered") && (
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <CheckCircle className="h-4 w-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Ready for Pickup</p>
                                                    <p className="text-sm text-gray-500">
                                                        {order.statusUpdates?.ready ? formatDate(order.statusUpdates.ready) : "Status updated"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                    {(order.status === "out_for_delivery" || order.status === "delivered") && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                                <Truck className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Out for Delivery</p>
                                                <p className="text-sm text-gray-500">
                                                    {order.statusUpdates?.out_for_delivery
                                                        ? formatDate(order.statusUpdates.out_for_delivery)
                                                        : "Status updated"}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {order.status === "delivered" && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Delivered</p>
                                                <p className="text-sm text-gray-500">
                                                    {order.statusUpdates?.delivered
                                                        ? formatDate(order.statusUpdates.delivered)
                                                        : "Status updated"}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {order.status === "cancelled" && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Cancelled</p>
                                                <p className="text-sm text-gray-500">
                                                    {order.statusUpdates?.cancelled
                                                        ? formatDate(order.statusUpdates.cancelled)
                                                        : "Status updated"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-6" />

                                <h3 className="text-lg font-medium mb-4">Order Actions</h3>
                                <div className="space-y-3">
                                    {getNextStatus(order.status) && (
                                        <Button
                                            className="w-full bg-orange-500 hover:bg-orange-600"
                                            onClick={() => handleUpdateStatus(getNextStatus(order.status))}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? "Updating..." : `Mark as ${formatStatus(getNextStatus(order.status))}`}
                                        </Button>
                                    )}

                                    {order.status !== "cancelled" && order.status !== "delivered" && (
                                        <Button
                                            variant="outline"
                                            className="w-full text-red-500 border-red-500 hover:bg-red-50"
                                            onClick={() => handleUpdateStatus("cancelled")}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? "Updating..." : "Cancel Order"}
                                        </Button>
                                    )}

                                    <Button variant="outline" className="w-full" onClick={() => window.print()}>
                                        Print Order Details
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
