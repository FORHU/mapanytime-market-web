import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ManageStoresPage from "../page";
import { useStores, useDeleteStore } from "@/features/stores/hooks/useStores";
import { useOrgContext } from "@/features/team";

/**
 * Deleting a rejected store, from the seller's side of it.
 *
 * The page owns the confirmation and the aftermath: the card only reports the
 * click. What matters here is that a delete cannot happen on one click, and that
 * once it has happened the seller is not left holding a context pointing at a
 * store the API will now refuse.
 */

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh }),
}));

const mutate = vi.fn();
// Captured so a case can drive the hook's onSuccess itself — the mutation never
// runs for real here, and the aftermath is the half worth pinning.
let capturedOptions: { onSuccess?: (storeId: string) => void } | undefined;

vi.mock("@/features/stores/hooks/useStores", () => ({
  useStores: vi.fn(),
  useDeleteStore: vi.fn(),
}));
vi.mock("@/features/properties/hooks/useProperties", () => ({
  useProperties: () => ({ data: [], isLoading: false, isError: false }),
}));
vi.mock("@/features/team", () => ({ useOrgContext: vi.fn() }));

const toastSuccess = vi.fn();
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: (msg: string) => toastSuccess(msg) },
}));

vi.mock("@/features/stores/components/StoreTypeSelectionModal", () => ({
  StoreTypeSelectionModal: () => null,
}));

function renderPage(overrides: Record<string, unknown> = {}) {
  vi.mocked(useStores).mockReturnValue({
    data: [
      {
        id: "store-1",
        storeName: "Baguio Blooms",
        isActive: false,
        approvalStatus: "REJECTED",
        rejectionReason: "Address could not be verified",
        revisionNotes: null,
        scheduledDeletionAt: "2099-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        description: null,
        ...overrides,
      },
    ],
    isLoading: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useStores>);

  render(<ManageStoresPage />);
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  capturedOptions = undefined;

  vi.mocked(useOrgContext).mockReturnValue({
    data: { sellerStatus: "APPROVED" },
  } as unknown as ReturnType<typeof useOrgContext>);

  vi.mocked(useDeleteStore).mockImplementation((options) => {
    capturedOptions = options;
    return { mutate, isPending: false } as unknown as ReturnType<
      typeof useDeleteStore
    >;
  });
});

describe("deleting a rejected store", () => {
  it("asks before deleting anything", () => {
    renderPage();

    fireEvent.click(screen.getByText("Delete Store"));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("names the deadline the seller is bringing forward", () => {
    renderPage();
    fireEvent.click(screen.getByText("Delete Store"));

    expect(
      screen.getByText(/scheduled for automatic deletion in/),
    ).toBeTruthy();
    expect(screen.getByText(/permanent and cannot be undone/)).toBeTruthy();
  });

  it("deletes nothing when the seller backs out", () => {
    renderPage();
    fireEvent.click(screen.getByText("Delete Store"));
    fireEvent.click(screen.getByText("Cancel"));

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("deletes the store once confirmed", () => {
    renderPage();
    fireEvent.click(screen.getByText("Delete Store"));
    fireEvent.click(screen.getByText("Delete store"));

    expect(mutate).toHaveBeenCalledWith({ storeId: "store-1" });
  });

  it("tells the seller it worked", () => {
    renderPage();

    capturedOptions?.onSuccess?.("store-1");

    expect(toastSuccess).toHaveBeenCalledWith("Store deleted successfully.");
  });

  // The seller shell reads this key on every page. Left behind, it points the
  // whole dashboard at a store the API now 404s.
  it("clears the active store context when the deleted store was selected", () => {
    localStorage.setItem("active_store_context_id", "store-1");
    renderPage();

    capturedOptions?.onSuccess?.("store-1");

    expect(localStorage.getItem("active_store_context_id")).toBeNull();
    expect(refresh).toHaveBeenCalled();
  });

  it("leaves a different store's context alone", () => {
    localStorage.setItem("active_store_context_id", "store-2");
    renderPage();

    capturedOptions?.onSuccess?.("store-1");

    expect(localStorage.getItem("active_store_context_id")).toBe("store-2");
    expect(refresh).not.toHaveBeenCalled();
  });

  it.each(["PENDING", "UNDER_REVIEW", "NEEDS_REVISION", "ACTIVE"])(
    "offers no delete on a %s store",
    (approvalStatus) => {
      renderPage({ approvalStatus, scheduledDeletionAt: null });

      expect(screen.queryByText("Delete Store")).toBeNull();
    },
  );
});
