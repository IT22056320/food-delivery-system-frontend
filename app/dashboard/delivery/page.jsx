"use client";

import { useState, useEffect, useCallback } from "react";
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
  Package,
  TrendingUp,
  LogOut,
  RefreshCw,
} from "lucide-react";
import DeliveryMap from "@/components/delivery-map";
import {
  getActiveDeliveries,
  getDeliveryHistory,
  updateDeliveryStatus,
  getAvailableDeliveries,
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

  const useFallbackLocation = useCallback(() => {
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
  }, [selectedDelivery, setCurrentLocation]);

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
      fetchDeliveries();
      startLocationTracking();

      // Set up periodic refresh
      const refreshInterval = setInterval(() => {
        fetchDeliveries(true);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [loading, user, router, useFallbackLocation]);

  // Update the fetchDeliveries function to properly fetch real orders from the backend
  const fetchDeliveries = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // Fetch active deliveries assigned to this delivery person
      const activeData = await getActiveDeliveries(user.id);
      console.log("Active deliveries:", activeData);
      setActiveDeliveries(activeData);

      // Fetch available deliveries that haven't been assigned yet
      try {
        // First try to fetch pending deliveries from the delivery service
        const pendingDeliveries = await getAvailableDeliveries();
        console.log("Pending deliveries:", pendingDeliveries);

        // Transform delivery data to the format we need
        const availableOrders = pendingDeliveries.map((delivery) => ({
          _id: delivery._id,
          order_id: delivery.order_id,
          restaurant_contact: delivery.restaurant_contact,
          pickup_location: delivery.pickup_location,
          delivery_location: delivery.delivery_location,
          order: delivery.order,
          estimated_delivery_time: 30,
          created_at: delivery.createdAt,
          isRealOrder: true, // Flag to identify real orders
        }));

        console.log("Available orders to display:", availableOrders);
        setAvailableDeliveries(availableOrders);
      } catch (error) {
        console.error("Error fetching available orders:", error);
        setAvailableDeliveries([]);
      }

      // Fetch delivery history
      const historyData = await getDeliveryHistory(user.id);
      setDeliveryHistory(historyData);

      // Calculate stats
      const totalCompleted = historyData.length;
      const today = new Date().toDateString();
      const completedToday = historyData.filter(
        (d) => new Date(d.delivered_at).toDateString() === today
      ).length;

      const totalEarnings = historyData.reduce((sum, delivery) => {
        // Assuming delivery person gets 80% of the delivery fee (which is 10% of order total)
        const deliveryFee = delivery.order.total_price * 0.1;
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

  // Update the startLocationTracking function to handle errors better and provide fallback coordinates

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      useFallbackLocation();
      return;
    }

    // Get current position once
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({
          lat: latitude,
          lng: longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error(
          "Using approximate location. Enable location services for better accuracy."
        );
        if (!fallbackLocationUsed) {
          useFallbackLocation();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    // Set up continuous tracking
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({
          lat: latitude,
          lng: longitude,
        });

        // If there's a selected delivery, update its location on the server
        if (selectedDelivery) {
          updateDeliveryLocation(selectedDelivery._id, latitude, longitude);
        }
      },
      (error) => {
        console.error("Error tracking location:", error);
        // Don't show repeated errors for watchPosition
        if (!currentLocation && !fallbackLocationUsed) {
          useFallbackLocation();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );

    // Clean up on component unmount
    return () => {
      navigator.geolocation.clearWatch(watchId);
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
            delivery_person_name: user.name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign delivery");
      }

      const updatedDelivery = await response.json();

      toast.success("Delivery accepted!");

      // Add the new delivery to active deliveries
      setActiveDeliveries((prev) => [
        ...prev,
        {
          ...updatedDelivery,
          status: "ASSIGNED",
          assigned_at: new Date().toISOString(),
          delivery_person_id: user.id,
        },
      ]);

      // Select this delivery to show on map
      setSelectedDelivery({
        ...updatedDelivery,
        status: "ASSIGNED",
        assigned_at: new Date().toISOString(),
        delivery_person_id: user.id,
      });

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

  const handleUpdateStatus = async (deliveryId, newStatus) => {
    try {
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
        fetchDeliveries();
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

  const handleSelectDelivery = (delivery) => {
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

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="bg-white border-none shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Today's Deliveries
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.completedToday}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Earnings</p>
                      <p className="text-2xl font-bold">${stats.earnings}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
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
                                : delivery.status === "PICKED_UP"
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
                                ${delivery.order?.total_price.toFixed(2)}
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

                            {delivery.status === "PICKED_UP" && (
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
                                ${delivery.order?.total_price.toFixed(2)}
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

              <TabsContent value="history" className="space-y-4">
                {deliveryHistory.length === 0 ? (
                  <Card className="border-none shadow-md">
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-500">No delivery history</p>
                    </CardContent>
                  </Card>
                ) : (
                  deliveryHistory.map((delivery) => (
                    <Card key={delivery._id} className="border-none shadow-md">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            Order #{delivery.order_id.substring(0, 6)}
                          </CardTitle>
                          <Badge className="bg-green-100 text-green-700">
                            {delivery.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {new Date(
                            delivery.delivered_at || delivery.createdAt
                          ).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span>
                              {delivery.restaurant_contact?.name ||
                                "Restaurant"}
                            </span>
                            <span className="font-medium">
                              ${delivery.order?.total_price.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <p className="text-gray-500 truncate">
                              {delivery.delivery_location?.address}
                            </p>
                          </div>
                        </div>
                      </CardContent>
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
                              : selectedDelivery.status === "PICKED_UP"
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
                                    : selectedDelivery.status === "PICKED_UP"
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
                                {selectedDelivery.order?.total_price.toFixed(
                                  2
                                ) || "0.00"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Delivery Fee
                              </p>
                              <p className="font-medium">
                                $
                                {(
                                  selectedDelivery.order?.total_price * 0.1
                                ).toFixed(2) || "0.00"}
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

                          {selectedDelivery.status === "PICKED_UP" && (
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
