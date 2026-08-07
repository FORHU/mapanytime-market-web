import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { listMyProperties } from "../api/property.client";
import type { PropertiesResponse } from "../contracts/property.contract";

export function useProperties() {
  return useSafeQuery<PropertiesResponse, Error>({
    queryKey: ["properties", "mine"],
    queryFn: listMyProperties,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
