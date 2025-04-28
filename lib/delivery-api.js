// Update the API URL handling to provide a fallback if the environment variable is not set
const DELIVERY_API_BASE_URL = process.env.NEXT_PUBLIC_DELIVERY_SERVICE_URL || "http://localhost:5003"

// Helper function to handle API responses and errors consistently
async function fetchWithAuth(url, options = {}) {
    try {
        // Add a timeout to prevent hanging requests
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

        // Ensure credentials are included for cookies
        const response = await fetch(url, {
            ...options,
            credentials: "include",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            let errorData
            try {
                errorData = await response.json()
            } catch (jsonError) {
                errorData = { message: `Request failed with status ${response.status}` }
            }
            throw new Error(errorData.message || `Request failed with status ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        // Handle AbortController timeout
        if (error.name === "AbortError") {
            console.error(`API request timed out: ${url}`)
            throw new Error("Request timed out. Please try again.")
        }

        console.error(`API request failed: ${url}`, error)
        throw error
    }
}

export async function trackDelivery(deliveryId) {
    return fetchWithAuth(`${DELIVERY_API_BASE_URL}/api/deliveries/${deliveryId}`)
}

export async function updateLocation(lat, lng, status, heading, speed) {
    return fetchWithAuth(`${DELIVERY_API_BASE_URL}/api/locations/update`, {
        method: "POST",
        body: JSON.stringify({ lat, lng, status, heading, speed }),
    })
}

export async function getDeliveryLocation(deliveryId) {
    return fetchWithAuth(`${DELIVERY_API_BASE_URL}/api/locations/delivery/${deliveryId}`)
}

export async function getNearbyDrivers(lat, lng, maxDistance = 5000) {
    return fetchWithAuth(`${DELIVERY_API_BASE_URL}/api/locations/nearby?lat=${lat}&lng=${lng}&maxDistance=${maxDistance}`)
}

export async function getAvailableDeliveries() {
    return fetchWithAuth(`${DELIVERY_API_BASE_URL}/api/deliveries/available`)
}

export async function getMyDeliveries() {
    return fetchWithAuth(`${DELIVERY_API_BASE_URL}/api/deliveries/my-deliveries`)
}

export async function getDeliveryHistory() {
    return fetchWithAuth(`${DELIVERY_API_BASE_URL}/api/deliveries/history`)
}

export async function getDeliveryStats(timeFilter) {
    return fetchWithAuth(`${DELIVERY_API_BASE_URL}/api/deliveries/stats?period=${timeFilter}`)
}

export async function updateDeliveryStatus(deliveryId, status, notes) {
    return fetchWithAuth(`${DELIVERY_API_BASE_URL}/api/deliveries/${deliveryId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
    })
}

export async function acceptDelivery(deliveryId) {
    return fetchWithAuth(`${DELIVERY_API_BASE_URL}/api/deliveries/${deliveryId}/accept`, {
        method: "POST",
    })
}
