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

export const getStoreById = async (storeId: string): Promise<StoreDetail> => {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/stores/${encodeURIComponent(storeId)}`,
  );
  return StoreDetailSchema.parse(res.data);
};
