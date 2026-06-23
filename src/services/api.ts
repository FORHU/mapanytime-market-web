const BASE_URL = "http://172.30.32.1:3002/api/v1";

// Helper to append the Authorization header if a token exists
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const authService = {
  // Login method to acquire token
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();

    // Save token to localStorage for later requests
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  },

  // Clear session on logout
  logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },
};

export const apiService = {
  // Secure request: Get Store Profile details
  async getStoreProfile() {
    const res = await fetch(`${BASE_URL}/store/profile`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (res.status === 401) authService.logout(); // Boot to logout if token expired
    if (!res.ok) throw new Error("Failed to fetch authorized store profile");
    return res.json();
  },

  // Secure request: Update Settings configuration
  async updateSettings(updatedPayload: any) {
    const res = await fetch(`${BASE_URL}/store/settings`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(updatedPayload),
    });
    if (res.status === 401) authService.logout();
    if (!res.ok) throw new Error("Failed to update configurations");
    return res.json();
  },
};
