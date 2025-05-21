"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Store,
  User,
  Package,
  Check,
  AlertTriangle,
} from "lucide-react";
import DeliveryMap from "@/components/delivery-map";
import { toast } from "sonner";
import { getOrderById } from "@/lib/api";

export default function TrackOrderPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const { user, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bypassedAuth, setBypassedAuth] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchOrderAndDelivery();
      }
    }
  }, [user, loading, router, id]);

  // Update the fetchOrderAndDelivery function to use our new getOrderById function
  const fetchOrderAndDelivery = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use our enhanced getOrderById function that handles auth bypass
      const orderData = await getOrderById(id);
      setOrder(orderData);

      // Check if this is a mock/bypassed order
      if (orderData.is_mock) {
        setBypassedAuth(true);
        // For mock orders, create mock delivery data
        setDelivery(createMockDelivery(orderData));
        return;
      }

      // Fetch delivery data if available
      if (orderData.delivery_id) {
        try {
          const deliveryRes = await fetch(
            `http://localhost:5003/api/deliveries/${orderData.delivery_id}`,
            {
              credentials: "include",
            }
          );

          if (deliveryRes.ok) {
            const deliveryData = await deliveryRes.json();
            setDelivery(deliveryData);
          }
        } catch (error) {
          console.error("Error fetching delivery:", error);
          // Continue without delivery data
        }
      } else {
        // If no delivery_id, try to find delivery by order_id
        try {
          const deliveryByOrderRes = await fetch(
            `http://localhost:5003/api/deliveries/by-order/${id}`,
            {
              credentials: "include",
            }
          );

          if (deliveryByOrderRes.ok) {
            const deliveryData = await deliveryByOrderRes.json();
            setDelivery(deliveryData);
          }
        } catch (error) {
          console.error("Error fetching delivery by order ID:", error);
          // No delivery found, continue without it

          // For development, create a mock delivery if none exists
          if (orderData.order_status === "OUT_FOR_DELIVERY") {
            setDelivery(createMockDelivery(orderData));
            setBypassedAuth(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching order and delivery:", error);
      setError("Failed to load tracking information. Please try again.");
      toast.error("Failed to load tracking information");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to create mock delivery data
  const createMockDelivery = (orderData) => {
    const now = new Date();

    return {
      _id: `mock_delivery_${orderData._id}`,
      order_id: orderData._id,
      status: "IN_TRANSIT",
      pickup_location: {
        address: orderData.restaurant?.address || "Restaurant Address",
        coordinates: orderData.restaurant?.coordinates || {
          lat: 6.9271,
          lng: 79.8612,
        },
      },
      delivery_location: {
        address: orderData.delivery_address,
        coordinates: orderData.delivery_coordinates || {
          lat: 6.9344,
          lng: 79.8428,
        },
      },
      current_location: {
        // Position the delivery person somewhere along the route
        lat: 6.9308, // Halfway between pickup and delivery
        lng: 79.852, // Halfway between pickup and delivery
        updated_at: new Date().toISOString(),
      },
      delivery_person_name: "Saman Perera",
      customer_contact: {
        name: "Customer",
        phone: "+94 77 123 4567",
      },
      restaurant_contact: {
        name: orderData.restaurant?.name || "Restaurant",
        phone: "+94 11 234 5678",
      },
      estimated_delivery_time:
        orderData.estimated_delivery_time ||
        new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
      picked_up_at:
        orderData.out_delivery_time ||
        new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
      is_mock: true,
    };
  };

  // Add a function to periodically refresh the tracking data
  useEffect(() => {
    let intervalId;

    if (
      !loading &&
      user &&
      order &&
      (order.order_status === "OUT_FOR_DELIVERY" ||
        order.order_status === "READY_FOR_PICKUP")
    ) {
      // Set up polling to refresh tracking data every 15 seconds
      intervalId = setInterval(() => {
        fetchOrderAndDelivery();
      }, 15000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loading, user, order]);

  const getStatusStep = (status) => {
    const statusSteps = {
      PENDING: 0,
      CONFIRMED: 1,
      PREPARING: 2,
      READY_FOR_PICKUP: 3,
      OUT_FOR_DELIVERY: 4,
      DELIVERED: 5,
    };
    return statusSteps[status] || 0;
  };

  const getProgressValue = (status) => {
    const step = getStatusStep(status);
    return (step / 5) * 100;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getEstimatedDeliveryTime = () => {
    if (!order) return "N/A";
    const estimatedTime =
      order.estimated_delivery_time ||
      (delivery && delivery.estimated_delivery_time);
    return estimatedTime ? formatTime(estimatedTime) : "N/A";
  };

  const getEstimatedDeliveryDate = () => {
    if (!order) return "N/A";
    const estimatedTime =
      order.estimated_delivery_time ||
      (delivery && delivery.estimated_delivery_time);
    return estimatedTime ? formatDate(estimatedTime) : "N/A";
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            Error Loading Tracking
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push("/dashboard/user/orders")}>
            Return to Orders
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-amber-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            Order Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Button onClick={() => router.push("/dashboard/user/orders")}>
            Return to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
      <div className="max-w-4xl mx-auto">
        {bypassedAuth && (
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
                    purposes.
                    {order.is_mock
                      ? " This is a mock order generated for development."
                      : " This order may not belong to the current user."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/dashboard/user/orders")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>

        <Card className="border-none shadow-xl mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Track Order</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Order #{id.substring(0, 8)}
                </p>
              </div>
              <Badge
                className={`${
                  order?.order_status === "DELIVERED"
                    ? "bg-green-100 text-green-800"
                    : order?.order_status === "CANCELLED"
                    ? "bg-red-100 text-red-800"
                    : "bg-orange-100 text-orange-800"
                } px-3 py-1 text-sm`}
              >
                {order?.order_status
                  ? order.order_status.replace(/_/g, " ")
                  : "Processing"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <div className="mb-2 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">
                  Order Progress
                </h3>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    Estimated Delivery: {getEstimatedDeliveryTime()} (
                    {getEstimatedDeliveryDate()})
                  </span>
                </div>
              </div>
              <Progress
                value={getProgressValue(order.order_status)}
                className="h-2"
              />
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2 text-xs">
                <div className="text-center">
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                      getStatusStep(order.order_status) >= 0
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {getStatusStep(order.order_status) > 0 ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      "1"
                    )}
                  </div>
                  <p className="mt-1">Placed</p>
                </div>
                <div className="text-center">
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                      getStatusStep(order.order_status) >= 1
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {getStatusStep(order.order_status) > 1 ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      "2"
                    )}
                  </div>
                  <p className="mt-1">Confirmed</p>
                </div>
                <div className="text-center">
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                      getStatusStep(order.order_status) >= 2
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {getStatusStep(order.order_status) > 2 ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      "3"
                    )}
                  </div>
                  <p className="mt-1">Preparing</p>
                </div>
                <div className="text-center">
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                      getStatusStep(order.order_status) >= 3
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {getStatusStep(order.order_status) > 3 ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      "4"
                    )}
                  </div>
                  <p className="mt-1">Ready</p>
                </div>
                <div className="text-center">
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                      getStatusStep(order.order_status) >= 4
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {getStatusStep(order.order_status) > 4 ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      "5"
                    )}
                  </div>
                  <p className="mt-1">On the way</p>
                </div>
                <div className="text-center">
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                      getStatusStep(order.order_status) >= 5
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    6
                  </div>
                  <p className="mt-1">Delivered</p>
                </div>
              </div>
            </div>

            {delivery && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Delivery Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-orange-500 mt-0.5 mr-2" />
                      <div>
                        <h4 className="font-medium text-gray-700">
                          Delivery Person
                        </h4>
                        <p className="text-gray-600">
                          {delivery.delivery_person_name || "Not assigned yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-start">
                      <Store className="h-5 w-5 text-orange-500 mt-0.5 mr-2" />
                      <div>
                        <h4 className="font-medium text-gray-700">
                          Restaurant
                        </h4>
                        <p className="text-gray-600">
                          {order.restaurant?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {delivery.pickup_location?.address}
                        </p>
                        {delivery.restaurant_contact?.phone && (
                          <div className="flex items-center mt-1">
                            <Phone className="h-3 w-3 text-gray-400 mr-1" />
                            <a
                              href={`tel:${delivery.restaurant_contact.phone}`}
                              className="text-xs text-blue-600"
                            >
                              {delivery.restaurant_contact.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-orange-500 mt-0.5 mr-2" />
                      <div>
                        <h4 className="font-medium text-gray-700">
                          Delivery Address
                        </h4>
                        <p className="text-gray-600">
                          {order.delivery_address}
                        </p>
                        {delivery.customer_contact?.phone && (
                          <div className="flex items-center mt-1">
                            <Phone className="h-3 w-3 text-gray-400 mr-1" />
                            <a
                              href={`tel:${delivery.customer_contact.phone}`}
                              className="text-xs text-blue-600"
                            >
                              {delivery.customer_contact.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-start">
                      <Package className="h-5 w-5 text-orange-500 mt-0.5 mr-2" />
                      <div>
                        <h4 className="font-medium text-gray-700">
                          Order Status
                        </h4>
                        <p className="text-gray-600">
                          {order?.order_status
                            ? order.order_status.replace(/_/g, " ")
                            : "Processing"}
                        </p>
                        {delivery.picked_up_at && (
                          <p className="text-xs text-gray-500">
                            Picked up at: {formatTime(delivery.picked_up_at)}
                          </p>
                        )}
                        {delivery.delivered_at && (
                          <p className="text-xs text-gray-500">
                            Delivered at: {formatTime(delivery.delivered_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="h-[400px] rounded-lg overflow-hidden">
              <DeliveryMap
                deliveryId={id}
                pickupLocation={order.restaurant || delivery?.pickup_location}
                deliveryLocation={{
                  address: order.delivery_address,
                  coordinates:
                    order.delivery_coordinates ||
                    delivery?.delivery_location?.coordinates,
                }}
                currentLocation={delivery?.current_location}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
