"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CreditCard,
  Clock,
  MapPin,
  Receipt,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import DeliveryMap from "@/components/delivery-map";
import { getDeliveryByOrderId } from "@/lib/delivery-api";

export default function OrderDetailsPage({ params }) {
  const { id } = params;
  const { user, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchOrderDetails();
      }
    }
  }, [user, loading, router, id]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch order details
      const orderRes = await fetch(`http://localhost:5002/api/orders/${id}`, {
        credentials: "include",
      });

      if (!orderRes.ok) {
        throw new Error("Failed to fetch order details");
      }

      const orderData = await orderRes.json();
      setOrder(orderData);

      // Try to fetch delivery details if available
      try {
        const deliveryData = await getDeliveryByOrderId(id);
        setDelivery(deliveryData);

        // If delivery exists and is in progress, show the map by default
        if (
          deliveryData &&
          ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(deliveryData.status)
        ) {
          setShowMap(true);
        }
      } catch (error) {
        console.log("No delivery found for this order yet");
        // It's okay if there's no delivery yet
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to load order details. Please try again.");
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.replace(/_/g, " ");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatPrice = (price) => {
    return `$${Number.parseFloat(price).toFixed(2)}`;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
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
            Error Loading Order
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

  // Calculate subtotal, delivery fee, and total
  const subtotal =
    order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    0;
  const deliveryFee = subtotal * 0.1; // 10% of subtotal
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
      <div className="max-w-4xl mx-auto">
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
                <CardTitle className="text-2xl">
                  Order #{id.substring(0, 8)}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <Badge
                className={`${
                  order.status === "DELIVERED"
                    ? "bg-green-100 text-green-800"
                    : order.status === "CANCELLED"
                    ? "bg-red-100 text-red-800"
                    : "bg-orange-100 text-orange-800"
                } px-3 py-1 text-sm`}
              >
                {formatStatus(order.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Receipt className="h-4 w-4 text-gray-500" />
                      <span>Order ID</span>
                    </div>
                    <span className="text-gray-600">{id.substring(0, 8)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Order Date</span>
                    </div>
                    <span className="text-gray-600">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4 text-gray-500" />
                      <span>Status</span>
                    </div>
                    <Badge
                      className={`${
                        order.status === "DELIVERED"
                          ? "bg-green-100 text-green-800"
                          : order.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {formatStatus(order.status)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span>Payment Method</span>
                    </div>
                    <span>
                      {order.paymentMethod
                        ? order.paymentMethod.charAt(0).toUpperCase() +
                          order.paymentMethod.slice(1)
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Customer</span>
                    </div>
                    <span className="text-gray-600">{user.name}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">
                  Delivery Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-1">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <span>Delivery Address</span>
                    </div>
                    <span className="text-gray-600 text-right">
                      {order.delivery_address || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span>Delivery Status</span>
                    </div>
                    <Badge
                      className={`${
                        delivery?.status === "DELIVERED"
                          ? "bg-green-100 text-green-800"
                          : delivery?.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {delivery ? formatStatus(delivery.status) : "Pending"}
                    </Badge>
                  </div>
                  {delivery && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>Delivery Person</span>
                      </div>
                      <span className="text-gray-600">
                        {delivery.delivery_person_name || "Not assigned yet"}
                      </span>
                    </div>
                  )}
                  {delivery && delivery.estimated_delivery_time && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Estimated Delivery</span>
                      </div>
                      <span className="text-gray-600">
                        {formatDate(delivery.estimated_delivery_time)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Tracking Map */}
            {delivery && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">Track Your Delivery</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMap(!showMap)}
                  >
                    {showMap ? "Hide Map" : "Show Map"}
                  </Button>
                </div>

                {showMap && (
                  <div className="h-[400px] rounded-lg overflow-hidden mb-4">
                    <DeliveryMap
                      deliveryId={delivery._id}
                      pickupLocation={delivery.pickup_location}
                      deliveryLocation={delivery.delivery_location}
                      currentLocation={delivery.current_location}
                      isDeliveryPerson={false}
                      className="h-full w-full"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/user/${id}/track`)}
                  >
                    <Truck className="h-4 w-4 mr-2" /> Full Tracking View
                  </Button>

                  <div className="text-sm text-gray-500">
                    {delivery.status === "DELIVERED" ? (
                      <span className="text-green-600 font-medium">
                        Delivered on {formatDate(delivery.delivered_at)}
                      </span>
                    ) : delivery.status === "PICKED_UP" ||
                      delivery.status === "IN_TRANSIT" ? (
                      <span>Your order is on the way!</span>
                    ) : delivery.status === "ASSIGNED" ? (
                      <span>Delivery person is heading to the restaurant</span>
                    ) : (
                      <span>Waiting for a delivery person to be assigned</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-6" />

            <div>
              <h3 className="text-lg font-medium mb-4">Order Items</h3>
              {order.items && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.price)} x {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No items found in this order</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
