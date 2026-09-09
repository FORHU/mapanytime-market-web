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
    approvalStatus: z.string().optional(),
    primaryCategoryId: z.string().nullable().optional(),
    rejectionReason: z.string().nullable().optional(),
    revisionNotes: z.string().nullable().optional(),
    /** When the store was rejected. Null unless `approvalStatus` is REJECTED. */
    rejectedAt: z.string().nullable().optional(),
    /**
     * When the backend will delete this store, computed server-side from
     * `rejectedAt`. The countdown reads this rather than adding 24 hours to
     * `rejectedAt` itself: the window belongs to the sweep that enforces it, and
     * a copy of its length here could disagree with it.
     */
    scheduledDeletionAt: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    storeLocations: StoreLocationSchema.optional(),
  })
  .loose();

export const StoresResponseSchema = z.array(StoreSchema);

export const StoreCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullable().optional(),
});

export const StoreDetailSchema = z
  .object({
    id: z.string(),
    primaryCategory: StoreCategorySchema.nullable().optional(),
    categories: z.array(StoreCategorySchema),
  })
  .loose();

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
export type StoreCategory = z.infer<typeof StoreCategorySchema>;
export type StoreDetail = z.infer<typeof StoreDetailSchema>;
