"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getOrderById } from "@/lib/restaurant-api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Pizza, ArrowLeft, MapPin, Phone, Mail, User, CreditCard, AlertTriangle } from "lucide-react"
import DeliveryTracker from "@/components/delivery-tracker"

export default function OrderDetailsPage() {
    const { user, loading } = useAuth()
    const params = useParams()
    const router = useRouter()
    const { id } = params

    const [isLoading, setIsLoading] = useState(true)
    const [order, setOrder] = useState(null)

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
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
                            onClick={() => router.push("/dashboard/user/orders")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
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
                            <Button onClick={() => router.push("/dashboard/user/orders")}>Return to Orders</Button>
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
                        onClick={() => router.push("/dashboard/user/orders")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
                    </Button>
                    <div className="flex items-center gap-2">
                        <Pizza className="h-6 w-6 text-orange-500" />
                        <span className="font-bold text-xl">FoodHub</span>
                    </div>
                </div>

                <Card className="border-none shadow-xl mb-6">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-2xl">Order Details</CardTitle>
                        <Badge
                            className={
                                order.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : order.status === "accepted"
                                        ? "bg-blue-100 text-blue-700"
                                        : order.status === "preparing"
                                            ? "bg-indigo-100 text-indigo-700"
                                            : order.status === "ready"
                                                ? "bg-purple-100 text-purple-700"
                                                : order.status === "out_for_delivery"
                                                    ? "bg-orange-100 text-orange-700"
                                                    : order.status === "delivered"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                            }
                        >
                            {formatStatus(order.status)}
                        </Badge>
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
                                            <span>${order.totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span>Delivery Fee</span>
                                            <span>$2.99</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span>Tax</span>
                                            <span>${(order.totalAmount * 0.08).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                            <span>Total</span>
                                            <span>${(order.totalAmount + 2.99 + order.totalAmount * 0.08).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Delivery Tracking */}
                        <DeliveryTracker delivery={order} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
