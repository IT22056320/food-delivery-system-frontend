"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Store, Users, ShoppingBag, BarChart3, Eye } from "lucide-react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data - replace with actual API calls
const mockOrders = [
    {
        _id: "ORD12345",
        userId: {
            _id: "USR123",
            name: "John Doe",
            email: "john@example.com",
        },
        restaurantId: {
            _id: "RES123",
            name: "Pizza Palace",
            address: "123 Main St",
        },
        items: [
            { name: "Pepperoni Pizza", quantity: 2, price: 12.99 },
            { name: "Garlic Bread", quantity: 1, price: 4.99 },
        ],
        totalAmount: 30.97,
        status: "delivered",
        paymentStatus: "completed",
        paymentMethod: "credit_card",
        deliveryAddress: "456 Oak St, Apt 7B",
        createdAt: "2023-06-15T14:30:00.000Z",
        updatedAt: "2023-06-15T15:45:00.000Z",
    },
    {
        _id: "ORD12346",
        userId: {
            _id: "USR124",
            name: "Jane Smith",
            email: "jane@example.com",
        },
        restaurantId: {
            _id: "RES124",
            name: "Burger Barn",
            address: "789 Elm St",
        },
        items: [
            { name: "Cheeseburger", quantity: 1, price: 8.99 },
            { name: "Fries", quantity: 1, price: 3.99 },
            { name: "Soda", quantity: 2, price: 1.99 },
        ],
        totalAmount: 16.96,
        status: "preparing",
        paymentStatus: "completed",
        paymentMethod: "credit_card",
        deliveryAddress: "101 Pine St, Suite 3C",
        createdAt: "2023-06-16T12:15:00.000Z",
        updatedAt: "2023-06-16T12:30:00.000Z",
    },
    {
        _id: "ORD12347",
        userId: {
            _id: "USR125",
            name: "Mike Johnson",
            email: "mike@example.com",
        },
        restaurantId: {
            _id: "RES125",
            name: "Sushi Supreme",
            address: "202 Maple Dr",
        },
        items: [
            { name: "California Roll", quantity: 2, price: 9.99 },
            { name: "Miso Soup", quantity: 1, price: 2.99 },
        ],
        totalAmount: 22.97,
        status: "cancelled",
        paymentStatus: "refunded",
        paymentMethod: "paypal",
        deliveryAddress: "303 Cedar Ave, Apt 12D",
        createdAt: "2023-06-14T18:45:00.000Z",
        updatedAt: "2023-06-14T19:15:00.000Z",
    },
    {
        _id: "ORD12348",
        userId: {
            _id: "USR126",
            name: "Sarah Williams",
            email: "sarah@example.com",
        },
        restaurantId: {
            _id: "RES126",
            name: "Taco Town",
            address: "404 Birch Blvd",
        },
        items: [
            { name: "Taco Platter", quantity: 1, price: 14.99 },
            { name: "Guacamole", quantity: 1, price: 3.99 },
            { name: "Horchata", quantity: 2, price: 2.99 },
        ],
        totalAmount: 24.96,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: "cash_on_delivery",
        deliveryAddress: "505 Walnut St, Unit 8E",
        createdAt: "2023-06-16T13:30:00.000Z",
        updatedAt: "2023-06-16T13:30:00.000Z",
    },
    {
        _id: "ORD12349",
        userId: {
            _id: "USR127",
            name: "David Brown",
            email: "david@example.com",
        },
        restaurantId: {
            _id: "RES127",
            name: "Pasta Paradise",
            address: "606 Spruce St",
        },
        items: [
            { name: "Fettuccine Alfredo", quantity: 1, price: 13.99 },
            { name: "Garlic Knots", quantity: 1, price: 5.99 },
            { name: "Tiramisu", quantity: 1, price: 6.99 },
        ],
        totalAmount: 26.97,
        status: "delivered",
        paymentStatus: "completed",
        paymentMethod: "credit_card",
        deliveryAddress: "707 Ash St, Apt 5F",
        createdAt: "2023-06-15T19:15:00.000Z",
        updatedAt: "2023-06-15T20:30:00.000Z",
    },
]

