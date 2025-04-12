// API functions to interact with the backend

// Auth API
export async function registerUser(userData) {
    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to register")
    }

    return response.json()
}

export async function verifyOtp(data) {
    const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Invalid or expired OTP")
    }

    return response.json()
}

export async function loginUser(credentials) {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Invalid credentials")
    }

    return response.json()
}

export async function logoutUser() {
    const response = await fetch("/api/auth/logout", {
        method: "POST",
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to logout")
    }

    return response.json()
}

// User API
export async function getUserById(userId) {
    const response = await fetch(`/api/users/${userId}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch user")
    }

    return response.json()
}

export async function getAllUsers() {
    const response = await fetch("/api/users")

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch users")
    }

    return response.json()
}

export async function updateUser(userId, userData) {
    const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update user")
    }

    return response.json()
}

export async function deleteUser(userId) {
    const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete user")
    }

    return response.json()
}

