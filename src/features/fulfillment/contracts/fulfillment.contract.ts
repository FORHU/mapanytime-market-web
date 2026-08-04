import { z } from "zod";

/**
 * Money columns are Prisma `Decimal`, which serialize to JSON strings
 * ("150.00"), so every amount is coerced rather than asserted as a number.
 */
const MoneySchema = z.coerce.number().nonnegative();

export const ShipmentStatusSchema = z.enum([
  "PENDING",
  "LABEL_CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "RETURNED",
]);

export const ShipmentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  courier: z.string(),
  trackingNumber: z.string().nullable().optional(),
  shippingFee: MoneySchema,
  labelUrl: z.string().nullable().optional(),
  status: ShipmentStatusSchema,
  shippedAt: z.string().nullable().optional(),
  deliveredAt: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const CreateShipmentInputSchema = z.object({
  orderId: z.string().min(1),
  courier: z.string().min(1),
  trackingNumber: z.string().optional(),
  shippingFee: z.number().nonnegative().optional(),
  labelUrl: z.string().optional(),
});

export const UpdateShipmentStatusInputSchema = z.object({
  shipmentId: z.string().min(1),
  status: ShipmentStatusSchema,
});

export const ReturnStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ITEM_RECEIVED",
  "REFUNDED",
]);

export const ReturnRequestSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  reason: z.string(),
  status: ReturnStatusSchema,
  refundAmount: MoneySchema,
  requestedAt: z.string(),
});

export const ReturnRequestsSchema = z.array(ReturnRequestSchema);

export const UpdateReturnStatusInputSchema = z.object({
  returnId: z.string().min(1),
  status: ReturnStatusSchema,
});

export type ShipmentStatus = z.infer<typeof ShipmentStatusSchema>;
export type Shipment = z.infer<typeof ShipmentSchema>;
export type CreateShipmentInput = z.infer<typeof CreateShipmentInputSchema>;
export type UpdateShipmentStatusInput = z.infer<
  typeof UpdateShipmentStatusInputSchema
>;
export type ReturnStatus = z.infer<typeof ReturnStatusSchema>;
export type ReturnRequest = z.infer<typeof ReturnRequestSchema>;
export type UpdateReturnStatusInput = z.infer<
  typeof UpdateReturnStatusInputSchema
>;
