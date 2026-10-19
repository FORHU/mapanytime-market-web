import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  getPricingConfigurations,
  getPricingConfiguration,
  activatePricingConfiguration,
  archivePricingConfiguration,
} from "../api/pricing.client";
import { pricingKeys } from "../api/pricing.keys";
import type { PricingConfiguration } from "../contracts/pricing.contract";

export function usePricingConfigurations() {
  return useSafeQuery<PricingConfiguration[], Error>({
    queryKey: pricingKeys.configurations(),
    queryFn: getPricingConfigurations,
  });
}

export function usePricingConfiguration(id: string) {
  return useSafeQuery<PricingConfiguration, Error>({
    queryKey: pricingKeys.configurationDetail(id),
    queryFn: () => getPricingConfiguration(id),
    enabled: Boolean(id),
  });
}

export function usePricingActions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: pricingKeys.all });

  const activate = useSafeMutation({
    mutationFn: (id: string) => activatePricingConfiguration(id),
    onSuccess: invalidate,
  });

  const archive = useSafeMutation({
    mutationFn: (id: string) => archivePricingConfiguration(id),
    onSuccess: invalidate,
  });

  return { activate, archive };
}
