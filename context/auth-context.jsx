"use client";

import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logoutUser } from "@/lib/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch logged-in user on first load
  useEffect(() => {
    // First check localStorage for existing user data
    const storedUser = localStorage.getItem("foodhub_user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("foodhub_user");
        fetchUserFromAPI();
      }
    } else {
      fetchUserFromAPI();
    }
  }, []);

  // Function to fetch user data from API
  const fetchUserFromAPI = () => {
    fetch("http://localhost:5000/api/auth/me", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          // Store user data in localStorage
          localStorage.setItem("foodhub_user", JSON.stringify(data.user));
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      })
      .finally(() => setLoading(false));
  };

  // Role-based convenience flags
  const isAdmin = user?.role === "admin";
  const isRestaurantOwner = user?.role === "restaurant_owner";
  const isDeliveryPerson = user?.role === "delivery_person";
  const isUser = user?.role === "user";

  // Manual login method
  const login = (userData) => {
    setUser(userData);
    // Store user data in localStorage
    localStorage.setItem("foodhub_user", JSON.stringify(userData));
  };

  // Logout handler
  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      // Clear user data from localStorage
      localStorage.removeItem("foodhub_user");
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        isAdmin,
        isRestaurantOwner,
        isDeliveryPerson,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
