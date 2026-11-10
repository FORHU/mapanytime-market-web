import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AgentPayoutsTable } from "../components/AgentPayoutsTable";
import * as client from "../api/agentPayout.client";
import { AgentPayoutItem } from "../contracts/agentPayout.contract";

function wrap(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

const mockPayouts: AgentPayoutItem[] = [
  {
    id: "payout-pending-1",
    agentId: "agent-1",
    accountId: "acc-1",
    amount: 1200,
    status: "PENDING",
    paymentMethod: "BANK_TRANSFER",
    reference: null,
    processedAt: null,
    createdAt: "2026-11-10T00:00:00.000Z",
    agent: {
      id: "agent-1",
      email: "ana.reyes@example.com",
      firstName: "Ana",
      lastName: "Reyes",
      phoneNumber: "+639171234567",
    },
  },
  {
    id: "payout-paid-2",
    agentId: "agent-2",
    accountId: "acc-2",
    amount: 3500,
    status: "COMPLETED",
    paymentMethod: "GCASH",
    reference: "GCASH-REF-8899",
    processedAt: "2026-11-09T00:00:00.000Z",
    createdAt: "2026-11-08T00:00:00.000Z",
    agent: {
      id: "agent-2",
      email: "ben.cruz@example.com",
      firstName: "Ben",
      lastName: "Cruz",
    },
  },
];

describe("AgentPayoutsTable (MA-5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders agent payouts with formatted amounts and status tags", async () => {
    vi.spyOn(client, "listAdminAgentPayouts").mockResolvedValueOnce({
      items: mockPayouts,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    wrap(<AgentPayoutsTable />);

    await waitFor(() => {
      expect(screen.getByText("ana.reyes@example.com")).toBeTruthy();
      expect(screen.getByText("Ana Reyes")).toBeTruthy();
      expect(screen.getByText("ben.cruz@example.com")).toBeTruthy();
    });

    expect(screen.getByText("₱1,200.00")).toBeTruthy();
    expect(screen.getByText("₱3,500.00")).toBeTruthy();
    expect(screen.getByText("GCASH-REF-8899")).toBeTruthy();
    expect(screen.getAllByText("Pending Review").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Paid")).toBeTruthy();

    // Verify actions for pending item
    expect(screen.getByRole("button", { name: /^Approve$/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Reject$/i })).toBeTruthy();
  });

  it("opens approval modal and submits reference code", async () => {
    vi.spyOn(client, "listAdminAgentPayouts").mockResolvedValueOnce({
      items: mockPayouts,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const approveSpy = vi.spyOn(client, "approveAgentPayout").mockResolvedValueOnce({
      ...mockPayouts[0],
      status: "COMPLETED",
      reference: "BDO-TX-7788",
    });

    wrap(<AgentPayoutsTable />);

    await waitFor(() => {
      expect(screen.getByText("ana.reyes@example.com")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /^Approve$/i }));

    expect(screen.getByText("Approve Agent Payout")).toBeTruthy();

    const refInput = screen.getByPlaceholderText(/e.g. BDO-REF/i);
    fireEvent.change(refInput, { target: { value: "BDO-TX-7788" } });

    fireEvent.click(screen.getByRole("button", { name: "Confirm Payout" }));

    await waitFor(() => {
      expect(approveSpy).toHaveBeenCalledWith("payout-pending-1", "BDO-TX-7788");
    });
  });

  it("opens rejection modal and submits rejection reason", async () => {
    vi.spyOn(client, "listAdminAgentPayouts").mockResolvedValueOnce({
      items: mockPayouts,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const rejectSpy = vi.spyOn(client, "rejectAgentPayout").mockResolvedValueOnce({
      ...mockPayouts[0],
      status: "FAILED",
      reference: "REJECTED: Name mismatch",
    });

    wrap(<AgentPayoutsTable />);

    await waitFor(() => {
      expect(screen.getByText("ana.reyes@example.com")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /^Reject$/i }));

    expect(screen.getByText("Reject Payout Request")).toBeTruthy();

    const reasonInput = screen.getByPlaceholderText(/e.g. Invalid bank/i);
    fireEvent.change(reasonInput, { target: { value: "Name mismatch" } });

    fireEvent.click(screen.getByRole("button", { name: "Confirm Rejection" }));

    await waitFor(() => {
      expect(rejectSpy).toHaveBeenCalledWith("payout-pending-1", "Name mismatch");
    });
  });
});
