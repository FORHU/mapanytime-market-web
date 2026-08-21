import { z } from "zod";

/**
 * FAOS v5 — Store Profile Contracts
 *
 * Authoritative schema for store profile domain objects.
 * Types are derived directly from schemas.
 */

export const StoreProfileLocationSchema = z
  .object({
    city: z.string().optional(),
    province: z.string().optional(),
    currentAddress: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.union([z.string(), z.number()]).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  })
  .loose();

export const StoreProfileCategorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    parentId: z.string().nullable().optional(),
  })
  .loose();

export const StoreProfileSchema = z
  .object({
    id: z.string(),
    storeName: z.string(),
    description: z.string().nullable().optional(),
    phone: z.union([z.string(), z.number()]).nullable().optional(),
    email: z.string().nullable().optional(),
    // The API returns the schema's own name, `primaryCategoryId`. `categoryId`
    // is kept because it is the name the PATCH body uses (the API translates it
    // to primaryCategoryId on write) and because older callers read it — but on
    // a GET it is always undefined, so read `primaryCategoryId ?? categoryId`.
    primaryCategoryId: z.string().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    isActive: z.boolean().default(true),
    approvalStatus: z.enum(["PENDING", "ACTIVE", "REJECTED"]).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    storeLocations: StoreProfileLocationSchema.optional(),
    primaryCategory: StoreProfileCategorySchema.nullable().optional(),
  })
  .loose();

export const StoreProfilesResponseSchema = z.array(StoreProfileSchema);

export const StoreCategoriesResponseSchema = z.array(
  StoreProfileCategorySchema,
);

export const UpdateStoreProfileSchema = z.object({
  storeName: z.string().min(1, "Store name is required").optional(),
  description: z.string().optional(),
  phone: z.union([z.string(), z.number()]).optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
  currentAddress: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.union([z.string(), z.number()]).optional(),
  country: z.string().optional(),
});

export type StoreProfileLocation = z.infer<typeof StoreProfileLocationSchema>;
export type StoreProfileCategory = z.infer<typeof StoreProfileCategorySchema>;
export type StoreProfile = z.infer<typeof StoreProfileSchema>;
export type StoreProfilesResponse = z.infer<typeof StoreProfilesResponseSchema>;
export type StoreCategoriesResponse = z.infer<
  typeof StoreCategoriesResponseSchema
>;
export type UpdateStoreProfileInput = z.infer<typeof UpdateStoreProfileSchema>;
