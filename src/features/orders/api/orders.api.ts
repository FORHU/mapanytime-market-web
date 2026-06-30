import { API_BASE_URL } from "@/shared/config/api";

export const createOrder = async (payload: {
  storeId: string;
  items: any[];
  totalAmount: number;
}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/v1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Order parameters rejected.");

  return response.json();
};

export const getOrders = async (storeId: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/v1/orders?storeId=${storeId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return response.json();
};

export const getOrderStatus = async (orderId: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/v1/orders/${orderId}/status`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return response.json();
};
