import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getPropertyDashboard } from "../api/property.client";
import type { Property } from "../contracts/property.contract";

export function usePropertyDashboard(propertyId: string) {
  return useSafeQuery<Property, Error>({
    queryKey: ["properties", "dashboard", propertyId],
    queryFn: () => getPropertyDashboard(propertyId),
    enabled: Boolean(propertyId),
  });
}
