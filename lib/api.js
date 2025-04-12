export async function registerUser(data) {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Registration failed");
    return res.json();
  }
  
  export async function loginUser(data) {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  }
  
  export async function logoutUser() {
    const res = await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    if (!res.ok) throw new Error("Logout failed");
    return res.json();
  }
  