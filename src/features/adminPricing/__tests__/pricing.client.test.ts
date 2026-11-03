import { describe, it, expect, vi, beforeEach } from "vitest";
import * as http from "@/shared/lib/http";
import {
  getPricingConfigurations,
  getPricingConfiguration,
  activatePricingConfiguration,
} from "../api/pricing.client";

describe("pricing.client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockConfig = {
    id: "cfg-1",
    name: "Standard Rate Card 2026",
    status: "ACTIVE" as const,
    createdAt: "2026-10-15T00:00:00.000Z",
    updatedAt: "2026-10-15T00:00:00.000Z",
    components: [
      {
        id: "comp-1",
        configurationId: "cfg-1",
        type: "SELLER_MARKETPLACE_FEE",
        calculationType: "PERCENTAGE",
        ratePercentage: 0.05,
        rate: 0.05,
        fixedAmount: null,
      },
    ],
  };

  it("getPricingConfigurations fetches and parses configurations", async () => {
    vi.spyOn(http, "fetcher").mockResolvedValue({
      status: "success",
      statusCode: 200,
      data: [mockConfig],
    });

    const res = await getPricingConfigurations();
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("cfg-1");
    expect(res[0].name).toBe("Standard Rate Card 2026");
    expect(res[0].status).toBe("ACTIVE");
    expect(res[0].components).toHaveLength(1);
    expect(http.fetcher).toHaveBeenCalledWith("/api/v1/pricing/configurations");
  });

  it("getPricingConfiguration fetches and parses a single configuration", async () => {
    vi.spyOn(http, "fetcher").mockResolvedValue({
      status: "success",
      statusCode: 200,
      data: mockConfig,
    });

    const res = await getPricingConfiguration("cfg-1");
    expect(res.id).toBe("cfg-1");
    expect(res.components[0].type).toBe("SELLER_MARKETPLACE_FEE");
    expect(http.fetcher).toHaveBeenCalledWith(
      "/api/v1/pricing/configurations/cfg-1",
    );
  });

  it("activatePricingConfiguration sends a POST request", async () => {
    vi.spyOn(http, "fetcher").mockResolvedValue({
      status: "success",
      statusCode: 200,
      data: { ...mockConfig, status: "ACTIVE" },
    });

    const res = await activatePricingConfiguration("cfg-1");
    expect(res.status).toBe("ACTIVE");
    expect(http.fetcher).toHaveBeenCalledWith(
      "/api/v1/pricing/configurations/cfg-1/activate",
      { method: "POST" },
    );
  });
});
