import { fetcher } from "@/shared/lib/http";
import {
  StoresResponseSchema,
  type StoresResponse,
  StoreDetailSchema,
  type StoreDetail,
} from "../contracts/manage-stores.contract";

export const listMyStores = async (): Promise<StoresResponse> => {
  const res = await fetcher<{ data: unknown }>("/api/v1/stores/my-stores");
  return StoresResponseSchema.parse(res.data);
};

/**
 * Delete a rejected store.
 *
 * No response body worth parsing. The backend refuses anything that is not
 * REJECTED with a 409, which `fetcher` turns into an ApiError — the caller does
 * not re-check the status.
 */
export const deleteStore = async (storeId: string): Promise<void> => {
  await fetcher(`/api/v1/stores/${encodeURIComponent(storeId)}`, {
    method: "DELETE",
  });
};

export const getStoreById = async (storeId: string): Promise<StoreDetail> => {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/stores/${encodeURIComponent(storeId)}`,
  );
  return StoreDetailSchema.parse(res.data);
};
