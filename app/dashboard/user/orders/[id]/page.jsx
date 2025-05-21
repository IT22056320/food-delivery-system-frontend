"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getOrderById } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function OrderDetailsPage({ params }) {
  const { id } = params;
  const { user, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // Use our enhanced getOrderById function that handles auth bypass
      const orderData = await getOrderById(id);
      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to fetch order details. " + error.message);
      toast.error("Failed to fetch order details");
    } finally {
      setIsLoading(false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
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
                <CardTitle className="text-2xl">Order Details</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Order #{id.substring(0, 8)}
                </p>
              </div>
              {getStatusBadge(order.order_status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Order Information
                </h3>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">
                      Placed on:{" "}
                      {formatDate(order.createdAt || order.created_at)}
                    </span>
                  </div>
                  <div className="flex items-start mb-2">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      {order.delivery_address}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs">
                      {order.payment_method}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`ml-2 text-xs ${
                        order.payment_status === "COMPLETED"
                          ? "border-green-200 text-green-700"
                          : order.payment_status === "PENDING"
                          ? "border-yellow-200 text-yellow-700"
                          : "border-red-200 text-red-700"
                      }`}
                    >
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Restaurant
                </h3>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-1">
                    {order.restaurant?.name || "Restaurant Name"}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {order.restaurant?.address || "Restaurant Address"}
                  </p>
                  {order.restaurant?.phone && (
                    <a
                      href={`tel:${order.restaurant.phone}`}
                      className="text-sm text-blue-600"
                    >
                      {order.restaurant.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Order Items
            </h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Order Summary
            </h3>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm text-gray-800">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">
                  Tax ({(order.tax_rate * 100).toFixed(0)}%)
                </span>
                <span className="text-sm text-gray-800">
                  {formatCurrency(order.tax_amount)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Delivery Fee</span>
                <span className="text-sm text-gray-800">
                  {formatCurrency(order.delivery_fee)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between py-2">
                <span className="font-medium">Total</span>
                <span className="font-medium">
                  {formatCurrency(order.total_price)}
                </span>
              </div>
            </div>

            {[
              "PENDING",
              "CONFIRMED",
              "PREPARING",
              "READY_FOR_PICKUP",
              "OUT_FOR_DELIVERY",
            ].includes(order.order_status) && (
              <div className="mt-6 flex justify-center">
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() =>
                    router.push(`/dashboard/user/${order._id}/track`)
                  }
                >
                  Track Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
