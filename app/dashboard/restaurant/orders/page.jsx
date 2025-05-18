"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  getMyRestaurants,
  getRestaurantOrders,
  updateOrderStatus,
} from "@/lib/restaurant-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Pizza,
  ArrowLeft,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Store,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    if (!loading && user?.role !== "restaurant_owner") {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await getMyRestaurants();
        setRestaurants(data);
        if (data.length > 0) {
          setSelectedRestaurant(data[0]);
        }
      } catch (error) {
        toast.error("Failed to fetch restaurants");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !loading) {
      fetchRestaurants();
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!selectedRestaurant) return;

      try {
        const data = await getRestaurantOrders(selectedRestaurant._id);

        // Transform orders to a consistent format and ensure unique IDs
        const normalizedOrders = [];
        const seenIds = new Set();

        data.forEach((order) => {
          // Skip duplicate orders
          if (seenIds.has(order._id)) return;
          seenIds.add(order._id);

          // Check if this is the new format (with customer_id) or old format (with userId)
          const normalizedOrder = order.customer_id
            ? {
                // New format from order-service
                _id: order._id,
                userId: order.customer_id,
                restaurantId: order.restaurant_id,
                items: order.items.map((item) => ({
                  menuItemId: item.menu_id || item.menuItemId,
                  name: item.name || "Menu Item",
                  price: item.price,
                  quantity: item.quantity,
                })),
                totalAmount: order.total_price,
                status: order.order_status.toLowerCase(),
                deliveryAddress: order.delivery_address,
                paymentStatus: order.payment_status.toLowerCase(),
                paymentMethod: order.payment_method.toLowerCase(),
                specialInstructions: order.extra_notes?.join(", ") || "",
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                // Add a unique service prefix to prevent duplicate key errors
                _displayId: `order-${order._id}`,
              }
            : {
                // Old format from restaurant-service
                ...order,
                _displayId: `rest-${order._id}`,
              };

          normalizedOrders.push(normalizedOrder);
        });

        setOrders(normalizedOrders);
      } catch (error) {
        toast.error("Failed to fetch orders");
        console.error(error);
      }
    };

    if (selectedRestaurant) {
      fetchOrders();
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    // Apply filters
    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.userId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply tab filters
    if (activeTab === "pending") {
      filtered = filtered.filter((order) =>
        [
          "pending",
          "accepted",
          "preparing",
          "ready",
          "out_for_delivery",
        ].includes(order.status)
      );
    } else if (activeTab === "completed") {
      filtered = filtered.filter((order) =>
        ["delivered", "cancelled"].includes(order.status)
      );
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, activeTab, orders]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);

      // Update local state
      const updatedOrders = orders.map((order) => {
        if (order._id === orderId) {
          // Check if this is the new format or old format
          if (order.customer_id) {
            // New format
            return { ...order, order_status: newStatus.toUpperCase() };
          } else {
            // Old format
            return { ...order, status: newStatus };
          }
        }
        return order;
      });

      setOrders(updatedOrders);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update order status");
      console.error(error);
    }
  };

  const toggleOrderExpanded = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getStatusBadgeColor = (status) => {
    // Normalize status to lowercase for consistent handling
    const normalizedStatus = status?.toLowerCase?.() || "";

    switch (normalizedStatus) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "preparing":
        return "bg-indigo-100 text-indigo-700";
      case "ready":
      case "ready_for_pickup":
        return "bg-purple-100 text-purple-700";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    // Convert to lowercase and replace underscores with spaces
    const formattedStatus = status.toLowerCase().replace(/_/g, " ");

    // Capitalize first letter
    return formattedStatus.charAt(0).toUpperCase() + formattedStatus.slice(1);
  };

  const getNextStatus = (currentStatus) => {
    // Normalize status to lowercase for consistent handling
    const normalizedStatus = currentStatus?.toLowerCase?.() || "";

    const statusFlow = {
      pending: "accepted",
      accepted: "preparing",
      confirmed: "preparing", // Add this line to handle "CONFIRMED" status
      preparing: "ready",
      ready: "out_for_delivery",
      ready_for_pickup: "out_for_delivery", // Add this line to handle "READY_FOR_PICKUP" status
      out_for_delivery: "delivered",
    };
    return statusFlow[normalizedStatus] || null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => router.push("/dashboard/restaurant")}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Pizza className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-xl">FoodHub</span>
          </div>
        </div>

        <Card className="border-none shadow-xl mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">Orders Management</CardTitle>
          </CardHeader>
          <CardContent>
            {restaurants.length > 0 ? (
              <div className="space-y-6">
                {/* Restaurant Selector */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Select Restaurant:</span>
                    <Select
                      value={selectedRestaurant?._id || ""}
                      onValueChange={(value) => {
                        const restaurant = restaurants.find(
                          (r) => r._id === value
                        );
                        setSelectedRestaurant(restaurant);
                      }}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Select a restaurant" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants.map((restaurant) => (
                          <SelectItem
                            key={restaurant._id}
                            value={restaurant._id || "default"}
                          >
                            {restaurant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex-1 flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search orders..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="out_for_delivery">
                          Out for Delivery
                        </SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs
                  defaultValue="all"
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="all">All Orders</TabsTrigger>
                    <TabsTrigger value="pending">Pending Orders</TabsTrigger>
                    <TabsTrigger value="completed">
                      Completed Orders
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4">
                    {filteredOrders.length > 0 ? (
                      <div className="space-y-4">
                        {filteredOrders.map((order) => (
                          <Collapsible
                            key={order._displayId}
                            open={expandedOrders[order._id]}
                            onOpenChange={() => toggleOrderExpanded(order._id)}
                            className="border rounded-lg bg-white overflow-hidden"
                          >
                            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                  <h3 className="font-medium">
                                    Order #{order._id.substring(0, 8)}
                                  </h3>
                                  <Badge
                                    className={getStatusBadgeColor(
                                      order.status
                                    )}
                                  >
                                    {formatStatus(order.status)}
                                  </Badge>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatDate(order.createdAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span className="truncate max-w-[200px]">
                                      {order.deliveryAddress}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="font-bold text-lg">
                                    ${order.totalAmount.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {order.items.length} items
                                  </div>
                                </div>
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    {expandedOrders[order._id] ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                            </div>
                            <CollapsibleContent>
                              <div className="border-t p-4 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Order Items
                                    </h4>
                                    <ul className="space-y-2">
                                      {order.items.map((item, index) => (
                                        <li
                                          key={index}
                                          className="flex justify-between"
                                        >
                                          <span>
                                            {item.quantity}x {item.name}
                                          </span>
                                          <span className="font-medium">
                                            $
                                            {(
                                              item.price * item.quantity
                                            ).toFixed(2)}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                    <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                                      <span>Total</span>
                                      <span>
                                        ${order.totalAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Order Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Payment Method:
                                        </span>
                                        <span className="font-medium">
                                          {order.paymentMethod
                                            .charAt(0)
                                            .toUpperCase() +
                                            order.paymentMethod.slice(1)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Payment Status:
                                        </span>
                                        <Badge
                                          className={
                                            order.paymentStatus === "completed"
                                              ? "bg-green-100 text-green-700"
                                              : order.paymentStatus ===
                                                "pending"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-red-100 text-red-700"
                                          }
                                        >
                                          {order.paymentStatus
                                            .charAt(0)
                                            .toUpperCase() +
                                            order.paymentStatus.slice(1)}
                                        </Badge>
                                      </div>
                                      {order.specialInstructions && (
                                        <div className="mt-3">
                                          <span className="text-gray-600 block mb-1">
                                            Special Instructions:
                                          </span>
                                          <p className="bg-white p-2 rounded border text-sm">
                                            {order.specialInstructions}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Order Actions */}
                                    <div className="mt-4 pt-4 border-t">
                                      <h4 className="font-medium mb-2">
                                        Actions
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {getNextStatus(order.status) && (
                                          <Button
                                            onClick={() =>
                                              handleUpdateOrderStatus(
                                                order._id,
                                                getNextStatus(order.status)
                                              )
                                            }
                                            className="bg-orange-500 hover:bg-orange-600"
                                          >
                                            Mark as{" "}
                                            {getNextStatus(
                                              order.status
                                            ).replace(/_/g, " ")}
                                          </Button>
                                        )}
                                        {order.status !== "cancelled" &&
                                          order.status !== "delivered" && (
                                            <Button
                                              variant="outline"
                                              className="text-red-500 border-red-500 hover:bg-red-50"
                                              onClick={() =>
                                                handleUpdateOrderStatus(
                                                  order._id,
                                                  "cancelled"
                                                )
                                              }
                                            >
                                              Cancel Order
                                            </Button>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <AlertCircle className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-1">
                          No Orders Found
                        </h3>
                        <p className="text-sm text-gray-500">
                          {orders.length > 0
                            ? "Try adjusting your search or filters"
                            : "You don't have any orders yet"}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="mt-4">
                    {filteredOrders.length > 0 ? (
                      <div className="space-y-4">
                        {filteredOrders.map((order) => (
                          <Collapsible
                            key={order._displayId}
                            open={expandedOrders[order._id]}
                            onOpenChange={() => toggleOrderExpanded(order._id)}
                            className="border rounded-lg bg-white overflow-hidden"
                          >
                            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                  <h3 className="font-medium">
                                    Order #{order._id.substring(0, 8)}
                                  </h3>
                                  <Badge
                                    className={getStatusBadgeColor(
                                      order.status
                                    )}
                                  >
                                    {formatStatus(order.status)}
                                  </Badge>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatDate(order.createdAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span className="truncate max-w-[200px]">
                                      {order.deliveryAddress}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="font-bold text-lg">
                                    ${order.totalAmount.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {order.items.length} items
                                  </div>
                                </div>
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    {expandedOrders[order._id] ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                            </div>
                            <CollapsibleContent>
                              <div className="border-t p-4 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Order Items
                                    </h4>
                                    <ul className="space-y-2">
                                      {order.items.map((item, index) => (
                                        <li
                                          key={index}
                                          className="flex justify-between"
                                        >
                                          <span>
                                            {item.quantity}x {item.name}
                                          </span>
                                          <span className="font-medium">
                                            $
                                            {(
                                              item.price * item.quantity
                                            ).toFixed(2)}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                    <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                                      <span>Total</span>
                                      <span>
                                        ${order.totalAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Order Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Payment Method:
                                        </span>
                                        <span className="font-medium">
                                          {order.paymentMethod
                                            .charAt(0)
                                            .toUpperCase() +
                                            order.paymentMethod.slice(1)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Payment Status:
                                        </span>
                                        <Badge
                                          className={
                                            order.paymentStatus === "completed"
                                              ? "bg-green-100 text-green-700"
                                              : order.paymentStatus ===
                                                "pending"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-red-100 text-red-700"
                                          }
                                        >
                                          {order.paymentStatus
                                            .charAt(0)
                                            .toUpperCase() +
                                            order.paymentStatus.slice(1)}
                                        </Badge>
                                      </div>
                                      {order.specialInstructions && (
                                        <div className="mt-3">
                                          <span className="text-gray-600 block mb-1">
                                            Special Instructions:
                                          </span>
                                          <p className="bg-white p-2 rounded border text-sm">
                                            {order.specialInstructions}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Order Actions */}
                                    <div className="mt-4 pt-4 border-t">
                                      <h4 className="font-medium mb-2">
                                        Actions
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {getNextStatus(order.status) && (
                                          <Button
                                            onClick={() =>
                                              handleUpdateOrderStatus(
                                                order._id,
                                                getNextStatus(order.status)
                                              )
                                            }
                                            className="bg-orange-500 hover:bg-orange-600"
                                          >
                                            Mark as{" "}
                                            {getNextStatus(
                                              order.status
                                            ).replace(/_/g, " ")}
                                          </Button>
                                        )}
                                        {order.status !== "cancelled" &&
                                          order.status !== "delivered" && (
                                            <Button
                                              variant="outline"
                                              className="text-red-500 border-red-500 hover:bg-red-50"
                                              onClick={() =>
                                                handleUpdateOrderStatus(
                                                  order._id,
                                                  "cancelled"
                                                )
                                              }
                                            >
                                              Cancel Order
                                            </Button>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <CheckCircle className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-1">
                          No Pending Orders
                        </h3>
                        <p className="text-sm text-gray-500">
                          You don't have any pending orders at the moment
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="mt-4">
                    {filteredOrders.length > 0 ? (
                      <div className="space-y-4">
                        {filteredOrders.map((order) => (
                          <Collapsible
                            key={order._displayId}
                            open={expandedOrders[order._id]}
                            onOpenChange={() => toggleOrderExpanded(order._id)}
                            className="border rounded-lg bg-white overflow-hidden"
                          >
                            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                  <h3 className="font-medium">
                                    Order #{order._id.substring(0, 8)}
                                  </h3>
                                  <Badge
                                    className={getStatusBadgeColor(
                                      order.status
                                    )}
                                  >
                                    {formatStatus(order.status)}
                                  </Badge>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatDate(order.createdAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span className="truncate max-w-[200px]">
                                      {order.deliveryAddress}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="font-bold text-lg">
                                    ${order.totalAmount.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {order.items.length} items
                                  </div>
                                </div>
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    {expandedOrders[order._id] ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                            </div>
                            <CollapsibleContent>
                              <div className="border-t p-4 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Order Items
                                    </h4>
                                    <ul className="space-y-2">
                                      {order.items.map((item, index) => (
                                        <li
                                          key={index}
                                          className="flex justify-between"
                                        >
                                          <span>
                                            {item.quantity}x {item.name}
                                          </span>
                                          <span className="font-medium">
                                            $
                                            {(
                                              item.price * item.quantity
                                            ).toFixed(2)}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                    <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                                      <span>Total</span>
                                      <span>
                                        ${order.totalAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Order Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Payment Method:
                                        </span>
                                        <span className="font-medium">
                                          {order.paymentMethod
                                            .charAt(0)
                                            .toUpperCase() +
                                            order.paymentMethod.slice(1)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Payment Status:
                                        </span>
                                        <Badge
                                          className={
                                            order.paymentStatus === "completed"
                                              ? "bg-green-100 text-green-700"
                                              : order.paymentStatus ===
                                                "pending"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-red-100 text-red-700"
                                          }
                                        >
                                          {order.paymentStatus
                                            .charAt(0)
                                            .toUpperCase() +
                                            order.paymentStatus.slice(1)}
                                        </Badge>
                                      </div>
                                      {order.specialInstructions && (
                                        <div className="mt-3">
                                          <span className="text-gray-600 block mb-1">
                                            Special Instructions:
                                          </span>
                                          <p className="bg-white p-2 rounded border text-sm">
                                            {order.specialInstructions}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <XCircle className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-1">
                          No Completed Orders
                        </h3>
                        <p className="text-sm text-gray-500">
                          You don't have any completed orders yet
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Store className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  No Restaurants
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  You need to create a restaurant before managing orders.
                </p>
                <Button
                  onClick={() => router.push("/dashboard/restaurant/create")}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Restaurant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
