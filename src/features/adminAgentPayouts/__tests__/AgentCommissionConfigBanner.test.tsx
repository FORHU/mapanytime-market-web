import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AgentCommissionConfigBanner } from "../components/AgentCommissionConfigBanner";
import * as client from "../api/agentPayout.client";

function wrap(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("AgentCommissionConfigBanner (MA-5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders incentive program configuration with 0.05% and ₱500 min", async () => {
    vi.spyOn(client, "getAgentCommissionConfig").mockResolvedValueOnce({
      commissionRate: 0.0005,
      commissionBase: "GMV",
      eligibilityHoldDays: 7,
      payoutMinimum: 500,
      isEnabled: true,
    });

    wrap(<AgentCommissionConfigBanner />);

    expect(screen.getByText("Recruiter Agent Incentive Program")).toBeTruthy();
    expect(await screen.findByText("0.05% GMV")).toBeTruthy();
    expect(await screen.findByText("₱500.00")).toBeTruthy();
    expect(await screen.findByText("7 Days")).toBeTruthy();
  });
});
