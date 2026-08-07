import { z } from "zod";

export const StoreLocationSchema = z
  .object({
    city: z.string(),
    province: z.string(),
    currentAddress: z.string(),
    country: z.string(),
  })
  .loose();

export const StoreSchema = z
  .object({
    id: z.string(),
    storeName: z.string(),
    description: z.string().nullable(),
    isActive: z.boolean(),
    approvalStatus: z.enum(["PENDING", "ACTIVE", "REJECTED"]).optional(),
    rejectionReason: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    storeLocations: StoreLocationSchema.optional(),
  })
  .loose();

export const StoresResponseSchema = z.array(StoreSchema);

export interface StoreProperty {
  id: string;
  propertyType: "HOUSE_LOT" | "RAW_LAND";
  status: "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "REJECTED";
  rejectionReason?: string | null;
  address: string;
  subdivision?: string | null;
}

export type StoreLocation = z.infer<typeof StoreLocationSchema>;
export type Store = z.infer<typeof StoreSchema>;
export type StoresResponse = z.infer<typeof StoresResponseSchema>;
