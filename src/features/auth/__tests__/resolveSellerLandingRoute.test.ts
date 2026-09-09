import { describe, it, expect } from "vitest";
import { resolveSellerLandingRoute } from "../utils/resolveHomeRoute";

/**
 * Where a seller lands after signing in.
 *
 * The split that matters is ownership: onboarding builds a merchant's *own*
 * store, so only an owner can be sent there. Staff — a membership without a
 * `Sellers` row — can never finish it, because `POST /stores` answers
 * `403 User is not registered as a seller.`
 */
describe("resolveSellerLandingRoute", () => {
  it("sends an admin staff member to the org stores, not onboarding", () => {
    // The reported bug. A SELLER_ADMIN the owner hired reads `isAdmin: true`
    // with `assignedStoreIds: null`, so the old "scoped member" test (not an
    // admin, and holding assignments) missed them on both clauses and dropped
    // them into onboarding they could never complete.
    expect(
      resolveSellerLandingRoute({
        hasStores: false,
        seller: null,
        orgContext: { isAdmin: true, isOwner: false, assignedStoreIds: null },
      }),
    ).toBe("/seller/manage-stores");
  });

  it("sends org staff to their stores even though they own none", () => {
    // `hasStores` is false for staff because the stores belong to the owner.
    expect(
      resolveSellerLandingRoute({
        hasStores: false,
        seller: null,
        orgContext: {
          isAdmin: false,
          isOwner: false,
          assignedStoreIds: ["store-a", "store-b"],
        },
      }),
    ).toBe("/seller/manage-stores");
  });

  it("sends a staff member with no assigned stores to their stores too", () => {
    // Previously onboarding, on the reasoning that an empty assignment means
    // "no store yet". Same root cause as the admin-staff case: onboarding is
    // not a thing any staff member can do, so an empty assignment is a reason
    // to show them an empty store list, not to offer them a merchant signup.
    expect(
      resolveSellerLandingRoute({
        hasStores: false,
        seller: null,
        orgContext: { isAdmin: false, isOwner: false, assignedStoreIds: [] },
      }),
    ).toBe("/seller/manage-stores");
  });

  it("keeps a brand-new owner in onboarding despite having an organization", () => {
    // The regression guard for the fix. Registration creates an organization
    // for every new seller, so membership alone cannot stand in for having a
    // store — an owner with nothing in it still has to build their first one.
    expect(
      resolveSellerLandingRoute({
        hasStores: false,
        seller: { isOnboarded: false },
        orgContext: { isAdmin: true, isOwner: true, assignedStoreIds: null },
      }),
    ).toBe("/seller/onboarding");
  });

  it("sends an owner with stores to their stores", () => {
    expect(
      resolveSellerLandingRoute({
        hasStores: true,
        seller: { isOnboarded: true },
        orgContext: { isAdmin: true, isOwner: true, assignedStoreIds: null },
      }),
    ).toBe("/seller/manage-stores");
  });

  it("trusts isOwner over the presence of a seller row", () => {
    // Ownership is the server's answer, not something inferred from which
    // fields happen to be on the payload. A seller row that does not belong to
    // the resolved organization — a merchant working as staff elsewhere — must
    // not read as ownership of that organization.
    expect(
      resolveSellerLandingRoute({
        hasStores: true,
        seller: { isOnboarded: true },
        orgContext: {
          isAdmin: false,
          isOwner: false,
          assignedStoreIds: ["store-a"],
        },
      }),
    ).toBe("/seller/manage-stores");
  });

  it("sends an unverified owner to the review page, not onboarding", () => {
    // Onboarding *is* the create-your-first-store wizard, and `POST /stores`
    // refuses an unapproved seller — so the old destination walked them through
    // a whole form to a 403 at the last step.
    expect(
      resolveSellerLandingRoute({
        hasStores: false,
        seller: { isOnboarded: false, applicationStatus: "PENDING" },
        orgContext: { isAdmin: true, isOwner: true, assignedStoreIds: null },
      }),
    ).toBe("/seller/pending");
  });

  it("keeps a rejected seller out of onboarding as well", () => {
    expect(
      resolveSellerLandingRoute({
        hasStores: false,
        seller: { isOnboarded: false, applicationStatus: "REJECTED" },
        orgContext: { isAdmin: true, isOwner: true, assignedStoreIds: null },
      }),
    ).toBe("/seller/pending");
  });

  it("does not divert staff, who have no application of their own", () => {
    // The regression this guards: staff carry no `applicationStatus`, and
    // treating that absence as "unverified" would show the review screen to
    // every hired member of an approved organization.
    expect(
      resolveSellerLandingRoute({
        hasStores: false,
        seller: null,
        orgContext: {
          isAdmin: false,
          isOwner: false,
          assignedStoreIds: ["store-a"],
        },
      }),
    ).toBe("/seller/manage-stores");
  });

  it("leaves an approved owner's routing untouched", () => {
    expect(
      resolveSellerLandingRoute({
        hasStores: false,
        seller: { isOnboarded: false, applicationStatus: "APPROVED" },
        orgContext: { isAdmin: true, isOwner: true, assignedStoreIds: null },
      }),
    ).toBe("/seller/onboarding");
  });

  it("falls back to ownership when there is no org context at all", () => {
    // Pre-organization sellers, and anyone whose backfill never ran.
    expect(
      resolveSellerLandingRoute({
        hasStores: true,
        seller: { isOnboarded: true },
        orgContext: null,
      }),
    ).toBe("/seller/manage-stores");

    expect(resolveSellerLandingRoute({ hasStores: false, seller: null })).toBe(
      "/seller/onboarding",
    );
  });
});
