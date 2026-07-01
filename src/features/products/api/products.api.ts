import { API_BASE_URL } from "@/shared/config/api";

export const getProducts = async (storeId: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/v1/products?storeId=${storeId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to retrieve catalog data from remote host.");
  }

  return response.json();
};

export const createProduct = async (payload: {
  name: string;
  price: number;
  categoryId: string;
  storeId: string;
  isActive: boolean;
}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/v1/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody?.message || "Catalog mutation rejected by validation rules.",
    );
  }

  return response.json();
};

export const updateProduct = async (
  id: string,
  payload: {
    name: string;
    price: number;
    categoryId: string;
    storeId: string;
    isActive: boolean;
  },
) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody?.message || "Catalog mutation rejected by validation rules.",
    );
  }

  return response.json();
};
