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
    | { status: "ready"; permissions: string[]; isAdmin?: boolean },
) {
  vi.mocked(useOrgContext).mockReturnValue({
    data:
      state.status === "ready"
        ? { permissions: state.permissions, isAdmin: state.isAdmin ?? false }
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
