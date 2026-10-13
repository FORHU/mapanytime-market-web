import { describe, expect, it } from "vitest";
import {
  defaultPermissionsForRole,
  featureCodes,
  hasFeature,
  isAdminRole,
  sanitizePermissions,
  togglePermission,
  unknownPermissions,
} from "../team.permissions";
import { CATALOGUE } from "@/features/team/testing/catalogue.fixture";
import type { SellerCatalogue } from "@/features/team/contracts/team.contract";

/**
 * These helpers used to read module constants that mirrored the API by hand.
 * They now take the server's catalogue, so every case here injects one — which
 * is also what lets the drift cases below be written at all.
 */
describe("defaultPermissionsForRole", () => {
  it("gives a Manager every feature", () => {
    expect(defaultPermissionsForRole("SELLER_MANAGER", CATALOGUE)).toEqual(
      featureCodes(CATALOGUE),
    );
  });

  it("gives a Member order processing and read-only catalog", () => {
    expect(defaultPermissionsForRole("SELLER_MEMBER", CATALOGUE)).toEqual([
      "orders.process",
      "products.view",
    ]);
  });

  it("gives an Admin an empty list, since admin access is implicit", () => {
    expect(defaultPermissionsForRole("SELLER_ADMIN", CATALOGUE)).toEqual([]);
  });

  it("returns empty for a role the catalogue does not define", () => {
    expect(defaultPermissionsForRole("SELLER_GHOST", CATALOGUE)).toEqual([]);
  });

  it("returns a fresh array so the caller cannot mutate the catalogue", () => {
    defaultPermissionsForRole("SELLER_MANAGER", CATALOGUE).pop();

    expect(defaultPermissionsForRole("SELLER_MANAGER", CATALOGUE)).toEqual(
      featureCodes(CATALOGUE),
    );
  });
});

describe("isAdminRole", () => {
  it("reads admin-ness off the catalogue rather than the role name", () => {
    expect(isAdminRole("SELLER_ADMIN", CATALOGUE)).toBe(true);
    expect(isAdminRole("SELLER_MANAGER", CATALOGUE)).toBe(false);
  });

  it("treats an unknown role as non-admin", () => {
    // Failing open here would hide the feature grid and submit an empty list.
    expect(isAdminRole("SELLER_GHOST", CATALOGUE)).toBe(false);
  });
});

describe("togglePermission", () => {
  it("adds a missing code", () => {
    expect(
      togglePermission(["orders.process"], "promotions.add", CATALOGUE),
    ).toEqual(["orders.process", "promotions.add"]);
  });

  it("removes a present code", () => {
    expect(
      togglePermission(
        ["orders.process", "promotions.add"],
        "orders.process",
        CATALOGUE,
      ),
    ).toEqual(["promotions.add"]);
  });

  it("keeps catalogue order regardless of insertion order", () => {
    // Otherwise the submitted list reshuffles as the admin clicks around.
    expect(
      togglePermission(["promotions.add"], "orders.process", CATALOGUE),
    ).toEqual(["orders.process", "promotions.add"]);
  });

  it("can empty the list completely", () => {
    // "No features" must stay reachable — the API honours an explicit [].
    expect(
      togglePermission(["orders.process"], "orders.process", CATALOGUE),
    ).toEqual([]);
  });

  it("does not duplicate an already-present code", () => {
    expect(
      togglePermission(
        ["orders.process", "orders.process"],
        "promotions.add",
        CATALOGUE,
      ),
    ).toEqual(["orders.process", "promotions.add"]);
  });
});

describe("sanitizePermissions", () => {
  it("keeps only what the catalogue defines, in catalogue order", () => {
    expect(
      sanitizePermissions(
        ["promotions.add", "sales_review", "orders.process"],
        CATALOGUE,
      ),
    ).toEqual(["orders.process", "promotions.add"]);
  });

  it("returns empty for an empty list", () => {
    expect(sanitizePermissions([], CATALOGUE)).toEqual([]);
  });

  it("returns empty against an empty catalogue rather than echoing the input", () => {
    // What the team page sees against an API that predates the catalogue: no
    // checkboxes to tick, and — critically — nothing submitted either, because
    // the modal only sends permissions the admin actually touched.
    const empty: SellerCatalogue = {
      features: [],
      roles: [],
      defaultsByRole: {},
    };
    expect(sanitizePermissions(["orders.process"], empty)).toEqual([]);
  });
});

describe("unknownPermissions", () => {
  it("names the stored codes the catalogue no longer defines", () => {
    // These cannot be rendered as checkboxes and cannot be sent back — the API
    // rejects codes outside its catalogue with a 400 — so the modal says so
    // instead of dropping them silently.
    expect(
      unknownPermissions(
        ["orders.process", "sales_review", "customer_review"],
        CATALOGUE,
      ),
    ).toEqual(["sales_review", "customer_review"]);
  });

  it("is empty when every stored code is current", () => {
    expect(
      unknownPermissions(["orders.process", "products.view"], CATALOGUE),
    ).toEqual([]);
  });
});

describe("hasFeature", () => {
  it("admits an admin regardless of their stored list", () => {
    expect(hasFeature([], "promotions.add", true)).toBe(true);
  });

  it("admits a member holding the code", () => {
    expect(hasFeature(["orders.process"], "orders.process")).toBe(true);
  });

  it("refuses a member without it", () => {
    expect(hasFeature(["orders.process"], "promotions.add")).toBe(false);
  });

  it("distinguishes the two catalog codes", () => {
    // products.view opens the page; products.edit is a separate grant, so
    // read-only staff must not pass an edit check.
    expect(hasFeature(["products.view"], "products.edit")).toBe(false);
  });

  it("refuses when permissions have not loaded yet", () => {
    expect(hasFeature(undefined, "orders.process")).toBe(false);
  });
});
