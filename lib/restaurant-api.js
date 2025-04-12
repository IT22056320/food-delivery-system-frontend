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
export async function getRestaurantOrders(restaurantId) {
    const res = await fetch(`http://localhost:5001/api/orders/restaurant/${restaurantId}`, {
        credentials: "include",
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch orders")
    }

    return res.json()
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
    const data = { status }
    if (estimatedDeliveryTime) {
        data.estimatedDeliveryTime = estimatedDeliveryTime
    }

    const res = await fetch(`http://localhost:5001/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update order status")
    }

    return res.json()
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

