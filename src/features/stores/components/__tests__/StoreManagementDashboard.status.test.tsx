import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import StoreManagementDashboard from "../StoreManagementDashboard";
import { STORE_STATUS_PRESENTATION } from "@/shared/lib/storeApproval";

/**
 * The store card's status badge.
 *
 * It used to be a two-branch ternary with its own `approvalStatus ?? isActive`
 * fallback, which disagreed with the routing guard on the page around it — the
 * badge said Active, the guard refused to open. Both read
 * `normalizeStoreStatus` now, so this suite pins the badge half.
 */

function renderStore(overrides: Record<string, unknown> = {}) {
  return render(
    <StoreManagementDashboard
      stores={[
        {
          id: "store-1",
          storeName: "Baguio Blooms",
          isActive: false,
          approvalStatus: "ACTIVE",
          ...overrides,
        },
      ]}
      properties={[]}
      onSelectStore={vi.fn()}
      onSelectProperty={vi.fn()}
      onCreateNewStore={vi.fn()}
    />,
  );
}

describe("store status badge", () => {
  it.each([
    ["PENDING"],
    ["UNDER_REVIEW"],
    ["NEEDS_REVISION"],
    ["ACTIVE"],
    ["REJECTED"],
  ] as const)("labels a %s store", (status) => {
    renderStore({ approvalStatus: status });

    expect(
      screen.getByText(STORE_STATUS_PRESENTATION[status].label),
    ).toBeTruthy();
  });

  it.each([
    ["PENDING"],
    ["UNDER_REVIEW"],
    ["NEEDS_REVISION"],
    ["ACTIVE"],
    ["REJECTED"],
  ] as const)("draws an icon in the %s badge", (status) => {
    // The badge used to draw one for ACTIVE alone, leaving the other four as
    // bare text — approval looked like the only state worth marking.
    renderStore({ approvalStatus: status });

    const badge = screen
      .getByText(STORE_STATUS_PRESENTATION[status].label)
      .closest("span");
    expect(badge?.querySelector("svg")).toBeTruthy();
  });

  it("shows the fix list on a store with changes requested", () => {
    renderStore({
      approvalStatus: "NEEDS_REVISION",
      revisionNotes: "The mayor's permit scan is unreadable",
    });

    expect(
      screen.getByText(/The mayor's permit scan is unreadable/),
    ).toBeTruthy();
  });

  it("does not let one card's height be imposed on its row-mates", () => {
    // Grid items stretch to the tallest in the row by default, so expanding one
    // store's reason handed the card beside it the same height and left a void
    // above its footer. jsdom does no layout, so this pins the declaration
    // rather than the geometry — the real check is in a browser.
    const { container } = renderStore({ approvalStatus: "ACTIVE" });

    const grid = container.querySelector(".grid");
    expect(grid?.className).toContain("items-start");
  });

  it("wraps a long unbroken reason instead of stretching the card", () => {
    // The reported bug: a 1000-character run of `a` has no break opportunity
    // and an enormous intrinsic width, so the grid column stretched and took
    // the page's horizontal scroll with it.
    const wall = "a".repeat(1000);
    renderStore({ approvalStatus: "REJECTED", rejectionReason: wall });

    expect(screen.getByText(wall).className).toContain("break-words");
  });

  it("shows the reason on a rejected store", () => {
    renderStore({
      approvalStatus: "REJECTED",
      rejectionReason: "Address could not be verified",
    });

    expect(screen.getByText(/Address could not be verified/)).toBeTruthy();
  });

  it("does not show a rejection reason as a revision request", () => {
    // Two separate columns for two separate meanings — overloading one is what
    // made REJECTED ambiguous in the first place.
    renderStore({
      approvalStatus: "REJECTED",
      rejectionReason: "Denied",
      revisionNotes: "stale note from an earlier round",
    });

    expect(screen.queryByText(/stale note from an earlier round/)).toBeNull();
  });

  it("invites the seller to fix rather than to manage, when changes are requested", () => {
    renderStore({ approvalStatus: "NEEDS_REVISION" });

    expect(screen.getByText("Fix and resubmit")).toBeTruthy();
  });

  it("does not invite a seller into a store that is still queued", () => {
    renderStore({ approvalStatus: "PENDING" });

    expect(
      screen.getByText(STORE_STATUS_PRESENTATION.PENDING.nextStep),
    ).toBeTruthy();
    expect(screen.queryByText("Initialize Management Node")).toBeNull();
  });

  it("tells a seller whose store is being read that someone is reading it", () => {
    // The footer used to say "awaiting administrator review" here, which is
    // what a store nobody has opened yet says — the two states looked
    // identical to the one person waiting on the difference.
    renderStore({ approvalStatus: "UNDER_REVIEW" });

    expect(
      screen.getByText("An administrator is reviewing this store"),
    ).toBeTruthy();
  });

  it("does not tell a rejected seller to keep waiting", () => {
    // Rejection is terminal for them; only an admin can reopen it.
    renderStore({ approvalStatus: "REJECTED" });

    expect(screen.getByText("Contact support to appeal")).toBeTruthy();
  });

  it("treats a legacy live store as active", () => {
    renderStore({ approvalStatus: undefined, isActive: true });

    expect(
      screen.getByText(STORE_STATUS_PRESENTATION.ACTIVE.label),
    ).toBeTruthy();
  });
});

/**
 * The delete affordance on a rejected store.
 *
 * The button is a convenience, not the control — the endpoint refuses anything
 * that is not REJECTED regardless of what renders here. What these cases pin is
 * that the seller is never *offered* a delete that would be refused, and that
 * the countdown they are shown comes from the server's deadline.
 */
describe("deleting a rejected store", () => {
  const NOW = new Date("2026-09-09T12:00:00.000Z");
  // Six hours in, so the store has eighteen left.
  const DEADLINE = "2026-09-10T06:00:00.000Z";

  const renderDeletable = (overrides: Record<string, unknown> = {}) => {
    const onDeleteStore = vi.fn();
    const onSelectStore = vi.fn();

    render(
      <StoreManagementDashboard
        stores={[
          {
            id: "store-1",
            storeName: "Baguio Blooms",
            isActive: false,
            approvalStatus: "REJECTED",
            scheduledDeletionAt: DEADLINE,
            ...overrides,
          },
        ]}
        properties={[]}
        onSelectStore={onSelectStore}
        onSelectProperty={vi.fn()}
        onDeleteStore={onDeleteStore}
        now={NOW}
      />,
    );

    return { onDeleteStore, onSelectStore };
  };

  it("offers the button on a rejected store", () => {
    renderDeletable();

    expect(screen.getByText("Delete Store")).toBeTruthy();
  });

  it.each([
    ["PENDING"],
    ["UNDER_REVIEW"],
    ["NEEDS_REVISION"],
    ["ACTIVE"],
  ] as const)("does not offer it on a %s store", (approvalStatus) => {
    renderDeletable({ approvalStatus, scheduledDeletionAt: null });

    expect(screen.queryByText("Delete Store")).toBeNull();
  });

  it("shows how long the store has left, from the server's deadline", () => {
    renderDeletable();

    expect(
      screen.getByText("This store will be automatically deleted in 18 hours."),
    ).toBeTruthy();
  });

  // Past the deadline the store is waiting on the next hourly sweep, not gone.
  it("does not claim an overdue store has already been deleted", () => {
    renderDeletable({ scheduledDeletionAt: "2026-09-09T11:00:00.000Z" });

    expect(
      screen.getByText("This store will be deleted any moment now."),
    ).toBeTruthy();
  });

  it("says nothing about deletion when the server sent no deadline", () => {
    renderDeletable({ scheduledDeletionAt: null });

    expect(screen.queryByText(/automatically deleted/)).toBeNull();
  });

  it("hands the store up to the caller when clicked", () => {
    const { onDeleteStore } = renderDeletable();

    fireEvent.click(screen.getByText("Delete Store"));

    expect(onDeleteStore).toHaveBeenCalledWith(
      expect.objectContaining({ id: "store-1" }),
    );
  });

  // The whole card is clickable. Without stopPropagation the delete would also
  // open the store, leaving the confirmation dialog over the wrong page.
  it("does not also open the store", () => {
    const { onSelectStore } = renderDeletable();

    fireEvent.click(screen.getByText("Delete Store"));

    expect(onSelectStore).not.toHaveBeenCalled();
  });

  it("renders no button when the caller wires no handler", () => {
    render(
      <StoreManagementDashboard
        stores={[
          {
            id: "store-1",
            storeName: "Baguio Blooms",
            isActive: false,
            approvalStatus: "REJECTED",
            scheduledDeletionAt: DEADLINE,
          },
        ]}
        properties={[]}
        onSelectStore={vi.fn()}
        onSelectProperty={vi.fn()}
        now={NOW}
      />,
    );

    expect(screen.queryByText("Delete Store")).toBeNull();
  });
});
