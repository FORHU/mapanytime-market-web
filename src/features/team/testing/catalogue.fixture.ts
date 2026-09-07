import type { SellerCatalogue } from "../contracts/team.contract";

/**
 * A stand-in for what `GET /seller/org/context` serves.
 *
 * Mirrors the API's `buildSellerCatalogue()` output at the time of writing, but
 * it is a fixture, not a contract: the point of moving the catalogue server-side
 * is that the web has no authoritative copy. Tests that care about a specific
 * vocabulary should build their own rather than widening this one.
 */
export const CATALOGUE: SellerCatalogue = {
  features: [
    { code: "orders.process", label: "Process orders" },
    { code: "products.view", label: "View products & stock" },
    { code: "products.edit", label: "Edit products & stock" },
    { code: "promotions.add", label: "Promotions & ads" },
  ],
  roles: [
    { name: "SELLER_ADMIN", label: "Admin", isAdmin: true },
    { name: "SELLER_MANAGER", label: "Manager", isAdmin: false },
    { name: "SELLER_MEMBER", label: "Member", isAdmin: false },
  ],
  defaultsByRole: {
    SELLER_ADMIN: [],
    SELLER_MANAGER: [
      "orders.process",
      "products.view",
      "products.edit",
      "promotions.add",
    ],
    SELLER_MEMBER: ["orders.process", "products.view"],
  },
};
