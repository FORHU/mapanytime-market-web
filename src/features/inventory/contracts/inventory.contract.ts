import { z } from "zod";

export const InventorySourceProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative().optional(),
  sku: z.string().optional(),
});

export const InventoryStockStatusSchema = z.enum([
  "IN_STOCK",
  "OUT_OF_STOCK",
  "UNKNOWN",
]);

export const InventoryItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  sku: z.string().optional(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative().optional(),
  status: InventoryStockStatusSchema,
});

export const InventoryItemsResponseSchema = z.array(InventoryItemSchema);

export type InventorySourceProduct = z.infer<
  typeof InventorySourceProductSchema
>;
export type InventoryStockStatus = z.infer<typeof InventoryStockStatusSchema>;
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type InventoryItemsResponse = z.infer<
  typeof InventoryItemsResponseSchema
>;
