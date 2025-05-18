"use client";

import { useState, useEffect, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  Navigation,
  CheckCircle,
  XCircle,
  LogOut,
  RefreshCw,
  History,
  DollarSign,
} from "lucide-react";
import DeliveryMap from "@/components/delivery-map";
import Link from "next/link";
import {
  getActiveDeliveries,
  getDeliveryHistory,
  updateDeliveryStatus,
  getAvailableDeliveries,
  getOrderById,
} from "@/lib/delivery-api";

export default function DeliveryDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [fallbackLocationUsed, setFallbackLocationUsed] = useState(false);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    completedToday: 0,
    earnings: 0,
    avgRating: 4.8,
  });

  // Debug user object
  useEffect(() => {
    if (user) {
      console.log("Full user object:", user);
    }
  }, [user]);

  // Also update the useFallbackLocation function to be a regular function instead of using useCallback
  const useFallbackLocation = () => {
    // If we have a selected delivery with pickup location, use a location near it
    if (
      selectedDelivery &&
      selectedDelivery.pickup_location &&
      selectedDelivery.pickup_location.coordinates
    ) {
      const fallbackLat =
        Number.parseFloat(selectedDelivery.pickup_location.coordinates.lat) +
        0.01;
      const fallbackLng =
        Number.parseFloat(selectedDelivery.pickup_location.coordinates.lng) +
        0.01;

      setCurrentLocation({
        lat: fallbackLat,
        lng: fallbackLng,
      });

      console.log("Using fallback location near restaurant:", {
        lat: fallbackLat,
        lng: fallbackLng,
      });
      setFallbackLocationUsed(true);
      return;
    }

    // Default fallback to a location (this should be customized based on your service area)
    setCurrentLocation({
      lat: 6.9271, // Default to Colombo, Sri Lanka coordinates
      lng: 79.8612,
    });
    console.log("Using default fallback location");
    setFallbackLocationUsed(true);
  };

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
      console.log("User loaded:", user);
      fetchDeliveries();
      startLocationTracking();

      // Set up periodic refresh
      const refreshInterval = setInterval(() => {
        fetchDeliveries(true);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [loading, user, router]);

  // Update the fetchDeliveries function to properly fetch real orders from the backend
  const fetchDeliveries = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // Make sure we have a user before making API calls
      if (!user) {
        console.error("User not available for API calls");
        if (!silent) {
          toast.error(
            "User information not available. Please try logging in again."
          );
        }
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Get the user ID from the appropriate property or use the username
      // This is critical - we need to match how the backend stores the delivery person ID
      const userId =
        user._id ||
        user.id ||
        user.userId ||
        user.uid ||
        user.username ||
        user.name;

      if (!userId) {
        console.error("User ID not found in user object:", user);
        if (!silent) {
          toast.error("User ID not available. Please try logging in again.");
        }
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      console.log("Using user ID for API calls:", userId);

      // Fetch active deliveries assigned to this delivery person - try both ID and name
      let activeData = await getActiveDeliveries(userId);

      // If no deliveries found by ID, try using the username/name
      if ((!activeData || activeData.length === 0) && user.username) {
        console.log(
          "No deliveries found by ID, trying username:",
          user.username
        );
        activeData = await getActiveDeliveries(user.username);
      } else if ((!activeData || activeData.length === 0) && user.name) {
        console.log("No deliveries found by ID, trying name:", user.name);
        activeData = await getActiveDeliveries(user.name);
      }

      // Also check for deliveries with status IN_TRANSIT
      const inTransitDeliveries = activeData.filter(
        (delivery) =>
          delivery.status === "IN_TRANSIT" ||
          delivery.status === "ASSIGNED" ||
          delivery.status === "PICKED_UP"
      );

      console.log("Active deliveries:", activeData);
      console.log("In-transit deliveries:", inTransitDeliveries);

      setActiveDeliveries(inTransitDeliveries);

      // Fetch available deliveries that haven't been assigned yet
      try {
        // First try to fetch pending deliveries from the delivery service
        const pendingDeliveries = await getAvailableDeliveries();
        console.log("Pending deliveries:", pendingDeliveries);

        // Transform delivery data to the format we need
        const availableOrders = await Promise.all(
          pendingDeliveries.map(async (delivery) => {
            // Try to fetch complete order details for each delivery
            let orderDetails = delivery.order || { total_price: 0, items: 0 };

            try {
              if (!orderDetails.total_price || orderDetails.total_price === 0) {
                const fetchedOrder = await getOrderById(delivery.order_id);
                orderDetails = {
                  total_price: fetchedOrder.total_price || 0,
                  items: fetchedOrder.items?.length || 0,
                  subtotal: fetchedOrder.subtotal || 0,
                  tax_amount: fetchedOrder.tax_amount || 0,
                };
              }
            } catch (error) {
              console.error(
                `Failed to fetch order details for delivery ${delivery._id}:`,
                error
              );
            }

            return {
              _id: delivery._id,
              order_id: delivery.order_id,
              restaurant_contact: delivery.restaurant_contact,
              pickup_location: delivery.pickup_location,
              delivery_location: delivery.delivery_location,
              order: orderDetails,
              estimated_delivery_time: 30,
              created_at: delivery.createdAt,
              isRealOrder: true, // Flag to identify real orders
            };
          })
        );

        console.log("Available orders to display:", availableOrders);
        setAvailableDeliveries(availableOrders);
      } catch (error) {
        console.error("Error fetching available orders:", error);
        setAvailableDeliveries([]);
      }

      // Fetch delivery history - try both ID and name
      let historyData = await getDeliveryHistory(userId);

      // If no history found by ID, try using the username/name
      if ((!historyData || historyData.length === 0) && user.username) {
        console.log("No history found by ID, trying username:", user.username);
        historyData = await getDeliveryHistory(user.username);
      } else if ((!historyData || historyData.length === 0) && user.name) {
        console.log("No history found by ID, trying name:", user.name);
        historyData = await getDeliveryHistory(user.name);
      }

      console.log("Fetched delivery history:", historyData);
      setDeliveryHistory(historyData);

      // Calculate stats
      const totalCompleted = historyData.length;
      const today = new Date().toDateString();
      const completedToday = historyData.filter(
        (d) => new Date(d.delivered_at).toDateString() === today
      ).length;

      const totalEarnings = historyData.reduce((sum, delivery) => {
        // Assuming delivery person gets 80% of the delivery fee (which is 10% of order total)
        const deliveryFee = (delivery.order?.total_price || 0) * 0.1;
        const earnings = deliveryFee * 0.8;
        return sum + earnings;
      }, 0);

      setStats({
        totalDeliveries: totalCompleted,
        completedToday,
        earnings: totalEarnings.toFixed(2),
        avgRating: 4.8, // Placeholder - would come from actual ratings
      });
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      if (!silent) {
        toast.error("Failed to load deliveries");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Replace the startLocationTracking function with this version that doesn't use hooks inside it
  const watchIdRef = useRef(null);
  const startLocationTracking = () => {
    const handleLocationUpdate = (position) => {
      const { latitude, longitude } = position.coords;
      setCurrentLocation({
        lat: latitude,
        lng: longitude,
      });

      // If there's a selected delivery, update its location on the server
      if (selectedDelivery) {
        updateDeliveryLocation(selectedDelivery._id, latitude, longitude);
      }
    };

    // Regular function instead of useCallback
    const tryFallbackLocation = () => {
      if (!fallbackLocationUsed) {
        // Use a location near the pickup location or a default location
        if (
          selectedDelivery &&
          selectedDelivery.pickup_location &&
          selectedDelivery.pickup_location.coordinates
        ) {
          const fallbackLat =
            Number.parseFloat(
              selectedDelivery.pickup_location.coordinates.lat
            ) + 0.01;
          const fallbackLng =
            Number.parseFloat(
              selectedDelivery.pickup_location.coordinates.lng
            ) + 0.01;

          setCurrentLocation({
            lat: fallbackLat,
            lng: fallbackLng,
          });

          console.log("Using fallback location near restaurant:", {
            lat: fallbackLat,
            lng: fallbackLng,
          });
          setFallbackLocationUsed(true);
          return;
        }

        // Default fallback to a location (this should be customized based on your service area)
        setCurrentLocation({
          lat: 6.9271, // Default to Colombo, Sri Lanka coordinates
          lng: 79.8612,
        });
        console.log("Using default fallback location");
        setFallbackLocationUsed(true);
      }
    };

    const handleLocationError = (error) => {
      console.error("Error tracking location:", error);
      // Don't show repeated errors for watchPosition
      if (!currentLocation && !fallbackLocationUsed) {
        tryFallbackLocation();
      }
    };

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      tryFallbackLocation();
      return;
    }

    // Get current position once
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleLocationUpdate(position);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error(
          "Using approximate location. Enable location services for better accuracy."
        );
        tryFallbackLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    // Set up continuous tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        handleLocationUpdate(position);
      },
      (error) => {
        handleLocationError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );

    // Clean up on component unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  };

  const updateDeliveryLocation = async (deliveryId, lat, lng) => {
    try {
      await fetch(
        `http://localhost:5003/api/deliveries/${deliveryId}/location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ lat, lng }),
        }
      );
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  // Update the handleAcceptDelivery function to properly handle real orders
  const handleAcceptDelivery = async (deliveryId) => {
    try {
      // Find the delivery from available list
      const delivery = availableDeliveries.find((d) => d._id === deliveryId);

      if (!delivery) {
        toast.error("Delivery not found");
        return;
      }

      // Get the user ID or name to use for assignment
      const deliveryPersonId =
        user._id ||
        user.id ||
        user.userId ||
        user.uid ||
        user.username ||
        user.name;

      if (!deliveryPersonId) {
        toast.error("User ID not available. Please try logging in again.");
        return;
      }

      // Assign the delivery to this delivery person
      const response = await fetch(
        `http://localhost:5003/api/deliveries/${deliveryId}/assign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            delivery_person_id: deliveryPersonId,
            delivery_person_name: user.name,
            order_details: delivery.order, // Pass the order details to the backend
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign delivery");
      }

      const updatedDelivery = await response.json();

      // Try to fetch the complete order details if not already available
      let orderDetails = delivery.order;
      if (
        !orderDetails ||
        !orderDetails.total_price ||
        orderDetails.total_price === 0
      ) {
        try {
          const fetchedOrder = await getOrderById(delivery.order_id);
          orderDetails = {
            total_price: fetchedOrder.total_price || 0,
            items: fetchedOrder.items?.length || 0,
            subtotal: fetchedOrder.subtotal || 0,
            tax_amount: fetchedOrder.tax_amount || 0,
          };
        } catch (error) {
          console.error(
            `Failed to fetch order details for delivery ${delivery._id}:`,
            error
          );
        }
      }

      toast.success("Delivery accepted!");

      // Create a new active delivery with complete order details
      const newActiveDelivery = {
        ...updatedDelivery,
        status: "ASSIGNED",
        assigned_at: new Date().toISOString(),
        delivery_person_id: deliveryPersonId,
        delivery_person_name: user.name,
        order: orderDetails,
      };

      console.log(
        "Adding new active delivery with order details:",
        newActiveDelivery
      );

      // Add the new delivery to active deliveries
      setActiveDeliveries((prev) => [newActiveDelivery, ...prev]);

      // Select this delivery to show on map
      setSelectedDelivery(newActiveDelivery);

      // Remove from available deliveries list
      setAvailableDeliveries((prev) =>
        prev.filter((d) => d._id !== deliveryId)
      );
    } catch (error) {
      console.error("Error accepting delivery:", error);
      toast.error("Failed to accept delivery");
    }
  };

  const handleRejectDelivery = (deliveryId) => {
    // In a real app, this would call an API to reject the delivery
    setAvailableDeliveries((prev) => prev.filter((d) => d._id !== deliveryId));
    toast.info("Delivery rejected");
  };

  // Update the handleUpdateStatus function to properly refresh data after delivery completion
  const handleUpdateStatus = async (deliveryId, newStatus) => {
    try {
      // If we're completing a delivery, make sure we have the order details first
      if (newStatus === "DELIVERED") {
        const delivery = activeDeliveries.find((d) => d._id === deliveryId);
        if (
          delivery &&
          (!delivery.order ||
            !delivery.order.total_price ||
            delivery.order.total_price === 0)
        ) {
          try {
            console.log(
              `Fetching order details before completing delivery ${deliveryId}`
            );
            const orderDetails = await getOrderById(delivery.order_id);

            // Update the delivery with order details before completing
            const updatedDelivery = {
              ...delivery,
              order: {
                total_price: orderDetails.total_price || 0,
                items: orderDetails.items?.length || 0,
                subtotal: orderDetails.subtotal || 0,
                tax_amount: orderDetails.tax_amount || 0,
              },
            };

            // Update the delivery in active deliveries
            setActiveDeliveries((prev) =>
              prev.map((d) => (d._id === deliveryId ? updatedDelivery : d))
            );

            // If this is the selected delivery, update it too
            if (selectedDelivery && selectedDelivery._id === deliveryId) {
              setSelectedDelivery(updatedDelivery);
            }
          } catch (error) {
            console.error(
              `Failed to fetch order details before completing delivery ${deliveryId}:`,
              error
            );
          }
        }
      }

      await updateDeliveryStatus(deliveryId, newStatus);

      // Update the delivery in our state
      setActiveDeliveries((prev) =>
        prev.map((d) =>
          d._id === deliveryId
            ? {
                ...d,
                status: newStatus,
                ...(newStatus === "PICKED_UP"
                  ? { picked_up_at: new Date().toISOString() }
                  : {}),
                ...(newStatus === "DELIVERED"
                  ? { delivered_at: new Date().toISOString() }
                  : {}),
              }
            : d
        )
      );

      // If the selected delivery is being updated, update it too
      if (selectedDelivery && selectedDelivery._id === deliveryId) {
        setSelectedDelivery((prev) => ({
          ...prev,
          status: newStatus,
          ...(newStatus === "PICKED_UP"
            ? { picked_up_at: new Date().toISOString() }
            : {}),
          ...(newStatus === "DELIVERED"
            ? { delivered_at: new Date().toISOString() }
            : {}),
        }));
      }

      // If delivery is completed, refresh the data
      if (newStatus === "DELIVERED") {
        toast.success("Delivery completed successfully!");

        // Wait a moment for the backend to update
        setTimeout(() => {
          fetchDeliveries(true);
        }, 1000);

        // If the delivery was completed, remove it from active deliveries after a delay
        setTimeout(() => {
          setActiveDeliveries((prev) =>
            prev.filter((d) => d._id !== deliveryId)
          );
          if (selectedDelivery && selectedDelivery._id === deliveryId) {
            setSelectedDelivery(null);
          }
        }, 3000);
      } else {
        toast.success(
          `Delivery status updated to ${newStatus.replace(/_/g, " ")}`
        );
      }
    } catch (error) {
      console.error("Error updating delivery status:", error);
      toast.error("Failed to update delivery status");
    }
  };

  const handleSelectDelivery = async (delivery) => {
    // If the delivery has missing or zero order details, try to fetch them
    if (
      !delivery.order ||
      !delivery.order.total_price ||
      delivery.order.total_price === 0
    ) {
      try {
        const orderDetails = await getOrderById(delivery.order_id);
        delivery = {
          ...delivery,
          order: {
            total_price: orderDetails.total_price || 0,
            items: orderDetails.items?.length || 0,
            subtotal: orderDetails.subtotal || 0,
            tax_amount: orderDetails.tax_amount || 0,
          },
        };

        // Also update the delivery in the active deliveries list
        setActiveDeliveries((prev) =>
          prev.map((d) => (d._id === delivery._id ? delivery : d))
        );
      } catch (error) {
        console.error(
          `Failed to fetch order details for selected delivery ${delivery._id}:`,
          error
        );
      }
    }

    setSelectedDelivery(delivery);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delivery dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - Deliveries list */}
          <div className="w-full md:w-1/3">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Delivery Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome back, {user?.name || "Delivery Partner"}
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-orange-500 text-orange-500 hover:bg-orange-50"
                  onClick={() => fetchDeliveries(true)}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-50"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Link href="/dashboard/delivery/earnings">
                <Card className="bg-white border-none shadow-md hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Earnings</p>
                        <p className="text-2xl font-bold">${stats.earnings}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/delivery/history">
                <Card className="bg-white border-none shadow-md hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">History</p>
                        <p className="text-2xl font-bold">
                          {stats.totalDeliveries}
                        </p>
                      </div>
                      <History className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="active">
                  Active ({activeDeliveries.length})
                </TabsTrigger>
                <TabsTrigger value="available">
                  Available ({availableDeliveries.length})
                </TabsTrigger>
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
                      className={`border-none shadow-md cursor-pointer transition-all ${
                        selectedDelivery?._id === delivery._id
                          ? "ring-2 ring-orange-500"
                          : ""
                      }`}
                      onClick={() => handleSelectDelivery(delivery)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            Order #{delivery.order_id.substring(0, 6)}
                          </CardTitle>
                          <Badge
                            className={
                              delivery.status === "DELIVERED"
                                ? "bg-green-100 text-green-700"
                                : delivery.status === "PICKED_UP" ||
                                  delivery.status === "IN_TRANSIT"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }
                          >
                            {delivery.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <CardDescription>
                          {delivery.restaurant_contact?.name || "Restaurant"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Pickup</p>
                              <p className="text-gray-500 truncate">
                                {delivery.pickup_location?.address}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Delivery</p>
                              <p className="text-gray-500 truncate">
                                {delivery.delivery_location?.address}
                              </p>
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
                              <span className="font-medium">
                                ${(delivery.order?.total_price || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {delivery.status === "ASSIGNED" && (
                              <Button
                                className="w-full bg-orange-500 hover:bg-orange-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(delivery._id, "PICKED_UP");
                                }}
                              >
                                Mark as Picked Up
                              </Button>
                            )}

                            {(delivery.status === "PICKED_UP" ||
                              delivery.status === "IN_TRANSIT") && (
                              <Button
                                className="w-full bg-green-500 hover:bg-green-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(delivery._id, "DELIVERED");
                                }}
                              >
                                Complete Delivery
                              </Button>
                            )}

                            {delivery.status === "DELIVERED" && (
                              <Button
                                variant="outline"
                                className="w-full"
                                disabled
                              >
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
                          <CardTitle className="text-base">
                            Order #{delivery.order_id.substring(0, 6)}
                          </CardTitle>
                          <Badge className="bg-blue-100 text-blue-700">
                            New Order
                          </Badge>
                        </div>
                        <CardDescription>
                          {delivery.restaurant_contact?.name || "Restaurant"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Pickup</p>
                              <p className="text-gray-500 truncate">
                                {delivery.pickup_location?.address}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Delivery</p>
                              <p className="text-gray-500 truncate">
                                {delivery.delivery_location?.address}
                              </p>
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
                              <span className="font-medium">
                                ${(delivery.order?.total_price || 0).toFixed(2)}
                              </span>
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
                                : selectedDelivery.delivery_location?.address;

                            const encodedDestination =
                              encodeURIComponent(destination);
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`,
                              "_blank"
                            );
                          }}
                        >
                          <Navigation className="h-4 w-4 mr-2" /> Navigate
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-xl font-bold">
                            Order #{selectedDelivery.order_id.substring(0, 6)}
                          </h2>
                          <p className="text-gray-500">
                            {selectedDelivery.restaurant_contact?.name}
                          </p>
                        </div>
                        <Badge
                          className={
                            selectedDelivery.status === "DELIVERED"
                              ? "bg-green-100 text-green-700"
                              : selectedDelivery.status === "PICKED_UP" ||
                                selectedDelivery.status === "IN_TRANSIT"
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
                          <h3 className="text-lg font-medium mb-4">
                            Delivery Progress
                          </h3>
                          <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200"></div>
                            <div
                              className="absolute left-0 top-0 w-1 bg-green-500 transition-all duration-500"
                              style={{
                                height:
                                  selectedDelivery.status === "DELIVERED"
                                    ? "100%"
                                    : selectedDelivery.status === "PICKED_UP" ||
                                      selectedDelivery.status === "IN_TRANSIT"
                                    ? "50%"
                                    : "25%",
                              }}
                            ></div>

                            <div className="space-y-8 relative">
                              <div className="flex items-start pl-6">
                                <div
                                  className={`absolute left-0 top-1 h-4 w-4 rounded-full ${
                                    selectedDelivery.status
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                ></div>
                                <div>
                                  <h4 className="font-medium">
                                    Order Assigned
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {selectedDelivery.assigned_at
                                      ? new Date(
                                          selectedDelivery.assigned_at
                                        ).toLocaleString()
                                      : "Pending"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start pl-6">
                                <div
                                  className={`absolute left-0 top-1 h-4 w-4 rounded-full ${
                                    selectedDelivery.status === "PICKED_UP" ||
                                    selectedDelivery.status === "IN_TRANSIT" ||
                                    selectedDelivery.status === "DELIVERED"
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                ></div>
                                <div>
                                  <h4 className="font-medium">
                                    Food Picked Up
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {selectedDelivery.picked_up_at
                                      ? new Date(
                                          selectedDelivery.picked_up_at
                                        ).toLocaleString()
                                      : "Pending"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start pl-6">
                                <div
                                  className={`absolute left-0 top-1 h-4 w-4 rounded-full ${
                                    selectedDelivery.status === "DELIVERED"
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                ></div>
                                <div>
                                  <h4 className="font-medium">Delivered</h4>
                                  <p className="text-sm text-gray-500">
                                    {selectedDelivery.delivered_at
                                      ? new Date(
                                          selectedDelivery.delivered_at
                                        ).toLocaleString()
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
                            <h3 className="text-lg font-medium mb-3">
                              Pickup Details
                            </h3>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Restaurant
                                </p>
                                <p className="font-medium">
                                  {selectedDelivery.restaurant_contact?.name}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium">
                                  {selectedDelivery.pickup_location?.address}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">
                                  {selectedDelivery.restaurant_contact?.phone ||
                                    "Not available"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-medium mb-3">
                              Delivery Details
                            </h3>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Customer
                                </p>
                                <p className="font-medium">
                                  {selectedDelivery.customer_contact?.name ||
                                    "Customer"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium">
                                  {selectedDelivery.delivery_location?.address}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">
                                  {selectedDelivery.customer_contact?.phone ||
                                    "Not available"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Order details */}
                        <div>
                          <h3 className="text-lg font-medium mb-3">
                            Order Details
                          </h3>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">Items</p>
                              <p className="font-medium">
                                {selectedDelivery.order?.items || 0} items
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Order Total
                              </p>
                              <p className="font-medium">
                                $
                                {(
                                  selectedDelivery.order?.total_price || 0
                                ).toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Delivery Fee
                              </p>
                              <p className="font-medium">
                                $
                                {(
                                  (selectedDelivery.order?.total_price || 0) *
                                  0.1
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 mt-6">
                          {selectedDelivery.status === "ASSIGNED" && (
                            <Button
                              className="flex-1 bg-orange-500 hover:bg-orange-600"
                              onClick={() =>
                                handleUpdateStatus(
                                  selectedDelivery._id,
                                  "PICKED_UP"
                                )
                              }
                            >
                              Mark as Picked Up
                            </Button>
                          )}

                          {(selectedDelivery.status === "PICKED_UP" ||
                            selectedDelivery.status === "IN_TRANSIT") && (
                            <Button
                              className="flex-1 bg-green-500 hover:bg-green-600"
                              onClick={() =>
                                handleUpdateStatus(
                                  selectedDelivery._id,
                                  "DELIVERED"
                                )
                              }
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
                                  : selectedDelivery.delivery_location?.address;

                              const encodedDestination =
                                encodeURIComponent(destination);
                              window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`,
                                "_blank"
                              );
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
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        No Delivery Selected
                      </h3>
                      <p className="text-sm text-gray-500 max-w-md">
                        Select an active delivery from the list to view details
                        and track on the map.
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
  );
}