export default function AdminOrdersPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [activeTab, setActiveTab] = useState("all")
    const [dateFilter, setDateFilter] = useState("all")

    useEffect(() => {
        if (!loading && (!user || user.role !== "admin")) {
            router.push("/")
            toast.error("You don't have permission to access this page")
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true)
                // Replace with actual API call
                // const data = await getAllOrders();
                const data = mockOrders
                setOrders(data)
                setFilteredOrders(data)
            } catch (error) {
                toast.error("Failed to fetch orders")
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        if (user && !loading && user.role === "admin") {
            fetchOrders()
        }
    }, [user, loading])

    useEffect(() => {
        // Apply filters
        let filtered = [...orders]

        // Status filter
        if (activeTab !== "all") {
            filtered = filtered.filter((order) => order.status === activeTab)
        }

        // Date filter
        if (dateFilter !== "all") {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            if (dateFilter === "today") {
                filtered = filtered.filter((order) => {
                    const orderDate = new Date(order.createdAt)
                    return orderDate >= today
                })
            } else if (dateFilter === "week") {
                const weekAgo = new Date(today)
                weekAgo.setDate(weekAgo.getDate() - 7)
                filtered = filtered.filter((order) => {
                    const orderDate = new Date(order.createdAt)
                    return orderDate >= weekAgo
                })
            } else if (dateFilter === "month") {
                const monthAgo = new Date(today)
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                filtered = filtered.filter((order) => {
                    const orderDate = new Date(order.createdAt)
                    return orderDate >= monthAgo
                })
            }
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (order) =>
                    order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.restaurantId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase())),
            )
        }

        setFilteredOrders(filtered)
    }, [searchQuery, orders, activeTab, dateFilter])

    const handleTabChange = (value) => {
        setActiveTab(value)
    }

    const viewOrderDetails = (order) => {
        setSelectedOrder(order)
        setViewDialogOpen(true)
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
            case "accepted":
                return <Badge className="bg-blue-100 text-blue-700">Accepted</Badge>
            case "preparing":
                return <Badge className="bg-indigo-100 text-indigo-700">Preparing</Badge>
            case "ready":
                return <Badge className="bg-purple-100 text-purple-700">Ready</Badge>
            case "out_for_delivery":
                return <Badge className="bg-orange-100 text-orange-700">Out for Delivery</Badge>
            case "delivered":
                return <Badge className="bg-green-100 text-green-700">Delivered</Badge>
            case "cancelled":
                return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>
            default:
                return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
        }
    }

    const getPaymentStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-green-100 text-green-700">Completed</Badge>
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
            case "failed":
                return <Badge className="bg-red-100 text-red-700">Failed</Badge>
            case "refunded":
                return <Badge className="bg-blue-100 text-blue-700">Refunded</Badge>
            default:
                return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
        }
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Sidebar */}
            <div className="w-56 bg-white shadow-md flex flex-col">
                <div className="p-4 border-b">
                    <div className="flex items-center gap-2">
                        <Store className="h-8 w-8 text-blue-500" />
                        <span className="font-bold text-xl">FoodHub</span>
                    </div>
                </div>

                <div className="flex flex-col p-4 flex-1">
                    <p className="text-gray-500 text-sm mb-4">Admin Dashboard</p>

                    <nav className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/dashboard/admin")}>
                            <BarChart3 className="mr-2 h-5 w-5" />
                            Overview
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => router.push("/dashboard/admin/restaurants")}
                        >
                            <Store className="mr-2 h-5 w-5" />
                            Restaurants
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => router.push("/dashboard/admin/users")}
                        >
                            <Users className="mr-2 h-5 w-5" />
                            Users
                        </Button>

                        <Button
                            variant="default"
                            className="w-full justify-start bg-blue-500 hover:bg-blue-600"
                            onClick={() => router.push("/dashboard/admin/orders")}
                        >
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Orders
                        </Button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Order Management</h1>
                            <p className="text-gray-500">Monitor and manage all orders</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="flex-1">
                            <TabsList className="grid grid-cols-4 md:grid-cols-7">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="preparing">Preparing</TabsTrigger>
                                <TabsTrigger value="ready">Ready</TabsTrigger>
                                <TabsTrigger value="out_for_delivery">Delivering</TabsTrigger>
                                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex gap-2">
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by date" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search orders..."
                                    className="pl-10 w-[200px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <Card className="border-none shadow-xl mb-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <ShoppingBag className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
                                    <p className="text-lg">Loading orders...</p>
                                </div>
                            ) : filteredOrders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs text-gray-500 border-b">
                                                <th className="pb-2 font-medium">Order ID</th>
                                                <th className="pb-2 font-medium">Customer</th>
                                                <th className="pb-2 font-medium">Restaurant</th>
                                                <th className="pb-2 font-medium">Amount</th>
                                                <th className="pb-2 font-medium">Status</th>
                                                <th className="pb-2 font-medium">Payment</th>
                                                <th className="pb-2 font-medium">Date</th>
                                                <th className="pb-2 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.map((order) => (
                                                <tr key={order._id} className="border-b border-gray-100">
                                                    <td className="py-3 font-medium">{order._id.substring(0, 8)}</td>
                                                    <td className="py-3">{order.userId.name}</td>
                                                    <td className="py-3">{order.restaurantId.name}</td>
                                                    <td className="py-3">${order.totalAmount.toFixed(2)}</td>
                                                    <td className="py-3">{getStatusBadge(order.status)}</td>
                                                    <td className="py-3">{getPaymentStatusBadge(order.paymentStatus)}</td>
                                                    <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8"
                                                                onClick={() => viewOrderDetails(order)}
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" /> View
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-1">No Orders Found</h3>
                                    {searchQuery || activeTab !== "all" || dateFilter !== "all" ? (
                                        <p className="text-sm text-gray-500 mb-4">Try adjusting your filters</p>
                                    ) : (
                                        <p className="text-sm text-gray-500 mb-4">There are no orders in the system yet.</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Order Details Dialog */}
            <AlertDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <AlertDialogContent className="max-w-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Order Details</AlertDialogTitle>
                        <AlertDialogDescription>Order #{selectedOrder?._id}</AlertDialogDescription>
                    </AlertDialogHeader>

                    {selectedOrder && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Order Information</h3>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-start gap-2">
                                        <div className="w-24 text-sm text-gray-500">Status:</div>
                                        <div>{getStatusBadge(selectedOrder.status)}</div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <div className="w-24 text-sm text-gray-500">Payment:</div>
                                        <div className="flex flex-col gap-1">
                                            <div>{getPaymentStatusBadge(selectedOrder.paymentStatus)}</div>
                                            <div className="text-sm capitalize">{selectedOrder.paymentMethod.replace("_", " ")}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <div className="w-24 text-sm text-gray-500">Date:</div>
                                        <div className="flex flex-col">
                                            <div>{new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <div className="w-24 text-sm text-gray-500">Customer:</div>
                                        <div className="flex flex-col">
                                            <div>{selectedOrder.userId.name}</div>
                                            <div className="text-sm text-gray-500">{selectedOrder.userId.email}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <div className="w-24 text-sm text-gray-500">Restaurant:</div>
                                        <div className="flex flex-col">
                                            <div>{selectedOrder.restaurantId.name}</div>
                                            <div className="text-sm text-gray-500">{selectedOrder.restaurantId.address}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <div className="w-24 text-sm text-gray-500">Delivery:</div>
                                        <div className="flex-1">{selectedOrder.deliveryAddress}</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex justify-between py-2 border-b">
                                            <div>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                                            </div>
                                            <div className="text-right">
                                                <div>${item.price.toFixed(2)}</div>
                                                <div className="text-sm text-gray-500">${(item.price * item.quantity).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-4 flex justify-between font-medium">
                                        <span>Total</span>
                                        <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
