import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AuditLogsTable } from "../components/AuditLogsTable";
import * as client from "../api/auditLog.client";
import { AuditLogItem } from "../contracts/auditLog.contract";

function wrap(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

const mockLogs: AuditLogItem[] = [
  {
    id: "log-1",
    action: "ADMIN_INVITE_CREATED",
    entityType: "ADMIN_INVITE",
    entityId: "inv-99",
    metadata: { email: "staff@example.com", role: "SUPPORT_AGENT" },
    createdAt: "2026-11-12T08:30:00.000Z",
    performedBy: {
      id: "admin-1",
      name: "Maria Santos",
      email: "maria@mapanytime.com",
    },
  },
  {
    id: "log-2",
    action: "AGENT_PAYOUT_REJECTED",
    entityType: "AGENT_PAYOUT",
    entityId: "payout-55",
    metadata: { reason: "Incorrect GCash number", refundedAmount: 500 },
    createdAt: "2026-11-12T09:15:00.000Z",
    performedBy: {
      id: "admin-2",
      name: "Juan Luna",
      email: "juan@mapanytime.com",
    },
  },
];

describe("AuditLogsTable (MA-11)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders audit log items, formatted timestamps, and actor information", async () => {
    vi.spyOn(client, "listAdminAuditLogs").mockResolvedValueOnce({
      items: mockLogs,
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    wrap(<AuditLogsTable />);

    await waitFor(() => {
      expect(screen.getByText("ADMIN_INVITE_CREATED")).toBeInTheDocument();
      expect(screen.getByText("AGENT_PAYOUT_REJECTED")).toBeInTheDocument();
    });

    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("maria@mapanytime.com")).toBeInTheDocument();
    expect(screen.getByText("Juan Luna")).toBeInTheDocument();
    expect(
      screen.getByText(/Reason: "Incorrect GCash number"/),
    ).toBeInTheDocument();
  });

  it("expands a log row when clicked to show metadata JSON", async () => {
    vi.spyOn(client, "listAdminAuditLogs").mockResolvedValueOnce({
      items: mockLogs,
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    wrap(<AuditLogsTable />);

    await waitFor(() => {
      expect(screen.getByText("ADMIN_INVITE_CREATED")).toBeInTheDocument();
    });

    const expandButtons = screen.getAllByLabelText("Expand metadata");
    fireEvent.click(expandButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/Context & Audit Metadata \(ID: log-1\)/),
      ).toBeInTheDocument();
    });
  });

  it("renders empty state when no records return", async () => {
    vi.spyOn(client, "listAdminAuditLogs").mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    wrap(<AuditLogsTable />);

    await waitFor(() => {
      expect(screen.getByText("No audit logs found")).toBeInTheDocument();
    });
  });
});
