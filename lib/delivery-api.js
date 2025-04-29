// Delivery API functions

// Track a delivery
export async function trackDelivery(deliveryId) {
    try {
        const response = await fetch(`http://localhost:5003/api/deliveries/${deliveryId}`, {
            credentials: "include",
        })

        if (!response.ok) {
            throw new Error("Failed to fetch delivery")
        }

        return await response.json()
    } catch (error) {
        console.error("Error tracking delivery:", error)
        throw error
    }
}

// Get delivery by order ID
export async function getDeliveryByOrderId(orderId) {
    try {
        const response = await fetch(`http://localhost:5003/api/deliveries/by-order/${orderId}`, {
            credentials: "include",
        })

        if (!response.ok) {
            if (response.status === 404) {
                return null
            }
            throw new Error("Failed to fetch delivery")
        }

        return await response.json()
    } catch (error) {
        console.error("Error fetching delivery by order ID:", error)
        throw error
    }
}

// Update delivery status
export async function updateDeliveryStatus(deliveryId, status) {
    try {
        const response = await fetch(`http://localhost:5003/api/deliveries/${deliveryId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ status }),
        })

        if (!response.ok) {
            throw new Error("Failed to update delivery status")
        }

        return await response.json()
    } catch (error) {
        console.error("Error updating delivery status:", error)
        throw error
    }
}

// Update delivery location
export async function updateDeliveryLocation(deliveryId, location) {
    try {
        const response = await fetch(`http://localhost:5003/api/deliveries/${deliveryId}/location`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(location),
        })

        if (!response.ok) {
            throw new Error("Failed to update delivery location")
        }

        return await response.json()
    } catch (error) {
        console.error("Error updating delivery location:", error)
        throw error
    }
}

// Get delivery location
export async function getDeliveryLocation(deliveryId) {
    try {
        const response = await fetch(`http://localhost:5003/api/deliveries/${deliveryId}/location`, {
            credentials: "include",
        })

        if (!response.ok) {
            throw new Error("Failed to fetch delivery location")
        }

        return await response.json()
    } catch (error) {
        console.error("Error fetching delivery location:", error)
        throw error
    }
}

// Get active deliveries for delivery person
export async function getActiveDeliveries(deliveryPersonId) {
    try {
        const response = await fetch(`http://localhost:5003/api/deliveries/delivery-person/${deliveryPersonId}/active`, {
            credentials: "include",
        })

        if (!response.ok) {
            throw new Error("Failed to fetch active deliveries")
        }

        return await response.json()
    } catch (error) {
        console.error("Error fetching active deliveries:", error)
        throw error
    }
}

// Get delivery history for delivery person
export async function getDeliveryHistory(deliveryPersonId) {
    try {
        const response = await fetch(`http://localhost:5003/api/deliveries/delivery-person/${deliveryPersonId}/history`, {
            credentials: "include",
        })

        if (!response.ok) {
            throw new Error("Failed to fetch delivery history")
        }

        return await response.json()
    } catch (error) {
        console.error("Error fetching delivery history:", error)
        throw error
    }
}

// Accept a delivery assignment
export async function acceptDelivery(deliveryId) {
    try {
        const response = await fetch(`http://localhost:5003/api/deliveries/${deliveryId}/assign`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ accept: true }),
        })

        if (!response.ok) {
            throw new Error("Failed to accept delivery")
        }

        return await response.json()
    } catch (error) {
        console.error("Error accepting delivery:", error)
        throw error
    }
}

// Reject a delivery assignment
export async function rejectDelivery(deliveryId) {
    try {
        const response = await fetch(`http://localhost:5003/api/deliveries/${deliveryId}/assign`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ accept: false }),
        })

        if (!response.ok) {
            throw new Error("Failed to reject delivery")
        }

        return await response.json()
    } catch (error) {
        console.error("Error rejecting delivery:", error)
        throw error
    }
}

// Get available deliveries for assignment
export async function getAvailableDeliveries() {
    try {
        const response = await fetch(`http://localhost:5003/api/deliveries/available`, {
            credentials: "include",
        })

        if (!response.ok) {
            throw new Error("Failed to fetch available deliveries")
        }

        return await response.json()
    } catch (error) {
        console.error("Error fetching available deliveries:", error)
        throw error
    }
}
