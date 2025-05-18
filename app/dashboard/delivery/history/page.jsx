"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react";
import { getDeliveryHistory } from "@/lib/delivery-api";
import Link from "next/link";

export default function DeliveryHistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    avgTime: 0,
  });

  // Debug user object
  useEffect(() => {
    if (user) {
      console.log("Full user object in history page:", user);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user && user.role !== "delivery_person") {
      toast.error("You don't have access to the delivery dashboard");
      router.push("/dashboard/user");
      return;
    }

    if (!loading && user) {
      console.log("User loaded for history page:", user);
      fetchDeliveryHistory();
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (deliveryHistory.length > 0) {
      applyFilters();
    }
  }, [deliveryHistory, searchQuery, statusFilter, dateFilter]);

  // Update the fetchDeliveryHistory function to use the correct user ID property
  const fetchDeliveryHistory = async () => {
    try {
      setIsLoading(true);

      // Make sure we have a user before making API calls
      if (!user) {
        console.error("User not available for history API calls");
        toast.error(
          "User information not available. Please try logging in again."
        );
        setIsLoading(false);
        return;
      }

      // Get the user ID from the appropriate property or use the username
      const userId =
        user._id ||
        user.id ||
        user.userId ||
        user.uid ||
        user.username ||
        user.name;

      if (!userId) {
        console.error("User ID not found in user object:", user);
        toast.error("User ID not available. Please try logging in again.");
        setIsLoading(false);
        return;
      }

      console.log(`Fetching delivery history for user ID: ${userId}`);
      let history = await getDeliveryHistory(userId);

      // If no history found by ID, try using the username/name
      if ((!history || history.length === 0) && user.username) {
        console.log("No history found by ID, trying username:", user.username);
        history = await getDeliveryHistory(user.username);
      } else if ((!history || history.length === 0) && user.name) {
        console.log("No history found by ID, trying name:", user.name);
        history = await getDeliveryHistory(user.name);
      }

      console.log("Fetched delivery history:", history);

      if (!history || history.length === 0) {
        console.log("No delivery history found");
        setDeliveryHistory([]);
        setFilteredHistory([]);
        setStats({
          total: 0,
          completed: 0,
          cancelled: 0,
          avgTime: 0,
        });
        setIsLoading(false);
        return;
      }

      // Add calculated fields to each delivery
      const enhancedHistory = history.map((delivery) => {
        // Calculate delivery time if available
        let deliveryTime = null;
        if (delivery.delivered_at && delivery.picked_up_at) {
          const pickupTime = new Date(delivery.picked_up_at).getTime();
          const deliveredTime = new Date(delivery.delivered_at).getTime();
          deliveryTime = Math.round((deliveredTime - pickupTime) / (1000 * 60)); // in minutes
        }

        // Ensure order data is available
        const orderTotal = delivery.order?.total_price || 0;
        const orderItems = delivery.order?.items || 0;

        return {
          ...delivery,
          deliveryTime,
          formattedDate: new Date(
            delivery.delivered_at || delivery.createdAt
          ).toLocaleDateString(),
          searchText: `${delivery.order_id} ${
            delivery.restaurant_contact?.name || ""
          } ${delivery.delivery_location?.address || ""}`.toLowerCase(),
          order: {
            ...delivery.order,
            total_price: orderTotal,
            items: orderItems,
          },
        };
      });

      console.log("Enhanced history:", enhancedHistory);
      setDeliveryHistory(enhancedHistory);

      // Calculate statistics
      const completed = enhancedHistory.filter(
        (d) => d.status === "DELIVERED"
      ).length;
      const cancelled = enhancedHistory.filter(
        (d) => d.status === "CANCELLED"
      ).length;

      // Calculate average delivery time
      const deliveryTimes = enhancedHistory
        .filter((d) => d.deliveryTime !== null)
        .map((d) => d.deliveryTime);

      const avgTime =
        deliveryTimes.length > 0
          ? Math.round(
              deliveryTimes.reduce((sum, time) => sum + time, 0) /
                deliveryTimes.length
            )
          : 0;

      setStats({
        total: enhancedHistory.length,
        completed,
        cancelled,
        avgTime,
      });

      setFilteredHistory(enhancedHistory);
    } catch (error) {
      console.error("Error fetching delivery history:", error);
      toast.error("Failed to load delivery history");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...deliveryHistory];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((delivery) =>
        delivery.searchText.includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (delivery) => delivery.status === statusFilter
      );
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      filtered = filtered.filter((delivery) => {
        const deliveryDate = new Date(
          delivery.delivered_at || delivery.createdAt
        );

        if (dateFilter === "today") {
          return deliveryDate.toDateString() === today;
        } else if (dateFilter === "yesterday") {
          return deliveryDate.toDateString() === yesterdayStr;
        } else if (dateFilter === "week") {
          return deliveryDate >= weekAgo;
        } else if (dateFilter === "month") {
          return deliveryDate >= monthAgo;
        }
        return true;
      });
    }

    setFilteredHistory(filtered);
  };

  const handleSelectDelivery = (delivery) => {
    setSelectedDelivery(delivery);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delivery history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard/delivery">
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Delivery History
                </h1>
                <p className="text-gray-600">
                  View and analyze your past deliveries
                </p>
                <p className="text-xs text-gray-500">
                  User ID:{" "}
                  {user?._id ||
                    user?.id ||
                    user?.userId ||
                    user?.uid ||
                    user?.username ||
                    "Not available"}
                </p>
                <p className="text-xs text-gray-500">
                  Username: {user?.username || user?.name || "Not available"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Deliveries</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cancelled</p>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg. Delivery Time</p>
                  <p className="text-2xl font-bold">{stats.avgTime} min</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Filters and Search */}
          <div className="md:col-span-1">
            <Card className="bg-white border-none shadow-md mb-6">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Refine your delivery history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by order ID, restaurant..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Time Period
                  </label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setDateFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Details */}
            {selectedDelivery && (
              <Card className="bg-white border-none shadow-md sticky top-6">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Delivery Details</CardTitle>
                      <CardDescription>
                        Order #{selectedDelivery.order_id.substring(0, 6)}
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        selectedDelivery.status === "DELIVERED"
                          ? "bg-green-100 text-green-700"
                          : selectedDelivery.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    >
                      {selectedDelivery.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Date & Time
                    </h3>
                    <p className="text-gray-900">
                      {new Date(
                        selectedDelivery.delivered_at ||
                          selectedDelivery.createdAt
                      ).toLocaleDateString()}
                      {" at "}
                      {new Date(
                        selectedDelivery.delivered_at ||
                          selectedDelivery.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Restaurant
                    </h3>
                    <p className="text-gray-900">
                      {selectedDelivery.restaurant_contact?.name ||
                        "Restaurant"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedDelivery.pickup_location?.address}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Customer
                    </h3>
                    <p className="text-gray-900">
                      {selectedDelivery.customer_contact?.name || "Customer"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedDelivery.delivery_location?.address}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Order Total
                    </h3>
                    <p className="text-gray-900 font-medium">
                      $
                      {selectedDelivery.order?.total_price.toFixed(2) || "0.00"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Delivery Fee
                    </h3>
                    <p className="text-gray-900">
                      $
                      {(selectedDelivery.order?.total_price * 0.1).toFixed(2) ||
                        "0.00"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Your Earnings
                    </h3>
                    <p className="text-green-600 font-medium">
                      $
                      {(
                        selectedDelivery.order?.total_price *
                        0.1 *
                        0.8
                      ).toFixed(2) || "0.00"}
                    </p>
                  </div>

                  {selectedDelivery.deliveryTime && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Delivery Time
                      </h3>
                      <p className="text-gray-900">
                        {selectedDelivery.deliveryTime} minutes
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Delivery History List */}
          <div className="md:col-span-2">
            <Card className="bg-white border-none shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Delivery History</CardTitle>
                    <CardDescription>
                      {filteredHistory.length}{" "}
                      {filteredHistory.length === 1 ? "delivery" : "deliveries"}{" "}
                      found
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredHistory.length > 0 ? (
                  <div className="space-y-4">
                    {filteredHistory.map((delivery, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedDelivery?._id === delivery._id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                        }`}
                        onClick={() => handleSelectDelivery(delivery)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">
                              Order #{delivery.order_id.substring(0, 6)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {delivery.restaurant_contact?.name ||
                                "Restaurant"}
                            </p>
                          </div>
                          <Badge
                            className={
                              delivery.status === "DELIVERED"
                                ? "bg-green-100 text-green-700"
                                : delivery.status === "CANCELLED"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }
                          >
                            {delivery.status.replace(/_/g, " ")}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{delivery.formattedDate}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>
                              {delivery.deliveryTime
                                ? `${delivery.deliveryTime} min`
                                : "N/A"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="truncate">
                              {delivery.delivery_location?.address}
                            </span>
                          </div>

                          <div className="text-right font-medium">
                            $
                            {(delivery.order?.total_price * 0.1 * 0.8).toFixed(
                              2
                            ) || "0.00"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No deliveries found
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Try adjusting your filters or search criteria to find what
                      you're looking for.
                    </p>
                  </div>
                )}
              </CardContent>
              {filteredHistory.length > 0 && (
                <CardFooter className="flex justify-between border-t p-4">
                  <p className="text-sm text-gray-500">
                    Showing {filteredHistory.length} of {deliveryHistory.length}{" "}
                    deliveries
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Next
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
