import { API_BASE_URL } from "@/shared/config/api";

export const getMyStores = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/v1/stores/my-stores`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody?.message || `Server returned status code: ${response.status}`,
    );
  }

  return response.json();
};

export const createStore = async (formData: FormData) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/v1/stores`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Server returned error code: ${response.status}`,
    );
  }

  return response.json();
};

export const getStoreProfile = async (storeId: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/v1/stores/${storeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to parse branch configuration properties.");
  }

  return response.json();
};
