import { z } from "zod";
import { fetcher } from "@/shared/lib/http";
import {
  PromotionSchema,
  PromotionsResponseSchema,
  PromotionBadgeSchema,
  unwrapPromotions,
  type Promotion,
  type PromotionFields,
  type CreatePromotionPayload,
  type PromotionBadge,
} from "../contracts/promotions.contract";

export interface PromotionsList {
  items: Promotion[];
  /**
   * The API's clock at response time. Countdowns and past-time checks are
   * offset by the difference against the browser's clock, so a seller whose
   * device runs a few minutes fast doesn't see a live promo as "starts in
   * 3 minutes" or get a valid start time rejected as past.
   */
  serverTime: string | null;
}

export const listPromotions = async (
  storeId: string,
): Promise<PromotionsList> => {
  const res = await fetcher<{ data: unknown }>(
    `/api/v1/merchant-ads?storeId=${encodeURIComponent(storeId)}`,
  );
  return unwrapPromotions(PromotionsResponseSchema.parse(res.data));
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

export const listPromotionBadges = async (): Promise<PromotionBadge[]> => {
  const res = await fetcher<{ data: unknown }>("/api/v1/merchant-ads/badges");
  return z.array(PromotionBadgeSchema).parse(res.data);
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
