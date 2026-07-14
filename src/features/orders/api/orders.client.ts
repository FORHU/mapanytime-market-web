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

/**
 * Backend integration toggle.
 * Flip to true once /api/v1/orders is live and confirmed to match
 * orders.contract.ts. Hooks and components never need to change when this
 * flips — they only ever see validated Order/OrdersResponse shapes.
 */
const USE_LIVE_BACKEND = false;

let MOCK_ORDERS: Order[] = [
  {
    id: "ord_1001",
    storeId: "store_01",
    status: "PENDING",
    items: [
      { productId: "prod_1", name: "Wireless Mouse", quantity: 2, price: 450 },
    ],
    totalAmount: 900,
    customerName: "Jamie Cruz",
    createdAt: "2026-07-01T09:12:00.000Z",
  },
  {
    id: "ord_1002",
    storeId: "store_01",
    status: "SHIPPED",
    items: [
      { productId: "prod_2", name: "USB-C Cable", quantity: 1, price: 150 },
    ],
    totalAmount: 150,
    customerName: "Pat Reyes",
    createdAt: "2026-06-29T14:40:00.000Z",
  },
];

export const getOrders = async (storeId: string): Promise<OrdersResponse> => {
  if (!USE_LIVE_BACKEND) {
    const scoped = MOCK_ORDERS.filter((order) => order.storeId === storeId);
    return Promise.resolve(OrdersResponseSchema.parse(scoped));
  }

  const raw = await fetcher<unknown>(`/api/v1/orders?storeId=${storeId}`);
  return OrdersResponseSchema.parse(raw);
};

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  if (!USE_LIVE_BACKEND) {
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      storeId: input.storeId,
      status: "PENDING",
      items: input.items.map((item) => ({
        productId: item.productId,
        name: item.productId,
        quantity: item.quantity,
        price: 0,
      })),
      totalAmount: input.totalAmount,
      customerName: "You",
      createdAt: new Date().toISOString(),
    };
    MOCK_ORDERS = [newOrder, ...MOCK_ORDERS];
    return Promise.resolve(newOrder);
  }

  const raw = await fetcher<unknown>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return OrderSchema.parse(raw);
};

export const getOrderStatus = async (
  orderId: string,
): Promise<OrderStatusResponse> => {
  if (!USE_LIVE_BACKEND) {
    const found = MOCK_ORDERS.find((order) => order.id === orderId);
    return Promise.resolve(
      OrderStatusResponseSchema.parse({
        id: orderId,
        status: found?.status ?? "PENDING",
      }),
    );
  }

  const raw = await fetcher<unknown>(`/api/v1/orders/${orderId}/status`);
  return OrderStatusResponseSchema.parse(raw);
};
