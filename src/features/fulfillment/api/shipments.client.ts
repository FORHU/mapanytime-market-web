// built, not mounted - /v1/shipments/* exists and the contracts match, but no
// UI file imports useShipments. Same for the sibling returns.client.ts.
// See docs/connection-audit.md §6.
import { fetcher } from "@/shared/lib/http";
import {
  ShipmentSchema,
  type CreateShipmentInput,
  type Shipment,
  type UpdateShipmentStatusInput,
} from "../contracts/fulfillment.contract";

/**
 * Shipment records for seller orders. One shipment per order — the backend
 * rejects a second create for the same `orderId` with a 400.
 */
export const getShipmentByOrder = async (
  orderId: string,
): Promise<Shipment> => {
  const raw = await fetcher<{ data: unknown }>(
    `/api/v1/shipments/order/${orderId}`,
  );
  return ShipmentSchema.parse(raw.data);
};

export const createShipment = async (
  input: CreateShipmentInput,
): Promise<Shipment> => {
  const raw = await fetcher<{ data: unknown }>("/api/v1/shipments", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return ShipmentSchema.parse(raw.data);
};

export const updateShipmentStatus = async ({
  shipmentId,
  status,
}: UpdateShipmentStatusInput): Promise<Shipment> => {
  const raw = await fetcher<{ data: unknown }>(
    `/api/v1/shipments/${shipmentId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  return ShipmentSchema.parse(raw.data);
};
