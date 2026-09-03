import { fetcher } from "@/shared/lib/http";
import {
  OrderSchema,
  OrdersResponseSchema,
  OrderStatusResponseSchema,
  type Order,
  type OrdersResponse,
  type CreateOrderInput,
  type OrderStatusResponse,
} from "../contracts/orders.contract";

export const getOrders = async (
  storeId?: string | null,
): Promise<OrdersResponse> => {
  // limit=100 (the API max) preserves this client's previous "fetch all" intent.
  const query = storeId ? `?storeId=${storeId}&limit=100` : `?limit=100`;
  const raw = await fetcher<any>(`/api/v1/orders/store${query}`);
  const ordersList = raw?.data?.items || [];
  const mapped = ordersList.map((order: any) => ({
    id: order.id,
    storeId: order.storeId,
    status:
      order.status === "PROCESSING" || order.status === "COMPLETED"
        ? "SHIPPED"
        : order.status,
    items: (order.orderitems || []).map((item: any) => ({
      productId: item.productId,
      name: item.product?.name || "Unknown Product",
      quantity: item.quantity,
      price: item.unitPrice,
    })),
    totalAmount: order.totalAmount,
    customerName: order.buyer?.displayName || "Customer",
    createdAt: order.createdAt,
  }));
  return OrdersResponseSchema.parse(mapped);
};

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  const raw = await fetcher<any>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const order = raw?.data;
  return OrderSchema.parse({
    id: order.id,
    storeId: order.storeId,
    status:
      order.status === "PROCESSING" || order.status === "COMPLETED"
        ? "SHIPPED"
        : order.status,
    items: (order.orderitems || []).map((item: any) => ({
      productId: item.productId,
      name: item.productId,
      quantity: item.quantity,
      price: item.unitPrice,
    })),
    totalAmount: order.totalAmount,
    customerName: "You",
    createdAt: order.createdAt,
    checkoutUrl: order.checkoutUrl,
  });
};

// not used - backend endpoint GET /api/v1/orders/:orderId/status not implemented
export const getOrderStatus = async (
  orderId: string,
): Promise<OrderStatusResponse> => {
  const raw = await fetcher<any>(`/api/v1/orders/${orderId}/status`);
  const status = raw?.data?.status || "PENDING";
  return OrderStatusResponseSchema.parse({
    id: orderId,
    status:
      status === "PROCESSING" || status === "COMPLETED" ? "SHIPPED" : status,
  });
};
