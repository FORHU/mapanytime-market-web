import { API_BASE_URL } from "@/shared/config/api";

export const createCategory = async (payload: {
  storeId: string;
  name: string;
  description: string;
}) => {
  const secureToken = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secureToken}`,
    },
    body: JSON.stringify(payload),
  });

  const dbData = await response.json();

  if (!response.ok) {
    throw new Error(
      dbData?.message ||
        `Category initialization failed with code: ${response.status}`,
    );
  }

  return dbData;
};
