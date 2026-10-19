import { fetcher } from "@/shared/lib/http";
import {
  PricingConfigurationsResponseSchema,
  PricingConfigurationSchema,
  type PricingConfiguration,
} from "../contracts/pricing.contract";

interface ApiResponse<T> {
  status?: string;
  data: T;
  message?: string;
}

export async function getPricingConfigurations(): Promise<
  PricingConfiguration[]
> {
  const res = await fetcher<ApiResponse<unknown> | unknown[]>(
    "/api/v1/pricing/configurations",
  );
  const raw = Array.isArray(res)
    ? res
    : ((res as ApiResponse<unknown>)?.data ?? []);
  return PricingConfigurationsResponseSchema.parse(raw);
}

export async function getPricingConfiguration(
  id: string,
): Promise<PricingConfiguration> {
  const res = await fetcher<ApiResponse<unknown> | Record<string, unknown>>(
    `/api/v1/pricing/configurations/${id}`,
  );
  const raw =
    res && typeof res === "object" && "data" in res
      ? (res as ApiResponse<unknown>).data
      : res;
  return PricingConfigurationSchema.parse(raw);
}

export async function activatePricingConfiguration(
  id: string,
): Promise<PricingConfiguration> {
  const res = await fetcher<ApiResponse<unknown> | Record<string, unknown>>(
    `/api/v1/pricing/configurations/${id}/activate`,
    {
      method: "POST",
    },
  );
  const raw =
    res && typeof res === "object" && "data" in res
      ? (res as ApiResponse<unknown>).data
      : res;
  return PricingConfigurationSchema.parse(raw);
}

export async function archivePricingConfiguration(
  id: string,
): Promise<PricingConfiguration> {
  const res = await fetcher<ApiResponse<unknown> | Record<string, unknown>>(
    `/api/v1/pricing/configurations/${id}/archive`,
    {
      method: "POST",
    },
  );
  const raw =
    res && typeof res === "object" && "data" in res
      ? (res as ApiResponse<unknown>).data
      : res;
  return PricingConfigurationSchema.parse(raw);
}
