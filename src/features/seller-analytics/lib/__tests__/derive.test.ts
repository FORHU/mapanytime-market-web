import { describe, it, expect } from "vitest";
import {
  averageOrderValue,
  pickupTotal,
  pickupCompletionRate,
  totalBuyers,
  returningBuyerShare,
  onlinePaymentCount,
  formatDuration,
  formatPercentage,
  formatCount,
} from "../derive";
// Absolute own-feature alias, not `../../testing/...`: tools/validate-architecture.mjs
// rejects any specifier starting with `../..`.
import { SELLER_ANALYTICS_SNAPSHOT } from "@/features/seller-analytics/testing/seller-analytics.fixture";

describe("averageOrderValue", () => {
  it("divides revenue by order count", () => {
    expect(averageOrderValue(1000, 4)).toBe(250);
  });

  it("returns 0 rather than Infinity for a store with no orders", () => {
    // A brand-new store hits this on its first visit to the page.
    expect(averageOrderValue(0, 0)).toBe(0);
    expect(averageOrderValue(500, 0)).toBe(0);
  });
});

describe("pickupCompletionRate", () => {
  it("counts pending orders against the rate, not toward it", () => {
    // 5 of 10 are done; the 3 pending have not been picked up yet.
    const rate = pickupCompletionRate({
      completed: 5,
      pending: 3,
      cancelled: 2,
    });
    expect(rate).toBe(50);
  });

  it("returns 0 for an empty window", () => {
    expect(
      pickupCompletionRate({ completed: 0, pending: 0, cancelled: 0 }),
    ).toBe(0);
  });
});

describe("returningBuyerShare", () => {
  it("measures returning buyers against all buyers", () => {
    expect(returningBuyerShare({ newBuyers: 3, returningBuyers: 1 })).toBe(25);
  });

  it("returns 0 when nobody has bought yet", () => {
    expect(returningBuyerShare({ newBuyers: 0, returningBuyers: 0 })).toBe(0);
  });
});

describe("onlinePaymentCount", () => {
  it("sums every Xendit outcome, including refunds", () => {
    expect(
      onlinePaymentCount({
        successfulPayments: 10,
        pendingPayments: 2,
        failedPayments: 3,
        refundedPayments: 1,
        onlinePaymentRevenue: 0,
      }),
    ).toBe(16);
  });
});

describe("formatDuration", () => {
  it("drops the minute segment under a minute", () => {
    expect(formatDuration(48)).toBe("48s");
  });

  it("splits minutes and seconds", () => {
    expect(formatDuration(108)).toBe("1m 48s");
  });

  it("clamps negatives to zero", () => {
    expect(formatDuration(-5)).toBe("0s");
  });
});

describe("formatPercentage", () => {
  it("keeps one decimal place", () => {
    expect(formatPercentage(87.62135)).toBe("87.6%");
  });

  it("omits a trailing zero decimal", () => {
    expect(formatPercentage(90)).toBe("90%");
  });
});

describe("formatCount", () => {
  it("groups thousands", () => {
    expect(formatCount(24318)).toBe("24,318");
  });
});

describe("the shipped fixture", () => {
  const snapshot = SELLER_ANALYTICS_SNAPSHOT;

  it("splits its order count across exactly the three pickup outcomes", () => {
    // The pickup panel and the revenue tiles are read side by side, so a
    // mismatch here is visible on screen.
    expect(pickupTotal(snapshot.pickup)).toBe(snapshot.revenue.totalOrders);
  });

  it("has trend buckets that sum to the headline totals", () => {
    // The chart sits directly under the revenue tiles, so a reader can add the
    // buckets up by eye.
    const revenue = snapshot.revenueTrend.reduce(
      (sum, p) => sum + p.revenue,
      0,
    );
    const orders = snapshot.revenueTrend.reduce((sum, p) => sum + p.orders, 0);
    expect(revenue).toBeCloseTo(snapshot.revenue.totalRevenue, 2);
    expect(orders).toBe(snapshot.revenue.totalOrders);
  });

  it("never claims more online payments than there were orders", () => {
    // The rest are pay-on-pickup cash, which is a real method on this platform.
    expect(onlinePaymentCount(snapshot.xenditSummary)).toBeLessThanOrEqual(
      snapshot.revenue.totalOrders,
    );
  });

  it("settles less through Xendit than it earns in total", () => {
    expect(snapshot.xenditSummary.onlinePaymentRevenue).toBeLessThan(
      snapshot.revenue.totalRevenue,
    );
  });

  it("does not have more distinct buyers than orders", () => {
    expect(totalBuyers(snapshot.buyers)).toBeLessThanOrEqual(
      snapshot.revenue.totalOrders,
    );
  });

  it("gets more impressions than store views, and more views than clicks", () => {
    // The discovery funnel only narrows.
    const { pinImpressions, storeViews, productClicks } = snapshot.discovery;
    expect(pinImpressions).toBeGreaterThan(storeViews);
    expect(storeViews).toBeGreaterThan(productClicks);
  });

  it("only uses Xendit channels the API actually seeds", () => {
    for (const txn of snapshot.xenditTransactions) {
      expect(["GCASH", "MAYA"]).toContain(txn.method);
    }
  });

  it("has no em-dash in any visible string", () => {
    // The design system bans it in page copy; the fixture is page copy.
    const visible = [
      snapshot.rangeLabel,
      ...snapshot.revenueTrend.map((p) => p.label),
      ...snapshot.catalog.topProducts.map((p) => p.name),
    ];
    for (const text of visible) {
      expect(text).not.toMatch(/[—–]/);
    }
  });
});
