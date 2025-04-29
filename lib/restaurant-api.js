// Restaurant API functions

// Restaurant Management
// Update the createRestaurant function to properly handle location data
export async function createRestaurant(data) {
    // Log the incoming data for debugging
    console.log("Creating restaurant with data (before processing):", JSON.stringify(data, null, 2))

    // Create a deep copy of the data to avoid modifying the original
    const restaurantData = JSON.parse(JSON.stringify(data))

    // Ensure address is included and not empty
    if (!restaurantData.address || restaurantData.address.trim() === "") {
        throw new Error("Restaurant address is required")
    }

    // Validate location coordinates
    if (restaurantData.location && restaurantData.location.coordinates) {
        // Ensure coordinates are numbers and not null
        const [lng, lat] = restaurantData.location.coordinates

        if (lng === null || lat === null || isNaN(Number(lng)) || isNaN(Number(lat))) {
            throw new Error("Invalid location coordinates. Longitude and latitude must be valid numbers.")
        }

        // Ensure coordinates are numbers (not strings)
        restaurantData.location.coordinates = [Number(lng), Number(lat)]

        console.log("Processed location data:", JSON.stringify(restaurantData.location, null, 2))
    } else {
        throw new Error("Location coordinates are required")
    }

    try {
        const res = await fetch("http://localhost:5001/api/restaurants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(restaurantData),
        })

        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || "Failed to create restaurant")
        }

        return res.json()
    } catch (error) {
        console.error("API request error:", error)
        throw error
    }
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

// Replace the entire updateOrderStatus function with this improved version
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

    try {
        console.log(`Updating order ${id} status to ${status} (${orderServiceStatus})`)

        // Only use the order service (port 5002)
        const res = await fetch(`http://localhost:5002/api/orders/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status: orderServiceStatus }),
        })

        if (!res.ok) {
            const errorBody = await res.text()
            console.error(`Error updating order status: ${res.status} - ${errorBody}`)
            throw new Error(`Failed to update order status: ${errorBody}`)
        }

        const order = await res.json()
        console.log("Successfully updated order status:", order)

        // If the order status is set to READY, create a delivery record in the delivery service
        if (status === "ready") {
            try {
                // Get restaurant details
                const restaurantRes = await fetch(`http://localhost:5001/api/restaurants/${order.restaurant_id}`)
                const restaurant = await restaurantRes.json()

                // Get order details to ensure we have all required information
                const orderDetailsRes = await fetch(`http://localhost:5002/api/orders/${id}`, {
                    credentials: "include",
                })
                const orderDetails = await orderDetailsRes.json()

                // Create delivery record with all required fields
                const deliveryRes = await fetch("http://localhost:5003/api/deliveries", {
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
                            coordinates: {
                                lat: restaurant.location?.coordinates[1] || 0,
                                lng: restaurant.location?.coordinates[0] || 0,
                            },
                        },
                        delivery_location: {
                            address: orderDetails.delivery_address || "Customer Address",
                            coordinates: {
                                lat: 0,
                                lng: 0,
                            },
                        },
                        customer_contact: {
                            name: orderDetails.customer_name || "Customer Name",
                            phone: orderDetails.customer_phone || "Customer Phone",
                        },
                        restaurant_contact: {
                            name: restaurant.name,
                            phone: restaurant.phone || "Unknown",
                        },
                        order: {
                            total_price: orderDetails.total_amount || 0,
                            items: orderDetails.items?.length || 0,
                        },
                    }),
                })

                if (!deliveryRes.ok) {
                    const errorText = await deliveryRes.text()
                    console.error("Failed to create delivery record:", errorText)
                } else {
                    console.log("Delivery record created successfully")
                }
            } catch (deliveryError) {
                console.error("Error creating delivery record:", deliveryError.message)
                // Continue execution even if delivery creation fails
            }
        }

        return order
    } catch (error) {
        console.error("Error updating order status:", error)
        throw new Error(error.message || "Failed to update order status")
    }
}

// Helper function to create a delivery record
async function createDeliveryRecord(orderId, order) {
    try {
        // Get restaurant details
        const restaurantRes = await fetch(
            `http://localhost:5001/api/restaurants/${order.restaurantId || order.restaurant_id}`,
        )

        if (!restaurantRes.ok) {
            throw new Error("Failed to fetch restaurant details")
        }

        const restaurant = await restaurantRes.json()

        // Create delivery record
        const deliveryRes = await fetch("http://localhost:5003/api/deliveries", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: document.cookie, // Forward auth cookie
            },
            credentials: "include",
            body: JSON.stringify({
                order_id: orderId,
                pickup_location: {
                    address: restaurant.address,
                    coordinates: restaurant.location?.coordinates || { lat: 0, lng: 0 },
                },
                delivery_location: {
                    address: order.deliveryAddress || order.delivery_address,
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

        if (!deliveryRes.ok) {
            const errorText = await deliveryRes.text()
            console.error("Failed to create delivery record:", errorText)
        } else {
            console.log("Delivery record created successfully")
        }
    } catch (deliveryError) {
        console.error("Error creating delivery record:", deliveryError.message)
        // Continue execution even if delivery creation fails
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
