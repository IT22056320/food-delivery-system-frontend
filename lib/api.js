const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost";

const request = async (basePath, endpoint, method, data = null) => {
    const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("token")) : null;

    const config = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` }),
        },
        credentials: "include",
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${SERVER_URL}${basePath}${endpoint}`, config);
        console.log("Requesting:", `${SERVER_URL}${basePath}${endpoint}`);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: `Request failed with status ${response.status}` };
            }
            throw new Error(errorData.message || "Something went wrong");
        }

        if (response.status === 204) {
            return null; // No Content
        }

        return await response.json();
    } catch (error) {
        if (error.name === "AbortError") {
            console.error(`API request timed out: ${endpoint}`);
            throw new Error("Request timed out. Please try again.");
        }
        console.error("API error:", error);
        throw error;
    }
};

const api = {
    auth: {
        get: (endpoint) => request("/api/auth", endpoint, "GET"),
        post: (endpoint, data) => request("/api/auth", endpoint, "POST", data),
        put: (endpoint, data) => request("/api/auth", endpoint, "PUT", data),
        delete: (endpoint) => request("/api/auth", endpoint, "DELETE"),
    },
    restaurant: {
        get: (endpoint) => request("/api/restaurant", endpoint, "GET"),
        post: (endpoint, data) => request("/api/restaurant", endpoint, "POST", data),
        put: (endpoint, data) => request("/api/restaurant", endpoint, "PUT", data),
        delete: (endpoint) => request("/api/restaurant", endpoint, "DELETE"),
    },
    order: {
        get: (endpoint) => request("/api/order", endpoint, "GET"),
        post: (endpoint, data) => request("/api/order", endpoint, "POST", data),
        put: (endpoint, data) => request("/api/order", endpoint, "PUT", data),
        delete: (endpoint) => request("/api/order", endpoint, "DELETE"),
    },
    deliveries: {
        get: (endpoint) => request("/api/deliveries", endpoint, "GET"),
        post: (endpoint, data) => request("/api/deliveries", endpoint, "POST", data),
        put: (endpoint, data) => request("/api/deliveries", endpoint, "PUT", data),
        delete: (endpoint) => request("/api/deliveries", endpoint, "DELETE"),
    }
};

export default api;
