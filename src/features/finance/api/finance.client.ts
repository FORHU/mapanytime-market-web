import { fetcher } from "@/shared/lib/http";
import {
  PayoutSchema,
  PayoutsSchema,
  SettlementSchema,
  SettlementsSchema,
  type CreatePayoutInput,
  type Payout,
  type Settlement,
  type UpdatePayoutStatusInput,
} from "../contracts/finance.contract";

/** Per-order earnings ledger: subtotal → commission → fees → seller net. */
export const getSellerSettlements = async (
  sellerId: string,
): Promise<Settlement[]> => {
  const raw = await fetcher<{ data: unknown }>(
    `/api/v1/settlements/seller/${sellerId}`,
  );
  return SettlementsSchema.parse(raw.data ?? []);
};

export const getOrderSettlement = async (
  orderId: string,
): Promise<Settlement> => {
  const raw = await fetcher<{ data: unknown }>(
    `/api/v1/settlements/order/${orderId}`,
  );
  return SettlementSchema.parse(raw.data);
};

/** Payout batches grouping released settlements into a single disbursement. */
export const getSellerPayouts = async (sellerId: string): Promise<Payout[]> => {
  const raw = await fetcher<{ data: unknown }>(
    `/api/v1/payouts/seller/${sellerId}`,
  );
  return PayoutsSchema.parse(raw.data ?? []);
};

export const createPayout = async (
  input: CreatePayoutInput,
): Promise<Payout> => {
  const raw = await fetcher<{ data: unknown }>("/api/v1/payouts", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return PayoutSchema.parse(raw.data);
};

export const updatePayoutStatus = async ({
  payoutId,
  status,
  referenceNo,
}: UpdatePayoutStatusInput): Promise<Payout> => {
  const raw = await fetcher<{ data: unknown }>(
    `/api/v1/payouts/${payoutId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, referenceNo }),
    },
  );
  return PayoutSchema.parse(raw.data);
};
