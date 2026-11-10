import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettlementMetricsCards } from "../components/SettlementMetricsCards";
import { AdminSettlementSummary } from "../contracts/adminSettlement.contract";

describe("SettlementMetricsCards (MA-2)", () => {
  const mockSummary: AdminSettlementSummary = {
    totalSettlements: 120,
    totalSales: 450000,
    totalCommission: 22500,
    totalPaymentFee: 9000,
    pendingAmount: 35000,
    heldAmount: 0,
    availableAmount: 383500,
    paidOutAmount: 100000,
    refundedAmount: 0,
    cashCommissionOwed: 2500,
    holdDays: 7,
  };

  it("renders metrics cards with formatted values and subtitles", () => {
    render(
      <SettlementMetricsCards
        summary={mockSummary}
        isLoading={false}
      />,
    );

    // Verify card titles
    expect(screen.getByText("Gross Sales (GMV)")).toBeTruthy();
    expect(screen.getByText("Platform Fees Earned")).toBeTruthy();
    expect(screen.getByText("Funds Held in Return Window")).toBeTruthy();
    expect(screen.getByText("Available for Payout")).toBeTruthy();
    expect(screen.getByText("Cash Commissions Due")).toBeTruthy();

    // Verify formatted values in Philippine Peso
    expect(screen.getByText("₱450,000.00")).toBeTruthy();
    expect(screen.getByText("₱22,500.00")).toBeTruthy();
    expect(screen.getByText("₱35,000.00")).toBeTruthy();
    expect(screen.getByText("₱383,500.00")).toBeTruthy();
    expect(screen.getByText("₱2,500.00")).toBeTruthy();

    // Verify subtitles
    expect(screen.getByText("120 settled orders")).toBeTruthy();
    expect(screen.getByText("7-day return safety buffer")).toBeTruthy();
  });

  it("renders error state when error message provided", () => {
    render(
      <SettlementMetricsCards
        summary={null}
        isLoading={false}
        error="Network connection timed out"
      />,
    );

    expect(
      screen.getByText(/Failed to load financial summary: Network connection timed out/),
    ).toBeTruthy();
  });
});
