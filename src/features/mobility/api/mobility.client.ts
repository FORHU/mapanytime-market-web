import { fetcher } from "@/shared/lib/http";
import {
  LiveVehicle,
  LiveVehicleSchema,
  VehicleTrail,
  VehicleTrailSchema,
  VehicleType,
  VehicleTypeSchema,
  ViewportBounds,
} from "../contracts/mobility.contract";
import { z } from "zod";

export async function fetchLiveVehicles(
  bounds: ViewportBounds,
  signal?: AbortSignal,
): Promise<LiveVehicle[]> {
  const params = new URLSearchParams({
    north: String(bounds.north),
    south: String(bounds.south),
    east: String(bounds.east),
    west: String(bounds.west),
  });

  const response = await fetcher<{ data: unknown[] }>(
    `/api/v1/mobility/vehicles/live?${params.toString()}`,
    { signal },
  );

  return z.array(LiveVehicleSchema).parse(response.data);
}

export async function fetchVehicleTypes(
  signal?: AbortSignal,
): Promise<VehicleType[]> {
  const response = await fetcher<{ data: unknown[] }>(
    "/api/v1/mobility/vehicle-types",
    { signal },
  );

  return z.array(VehicleTypeSchema).parse(response.data);
}

export interface TrailQueryOptions {
  limit?: number;
  since?: number;
  until?: number;
}

export async function fetchVehicleTrail(
  vehicleId: string,
  options: TrailQueryOptions = {},
  signal?: AbortSignal,
): Promise<VehicleTrail> {
  const params = new URLSearchParams();
  if (options.limit) params.set("limit", String(options.limit));
  if (options.since) params.set("since", String(options.since));
  if (options.until) params.set("until", String(options.until));

  const qs = params.toString();
  const url = `/api/v1/mobility/vehicles/${vehicleId}/trail${qs ? `?${qs}` : ""}`;

  const response = await fetcher<{ data: unknown }>(url, { signal });
  return VehicleTrailSchema.parse(response.data);
}
