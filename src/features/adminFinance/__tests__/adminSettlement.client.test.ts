import { describe, it, expect, vi, beforeEach } from "vitest";
import * as http from "@/shared/lib/http";
import {
  getAdminSettlementSummary,
  getAdminSellerSummaries,
} from "../api/adminSettlement.client";

describe("adminSettlement.client (MA-2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAdminSettlementSummary", () => {
    it("fetches settlement summary without dates and parses schema", async () => {
      const mockResponse = {
        data: {
          totalSettlements: 42,
          totalSales: 150000,
          totalCommission: 7500,
          totalPaymentFee: 3000,
          pendingAmount: 25000,
          heldAmount: 5000,
          availableAmount: 112500,
          paidOutAmount: 0,
          refundedAmount: 0,
          cashCommissionOwed: 1200,
          holdDays: 7,
        },
      };

      const fetcherSpy = vi
        .spyOn(http, "fetcher")
        .mockResolvedValueOnce(mockResponse as never);

      const result = await getAdminSettlementSummary();

      expect(fetcherSpy).toHaveBeenCalledWith(
        "/api/v1/settlements/admin/summary",
        { signal: undefined },
      );
      expect(result.totalSettlements).toBe(42);
      expect(result.totalSales).toBe(150000);
      expect(result.totalCommission).toBe(7500);
      expect(result.pendingAmount).toBe(25000);
      expect(result.cashCommissionOwed).toBe(1200);
      expect(result.holdDays).toBe(7);
    });

    it("includes startDate and endDate in query params when provided", async () => {
      const mockResponse = {
        data: {
          totalSettlements: 10,
          totalSales: 50000,
          totalCommission: 2500,
          totalPaymentFee: 1000,
          pendingAmount: 0,
          heldAmount: 0,
          availableAmount: 46500,
          paidOutAmount: 46500,
          refundedAmount: 0,
          cashCommissionOwed: 0,
          holdDays: 7,
        },
      };

      const fetcherSpy = vi
        .spyOn(http, "fetcher")
        .mockResolvedValueOnce(mockResponse as never);

      const result = await getAdminSettlementSummary({
        startDate: "2026-11-01T00:00:00.000Z",
        endDate: "2026-11-07T23:59:59.999Z",
      });

      expect(fetcherSpy).toHaveBeenCalledWith(
        "/api/v1/settlements/admin/summary?startDate=2026-11-01T00%3A00%3A00.000Z&endDate=2026-11-07T23%3A59%3A59.999Z",
        { signal: undefined },
      );
      expect(result.totalSettlements).toBe(10);
    });
  });

  describe("getAdminSellerSummaries", () => {
    it("fetches paginated seller settlement records with search query", async () => {
      const mockResponse = {
        data: {
          sellers: [
            {
              sellerId: "seller-1",
              organizationName: "Fresh Organics Corp",
              storeName: "Fresh Veggie Stall",
              storeId: "store-1",
              user: {
                id: "user-1",
                email: "merchant@example.com",
                name: "Maria Santos",
              },
              totalSales: 45000,
              totalCommission: 2250,
              pendingAmount: 5000,
              heldAmount: 0,
              availableAmount: 37750,
              paidOutAmount: 0,
              refundedAmount: 0,
              cashCommissionOwed: 350,
              settlementCount: 15,
              nextReleaseEligibleAt: "2026-11-17T00:00:00.000Z",
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      const fetcherSpy = vi
        .spyOn(http, "fetcher")
        .mockResolvedValueOnce(mockResponse as never);

      const result = await getAdminSellerSummaries({
        page: 1,
        limit: 10,
        search: "Fresh",
      });

      expect(fetcherSpy).toHaveBeenCalledWith(
        "/api/v1/settlements/admin/sellers?page=1&limit=10&search=Fresh",
        { signal: undefined },
      );
      expect(result.sellers).toHaveLength(1);
      expect(result.sellers[0].storeName).toBe("Fresh Veggie Stall");
      expect(result.sellers[0].user.email).toBe("merchant@example.com");
      expect(result.sellers[0].availableAmount).toBe(37750);
      expect(result.sellers[0].cashCommissionOwed).toBe(350);
    });
  });
});
