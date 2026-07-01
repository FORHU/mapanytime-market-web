import { API_BASE_URL } from "@/shared/config/api";

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const dbData = await response.json();

  if (!response.ok) {
    throw new Error(dbData?.message || "Invalid account credentials.");
  }

  return dbData;
};

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim(),
      password,
      roleName: "SELLER",
    }),
  });

  const dbData = await response.json();

  if (!response.ok) {
    throw new Error(dbData?.message || `Server Error: ${response.status}`);
  }

  return dbData;
};
