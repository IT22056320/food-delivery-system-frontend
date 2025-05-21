"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getUserOrders } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Search,
  Clock,
  MapPin,
  ChevronRight,
  ShoppingBag,
  DollarSign,
  Info,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UserOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchOrders();
      }
    }
  }, [user, loading, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching orders from API...");
      const data = await getUserOrders();
      console.log("Orders fetched:", data);
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orders.length > 0) {
      filterOrders(activeTab, searchQuery);
    }
  }, [activeTab, searchQuery, orders]);

  const filterOrders = (tab, query) => {
    let filtered = [...orders];

    // Filter by tab
    if (tab !== "all") {
      if (tab === "active") {
        filtered = filtered.filter((order) =>
          [
            "PENDING",
            "CONFIRMED",
            "PREPARING",
            "READY_FOR_PICKUP",
            "OUT_FOR_DELIVERY",
          ].includes(order.order_status)
        );
      } else if (tab === "completed") {
        filtered = filtered.filter(
          (order) => order.order_status === "DELIVERED"
        );
      } else if (tab === "cancelled") {
        filtered = filtered.filter(
          (order) => order.order_status === "CANCELLED"
        );
      }
    }

    // Filter by search query
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(lowercaseQuery) ||
          (order.restaurant?.name &&
            order.restaurant.name.toLowerCase().includes(lowercaseQuery))
      );
    }

    setFilteredOrders(filtered);
  };

  const handleTrackOrder = (orderId) => {
    // For demo orders, we'll use a special route that can handle demo data
    if (orderId.startsWith("demo_")) {
      toast.info("This is a demo order. Tracking information is simulated.");
    }

    // Just navigate directly - the track page will handle authorization bypass
    router.push(`/dashboard/user/${orderId}/track`);
  };

  const handleViewOrderDetails = (orderId) => {
    // For demo orders, show a toast instead of navigating
    if (orderId.startsWith("demo_")) {
      toast.info("This is a demo order. Details are not available.");
      return;
    }

    // Just navigate directly - the details page will handle authorization bypass
    router.push(`/dashboard/user/orders/${orderId}`);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      CONFIRMED: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      PREPARING: { color: "bg-purple-100 text-purple-800", label: "Preparing" },
      READY_FOR_PICKUP: {
        color: "bg-indigo-100 text-indigo-800",
        label: "Ready for Pickup",
      },
      OUT_FOR_DELIVERY: {
        color: "bg-orange-100 text-orange-800",
        label: "Out for Delivery",
      },
      DELIVERED: { color: "bg-green-100 text-green-800", label: "Delivered" },
      CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };

    const { color, label } = statusMap[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };

    return <Badge className={color}>{label}</Badge>;
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-amber-100 border-l-4 border-amber-500 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Development Mode
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  Authorization checks have been bypassed for development
                  purposes. All orders will be accessible regardless of
                  ownership.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/dashboard/user")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <Card className="border-none shadow-xl mb-6">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-2xl">My Orders</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No orders found
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      {activeTab === "all"
                        ? "You haven't placed any orders yet."
                        : `You don't have any ${activeTab} orders.`}
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/user/restaurants")}
                    >
                      Browse Restaurants
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div
                        key={order._id}
                        className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow ${
                          order.is_demo ? "border-l-4 border-amber-300" : ""
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">
                                Order #{order._id.substring(0, 8)}
                                {order.is_demo && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center ml-2">
                                          <Info className="h-3.5 w-3.5 text-amber-500" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Demo order (for display purposes)</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </h3>
                              {getStatusBadge(order.order_status)}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                              {order.restaurant?.name || "Restaurant Name"}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>
                                  {new Date(
                                    order.created_at || order.createdAt
                                  ).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{order.delivery_address}</span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                <span>{formatCurrency(order.total_price)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                            {[
                              "PENDING",
                              "CONFIRMED",
                              "PREPARING",
                              "READY_FOR_PICKUP",
                              "OUT_FOR_DELIVERY",
                            ].includes(order.order_status) && (
                              <Button
                                variant="outline"
                                className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                onClick={() => handleTrackOrder(order._id)}
                              >
                                Track Order
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              className="flex items-center"
                              onClick={() => handleViewOrderDetails(order._id)}
                            >
                              Details <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
