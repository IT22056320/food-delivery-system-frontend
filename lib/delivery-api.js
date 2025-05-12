// Delivery API functions

// Get all available deliveries
export async function getAvailableDeliveries() {
  try {
    const res = await fetch("http://localhost:5003/api/deliveries/available", {
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.json()
      console.error("Error fetching available deliveries:", error)
      return [] // Return empty array instead of throwing
    }

    return res.json()
  } catch (error) {
    console.error("Failed to fetch available deliveries:", error)
    return [] // Return empty array on error
  }
}

// Get all deliveries assigned to the current delivery person
export async function getMyDeliveries() {
  try {
    const res = await fetch("http://localhost:5003/api/deliveries/my-deliveries", {
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.json()
      console.error("Error fetching my deliveries:", error)
      return [] // Return empty array instead of throwing
    }

    return res.json()
  } catch (error) {
    console.error("Failed to fetch my deliveries:", error)
    return [] // Return empty array on error
  }
}

// Get a delivery by ID
export async function getDeliveryById(id) {
  try {
    const res = await fetch(`http://localhost:5003/api/deliveries/${id}`, {
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Failed to fetch delivery")
    }

    return res.json()
  } catch (error) {
    console.error("Failed to fetch delivery:", error)
    throw error
  }
}

// Assign a delivery to a delivery person
export async function assignDelivery(id, deliveryPersonName) {
  try {
    const res = await fetch(`http://localhost:5003/api/deliveries/${id}/assign`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ delivery_person_name: deliveryPersonName }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Failed to assign delivery")
    }

    return res.json()
  } catch (error) {
    console.error("Failed to assign delivery:", error)
    throw error
  }
}

// Update delivery status
export async function updateDeliveryStatus(id, status, currentLocation) {
  try {
    const payload = {
      status,
    }

    if (currentLocation) {
      payload.current_location = currentLocation
    }

    const res = await fetch(`http://localhost:5003/api/deliveries/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Failed to update delivery status")
    }

    return res.json()
  } catch (error) {
    console.error("Failed to update delivery status:", error)
    throw error
  }
}

// Complete a delivery
export async function completeDelivery(id) {
  try {
    const res = await fetch(`http://localhost:5003/api/deliveries/${id}/complete`, {
      method: "PUT",
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Failed to complete delivery")
    }

    return res.json()
  } catch (error) {
    console.error("Failed to complete delivery:", error)
    throw error
  }
}

// Get delivery statistics
export async function getDeliveryStats() {
  try {
    const res = await fetch("http://localhost:5003/api/deliveries/stats", {
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Failed to fetch delivery stats")
    }

    return res.json()
  } catch (error) {
    console.error("Failed to fetch delivery stats:", error)
    throw error
  }
}

// Get delivery by order ID
export async function getDeliveryByOrderId(orderId) {
  try {
    const res = await fetch(`http://localhost:5003/api/deliveries/by-order/${orderId}`, {
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Failed to fetch delivery")
    }

    return res.json()
  } catch (error) {
    console.error("Failed to fetch delivery by order ID:", error)
    throw error
  }
}

// Get active deliveries for a delivery person
export async function getActiveDeliveries(deliveryPersonId) {
  try {
    const res = await fetch(`http://localhost:5003/api/deliveries/delivery-person/${deliveryPersonId}/active`, {
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.json()
      console.error("Error fetching active deliveries:", error)
      return [] // Return empty array instead of throwing
    }

    return res.json()
  } catch (error) {
    console.error("Failed to fetch active deliveries:", error)
    return [] // Return empty array on error
  }
}

// Get delivery history for a delivery person
export async function getDeliveryHistory(deliveryPersonId) {
  try {
    const res = await fetch(`http://localhost:5003/api/deliveries/delivery-person/${deliveryPersonId}/history`, {
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.json()
      console.error("Error fetching delivery history:", error)
      return [] // Return empty array instead of throwing
    }

    return res.json()
  } catch (error) {
    console.error("Failed to fetch delivery history:", error)
    return [] // Return empty array on error
  }
}
