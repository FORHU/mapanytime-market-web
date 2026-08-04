import { z } from "zod";

/** `costPrice` is a nullable Prisma `Decimal`, delivered as a JSON string. */
const NullableMoneySchema = z.coerce.number().nullable().optional();

export const SupplierProductSchema = z.object({
  id: z.string(),
  sellerId: z.string(),
  productId: z.string(),
  supplierSku: z.string().nullable().optional(),
  costPrice: NullableMoneySchema,
  minimumOrderQty: z.coerce.number().int().min(1),
  supplyLeadDays: z.coerce.number().int().min(0),
  isAvailable: z.boolean(),
  createdAt: z.string(),
});

export const SupplierProductsSchema = z.array(SupplierProductSchema);

export const CreateSupplierProductInputSchema = z.object({
  sellerId: z.string().min(1),
  productId: z.string().min(1),
  supplierSku: z.string().optional(),
  costPrice: z.number().min(0).optional(),
  minimumOrderQty: z.number().int().min(1).optional(),
  supplyLeadDays: z.number().int().min(0).optional(),
});

export const UpdateSupplierProductInputSchema = z.object({
  id: z.string().min(1),
  supplierSku: z.string().optional(),
  costPrice: z.number().min(0).optional(),
  minimumOrderQty: z.number().int().min(1).optional(),
  supplyLeadDays: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
});

export type SupplierProduct = z.infer<typeof SupplierProductSchema>;
export type CreateSupplierProductInput = z.infer<
  typeof CreateSupplierProductInputSchema
>;
export type UpdateSupplierProductInput = z.infer<
  typeof UpdateSupplierProductInputSchema
>;
