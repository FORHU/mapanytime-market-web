// src/features/auth/api/auth.api.ts
import { fetcher } from "@/shared/lib/http";

export const login = async (credentials: Record<string, string>) => {
  return fetcher<{ data: { accessToken: string } }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const register = async (userData: Record<string, string>) => {
  return fetcher("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      ...userData,
      roleName: "SELLER", // Auto-injecting role per backend Joi schema requirements
    }),
  });
};

export const logout = async () => {
  return fetcher("/api/v1/auth/signout", {
    method: "POST",
  });
};
