import { z } from "zod";

/**
 * FAOS v5 — Seller Analytics Contracts
 *
 * Authoritative schema for the seller analytics snapshot. The page that consumes
 * these is currently driven by a fixture (see `testing/seller-analytics.fixture.ts`),
 * but the shapes are modelled on the API's Prisma schema so that swapping the
 * fixture for a real response is a one-line change in the workspace component.
 *
 * Money fields use `z.coerce.number()` because the API serves Prisma `Decimal`
 * columns as JSON strings.
 */

/**
 * The four `PAYMENTSTATUS` members this page reports on, out of the nine the API
 * defines. The remaining states (AUTHORIZED, CAPTURED, VOIDED, PARTIALLY_REFUNDED,
 * REFUND_PENDING) are mid-flight or partial and are folded into these four by the
 * time a seller reads a report.
 */
export const PaymentStatusSchema = z.enum([
  "COMPLETED",
  "PENDING",
  "FAILED",
  "REFUNDED",
]);

/**
 * Only the channels `prisma/seeders/payments.seeder.ts` actually seeds for the
 * XENDIT provider. Cards, QR Ph and GrabPay belong to PAYMONGO; the seeder notes
 * their Xendit channel codes were never confirmed, so they are deliberately absent.
 */
export const XenditPaymentMethodSchema = z.enum(["GCASH", "MAYA"]);

export const RevenueSummarySchema = z.object({
  totalRevenue: z.coerce.number(),
  totalOrders: z.coerce.number().int(),
  /** Percentage change against the preceding window. Negative means a decline. */
  revenueChangePercentage: z.coerce.number(),
  orderChangePercentage: z.coerce.number(),
});

export const RevenuePointSchema = z.object({
  /** Short axis label, already localised by the producer. */
  label: z.string(),
  revenue: z.coerce.number(),
  orders: z.coerce.number().int(),
});

export const PickupPerformanceSchema = z.object({
  completed: z.coerce.number().int(),
  pending: z.coerce.number().int(),
  cancelled: z.coerce.number().int(),
});

export const XenditTransactionSchema = z.object({
  /** `Payments.id`, a cuid. Rendered through the portal's slice(0, 8) convention. */
  id: z.string(),
  /** `Orders.id`, a cuid. Same rendering. */
  orderId: z.string(),
  amount: z.coerce.number(),
  currency: z.string().default("PHP"),
  method: XenditPaymentMethodSchema,
  status: PaymentStatusSchema,
  /** ISO 8601. `paidAt` when settled, `createdAt` otherwise. */
  transactedAt: z.string(),
});

export const XenditSummarySchema = z.object({
  successfulPayments: z.coerce.number().int(),
  pendingPayments: z.coerce.number().int(),
  failedPayments: z.coerce.number().int(),
  refundedPayments: z.coerce.number().int(),
  /** Revenue settled through Xendit only. Excludes pay-on-pickup cash. */
  onlinePaymentRevenue: z.coerce.number(),
});

export const LocalDiscoverySchema = z.object({
  /** `MerchantAds.impressionsCount`: times the pin entered a buyer's map view. */
  pinImpressions: z.coerce.number().int(),
  storeViews: z.coerce.number().int(),
  /** `MerchantAds.clicksCount` scoped to product cards. */
  productClicks: z.coerce.number().int(),
  /** `MerchantAds.radiusKm`. The API default is 3. */
  discoveryRadiusKm: z.coerce.number(),
});

export const TopProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  views: z.coerce.number().int(),
  unitsSold: z.coerce.number().int(),
  revenue: z.coerce.number(),
});

export const CatalogSummarySchema = z.object({
  activeProducts: z.coerce.number().int(),
  lowStockProducts: z.coerce.number().int(),
  outOfStockProducts: z.coerce.number().int(),
  productViews: z.coerce.number().int(),
  topProducts: z.array(TopProductSchema),
});

export const AiListingActivitySchema = z.object({
  listingsCreated: z.coerce.number().int(),
  /** Seconds from photo upload to a publishable draft. */
  averageListingSeconds: z.coerce.number(),
  /** Share of AI drafts published without manual correction, as a percentage. */
  successRatePercentage: z.coerce.number(),
});

export const BuyerMixSchema = z.object({
  newBuyers: z.coerce.number().int(),
  returningBuyers: z.coerce.number().int(),
});

export const SellerAnalyticsSnapshotSchema = z.object({
  /** Human label for the window these figures cover, e.g. "Last 30 days". */
  rangeLabel: z.string(),
  revenue: RevenueSummarySchema,
  revenueTrend: z.array(RevenuePointSchema),
  pickup: PickupPerformanceSchema,
  xenditSummary: XenditSummarySchema,
  xenditTransactions: z.array(XenditTransactionSchema),
  discovery: LocalDiscoverySchema,
  catalog: CatalogSummarySchema,
  aiListings: AiListingActivitySchema,
  buyers: BuyerMixSchema,
});

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type XenditPaymentMethod = z.infer<typeof XenditPaymentMethodSchema>;
export type RevenueSummary = z.infer<typeof RevenueSummarySchema>;
export type RevenuePoint = z.infer<typeof RevenuePointSchema>;
export type PickupPerformance = z.infer<typeof PickupPerformanceSchema>;
export type XenditTransaction = z.infer<typeof XenditTransactionSchema>;
export type XenditSummary = z.infer<typeof XenditSummarySchema>;
export type LocalDiscovery = z.infer<typeof LocalDiscoverySchema>;
export type TopProduct = z.infer<typeof TopProductSchema>;
export type CatalogSummary = z.infer<typeof CatalogSummarySchema>;
export type AiListingActivity = z.infer<typeof AiListingActivitySchema>;
export type BuyerMix = z.infer<typeof BuyerMixSchema>;
export type SellerAnalyticsSnapshot = z.infer<
  typeof SellerAnalyticsSnapshotSchema
>;
