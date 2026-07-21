import { fetcher } from "@/shared/lib/http";
import {
  CategoriesResponseSchema,
  type CategoriesResponse,
} from "../contracts/stores.contract";

export const getRootCategories = async (): Promise<CategoriesResponse> => {
  const res = await fetcher<{ data: unknown }>("/api/v1/categories/root");
  return CategoriesResponseSchema.parse(res.data);
};
