// getMySettlements/getMyPayouts back the seller-facing /seller/finance page.
// getOrderSettlement/createPayout/updatePayoutStatus hit admin-only routes
// and have no UI caller yet — for a future admin payouts panel.
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

/** The authenticated seller's own settlement ledger. */
export const getMySettlements = async (): Promise<Settlement[]> => {
  const raw = await fetcher<{ data: unknown }>("/api/v1/settlements/me");
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

/** The authenticated seller's own payout history. */
export const getMyPayouts = async (): Promise<Payout[]> => {
  const raw = await fetcher<{ data: unknown }>("/api/v1/payouts/me");
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
