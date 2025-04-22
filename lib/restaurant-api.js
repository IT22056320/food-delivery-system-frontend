// Restaurant API functions

// Restaurant Management
export async function createRestaurant(data) {
    const res = await fetch("http://localhost:5001/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create restaurant")
    }

    return res.json()
}

export async function getMyRestaurants() {
    const res = await fetch("http://localhost:5001/api/restaurants/owner/my-restaurants", {
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch restaurants")
    }

    return res.json()
}

export async function getAllRestaurants() {
    const res = await fetch("http://localhost:5001/api/restaurants", {
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch restaurants")
    }

    return res.json()
}

export async function getRestaurantById(id) {
    const res = await fetch(`http://localhost:5001/api/restaurants/${id}`, {
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch restaurant")
    }

    return res.json()
}

export async function updateRestaurant(id, data) {
    const res = await fetch(`http://localhost:5001/api/restaurants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update restaurant")
    }

    return res.json()
}

export async function updateRestaurantAvailability(id, isAvailable) {
    const res = await fetch(`http://localhost:5001/api/restaurants/${id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isAvailable }),
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update availability")
    }

    return res.json()
}

export async function deleteRestaurant(id) {
    const res = await fetch(`http://localhost:5001/api/restaurants/${id}`, {
        method: "DELETE",
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to delete restaurant")
    }

    return res.json()
}

// Menu Item Management
export async function createMenuItem(data) {
    const res = await fetch("http://localhost:5001/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create menu item")
    }

    return res.json()
}

export async function getMenuItems(restaurantId) {
    const res = await fetch(`http://localhost:5001/api/menu-items/restaurant/${restaurantId}`, {
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch menu items")
    }

    return res.json()
}

export async function getMenuItemById(id) {
    const res = await fetch(`http://localhost:5001/api/menu-items/${id}`, {
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch menu item")
    }

    return res.json()
}

export async function updateMenuItem(id, data) {
    const res = await fetch(`http://localhost:5001/api/menu-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update menu item")
    }

    return res.json()
}

export async function updateMenuItemAvailability(id, isAvailable) {
    const res = await fetch(`http://localhost:5001/api/menu-items/${id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isAvailable }),
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update availability")
    }

    return res.json()
}

export async function deleteMenuItem(id) {
    const res = await fetch(`http://localhost:5001/api/menu-items/${id}`, {
        method: "DELETE",
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to delete menu item")
    }

    return res.json()
}

// Order Management
// Update the getRestaurantOrders function to fetch from both services
export async function getRestaurantOrders(restaurantId) {
    try {
        // First try to get orders from the restaurant service
        const res1 = await fetch(`http://localhost:5001/api/orders/restaurant/${restaurantId}`, {
            credentials: "include",
        })

        // Then try to get orders from the order service
        const res2 = await fetch(`http://localhost:5002/api/orders/restaurant/${restaurantId}`, {
            credentials: "include",
        })

        let orders1 = []
        let orders2 = []

        if (res1.ok) {
            orders1 = await res1.json()
        }

        if (res2.ok) {
            orders2 = await res2.json()
        }

        // Combine orders from both services
        return [...orders1, ...orders2]
    } catch (error) {
        console.error("Error fetching restaurant orders:", error)
        throw new Error(error.error || "Failed to fetch orders")
    }
}

export async function getPendingOrders(restaurantId) {
    const res = await fetch(`http://localhost:5001/api/orders/restaurant/${restaurantId}/pending`, {
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch pending orders")
    }

    return res.json()
}

export async function getCompletedOrders(restaurantId) {
    const res = await fetch(`http://localhost:5001/api/orders/restaurant/${restaurantId}/completed`, {
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch completed orders")
    }

    return res.json()
}

export async function getOrderById(id) {
    const res = await fetch(`http://localhost:5001/api/orders/${id}`, {
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch order")
    }

    return res.json()
}

export async function updateOrderStatus(id, status, estimatedDeliveryTime = null) {
    // Map frontend status values to backend status values if needed
    const statusMapping = {
        pending: "PENDING",
        accepted: "CONFIRMED",
        preparing: "PREPARING",
        ready: "READY_FOR_PICKUP",
        out_for_delivery: "OUT_FOR_DELIVERY",
        delivered: "DELIVERED",
        cancelled: "CANCELLED",
    }

    // Use the mapped status if available, otherwise use the original status
    const orderServiceStatus = statusMapping[status.toLowerCase()] || status.toUpperCase()

    const data = { status }
    if (estimatedDeliveryTime) {
        data.estimatedDeliveryTime = estimatedDeliveryTime
    }

    try {
        // First try to update in restaurant service
        try {
            const res1 = await fetch(`http://localhost:5001/api/orders/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            })

            if (res1.ok) {
                const order = await res1.json()

                // If the order status is set to READY, create a delivery record in the delivery service
                if (status === "ready") {
                    try {
                        // Get restaurant details
                        const restaurantRes = await fetch(`http://localhost:5001/api/restaurants/${order.restaurantId}`)
                        const restaurant = await restaurantRes.json()

                        // Create delivery record
                        await fetch("http://localhost:5003/api/deliveries", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Cookie: document.cookie, // Forward auth cookie
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                order_id: order._id,
                                pickup_location: {
                                    address: restaurant.address,
                                    coordinates: restaurant.location?.coordinates || { lat: 0, lng: 0 },
                                },
                                delivery_location: {
                                    address: order.deliveryAddress,
                                    coordinates: { lat: 0, lng: 0 }, // Would be geocoded in a real app
                                },
                                customer_contact: {
                                    name: "Customer Name", // Replace with actual customer name
                                    phone: "Customer Phone", // Replace with actual customer phone
                                },
                                restaurant_contact: {
                                    name: restaurant.name,
                                    phone: restaurant.phone || "Unknown",
                                },
                            }),
                        })
                    } catch (deliveryError) {
                        console.error("Error creating delivery record:", deliveryError.message)
                        // Continue execution even if delivery creation fails
                    }
                }

                return order
            } else {
                const errorBody = await res1.text()
                console.error(`Error updating order status in restaurant service: ${res1.status} - ${errorBody}`)
            }
        } catch (err) {
            console.error("Failed to connect to restaurant service:", err.message)
        }

        // If that fails, try order service with the correct enum value
        try {
            const res2 = await fetch(`http://localhost:5002/api/orders/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: orderServiceStatus }),
            })

            if (res2.ok) {
                return res2.json()
            } else {
                const errorBody = await res2.text()
                console.error(`Error updating order status in order service: ${res2.status} - ${errorBody}`)
            }
        } catch (err) {
            console.error("Failed to connect to order service:", err.message)
        }

        throw new Error("Failed to update order status in either service")
    } catch (error) {
        console.error("Error updating order status:", error)
        throw new Error(error.message || "Failed to update order status")
    }
}

// Get popular menu items for a restaurant
export async function getPopularMenuItems(restaurantId, period = "week") {
    const res = await fetch(
        `http://localhost:5001/api/orders/restaurant/${restaurantId}/popular-items?period=${period}`,
        {
            credentials: "include",
        },
    )

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch popular menu items")
    }

    return res.json()
}

// Admin Functions
export async function getUnverifiedRestaurants() {
    const res = await fetch("http://localhost:5001/api/admin/restaurants/unverified", {
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch unverified restaurants")
    }

    return res.json()
}

export async function verifyRestaurant(id) {
    const res = await fetch(`http://localhost:5001/api/admin/restaurants/${id}/verify`, {
        method: "PATCH",
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to verify restaurant")
    }

    return res.json()
}

export async function getRestaurantStats(restaurantId) {
    const res = await fetch(`http://localhost:5001/api/admin/restaurants/${restaurantId}/stats`, {
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch restaurant stats")
    }

    return res.json()
}

export async function getSystemStats() {
    const res = await fetch("http://localhost:5001/api/admin/system/stats", {
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch system stats")
    }

    return res.json()
}