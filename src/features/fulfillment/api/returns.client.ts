import { fetcher } from "@/shared/lib/http";
import {
  ReturnRequestSchema,
  ReturnRequestsSchema,
  type ReturnRequest,
  type UpdateReturnStatusInput,
} from "../contracts/fulfillment.contract";

/** Return requests raised against this seller's orders. */
export const getSellerReturns = async (
  sellerId: string,
): Promise<ReturnRequest[]> => {
  const raw = await fetcher<{ data: unknown }>(
    `/api/v1/returns/seller/${sellerId}`,
  );
  return ReturnRequestsSchema.parse(raw.data ?? []);
};

/** Moves a return through PENDING → APPROVED/REJECTED → ITEM_RECEIVED → REFUNDED. */
export const updateReturnStatus = async ({
  returnId,
  status,
}: UpdateReturnStatusInput): Promise<ReturnRequest> => {
  const raw = await fetcher<{ data: unknown }>(
    `/api/v1/returns/${returnId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  return ReturnRequestSchema.parse(raw.data);
};
