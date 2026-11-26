import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AcceptInviteCard } from "../components/AcceptInviteCard";
import * as client from "../api/adminInvite.client";

let mockSearchParams = new URLSearchParams("token=valid-test-token");

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("AcceptInviteCard (MA-1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams("token=valid-test-token");
  });

  it("shows error when no token query parameter is provided", async () => {
    mockSearchParams = new URLSearchParams("");

    render(<AcceptInviteCard />);

    await waitFor(() => {
      expect(screen.getByText("Invitation Invalid")).toBeTruthy();
      expect(
        screen.getByText(/No invitation token provided/i),
      ).toBeTruthy();
    });
  });

  it("shows error when invitation token is invalid or expired", async () => {
    vi.spyOn(client, "validateAdminInvite").mockResolvedValueOnce({
      valid: false,
      email: "",
      role: "",
      expiresAt: "",
    });

    render(<AcceptInviteCard />);

    await waitFor(() => {
      expect(screen.getByText("Invitation Invalid")).toBeTruthy();
      expect(
        screen.getByText(/This invitation is no longer valid/i),
      ).toBeTruthy();
    });
  });

  it("renders setup form when token is valid", async () => {
    vi.spyOn(client, "validateAdminInvite").mockResolvedValueOnce({
      valid: true,
      email: "newstaff@mapanytime.com",
      role: "ADMIN",
      expiresAt: "2026-11-17T00:00:00.000Z",
    });

    render(<AcceptInviteCard />);

    await waitFor(() => {
      expect(screen.getByText("Complete Staff Setup")).toBeTruthy();
      expect(screen.getByText("newstaff@mapanytime.com")).toBeTruthy();
      expect(screen.getByText("Administrator")).toBeTruthy();
    });

    expect(screen.getByLabelText(/New Password/i)).toBeTruthy();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeTruthy();
  });

  it("validates password length and match before activating account", async () => {
    vi.spyOn(client, "validateAdminInvite").mockResolvedValueOnce({
      valid: true,
      email: "newstaff@mapanytime.com",
      role: "ADMIN",
      expiresAt: "2026-11-17T00:00:00.000Z",
    });

    render(<AcceptInviteCard />);

    await waitFor(() => {
      expect(screen.getByText("Complete Staff Setup")).toBeTruthy();
    });

    const pwdInput = screen.getByLabelText(/New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    const submitBtn = screen.getByRole("button", {
      name: /Activate Staff Account/i,
    });

    // Mismatched passwords
    fireEvent.change(pwdInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmInput, { target: { value: "Different123!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeTruthy();
    });
  });

  it("activates account successfully on valid submission", async () => {
    vi.spyOn(client, "validateAdminInvite").mockResolvedValueOnce({
      valid: true,
      email: "newstaff@mapanytime.com",
      role: "ADMIN",
      expiresAt: "2026-11-17T00:00:00.000Z",
    });

    const acceptSpy = vi
      .spyOn(client, "acceptAdminInvite")
      .mockResolvedValueOnce({
        user: {
          id: "u-activated",
          email: "newstaff@mapanytime.com",
          firstName: "Jane",
          lastName: "Doe",
        },
        token: "session-token-xyz",
      });

    render(<AcceptInviteCard />);

    await waitFor(() => {
      expect(screen.getByText("Complete Staff Setup")).toBeTruthy();
    });

    const firstInput = screen.getByLabelText(/First Name/i);
    const lastInput = screen.getByLabelText(/Last Name/i);
    const pwdInput = screen.getByLabelText(/New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    const submitBtn = screen.getByRole("button", {
      name: /Activate Staff Account/i,
    });

    fireEvent.change(firstInput, { target: { value: "Jane" } });
    fireEvent.change(lastInput, { target: { value: "Doe" } });
    fireEvent.change(pwdInput, { target: { value: "SecurePass123!" } });
    fireEvent.change(confirmInput, { target: { value: "SecurePass123!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(acceptSpy).toHaveBeenCalledWith({
        token: "valid-test-token",
        password: "SecurePass123!",
        firstName: "Jane",
        lastName: "Doe",
      });
      expect(screen.getByText("Account Activated!")).toBeTruthy();
      expect(
        screen.getByRole("link", { name: /Proceed to Dashboard Sign In/i }),
      ).toBeTruthy();
    });
  });
});

