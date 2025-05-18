// Delivery API functions

// Get all available deliveries
export async function getAvailableDeliveries() {
  try {
    const res = await fetch("http://localhost:5003/api/deliveries/available", {
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Error fetching available deliveries:", error);
      return []; // Return empty array instead of throwing
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch available deliveries:", error);
    return []; // Return empty array on error
  }
}

// Get all deliveries assigned to the current delivery person
export async function getMyDeliveries() {
  try {
    const res = await fetch(
      "http://localhost:5003/api/deliveries/my-deliveries",
      {
        credentials: "include",
      }
    );

    if (!res.ok) {
      const error = await res.json();
      console.error("Error fetching my deliveries:", error);
      return []; // Return empty array instead of throwing
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch my deliveries:", error);
    return []; // Return empty array on error
  }
}

// Get a delivery by ID
export async function getDeliveryById(id) {
  try {
    const res = await fetch(`http://localhost:5003/api/deliveries/${id}`, {
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch delivery");
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch delivery:", error);
    throw error;
  }
}

// Get order details by order ID - Modified to handle auth errors gracefully
export async function getOrderById(orderId) {
  try {
    console.log(`Fetching order details for order ID: ${orderId}`);
    const res = await fetch(`http://localhost:5002/api/orders/${orderId}`, {
      credentials: "include",
    });

    if (!res.ok) {
      // Instead of throwing, log the error and return a default order object
      let errorMessage = "Failed to fetch order";
      try {
        // Try to parse the error as JSON
        const errorData = await res.text();
        try {
          // Check if there's any content to parse
          if (errorData && errorData.trim()) {
            const parsedError = JSON.parse(errorData);
            // Safely extract message if it exists
            if (parsedError && typeof parsedError === "object") {
              errorMessage = parsedError.message || errorMessage;
              // Log safely without stringifying the entire object
              console.error(`Error fetching order ${orderId}: ${errorMessage}`);
            } else {
              console.error(
                `Error fetching order ${orderId}: Invalid error format`
              );
            }
          } else {
            console.error(`Error fetching order ${orderId}: Empty response`);
          }
        } catch (jsonError) {
          // If parsing fails, use the raw text
          console.error(
            `Error fetching order ${orderId}: Non-JSON response: ${errorData}`
          );
        }
      } catch (textError) {
        // If even getting text fails, log a generic error
        console.error(
          `Error fetching order ${orderId}: Unable to parse error response`,
          textError
        );
      }

      // Return a default order object with placeholder values
      return {
        total_price: 0,
        items: [],
        subtotal: 0,
        tax_amount: 0,
        error: errorMessage,
      };
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch order details:", error);
    // Return a default order object instead of throwing
    return {
      total_price: 0,
      items: [],
      subtotal: 0,
      tax_amount: 0,
      error: error.message || "Failed to fetch order",
    };
  }
}

// Assign a delivery to a delivery person
export async function assignDelivery(id, deliveryPersonName) {
  try {
    const res = await fetch(
      `http://localhost:5003/api/deliveries/${id}/assign`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ delivery_person_name: deliveryPersonName }),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to assign delivery");
    }

    return res.json();
  } catch (error) {
    console.error("Failed to assign delivery:", error);
    throw error;
  }
}

// Update delivery status
export async function updateDeliveryStatus(id, status, currentLocation) {
  try {
    const payload = {
      status,
    };

    if (currentLocation) {
      payload.current_location = currentLocation;
    }

    const res = await fetch(
      `http://localhost:5003/api/deliveries/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update delivery status");
    }

    return res.json();
  } catch (error) {
    console.error("Failed to update delivery status:", error);
    throw error;
  }
}

// Complete a delivery
export async function completeDelivery(id) {
  try {
    const res = await fetch(
      `http://localhost:5003/api/deliveries/${id}/complete`,
      {
        method: "PUT",
        credentials: "include",
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to complete delivery");
    }

    return res.json();
  } catch (error) {
    console.error("Failed to complete delivery:", error);
    throw error;
  }
}

// Get delivery statistics
export async function getDeliveryStats() {
  try {
    const res = await fetch("http://localhost:5003/api/deliveries/stats", {
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch delivery stats");
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch delivery stats:", error);
    throw error;
  }
}

// Get delivery by order ID
export async function getDeliveryByOrderId(orderId) {
  try {
    const res = await fetch(
      `http://localhost:5003/api/deliveries/by-order/${orderId}`,
      {
        credentials: "include",
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch delivery");
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch delivery by order ID:", error);
    throw error;
  }
}

// Get active deliveries for a delivery person
export async function getActiveDeliveries(deliveryPersonId) {
  try {
    // Check if deliveryPersonId is valid
    if (!deliveryPersonId) {
      console.error("No delivery person ID provided for getActiveDeliveries");
      return []; // Return empty array if no ID
    }

    console.log(
      `Fetching active deliveries for delivery person ${deliveryPersonId}`
    );

    // Try to fetch deliveries by ID first
    const res = await fetch(
      `http://localhost:5003/api/deliveries/delivery-person/${deliveryPersonId}/active`,
      {
        credentials: "include",
      }
    );

    if (!res.ok) {
      const error = await res.json();
      console.error("Error fetching active deliveries:", error);
      return []; // Return empty array instead of throwing
    }

    const deliveries = await res.json();
    console.log(`Received ${deliveries.length} active deliveries`);

    // Include IN_TRANSIT deliveries in active deliveries
    const activeDeliveries = deliveries.filter(
      (delivery) =>
        delivery.status === "ASSIGNED" ||
        delivery.status === "PICKED_UP" ||
        delivery.status === "IN_TRANSIT"
    );

    // Enhance deliveries with complete order details if needed
    const enhancedDeliveries = await Promise.all(
      activeDeliveries.map(async (delivery) => {
        // If order details are missing or incomplete, fetch them
        if (
          !delivery.order ||
          !delivery.order.total_price ||
          delivery.order.total_price === 0
        ) {
          try {
            console.log(
              `Fetching order details for delivery ${delivery._id}, order_id: ${delivery.order_id}`
            );
            const orderDetails = await getOrderById(delivery.order_id);

            // Use the order details if available, otherwise use defaults
            return {
              ...delivery,
              order: {
                total_price: orderDetails.total_price || 0,
                items: orderDetails.items?.length || 0,
                subtotal: orderDetails.subtotal || 0,
                tax_amount: orderDetails.tax_amount || 0,
              },
            };
          } catch (error) {
            console.error(
              `Failed to fetch order details for delivery ${delivery._id}:`,
              error
            );
            return delivery;
          }
        }
        return delivery;
      })
    );

    return enhancedDeliveries;
  } catch (error) {
    console.error("Failed to fetch active deliveries:", error);
    return []; // Return empty array on error
  }
}

// Get delivery history for a delivery person
export async function getDeliveryHistory(deliveryPersonId) {
  try {
    // Check if deliveryPersonId is valid
    if (!deliveryPersonId) {
      console.error("No delivery person ID provided for getDeliveryHistory");
      return []; // Return empty array if no ID
    }

    console.log(
      `Fetching delivery history for delivery person ${deliveryPersonId}`
    );
    const res = await fetch(
      `http://localhost:5003/api/deliveries/delivery-person/${deliveryPersonId}/history`,
      {
        credentials: "include",
      }
    );

    if (!res.ok) {
      const error = await res.json();
      console.error("Error fetching delivery history:", error);
      return []; // Return empty array instead of throwing
    }

    const deliveries = await res.json();
    console.log(`Received ${deliveries.length} deliveries from history API`);

    // If no deliveries, return empty array
    if (!deliveries || deliveries.length === 0) {
      return [];
    }

    // Enhance deliveries with complete order details if needed
    const enhancedDeliveries = await Promise.all(
      deliveries.map(async (delivery) => {
        // If order details are missing or incomplete, fetch them
        if (
          !delivery.order ||
          !delivery.order.total_price ||
          delivery.order.total_price === 0
        ) {
          try {
            console.log(
              `Fetching order details for delivery ${delivery._id}, order_id: ${delivery.order_id}`
            );
            const orderDetails = await getOrderById(delivery.order_id);

            // Use the order details if available, otherwise use defaults
            return {
              ...delivery,
              order: {
                total_price: orderDetails.total_price || 0,
                items: orderDetails.items?.length || 0,
                subtotal: orderDetails.subtotal || 0,
                tax_amount: orderDetails.tax_amount || 0,
              },
            };
          } catch (error) {
            console.error(
              `Failed to fetch order details for delivery ${delivery._id}:`,
              error
            );
            // Return delivery with default order values
            return {
              ...delivery,
              order: {
                total_price: delivery.order?.total_price || 0,
                items: delivery.order?.items || 0,
                subtotal: delivery.order?.subtotal || 0,
                tax_amount: delivery.order?.tax_amount || 0,
              },
            };
          }
        }
        return delivery;
      })
    );

    console.log(
      `Enhanced ${enhancedDeliveries.length} deliveries with order details`
    );
    return enhancedDeliveries;
  } catch (error) {
    console.error("Failed to fetch delivery history:", error);
    return []; // Return empty array on error
  }
}

// Get earnings statistics for a delivery person
export async function getEarningsStats(deliveryPersonId, timeFilter = "all") {
  try {
    // Check if deliveryPersonId is valid
    if (!deliveryPersonId) {
      console.error("No delivery person ID provided for getEarningsStats");
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        history: [],
      };
    }

    console.log(
      `Fetching earnings stats for delivery person ${deliveryPersonId} with timeFilter ${timeFilter}`
    );

    // Instead of relying on the backend earnings endpoint, calculate earnings from delivery history
    const deliveries = await getDeliveryHistory(deliveryPersonId);

    if (!deliveries || deliveries.length === 0) {
      console.log("No delivery history found for earnings calculation");
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        history: [],
      };
    }

    // Calculate earnings from delivery history
    const earningsHistory = deliveries
      .filter((delivery) => delivery.status === "DELIVERED")
      .map((delivery) => {
        // Calculate earnings (80% of delivery fee, which is 10% of order total)
        const orderTotal = delivery.order?.total_price || 0;
        const deliveryFee = orderTotal * 0.1;
        const earnings = deliveryFee * 0.8;

        return {
          ...delivery,
          earnings,
          date: new Date(delivery.delivered_at || delivery.createdAt),
        };
      });

    console.log(`Calculated earnings for ${earningsHistory.length} deliveries`);

    // Calculate total earnings
    const totalEarnings = earningsHistory.reduce(
      (sum, delivery) => sum + delivery.earnings,
      0
    );

    // Calculate today's earnings
    const today = new Date().toDateString();
    const todayEarnings = earningsHistory
      .filter((delivery) => new Date(delivery.date).toDateString() === today)
      .reduce((sum, delivery) => sum + delivery.earnings, 0);

    // Calculate this week's earnings
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEarnings = earningsHistory
      .filter((delivery) => delivery.date >= weekStart)
      .reduce((sum, delivery) => sum + delivery.earnings, 0);

    // Calculate this month's earnings
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEarnings = earningsHistory
      .filter((delivery) => delivery.date >= monthStart)
      .reduce((sum, delivery) => sum + delivery.earnings, 0);

    // Filter earnings history based on timeFilter
    let filteredHistory = earningsHistory;

    if (timeFilter === "today") {
      filteredHistory = earningsHistory.filter(
        (delivery) => new Date(delivery.date).toDateString() === today
      );
    } else if (timeFilter === "week") {
      filteredHistory = earningsHistory.filter(
        (delivery) => delivery.date >= weekStart
      );
    } else if (timeFilter === "month") {
      filteredHistory = earningsHistory.filter(
        (delivery) => delivery.date >= monthStart
      );
    } else if (timeFilter === "year") {
      const yearStart = new Date();
      yearStart.setMonth(0, 1);
      yearStart.setHours(0, 0, 0, 0);

      filteredHistory = earningsHistory.filter(
        (delivery) => delivery.date >= yearStart
      );
    }

    return {
      total: totalEarnings,
      today: todayEarnings,
      thisWeek: weekEarnings,
      thisMonth: monthEarnings,
      history: filteredHistory.sort((a, b) => b.date - a.date),
    };
  } catch (error) {
    console.error("Failed to calculate earnings stats:", error);
    return {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      history: [],
    };
  }
}
