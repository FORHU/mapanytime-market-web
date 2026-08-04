import { z } from "zod";

/**
 * Inferred contract — no documented backend schema exists yet for /api/v1/orders.
 * Status vocabulary and payload shape are taken from existing usage elsewhere in
 * this codebase (dashboard status filter, the original createOrder payload).
 * Replace with the real backend schema as soon as it's available.
 */

export const OrderStatusSchema = z.enum(["PENDING", "SHIPPED", "CANCELLED"]);

// Money columns are Prisma `Decimal`, which serializes to a JSON string
// ("1950"), so response-side numerics are coerced rather than asserted.
export const OrderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative(),
});

export const OrderSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  status: OrderStatusSchema,
  items: z.array(OrderItemSchema),
  totalAmount: z.coerce.number().nonnegative(),
  customerName: z.string(),
  createdAt: z.string(),
});

export const OrdersResponseSchema = z.array(OrderSchema);

export const CreateOrderItemInputSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export const CreateOrderInputSchema = z.object({
  storeId: z.string(),
  items: z
    .array(CreateOrderItemInputSchema)
    .min(1, "At least one item is required"),
  totalAmount: z.number().nonnegative(),
});

export const OrderStatusResponseSchema = z.object({
  id: z.string(),
  status: OrderStatusSchema,
});

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrdersResponse = z.infer<typeof OrdersResponseSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
export type OrderStatusResponse = z.infer<typeof OrderStatusResponseSchema>;
