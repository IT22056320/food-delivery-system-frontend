export async function logoutUser() {
  try {
    // First clear local storage
    localStorage.removeItem("foodhub_user");

    const res = await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Logout failed");
    return await res.json();
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}

export async function loginUser(credentials) {
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Login failed");
    }
    return await res.json();
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

export async function registerUser(userData) {
  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Registration failed");
    }
    return await res.json();
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

export async function getUserOrders() {
  try {
    const res = await fetch("http://localhost:5002/api/orders", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch user orders");
    return await res.json();
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
}

export async function getTransactions() {
  try {
    const res = await fetch("http://localhost:5002/api/transactions", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch transactions");
    return await res.json();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}

export async function processRefund(transactionId) {
  try {
    const res = await fetch(
      `http://localhost:5002/api/transactions/${transactionId}/refund`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error("Failed to process refund");
    return await res.json();
  } catch (error) {
    console.error("Error processing refund:", error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const res = await fetch("http://localhost:5000/api/users", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function updateUserStatus(userId, data) {
  try {
    const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to update user");
    return await res.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(userId) {
  try {
    const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete user");
    return await res.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export async function updateUserProfile(userData) {
  try {
    const res = await fetch(`http://localhost:5000/api/users/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return await res.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

export async function changePassword(passwordData) {
  try {
    const res = await fetch(`http://localhost:5000/api/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwordData),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to change password");
    return await res.json();
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

// Add these new functions for transaction management

// Get transactions with period filter
export const getTransactionsByPeriod = async (period = "all") => {
  try {
    const response = await fetch(
      `http://localhost:5002/api/transactions?period=${period}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

// Get transaction statistics
export const getTransactionStats = async (period = "all") => {
  try {
    const response = await fetch(
      `http://localhost:5002/api/transactions/stats?period=${period}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch transaction statistics");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching transaction statistics:", error);
    throw error;
  }
};

// Get tax report
export const getTaxReport = async (period = "month") => {
  try {
    const response = await fetch(
      `http://localhost:5002/api/transactions/tax-report?period=${period}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tax report");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching tax report:", error);
    throw error;
  }
};

// Export transactions as CSV
export const exportTransactionsCSV = async (period = "all") => {
  try {
    const response = await fetch(
      `http://localhost:5002/api/transactions/export?period=${period}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to export transactions");
    }

    return await response.blob();
  } catch (error) {
    console.error("Error exporting transactions:", error);
    throw error;
  }
};
