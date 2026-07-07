import { fetcher } from "@/shared/lib/http";
import { create } from "zustand";

// ============================================================================
// 1. TYPE DEFINITIONS & INTERFACES
// ============================================================================
export type UserRole = "BUYER" | "SELLER";

interface AuthResponse {
  accessToken: string;
  hasStoreBranches?: boolean;
}

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
}

// ============================================================================
// 2. GLOBAL STATE STORE (ZUSTAND)
// ============================================================================
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
}));

// ============================================================================
// 3. CENTRALIZED API ACTIONS
// ============================================================================

/**
 * Unified Dynamic Login Handler
 * Replaces old static/duplicate endpoints with dynamic role injection
 */
export const login = async (
  credentials: Record<string, string>,
  roleName: UserRole = "SELLER", // Defaults to SELLER to keep dashboard routing safe
) => {
  const res = await fetcher<{ data: AuthResponse }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      ...credentials,
      roleName,
    }),
  });

  return {
    accessToken: res.data.accessToken,
    hasStoreBranches: res.data.hasStoreBranches,
  };
};

/**
 * Unified Registration Handler
 * Auto-injects dynamic role definitions safely adhering to backend Joi validators
 */
export const register = async (
  userData: Record<string, string>,
  roleName: UserRole = "SELLER",
) => {
  const res = await fetcher<{ data: AuthResponse }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      ...userData,
      roleName,
    }),
  });

  return {
    accessToken: res?.data?.accessToken,
    hasStoreBranches: res?.data?.hasStoreBranches,
  };
};

/**
 * Universal Global Logout Handler
 */
export const logout = async () => {
  return fetcher("/api/auth/signout", {
    method: "POST",
  });
};
