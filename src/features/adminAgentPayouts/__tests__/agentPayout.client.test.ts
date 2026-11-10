import { describe, it, expect, vi, beforeEach } from "vitest";
import * as http from "@/shared/lib/http";
import {
  listAdminAgentPayouts,
  getAgentCommissionConfig,
  approveAgentPayout,
  rejectAgentPayout,
} from "../api/agentPayout.client";

describe("agentPayout.client (MA-5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listAdminAgentPayouts", () => {
    it("fetches payouts with query parameters and parses result", async () => {
      const mockResponse = {
        data: {
          items: [
            {
              id: "payout-1",
              agentId: "agent-101",
              accountId: "acc-101",
              amount: 1500,
              status: "PENDING",
              paymentMethod: "BANK_TRANSFER",
              reference: null,
              processedAt: null,
              createdAt: "2026-11-10T00:00:00.000Z",
              agent: {
                id: "agent-101",
                email: "recruiter@example.com",
                firstName: "Carlos",
                lastName: "Gomez",
                phoneNumber: "+639170001122",
              },
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

      const result = await listAdminAgentPayouts({
        page: 1,
        limit: 10,
        status: "PENDING",
        search: "Carlos",
      });

      expect(fetcherSpy).toHaveBeenCalledWith(
        "/api/v1/agent/admin/payouts?page=1&limit=10&status=PENDING&search=Carlos",
        { signal: undefined },
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0].agent?.email).toBe("recruiter@example.com");
      expect(result.items[0].amount).toBe(1500);
    });
  });

  describe("getAgentCommissionConfig", () => {
    it("fetches active commission configuration", async () => {
      const mockResponse = {
        data: {
          commissionRate: 0.0005,
          commissionBase: "GMV",
          eligibilityHoldDays: 7,
          payoutMinimum: 500,
          isEnabled: true,
        },
      };

      const fetcherSpy = vi
        .spyOn(http, "fetcher")
        .mockResolvedValueOnce(mockResponse as never);

      const result = await getAgentCommissionConfig();

      expect(fetcherSpy).toHaveBeenCalledWith(
        "/api/v1/agent/commission/config",
        { signal: undefined },
      );
      expect(result.commissionRate).toBe(0.0005);
      expect(result.payoutMinimum).toBe(500);
      expect(result.isEnabled).toBe(true);
    });
  });

  describe("approveAgentPayout", () => {
    it("posts approval with reference note", async () => {
      const mockResponse = {
        data: {
          id: "payout-1",
          agentId: "agent-101",
          accountId: "acc-101",
          amount: 1500,
          status: "COMPLETED",
          paymentMethod: "BANK_TRANSFER",
          reference: "BDO-TX-109283",
          processedAt: "2026-11-10T01:00:00.000Z",
          createdAt: "2026-11-10T00:00:00.000Z",
        },
      };

      const fetcherSpy = vi
        .spyOn(http, "fetcher")
        .mockResolvedValueOnce(mockResponse as never);

      const result = await approveAgentPayout("payout-1", "BDO-TX-109283");

      expect(fetcherSpy).toHaveBeenCalledWith(
        "/api/v1/agent/admin/payouts/payout-1/approve",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ reference: "BDO-TX-109283" }),
        }),
      );
      expect(result.status).toBe("COMPLETED");
    });
  });

  describe("rejectAgentPayout", () => {
    it("posts rejection with reason and returns refund status", async () => {
      const mockResponse = {
        data: {
          id: "payout-1",
          agentId: "agent-101",
          accountId: "acc-101",
          amount: 1500,
          status: "FAILED",
          paymentMethod: "BANK_TRANSFER",
          reference: "REJECTED: Account mismatch",
          processedAt: "2026-11-10T01:00:00.000Z",
          createdAt: "2026-11-10T00:00:00.000Z",
        },
      };

      const fetcherSpy = vi
        .spyOn(http, "fetcher")
        .mockResolvedValueOnce(mockResponse as never);

      const result = await rejectAgentPayout("payout-1", "Account mismatch");

      expect(fetcherSpy).toHaveBeenCalledWith(
        "/api/v1/agent/admin/payouts/payout-1/reject",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ reason: "Account mismatch" }),
        }),
      );
      expect(result.status).toBe("FAILED");
    });
  });
});
