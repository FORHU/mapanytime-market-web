import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  createShipment,
  getShipmentByOrder,
  updateShipmentStatus,
} from "../api/shipments.client";
import { fulfillmentKeys } from "../api/fulfillment.keys";
import type { Shipment } from "../contracts/fulfillment.contract";

/**
 * The shipment attached to an order. Disabled until an `orderId` exists, and
 * not retried on 404 — "no shipment yet" is the normal state before the seller
 * creates one.
 */
export function useShipmentByOrder(orderId: string | null) {
  return useSafeQuery<Shipment>({
    queryKey: fulfillmentKeys.shipmentByOrder(orderId ?? ""),
    queryFn: () => getShipmentByOrder(orderId as string),
    enabled: Boolean(orderId),
    staleTime: 60 * 1000,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: createShipment,
    onSuccess: (shipment) => {
      queryClient.setQueryData(
        fulfillmentKeys.shipmentByOrder(shipment.orderId),
        shipment,
      );
    },
  });
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: updateShipmentStatus,
    onSuccess: (shipment) => {
      queryClient.setQueryData(
        fulfillmentKeys.shipmentByOrder(shipment.orderId),
        shipment,
      );
    },
  });
}
