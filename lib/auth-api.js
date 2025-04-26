import api from "./api";

// Register a new user
export async function registerUser(data) {
    return await api.auth.post("/register", data);
}

// Login user
export async function loginUser(data) {
    return await api.auth.post("/login", data);
}

// Logout user
export async function logoutUser() {
    return await api.auth.post("/logout");
}

// Fetch the logged-in user's data
export async function fetchUser() {
    return await api.auth.get("/me");
}
