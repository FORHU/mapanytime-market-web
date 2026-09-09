import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SellerAppLayout } from "../SellerAppLayout";
import { useOrgContext } from "@/features/team";

/**
 * Route gating in the seller shell.
 *
 * The defect: the redirect effect returned early whenever `permissions` was
 * undefined, which covered both "still loading" and "the request failed". A
 * failed context fetch therefore left a member sitting on a gated page
 * indefinitely, and a slow one rendered it first and redirected after.
 *
 * The fix is deliberately narrow. Only paths that actually require something
 * wait on the context — gating the whole shell on one query would strand a user
 * on the dashboard, which needs no permission at all, over a momentary failure.
 */

const replace = vi.fn();
const refetch = vi.fn();
let pathname = "/seller/dashboard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => pathname,
}));
vi.mock("@/features/team", () => ({ useOrgContext: vi.fn() }));
vi.mock("@/features/store-profile/hooks/useStoreProfile", () => ({
  useStoreProfiles: () => ({ data: [] }),
}));
vi.mock("@/features/auth/components/SellerAuthGate", () => ({
  SellerAuthGate: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

function mockContext(
  state:
    | { status: "pending" }
    | { status: "error" }
    | {
        status: "ready";
        permissions: string[];
        isAdmin?: boolean;
        // Omitted means "no seller row", i.e. org staff — which is what every
        // pre-existing test in this file describes.
        sellerStatus?: string | null;
      },
) {
  vi.mocked(useOrgContext).mockReturnValue({
    data:
      state.status === "ready"
        ? {
            permissions: state.permissions,
            isAdmin: state.isAdmin ?? false,
            sellerStatus: state.sellerStatus ?? null,
          }
        : undefined,
    isPending: state.status === "pending",
    isError: state.status === "error",
    refetch,
  } as unknown as ReturnType<typeof useOrgContext>);
}

function renderAt(path: string) {
  pathname = path;
  render(
    <SellerAppLayout>
      <p>page content</p>
    </SellerAppLayout>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  pathname = "/seller/dashboard";
});

describe("ungated routes", () => {
  it("renders the dashboard while the context is still loading", () => {
    // No permission is required here, so waiting on the org context would blank
    // a page the member is always allowed to see.
    mockContext({ status: "pending" });
    renderAt("/seller/dashboard");

    expect(screen.getByText("page content")).toBeTruthy();
  });

  it("renders the dashboard even when the context request failed", () => {
    mockContext({ status: "error" });
    renderAt("/seller/dashboard");

    expect(screen.getByText("page content")).toBeTruthy();
  });
});

describe("gated routes", () => {
  it("renders no page content while the context is loading", () => {
    // Previously the page rendered and the redirect arrived afterwards.
    mockContext({ status: "pending" });
    renderAt("/seller/promotions");

    expect(screen.queryByText("page content")).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it("offers a retry instead of the page when the context failed", () => {
    mockContext({ status: "error" });
    renderAt("/seller/promotions");

    expect(screen.queryByText("page content")).toBeNull();
    expect(screen.getByRole("button", { name: /try again/i })).toBeTruthy();
  });

  it("renders the page once the caller is known to hold the code", () => {
    mockContext({ status: "ready", permissions: ["promotions.add"] });
    renderAt("/seller/promotions");

    expect(screen.getByText("page content")).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects a member who resolves without the code", async () => {
    mockContext({ status: "ready", permissions: ["orders.process"] });
    renderAt("/seller/promotions");

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/seller/dashboard"),
    );
  });

  it("admits an org admin regardless of their stored list", () => {
    // Admins hold every feature implicitly and store an empty list.
    mockContext({ status: "ready", permissions: [], isAdmin: true });
    renderAt("/seller/promotions");

    expect(screen.getByText("page content")).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it("matches the longest prefix so nested catalog routes gate correctly", () => {
    mockContext({ status: "ready", permissions: ["products.view"] });
    renderAt("/seller/properties/products");

    expect(screen.getByText("page content")).toBeTruthy();
  });
});

describe("admin-only routes", () => {
  it("waits for the context rather than rendering to an unknown caller", () => {
    mockContext({ status: "pending" });
    renderAt("/seller/team");

    expect(screen.queryByText("page content")).toBeNull();
  });

  it("redirects a resolved non-admin", async () => {
    mockContext({ status: "ready", permissions: ["orders.process"] });
    renderAt("/seller/team");

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/seller/dashboard"),
    );
  });

  it("renders for an admin", () => {
    mockContext({ status: "ready", permissions: [], isAdmin: true });
    renderAt("/seller/team");

    expect(screen.getByText("page content")).toBeTruthy();
  });
});

/**
 * Seller verification, layered under the permission gating above.
 *
 * A seller owns their organization outright — `resolveOrgContext` hands them
 * `isAdmin: true` and every feature the moment their `Sellers` row exists — so
 * none of the permission checks above can hold back an unverified one. This is
 * what does.
 */
describe("unverified sellers", () => {
  // An unverified seller is an org admin holding every feature, which is
  // precisely why the permission gating cannot see them.
  const mockPendingOwner = () =>
    mockContext({
      status: "ready",
      permissions: ["products.view", "orders.process"],
      isAdmin: true,
      sellerStatus: "PENDING",
    });

  it("redirects a pending seller off a seller page", async () => {
    mockPendingOwner();
    renderAt("/seller/products");

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/seller/pending"),
    );
  });

  it("redirects a pending seller off the dashboard, which needs no permission", async () => {
    mockPendingOwner();
    renderAt("/seller/dashboard");

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/seller/pending"),
    );
  });

  it("does not render the requested page while redirecting", () => {
    // Rendering for a frame would flash the very section being withheld.
    mockPendingOwner();
    renderAt("/seller/products");

    expect(screen.queryByText("page content")).toBeNull();
  });

  it("renders the review page itself rather than looping", () => {
    mockPendingOwner();
    renderAt("/seller/pending");

    expect(screen.getByText("page content")).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it("sends an approved seller off the review page", async () => {
    // The other direction: once approved, the seller is holding a page that no
    // longer describes their account.
    mockContext({
      status: "ready",
      permissions: [],
      isAdmin: true,
      sellerStatus: "APPROVED",
    });
    renderAt("/seller/pending");

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/seller/manage-stores"),
    );
  });

  it("leaves org staff alone, who carry no seller status at all", async () => {
    // The regression guard. Staff hold no `Sellers` row, so `sellerStatus` is
    // null forever — reading that as "unverified" would lock every hired member
    // of an approved organization onto the review page.
    mockContext({
      status: "ready",
      permissions: ["products.view"],
      sellerStatus: null,
    });
    renderAt("/seller/products");

    expect(screen.getByText("page content")).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it("does not act on an unresolved context", () => {
    // An unknown answer is not a yes, but it is not a no either — bouncing an
    // approved seller to the review screen over a network blip would be a bug
    // of its own.
    mockContext({ status: "error" });
    renderAt("/seller/dashboard");

    expect(replace).not.toHaveBeenCalled();
  });
});
