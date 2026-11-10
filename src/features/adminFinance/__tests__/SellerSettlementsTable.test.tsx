import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SellerSettlementsTable } from "../components/SellerSettlementsTable";
import * as client from "../api/adminSettlement.client";
import { AdminSellerSummary } from "../contracts/adminSettlement.contract";

function wrap(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

const mockSellers: AdminSellerSummary[] = [
  {
    sellerId: "seller-1",
    organizationName: "Fruit Masters Inc.",
    storeName: "Sweet Fruits Corner",
    storeId: "store-1",
    user: {
      id: "u-1",
      email: "fruits@example.com",
      name: "Juan Fruits",
    },
    totalSales: 80000,
    totalCommission: 4000,
    pendingAmount: 12000,
    heldAmount: 0,
    availableAmount: 64000,
    paidOutAmount: 20000,
    refundedAmount: 0,
    cashCommissionOwed: 800,
    settlementCount: 12,
    nextReleaseEligibleAt: "2026-11-18T00:00:00.000Z",
  },
  {
    sellerId: "seller-2",
    organizationName: "Meat Palace",
    storeName: "Artisan Butcher",
    storeId: "store-2",
    user: {
      id: "u-2",
      email: "butcher@example.com",
      name: "Pedro Carnicero",
    },
    totalSales: 120000,
    totalCommission: 6000,
    pendingAmount: 0,
    heldAmount: 0,
    availableAmount: 114000,
    paidOutAmount: 50000,
    refundedAmount: 0,
    cashCommissionOwed: 0,
    settlementCount: 25,
    nextReleaseEligibleAt: null,
  },
];

describe("SellerSettlementsTable (MA-2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders seller settlements with formatted currency and details", async () => {
    vi.spyOn(client, "getAdminSellerSummaries").mockResolvedValueOnce({
      sellers: mockSellers,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    wrap(<SellerSettlementsTable />);

    await waitFor(() => {
      expect(screen.getByText("Sweet Fruits Corner")).toBeTruthy();
      expect(screen.getByText("fruits@example.com")).toBeTruthy();
      expect(screen.getByText("Artisan Butcher")).toBeTruthy();
      expect(screen.getByText("butcher@example.com")).toBeTruthy();
    });

    // Check GMV & commission amounts
    expect(screen.getByText("₱80,000.00")).toBeTruthy();
    expect(screen.getByText("₱4,000.00")).toBeTruthy();
    expect(screen.getByText("₱12,000.00")).toBeTruthy();
    expect(screen.getByText("₱64,000.00")).toBeTruthy();

    // Check cash commission debit warning
    expect(screen.getByText("₱800.00")).toBeTruthy();

    // Check seller without pending hold
    expect(screen.getByText("No pending hold")).toBeTruthy();
  });

  it("renders empty state message when no sellers match", async () => {
    vi.spyOn(client, "getAdminSellerSummaries").mockResolvedValueOnce({
      sellers: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    wrap(<SellerSettlementsTable />);

    await waitFor(() => {
      expect(
        screen.getByText("No seller settlement records found"),
      ).toBeTruthy();
    });
  });

  it("triggers search and pagination requests", async () => {
    const spy = vi
      .spyOn(client, "getAdminSellerSummaries")
      .mockResolvedValue({
        sellers: mockSellers,
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
      });

    wrap(<SellerSettlementsTable />);

    await waitFor(() => {
      expect(screen.getByText("Sweet Fruits Corner")).toBeTruthy();
    });

    // Page indicator check
    expect(screen.getByText("Page 1 of 3")).toBeTruthy();

    // Search interaction
    const searchInput = screen.getByPlaceholderText(
      /Search store name, organization, or merchant email/i,
    );
    fireEvent.change(searchInput, { target: { value: "Fruits" } });
    fireEvent.submit(searchInput.closest("form")!);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ search: "Fruits" }),
        expect.anything(),
      );
    });
  });
});
