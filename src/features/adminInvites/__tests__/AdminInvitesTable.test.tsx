import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminInvitesTable } from "../components/AdminInvitesTable";
import * as client from "../api/adminInvite.client";
import { AdminInvite } from "../contracts/adminInvite.contract";

const mockInvites: AdminInvite[] = [
  {
    id: "inv-pending-1",
    email: "pending@mapanytime.com",
    role: "ADMIN",
    status: "PENDING",
    expiresAt: "2026-11-17T00:00:00.000Z",
    createdAt: "2026-11-10T00:00:00.000Z",
    inviter: { id: "u-1", name: "Lead Admin", email: "lead@mapanytime.com" },
  },
  {
    id: "inv-accepted-2",
    email: "accepted@mapanytime.com",
    role: "SUPER_ADMIN",
    status: "ACCEPTED",
    expiresAt: "2026-11-15T00:00:00.000Z",
    createdAt: "2026-11-08T00:00:00.000Z",
    inviter: { id: "u-1", name: "Lead Admin", email: "lead@mapanytime.com" },
  },
  {
    id: "inv-revoked-3",
    email: "revoked@mapanytime.com",
    role: "SUPPORT_AGENT",
    status: "REVOKED",
    expiresAt: "2026-11-12T00:00:00.000Z",
    createdAt: "2026-11-05T00:00:00.000Z",
    inviter: { id: "u-1", name: "Lead Admin", email: "lead@mapanytime.com" },
  },
];

describe("AdminInvitesTable (MA-1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and displays all invitations", async () => {
    vi.spyOn(client, "listAdminInvites").mockResolvedValueOnce({
      invites: mockInvites,
      total: 3,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    render(<AdminInvitesTable />);

    await waitFor(() => {
      expect(screen.getByText("pending@mapanytime.com")).toBeTruthy();
      expect(screen.getByText("accepted@mapanytime.com")).toBeTruthy();
      expect(screen.getByText("revoked@mapanytime.com")).toBeTruthy();
    });

    // Verify filter buttons exist
    expect(screen.getByRole("button", { name: "All" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pending" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Accepted" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Revoked" })).toBeTruthy();

    // Check that pending invite has a Revoke action button while others do not
    const revokeButtons = screen.getAllByRole("button", { name: /^Revoke$/i });
    expect(revokeButtons.length).toBe(1);
  });

  it("filters invites when clicking filter pill", async () => {
    const listSpy = vi
      .spyOn(client, "listAdminInvites")
      .mockResolvedValueOnce({
        invites: mockInvites,
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        invites: [mockInvites[0]],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

    render(<AdminInvitesTable />);

    await waitFor(() => {
      expect(screen.getByText("pending@mapanytime.com")).toBeTruthy();
    });

    // Click Pending filter pill
    const pendingPill = screen.getByRole("button", { name: "Pending" });
    fireEvent.click(pendingPill);

    await waitFor(() => {
      expect(listSpy).toHaveBeenLastCalledWith({
        status: "PENDING",
        page: 1,
        limit: 10,
      });
    });
  });

  it("allows revoking a pending invitation with confirmation", async () => {
    vi.spyOn(client, "listAdminInvites").mockResolvedValueOnce({
      invites: mockInvites,
      total: 3,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const revokeSpy = vi
      .spyOn(client, "revokeAdminInvite")
      .mockResolvedValueOnce({
        ...mockInvites[0],
        status: "REVOKED",
      });

    const onInviteRevoked = vi.fn();

    render(<AdminInvitesTable onInviteRevoked={onInviteRevoked} />);

    await waitFor(() => {
      expect(screen.getByText("pending@mapanytime.com")).toBeTruthy();
    });

    // Click revoke button on pending invite (exact match)
    const revokeBtn = screen.getByRole("button", { name: /^Revoke$/i });
    fireEvent.click(revokeBtn);

    // Confirmation modal should open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeTruthy();
      expect(screen.getByText("Revoke Staff Invitation")).toBeTruthy();
    });

    // Confirm revoke button inside the modal dialog
    const confirmBtn = screen.getByRole("button", { name: "Revoke Invitation" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(revokeSpy).toHaveBeenCalledWith("inv-pending-1");
      expect(onInviteRevoked).toHaveBeenCalled();
    });
  });
});
