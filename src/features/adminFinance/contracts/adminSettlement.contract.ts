import { z } from "zod";

export const AdminSettlementSummarySchema = z.object({
  totalSettlements: z.number(),
  totalSales: z.number(),
  totalCommission: z.number(),
  totalPaymentFee: z.number(),
  pendingAmount: z.number(),
  heldAmount: z.number(),
  availableAmount: z.number(),
  paidOutAmount: z.number(),
  refundedAmount: z.number(),
  cashCommissionOwed: z.number(),
  holdDays: z.number(),
});

export type AdminSettlementSummary = z.infer<
  typeof AdminSettlementSummarySchema
>;

export const AdminSellerUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
});

export const AdminSellerSummarySchema = z.object({
  sellerId: z.string(),
  organizationName: z.string().nullable().optional(),
  storeName: z.string().nullable().optional(),
  storeId: z.string().nullable().optional(),
  user: AdminSellerUserSchema,
  totalSales: z.number(),
  totalCommission: z.number(),
  pendingAmount: z.number(),
  heldAmount: z.number(),
  availableAmount: z.number(),
  paidOutAmount: z.number(),
  refundedAmount: z.number(),
  cashCommissionOwed: z.number(),
  settlementCount: z.number(),
  nextReleaseEligibleAt: z.string().nullable().optional(),
});

export type AdminSellerSummary = z.infer<typeof AdminSellerSummarySchema>;

export const AdminSellerSummariesPageSchema = z.object({
  sellers: z.array(AdminSellerSummarySchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type AdminSellerSummariesPage = z.infer<
  typeof AdminSellerSummariesPageSchema
>;
