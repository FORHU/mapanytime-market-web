import { z } from "zod";

export const AdminOrderStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
]);

export const AdminOrderItemSchema = z.object({
  productId: z.string(),
  productName: z.string().nullable().optional(),
  quantity: z.number(),
  unitPrice: z.coerce.number(),
});

export const AdminOrderSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  storeName: z.string().nullable().optional(),
  buyerName: z.string().nullable().optional(),
  buyerPhone: z.string().nullable().optional(),
  /** Peso amounts arrive as Decimal strings from Prisma. */
  totalAmount: z.coerce.number(),
  status: AdminOrderStatusSchema,
  type: z.string(),
  paymentMethod: z.string().nullable().optional(),
  pickupAt: z.string().nullable().optional(),
  createdAt: z.string(),
  items: z.array(AdminOrderItemSchema),
});

/** The API's standard page envelope. */
export const AdminOrdersPageSchema = z.object({
  items: z.array(AdminOrderSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number().optional(),
});

export type AdminOrder = z.infer<typeof AdminOrderSchema>;
export type AdminOrderStatus = z.infer<typeof AdminOrderStatusSchema>;
export type AdminOrdersPage = z.infer<typeof AdminOrdersPageSchema>;
