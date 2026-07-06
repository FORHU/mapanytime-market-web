import { create } from "zustand";

interface AuthState {
  token: string | null;
  role: string | null; // ✅ Added role to match usePermissions requirement
  user: Record<string, any> | null; // ✅ Added user object matrix to match usePermissions requirement
  setToken: (token: string | null) => void;
  setAuthData: (data: {
    token: string | null;
    role: string | null;
    user: Record<string, any> | null;
  }) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  role: typeof window !== "undefined" ? localStorage.getItem("role") : null,
  user: null,

  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    set({ token });
  },

  // Added to allow setting all parameters safely on successful login returns
  setAuthData: (data) => {
    if (data.token) localStorage.setItem("token", data.token);
    else localStorage.removeItem("token");

    if (data.role) localStorage.setItem("role", data.role);
    else localStorage.removeItem("role");

    set({ token: data.token, role: data.role, user: data.user });
  },

  clearToken: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    set({ token: null, role: null, user: null });
  },
}));
