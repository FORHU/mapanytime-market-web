import { fetcher } from "@/shared/lib/http";
import {
  PromotionSchema,
  PromotionsResponseSchema,
  type Promotion,
  type PromotionsResponse,
  type PromotionFields,
  type CreatePromotionPayload,
} from "../contracts/promotions.contract";

export const listPromotions = async (
  storeId: string,
): Promise<PromotionsResponse> => {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/merchant-ads?storeId=${encodeURIComponent(storeId)}`,
  );
  return PromotionsResponseSchema.parse(res.data);
};

export const createPromotion = async (
  payload: CreatePromotionPayload,
): Promise<Promotion> => {
  const res = await fetcher<{ data: unknown }>("/api/v1/merchant-ads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return PromotionSchema.parse(res.data);
};

export const updatePromotion = async (
  id: string,
  payload: PromotionFields,
): Promise<Promotion> => {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/merchant-ads/${encodeURIComponent(id)}`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
  return PromotionSchema.parse(res.data);
};

export const deletePromotion = async (id: string): Promise<void> => {
  await fetcher(`/api/v1/merchant-ads/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};

export const togglePromotion = async (
  id: string,
  isActive: boolean,
): Promise<Promotion> => {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/merchant-ads/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify({ isActive }) },
  );
  return PromotionSchema.parse(res.data);
};
