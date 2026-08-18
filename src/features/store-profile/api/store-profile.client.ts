import { fetcher } from "@/shared/lib/http";
import {
  StoreProfilesResponseSchema,
  StoreProfileSchema,
  StoreCategoriesResponseSchema,
  type StoreProfile,
  type StoreProfilesResponse,
  type StoreCategoriesResponse,
  type UpdateStoreProfileInput,
} from "../contracts/store-profile.contract";

/**
 * Fetch all stores owned by the current authenticated user.
 */
export const listMyStores = async (): Promise<StoreProfilesResponse> => {
  const res = await fetcher<{ data: unknown }>("/api/v1/stores/my-stores");
  return StoreProfilesResponseSchema.parse(res.data);
};

/**
 * Fetch a single store profile by store ID.
 */
export const getStoreProfile = async (
  storeId: string,
): Promise<StoreProfile> => {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/stores/${encodeURIComponent(storeId)}`,
  );
  return StoreProfileSchema.parse(res.data);
};

/**
 * Fetch root category options for store profiling.
 */
export const getStoreCategories =
  async (): Promise<StoreCategoriesResponse> => {
    const res = await fetcher<{ data: unknown }>("/api/v1/categories/roots");
    return StoreCategoriesResponseSchema.parse(res.data);
  };

/**
 * Update store profile settings.
 *
 * BROKEN - PATCH /v1/stores/:id is not registered by the API. store.route.ts
 * defines only GET /nearby, GET /my-stores, GET /:id, GET /:id/products and
 * POST /, so this 404s. Nothing calls it today (the Save button in
 * StoreProfileSettings is a no-op), so the break is latent rather than live.
 * See docs/connection-audit.md §1.
 */
export const updateStoreProfile = async (
  storeId: string,
  input: UpdateStoreProfileInput,
): Promise<StoreProfile> => {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/stores/${encodeURIComponent(storeId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return StoreProfileSchema.parse(res.data);
};
