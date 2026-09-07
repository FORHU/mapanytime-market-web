import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OnboardingLayout from "../layout";
import { useOrgContext } from "@/features/team";
import { useAuthStore } from "@/features/auth/stores/auth.store";

/**
 * The direct-URL guard on the create-your-first-store flow.
 *
 * It keyed on `isAdmin === false`, which is not "is staff": a SELLER_ADMIN the
 * owner hired reads `isAdmin: true`, so the guard waved through exactly the
 * account it was written to keep out. Ownership is the right test — completing
 * onboarding would set a staff member up as an independent competitor to the
 * organization that hired them.
 *
 * The server is still the real boundary (`POST /stores` 403s without a Sellers
 * row); this only spares staff the walk.
 */

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));
vi.mock("@/features/team", () => ({ useOrgContext: vi.fn() }));
vi.mock("@/features/auth/stores/auth.store", () => ({ useAuthStore: vi.fn() }));

const refetch = vi.fn();

/** Only the fields the layout reads, plus the query state it now respects. */
function mockOrgContext(
  data: { isAdmin: boolean; isOwner: boolean } | undefined,
  state: { isPending?: boolean; isError?: boolean } = {},
) {
  vi.mocked(useOrgContext).mockReturnValue({
    data,
    isPending: state.isPending ?? data === undefined,
    isError: state.isError ?? false,
    refetch,
  } as unknown as ReturnType<typeof useOrgContext>);
}

/** The layout reads the store through a selector, so stub just the token. */
function mockToken(token: string | null) {
  vi.mocked(useAuthStore).mockImplementation(((
    selector: (state: { token: string | null }) => unknown,
  ) => selector({ token })) as unknown as typeof useAuthStore);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockToken("a-token");
});

describe("OnboardingLayout access", () => {
  it("bounces a hired admin out of onboarding", async () => {
    // The bug: isAdmin true, isOwner false. The old check let this through.
    mockOrgContext({ isAdmin: true, isOwner: false });

    render(
      <OnboardingLayout>
        <p>onboarding wizard</p>
      </OnboardingLayout>,
    );

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/seller/manage-stores"),
    );
    expect(screen.queryByText("onboarding wizard")).toBeNull();
  });

  it("bounces a scoped member out of onboarding", async () => {
    mockOrgContext({ isAdmin: false, isOwner: false });

    render(
      <OnboardingLayout>
        <p>onboarding wizard</p>
      </OnboardingLayout>,
    );

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/seller/manage-stores"),
    );
  });

  it("lets the organization owner through", async () => {
    // The regression guard: a brand-new merchant must still be able to onboard.
    mockOrgContext({ isAdmin: true, isOwner: true });

    render(
      <OnboardingLayout>
        <p>onboarding wizard</p>
      </OnboardingLayout>,
    );

    await waitFor(() =>
      expect(screen.getByText("onboarding wizard")).toBeTruthy(),
    );
    expect(replace).not.toHaveBeenCalledWith("/seller/manage-stores");
  });

  it("redirects to login when there is no session", async () => {
    mockOrgContext(undefined, { isPending: true });
    mockToken(null);

    render(
      <OnboardingLayout>
        <p>onboarding wizard</p>
      </OnboardingLayout>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("onboarding wizard")).toBeNull();
  });

  it("renders no wizard while the context is still loading", () => {
    // The defect this replaces: the guard read `undefined` as "not staff", so
    // the wizard rendered for the length of the request. Unknown is not
    // permission — and an owner must not be bounced mid-load either.
    mockOrgContext(undefined, { isPending: true });

    render(
      <OnboardingLayout>
        <p>onboarding wizard</p>
      </OnboardingLayout>,
    );

    expect(screen.queryByText("onboarding wizard")).toBeNull();
    expect(replace).not.toHaveBeenCalledWith("/seller/manage-stores");
  });

  it("shows a retry instead of the wizard when the context fails to load", async () => {
    // Previously permanent: a failed request left `data` undefined forever, so
    // staff sat in the wizard. Reporting it beats guessing in either direction.
    mockOrgContext(undefined, { isPending: false, isError: true });

    render(
      <OnboardingLayout>
        <p>onboarding wizard</p>
      </OnboardingLayout>,
    );

    expect(screen.queryByText("onboarding wizard")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it("does not redirect an owner away over a failed request", () => {
    mockOrgContext(undefined, { isPending: false, isError: true });

    render(
      <OnboardingLayout>
        <p>onboarding wizard</p>
      </OnboardingLayout>,
    );

    expect(replace).not.toHaveBeenCalledWith("/seller/manage-stores");
  });
});
