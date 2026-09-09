import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ManageStoresPage from "../page";
import { useStores } from "@/features/stores/hooks/useStores";
import { useOrgContext } from "@/features/team";

/**
 * Opening a store from the store list.
 *
 * The regression this exists for: the guard here refused anything that was not
 * exactly ACTIVE, with the message "currently under review". Once NEEDS_REVISION
 * existed that became a dead end — the seller is told to fix their store and
 * then refused entry to the form, which reads as a broken product rather than a
 * policy.
 *
 * The second half is the older defect the FIXME on this page described: the
 * guard compared `approvalStatus` directly while the card badge fell back to
 * `isActive` for rows predating the column, so a legacy store rendered as
 * Active and then would not open. Both now resolve status the same way.
 */

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

vi.mock("@/features/stores/hooks/useStores", () => ({
  useStores: vi.fn(),
  // The page imports both from this module, so the mock has to cover both or
  // every case here fails on render rather than on what it means to assert.
  useDeleteStore: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/features/properties/hooks/useProperties", () => ({
  useProperties: () => ({ data: [], isLoading: false, isError: false }),
}));
vi.mock("@/features/team", () => ({ useOrgContext: vi.fn() }));

const toastError = vi.fn();
const toastSuccess = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    error: (msg: string) => toastError(msg),
    success: (msg: string) => toastSuccess(msg),
  },
}));

vi.mock("@/features/stores/components/StoreTypeSelectionModal", () => ({
  StoreTypeSelectionModal: () => null,
}));

function mockStore(overrides: Record<string, unknown> = {}) {
  return {
    id: "store-1",
    storeName: "Baguio Blooms",
    isActive: false,
    approvalStatus: "ACTIVE",
    rejectionReason: null,
    revisionNotes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    description: null,
    ...overrides,
  };
}

function renderWithStore(store: Record<string, unknown>) {
  vi.mocked(useStores).mockReturnValue({
    data: [store],
    isLoading: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useStores>);

  render(<ManageStoresPage />);
  fireEvent.click(screen.getByText("Baguio Blooms"));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useOrgContext).mockReturnValue({
    data: { sellerStatus: "APPROVED" },
  } as unknown as ReturnType<typeof useOrgContext>);
});

describe("opening a store", () => {
  it("sends a store with changes requested to the editor, not to a toast", () => {
    renderWithStore(
      mockStore({
        approvalStatus: "NEEDS_REVISION",
        revisionNotes: "Fix the permit",
      }),
    );

    expect(push).toHaveBeenCalledWith("/seller/store-profile");
    expect(toastError).not.toHaveBeenCalled();
  });

  it("sets the active store context before navigating to the editor", () => {
    renderWithStore(mockStore({ approvalStatus: "NEEDS_REVISION" }));

    // Both destinations read the store from context rather than the URL, so
    // navigating without this lands on an empty editor.
    expect(localStorage.getItem("active_store_context_id")).toBe("store-1");
  });

  it("sends an approved store to the dashboard", () => {
    renderWithStore(mockStore({ approvalStatus: "ACTIVE" }));

    expect(push).toHaveBeenCalledWith("/seller/dashboard");
  });

  it.each(["PENDING", "UNDER_REVIEW", "REJECTED"])(
    "refuses to open a %s store, and says why",
    (status) => {
      renderWithStore(mockStore({ approvalStatus: status }));

      expect(push).not.toHaveBeenCalled();
      expect(toastError).toHaveBeenCalled();
    },
  );

  it("distinguishes waiting from being actively reviewed", () => {
    renderWithStore(mockStore({ approvalStatus: "UNDER_REVIEW" }));

    expect(toastError).toHaveBeenCalledWith(
      expect.stringContaining("reviewing this store right now"),
    );
  });

  it("opens a legacy store that has no approvalStatus but is live", () => {
    // The FIXME case: these rows predate the column entirely. Treating the
    // absence as PENDING would lock the seller out of a store that has been
    // trading for months.
    renderWithStore(mockStore({ approvalStatus: undefined, isActive: true }));

    expect(push).toHaveBeenCalledWith("/seller/dashboard");
  });

  it("does not open a legacy store that was never activated", () => {
    renderWithStore(mockStore({ approvalStatus: undefined, isActive: false }));

    expect(push).not.toHaveBeenCalled();
  });

  it("does not crash on a status this build has never heard of", () => {
    // The server owns the vocabulary. An unknown value withholds the
    // affordance rather than throwing and taking the page down.
    renderWithStore(mockStore({ approvalStatus: "ESCALATED_TO_LEGAL" }));

    expect(push).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalled();
  });
});
