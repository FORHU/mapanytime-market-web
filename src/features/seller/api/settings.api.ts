import { API_BASE_URL } from "@/shared/config/api";

export const getSettings = async (storeId: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/v1/stores/${storeId}/settings`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error("Could not retrieve preference records.");
  }

  return response.json();
};

export const updateSettings = async (
  storeId: string,
  section: string,
  updatedPayload: object,
) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/v1/stores/${storeId}/settings`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ [section]: updatedPayload }),
    },
  );

  if (!response.ok) throw new Error("Server rejected state mutation.");

  return response.json();
};
