import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { InviteAdminModal } from "../components/InviteAdminModal";
import * as client from "../api/adminInvite.client";

describe("InviteAdminModal (MA-1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(
      <InviteAdminModal
        isOpen={false}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders with default values and all invitable roles", () => {
    render(
      <InviteAdminModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Invite Administrator")).toBeTruthy();
    expect(screen.getByLabelText(/Recipient Email Address/i)).toBeTruthy();

    // Check invitable roles
    expect(screen.getByText("Administrator")).toBeTruthy();
    expect(screen.getByText("Super Administrator")).toBeTruthy();
    expect(screen.getByText("Support Agent")).toBeTruthy();
    expect(screen.getByText("Developer")).toBeTruthy();

    // Check expiration options
    const select = screen.getByLabelText(/Invitation Expiration/i) as HTMLSelectElement;
    expect(select.value).toBe("7");
  });

  it("validates email before submission", async () => {
    render(
      <InviteAdminModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    const emailInput = screen.getByLabelText(/Recipient Email Address/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const form = emailInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/Please provide a valid email address/i),
      ).toBeTruthy();
    });
  });

  it("submits the chosen role, email, and expiration days", async () => {
    const mockCreated = {
      id: "inv-101",
      email: "newlead@mapanytime.com",
      role: "SUPPORT_AGENT",
      status: "PENDING" as const,
      expiresAt: "2026-11-24T00:00:00.000Z",
      createdAt: "2026-11-10T00:00:00.000Z",
    };

    const createSpy = vi
      .spyOn(client, "createAdminInvite")
      .mockResolvedValueOnce(mockCreated);

    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <InviteAdminModal
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    const emailInput = screen.getByLabelText(/Recipient Email Address/i);
    fireEvent.change(emailInput, { target: { value: "newlead@mapanytime.com" } });

    // Select Support Agent role radio
    const supportAgentRadio = screen.getByDisplayValue("SUPPORT_AGENT");
    fireEvent.click(supportAgentRadio);

    // Select 14 days expiration
    const select = screen.getByLabelText(/Invitation Expiration/i);
    fireEvent.change(select, { target: { value: "14" } });

    const form = emailInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        email: "newlead@mapanytime.com",
        role: "SUPPORT_AGENT",
        expiresInDays: 14,
      });
      expect(onSuccess).toHaveBeenCalledWith(mockCreated);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
