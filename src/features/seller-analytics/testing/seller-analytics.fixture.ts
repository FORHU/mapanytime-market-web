import type { SellerAnalyticsSnapshot } from "../contracts/seller-analytics.contract";

/**
 * A stand-in for the seller analytics endpoint that does not exist yet.
 *
 * This is a fixture, not a contract. The shapes come from
 * `contracts/seller-analytics.contract.ts`, which is modelled on the API's Prisma
 * schema, so replacing this export with a parsed API response should require no
 * changes in the components. The numbers themselves are illustrative.
 *
 * Kept internally consistent on purpose, and guarded by
 * `lib/__tests__/derive.test.ts`:
 *   - the three pickup outcomes sum to `revenue.totalOrders`
 *   - Xendit payment outcomes sum to fewer than the total orders, because the
 *     remainder were paid with cash on pickup (a real method on this platform)
 *   - `onlinePaymentRevenue` is a subset of `revenue.totalRevenue`
 *   - the discovery funnel only ever narrows
 *
 * Every rate, average and total the page shows is derived from these base counts
 * at render time via `lib/derive.ts`, never stored here.
 */

// ── Mock data (swap for real fetches) ───────────────────────────────────

/**
 * Cuid-shaped ids so the portal's `#{id.slice(0, 8).toUpperCase()}` display
 * convention produces something that looks like the real thing.
 */
const XENDIT_TRANSACTIONS: SellerAnalyticsSnapshot["xenditTransactions"] = [
  {
    id: "cmg2f8k4a0011xq7d3vbnp01",
    orderId: "cmg2f7x1b0004xq7d9klmt77",
    amount: 1249.0,
    currency: "PHP",
    method: "GCASH",
    status: "COMPLETED",
    transactedAt: "2026-09-21T09:14:00.000Z",
  },
  {
    id: "cmg2e6j2z0010xq7d8ranm94",
    orderId: "cmg2e5p9c0003xq7d2wxyz18",
    amount: 385.5,
    currency: "PHP",
    method: "MAYA",
    status: "COMPLETED",
    transactedAt: "2026-09-21T07:42:00.000Z",
  },
  {
    id: "cmg2d4h8v000fxq7d5qpor22",
    orderId: "cmg2d3m6k0002xq7d7bcde55",
    amount: 2760.75,
    currency: "PHP",
    method: "GCASH",
    status: "PENDING",
    transactedAt: "2026-09-20T18:03:00.000Z",
  },
  {
    id: "cmg2c9n5t000exq7d1stuv63",
    orderId: "cmg2c8q4w0001xq7d6fghi90",
    amount: 640.0,
    currency: "PHP",
    method: "MAYA",
    status: "FAILED",
    transactedAt: "2026-09-20T15:27:00.000Z",
  },
  {
    id: "cmg2b1r7y000dxq7d4jklm36",
    orderId: "cmg2b0s3e0009xq7d0nopq41",
    amount: 918.25,
    currency: "PHP",
    method: "GCASH",
    status: "REFUNDED",
    transactedAt: "2026-09-20T11:55:00.000Z",
  },
  {
    id: "cmg2a3v6u000cxq7d8wxyz74",
    orderId: "cmg2a2t8f0008xq7d3abcd27",
    amount: 1475.0,
    currency: "PHP",
    method: "GCASH",
    status: "COMPLETED",
    transactedAt: "2026-09-19T16:31:00.000Z",
  },
  {
    id: "cmg295b3q000bxq7d6efgh18",
    orderId: "cmg294c7h0007xq7d9ijkl62",
    amount: 512.4,
    currency: "PHP",
    method: "MAYA",
    status: "COMPLETED",
    transactedAt: "2026-09-19T13:08:00.000Z",
  },
  {
    id: "cmg287d9m000axq7d2mnop53",
    orderId: "cmg286e1j0006xq7d5qrst84",
    amount: 3184.9,
    currency: "PHP",
    method: "GCASH",
    status: "COMPLETED",
    transactedAt: "2026-09-18T10:46:00.000Z",
  },
];

export const SELLER_ANALYTICS_SNAPSHOT: SellerAnalyticsSnapshot = {
  rangeLabel: "Last 30 days",

  revenue: {
    totalRevenue: 184720.5,
    totalOrders: 412,
    revenueChangePercentage: 12.4,
    orderChangePercentage: 8.1,
  },

  // Six weekly buckets. Labels are short enough for a mobile axis.
  revenueTrend: [
    { label: "Aug 18", revenue: 22480.0, orders: 52 },
    { label: "Aug 25", revenue: 27310.5, orders: 61 },
    { label: "Sep 1", revenue: 31875.25, orders: 70 },
    { label: "Sep 8", revenue: 29640.75, orders: 66 },
    { label: "Sep 15", revenue: 35914.0, orders: 79 },
    { label: "Sep 22", revenue: 37500.0, orders: 84 },
  ],

  // 361 + 34 + 17 = 412, matching revenue.totalOrders above.
  pickup: {
    completed: 361,
    pending: 34,
    cancelled: 17,
  },

  // 248 + 19 + 11 + 4 = 282 online payments. The other 130 orders were cash on
  // pickup, which is the platform's COD method.
  xenditSummary: {
    successfulPayments: 248,
    pendingPayments: 19,
    failedPayments: 11,
    refundedPayments: 4,
    onlinePaymentRevenue: 121340.0,
  },

  xenditTransactions: XENDIT_TRANSACTIONS,

  discovery: {
    pinImpressions: 24318,
    storeViews: 5142,
    productClicks: 1876,
    // The API default for MerchantAds.radiusKm.
    discoveryRadiusKm: 3,
  },

  catalog: {
    activeProducts: 87,
    lowStockProducts: 12,
    outOfStockProducts: 5,
    productViews: 9204,
    topProducts: [
      {
        id: "cmg1p4k8t0001xq7d2abcd11",
        name: "Buko Pandan Salad, 1L tub",
        views: 1842,
        unitsSold: 96,
        revenue: 22080.0,
      },
      {
        id: "cmg1p5m2v0002xq7d3efgh22",
        name: "Pandesal, tray of 24",
        views: 1516,
        unitsSold: 134,
        revenue: 16080.0,
      },
      {
        id: "cmg1p6n7w0003xq7d4ijkl33",
        name: "Calamansi concentrate, 500ml",
        views: 1279,
        unitsSold: 71,
        revenue: 12425.0,
      },
      {
        id: "cmg1p7p3x0004xq7d5mnop44",
        name: "Dried mangoes, 250g pack",
        views: 1094,
        unitsSold: 88,
        revenue: 10560.0,
      },
      {
        id: "cmg1p8q9y0005xq7d6qrst55",
        name: "Barako coffee beans, 1kg",
        views: 903,
        unitsSold: 42,
        revenue: 9870.0,
      },
    ],
  },

  /**
   * Illustrative only. Unlike every other section here, AI listing activity has
   * no counterpart in the API: nothing in the Prisma schema records that a
   * listing was drafted by the assistant, how long it took, or whether it was
   * published unedited. These three figures are placeholders for metrics that
   * would need to be instrumented before they could be reported.
   */
  aiListings: {
    listingsCreated: 34,
    averageListingSeconds: 108,
    successRatePercentage: 91.2,
  },

  // 173 + 96 = 269 distinct buyers behind 412 orders.
  buyers: {
    newBuyers: 173,
    returningBuyers: 96,
  },
};
